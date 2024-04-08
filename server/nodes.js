const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config(); 

const node1 = mysql.createPool({
    host: process.env.HOSTNAME,
    port: process.env.PORT1,
    user: process.env.USERNAME1,
    password: process.env.PASSWORD1,
    database: process.env.DATABASE,
}).promise();

const node2 = mysql.createPool({
    host: process.env.HOSTNAME,
    port: process.env.PORT2,
    user: process.env.USERNAME2,
    password: process.env.PASSWORD2,
    database: process.env.DATABASE,
}).promise();

const node3 = mysql.createPool({
    host: process.env.HOSTNAME,
    port: process.env.PORT3,
    user: process.env.USERNAME3,
    password: process.env.PASSWORD3,
    database: process.env.DATABASE,
}).promise();

const nodeFuncs = {
    connectNode: async (node) => {
        switch (node) {
            case '1': return await node1.getConnection();
            case '2': return await node2.getConnection();
            case '3': return await node3.getConnection();
        }
    },
    queryNode: async (node, query, values) => {
        if (values == null) {
            switch (node) {
                case '1': return await node1.query(query);
                case '2': return await node2.query(query);
                case '3': return await node3.query(query);
            }
        } else {
            switch (node) {
                case '1': return await node1.query(query, values);
                case '2': return await node2.query(query, values);
                case '3': return await node3.query(query, values);
            }
        }
        
    }
}

module.exports = nodeFuncs;