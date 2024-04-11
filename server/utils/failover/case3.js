const {connectNode} = require("../nodes.js")
const dayjs = require('dayjs')
const dbFuncs = require('../db.js');
const {replicateCentralNode} = require("../../replication.js");
const luzon_regions = ['National Capital Region (NCR)', 'Ilocos Region (I)', 'Cagayan Valley (II)', 'Central Luzon (III)', 'CALABARZON (IV-A)', 'MIMAROPA (IV-B)', 'Cordillera Administrative Region (CAR)']



// custom function to simulate an error in performing transaction
async function updateAppointmentError (appointment, node) {
    const timequeued = appointment.timequeued !== '' ? dayjs(appointment.timequeued).format('YYYY-MM-DD HH:mm:ss') : null;
    const queuedate = appointment.queuedate !== '' ? dayjs(appointment.queuedate).format('YYYY-MM-DD HH:mm:ss') : null;
    const starttime = appointment.starttime !== '' ? dayjs(appointment.starttime).format('YYYY-MM-DD HH:mm:ss') : null;
    const endtime = appointment.endtime !== '' ? dayjs(appointment.endtime).format('YYYY-MM-DD HH:mm:ss') : null;

    try {
      await node.beginTransaction();
      let result = null;

      const [rows] = await node.query(
        "SELECT * FROM appointments WHERE apptid = ? FOR UPDATE;",
        [appointment.apptid]
      );

      
      if (rows.length > 0) {

        //
        console.log("Trigger error here");
        throw new Error("User initiated error for Case 3")
        [result] = await node.query("UPDATE appointments SET pxid = ?, clinicid = ?, regionname = ?, status = ?, timequeued = ?, queuedate = ?, starttime = ?, endtime = ?, type = ? WHERE apptid = ?", [
          appointment.pxid,
          appointment.clinicid,
          appointment.regionname,
          appointment.status,
          timequeued,
          queuedate,
          starttime,
          endtime,
          appointment.type,
          appointment.apptid
      ]);
      
      
      } else {
        if(node.config.port == 20155) {
          //it belonged in the luzon node before 
          // delete from node 2
          dbFuncs.deleteAppointment(appointment, await connectNode(2));
          // insert to node 3
          dbFuncs.insertAppointment(appointment, await connectNode(3));
        } else if(node.config.port == 20154) {
          //it belonged in the visayas/mindanao node before 
            // delete from node 2
            dbFuncs.deleteAppointment(appointment, await connectNode(2));
            // insert to node 3
            dbFuncs.insertAppointment(appointment, await connectNode(3));
        }
      }

      await node.commit();
      await node.release();

      return result;
    } catch (err) {
      console.log('Error updating the data: ', err)
      console.log("Rolled back the data.");
      const nodeInvolved = await dbFuncs.getNodeInvolvedFromPort(node);
      dbFuncs.insertLog(node, appointment, 'UPDATE', nodeInvolved);
      await node.rollback(node);
      await node.release();
    } 
  }

// custom performTransaction
async function performTransaction (appointment, type) {
    const centralNodeConnection = await connectNode(1);
    let nodeConnection = null;
    let nodeInvolved = 1;

    const regionname = appointment.regionname;

    if(luzon_regions.includes(regionname)) {
        nodeConnection = await connectNode(2);
        nodeInvolved = 2;
    } else {
        nodeConnection = await connectNode(3);
        nodeInvolved = 3;
    }
    
    console.log("Node involved: " + nodeInvolved)
    //master working
    if (centralNodeConnection) {
        try {
            //if (type === 'INSERT') {
                //insertAppointment(appointment, centralNodeConnection);
            //} else if (type === 'UPDATE') {
                updateAppointmentError(appointment, centralNodeConnection);
            //} else {
             //   deleteAppointment(appointment, centralNodeConnection);
            //}
        } catch (err) {
            console.log('Perform transaction log: ', err);
            console.log(err);
        }
    } else if (!centralNodeConnection && nodeConnection) {
        try {
            dbFuncs.insertLog(nodeConnection, appointment, type, 1);
        } catch (err) {
            console.log('Perform transaction inserting log: ', err);
        } 
    } else {
        console.log('Nodes are down.');
    }

    if (nodeConnection) {
        try {
            //if (type === 'INSERT') {
            //    insertAppointment(appointment, nodeConnection);
            //} else if (type === 'UPDATE') {
                dbFuncs.updateAppointment(appointment, nodeConnection);
            //} else {
             //   deleteAppointment(appointment, nodeConnection);
            //}
        } catch (err) {
            console.log('Perform transaction: ', err);
        } 
    } else if (!nodeConnection && centralNodeConnection) {
        try {
            dbFuncs.insertLog(centralNodeConnection, appointment, type, nodeInvolved);
        } catch (err) {
            console.log('Perform transaction inserting log: ', err);
        } 
    } else {
        console.log('Nodes are down.');
    }

    if (nodeConnection) nodeConnection.release();
    if (centralNodeConnection) centralNodeConnection.release();
    
    return true;
}

const case3Fail = async() =>{
    
    try{   
        
        // insert record
        const appoint ={
            apptid:"delete",
            pxid: "delete",
            clinicid: "delete",
            regionname:"National Capital Region (NCR)",
            status: "Cancel " + Math.random(),
            type:"case3",
            timequeued: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
       
        
        await performTransaction(appoint, "UPDATE")
        await replicateCentralNode(); // replicate again

    } catch(error){
        console.log(error);
    }

    
    

};

module.exports = {case3Fail};


