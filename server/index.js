require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors");
const PORT = process.env.PORT;
const {connectNode} = require('./utils/nodes.js');
const {performTransaction} = require('./utils/transactions.js');
const {syncCentralNode} = require('./sync.js');

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
   /*
    INPUTS:
    UPDATE appointments SET pxid = '6D887B136093311CC26296328A78A1D0', clinicid = '7522A10DDF6916ABCCF0163B58CA0543', regionname = 'National Capital Region (NCR)', status = 'Serving', timequeued = '2018-02-27 08:00:00', queuedate = '2018-02-27', starttime = '2018-02-27 17:00:00', endtime = NULL WHERE apptid = 'FE4563240085ACD2BFE3B16BDCE2C181';
    DELETE FROM appointments WHERE apptid = 'FE4563240085ACD2BFE3B16BDCE2C181';
    SELECT * FROM appointments WHERE apptid = 'FE4563240085ACD2BFE3B16BDCE2C181';
   */
   const nodeNum = parseInt(req.body.node);
   const node = await connectNode(nodeNum);
   
   let id; 
   
   if (node) {
    const queryType = req.body.query.substring(0,6);
    
    try {
     if (queryType === "UPDATE") {
         const updateStatement = req.body.query;
         const pxid = updateStatement.match(/SET pxid = '([^']+)'/)[1];
         const clinicid = updateStatement.match(/clinicid = '([^']+)'/)[1];
         const regionname = updateStatement.match(/regionname = '([^']+)'/)[1];
         const status = updateStatement.match(/status = '([^']+)'/)[1];
         const timequeued = new Date(updateStatement.match(/timequeued = '([^']+)'/)[1]);
         const queuedate = new Date(updateStatement.match(/queuedate = '([^']+)'/)[1]);
         const starttime = new Date(updateStatement.match(/starttime = '([^']+)'/)[1]);
         const endtime = new Date(updateStatement.match(/endtime\s*=\s*(NULL|'[^']+')/)[1]);
         const apptid = updateStatement.match(/WHERE apptid = '([^']+)'/)[1];
         id = apptid;

         const query = {
            statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
            value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
            type: queryType,
        }

        const result = await performTransaction(query, apptid);

         if (result.affectedRows > 0) {
            console.log("Dev Options: Update Success");
        } else {
            console.log("Dev Options: Update Error");
        }
     } else if (queryType === "DELETE") {
        const deleteStatement = req.body.query;
        console.log(deleteStatement)
        const apptid = deleteStatement.match(/apptid\s*=\s*'([^']+)'/)[1];
        id =apptid;

        const query = {
            statement: "DELETE FROM appointments WHERE apptid = ?",
            value: [apptid],
            type: "queryType",
        };  

        const result = await performTransaction(query, apptid);
         if (result.affectedRows > 0) {
            console.log("Dev Options: Delete Success");
        } else {
            console.log("Dev Options: Delete Error");
        }
     }

     //display row that is being queried
     let selectQuery;
     if (queryType === "SELECT") {
        selectQuery = req.body.query;
     } else {
        selectQuery = `SELECT * FROM appointments WHERE apptid = '${id}';`;
     }

     const data = await searchQuery(nodeNum, selectQuery);
 
     if (data) {
         res.send(data); 
     } else {
         res.status(404).json({message: 'No records found.'});
     }
    } catch (error) {
     res.status(500).json({ message: "Error fetching data." }); 
    }
   }
 
})

app.post("/api/insert", async (req, res) => {
    try {
        const apptid = req.body.apptid;
        const pxid = req.body.pxid;
        const clinicid = req.body.clinicid;
        const regionname = req.body.regionname;
        const status = req.body.status;
        const type = req.body.type;
        const timequeued = new Date(req.body.timequeued)
        const queuedate = new Date(req.body.queuedate)
        const starttime = new Date(req.body.starttime)
        const endtime = new Date(req.body.endtime)
        const query = {
            statement: "INSERT appointments SET VALUES(apptid = ?, pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ?, type=?)",
            value: [apptid, pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type],
            type: "INSERT",
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
