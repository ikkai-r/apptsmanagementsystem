import React, { useEffect, FormEvent, useState } from 'react';
import { Tooltip, Modal, Button } from "flowbite-react";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

import dayjs from 'dayjs';


export default function TableRow({ apptid, pxid, clinicid, doctorid, timequeued, queuedate, starttime, endtime, status, onUpdate}) {
    const [openModal, setOpenModal] = useState(false);
    const [sureModal, setSureModal] = useState(false);
    const [successDelModal, setSuccessDelModal] = useState(false);
    const [successUpdModal, setSuccessUpdModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    
    const handleDateChange = (newDate) => {
      setSelectedDate(newDate);
    };

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();

       console.log('onSubmit function called');

       const formData = new FormData(event.target as HTMLFormElement);

       const serializedData: { [key: string]: any } = {};
     
       formData.forEach((value, key) => {
         serializedData[key] = value;
       });
     
        fetch('http://localhost:5001/api/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(serializedData)
          })
          .then(response => {
            response.json()
            if(response.status == 200) {
              onUpdate();
              setOpenModal(false);
              
              setSuccessUpdModal(true);

              setTimeout(() => {
                setSuccessUpdModal(false);
              }, 1000);
            }
          })
          .then(
            data => console.log(data)
            )
          .catch(error => console.error('Error:', error));
        
    }

    async function onDelete(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

       console.log('onDelete function called');

       const formData = new FormData(event.target as HTMLFormElement);

       const serializedData: { [key: string]: any } = {};
     
       formData.forEach((value, key) => {
         serializedData[key] = value;
       });
     
        fetch('http://localhost:5001/api/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(serializedData)
          })
          .then(response => {
            response.json()
            if(response.status == 200) {
              
              onUpdate();
              setSureModal(false);
                            
              setSuccessDelModal(true);

              setTimeout(() => {
                setSuccessDelModal(false);
              }, 1000);
            }
          })
          .catch(error => console.error('Error:', error));
        
    }

    return (
    <tr className="bg-white border-b hover:bg-gray-50">
        
        <th scope="row" className="px-3 py-4 font-medium text-gray-900 whitespace-nowrap">
        <Tooltip content={apptid}>
         {apptid.substring(0, 25)}...
        </Tooltip>
        </th>   

        <td className="px-3 py-4 text-gray-900">
        <Tooltip content={pxid}>
         {pxid.substring(0, 25)}...  
        </Tooltip>   
        </td> 

        <td className="px-3 py-4 text-gray-900">
        <Tooltip content={clinicid}>
         {clinicid.substring(0, 25)}...  
        </Tooltip>   
        </td>

        <td className="px-3 py-4 text-gray-900">
        <Tooltip content={doctorid}>
         {doctorid.substring(0, 25)}...  
        </Tooltip>   
        </td> 

        <td className="px-3 py-4 text-gray-900">
            {status}
        </td>

        <td className="px-3 py-4 text-gray-900">
        {timequeued === null ? '' : timequeued.substring(0, 10) + ' ' + timequeued.substring(11, 19)}
        </td>

        <td className="px-3 py-4 text-gray-900">
        {queuedate === null ? '' : queuedate.substring(0, 10) + ' ' + queuedate.substring(11, 19)}
        </td>
        <td className="px-3 py-4 text-gray-900">
        {starttime === null ? '' : starttime.substring(0, 10) + ' ' + starttime.substring(11, 19)}
        </td>
        <td className="px-3 py-4 text-gray-900">
        {endtime === null ? '' : endtime.substring(0, 10) + ' ' + endtime.substring(11, 19)}
        </td>
        <td className="flex  gap-4 px-3 py-4 justify-center items-center">
            <a href="#" onClick={() => setOpenModal(true)} className="font-medium text-blue-600 hover:underline">Edit</a>
            <a href="#" onClick={() => setSureModal(true)} className="font-medium text-red-600 hover:underline">Remove</a>
        </td>
    

    <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header className="bg-white"><span className='text-gray-900 font-bold'>Edit Appointment</span></Modal.Header>
        <Modal.Body className="bg-white">
        <form id="editform" className="relative bg-white rounded-lg" onSubmit={onSubmit}>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6">
                            <label htmlFor="apptid" className="block mb-2 text-sm font-medium text-gray-900">Appointment ID</label>
                            <input disabled type="text" className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={apptid} required/>
                            <input style={{'display': 'none'}} type="text" name="apptid" id="apptid" className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={apptid} required/>
                        </div>
                       
                        <div className="col-span-6">
                            <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900">Status</label>
                            <select id="status" name="status" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required>
                              <option value="Complete" selected={status === 'Complete'}>Complete</option>
                              <option value="Queued" selected={status === 'Queued'}>Queued</option>
                              <option value="Serving" selected={status === 'Serving'}>Serving</option>
                              <option value="Cancel" selected={status === 'Cancel'}>Cancel</option>
                              <option value="Skip" selected={status === 'Skip'}>Skip</option>
                            </select>
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="pxid" className="block mb-2 text-sm font-medium text-gray-900">Patient ID</label>
                            <input type="text" name="pxid" id="pxid" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={pxid} required/>
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="clinicid" className="block mb-2 text-sm font-medium text-gray-900">Clinic ID</label>
                            <input type="text" name="clinicid" id="clinicid" value={clinicid} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" required/>
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="doctorid" className="block mb-2 text-sm font-medium text-gray-900">Doctor ID</label>
                            <input type="text" name="doctorid" id="doctorid" value={doctorid} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" required/>
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="timequeued" className="block mb-2 text-sm font-medium text-gray-900">Time Queued</label>
                            <DateTimePicker className='w-full'   name="timequeued"
                                value={timequeued && dayjs(timequeued)}                     
                                onChange={handleDateChange}
                                />
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="queuedate" className="block mb-2 text-sm font-medium text-gray-900">Queue Date</label>
                            <DateTimePicker className='w-full' name="queuedate"
                                value={queuedate && dayjs(queuedate)}                               
                                onChange={handleDateChange}
                                />
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="starttime" className="block mb-2 text-sm font-medium text-gray-900">Start Time</label>
                            <DateTimePicker className='w-full' name='starttime'  
                              value={starttime && dayjs(starttime)}                    
                                onChange={handleDateChange}
                                />                        
                            </div>
                        <div className="col-span-6">
                            <label htmlFor="endtime" className="block mb-2 text-sm font-medium text-gray-900">End Time</label>
                            <DateTimePicker className='w-full'  name='endtime'     
                           value={endtime && dayjs(endtime)}                          
                                onChange={handleDateChange}
                                />
                        </div>
                    </div>
                </div>
                <div className='w-full flex gap-5 p-6'>
                <Button color="green" type='submit'>Save</Button>
                <Button color="red" onClick={() => setOpenModal(false)}>
                  Discard
                </Button>
                </div>
                </form>
        </Modal.Body>
      </Modal>

      <Modal show={sureModal} size="md" onClose={() => setSureModal(false)} popup>
        <Modal.Header className="bg-white" />
        <Modal.Body className="bg-white">
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              Are you sure you want to delete this product?
            </h3>
            <div className="flex justify-center gap-4">
              <form id='deleteform' onSubmit={onDelete}>
              <input style={{'display': 'none'}} type="text" name="apptid" id="apptid" className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={apptid} required/>
                <Button color="failure" type='submit'>
                  {"Yes, I'm sure"}
                </Button>
              </form>
              <Button color="gray" onClick={() => setSureModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={successDelModal} size="md" onClose={() => setSuccessDelModal(false)} popup>
        <Modal.Header className="bg-white" />
        <Modal.Body className="bg-white">
          <div className="text-center">
            <IoMdCheckmarkCircleOutline className="mx-auto mb-4 h-14 w-14 text-green-500" />
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              Deleted successfully!
            </h3>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={successUpdModal} size="md" onClose={() => setSuccessUpdModal(false)} popup>
        <Modal.Header className="bg-white" />
        <Modal.Body className="bg-white">
          <div className="text-center">
            <IoMdCheckmarkCircleOutline className="mx-auto mb-4 h-14 w-14 text-green-500" />
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              Updated successfully!
            </h3>
          </div>
        </Modal.Body>
      </Modal>


    </tr>
  )
}
