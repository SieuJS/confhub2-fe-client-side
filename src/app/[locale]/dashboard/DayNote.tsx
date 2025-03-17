// DayNote.tsx
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ConferenceResponse } from '../../../models/response/conference.response'; // Adjust path as needed
import { getConference } from '../../../api/getConference/getConferenceDetails';

export interface CalendarEvent {
  day: number;
  month: number;
  year: number;
  type: string;
  conference: string;
  conferenceId: string; // Add conferenceId
}

interface DayNoteProps {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
}

const DayNote: React.FC<DayNoteProps> = ({ date, events, onClose }) => {
  const dayOfWeekNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = dayOfWeekNames[date.getDay()];
  const dateString = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [selectedEventDetail, setSelectedEventDetail] = useState<ConferenceResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false); // Loading state

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

  const handleAddNoteClick = () => {
    setIsAddingNote(true);
    setSelectedEventDetail(null);
  };

  const handleBackToList = () => {
    setIsAddingNote(false);
    setSelectedEventDetail(null);
  };

  const handleEventClick = async (event: CalendarEvent) => {
    // Fetch detailed conference information
    try {
        setLoadingDetails(true); // Start loading
        const conferenceDetails = await getConference(event.conferenceId); // Fetch
        setSelectedEventDetail(conferenceDetails);
        setIsAddingNote(false);
      } catch (error) {
        console.error("Failed to fetch conference details:", error);
        // Handle the error, maybe set an error state and display a message.
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
          {events.length === 0 && !isAddingNote && (
            <li className="py-2 text-center text-gray-500">
              No events for this day.
            </li>
          )}
        </ul>
        {!isAddingNote && !selectedEventDetail && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddNoteClick}
              className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline"
            >
              +
            </button>
          </div>
        )}
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

  const renderAddNoteView = () => {
    // Placeholder for adding custom notes functionality (future implementation)
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Add New Note for {dateString}</h3>
        <textarea className="w-full h-32 border p-2 rounded mb-4" placeholder="Enter your note here"></textarea>
        <div className="flex justify-end gap-2">
          <button onClick={handleBackToList} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Back
          </button>
          <button className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-700">Add</button>
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

        {isAddingNote ? renderAddNoteView() : selectedEventDetail ? renderEventDetail() : renderEventList()}
      </div>
    </div>
  );
};

export default DayNote;