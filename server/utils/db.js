const {connectNode} = require('./nodes.js');

const dbFuncs = {
  setIsolationLevel: async (node, isolationLevel) => {
    try {
      await node.query("SET TRANSACTION ISOLATION LEVEL" + isolationLevel);
    } catch (error) {
      return error;
    }
  },

    getLogs: async (node) => {
        const connectedNode = await connectNode(node);
        try {
            if (connectedNode) {
                const [rows] = await connectedNode.query("SELECT * FROM logs;");
                return rows;
            } else {
                console.log("Node " + node + " is down");
                return null;
            }
        } catch(error) {
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
                return rows;
            } else {
                console.log("Node " + node + " is down");
                return null;
            }
        } catch(error) {
            return error;
        }
    },

    getLatestLog: async (node) => {
        const connectedNode = await connectNode(node);
        try {
            if (connectedNode) {
                const [rows] = await connectedNode.query("SELECT * FROM logs ORDER BY id DESC LIMIT 1;");
                return rows;
            } else {
                console.log("Node " + node + " is down");
                return null;
            }
        } catch(error) {
            return error;
        }
    },

  makeTransactionWithSleep: async(node, nodeNum, query, id) => {
    //with json

    if (query.type === 'INSERT') {
      //TODO: implement insert

      // Extract values from the query object
      const { value } = query;
      const [apptid, pxid, clinicid, regionname, status, timequeued, queuedate, starttime, endtime] = value;
      
      // Create a JSON object representing the appointment
      const appointment = {
          apptid: apptid,
          pxid: pxid,
          clinicid: clinicid,
          regionname: regionname,
          status: status,
          timequeued: timequeued,
          queuedate: queuedate,
          starttime: starttime,
          endtime: endtime
      };

      // Log the appointment JSON object
      console.log('Appointment:', appointment);

      try {
          await node.beginTransaction();

          //insert to logs
          await node.query(
            "INSERT INTO logs (type, record, node, commit) VALUES (?,?,?,?);",
            [query.type, JSON.stringify(rows[0]), nodeNum, 0],
          );

          //execute query
          const [result] = await node.query(query.statement, query.value);
          [rows] = await node.query(`SELECT * FROM appointments WHERE apptid = '${id}';`);

          await node.query(
            'UPDATE logs SET record = ? , commit = ? WHERE id = (SELECT max_id FROM (SELECT MAX(id) AS max_id FROM logs) AS max_id_table);',
            [JSON.stringify(rows[0]), 1]
        );

          node.commit();
          node.release();
          return result;
      } catch(error) {
        console.log(error)
        console.log("Rolled back the data.");
        console.log(error);
        node.rollback(node);
        node.release();
        return error;
    }

    } else {

      //update & delete
      let [rows] = [];
      try {
        await node.beginTransaction();
        [rows] = await node.query(`SELECT * FROM appointments WHERE apptid = '${id}';`);

        await node.query(
          "INSERT INTO logs (type, record, node, commit) VALUES (?,?,?,?);",
          [query.type, JSON.stringify(rows[0]), nodeNum, 0],
        );

        //lock transaction
        await node.query(
          "SELECT * FROM appointments WHERE apptid = ? FOR UPDATE;",
          [id]
        );

        //execute query
        const [result] = await node.query(query.statement, query.value);
        [rows] = await node.query(`SELECT * FROM appointments WHERE apptid = '${id}';`);

        await node.query(
          'UPDATE logs SET record = ? , commit = ? WHERE id = (SELECT max_id FROM (SELECT MAX(id) AS max_id FROM logs) AS max_id_table);',
          [JSON.stringify(rows[0]), 1]
      );

        node.commit();
        node.release();
        return result;
      } catch(error) {
          console.log(error)
          console.log("Rolled back the data.");
          console.log(error);
          node.rollback(node);
          node.release();
          return error;
      }

    }
    
  }
};

module.exports = dbFuncs;
