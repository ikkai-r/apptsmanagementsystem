const { connectNode } = require('./utils/nodes.js');
const { getLogsWithCondition, getLatestLog, selectAppt } = require('./utils/db.js');
const { performLogTransaction } = require('./utils/transactions.js');

const syncFuncs = {
    syncCentralNode: async () => {
        try {
            // get central node latest log
            const centralNodeConnection= await connectNode(1);

        if (centralNodeConnection) {
            const centralNodeLatestLog = await getLatestLog(1);
            const centralNodeTime = centralNodeLatestLog[0].timestamp;
            
            const node2Connection = await connectNode(2);
            const node3Connection = await connectNode(3);

            let node2logs = [];
            let node3logs = [];

            if(node2Connection) {
                //get node2 logs later than the date
                node2logs = await getLogsWithCondition(2, ['timestamp > ? AND commit = ?', centralNodeTime, 1]);
            } else {
                console.log('Node 2 is down');
            }

            if(node3Connection) {
                //get node3 logs later than the date
                node3logs = await getLogsWithCondition(3, ['timestamp > ? AND commit = ?', centralNodeTime, 1]);
            } else {
                console.log('Node 3 is down');
            }

            // sort logs by date
            const allLogs = [...node2logs, ...node3logs];
            const sortedLogs = allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

        // sync logs to central node by applying it if existing
            if(sortedLogs) {
                for (const log of sortedLogs) {
                    // for every log, perform transaction
                    const typeQuery = log[0].type;

                    //get record in json format
                    const appointment = log[0].record;
                    const { apptid, pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type } = appointment;

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
            centralNodeConnection.release();
            if(node2Connection) {
                node2Connection.release();
            }

            if(node3Connection) {
                node3Connection.release();
            }
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
                let nodelogs = null;    

                if(nodeLatestLog.length === 0) {
                    // if node is empty, start to the beginning of central node logs
                    nodelogs = await getLogsWithCondition(1, ['node = ? AND commit = ?', node, 1]); 
    
                } else {
                    //if node 2 is not empty
                    const nodeTime = nodeLatestLog[0].timestamp;
    
                    // get node1 logs later than the date
                    nodelogs = await getLogsWithCondition(1, ['node = ? AND timestamp > ? AND commit = ?', node, nodeTime, 1]);
    
                }
                if (nodelogs instanceof Error)
                    throw Error("Node 2: Something went wrong in getting logs of Node 1.");
    
                     //sync log to node by applying it
                    if(nodelogs) {
                        for (const log of nodelogs) {
                            // for every log, perform transaction
                            const typeQuery = log.type;
    
                            //get record in json format
                            const appointment = log.record;
                            const appointment_rec = JSON.parse(appointment);
                            const apptid = appointment_rec[0].apptid;
                            const pxid = appointment_rec[0].pxid;
                            const clinicid = appointment_rec[0].clinicid;
                            const regionname = appointment_rec[0].regionname;
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