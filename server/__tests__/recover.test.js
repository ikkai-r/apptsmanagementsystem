const { performTransactionTest } = require("../utils/transactions.js");
const { connectNode } = require("../utils/nodes.js");
const { searchAppointment} = require("../utils/db.js");
const {syncCentralNode, syncOtherNodes} = require("../sync.js");

const SECONDS = 1000;
jest.setTimeout(10 * SECONDS);


describe("Global Recovery", () => {
    const appointment = {
        pxid: "90ED6B86F6B4376D1C875EA826020495",
        clinicid: "98C56BCE74669E2E4E7A9FC1CAA8C326",
        regionname: "National Capital Region (NCR)",
        status: "Queued",
        timequeued: "08/18/2018 08:11 AM",
        queuedate: "08/18/2018 08:11 AM",
        starttime: "",
        endtime: "",
        type: "Consultation",
        apptid: "FFEDFBBFD6D0A5740E91C868BA57C573",
      };

    it("The central node is unavailable during the execution of a transaction and then eventually comes back online", async () => {
        const node1 = null;
        const node2 = await connectNode(2);

        const statement = await searchAppointment(appointment, node2);
        //if current data item looks the same as the one to be updated, make the soon to be data item different
        if (statement.clinicid === "98C56BCE74669E2E4E7A9FC1CAA8C326") {
            appointment.clinicid = "NEW98C56BCE74669E2E4E7A9FC1CAA8C326";
        }

        const [t1] = await Promise.all([
            performTransactionTest(appointment, "UPDATE", node2, node1, 1),
        ]);

        await syncCentralNode();
        const result = await searchAppointment(appointment, await connectNode(1));
        expect(result.clinicid).toEqual(appointment.clinicid);
    });

    it("Node 2 or Node 3 is unavailable during the execution of a transaction and then eventually comes back online", async () => {
        const node2 = null;
        const node1 = await connectNode(1)
     
        const statement = await searchAppointment(appointment, node1);
        // if current data item looks the same as the one to be updated, make the soon to be data item different
        if (statement.clinicid === "98C56BCE74669E2E4E7A9FC1CAA8C326") {
            appointment.clinicid = "NEW98C56BCE74669E2E4E7A9FC1CAA8C326";
        }

        const [t1] = await Promise.all([
            performTransactionTest(appointment, "UPDATE", node2, node1, 2),
        ]);

        //node1 connection open in the function
        await syncOtherNodes(2);

        const result = await searchAppointment(appointment, await connectNode(2)); 
        expect(result.clinicid).toEqual(appointment.clinicid);
        console.log(result)
    })
})