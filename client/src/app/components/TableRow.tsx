import React, { FormEvent, useState } from 'react';
import { Tooltip, Modal, Button } from "flowbite-react";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";

import dayjs from 'dayjs';
import { error } from 'console';


export default function TableRow({ apptid, pxid, clinicid, regionname, timequeued, queuedate, starttime, endtime, status, apptType, onUpdate}) {
    const [openModal, setOpenModal] = useState(false);
    const [sureModal, setSureModal] = useState(false);
    const [errorModal, setErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);
    const [successDelModal, setSuccessDelModal] = useState(false);
    const [successUpdModal, setSuccessUpdModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [pxID, setPxid] = useState(pxid);
    const [clinicID, setClinicid] = useState(clinicid);
    const [regionName, setRegionName] = useState(regionname);
    const [statusState, setStatusState] = useState(status);

    
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
     
        fetch('http://localhost:5000/api/update', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(serializedData)
          })
          .then(async response => {
            if(response.status == 200) {
              onUpdate();
              setOpenModal(false);
              
              setSuccessUpdModal(true);

              setTimeout(() => {
                setSuccessUpdModal(false);
              }, 1000);
          } else if (response.status == 404 || response.status == 500) {

              const responseBody = await response.json();
              const errorMessage = responseBody.message;
              setOpenModal(false);

              setErrorMessage(errorMessage);
              setErrorModal(true);

              setTimeout(() => {
                setErrorModal(false);
              }, 1000);
          }

            return response.json()
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
     
        fetch('http://localhost:5000/api/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(serializedData)
          })
          .then(response => {
            if(response.status == 200) {
              
              onUpdate();
              setSureModal(false);
                            
              setSuccessDelModal(true);

              setTimeout(() => {
                setSuccessDelModal(false);
              }, 1000);
            }
            return response.json();
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
        {regionname}
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
        <td className="px-3 py-4 text-gray-900">
        {apptType}
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
                            <input disabled type="text" className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={apptid} readOnly  />
                            <input style={{'display': 'none'}} type="text" name="apptid" id="apptid" className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={apptid} required/>
                        </div>
                       
                        <div className="col-span-6">
                            <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900">Status</label>
                            <select id="status" name="status" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" onChange={(e) => setStatusState(e.target.value)}  required>
                              <option value="Complete" selected={status === 'Complete'}>Complete</option>
                              <option value="Queued" selected={status === 'Queued'}>Queued</option>
                              <option value="Serving" selected={status === 'Serving'}>Serving</option>
                              <option value="Cancel" selected={status === 'Cancel'}>Cancel</option>
                              <option value="Skip" selected={status === 'Skip'}>Skip</option>
                            </select>
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="type" className="block mb-2 text-sm font-medium text-gray-900">Type</label>
                            <select id="type" name="type" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" onChange={(e) => setRegionName(e.target.value)}  required>
                              <option value="Consultation" selected={apptType === 'Consultation'}>Consultation</option>
                              <option value="Inpatient" selected={apptType === 'Inpatient'}>Inpatient</option>
                            </select>
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="pxid" className="block mb-2 text-sm font-medium text-gray-900">Patient ID</label>
                            <input type="text" name="pxid" id="pxid" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={pxID} onChange={(e) => setPxid(e.target.value)} required  />
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="clinicid" className="block mb-2 text-sm font-medium text-gray-900">Clinic ID</label>
                            <input type="text" name="clinicid" id="clinicid" className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={clinicID} onChange={(e) => setClinicid(e.target.value)} required />
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="regionname" className="block mb-2 text-sm font-medium text-gray-900">Region Name</label>
                            <select id="regionname" name="regionname" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" onChange={(e) => setRegionName(e.target.value)}  required>
                              <option value="National Capital Region (NCR)" selected={status === 'National Capital Region (NCR)'}>National Capital Region (NCR)</option>
                              <option value="Ilocos Region (I)" selected={regionname === 'Ilocos Region (I)'}>Ilocos Region (I)</option>
                              <option value="Cagayan Valley (II)" selected={regionname === 'Cagayan Valley (II)'}>Cagayan Valley (II)</option>
                              <option value="Central Luzon (III)" selected={regionname === 'Central Luzon (III)'}>Central Luzon (III)</option>
                              <option value="CALABARZON (IV-A)" selected={regionname === 'CALABARZON (IV-A)'}>CALABARZON (IV-A)</option>
                              <option value="MIMAROPA (IV-B)" selected={regionname === 'MIMAROPA (IV-B)'}>MIMAROPA (IV-B)</option>
                              <option value="Bicol Region (V)" selected={regionname === 'Bicol Region (V)'}>Bicol Region (V)</option>
                              <option value="Cordillera Administrative Region (CAR)" selected={regionname === 'Cordillera Administrative Region (CAR)'}>Cordillera Administrative Region (CAR)</option>
                              <option value="Western Visayas (VI)" selected={regionname === 'Western Visayas (VI)'}>Western Visayas (VI)</option>
                              <option value="Central Visayas (VII)" selected={regionname === 'Central Visayas (VII)'}>Central Visayas (VII)</option>
                              <option value="Eastern Visayas (VIII)" selected={regionname === 'Eastern Visayas (VIII)'}>Eastern Visayas (VIII)</option>
                              <option value="Zamboanga Peninsula (IX)" selected={regionname === 'Zamboanga Peninsula (IX)'}>Zamboanga Peninsula (IX)</option>
                              <option value="Northern Mindanao (X)" selected={regionname === 'Northern Mindanao (X)'}>Northern Mindanao (X)</option>
                              <option value="Davao Region (XI)" selected={regionname === 'Davao Region (XI)'}>Davao Region (XI)</option>
                              <option value="SOCCSKSARGEN (Cotabato Region) (XII)" selected={regionname === 'SOCCSKSARGEN (Cotabato Region) (XII)'}>SOCCSKSARGEN (Cotabato Region) (XII)</option>
                              <option value="Caraga (XIII)" selected={regionname === 'Caraga (XIII)'}>Caraga (XIII)</option>
                              <option value="Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)" selected={regionname === 'Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)'}>Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)</option>
                            </select>
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
              Are you sure you want to delete this appointment?
            </h3>
            <div className="flex justify-center gap-4">
              <form id='deleteform' onSubmit={onDelete}>
              <input style={{'display': 'none'}} type="text" name="apptid" id="apptid" className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={apptid} required/>
              <input style={{'display': 'none'}} type="text" name="regionname" id="regionname" className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={regionname} required/>
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

      <Modal show={errorModal} size="md" onClose={() => setErrorModal(false)} popup>
        <Modal.Header className="bg-white" />
        <Modal.Body className="bg-white">
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              {errorMessage} Please try again.
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
