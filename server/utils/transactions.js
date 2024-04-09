const {connectNode} = require('./nodes.js');
const {setIsolationLevel, makeTransactionWithSleep} = require('./db.js');

const transactionFunc =  {
    performTransaction: async (query, apptid) => {
    const centralNodeConnection = await connectNode(1);
    await setIsolationLevel(centralNodeConnection, "READ UNCOMMITTED");
  
    //master working
    if (centralNodeConnection) {
        try {
            return await makeTransactionWithSleep(centralNodeConnection, 1, query, apptid);
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
  } 
}

module.exports = transactionFunc;
