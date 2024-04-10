const { connectNode } = require('./utils/nodes.js');
const { getLogsWithCondition, getLatestLog, selectAppt, getLogs } = require('./utils/db.js');
const { performLogTransaction, performTransactionLogUpdate } = require('./utils/transactions.js');

const syncFuncs = {
    syncCentralNode: async () => {
        try {
            const centralNodeConnection = await connectNode(1);

        if (centralNodeConnection) {

            // check self logs if there is commit = 0 (meaning transactions that were not completed / commit = 1)

            const [node1logs] = await getLogsWithCondition(1, ['commit = ?', 0]);

            if (node1logs && node1logs > 0) {
                //if there is commit = 0
                
                for (const log of node1logs) {
                    // for every log, perform transaction
                    const typeQuery = log.type;
    
                    //get record in json format
                     const appointment = log.record;
                     const appointment_rec = JSON.parse(appointment);
                     const apptid = appointment_rec[0].apptid;
                     const pxid = appointment_rec[0].pxid;
                     const clinicid = appointment_rec[0].clinicid;
                     const regionname = appointment_rec[0].regionname;
                     const type = appointment_rec[0].type;
                     const status = appointment_rec[0].status;
                     const timequeued = new Date(appointment_rec[0].timequeued)
                     const queuedate = new Date(appointment_rec[0].queuedate)
                     const starttime = new Date(appointment_rec[0].starttime)
                     const endtime = new Date(appointment_rec[0].endtime)

                    if(typeQuery === 'INSERT') {
                        
                        //check if the insert already exists, just incase it was already committed
                        // change node query part
                        exists = selectAppt(1, apptid);

                        // if record does not exist
                        if (exists.length === 0) {
                            // if it doesn't exist
                            const query = {
                                statement: "INSERT INTO appointments (pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid) VALUES (?,?,?,?,?,?,?,?,?,?,?);",
                                value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid],
                                type: "INSERT",
                            }

                            const result = await performTransactionLogUpdate(1, query, apptid);
                            if(result instanceof Error) {
                                console.log('Node 1 did not succeed in replicating');
                                return false;
                            } else {
                                const update_result = await centralNodeConnection.query (
                                    'UPDATE logs SET commit = ? WHERE id = ?;',
                                    [1, log.id]
                                );

                                if(update_result instanceof Error) {
                                    console.log('Node 1 did not succeed in replicating');
                                    return false;
                                } else {
                                    console.log('Node 1 succeeded in replicating');
                                }
                            }  
                        } else {
                            const update_result = await centralNodeConnection.query (
                                'UPDATE logs SET commit = ? WHERE id = ?;',
                                [1, log.id]
                            );

                            if(update_result instanceof Error) {
                                console.log('Node 1 did not succeed in replicating');
                                return false;
                            } else {
                                console.log('Node 1 succeeded in replicating');
                            }
                        }
                      

                    } else if (typeQuery === 'UPDATE') {

                        const query = {
                            statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
                            value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
                            type: "UPDATE",
                        }

                        const result = await performTransactionLogUpdate(1, query, apptid);
                            if(result instanceof Error) {
                                console.log('Node 1 did not succeed in replicating');
                                return false;
                            } else {
                                const update_result = await centralNodeConnection.query (
                                    'UPDATE logs SET commit = ? WHERE id = ?;',
                                    [1, log.id]
                                );

                                if(update_result instanceof Error) {
                                    console.log('Node 1 did not succeed in replicating');
                                    return false;
                                } else {
                                    console.log('Node 1 succeeded in replicating');
                                }
                            }

                    } else if (typeQuery === 'DELETE') {

                        //check if the record already exists, just incase it was already committed
                        exists = selectAppt(1, apptid);

                        // if record still exists
                        if (exists.length > 0){
                            const query = {
                                statement: "DELETE FROM appointments WHERE apptid = ?",
                                value: [apptid],
                                type: "queryType",
                            };  

                            const result = await performTransactionLogUpdate(1, query, apptid);
                            if(result instanceof Error) {
                                console.log('Node 1 did not succeed in replicating');
                                return false;
                            } else {
                                const update_result = await centralNodeConnection.query (
                                    'UPDATE logs SET commit = ? WHERE id = ?;',
                                    [1, log.id]
                                );

                                if(update_result instanceof Error) {
                                    console.log('Node 1 did not succeed in replicating');
                                    return false;
                                } else {
                                    console.log('Node 1 succeeded in replicating');
                                }
                            }
                        } else {
                            const update_result = await centralNodeConnection.query (
                                'UPDATE logs SET commit = ? WHERE id = ?;',
                                [1, log.id]
                            );

                            if(update_result instanceof Error) {
                                console.log('Node 1 did not succeed in replicating');
                                return false;
                            } else {
                                console.log('Node 1 succeeded in replicating');
                            }
                        }
                    }
                }
            }

            // get central node latest log
            const centralNodeLatestLog = await getLatestLog(1);

            // if thereis no logs

            const node2Connection = await connectNode(2);
            const node3Connection = await connectNode(3);
    
            let node2logs = [];
            let node3logs = [];

            let centralNodeTime = null;
    
            if(node2Connection) {

                if (centralNodeLatestLog.length === 0) {
                    node2logs = await getLogs(2);
                } else {
                    centralNodeTime = centralNodeLatestLog[0].timestamp;
                    // get node2 logs later than the date and those that are not from node 1
                    node2logs = await getLogsWithCondition(2, ['timestamp > ? AND commit = ? AND node_from != ?', centralNodeTime, 1, 1]);
                }
            } else {
                console.log('Node 2 is down');
            }
    
            if(node3Connection) {

                if (centralNodeLatestLog.length === 0) {
                    node3logs = await getLogs(3);
                } else {
                    centralNodeTime = centralNodeLatestLog[0].timestamp;

                    // get node3 logs later than the date and those that are not from node 1
                    node3logs = await getLogsWithCondition(3, ['timestamp > ? AND commit = ? AND node_from != ?', centralNodeTime, 1, 1]);
                }
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
    
                        const typeQuery = log.type;
        
                         //get record in json format
                         const appointment = log.record;
                         const appointment_rec = JSON.parse(appointment);
                         const apptid = appointment_rec[0].apptid;
                         const pxid = appointment_rec[0].pxid;
                         const clinicid = appointment_rec[0].clinicid;
                         const regionname = appointment_rec[0].regionname;
                         const type = appointment_rec[0].type;
                         const status = appointment_rec[0].status;
                         const timequeued = new Date(appointment_rec[0].timequeued)
                         const queuedate = new Date(appointment_rec[0].queuedate)
                         const starttime = new Date(appointment_rec[0].starttime)
                         const endtime = new Date(appointment_rec[0].endtime)
    
                        if(typeQuery === 'INSERT') {
                            
                            //check if the insert already exists, just incase it was already committed
                            // change node query part
                            exists = selectAppt(1, apptid);
    
                            // if record does not exist
                            if (exists.length === 0){
                                // if it doesn't exist
                                const query = {
                                    statement: "INSERT INTO appointments (pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid) VALUES (?,?,?,?,?,?,?,?,?,?,?);",
                                    value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid],
                                    type: "INSERT",
                                }
    
                                const result = await performLogTransaction(1, query, apptid);
                                if(result instanceof Error) {
                                    console.log('Node 1 did not succeed in replicating');
                                    return false;
                                } else {
                                    console.log('Node 1 succeeded in replicating');
                                }
                            }
                          
    
                        } else if (typeQuery === 'UPDATE') {
    
                            const query = {
                                statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
                                value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
                                type: "UPDATE",
                            }
    
                            const result = await performLogTransaction(1, query, apptid);
                            if(result instanceof Error) {
                                console.log('Node 1 did not succeed in replicating');
                                return false;
                            } else {
                                console.log('Node 1 succeeded in replicating');
                            }
    
                        } else if (typeQuery === 'DELETE') {
    
                            //check if the record already exists, just incase it was already committed
                            exists = selectAppt(1, apptid);
    
                            // if record still exists
                            if (exists.length > 0){
                                const query = {
                                    statement: "DELETE FROM appointments WHERE apptid = ?",
                                    value: [apptid],
                                    type: "queryType",
                                };  
    
                                const result = await performLogTransaction(1, query, apptid);
                                if(result instanceof Error) {
                                    console.log('Node 1 did not succeed in replicating');
                                    return false;
                                } else {
                                    console.log('Node 1 succeeded in replicating');
                                }
                            }
                        }
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

                const nodeLatestLog = await getLatestLog(node);

                let nodelogs_check = null;    
                let nodelogs_nocom = null;


                if(nodeLatestLog.length === 0) {
                    // if node is empty, start to the beginning of central node logs
                    nodelogs_check = await getLogsWithCondition(1, ['node = ? AND commit = ?', node, 1]); 
    
                } else {

                    //get node logs that are commit = 0
                    nodelogs_nocom = await getLogsWithCondition(node, ['node = ? AND commit = ?', node, 0]); 

                    //if node is not empty
                    const nodeTime = nodeLatestLog[0].timestamp;

                    console.log(node);

                    // get node1 logs later than the date
                    nodelogs_check = await getLogsWithCondition(1, ['node = ? AND timestamp > ? AND commit = ? AND node_from != ?', node, nodeTime, 1, node]);
                    
                }

                if (nodelogs_check instanceof Error || nodelogs_nocom instanceof Error)
                    throw Error("Node " + node + " : Something went wrong in getting logs of Node 1.");
                
                    if (nodelogs_nocom && nodelogs_nocom > 0) {
                        for (const log of nodelogs_nocom) {
                            // for every log, perform transaction
                            const typeQuery = log.type;
    
                            //get record in json format
                            const appointment = log.record;
                            const appointment_rec = JSON.parse(appointment);
                            const apptid = appointment_rec[0].apptid;
                            const pxid = appointment_rec[0].pxid;
                            const clinicid = appointment_rec[0].clinicid;
                            const regionname = appointment_rec[0].regionname;
                            const type = appointment_rec[0].type;
                            const status = appointment_rec[0].status;
                            const timequeued = new Date(appointment_rec[0].timequeued)
                            const queuedate = new Date(appointment_rec[0].queuedate)
                            const starttime = new Date(appointment_rec[0].starttime)
                            const endtime = new Date(appointment_rec[0].endtime)
                            
    
                            if(typeQuery === 'INSERT') {
    
                                //check if the insert already exists, just incase it was already committed
                                // change node query part
                                exists = selectAppt(1, apptid);
    
                                // if record does not exist
                                if (exists.length === 0) {
                                // if it doesn't exist
                                    const query = {
                                    statement: "INSERT INTO appointments (pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid) VALUES (?,?,?,?,?,?,?,?,?,?,?);",
                                    value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid],
                                    type: "INSERT",
                                    }
                                    const result = await performTransactionLogUpdate(node, query, apptid);
                                    if(result instanceof Error) {
                                        console.log('Node ' + node + ' did not succeed in replicating');
                                        return false;
                                    } else {
                                        const update_result = await nodeConnection.query (
                                            'UPDATE logs SET commit = ? WHERE id = ?;',
                                            [1, log.id]
                                        );
        
                                        if(update_result instanceof Error) {
                                            console.log('Node ' + node + ' did not succeed in replicating');
                                            return false;
                                        } else {
                                            console.log('Node  ' + node + ' succeeded in replicating');
                                        }
                                    }
                                } else {
                                    const update_result = await nodeConnection.query (
                                        'UPDATE logs SET commit = ? WHERE id = ?;',
                                        [1, log.id]
                                    );
    
                                    if(update_result instanceof Error) {
                                        console.log('Node ' + node + ' did not succeed in replicating');
                                        return false;
                                    } else {
                                        console.log('Node  ' + node + ' succeeded in replicating');
                                    }
                                }
    
                            } else if (typeQuery === 'UPDATE') {
                                
                                const query = {
                                    statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
                                    value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
                                    type: "UPDATE",
                                }
    
                                const result = await performTransactionLogUpdate(node, query, apptid);
                                if(result instanceof Error) {
                                    console.log('Node ' + node + ' did not succeed in replicating');
                                    return false;
                                } else {
                                    const update_result = await nodeConnection.query (
                                        'UPDATE logs SET commit = ? WHERE id = ?;',
                                        [1, log.id]
                                    );
    
                                    if(update_result instanceof Error) {
                                        console.log('Node ' + node + ' did not succeed in replicating');
                                        return false;
                                    } else {
                                        console.log('Node  ' + node + ' succeeded in replicating');
                                    }
                                }
    
                            } else if (typeQuery === 'DELETE') {
    
                                 //check if the record already exists, just incase it was already committed
                                exists = selectAppt(1, apptid);
    
                                // if record still exists
                                if (exists.length > 0){
    
                                    const query = {
                                        statement: "DELETE FROM appointments WHERE apptid = ?",
                                        value: [apptid],
                                        type: "queryType",
                                    };  
    
                                    const result = await performTransactionLogUpdate(node, query, apptid);
                                    if(result instanceof Error) {
                                        console.log('Node ' + node + ' did not succeed in replicating');
                                        return false;
                                    } else {
                                        const update_result = await nodeConnection.query (
                                            'UPDATE logs SET commit = ? WHERE id = ?;',
                                            [1, log.id]
                                        );
        
                                        if(update_result instanceof Error) {
                                            console.log('Node ' + node + ' did not succeed in replicating');
                                            return false;
                                        } else {
                                            console.log('Node  ' + node + ' succeeded in replicating');
                                        }
                                    }
                                } else {
                                    const update_result = await nodeConnection.query (
                                        'UPDATE logs SET commit = ? WHERE id = ?;',
                                        [1, log.id]
                                    );
    
                                    if(update_result instanceof Error) {
                                        console.log('Node ' + node + ' did not succeed in replicating');
                                        return false;
                                    } else {
                                        console.log('Node  ' + node + ' succeeded in replicating');
                                    }
                                }
                            }
                        }
                    }

                     //sync log to node by applying it
                    if(nodelogs_check && nodelogs_check.length > 0) {
                        for (const log of nodelogs_check) {
                            // for every log, perform transaction
                            const typeQuery = log.type;
    
                             //get record in json format
                             const appointment = log.record;
                             const appointment_rec = JSON.parse(appointment);
                             const apptid = appointment_rec[0].apptid;
                             const pxid = appointment_rec[0].pxid;
                             const clinicid = appointment_rec[0].clinicid;
                             const regionname = appointment_rec[0].regionname;
                             const type = appointment_rec[0].type;
                             const status = appointment_rec[0].status;
                             const timequeued = new Date(appointment_rec[0].timequeued)
                             const queuedate = new Date(appointment_rec[0].queuedate)
                             const starttime = new Date(appointment_rec[0].starttime)
                             const endtime = new Date(appointment_rec[0].endtime)
    
                            if(typeQuery === 'INSERT') {
    
                                //check if the insert already exists, just incase it was already committed
                                // change node query part
                                exists = selectAppt(1, apptid);
    
                                // if record does not exist
                                if (exists.length === 0){
                                // if it doesn't exist
                                    const query = {
                                    statement: "INSERT INTO appointments (pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid) VALUES (?,?,?,?,?,?,?,?,?,?,?);",
                                    value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid],
                                    type: "INSERT",
                                    }
                                    const result = await performLogTransaction(node, query, apptid);
                                    if(result instanceof Error) {
                                        console.log('Node ' + node + ' did not succeed in replicating');
                                        return false;
                                    } else {
                                        console.log('Node ' + node + ' succeeded in replicating');
                                    }
                                }
    
                            } else if (typeQuery === 'UPDATE') {
                                
                                const query = {
                                    statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
                                    value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
                                    type: "UPDATE",
                                }
    
                                const result = await performLogTransaction(node, query, apptid);
                                if(result instanceof Error) {
                                    console.log('Node ' + node + ' did not succeed in replicating');
                                    return false;
                                } else {
                                    console.log('Node ' + node + ' succeeded in replicating');
                                }
    
                            } else if (typeQuery === 'DELETE') {
    
                                 //check if the record already exists, just incase it was already committed
                                exists = selectAppt(1, apptid);
    
                                // if record still exists
                                if (exists.length > 0){
    
                                    const query = {
                                        statement: "DELETE FROM appointments WHERE apptid = ?",
                                        value: [apptid],
                                        type: "queryType",
                                    };  
    
                                    const result = await performLogTransaction(node, query, apptid);
                                    if(result instanceof Error) {
                                        console.log('Node ' + node + ' did not succeed in replicating');
                                        return false;
                                    } else {
                                        console.log('Node ' + node + ' succeeded in replicating');
                                    }
                                }
                            }
                        }
                    }  

                node1Connection.release();
                nodeConnection.release();
                return true;
            } else {
                console.log('Node 1 is down');
            }
             
        } catch(error) {
            console.error('Error occurred during synchronization in Node ' + node + ': ', error);
        }
        
    },
}

module.exports = syncFuncs;