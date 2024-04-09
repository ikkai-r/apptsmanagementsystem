import { Tooltip } from "flowbite-react";

export default function QueryRow({apptid, pxid, clinicid, regionname, timequeued, queuedate, starttime, endtime, status,}) {
    return(
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
        </tr>
    )
}