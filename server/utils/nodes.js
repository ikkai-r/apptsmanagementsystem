const mysql = require('mysql2');
const mysql2 = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config(); 

const node1 = mysql.createPool({
    host: process.env.HOSTNAME,
    port: process.env.PORT1,
    user: process.env.USERNAME1,
    password: process.env.PASSWORD1,
    database: process.env.DATABASE,
    waitForConnections: true, 
    connectionLimit: 0,
    queueLimit: 0, 
    idleTimeout: 60000,
}).promise();

const node2 = mysql.createPool({
    host: process.env.HOSTNAME,
    port: process.env.PORT2,
    user: process.env.USERNAME2,
    password: process.env.PASSWORD2,
    database: process.env.DATABASE,
    waitForConnections: true, 
    connectionLimit: 0,
    queueLimit: 0, 
    idleTimeout: 60000,
}).promise();

const node3 = mysql.createPool({
    host: process.env.HOSTNAME,
    port: process.env.PORT3,
    user: process.env.USERNAME3,
    password: process.env.PASSWORD3,
    database: process.env.DATABASE,
    waitForConnections: true, 
    connectionLimit: 0,
    queueLimit: 0, 
    idleTimeout: 60000,
}).promise();

const connectNode = async (node) => {
    let pool;
    switch (node) {
        case 1: 
            pool = node1;
            break;
        case 2: 
            pool = node2;
            break;
        case 3: 
            pool = node3;
            break;
        default:
            console.error('Invalid node number:', node);
            return null;
    }
    
    try {
        const nodePromise = pool.getConnection();
        const connection = await Promise.race([
            nodePromise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Connection timeout")), 10000)
            ),
        ]);
        return connection;
    } catch (err) {
        console.error(`Error occurred while getting connection from node ${node}:`, err);
        return null;
    }
};


module.exports = {connectNode};

