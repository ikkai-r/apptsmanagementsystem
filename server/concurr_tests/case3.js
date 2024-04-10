// Case #3: Concurrent transactions in two or more nodes are writing (update / delete) the same data item.

const {setIsolationLevel, makeTransactionWithSleep, selectAppt} = require('../utils/db');
const {connectNode} = require('../utils/nodes.js');

async function case3(id){
    console.log("Case 3: ");

    const node1 = await connectNode(1);
    const node3 = await connectNode(3);

    let isolationLevel;
    let newStatus1;
    let newStatus2;
    for (let i = 0; i < 4; i++){
        if (isolationLevel == 0)
        {
            isolationLevel = "REPEATABLE READ";
            newStatus1 = 'Complete - Node 1';
            newStatus2 = 'Queued - Node 2';
        }
        else if (isolationLevel == 1){
            isolationLevel = "READ UNCOMMITTED";
            newStatus1 = 'Queued - Node 1';
            newStatus1 = 'Serving - Node 2';
        }
        else if (isolationLevel == 2){
            isolationLevel ="READ COMMITTED";
            newStatus1 = 'Serving - Node 1';
            newStatus1 = 'Complete - Node 2';
        }
        else if (isolationLevel == 3){
            isolationLevel ="SERIALIZABLE";
            newStatus1 = 'Cancel - Node 1';
            newStatus2 = 'Skip - Node 2';
        }
        console.log(isolationLevel + ": ")
        await update2Case(id, node1, node3, isolationLevel, newStatus1, newStatus2);
    }
    node1.release();
    node3.release();
}

async function update2Case(id, node1, node3, isolationLevel, newStatus1, newStatus2){
    // update 2
    // select 1
    await setIsolationLevel(node1, isolationLevel);
    await setIsolationLevel(node3, isolationLevel);

    const updateQuery1 = "UPDATE appointments SET status = " + newStatus1 + " WHERE apptid = " + id;
    const updateQuery2 = "UPDATE appointments SET status = " + newStatus2 + " WHERE apptid = " + id;
   
    const beforeUpdate = await selectAppt(node1, id);
    console.log("Before update: " + beforeUpdate[0][0]);
    
   
   /* const selectPromise = new Promise<void>(async (resolve)=>{
        // three seconds
        setTimeout(async()=>{
            selectAppt(node1, id);
        }, 3000
    })*/

    await Promise.all([
        makeTransactionWithSleep(node1, 2, updateQuery1, id),
        makeTransactionWithSleep(node3, 2, updateQuery2, id),
       
    ]);

    const readResults = await Promise.all([
        selectAppt(node1, id),
        selectAppt(node3, id)
    ])

    console.log("Node 1: " + readResults[0][0]);
    console.log("Node 3: " + readResults[1][0]);

}