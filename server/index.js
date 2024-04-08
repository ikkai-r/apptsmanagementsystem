require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");
const PORT = process.env.PORT;
const {connectNode} = require('./nodes.js');
const {makeTransaction, setIsolationLevel} = require('./db.js');

const fetchData = async (query) => {
        const centralNodeConnection = await connectNode(1);
        if(centralNodeConnection) {
            //master is working
            try {
                const [rows] = await centralNodeConnection.query(query);
                    if (rows.length === 0) {
                        console.log("No records found.");
                        return null;
                    } else {
                        return rows;
                    }
              } catch (err) {
                console.error("Failed to query central node:", err);
              } finally {
                centralNodeConnection.release();
              }

        } else {
            // if master fails, build database from node2 and node3
            const Node2Connection = await connectNode(2);
            const Node3Connection = await connectNode(3);

            try {
                let node2rows = null;
                let node3rows = null;
            
                if (Node2Connection) {
                    const result = await Node2Connection.query(query);
                    node2rows = result ? result[0] : null;
                }
            
                if (Node3Connection) {
                    const result = await Node3Connection.query(query);
                    node3rows = result ? result[0] : null;
                }
            
                const combinedRows = [...(node2rows || []), ...(node3rows || [])].sort((a, b) => {
                    return b.apptid - a.apptid;
                });
            
                const rows = combinedRows.slice(0, 15);
            
                if (rows.length === 0) {
                    console.log("No records found.");
                    return null;
                } else {
                    return rows;
                }

            } catch (err) {
                console.error("Failed to query to slave nodes:", err);
              } finally {
                if(Node2Connection) {
                    Node2Connection.release();
                }

                if(Node3Connection) {
                    Node3Connection.release();
                }
              }
        }
};

const performTransaction = async (query, apptid) => {
    const centralNodeConnection = await connectNode(1);
    await setIsolationLevel(centralNodeConnection, "READ UNCOMMITTED");

    if (centralNodeConnection) {
        try {
            return await makeTransaction(centralNodeConnection, 1, query, apptid);
          } catch (err) {
            console.log(err);
          }

    } else {
        const Node2Connection = await connectNode(2);
        const Node3Connection = await connectNode(3);

        if (regionname === "Luzon") {
            try {
                await setIsolationLevel(Node2Connection, "READ UNCOMMITTED");
                return await makeTransaction(Node2Connection, 2, query, apptid);
            } catch(err) {
                console.log(err);
            }
        } else {
            try {
                await setIsolationLevel(Node3Connection, "READ UNCOMMITTED");
                return await makeTransaction(Node3Connection, 3, query, apptid);
            } catch(err) {
                console.log(err);
            }
        }   
    }
}

const searchQuery = async (node, query) => {
    const connectedNode = await connectNode(node);
    if(connectNode) {
        try {
            const [rows] = await connectedNode.query(query);
                if (rows.length === 0) {
                    console.log("No records found.");
                    return null;
                } else {
                    return rows[0];
                }
          } catch (err) {
            console.error("Failed to query node:", err);
          } finally {
            connectedNode.release();
          }
    } else {
        console.log("Node is down");
    }
}

app.use(express.json());
app.use(cors());

app.get("/api/view", async (req, res) => {
    try {
        const data = await fetchData("SELECT * FROM appointments ORDER BY apptid DESC LIMIT 15;");
        if (data) {
            res.send(data); 
        } else {
            res.json({message: 'No records found.'});
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching data." }); 
    }
})

app.post("/api/submitDevOptions", async (req, res) => {
   try {
    const data = await searchQuery(req.body.node, req.body.query);
    if (data) {
        res.send(data); 
    } else {
        res.status(404).json({message: 'No records found.'});
    }
   } catch (error) {
    res.status(500).json({ message: "Error fetching data." }); 
   }
})

app.post("/api/update", async (req, res) => {
    try {
        const apptid = req.body.apptid;
        const pxid = req.body.pxid;
        const clinicid = req.body.clinicid;
        const regionname = req.body.regionname;
        const status = req.body.status;
        const timequeued = new Date(req.body.timequeued)
        const queuedate = new Date(req.body.queuedate)
        const starttime = new Date(req.body.starttime)
        const endtime = new Date(req.body.endtime)
        const query = {
            statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
            value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
            type: "UPDATE",
        }

        const result = await performTransaction(query, apptid);
        
        if (result.affectedRows > 0) {
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
        const apptid = req.body.apptid;
        const query = {
            statement: "DELETE FROM appointments WHERE apptid = ?",
            value: [apptid],
            type: "DELETE",
        };
    
        const result = await performTransaction(query, apptid);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: "Data deleted successfully." });
        } else {
            res.status(404).json({ message: "Record not found." });
        }
    } catch(error) {
        console.error("Error deleting data:", error);
        res.status(500).json({ message: "Error deleting data." });
    }
});


app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
