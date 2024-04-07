const express = require('express');
const app = express();
const cors = require("cors");
const PORT = 5000;
const {queryNode} = require('./nodes');

// Create a MySQL connection pool
// const pool = mysql.createPool({
//     host: 'ccscloud.dlsu.edu.ph',
//     port: '20153',
//     user: 'user1',
//     password: 'n0dE#001',
//     database: 'medical_appts'
// }).promise();


const fetchData = async (node, query) => {
    try {
        console.log("database connected!")
        const [rows] = await  queryNode(node, query, null)
        if (rows.length === 0) {
            console.log("No records found.");
            return null;
        } else {
            //console.log("Fetched data:", rows);
            return rows;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        console.error("Error executing query:", error.sqlMessage);
        console.error("Failed SQL query:", error.sql);
        console.error("Error stack:", error.stack);
        throw error;
    }
};

app.use(express.json());
app.use(cors());

app.get("/api/view", async (req, res) => {
    try {
        const data = await fetchData("1", "SELECT * FROM appointments LIMIT 15;");
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
    console.log(req.body.node)
    console.log(req.body.query)
   try {
    const data = await fetchData(req.body.node, req.body.query);
    if (data) {
        res.send(data[0]); 
    } else {
        res.json({message: 'No records found.'});
    }
   } catch (error) {
    res.status(500).json({ message: "Error fetching data." }); 
   }
})

app.post("/api/update", async (req, res) => {
    try {
        console.log(req.body)
        const apptid = req.body.apptid;
        const pxid = req.body.pxid;
        const clinicid = req.body.clinicid;
        const regionname = req.body.regionname;
        const status = req.body.status;
        const timequeued = new Date(req.body.timequeued)
        const queuedate = new Date(req.body.queuedate)
        const starttime = new Date(req.body.starttime)
        const endtime = new Date(req.body.endtime)
      

        const [result] = await queryNode("1", 
        "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
        [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid]
        );

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

        await pool.query(
            "DELETE FROM appointments WHERE apptid = ?",
            [apptid]
        );

        res.status(200).json({ message: "Data deleted successfully." });

    } catch (error) {
        console.error("Error deleting data:", error);
        res.status(500).json({ message: "Error deleting data." });
    }
});


app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
