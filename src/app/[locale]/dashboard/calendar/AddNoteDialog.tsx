// AddNoteDialog.tsx
import React, { useState } from 'react';

interface AddNoteDialogProps {
  date: Date;
  onClose: () => void;
  onSave: (note: string, eventType: 'Event' | 'Task' | 'Appointment') => void; // Add onSave
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({ date, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<'Event' | 'Task' | 'Appointment'>('Event'); // Default to Event

  const handleSave = () => {
      onSave(title, eventType);
      onClose();
    };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={onClose}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-4">Add title</h2>

        {/* Event Type Tabs */}
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

        {/* Title Input */}
        <div className="mb-4">
           <input
                type="text"
                placeholder="Add title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        {/* Time */}
        <div className="mb-4">
          <div className="text-sm text-gray-600">
             {date.toLocaleString()} {/* Display formatted date */}
          </div>

        </div>

        {/* Add Guests, Conferencing, Location, Description (Placeholders) */}
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
        {/* Save and More Options Buttons */}
        <div className="flex justify-end">
          <button
            className="px-4 py-2 text-blue-500 hover:text-blue-700"
            //onClick={onMoreOptions}  // Removed 'onMoreOptions' as it's not defined
          >
            More options
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ml-2"
            onClick={handleSave}
            disabled={!title} // Disable if no title
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNoteDialog;