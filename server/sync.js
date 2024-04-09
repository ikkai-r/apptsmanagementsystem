const { getLogsWithCondition, getLatestLog } = require('./utils/db.js');
const { performTransaction } = require('./utils/transactions.js');

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
                            statement: "INSERT appointments SET VALUES(apptid = ?, pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ?, type=?)",
                            value: [apptid, pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type],
                            type: "INSERT",
                        }

                        const result = await performTransaction(query, apptid);
                        return (result instanceof Error) ? false : true;

                    } else if (typeQuery === 'UPDATE') {

                        const query = {
                            statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
                            value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
                            type: "UPDATE",
                        }

                        const result = await performTransaction(query, apptid);
                        return (result instanceof Error) ? false : true;

                    } else if (typeQuery === 'DELETE') {

                        const query = {
                            statement: "DELETE FROM appointments WHERE apptid = ?",
                            value: [apptid],
                            type: "queryType",
                        };  

                        const result = await performTransaction(query, apptid);
                        return (result instanceof Error) ? false : true;
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
            const node2Time = node2LatestLog[0].timestamp;

            // get node1 logs later than the date
            const node1_2logs = await getLogsWithCondition(1, ['timestamp > ? AND commit = ?', node2Time, 1]);

            // sync log to node 2 by applying it
            if(node1_2logs) {
                for (const log of node1_2logs) {
                    // for every log, perform transaction
                    const typeQuery = log[0].type;

                    //get record in json format
                    const appointment = log[0].record;
                    const { apptid, pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type } = appointment;

                    if(typeQuery === 'INSERT') {

                        const query = {
                            statement: "INSERT appointments SET VALUES(apptid = ?, pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ?, type=?)",
                            value: [apptid, pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type],
                            type: "INSERT",
                        }

                        const result = await performTransaction(query, apptid);
                        return (result instanceof Error) ? false : true;

                    } else if (typeQuery === 'UPDATE') {

                        const query = {
                            statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
                            value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
                            type: "UPDATE",
                        }

                        const result = await performTransaction(query, apptid);
                        return (result instanceof Error) ? false : true;

                    } else if (typeQuery === 'DELETE') {

                        const query = {
                            statement: "DELETE FROM appointments WHERE apptid = ?",
                            value: [apptid],
                            type: "queryType",
                        };  

                        const result = await performTransaction(query, apptid);
                        return (result instanceof Error) ? false : true;
                    }
                }
            }   
        } catch(error) {
            console.error('Error occurred during synchronization in Node 2:', error);
        }
        

        try {
            // node 3
            const node3LatestLog = await getLatestLog(3);
            const node3Time = node3LatestLog[0].timestamp;

            // get node1 logs later than the date
            const node1_3logs = await getLogsWithCondition(1, ['timestamp > ? AND commit = ?', node3Time, 1]);

            // sync log to node 3 by applying it
            if(node1_3logs) {
                for (const log of node1_3logs) {
                    // for every log, perform transaction
                    const typeQuery = log[0].type;

                    //get record in json format
                    const appointment = log[0].record;
                    const { apptid, pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type } = appointment;

                    if(typeQuery === 'INSERT') {

                        const query = {
                            statement: "INSERT appointments SET VALUES(apptid = ?, pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ?, type=?)",
                            value: [apptid, pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type],
                            type: "INSERT",
                        }

                        const result = await performTransaction(query, apptid);
                        return (result instanceof Error) ? false : true;

                    } else if (typeQuery === 'UPDATE') {

                        const query = {
                            statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
                            value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
                            type: "UPDATE",
                        }

                        const result = await performTransaction(query, apptid);
                        return (result instanceof Error) ? false : true;

                    } else if (typeQuery === 'DELETE') {

                        const query = {
                            statement: "DELETE FROM appointments WHERE apptid = ?",
                            value: [apptid],
                            type: "queryType",
                        };  

                        const result = await performTransaction(query, apptid);
                        return (result instanceof Error) ? false : true;
                    }
                }
            }
        } catch(error) {
            console.error('Error occurred during synchronization in Node 3:', error);
        }
        
    },
}

module.exports = syncFuncs;