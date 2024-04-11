const { connectNode } = require('./utils/nodes.js');
const { getLogsWithCondition, getLatestLog, selectAppt, getLogs } = require('./utils/db.js');
const { performLogTransaction, performTransactionLogUpdate, performTransactionFromLog} = require('./utils/transactions.js');

const syncFuncs = {
    syncCentralNode: async () => {
        try {
            const centralNodeConnection = await connectNode(1);

            if (centralNodeConnection) {
                //get the logs of 1 and 2

                const node2Connection = await connectNode(2);
                const node3Connection = await connectNode(3);
    
                let node2logs = [];
                let node3logs = [];
    
                if(node2Connection) {
                    node2logs = await getLogsWithCondition(2, ['commit = ? AND node = ?', 0, 1]);
                } else {
                    console.log('Node 2 is down');
                }

                if(node3Connection) {
                    node3logs = await getLogsWithCondition(3, ['commit = ? AND node = ?', 0, 1]);
                } else {
                    console.log('Node 3 is down');
                }
    
                // sort logs by date
                const allLogs = [...node2logs, ...node3logs];
                const sortedLogs = allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // sync logs to central node by applying it if existing
                if(sortedLogs && sortedLogs.length > 0) {
                    for (const log of sortedLogs) {
                        // for every log, perform transaction
                        console.log('log:', log);

                        const appointment = log.record;
                        const appointment_rec = JSON.parse(appointment);

                        const typeQuery = log.type;

                        await performTransactionFromLog(appointment_rec, typeQuery, centralNodeConnection);

                        await node2Connection.query (
                            'UPDATE logs SET commit = ? WHERE id = ?;',
                            [1, log.id]
                        );

                        await node3Connection.query (
                            'UPDATE logs SET commit = ? WHERE id = ?;',
                            [1, log.id]
                        );
    
                    }
                }

                if(node2Connection) {
                    node2Connection.release();
                }
    
                if(node3Connection) {
                    node3Connection.release();
                }
            
            centralNodeConnection.release();
            
         }

         return true;
            
        } catch (error) {
            console.error('Error occurred during synchronization in central node:', error);
        }
    },
    syncOtherNodes: async (node) => {

        try {
            const node1Connection = await connectNode(1);
            const nodeConnection = await connectNode(node);

            if(node1Connection && nodeConnection) {

                const masterNodeLogs = await getLogsWithCondition(1, ['commit = ? AND node = ?', 0, node]);
                                
                if (masterNodeLogs instanceof Error)
                    throw Error("Node " + node + " : Something went wrong in getting logs of Node 1.");
                
                    if (masterNodeLogs && masterNodeLogs.length > 0) {
                        for (const log of masterNodeLogs) {
                            // for every log, perform transaction

                            const appointment = log.record;
                            const appointment_rec = JSON.parse(appointment);
    
                            const typeQuery = log.type;
    
                            await performTransactionFromLog(appointment_rec, typeQuery, nodeConnection);
                            
                            console.log('got here');
                            await node1Connection.query (
                                'UPDATE logs SET commit = ? WHERE id = ?;',
                                [1, log.id]
                            );

                        }
                    }

                node1Connection.release();
                nodeConnection.release();
                return true;
            } else {
                console.log('Node 1 is down');
            }
             
        } catch(error) {
            console.log('Error occurred during synchronization in Node ' + node + ': ', error);
        }
        
    },
}

module.exports = syncFuncs;