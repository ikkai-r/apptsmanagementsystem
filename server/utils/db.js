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
    const connectedNode = connectNode(node);
    try {
      if (connectNode) {
        await connectedNode.query(
          "SET TRANSACTION ISOLATION LEVEL" + isolationLevel
        );
      } else {
        console.log("Node is down");
      }
    } catch (error) {
      return error;
    }
  },

  makeTransaction: async (node, query, id) => {
    let [rows] = [];

    const connectedNode = connectNode(node);
    try {
      if (connectedNode) {
        try {
          const currentDate = new Date();
          await connectedNode.beginTransaction();
          
          rows = await connectedNode.query("SELECT * FROM appointments WHERE id = ?", [id]);
          await connectedNode.query(
            "INSERT INTO logs (type, record, node, commit, timestamp) VALUES (?,?,?,?,?);",
            [query.type, rows, node, 0, currentDate]
          );

          //lock transaction
          await connectNode.query(
            "SELECT * FROM appointments WHERE id = ? FOR UPDATE;",
            [id]
          );
          // await connectedNode.query(`SET @@session.time_zone = "+08:00";`);

          //execute query
          if (query.type === "UPDATE") {
            rows = await connectedNode.query(query.statement, query.values);
          } else {
            rows = await connectedNode.query(query.statement);
          }

          //insert log
          //change schema
          await connectedNode.query(
            "UPDATE logs SET type = ?, record = ?, node = ?, commit = ?, timestamp = ? WHERE id = (SELECT MAX(id) FROM logs)",
            [query.type, rows, node, 1, currentDate]
          );
          connectNode.commit();
          connectNode.release();
          return rows;
        } catch (error) {
          console.log("Rolled back the data.");
          connectNode.rollback(node);
          connectNode.release();
          return error;
        }
      } else {
        console.log("Node is down");
      }
    } catch (error) {
      return error;
    }
  },
};

module.exports = dbFuncs;
