const { getLogsWithCondition, getLatestLog } = require('./utils/db.js');
const { performLogTransaction } = require('./utils/transactions.js');

const syncFuncs = {
    syncCentralNode: async () => {
        try {
            // get central node latest log
            const centralNodeLatestLog = await getLatestLog(1);
            const centralNodeTime = centralNodeLatestLog[0].timestamp;

            //get node2 logs later than the date
            const node2logs = await getLogsWithCondition(2, ['timestamp > ? AND commit = ?', centralNodeTime, 1]);

            // get node3 logs later than the date
            const node3logs = await getLogsWithCondition(3, ['timestamp > ? AND commit = ?', centralNodeTime, 1]);

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

                        const query = {
                            statement: "INSERT INTO appointments (pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid) VALUES (?,?,?,?,?,?,?,?,?,?,?);",
                            value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid],
                            type: "INSERT",
                        }

                        const result = await performLogTransaction(1, query, apptid);
                        if(result instanceof Error) {
                            console.log('Node 1 did not succeed in replicating');
                        } else {
                            console.log('Node 1 succeeded in replicating');
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
                        } else {
                            console.log('Node 1 succeeded in replicating');
                        }

                    } else if (typeQuery === 'DELETE') {

                        const query = {
                            statement: "DELETE FROM appointments WHERE apptid = ?",
                            value: [apptid],
                            type: "queryType",
                        };  

                        const result = await performLogTransaction(1, query, apptid);
                        if(result instanceof Error) {
                            console.log('Node 1 did not succeed in replicating');
                        } else {
                            console.log('Node 1 succeeded in replicating');
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error occurred during synchronization in central node:', error);
        }
    },
    syncOtherNodes: async () => {

        try {
            // node 2
            const node2LatestLog = await getLatestLog(2);
            let node1_2logs = null;

            if(node2LatestLog.length === 0) {
                // if node 2 is empty, start to the beginning of central node logs
                node1_2logs = await getLogsWithCondition(1, ['node = ? AND commit = ?', 2, 1]); 

            } else {
                //if node 2 is not empty
                const node2Time = node2LatestLog[0].timestamp;

                // get node1 logs later than the date
                node1_2logs = await getLogsWithCondition(1, ['node = ? AND timestamp > ? AND commit = ?', 2, node2Time, 1]);

            }
                 //sync log to node 2 by applying it
                if(node1_2logs) {
                    for (const log of node1_2logs) {
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

                            const query = {
                            statement: "INSERT INTO appointments (pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid) VALUES (?,?,?,?,?,?,?,?,?,?,?);",
                            value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid],
                            type: "INSERT",
                        }
                            const result = await performLogTransaction(2, query, apptid);
                            if(result instanceof Error) {
                                console.log('Node 2 did not succeed in replicating');
                            } else {
                                console.log('Node 2 succeeded in replication');
                            }

                        } else if (typeQuery === 'UPDATE') {
                            
                            const query = {
                                statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
                                value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
                                type: "UPDATE",
                            }

                            const result = await performLogTransaction(2, query, apptid);
                            if(result instanceof Error) {
                                console.log('Node 2 did not succeed in replicating');
                            } else {
                                console.log('Node 2 succeeded in replication');
                            }

                        } else if (typeQuery === 'DELETE') {

                            const query = {
                                statement: "DELETE FROM appointments WHERE apptid = ?",
                                value: [apptid],
                                type: "queryType",
                            };  

                            const result = await performLogTransaction(2, query, apptid);
                            if(result instanceof Error) {
                                console.log('Node 2 did not succeed in replicating');
                            } else {
                                console.log('Node 2 succeeded in replication');
                            }
                        }
                    }
                }  

             
        } catch(error) {
            console.error('Error occurred during synchronization in Node 2:', error);
        }
        

        try {
            // node 3
            const node3LatestLog = await getLatestLog(3);
            let node1_3logs = null;

            if(node3LatestLog.length === 0) {
                //if empty, get node1 logs start
                node1_3logs = await getLogsWithCondition(1, ['node = ? AND commit = ?', 3, 1]);
            } else {
                const node3Time = node3LatestLog[0].timestamp;
                // get node1 logs later than the date
                node1_3logs = await getLogsWithCondition(1, ['node = ? AND timestamp > ? AND commit = ?', 3, node3Time, 1]);
            }

            // sync log to node 3 by applying it
            if(node1_3logs) {
                for (const log of node1_3logs) {
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

                        const query = {
                            statement: "INSERT INTO appointments (pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid) VALUES (?,?,?,?,?,?,?,?,?,?,?);",
                            value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid],
                            type: "INSERT",
                        }
                        const result = await performLogTransaction(3, query, apptid);
                        if(result instanceof Error) {
                                console.log('Node 3 did not succeed in replicating');
                            } else {
                                console.log('Node 3 succeeded in replication');
                            }

                    } else if (typeQuery === 'UPDATE') {

                        const query = {
                            statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
                            value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
                            type: "UPDATE",
                        }

                        const result = await performLogTransaction(3, query, apptid);
                        if(result instanceof Error) {
                                console.log('Node 3 did not succeed in replicating');
                            } else {
                                console.log('Node 3 succeeded in replication');
                            }

                    } else if (typeQuery === 'DELETE') {

                        const query = {
                            statement: "DELETE FROM appointments WHERE apptid = ?",
                            value: [apptid],
                            type: "queryType",
                        };  

                        const result = await performLogTransaction(3, query, apptid);
                        if(result instanceof Error) {
                                console.log('Node 3 did not succeed in replicating');
                            } else {
                                console.log('Node 3 succeeded in replication');
                            }
                    }
                }
            }
        } catch(error) {
            console.error('Error occurred during synchronization in Node 3:', error);
        }
        
    },
}

module.exports = syncFuncs;