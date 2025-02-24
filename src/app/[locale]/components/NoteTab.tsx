// NoteTab.tsx
import React from 'react';
import Image from 'next/image';
import Calendar from './Calendar'; // Import the Calendar component
import { CalendarEvent } from './DayNote'; // Import CalendarEvent from DayNote.tsx


interface NoteTabProps {
  // Định nghĩa props cho component nếu cần
}


const NoteTab: React.FC<NoteTabProps> = () => {
  // Mock data for upcoming notes (replace with actual data fetching later)
  const upcomingNotes = [
    {
      type: 'Conference date',
      conference: 'ICSoft',
      location: 'Dijon, France',
      date: 'Mon, 2024/07/08 - Wed, 2024/07/10',
      countdown: '4d 14h 26m 8s',
    },
    {
      type: 'Notification of Acceptance',
      conference: 'CAINE',
      location: 'Hilton San Diego Airport/Harbor Island, San Diego, California, USA',
      date: 'Sat, 2024/07/20 - Sat, 2024/07/20',
      countdown: '16d 14h 26m 8s',
    },
  ];

  // Mock data for calendar events (replace with actual data fetching later)
  const calendarEvents: CalendarEvent[] = [
    { day: 30, month: 6, year: 2024, type: 'Submission date', conference: 'CAINE - Full Paper' }, // June is 6 (1-indexed in data)
    { day: 1, month: 7, year: 2024, type: 'Conference date', conference: 'ED-MEDIA - Conference date' },
    { day: 1, month: 7, year: 2024, type: 'Submission date', conference: 'SENSYS - Paper Sub' },
    { day: 4, month: 7, year: 2024, type: 'Notification date', conference: 'SSS - Second Dez' },
    { day: 8, month: 7, year: 2024, type: 'Conference date', conference: 'ICSoft - Conference date' },
    { day: 8, month: 7, year: 2024, type: 'Conference date', conference: 'DM - Conference date' },
    { day: 20, month: 7, year: 2024, type: 'Notification date', conference: 'CAINE - Notificati' },
    { day: 1, month: 7, year: 2024, type: 'Conference date', conference: 'ICAC - Conference date' },
    { day: 1, month: 7, year: 2024, type: 'Conference date', conference: 'ISCA - Conference date' },
    { day: 1, month: 7, year: 2024, type: 'Conference date', conference: 'SSS - Second Dez' }, // Example of overlapping events on the same day
  ];


  return (
    <div className="flex flex-col lg:flex-row h-full p-4 bg-gray-100">
      {/* Left side - Upcoming Notes and Calendar */}
      <div className="lg:w-3/4 flex flex-col">
        {/* Upcoming Notes */}
        <section className="mb-8 p-4 bg-white rounded-md shadow">
          <h2 className="text-lg font-semibold mb-4">Upcoming Notes</h2>
          <p className="text-gray-600 mb-4">Save important dates for the conferences you have followed.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            {upcomingNotes.map((note, index) => (
              <div key={index} className="w-full sm:w-auto p-4 rounded-md shadow border">
                <h3 className="font-semibold text-gray-800">{note.type}</h3>
                <p className="text-sm text-gray-700">Conference: {note.conference}</p>
                <div className="flex items-center text-sm text-gray-700 mt-1">
                  <Image src="/images/location-pin.svg" alt="Location" width={12} height={12} className="mr-1" />
                  <span>{note.location}</span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{note.date}</p>
                <div className="flex items-center mt-2">
                  <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">{note.countdown}</div>
                  <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs">More details </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Calendar */}
        <Calendar calendarEvents={calendarEvents} />
      </div>

      {/* Right side - Color notes of date and Conference note details */}
      <div className="lg:w-1/4 lg:ml-8 p-4 bg-white rounded-md shadow h-fit">


        <section>
          <h2 className="text-lg font-semibold mb-3">Conference note details</h2>
          <ul>
             <li className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
              <span className="text-gray-700 text-sm">Submission date</span>
            </li>
            <li className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-gray-700 text-sm">Notification date</span>
            </li>
            <li className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-gray-700 text-sm">Camera ready date</span>
            </li>
            <li className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-teal-500 mr-2"></div>
              <span className="text-gray-700 text-sm">Conference date</span>
            </li>
            <li className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-cyan-500 mr-2"></div>
              <span className="text-gray-700 text-sm">Your note</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default NoteTab;