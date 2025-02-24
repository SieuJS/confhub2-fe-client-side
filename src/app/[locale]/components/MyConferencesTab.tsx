import React, { useState } from 'react';
import Image from 'next/image';
import ConferenceItem from './ConferenceItem'; // Import ConferenceItem
import Button from './Button';
import { Dialog } from '@headlessui/react';

interface Conference {
  id: number;
  name: string;
  shortName: string;
  startDate: string;
  endDate: string;
  location: string; // Consider making this a more structured object if location details are needed
  imageUrl: string;
  rank: string;
  averageScore: number;
  topics: string[]; // Fields of Research, keep this as topics for consistency with original code
  type: 'online' | 'offline' | 'hybrid';
  address?: string;
  stateProvince?: string;
  city?: string;
  country?: string;
  submissionDate?: string;
  notificationDate?: string;
  callForPaper?: string; // Now a long text description for call for paper
  generalTopics?: string; // New field for general topics
}

interface MyConferencesTabProps {
  // Định nghĩa props cho component nếu cần
  conferences: Conference[];
}

const MyConferencesTab: React.FC<MyConferencesTabProps> = ({conferences}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Sample localConferences data
  const [localConferences, setLocalConferences] = useState<Conference[]>([
    {
      id: 1,
      name: 'International Conference on Machine Learning',
      shortName: 'ICML',
      startDate: '2024-07-21',
      endDate: '2024-07-27',
      location: 'Vienna, Austria',
      imageUrl: '/images/icml.png', // Example image path, replace with actual paths or URLs
      rank: 'A*',
      averageScore: 4.5,
      topics: ['Machine Learning', 'Deep Learning', 'AI'],
      type: 'hybrid',
      city: 'Vienna',
      country: 'Austria',
      generalTopics: 'Machine learning theory and applications',
    },
    {
      id: 2,
      name: 'Conference on Computer Vision and Pattern Recognition',
      shortName: 'CVPR',
      startDate: '2024-06-17',
      endDate: '2024-06-21',
      location: 'Seattle, USA',
      imageUrl: '/images/cvpr.png', // Example image path, replace with actual paths or URLs
      rank: 'A*',
      averageScore: 4.8,
      topics: ['Computer Vision', 'Image Recognition', 'Pattern Recognition'],
      type: 'offline',
      city: 'Seattle',
      country: 'USA',
      generalTopics: 'All areas of computer vision and pattern recognition',
    },
    {
      id: 3,
      name: 'International World Wide Web Conference',
      shortName: 'WWW',
      startDate: '2025-05-12',
      endDate: '2025-05-16',
      location: 'Singapore',
      imageUrl: '/images/www.png', // Example image path, replace with actual paths or URLs
      rank: 'A*',
      averageScore: 4.6,
      topics: ['Web Technologies', 'Internet of Things', 'Social Networks'],
      type: 'hybrid',
      city: 'Singapore',
      country: 'Singapore',
      generalTopics: 'Future of the Web and its impact on society',
    },
  ]);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const handleAddConference = (conferenceData: Conference) => {
    // Assuming you have a way to generate a unique ID
    const { id, ...rest } = conferenceData;
    setLocalConferences([...localConferences, { id: Date.now(), ...rest }]);
    closeModal();
  };

  return (
    <div className="container mx-auto p-4">
      <Button
        onClick={openModal}
        variant="primary"
        size="medium"
        rounded
        className="mr-2 w-24"
      >
        Add
      </Button>

      <h1 className="text-2xl font-semibold mb-2">My Conferences</h1>
      {localConferences.length === 0 ? (
        <p className="text-gray-500">You are not have any conferences yet.</p>
      ) : (
        localConferences.map((conference) => (
          <ConferenceItem key={conference.id} conference={conference} /> // Use ConferenceItem here
        ))
      )}

      {/* Modal Dialog */}
      <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/25" aria-hidden="true" />

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Conference Information
              </Dialog.Title>
              <ConferenceForm onAdd={handleAddConference} onClose={closeModal} />
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </div>
  );
};


interface ConferenceFormProps {
  onAdd: (conferenceData: Conference) => void;
  onClose: () => void;
}

const ConferenceForm: React.FC<ConferenceFormProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [acronym, setAcronym] = useState('');
  const [link, setLink] = useState('');
  const [fieldsOfResearch, setFieldsOfResearch] = useState<string[]>([]);
  const [newFieldOfResearch, setNewFieldOfResearch] = useState('');
  const [type, setType] = useState<Conference['type']>('offline');
  const [address, setAddress] = useState('');
  const [stateProvince, setStateProvince] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submissionDate, setSubmissionDate] = useState('');
  const [notificationDate, setNotificationDate] = useState('');
  const [callForPaper, setCallForPaper] = useState('');
  const [generalTopics, setGeneralTopics] = useState('');


  const handleAddFieldOfResearch = () => {
    if (newFieldOfResearch.trim() !== '') {
      setFieldsOfResearch([...fieldsOfResearch, newFieldOfResearch.trim()]);
      setNewFieldOfResearch('');
    }
  };

  const handleRemoveFieldOfResearch = (fieldToRemove: string) => {
    setFieldsOfResearch(fieldsOfResearch.filter((field) => field !== fieldToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const conferenceData: Conference = {
      id: 0, // ID will be generated in parent component
      name,
      shortName: acronym,
      startDate,
      endDate,
      location: `${city}, ${country}`, // Basic location string, can be improved
      imageUrl: '', // You can add input for image URL later in the form
      rank: '', // You can add input for rank later in the form
      averageScore: 0, // You can add logic for average score later
      topics: fieldsOfResearch,
      type,
      address,
      stateProvince,
      city,
      country,
      submissionDate,
      notificationDate,
      callForPaper,
      generalTopics,
    };
    onAdd(conferenceData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
      <div className="sm:col-span-2">
        <label htmlFor="conferenceName" className="block text-sm font-medium text-gray-700">
          * Conference name:
        </label>
        <input
          type="text"
          id="conferenceName"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="acronym" className="block text-sm font-medium text-gray-700">
          * Acronym:
        </label>
        <input
          type="text"
          id="acronym"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={acronym}
          onChange={(e) => setAcronym(e.target.value)}
          required
        />
      </div>
      <div className="sm:col-span-1">
        <label htmlFor="link" className="block text-sm font-medium text-gray-700">
          * Link:
        </label>
        <input
          type="url"
          id="link"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          * Type:
        </label>
        <select
          id="type"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
        <label className="block text-sm font-medium text-gray-700">
          Location:
        </label>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address:</label>
            <input
              type="text"
              id="address"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="stateProvince" className="block text-sm font-medium text-gray-700">State/Province:</label>
            <input
              type="text"
              id="stateProvince"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={stateProvince}
              onChange={(e) => setStateProvince(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">* City:</label>
            <input
              type="text"
              id="city"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">* Country:</label>
            <input
              type="text"
              id="country"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">* Dates:</label>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date:</label>
            <input
              type="date"
              id="startDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date:</label>
            <input
              type="date"
              id="endDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Important Dates:</label>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
          <div>
            <label htmlFor="submissionDate" className="block text-sm font-medium text-gray-700">Submission Date:</label>
            <input
              type="date"
              id="submissionDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={submissionDate}
              onChange={(e) => setSubmissionDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="notificationDate" className="block text-sm font-medium text-gray-700">Notification Date:</label>
            <input
              type="date"
              id="notificationDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              value={notificationDate}
              onChange={(e) => setNotificationDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="callForPaper" className="block text-sm font-medium text-gray-700">Call for Paper Description:</label>
        <textarea
          id="callForPaper"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={callForPaper}
          onChange={(e) => setCallForPaper(e.target.value)}
          placeholder="Enter call for paper description"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="generalTopics" className="block text-sm font-medium text-gray-700">General Topics:</label>
        <input
          type="text"
          id="generalTopics"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={generalTopics}
          onChange={(e) => setGeneralTopics(e.target.value)}
          placeholder="Enter general topics separated by commas"
        />
      </div>


      <div className="sm:col-span-2">
        <label htmlFor="fieldsOfResearch" className="block text-sm font-medium text-gray-700">
          * Field of Research:
        </label>
        <div className="flex flex-wrap gap-2 mt-1">
          {fieldsOfResearch.map((field) => (
            <div key={field} className="bg-gray-100 px-2 py-1 rounded-md flex items-center">
              {field}
              <button
                type="button"
                onClick={() => handleRemoveFieldOfResearch(field)}
                className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
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
            id="newFieldOfResearch"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={newFieldOfResearch}
            onChange={(e) => setNewFieldOfResearch(e.target.value)}
            placeholder="Add new"
          />
          <Button type="button" onClick={handleAddFieldOfResearch} variant="primary" size="small" className="ml-2">Add</Button>
        </div>
      </div>

      <div className="sm:col-span-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Back
        </Button>
        <Button type="submit" variant="primary">
          Next
        </Button>
      </div>
    </form>
  );
};

export default MyConferencesTab;