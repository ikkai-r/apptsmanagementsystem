const { connectNode } = require("./nodes.js");

const dbFuncs = {
  getLogs: async (node) => {
    const connectedNode = connectNode(node);
    try {
      if (connectedNode) {
        const [rows] = connectNode.query("SELECT * FROM logs;");
        return rows;
      } else {
        console.log("Node is down");
      }
    } catch (error) {
      return error;
    }
  },

  setIsolationLevel: async (node, isolationLevel) => {
    try {
      await node.query("SET TRANSACTION ISOLATION LEVEL" + isolationLevel);
    } catch (error) {
      return error;
    }
  },

  makeTransaction: async (node, nodeNum, query, id) => {
    try {
      await node.beginTransaction();
      await node.query(
        "INSERT INTO logs_table (node, type, commit) VALUES (?,?,?);",
        [nodeNum, query.type, 0]
      );

      //lock transaction
      await node.query(
        "SELECT * FROM appointments WHERE apptid = ? FOR UPDATE;",
        [id]
      );

      //execute query
      const [rows] = await node.query(query.statement, query.value);

      //insert log
      await node.query(
        "UPDATE logs_table SET commit = 1 WHERE id = (SELECT max_id FROM (SELECT MAX(id) AS max_id FROM logs_table) AS max_id_table)"
      );

      node.commit();
      node.release();
      return rows;
    } catch (error) {
      console.log("Rolled back the data.");
      console.log(error);
      node.rollback(node);
      node.release();
      return error;
    }
  },
};

module.exports = dbFuncs;
