const { getLogsWithCondition, getLatestLog } = require('./utils/db.js');

const syncFuncs = {
    syncCentralNode: async () => {
        // get central node latest log
        const centralNodeLatestLog = await getLatestLog('1');

        // get node2 logs later than the date
        const node2logs = await getLogsWithCondition('2', ['date > ? AND commit = ?', centralNodeLatestLog.date, 1]);

        // get node3 logs later than the date
        const node3logs = await getLogsWithCondition('3', ['date > ? AND commit = ?', centralNodeLatestLog.date, 1]);

        // sort logs by date
        const allLogs = [...node2logs, ...node3logs];
        const sortedLogs = allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

        // sync logs to central node by applying it

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