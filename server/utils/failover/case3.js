const {connectNode} = require("../nodes.js")
const {makeTransactionWithSleep, selectAppt} = require("../db.js")
const {replicateCentralNode} = require("../../replication.js");

// stop replicator (i assume it's already stopped)

const case3Fail = async(node1, node2) =>{
    try{   
        // insert record
        const apptid = "case3";
        const exists = await node2.query(`SELECT * FROM appointments WHERE apptid = '${apptid}';`);
        const pxid = "case3";
        const clinicid = "case3";
        const regionname = "Cagayan Valley (II)";
        const status = "case3";
        const type = "case3";
    
        const timequeued = new Date().toISOString().slice(0, 19).replace('T', ' ');
        

        if (exists[0].length === 0){
            const query = {
                type: "INSERT",
                statement: "INSERT INTO appointments (pxid, clinicid, regionname, timequeued, status, type, apptid) VALUES (?,?,?,?,?,?,?)",
                value: [pxid, clinicid, regionname, timequeued, status, type, apptid]
            }
            await makeTransactionWithSleep(node1, 1, query, 1, apptid);
            await makeTransactionWithSleep(node2, 2, query, 2, apptid);
        }
        // update
        const status2 = "Case3Consultation " + Math.random();
        
        const query2 = {
            statement: "UPDATE appointments SET status = ? WHERE apptid = ?;",
            type: "UPDATE",
            value: [ status2, apptid ]
        }
        const getStringify = await node2.query(`SELECT * FROM appointments WHERE apptid = '${apptid}';`);
        await node1.query(`INSERT INTO logs (type, record, node, node_from, commit) VALUES ('UPDATE', '${getStringify}',2,0);`);
    
        await replicateCentralNode();

    } catch(error){
        console.log(error);
    }
    

    

};

module.exports ={case3Fail};


