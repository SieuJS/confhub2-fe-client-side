import React, { useState } from 'react';
import Image from 'next/image';
import ConferenceItem from './ConferenceItem';
import Button from './Button';
import { Dialog } from '@headlessui/react';

interface Conference {
  id: number;
  name: string;
  shortName: string;
  startDate: string;
  endDate: string;
  location: string;
  imageUrl: string;
  rank: string;
  averageScore: number;
  topics: string[];
  type: 'online' | 'offline' | 'hybrid';
}

interface MyConferencesTabProps {
  // Định nghĩa props cho component nếu cần
  conferences: Conference[];
}

const MyConferencesTab: React.FC<MyConferencesTabProps> = ({conferences}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localConferences, setLocalConferences] = useState<Conference[]>([]);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const handleAddConference = (conferenceData: any) => {
    // Assuming you have a way to generate a unique ID
    setLocalConferences([...localConferences, { id: Date.now(), ...conferenceData }]);
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
          <div key={conference.id} className="border p-4 mb-2">
            <p>Name: {conference.name}</p>
            <p>Acronym: {conference.shortName}</p>
            {/* Add more fields as needed */}
          </div>
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
  onAdd: (conferenceData: any) => void;
  onClose: () => void;
}

const ConferenceForm: React.FC<ConferenceFormProps> = ({ onAdd, onClose }) => {
  const [name, setName] = useState('');
  const [acronym, setAcronym] = useState('');
  const [link, setLink] = useState('');
  const [fieldsOfResearch, setFieldsOfResearch] = useState<string[]>([]);
  const [newFieldOfResearch, setNewFieldOfResearch] = useState('');

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
    onAdd({ name, acronym, link, fieldsOfResearch });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="mb-4">
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
      <div className="mb-4">
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
      <div className="mb-4">
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
      <div className="mb-4">
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

      <div className="flex justify-end gap-2">
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