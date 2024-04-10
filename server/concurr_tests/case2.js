// Case #2: At least one transaction in the three nodes is writing (update / delete) 
// and the other concurrent transactions are reading the same data item.

const {setIsolationLevel, makeTransactionWithSleep, selectAppt} = require('../utils/db');
const {connectNode} = require('../utils/nodes.js');

async function case2(id){
    console.log("Case 2: ");

    const node1 = await connectNode(1);
    const node2 = await connectNode(2);

    let isolationLevel;
    let newStatus;

    for (let i = 0; i < 4; i++){
        if (isolationLevel == 0)
        {
            isolationLevel = "REPEATABLE READ";
            newStatus = 'Complete - Replaced';
        }
        else if (isolationLevel == 1){
            isolationLevel = "READ UNCOMMITTED";
            newStatus = 'Queued - Replaced';
        }
        else if (isolationLevel == 2){
            isolationLevel ="READ COMMITTED";
            newStatus = 'Serving - Replaced';
        }
        else if (isolationLevel == 3){
            isolationLevel ="SERIALIZABLE";
            newStatus = 'Cancel - Replaced';
        }

        await console.log(isolationLevel + ": ");
        await updateAndSelectCase(id, node1, node2, isolationLevel, newStatus);
    }
    node1.release();
    node2.release();
}

async function updateAndSelectCase(id, node1, node2, isolationLevel, newStatus){
    // update 2
    // select 1
    await setIsolationLevel(node1, isolationLevel);
    await setIsolationLevel(node2, isolationLevel);

    const updateQuery = "UPDATE appointments SET status = " + newStatus + " WHERE apptid = " + id;
   
    const beforeUpdate = await selectAppt(node1, id);
    console.log("Before update of transaction in Node 2: " + beforeUpdate[0][0]);
    
   
   /* const selectPromise = new Promise<void>(async (resolve)=>{
        // three seconds
        setTimeout(async()=>{
            selectAppt(node1, id);
        }, 3000
    })*/

    const results = await Promise.all([
        makeTransactionWithSleep(node2, 2, updateQuery, id),
        selectAppt(node1, id)
       
    ]);
    
    console.log("After selecting from Node 1: " +  results[1][0]);

}