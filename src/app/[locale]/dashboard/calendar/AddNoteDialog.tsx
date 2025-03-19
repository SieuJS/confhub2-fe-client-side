// AddNoteDialog.tsx
import React, { useState, useEffect } from 'react';
import { CalendarEvent } from './Calendar'; // Import
import Image from 'next/image';


interface AddNoteDialogProps {
  date: Date;
  onClose: () => void;
  onSave: (note: string, eventType: 'Event' | 'Task' | 'Appointment') => void;
  event?: CalendarEvent | null; // Optional event prop
  eventDetails?: any | null; // Optional event details
  loadingDetails?: boolean;
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({ date, onClose, onSave, event, eventDetails, loadingDetails }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<'Event' | 'Task' | 'Appointment'>('Event');

  // Update state when the event prop changes (for editing)
    useEffect(() => {
        if (event) {
            setTitle(event.title || ''); // Use title if available
            setEventType(event.type as 'Event' | 'Task' | 'Appointment');
             // You might set other fields here, like description, based on your event data
        } else {
            // Reset to defaults when adding a new note
            setTitle('');
            setDescription('');
            setEventType('Event');
        }
    }, [event]);

  const handleSave = () => {
    onSave(title, eventType); // Still pass title and type
    onClose();
  };

  const handleDelete = () => {
        // Implement your delete logic here.  You'll likely need a way
        // to identify the event to delete (e.g., using a unique ID).
        // You might need an `onDelete` prop similar to `onSave`.
        console.log("Delete event:", event);
        onClose();
    };

  const renderAddEditView = () => {
        return (
            <>
                <h2 className="text-lg font-semibold mb-4">{event ? 'Edit Event' : 'Add title and time'}</h2>
                <div className="flex mb-4">
                    <button
                        className={`px-4 py-2 rounded-l-md ${eventType === 'Event' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setEventType('Event')}
                    >
                        Event
                    </button>
                    <button
                        className={`px-4 py-2 ${eventType === 'Task' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setEventType('Task')}
                    >
                        Task
                    </button>
                    <button
                        className={`px-4 py-2 rounded-r-md ${eventType === 'Appointment' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setEventType('Appointment')}
                    >
                        Appointment schedule
                    </button>
                </div>
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Add title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                 <div className="mb-4">
                    <div className="text-sm text-gray-600">
                        {date.toLocaleString()}
                    </div>
                </div>

                <div className="mb-4">
                    <div className="text-sm text-gray-500">Add guests (Placeholder)</div>
                </div>
                <div className="mb-4">
                    <div className="text-sm text-gray-500">Add Google Meet video conferencing (Placeholder)</div>
                </div>
                <div className="mb-4">
                    <div className="text-sm text-gray-500">Add location (Placeholder)</div>
                </div>
                 <div className="mb-4">
                    <textarea
                        placeholder="Add description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                 <div className="mb-4">
                    <div className="text-sm text-gray-500">Work to do (Placeholder)</div>
                </div>
                <div className="flex justify-end">
                     {event && (
                        <button
                            className="px-4 py-2 text-red-500 hover:text-red-700 mr-2"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                     )}
                    <button
                        className="px-4 py-2 text-blue-500 hover:text-blue-700"
                        //onClick={onMoreOptions}
                    >
                        More options
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ml-2"
                        onClick={handleSave}
                        disabled={!title}
                    >
                        Save
                    </button>
                </div>
            </>
        )
    }
    const renderEventDetailView = () => {
     if (loadingDetails) {
            return <div>Loading conference details...</div>;
        }
        if (!event || !eventDetails) return null;

        return (
            <div>
                <h3 className="text-lg font-semibold text-teal-700 mb-2">{eventDetails.conference.title}</h3>
                <p className="text-gray-700 mb-2">Acronym: {eventDetails.conference.acronym}</p>
                <p className="text-gray-700 mb-2">
                Location: {eventDetails.locations.cityStateProvince}, {eventDetails.locations.country}
                </p>
                {/* Display important dates */}
                {eventDetails.dates && eventDetails.dates.length > 0 && (
                    <div className="mb-2">
                    <h4 className="font-medium">Important Dates:</h4>
                    <ul>
                        {eventDetails.dates.map((date: any, index: any) => (
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
                    <p className="text-gray-700 mb-2">{eventDetails.organization.topics.join(', ')}</p>
                </div>


                <div className="mb-4">
                <a href={eventDetails.organization.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center">
                    <Image src="/images/link-icon.svg" alt="More Details" width={14} height={14} className="mr-1" />
                    More details
                </a>
                </div>
                <div className="flex justify-between">
                    <button onClick={handleDelete} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Delete
                    </button>
                </div>
            </div>
        );
    };

  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
      <button
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
        onClick={onClose}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {event ? (event.conferenceId ? renderEventDetailView() : renderAddEditView()) : renderAddEditView()}
    </div>
  );
};

export default AddNoteDialog;