const {connectNode} = require('./nodes.js');
const {setIsolationLevel, insertAppointment, updateAppointment, deleteAppointment, insertLog} = require('./db.js');
const luzon_regions = ['National Capital Region (NCR)', 'Ilocos Region (I)', 'Cagayan Valley (II)', 'Central Luzon (III)', 'CALABARZON (IV-A)', 'MIMAROPA (IV-B)', 'Cordillera Administrative Region (CAR)']

const transactionFunc =  {
    performTransaction: async (appointment, type) => {
    const centralNodeConnection = await connectNode(1);
    let nodeConnection = null;
    let nodeInvolved = 1;

    //TODO: Not sure if needed
    //await setIsolationLevel(centralNodeConnection, "READ UNCOMMITTED");
    
    const regionname = appointment.regionname;

    if(luzon_regions.includes(regionname)) {
        nodeConnection = await connectNode(2);
        nodeInvolved = 2;
    } else {
        nodeConnection = await connectNode(3);
        nodeInvolved = 3;
    }
    
    //master working
    if (centralNodeConnection) {
        try {
            if (type === 'INSERT') {
                insertAppointment(appointment, centralNodeConnection);
            } else if (type === 'UPDATE') {
                updateAppointment(appointment, centralNodeConnection);
            } else {
                deleteAppointment(appointment, centralNodeConnection);
            }
        } catch (err) {
            console.log('Perform transaction log: ', err);
            console.log(err);
        }
    } else if (!centralNodeConnection && nodeConnection) {
        try {
            insertLog(nodeConnection, appointment, type, 1);
        } catch (err) {
            console.log('Perform transaction inserting log: ', err);
        } 
    } else {
        console.log('Nodes are down.');
    }

    if (nodeConnection) {
        try {
            if (type === 'INSERT') {
                insertAppointment(appointment, nodeConnection);
            } else if (type === 'UPDATE') {

                //TODO: check region name
                //if regionname included in luzon, and node involved is != 2:
                // insert to node 3 and delete in node 2

                // else if regionname not included in luzon, and node involved is != 3:
                // insert to node 2 and delete in node 3

                //else update
                updateAppointment(appointment, nodeConnection);
            } else {
                deleteAppointment(appointment, nodeConnection);
            }
        } catch (err) {
            console.log('Perform transaction: ', err);
        } 
    } else if (!nodeConnection && centralNodeConnection) {
        try {
            insertLog(centralNodeConnection, appointment, type, nodeInvolved);
        } catch (err) {
            console.log('Perform transaction inserting log: ', err);
        } 
    } else {
        console.log('Nodes are down.');
    }

    if (nodeConnection) nodeConnection.release();
    if (centralNodeConnection) centralNodeConnection.release();
    
    return true;
  }, 
  
  performTransactionFromLog: async (appointment, type, nodeConnection) => {

    //TODO: Not sure if needed
    //await setIsolationLevel(centralNodeConnection, "READ UNCOMMITTED");
    
    //master working
    if (nodeConnection) {
        try {
            if (type === 'INSERT') {
                insertAppointment(appointment, nodeConnection);
            } else if (type === 'UPDATE') {
                updateAppointment(appointment, nodeConnection);
            } else {
                deleteAppointment(appointment, nodeConnection);
            }
        } catch (err) {
            console.log('Log recovery failed: ', err);
        }
    } else {
        console.log('Node is down');
    }

    if (nodeConnection) nodeConnection.release();
    
  }, 

};
module.exports = transactionFunc;
