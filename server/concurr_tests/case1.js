// Case #1: Concurrent transactions in two or more nodes are reading the same data item.

const {setIsolationLevel, selectAppt} = require('../utils/db');
const {connectNode} = require('../utils/nodes.js');

async function case1(id){
    console.log("Case 1: ");
    
    const node1 = await connectNode(1);
    const node2 = await connectNode(2);

    let isolationLevel;
    for (let i = 0; i < 4; i++){
        if (isolationLevel == 0)
            isolationLevel("REPEATABLE READ");
        else if (isolationLevel == 1)
            isolationLevel("READ UNCOMMITTED");
        else if (isolationLevel == 2)
            isolationLevel("READ COMMITTED");
        else if (isolationLevel == 3)
            isolationLevel("SERIALIZABLE");

        await console.log(isolationLevel + ": ");
        await select2AppointmentsCase(id, node1, node2, isolationLevel);
    }
}

// Node 1 and Node 2 SELECT statements

async function select2AppointmentsCase(id, node1, node2, isolationLevel){
    await setIsolationLevel(node1, isolationLevel);
    await setIsolationLevel(node2, isolationLevel);

    const results = await Promise.all([
        selectAppt(node1, id),
        selectAppt(node2, id),
    ]);
    
    console.log("Node 1: " + results[0][0]);
    console.log("Node 2: " + results[1][0]);

    }
