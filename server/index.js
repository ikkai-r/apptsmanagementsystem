require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT;
const { connectNode } = require("./utils/nodes.js");
const {
  performTransaction,
  performTransactionTest,
} = require("./utils/transactions.js");
const { replicateData } = require("./replication.js");

const fetchData = async (query) => {
  try {
    console.log("Connecting to central node and nodes 2 and 3...");

    const centralNodeConnection = await connectNode(1);
    const Node2Connection = await connectNode(2);
    const Node3Connection = await connectNode(3);

    // Check if central node connection succeeded
    if (centralNodeConnection) {
      try {
        console.log("connected to central node");
        const [rows] = await centralNodeConnection.query(query);
        if (rows.length === 0) {
          console.log("No records found.");
          return null;
        } else {
          console.log("queried to central node!");
          return rows;
        }
      } catch (err) {
        console.error("Failed to query central node:", err);
      } finally {
        centralNodeConnection.release();
      }
    } else {
      console.log("Failed to connect to central node, trying nodes 2 and 3...");

      try {
        let node2rows = null;
        let node3rows = null;

        if (Node2Connection) {
          const result = await Node2Connection.query(query);
          console.log("queried to node 2!");
          node2rows = result ? result[0] : null;
        }

        if (Node3Connection) {
          const result = await Node3Connection.query(query);
          console.log("queried to node 3!");
          node3rows = result ? result[0] : null;
        }

        const combinedRows = [...(node2rows || []), ...(node3rows || [])].sort(
          (a, b) => {
            return b.apptid - a.apptid;
          }
        );

        const rows = combinedRows.slice(0, 15);

        console.log("connected to node 2 and node 3");
        if (rows.length === 0) {
          console.log("No records found.");
          return null;
        } else {
          return rows;
        }
      } catch (err) {
        console.error("Failed to query to slave nodes:", err);
      } finally {
        if (Node2Connection) {
          Node2Connection.release();
        }

        if (Node3Connection) {
          Node3Connection.release();
        }
      }
    }
  } catch (err) {
    console.error("Failed to connect to nodes:", err);
  }
};

app.use(express.json());
app.use(cors());

app.get("/api/view", async (req, res) => {
  try {
    const data = await fetchData(
      "SELECT * FROM appointments ORDER BY apptid DESC LIMIT 15;"
    );
    if (data) {
      res.send(data);
    } else {
      res.json({ message: "No records found." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error fetching data." });
  }
});

app.post("/api/submitDevOptions", async (req, res) => {
  /*
    UPDATE appointments SET pxid = 'FDD72B97684AAD92A95C07AD54A1CE16', clinicid = '7522A10DDF6916ABCCF0163B58CA0543', regionname = 'National Capital Region (NCR)', status = 'Skip', type = 'Consulation', WHERE apptid = 'F8EC68CF724828DD7EA19649C051D36A';
    */
  const centralNode = await connectNode(1);
  const nodeNum = parseInt(req.body.node);
  const node = await connectNode(nodeNum);
  let data;

  if (node) {
    const queryType = req.body.query.substring(0, 6);
    const statement = req.body.query;
    try {
      if (queryType === "UPDATE") {
        const appointment = {
          pxid: statement.match(/pxid = '([^']+)'/)[1],
          clinicid: statement.match(/clinicid = '([^']+)'/)[1],
          regionname: statement.match(/regionname = '([^']+)'/)[1],
          status: statement.match(/status = '([^']+)'/)[1],
          //pre-selected dates for ease
          timequeued: "08/18/2018 08:11 AM",
          queuedate: "08/18/2018 08:11 AM",
          starttime: "",
          endtime: "",
          type: statement.match(/type = '([^']+)'/)[1],
          apptid: statement.match(/apptid = '([^']+)'/)[1],
        };

        data = await performTransactionTest(appointment, "UPDATE", node, centralNode, nodeNum);
        if (data) {
          console.log("Dev Options: Update Success");
        } else {
          console.log("Dev Options: Update Error");
        }
      } else if (queryType === "DELETE") {
        const appointment = {
          apptid: statement.match(/apptid\s*=\s*'([^']+)'/)[1],
        };

        data = await performTransactionTest(appointment, "DELETE", node, centralNode, nodeNum);
        if (data) {
          console.log("Dev Options: Delete Success");
        } else {
          console.log("Dev Options: Delete Error");
        }
      } else if (queryType === "SELECT") {
        const appointment = {
          apptid: statement.match(/apptid\s*=\s*'([^']+)'/)[1],
        };
        data = await performTransactionTest(appointment, "SELECT", node, centralNode, nodeNum);
      }

      if (data) {
        res.send(data);
      } else {
        res.status(404).json({ message: "No records found." });
      }
    } catch (error) {
      res.status(500).json({ message: "Error performing query." });
    }
  }
});

app.post("/api/insert", async (req, res) => {
  try {
    const appointment = req.body;
    const result = await performTransaction(appointment, "INSERT");

    console.log(result);
    if (result) {
      console.log("Data inserted successfully");
      res.status(200).json({ message: "Data inserted successfully." });
    } else {
      res.status(404).json({ message: "Record not found." });
    }
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "Error inserting data." });
  }
});

app.post("/api/update", async (req, res) => {
  try {
    const appointment = req.body;
    const result = await performTransaction(appointment, "UPDATE");

    if (result) {
      console.log("Data updated successfully");
      res.status(200).json({ message: "Data updated successfully." });
    } else {
      res.status(404).json({ message: "Record not found." });
    }
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).json({ message: "Error updating data." });
  }
});

app.post("/api/delete", async (req, res) => {
  try {
    const appointment = req.body;
    const result = await performTransaction(appointment, "DELETE");

    if (result) {
      console.log("Data deleted successfully");
      res.status(200).json({ message: "Data deleted successfully." });
    } else {
      res.status(404).json({ message: "Record not found." });
    }
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({ message: "Error deleting data." });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  setInterval(() => {
    replicateData();
  }, 1000);
});
