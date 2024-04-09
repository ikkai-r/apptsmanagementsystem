const { getLogsWithCondition, getLatestLog } = require('./utils/db.js');
const { performTransaction } = require('./utils/transactions.js');

const syncFuncs = {
    syncCentralNode: async () => {
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
                const type = log[0].type;

                //TODO: Implement this
                if(type === 'INSERT') {

                    const query = {
                        statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
                        value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
                        type: "UPDATE",
                    }

                } else if (type === 'UPDATE') {
                    const query = {
                        statement: "UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ? WHERE apptid = ?",
                        value: [pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, apptid],
                        type: "UPDATE",
                    }
                } else if (type === 'DELETE') {
                    const query = {
                        statement: "DELETE FROM appointments WHERE apptid = ?",
                        value: [apptid],
                        type: "queryType",
                    };  
                }
            }
        }
    },
    syncOtherNodes: async () => {
        // node 2
        const node2LatestLog = await getLatestLog('2');

        // get node1 logs later than the date
        const node1_2logs = await getLogsWithCondition('1', ['date > ? AND commit = ?', node2LatestLog.date, 1]);

        // sync log to node 2 by applying it

        //node 3
        const node3LatestLog = await getLatestLog('3');

        // get node1 logs later than the date
        const node1_3logs = await getLogsWithCondition('1', ['date > ? AND commit = ?', node3LatestLog.date, 1]);

        // sync logs to node 3 by applying it
        
    },
}

module.exports = syncFuncs;