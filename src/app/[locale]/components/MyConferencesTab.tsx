// MyConferencesTab.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import ConferenceItem from './ConferenceItem'; // Import ConferenceItem
import Button from './Button';
import { Dialog } from '@headlessui/react';
import { Link } from '@/src/navigation'
import ConferenceForm from './ConferenceForm'; // Import ConferenceForm
import { ConferenceResponse } from '../../../models/response/conference.response'; // Import ConferenceResponse

// Replace interface Conference with type Conference = ConferenceResponse
type Conference = ConferenceResponse;

interface MyConferencesTabProps {
  // Định nghĩa props cho component nếu cần
  conferences: Conference[];
}

const MyConferencesTab: React.FC<MyConferencesTabProps> = ({conferences}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Sample localConferences data - Updated to ConferenceResponse type
  const [localConferences, setLocalConferences] = useState<Conference[]>([
    {
      id: '1', // id is string
      name: 'International Conference on Machine Learning',
      acronym: 'ICML', // shortName to acronym
      startDate: '2024-07-21',
      endDate: '2024-07-27',
      location: 'Vienna, Austria',
      imageUrl: '/bg-2.jpg', // Example image path, replace with actual paths or URLs
      rank: 'A*',
      topics: ['Machine Learning', 'Deep Learning', 'AI'], // topics is already correct
      type: 'hybrid',
      category: 'Computer Science', // Added category, using 'Computer Science' as example
      description: 'Leading conference on machine learning.', // Added description
      link: 'https://icml.cc/', // Added link, using ICML website as example
      sourceYear: '2024', // Added sourceYear, using 2024 as example
      submissionDate: '2024-05-01', // Added submissionDate, using example date
    },
    {
      id: '2', // id is string
      name: 'Conference on Computer Vision and Pattern Recognition',
      acronym: 'CVPR', // shortName to acronym
      startDate: '2024-06-17',
      endDate: '2024-06-21',
      location: 'Seattle, USA',
      imageUrl: '/bg-2.jpg', // Example image path, replace with actual paths or URLs
      rank: 'A*',
      topics: ['Computer Vision', 'Image Recognition', 'Pattern Recognition'], // topics is already correct
      type: 'offline',
      category: 'Computer Science', // Added category, using 'Computer Science' as example
      description: 'Premier conference for computer vision research.', // Added description
      link: 'https://cvpr.org/', // Added link, using CVPR website as example
      sourceYear: '2024', // Added sourceYear, using 2024 as example
      submissionDate: '2024-05-01', // Added submissionDate, using example date

    },
    {
      id: '3', // id is string
      name: 'International World Wide Web Conference',
      acronym: 'WWW', // shortName to acronym
      startDate: '2025-05-12',
      endDate: '2025-05-16',
      location: 'Singapore',
      imageUrl: '/bg-2.jpg', // Example image path, replace with actual paths or URLs
      rank: 'A*',
      topics: ['Web Technologies', 'Internet of Things', 'Social Networks'], // topics is already correct
      type: 'hybrid',
      category: 'Information Technology', // Added category, using 'Information Technology' as example
      description: 'Conference on the evolution of the web.', // Added description
      link: 'https://www2025.org/', // Added link, using WWW 2025 website as example
      sourceYear: '2025', // Added sourceYear, using 2025 as example
      submissionDate: '2024-05-01', // Added submissionDate, using example date

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
    setLocalConferences([...localConferences, { id: Date.now().toString(), ...rest }]); // Ensure id is string
    closeModal();
  };

  return (
    <div className="container mx-auto p-4">
      <Link href={`/addconference`}>
        <Button
          // onClick={openModal}
          variant="primary"
          size="medium"
          rounded
          className="mr-2 w-fill"
        >
          Add Conference
        </Button>
      
      </Link>

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
            <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 "
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

export default MyConferencesTab;