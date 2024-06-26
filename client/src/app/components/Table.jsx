import React, { useEffect, useState }from 'react';
import TableRow from './TableRow';
import {Spinner} from 'flowbite-react';

export default function Table() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const fetchData = () => {
        fetch("http://localhost:5000/api/view")
          .then(res => res.json())
          .then(data => {
            setLoading(false);
            setAppointments(data);
          });
      };
    
      useEffect(() => {
        fetchData();
    }, []);

      const handleUpdate = async () => {
        window.location.reload();
      };

  return (

    <>
        {loading ? 
        
        <div className='w-full flex flex-col justify-center items-center p-4'>
            <Spinner aria-label="Extra large spinner example" size="xl" />
            <p className='text-2xl mt-4'>Fetching data appointments...</p>
            </div>
        : (


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
                            Type
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
                    regionname={appointment.regionname}
                    status={appointment.status}
                    timequeued={appointment.timequeued}
                    queuedate={appointment.queuedate}
                    starttime={appointment.starttime}
                    endtime={appointment.endtime}
                    apptType={appointment.type}
                    onUpdate={handleUpdate}
                />
            ))}
                            
                </tbody>
            </table>



        )}
       
    
    </>
    
  )
}
