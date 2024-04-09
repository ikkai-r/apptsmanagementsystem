const {connectNode} = require('./nodes.js');
const {setIsolationLevel, makeTransactionWithSleep} = require('./db.js');
const luzon_regions = ['National Capital Region (NCR)', 'Ilocos Region (I)', 'Cagayan Valley (II)', 'Central Luzon (III)', 'CALABARZON (IV-A)', 'MIMAROPA (IV-B)', 'Cordillera Administrative Region (CAR)']

const transactionFunc =  {
    performTransaction: async (query, apptid) => {
    const centralNodeConnection = await connectNode(1);
    await setIsolationLevel(centralNodeConnection, "READ UNCOMMITTED");
  
    //master working
    if (centralNodeConnection) {
        try {
            const regionname = query.value[2];
            let nodeInvolved = 1;

            if(luzon_regions.includes(regionname)) {
                nodeInvolved = 2;
            } else {
                nodeInvolved = 3;
            }
            return await makeTransactionWithSleep(centralNodeConnection, nodeInvolved, query, apptid);
        } catch (err) {
            console.log(err);
        } finally {
            centralNodeConnection.release();
        }
  
    } else {
        //if not perform transaction in nodes 2 or 3
        const Node2Connection = await connectNode(2);
        const Node3Connection = await connectNode(3);
        
        if (luzon_regions.includes(regionname)) {
            try {
                await setIsolationLevel(Node2Connection, "READ UNCOMMITTED");
                return await makeTransactionWithSleep(Node2Connection, 2, query, apptid);
            } catch(err) {
                console.log(err);
            } finally {
                Node2Connection.release();
            }
        } else {
            try {
                await setIsolationLevel(Node3Connection, "READ UNCOMMITTED");
                return await makeTransactionWithSleep(Node3Connection, 3, query, apptid);
            } catch(err) {
                console.log(err);
            } finally {
                Node3Connection.release();
            }
        }   
    } 
  }, 

  performLogTransaction: async (node, query, apptid) => {
    const nodeConnection = await connectNode(node);
    await setIsolationLevel(nodeConnection, "READ UNCOMMITTED");

    if (nodeConnection) {
        try {
            return await makeTransactionWithSleep(nodeConnection, node, query, apptid);
        } catch (err) {
            console.log(err);
        } finally {
            nodeConnection.release();
        }
    } else {
        console.log('Node ' + node + 'is down');
    }

  }
}

module.exports = transactionFunc;
