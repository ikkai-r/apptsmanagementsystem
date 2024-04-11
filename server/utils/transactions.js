const {connectNode} = require('./nodes.js');
const {setIsolationLevel, insertAppointment, updateAppointment, deleteAppointment, insertLog, searchAppointment} = require('./db.js');
const luzon_regions = ['National Capital Region (NCR)', 'Ilocos Region (I)', 'Cagayan Valley (II)', 'Central Luzon (III)', 'CALABARZON (IV-A)', 'MIMAROPA (IV-B)', 'Cordillera Administrative Region (CAR)']

const transactionFunc =  {
    performTransaction: async (appointment, type) => {
    const centralNodeConnection = await connectNode(1);
    let nodeConnection = null;
    let nodeInvolved = 1;

    //TODO: Not sure if needed
    //await setIsolationLevel(centralNodeConnection, "READ UNCOMMITTED");
        
    console.log(appointment)

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
                updateAppointment(appointment, nodeConnection);
                // await new Promise(r => setTimeout(r, 2000));   //for simulating concurrency in the actual table
            } else {
                deleteAppointment(appointment, nodeConnection);
                // await new Promise(r => setTimeout(r, 2000));
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

  performTransactionTest: async (appointment, type, nodeConnection, centralNodeConnection, nodeNum) => {
    let nodeInvolved = nodeNum;
    let [rows] = [];

    try {
        if (centralNodeConnection) {
            try {
                if (type === 'INSERT') {
                    await insertAppointment(appointment, centralNodeConnection);
                } else if (type === 'UPDATE') {
                    await updateAppointment(appointment, centralNodeConnection);
                } else if (type === 'DELETE') {
                    await deleteAppointment(appointment, centralNodeConnection);
                }
            } catch (err) {
                console.log('Perform transaction log: ', err);
                console.log(err);
            }
        } else if (!centralNodeConnection && nodeConnection) {
            try {
                await insertLog(nodeConnection, appointment, type, 1);
            } catch (err) {
                console.log('Perform transaction inserting log: ', err);
            } 
        } else {
            console.log('Nodes are down.');
        }
    
        if (nodeConnection) {
            try {
                if (type === 'INSERT') {
                    await insertAppointment(appointment, nodeConnection);
                } else if (type === 'UPDATE') {
                    await updateAppointment(appointment, nodeConnection);
                    await new Promise(r => setTimeout(r, 2000));
                } else if (type === 'DELETE') {
                    await deleteAppointment(appointment, nodeConnection);
                    await new Promise(r => setTimeout(r, 2000));
                } 

                try {
                    rows = await searchAppointment(appointment, nodeConnection);
                } catch (err) {
                    console.log("Perform transaction selecting appointment", err);
                }
            } catch (err) {
                console.log('Perform transaction: ', err);
            } 
        } else if (!nodeConnection && centralNodeConnection) {
            try {
                await insertLog(centralNodeConnection, appointment, type, nodeInvolved);
                console.log("executed")
            } catch (err) {
                console.log('Perform transaction inserting log: ', err);
            } 
        } else {
            console.log('Nodes are down.');
        }
        
        if (nodeConnection) nodeConnection.release();
        if (centralNodeConnection) centralNodeConnection.release();
        
        return rows;
    } catch(error) {
        console.log("error")
        return null;
    }
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
