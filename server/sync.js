const { node1, node2, node3, connectNode, queryNode } = require('./nodes.js');
const { getLogs } = require('./utils/queries.js');

const syncFuncs = {
    syncCentralNode: async () => {
        // get logs
        


    },
    syncOtherNodes: async () => {
        // get logs
        


    },
}


// central node
// get the logs from node 2 and node 3
// check if there are transactions in node 2 and node 3 that have later times 
// than the latest transaction in central node
// if there is and commit = 1, then proceed to apply it to central node database

// node 2
// get logs from central node 
// check if transactions in central node have later times than latest in node 2
// if there is and commit = 1, proceed to apply it to node 2 database

// node 3
// get logs from central node 
// check if transactions in central node have later times than latest in node 3
// if there is and commit = 1, proceed to apply it to node 3 databaseS

module.exports = syncFuncs;