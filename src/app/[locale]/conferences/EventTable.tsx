// src/components/conferences/EventTable.tsx
import React from 'react';
import { ConferenceInfo } from '../../../models/response/conference.list.response';

interface EventTableProps {
  events: ConferenceInfo[];
}

const EventTable: React.FC<EventTableProps> = ({ events }) => {
  const formatDateRange = (fromDate: string | undefined, toDate: string | undefined) => {
    if (!fromDate || !toDate) return 'TBD';
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Invalid Date';
    }
    if (startDate.toDateString() === endDate.toDateString()) {
       return startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return `${startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
  };


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Access Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Topics
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {events.map((event) => (
            <tr key={event.id}>
              <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium text-gray-900">
                {event.title} {event.acronym && `(${event.acronym})`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-500">
                {formatDateRange(event.dates.fromDate, event.dates.toDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-500">
                {event.location.cityStateProvince && `${event.location.cityStateProvince}, `}{event.location.country}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-500">
               {event.rankSourceFoRData?.rank || 'Unranked'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-500">
                {event.accessType}
              </td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-500">
                {event.topics.slice(0,3).join(', ')}{event.topics.length > 3 ? ` +${event.topics.length - 3} more`: ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventTable;