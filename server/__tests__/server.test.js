const {setIsolationLevel, resetIsolationLevel, makeTransactionWithSleep, selectAppt} = require('../utils/db');
const {connectNode} = require('../utils/nodes.js');
const { replicateData } = require("../replication.js");

const SECONDS = 1000;
jest.setTimeout(10 * SECONDS)


describe("Concurrency", () => {
    it("Concurrent transactions in two or more nodes are reading the same data item.", async () => {
        await replicateData();

        const node1 = await connectNode(1);
        const node2 = await connectNode(2);

        await setIsolationLevel(node1, "READ UNCOMMITTED");
        await setIsolationLevel(node2, "READ UNCOMMITTED");

        const [r1, r2] = await Promise.all([
            node1.query("SELECT * FROM appointments WHERE apptid = '00144FD5DFDE7EDCD23990B7F3576021';"),
            node2.query("SELECT * FROM appointments WHERE apptid = '00144FD5DFDE7EDCD23990B7F3576021';")
        ]);
        
        expect(results1[0]).toEqual(results2[0]);
        await node1.release();
        await node2.release();
    });

    it("At least one transaction in the three nodes is writing (update / delete) and the other concurrent transactions are reading the same data item.", async () => {
        const node1 = await connectNode(1);
        const node2 = await connectNode(2);
        
        await setIsolationLevel(node1, "SERIALIZABLE");
        await setIsolationLevel(node2, "SERIALIZABLE");

        const id = "00144FD5DFDE7EDCD23990B7F3576021";
        const query = {
            statement: "UPDATE appointments SET status = ? WHERE apptid = ?;",
            value: ["Queued", id],
            type: "UPDATE",
        }

        const before = await node2.query(`SELECT * FROM appointments WHERE apptid = '${id}';`);

        //if query makes the data looks the same as before, update its status
        const containsQueued = before[0].some(appointment => appointment.status === 'Queued');
        if (containsQueued) {
            query.value = ["Skip", id];
        } 

        const [transactionResult, replicate, after] = await Promise.all([
            makeTransactionWithSleep(node2, 2, query, 2, id),
            replicateData(),
            node1.query(`SELECT * FROM appointments WHERE apptid = '${id}';`)
        ]);

        //after should not read uncommitted data
        expect(before[0]).toEqual(after[0]);
    })

    it("Concurrent transactions in two or more nodes are writing (update / delete) the same data item.", async () => {
        const node1 = await connectNode(1);
        const node2 = await connectNode(2);
        
        await setIsolationLevel(node1, "SERIALIZABLE");
        await setIsolationLevel(node2, "SERIALIZABLE");

        const id = "00144FD5DFDE7EDCD23990B7F3576021";

        const query1 = {
            statement: "UPDATE appointments SET status = ? WHERE apptid = ?;",
            value: ["Queued", id],
            type: "UPDATE",
        }
        const query2 = {
            statement: "UPDATE appointments SET status = ? WHERE apptid = ?;",
            value: ["Skip", id],
            type: "UPDATE",
        }

        const [t1, t2, r] = await Promise.all([
            makeTransactionWithSleep(node1, 1, query1, 1, id),
            replicateData(),
            makeTransactionWithSleep(node2, 2, query2, 2, id),
            replicateData(),
        ]);


        const res1 = await node1.query(`SELECT * FROM appointments WHERE apptid = '${id}';`);
        const res2 = await node2.query(`SELECT * FROM appointments WHERE apptid = '${id}';`);

        console.log(res1[0])
        console.log(res2[0])
        //last writer wins
        expect(res1[0].some(appointment => appointment.status === 'Skip')).toBe(true);
        expect(res2[0].some(appointment => appointment.status === 'Skip')).toBe(true);
    })
})