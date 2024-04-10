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

    getLatestLog: async (node) => {
        const connectedNode = await connectNode(node);
        try {
            if (connectedNode) {
                const [rows] = await connectedNode.query("SELECT * FROM logs WHERE commit = 1 ORDER BY id DESC LIMIT 1;");
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

    makeTransaction: async(node, query, id) => {
      let [rows] = [[{}]];
      try {
        await node.beginTransaction();

        if (query.type === "UPDATE" || query.type === "DELETE") {
          rows = await node.query(`SELECT * FROM appointments WHERE apptid = '${id}';`);
        } 

        //lock transaction
        await node.query(
          "SELECT * FROM appointments WHERE apptid = ? FOR UPDATE;",
          [id]
        );

        const [result] = await node.query(query.statement, query.value);
        rows = await node.query(`SELECT * FROM appointments WHERE apptid = '${id}';`);

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

    },

  makeTransactionWithSleep: async(node, nodeNum, query, nodeFrom, id) => {
      let [rows] = [[{}]];
      try {
        await node.beginTransaction();

        if (query.type === "UPDATE" || query.type === "DELETE") {
          rows = await node.query(`SELECT * FROM appointments WHERE apptid = '${id}';`);
        } 
        
        await node.query(
          "INSERT INTO logs (type, record, node, node_from, commit) VALUES (?,?,?,?,?);",
          [query.type, JSON.stringify(rows[0]), nodeNum, nodeFrom, 0],
        );

        //lock transaction
        await node.query(
          "SELECT * FROM appointments WHERE apptid = ? FOR UPDATE;",
          [id]
        );

        const [result] = await node.query(query.statement, query.value);
        rows = await node.query(`SELECT * FROM appointments WHERE apptid = '${id}';`);

        node.commit();     

        await node.query (
          'UPDATE logs SET record = ? , commit = ? WHERE id = (SELECT max_id FROM (SELECT MAX(id) AS max_id FROM logs) AS max_id_table);',
          [JSON.stringify(rows[0]), 1]
      );

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

    },
    // for sync.js
    selectAppt: async (node, id) => {
      const connectedNode = await connectNode(node);
      try {
            if (connectedNode)
                result = await node.query(`SELECT * FROM appointments WHERE apptid = '${id}';`);
                connectedNode.release();
            return result;
      } catch(error) {
          connectedNode.release();
          return error;

      } 
  }
    
};

module.exports = dbFuncs;
