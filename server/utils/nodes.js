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

const connectNode = async (node) => {
    switch (node) {
        case 1: 
            try {
                return await node1.getConnection();
            } catch (error) {
                console.log('Error occurred while getting connection from node 1:', error);
                return null;
            }
        case 2: 
            try {
                return await node2.getConnection();
            } catch (error) {
                console.log('Error occurred while getting connection from node 2:', error);
                return null;
            }
        case 3: 
            try {
                return await node3.getConnection();
            } catch (error) {
                console.log('Error occurred while getting connection from node 3:', error);
                return null;
            }
    }
};

module.exports = {connectNode};

