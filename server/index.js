const express = require('express');
const app = express();
const cors = require("cors");
const PORT = 5000;
const mysql = require('mysql2');

// Create a MySQL connection pool
const pool = mysql.createPool({
    host: 'ccscloud.dlsu.edu.ph',
    port: '20153',
    user: 'user1',
    password: 'n0dE#001',
    database: 'medical_appts'
}).promise();


const fetchData = async () => {
    try {
        console.log("database connected!")
        const [rows] = await pool.query("SELECT * FROM appointments LIMIT 15;");
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
        const data = await fetchData();
        if (data) {
            res.send(data); 
        } else {
            res.json({message: 'No records found.'});
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
        const doctorid = req.body.doctorid;
        const status = req.body.status;
        const timequeued = new Date(req.body.timequeued)
        const queuedate = new Date(req.body.timequeued)
        const starttime = new Date(req.body.timequeued)
        const endtime = new Date(req.body.timequeued)

        const [result] = await pool.query(
            "UPDATE appointments SET pxid = ?, clinicid = ?, doctorid = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
            [pxid, clinicid, doctorid, status, timequeued, queuedate, starttime, endtime, apptid]
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

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})
