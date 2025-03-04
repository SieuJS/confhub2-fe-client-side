// ConferenceForm.tsx
import React, { useState } from 'react';
import Button from '../utils/Button';
import { ConferenceResponse } from '../../../../models/response/conference.response'; // Import ConferenceResponse

// Replace interface Conference with type Conference = ConferenceResponse
type Conference = ConferenceResponse;

interface ConferenceFormProps {
  onAdd: (conferenceData: Conference) => void;
  onClose: () => void;
}

const ConferenceForm: React.FC<ConferenceFormProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [acronym, setAcronym] = useState('');
  const [link, setLink] = useState('');
  const [topics, setTopics] = useState<string[]>([]); // Renamed from fieldsOfResearch to topics
  const [newTopic, setNewTopic] = useState(''); // Renamed from newFieldOfResearch to newTopic
  const [type, setType] = useState<Conference['type']>('offline');
  const [location, setLocation] = useState(''); // Using string for location as in ConferenceResponse
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [notificationDate, setNotificationDate] = useState('');
  const [description, setDescription] = useState(''); // Added description state
  const [rank, setRank] = useState(''); // Added rank state
  const [sourceYear, setSourceYear] = useState(''); // Added sourceYear state


  const handleAddTopic = () => { // Renamed from handleAddFieldOfResearch to handleAddTopic
    if (newTopic.trim() !== '') { // Renamed from newFieldOfResearch to newTopic
      setTopics([...topics, newTopic.trim()]); // Renamed from fieldsOfResearch to topics, newFieldOfResearch to newTopic
      setNewTopic(''); // Renamed from setNewFieldOfResearch to setNewTopic
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => { // Renamed from handleRemoveFieldOfResearch to handleRemoveTopic, fieldToRemove to topicToRemove
    setTopics(topics.filter((topic) => topic !== topicToRemove)); // Renamed from fieldsOfResearch to topics, field to topicToRemove
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const conferenceData: Conference = {
      id: Date.now().toString(), // ID generated as string, using Date.now() for simplicity
      name,
      acronym, // Using acronym
      startDate,
      endDate,
      location, // Using location string directly
      imageUrl: '', // You can add input for image URL later in the form
      rank, // Using rank state
      topics, // Using topics state
      type,
      submissionDate,
      notificationDate,
      description, // Using description state
      link, // Using link state
      category: '', // You can add input for category later, or set a default
      cameraReadyDate: '', // Optional, can be added to form if needed
      sourceYear, // Using sourceYear state
    };
    onAdd(conferenceData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
      <div className="sm:col-span-2">
        <label htmlFor="conferenceName" className="block text-sm font-medium ">
          * Conference name:
        </label>
        <input
          type="text"
          id="conferenceName"
          className="bg-background mt-1 block w-full rounded-md border border-text-secondary shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="acronym" className="block text-sm font-medium ">
          * Acronym:
        </label>
        <input
          type="text"
          id="acronym"
          className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={acronym}
          onChange={(e) => setAcronym(e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="link" className="block text-sm font-medium ">
          * Link:
        </label>
        <input
          type="url"
          id="link"
          className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="type" className="block text-sm font-medium ">
          * Type:
        </label>
        <select
          id="type"
          className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={type}
          onChange={(e) => setType(e.target.value as Conference['type'])}
          required
        >
          <option value="offline">Offline</option>
          <option value="online">Online</option>
          <option value="hybrid">Hybrid</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="location" className="block text-sm font-medium ">
          * Location:
        </label>
        <input
          type="text"
          id="location"
          className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium ">* Dates:</label>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium ">Start Date:</label>
            <input
              type="date"
              id="startDate"
              className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium ">End Date:</label>
            <input
              type="date"
              id="endDate"
              className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium ">Important Dates:</label>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label htmlFor="submissionDate" className="block text-sm font-medium ">Submission Date:</label>
            <input
              type="date"
              id="submissionDate"
              className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={submissionDate}
              onChange={(e) => setSubmissionDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="notificationDate" className="block text-sm font-medium ">Notification Date:</label>
            <input
              type="date"
              id="notificationDate"
              className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={notificationDate}
              onChange={(e) => setNotificationDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="description" className="block text-sm font-medium ">Description:</label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter conference description"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="rank" className="block text-sm font-medium ">Rank:</label>
        <input
          type="text"
          id="rank"
          className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={rank}
          onChange={(e) => setRank(e.target.value)}
          placeholder="Enter conference rank"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="sourceYear" className="block text-sm font-medium ">Source Year:</label>
        <input
          type="text"
          id="sourceYear"
          className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={sourceYear}
          onChange={(e) => setSourceYear(e.target.value)}
          placeholder="Enter source year"
        />
      </div>


      <div className="sm:col-span-2">
        <label htmlFor="topics" className="block text-sm font-medium ">
          * Topics:
        </label>
        <div className="flex flex-wrap gap-2 mt-1">
          {topics.map((topic) => ( // Renamed fieldsOfResearch to topics, field to topic
            <div key={topic} className="bg-gray-100 px-2 py-1 rounded-md flex items-center">
              {topic}
              <button
                type="button"
                onClick={() => handleRemoveTopic(topic)} // Renamed handleRemoveFieldOfResearch to handleRemoveTopic, field to topic
                className="ml-1 text-gray-500 hover: focus:outline-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center">
          <input
            type="text"
            id="newTopic" // Renamed newFieldOfResearch to newTopic
            className="mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={newTopic} // Renamed newFieldOfResearch to newTopic
            onChange={(e) => setNewTopic(e.target.value)} // Renamed setNewFieldOfResearch to setNewTopic
            placeholder="Add new"
          />
          <Button type="button" onClick={handleAddTopic} variant="primary" size="small" className="ml-2">Add</Button>
        </div>
      </div>

      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Back
        </Button>
        <Button type="submit" variant="primary">
          Finish
        </Button>
      </div>
    </form>
  );
};

export default ConferenceForm;