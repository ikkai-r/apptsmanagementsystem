const {connectNode} = require('./nodes.js');
const dayjs = require('dayjs')

const dbFuncs = {

  insertAppointment: async (appointment, node) => {
    const timequeued = appointment.timequeued !== '' ? dayjs(appointment.timequeued).format('YYYY-MM-DD HH:mm:ss') : null;
    const queuedate = appointment.queuedate !== '' ? dayjs(appointment.queuedate).format('YYYY-MM-DD HH:mm:ss') : null;
    const starttime = appointment.starttime !== '' ? dayjs(appointment.starttime).format('YYYY-MM-DD HH:mm:ss') : null;
    const endtime = appointment.endtime !== '' ? dayjs(appointment.endtime).format('YYYY-MM-DD HH:mm:ss') : null;

    try {
      await node.beginTransaction();

      const [result] = await node.query("INSERT INTO appointments (pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime, type, apptid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
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
  
      await node.commit();
      await node.release();
      return result;

    } catch (err) {
      console.log('Error inserting the data: ', err)
      console.log("Rolled back the data.");
      await node.rollback(node);
      insertLog(node, appointment, 'INSERT', getNodeInvolvedFromPort(node));
      await node.release();
    } 
  },

  updateAppointment: async (appointment, node) => {
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
      await node.rollback(node);
      insertLog(node, appointment, 'UPDATE', getNodeInvolvedFromPort(node));
      await node.release();
    } 
  },

  deleteAppointment: async (appointment, node) => {
    console.log('delete this', appointment);
    //check if central connection works
    try {
      await node.beginTransaction();

      const [check] = await node.query(
        "SELECT * FROM appointments WHERE apptid = ? FOR UPDATE;",
        [appointment.apptid]
      );

      console.log(check, 'here');

      const [result] = await node.query("DELETE FROM appointments WHERE apptid = ?", [
        appointment.apptid
    ]);

      await node.commit();
      await node.release();

      return result;

    } catch (err) {
      console.log('Error deleting the data: ', err)
      console.log("Rolled back the data.");
      await node.rollback(node);
      insertLog(node, appointment, 'DELETE', getNodeInvolvedFromPort(node));
      await node.release();

    } 
    
  },

  insertLog: async (node, appointment, type, nodeInvolved) => {
    try {
      await node.beginTransaction();

      const [result] = await node.query("INSERT INTO logs (type, record, node, commit) VALUES (?, ?, ?, ?)", [
        type,
        JSON.stringify(appointment),
        nodeInvolved,
        0
    ]);

      await node.commit();
      await node.release();

      return result;

    } catch (err) {
      console.log('Error inserting the log: ', err)
      console.log("Rolled back the data.");
      await node.rollback(node);
      await node.release();
    }
    
  },

  setIsolationLevel: async (node, isolationLevel) => {
    try {
      await node.query("SET TRANSACTION ISOLATION LEVEL" + isolationLevel);
    } catch (error) {
      return error;
    }
  },

    getLogsWithCondition: async (node, query) => {
        const connectedNode = await connectNode(node);
        try {
            if (connectedNode) {
                let queryOrig = "SELECT * FROM logs";
            
                if (query && query.length > 0) {
                    queryOrig += " WHERE " + query[0];
                }

                const [rows] = await connectedNode.query(queryOrig, query.slice(1));
                connectedNode.release();
                return rows;
            } else {
                console.log("Node " + node + " is down");
                return null;
            }
        } catch(error) {
            return error;
        }
    },

    getNodeInvolvedFromPort: async (node) => {
      if (node.config.port == 20153) {
        return 1;
      } else if (node.config.port == 20154) {
        return 2;
      } else if (node.config.port == 20155) {
        return 3;
      }
    },
    
};

module.exports = dbFuncs;
