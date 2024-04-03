import React, { useEffect, useState }from 'react'
import TableRow from './TableRow'

export default function Table() {

    const [appointments, setAppointments] = useState([]);

    const fetchData = () => {
        fetch("http://localhost:5002/api/view")
          .then(res => res.json())
          .then(data => {
            if (JSON.stringify(data) !== JSON.stringify(appointments)) {
                console.log('database changed');
                setAppointments(data);
            }
          });
      };
    
      useEffect(() => {
        fetchData();

        const intervalId = setInterval(fetchData, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

      const handleUpdate = () => {
        fetchData();
      };

  return (
    <table className="w-full text-sm text-left rtl:text-right text-gray-500  shadow-md">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50  ">
                    <tr>
                        <th scope="col" className="px-3 py-3">
                            Appointment ID
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Patient ID
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Clinic ID
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Doctor ID
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Status
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Time Queued
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Queue Date
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Start Time
                        </th>
                        <th scope="col" className="px-3 py-3">
                            End Time
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Action
                        </th>
                    </tr>
                </thead>
                <tbody>
                {appointments.map((appointment, index) => (
                <TableRow 
                    key={index}
                    apptid={appointment.apptid}
                    pxid={appointment.pxid}
                    clinicid={appointment.clinicid}
                    doctorid={appointment.doctorid}
                    status={appointment.status}
                    timequeued={appointment.timequeued}
                    queuedate={appointment.queuedate}
                    starttime={appointment.starttime}
                    endtime={appointment.endtime}
                    onUpdate={handleUpdate}
                />
            ))}
                            
                </tbody>
            </table>
  )
}
