const { performTransactionTest } = require("../utils/transactions.js");
const { searchAppointment } = require("../utils/db.js");
const { connectNode } = require("../utils/nodes.js");

const SECONDS = 1000;
jest.setTimeout(10 * SECONDS);

describe("Concurrency", () => {
  const appointment = {
    pxid: "karera",
    clinicid: "salamin",
    regionname: "National Capital Region (NCR)",
    status: "Skip",
    timequeued: "08/18/2018 08:11 AM",
    queuedate: "08/18/2018 08:11 AM",
    starttime: "",
    endtime: "",
    type: "Consultation",
    apptid: "test",
  };
  const appointment2 = {
    pxid: "buhay ay di karera",
    clinicid: "salamin",
    regionname: "National Capital Region (NCR)",
    status: "Skip",
    timequeued: "08/18/2018 08:11 AM",
    queuedate: "08/18/2018 08:11 AM",
    starttime: "",
    endtime: "",
    type: "Consultation",
    apptid: "test",
  };

  it("Concurrent transactions in two or more nodes are reading the same data item.", async () => {
    const node1 = await connectNode(1);
    const node2 = await connectNode(2);

    const [r1, r2] = await Promise.all([
      searchAppointment(appointment, node1),
      searchAppointment(appointment, node2),
    ]);

    expect(r1[0]).toEqual(r2[0]);
    await node1.release();
    await node2.release();
  });

  it("At least one transaction in the three nodes is writing (update / delete) and the other concurrent transactions are reading the same data item.", async () => {
    const node1 = await connectNode(1);
    const node2 = await connectNode(2);

    //if current data item looks the same as the one to be updated, make the soon to be data item different
    if (appointment.clinicid === "salamin") {
      appointment.clinicid = "sa dingding nasaan na ang pagibig";
    }

    const before = await searchAppointment(appointment, node2);

    const [transactionResult, after] = await Promise.all([
      performTransactionTest(appointment, "UPDATE", node2),
      searchAppointment(appointment, node1),
    ]);

    //after should not read uncommitted data
    expect(before[0]).toEqual(after[0]);
  });

  it("Concurrent transactions in two or more nodes are writing (update / delete) the same data item.", async () => {
    const node1 = await connectNode(1);
    const node2 = await connectNode(2);

    const [t1, t2] = await Promise.all([
      performTransactionTest(appointment, "UPDATE", node1),
      new Promise((resolve) => setTimeout(resolve, 500)).then(() =>
        performTransactionTest(appointment2, "UPDATE", node2)
      ),
    ]);

    expect(t1.pxid).toBe("buhay ay di karera");
    expect(t2.pxid).toBe("buhay ay di karera");
  });
});
