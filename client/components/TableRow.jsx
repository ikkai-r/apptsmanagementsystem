import React, { useEffect, useState } from 'react';
import { Tooltip, Modal, Button } from "flowbite-react";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { HiOutlineExclamationCircle } from "react-icons/hi";
import dayjs from 'dayjs';


export default function TableRow({ apptid, pxid, clinicid, doctorid, timequeued, queuedate, starttime, endtime, status}) {
    const [openModal, setOpenModal] = useState(false);
    const [sureModal, setSureModal] = useState(false);

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
        <form className="relative bg-white rounded-lg">
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6">
                            <label for="apptid" className="block mb-2 text-sm font-medium text-gray-900">Appointment ID</label>
                            <input disabled type="text" name="apptid" id="apptid" className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={apptid} required=""/>
                        </div>
                        <div className="col-span-6">
                            <label for="status" className="block mb-2 text-sm font-medium text-gray-900">Status</label>
                            <select id="status" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" required="">
                              <option value="CO" selected={status === 'Complete'}>Complete</option>
                              <option value="QU" selected={status === 'Queued'}>Queued</option>
                              <option value="SE" selected={status === 'Serving'}>Serving</option>
                              <option value="CA" selected={status === 'Cancel'}>Cancel</option>
                              <option value="SK" selected={status === 'Skip'}>Skip</option>
                            </select>
                        </div>
                        <div className="col-span-6">
                            <label for="pxid" className="block mb-2 text-sm font-medium text-gray-900">Patient ID</label>
                            <input type="text" name="pxid" id="pxid" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={pxid} required=""/>
                        </div>
                        <div className="col-span-6">
                            <label for="clinicid" className="block mb-2 text-sm font-medium text-gray-900">Clinic ID</label>
                            <input type="text" name="clinicid" id="clinicid" value={clinicid} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" required=""/>
                        </div>
                        <div className="col-span-6">
                            <label for="doctorid" className="block mb-2 text-sm font-medium text-gray-900">Doctor ID</label>
                            <input type="text" name="doctorid" id="doctorid" value={doctorid} className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" required=""/>
                        </div>
                        <div className="col-span-6">
                            <label for="department" className="block mb-2 text-sm font-medium text-gray-900">Time Queued</label>
                            <DateTimePicker className='w-full'  
                                defaultValue={timequeued && dayjs(timequeued)}                     
                                onChange={(newValue) => setValue(newValue)}
                                />
                        </div>
                        <div className="col-span-6">
                            <label for="company" className="block mb-2 text-sm font-medium text-gray-900">Queue Date</label>
                            <DateTimePicker className='w-full'
                                defaultValue={queuedate && dayjs(queuedate)}                               
                                onChange={(newValue) => setValue(newValue)}
                                />
                        </div>
                        <div className="col-span-6">
                            <label for="current-password" className="block mb-2 text-sm font-medium text-gray-900">Start Time</label>
                            <DateTimePicker className='w-full'        
                              defaultValue={starttime && dayjs(starttime)}                    
                                onChange={(newValue) => setValue(newValue)}
                                />                        
                            </div>
                        <div className="col-span-6">
                            <label for="new-password" className="block mb-2 text-sm font-medium text-gray-900">End Time</label>
                            <DateTimePicker className='w-full'     
                           defaultValue={endtime && dayjs(endtime)}                          
                                onChange={(newValue) => setValue(newValue)}
                                />
                        </div>
                    </div>
                </div>

            </form>
        </Modal.Body>
        <Modal.Footer className="bg-white">
          <Button color="green" onClick={() => setOpenModal(false)}>Save</Button>
          <Button color="red" onClick={() => setOpenModal(false)}>
            Discard
          </Button>
        </Modal.Footer>
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
              <Button color="failure" onClick={() => setSureModal(false)}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setSureModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

    </tr>
  )
}
