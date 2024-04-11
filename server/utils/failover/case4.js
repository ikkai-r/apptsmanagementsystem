const {connectNode} = require("../nodes.js")
const {makeTransactionWithSleep} = require("../db.js")
const {replicateOtherNodes} = require("../../replication.js");

// stop replicator (i assume it's already stopped)

async function case4Fail(node1, node3){
    // insert record
    try{
        const apptid = "case4";
        const exists = await node1.query(`SELECT * FROM appointments WHERE apptid = '${apptid}';`);
        const pxid = "case4";
        const clinicid = "case4";
        const regionname = "case4";
        const status = "Consultation";
        const type = "case4";
    
        const timequeued = new Date().toISOString().slice(0, 19).replace('T', ' ');

        if(exists[0].length === 0){
            const query = {
                type: "INSERT",
                statement: "INSERT INTO appointments (pxid, clinicid, regionname, timequeued, status, type, apptid) VALUES (?,?,?,?,?,?,?)",
                value: [pxid, clinicid, regionname, timequeued, status, type, apptid]
            }
            await makeTransactionWithSleep(node1, 1, query, 1, apptid);
            await makeTransactionWithSleep(node3, 3, query, 3, apptid);
        }
            // update
            const status2 = "Case4Consultation " + Math.random();
            const query2 = {
                statement: "UPDATE appointments SET status = ? WHERE apptid = ?;",
                type: "UPDATE",
                value: [ status2, apptid ]
            }
        // insert a log into central node that contains the update record, but commit = 0
        const getStringify = await node1.query(`SELECT * FROM appointments WHERE apptid = '${apptid}';`);
        await node3.query(`INSERT INTO logs (type, record, node, node_from, commit) VALUES ('UPDATE', '${getStringify}',1,3,0);`);

        await replicateOtherNodes();
       
    } catch(error){
        console.log(error);


    

    }
};


module.exports ={case4Fail};