import React, { FormEvent, useState } from 'react';
import { Button } from "flowbite-react";
import TableRow from './TableRow'

interface Appointment {
    apptid: string;
    pxid: string;
    clinicid: string;
    regionname: string;
    status: string;
    timequeued: string;
    queuedate: string;
    starttime: string;
    endtime: string;
    message: string;
}

export default function DevOptions() {
    const [appointment, setAppointment] = useState<Appointment | null>(null);

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
  
         console.log('Devoptions submit called function called');
  
         const formData = new FormData(event.target as HTMLFormElement);
  
         const serializedData: { [key: string]: any } = {};
       
         formData.forEach((value, key) => {
           serializedData[key] = value;
         });
       
          fetch('http://localhost:5000/api/submitDevOptions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(serializedData)
            })
            .then(response => {
             return response.json()    
            })
            .then(data => {
                if (JSON.stringify(data) !== JSON.stringify(appointment)) {
                    console.log('database changed');
                    setAppointment(data)
                }
             })
            .catch(error => console.error('Error:', error));
      }

    return(
        <div className='bg-zinc-200 rounded-md w-full px-10 p-5 mt-10'>
        <form id="devOptions" className="w-full px-10 pt-5" onSubmit={onSubmit}>
            <div className='text-gray-900 font-bold'>Dev Options</div>
                <label htmlFor="node" className="block mb-2 text-sm font-medium text-gray-900">Nodes</label>
                <select id="node" name="node" className=" text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required>
                    <option value="1" >Node 1</option>
                    <option value="2" >Node 2</option>
                    <option value="3" >Node 3</option>
                </select>
                <label htmlFor="query" className="block mb-2 text-sm font-medium text-gray-900">Query</label>
            <input type="text" name="query" id="query" className="shadow-sm text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" placeholder={"SELECT ..."}/>
            <Button className="my-5" color="green" type='submit'>Submit</Button>
        </form>
        {appointment && appointment.apptid && ( <table>
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 ">
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
                            Region Name
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
     
            <TableRow
                key={1}
                apptid={appointment.apptid}
                pxid={appointment.pxid}
                clinicid={appointment.clinicid}
                regionname={appointment.regionname}
                status={appointment.status}
                timequeued={appointment.timequeued}
                queuedate={appointment.queuedate}
                starttime={appointment.starttime}
                endtime={appointment.endtime}
                //bug 2
                onUpdate={null}
            />
    
        </tbody>
        </table>     )}

        {
            appointment && !appointment.apptid && (
                <p className='text-2xl bg-zinc-300 mt-5 rounded-md p-5'>No records found</p>
            )
        }
        </div>
    )
}

