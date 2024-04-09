import React, { FormEvent, useState } from 'react';
import { Modal, Button } from "flowbite-react";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import dayjs from 'dayjs';

export default function AddButton() {

    const [openModal, setOpenModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [successUpdModal, setSuccessUpdModal] = useState(false);
    const [apptID, setApptid] = useState('');
    const [pxID, setPxid] = useState('');
    const [clinicID, setClinicid] = useState('');
    const [regionName, setRegionName] = useState('');
    const [statusState, setStatusState] = useState('');


    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
  
         console.log('onSubmit function called');
  
         const formData = new FormData(event.target as HTMLFormElement);
  
         const serializedData: { [key: string]: any } = {};
       
         formData.forEach((value, key) => {
           serializedData[key] = value;
         });
       
          fetch('http://localhost:5000/api/insert', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(serializedData)
            })
            .then(response => {
              if(response.status == 200) {
                setOpenModal(false);
                
                setSuccessUpdModal(true);
  
                setTimeout(() => {
                  setSuccessUpdModal(false);
                  window.location.reload(); // Reload the page
                }, 1000);
              }
  
              return response.json()
            })
            .then(
              data => console.log(data)
              )
            .catch(error => console.error('Error:', error));
          
      }

        
      const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
      };
  return (
    <>
         <div onClick={() => setOpenModal(true)}  className="bg-emerald-400 p-2 rounded-md font-bold w-52 mb-10 hover:bg-emerald-500 text-center items-center flex justify-center cursor-pointer">
                        Add new appointment
                    </div>
        
                <Modal show={openModal} onClose={() => setOpenModal(false)}>
                    <Modal.Header className="bg-white"><span className='text-gray-900 font-bold'>Add Appointment</span></Modal.Header>
                    <Modal.Body className="bg-white">
                    <form id="editform" className="relative bg-white rounded-lg" onSubmit={onSubmit}>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-6 gap-6">
                        <div className="col-span-6">
                            <label htmlFor="apptid" className="block mb-2 text-sm font-medium text-gray-900">Appointment ID</label>
                            <input type="text" name="apptid" id="apptid" className="shadow-sm bg-gray-100 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5" value={apptID} onChange={(e) => setApptid(e.target.value)}  />
                        </div>
                       
                        <div className="col-span-6">
                            <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900">Status</label>
                            <select id="status" name="status" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" onChange={(e) => setStatusState(e.target.value)}  required>
                              <option value="Complete">Complete</option>
                              <option value="Queued">Queued</option>
                              <option value="Serving">Serving</option>
                              <option value="Cancel">Cancel</option>
                              <option value="Skip">Skip</option>
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
                              <option value="National Capital Region (NCR)">National Capital Region (NCR)</option>
                              <option value="Ilocos Region (I)">Ilocos Region (I)</option>
                              <option value="Cagayan Valley (II)">Cagayan Valley (II)</option>
                              <option value="Central Luzon (III)">Central Luzon (III)</option>
                              <option value="CALABARZON (IV-A)">CALABARZON (IV-A)</option>
                              <option value="MIMAROPA (IV-B)">MIMAROPA (IV-B)</option>
                              <option value="Bicol Region (V)">Bicol Region (V)</option>
                              <option value="Cordillera Administrative Region (CAR)">Cordillera Administrative Region (CAR)</option>
                              <option value="Western Visayas (VI)">Western Visayas (VI)</option>
                              <option value="Central Visayas (VII)">Central Visayas (VII)</option>
                              <option value="Eastern Visayas (VIII)">Eastern Visayas (VIII)</option>
                              <option value="Zamboanga Peninsula (IX)">Zamboanga Peninsula (IX)</option>
                              <option value="Northern Mindanao (X)">Northern Mindanao (X)</option>
                              <option value="Davao Region (XI)">Davao Region (XI)</option>
                              <option value="SOCCSKSARGEN (Cotabato Region) (XII)">SOCCSKSARGEN (Cotabato Region) (XII)</option>
                              <option value="Caraga (XIII)">Caraga (XIII)</option>
                              <option value="Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)">Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)</option>
                            </select>
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="timequeued" className="block mb-2 text-sm font-medium text-gray-900">Time Queued</label>
                            <DateTimePicker className='w-full'   name="timequeued"
                                onChange={handleDateChange}
                                />
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="queuedate" className="block mb-2 text-sm font-medium text-gray-900">Queue Date</label>
                            <DateTimePicker className='w-full' name="queuedate"
                                onChange={handleDateChange}
                                />
                        </div>
                        <div className="col-span-6">
                            <label htmlFor="starttime" className="block mb-2 text-sm font-medium text-gray-900">Start Time</label>
                            <DateTimePicker className='w-full' name='starttime'  
                                onChange={handleDateChange}
                                />                        
                            </div>
                        <div className="col-span-6">
                            <label htmlFor="endtime" className="block mb-2 text-sm font-medium text-gray-900">End Time</label>
                            <DateTimePicker className='w-full'  name='endtime'     
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

      <Modal show={successUpdModal} size="md" onClose={() => setSuccessUpdModal(false)} popup>
        <Modal.Header className="bg-white" />
        <Modal.Body className="bg-white">
          <div className="text-center">
            <IoMdCheckmarkCircleOutline className="mx-auto mb-4 h-14 w-14 text-green-500" />
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              Inserted successfully!
            </h3>
          </div>
        </Modal.Body>
      </Modal>
    </>
  )
}
