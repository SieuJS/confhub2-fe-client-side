// DayNote.tsx
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ConferenceResponse } from '../../../models/response/conference.response'; // Adjust path as needed
import { getConference } from '../../../api/getConference/getConferenceDetails';
import AddNoteDialog from './calendar/AddNoteDialog'; // Import the new component


export interface CalendarEvent {
  day: number;
  month: number;
  year: number;
  startHour?: number;
  startMinute?: number;
  type: string;
  conference: string;
  conferenceId: string; // Add conferenceId
  title?: string; // Add title property
}

interface DayNoteProps {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
  onAddEvent?: (newEvent: CalendarEvent) => void; // New prop for adding events
}

const DayNote: React.FC<DayNoteProps> = ({ date, events, onClose, onAddEvent }) => {
  const dayOfWeekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayOfWeekNames[date.getDay()];
  const dateString = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [selectedEventDetail, setSelectedEventDetail] = useState<ConferenceResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false); // Loading state
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false); // State for showing the AddNoteDialog

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleBackToList = () => {
    setSelectedEventDetail(null);
  };

  const handleEventClick = async (event: CalendarEvent) => {
    // Fetch detailed conference information
    try {
        setLoadingDetails(true); // Start loading
        const conferenceDetails = await getConference(event.conferenceId); // Fetch
        setSelectedEventDetail(conferenceDetails);
      } catch (error) {
        console.error("Failed to fetch conference details:", error);
        setSelectedEventDetail(null);
      } finally {
          setLoadingDetails(false);
      }
  };

  const handleUpdateNote = () => {
    console.log("Update note clicked"); // Placeholder for update logic
  };

  const handleDeleteNote = () => {
    console.log("Delete note clicked"); // Placeholder for delete logic
    onClose();
  };

  const handleAddNoteClick = () => {
        setShowAddNoteDialog(true); // Show the AddNoteDialog
    };
   const handleSaveNote = (title: string, eventType: 'Event' | 'Task' | 'Appointment') => {
        const newEvent: CalendarEvent = {
            day: date.getDate(),
            month: date.getMonth() + 1, // Month is 0-indexed
            year: date.getFullYear(),
            type: eventType, // Or however you categorize notes
            conference: '', //  conference name for custom notes
            conferenceId: '', //conferenceId for custom note
            title: title
        };
        onAddEvent && onAddEvent(newEvent);
        console.log('Saving note:', title); // Placeholder: Replace with actual save logic

    };
  const renderEventList = () => {
    return (
      <>
        <div className="mb-4 text-sm text-gray-600">
          {events.length} notes
        </div>
        <ul>
          {events.map((event, index) => (
            <li
              key={index}
              className="py-2 border-b border-gray-200 last:border-b-0 flex justify-between items-center cursor-pointer hover:bg-gray-50"
              onClick={() => handleEventClick(event)}
            >
              <div>
                {/*Display title, if have*/}
                {event.title && (
                    <div className="text-gray-700 text-sm">
                      <span className="font-medium mr-2">Title:</span> {event.title}
                    </div>
                  )}
                <div className="flex text-gray-700 text-sm">
                  <span className="font-medium mr-2">Date type:</span> {event.type}
                </div>
                <div className="flex text-gray-700 text-sm">
                  <span className="font-medium mr-2">Conference:</span> {event.conference}
                </div>
              </div>
              <button className="text-blue-500 hover:text-blue-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </li>
          ))}
          {events.length === 0 && (
            <li className="py-2 text-center text-gray-500">
              No events for this day.
            </li>
          )}
        </ul>
        {/*Add button + */}
         <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddNoteClick}
              className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
            >
              +
            </button>
          </div>
      </>
    );
  };

  const renderEventDetail = () => {
    if (!selectedEventDetail) return null;

    if (loadingDetails) {
        return <div>Loading conference details...</div>; // Show loading indicator
    }

    return (
      <div>
        <h3 className="text-lg font-semibold text-teal-700 mb-2">{selectedEventDetail.conference.title}</h3>
        <p className="text-gray-700 mb-2">Acronym: {selectedEventDetail.conference.acronym}</p>
        <p className="text-gray-700 mb-2">
          Location: {selectedEventDetail.locations.cityStateProvince}, {selectedEventDetail.locations.country}
        </p>
        {/* Display important dates */}
        {selectedEventDetail.dates && selectedEventDetail.dates.length > 0 && (
            <div className="mb-2">
            <h4 className="font-medium">Important Dates:</h4>
            <ul>
                {selectedEventDetail.dates.map((date, index) => (
                <li key={index} className="text-gray-700">
                    {date.name}: {new Date(date.fromDate).toLocaleDateString()} -{' '}
                    {new Date(date.toDate).toLocaleDateString()}
                </li>
                ))}
            </ul>
            </div>
        )}

        <div className="mb-2">
            <h4 className="font-medium">Topics:</h4>
            <p className="text-gray-700 mb-2">{selectedEventDetail.organization.topics.join(', ')}</p>
        </div>


        <div className="mb-4">
          <a href={selectedEventDetail.organization.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center">
             <Image src="/images/link-icon.svg" alt="More Details" width={14} height={14} className="mr-1" />
            More details
          </a>
        </div>
        <div className="flex justify-between">
          <button onClick={handleDeleteNote} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Delete
          </button>
          <button onClick={handleUpdateNote} className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Update note
          </button>
        </div>
      </div>
    );
  };


  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md" ref={dialogRef}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">All events in {dayName}, {dateString}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

         {selectedEventDetail ? renderEventDetail() : renderEventList()}
        {/* Conditionally render AddNoteDialog */}
        {showAddNoteDialog && (
          <AddNoteDialog
            date={date}
            onClose={() => setShowAddNoteDialog(false)}
            onSave={handleSaveNote}
          />
        )}
      </div>
    </div>
  );
};

export default DayNote;