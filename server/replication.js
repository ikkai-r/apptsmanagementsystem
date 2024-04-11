const { syncCentralNode, syncOtherNodes } = require('./sync.js');

let isCentralNodeReplicating = false;
let isNode2Replicating = false;
let isNode3Replicating = false;

async function replicateCentralNode() {
  if (!isCentralNodeReplicating) {
    isCentralNodeReplicating = true;
    try {
      const result = await syncCentralNode();
      if(result) {
        // console.log('Replication for central node has finished.');
        isCentralNodeReplicating = false;
      }
    } catch (error) {
      console.error('Error replicating central node data:', error);
    } 
  } 
}

async function replicateOtherNodes() {
  if (!isNode2Replicating) {
    isNode2Replicating = true;
    try {
      const result = await syncOtherNodes(2);
      if(result) {
        // console.log('Replication for node 2 has finished.');
        isNode2Replicating = false;
      }
    } catch (error) {
      console.error('Error replicating node 2:', error);
    } 
  } 

  if (!isNode3Replicating) {
    isNode3Replicating = true;
    try {
      const result = await syncOtherNodes(3);
      if(result) {
        // console.log('Replication for node 3 has finished.');
        isNode3Replicating = false;
      }
    } catch (error) {
      console.error('Error replicating node 3:', error);
    } 
  } 
}

async function replicateData() {
  await replicateCentralNode();
  await replicateOtherNodes();
}

module.exports = { replicateCentralNode, replicateOtherNodes, replicateData };