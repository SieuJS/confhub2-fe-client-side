// frontend/MyConferencesTab.tsx
import React, { useState } from 'react';
import ConferenceItem from '../conferences/ConferenceItem'; // Updated path
import Button from '../utils/Button';
import { Link } from '@/src/navigation';
import useMyConferences from '../../../hooks/dashboard/myConferences/useMyConferences'; // Import the hook

// Enum for conference status - Keep this, it's good!
enum ConferenceStatus {
  Approve = 'Approved', // Corrected values to match backend
  Pending = 'Pending',
  Rejected = 'Rejected'
}

// Interface for the simplified conference data used in the UI
interface ConferenceDisplayInfo {
  id: string;
  title: string;
  acronym: string;
  location: string;
  fromDate?: string;
  toDate?: string;
  summary?: string;
  websiteUrl?: string;
  year?: number;
  status: ConferenceStatus;
}

const MyConferencesTab: React.FC = () => {
  const [displayStatus, setDisplayStatus] = useState<ConferenceStatus>(ConferenceStatus.Approve);
  const userData = localStorage.getItem('user');
  if (!userData) {
    return;
  }

  const user = JSON.parse(userData);
  const { conferences, isLoading, error, refetch } = useMyConferences(user.id);

  const getStatusTitle = (status: ConferenceStatus) => {
    switch (status) {
      case ConferenceStatus.Approve: return 'My Conferences';
      case ConferenceStatus.Pending: return 'My Conferences are Pending';
      case ConferenceStatus.Rejected: return 'My Conferences are cancel';
      default: return 'My Conferences';
    }
  };

  // 1. Transform the *raw* AddedConference data into a simplified
  //    ConferenceDisplayInfo format for use in *this* component.
  const transformedConferences: ConferenceDisplayInfo[] = conferences.map((conf) => ({
    id: conf.conference.id,
    title: conf.conference.title,
    acronym: conf.conference.acronym,
    location: `${conf.locations.cityStateProvince}, ${conf.locations.country}`,
    year: conf.organization.year,
    summary: conf.organization.summary,
    fromDate: conf.dates.find(d => d.type === 'Conference Date')?.fromDate,
    toDate: conf.dates.find(d => d.type === 'Conference Date')?.toDate,
    websiteUrl: conf.organization.link,
    status: conf.status as ConferenceStatus, // Cast to ConferenceStatus
  }));

  // 2. Filter based on the selected status.
  const filteredConferences = transformedConferences.filter(
    conference => conference.status === displayStatus
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='container mx-auto p-4'>
      <Link href={`/addconference`}>
        <Button variant='primary' size='medium' rounded className='w-fill mr-2'>
          Add Conference
        </Button>
      </Link>

      {/* Status Switching Buttons */}
      <div className='my-4 flex space-x-4'>
        <Button
          variant={displayStatus === ConferenceStatus.Approve ? 'primary' : 'secondary'}
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Approve)}
        >
          Approve
        </Button>
        <Button
          variant={displayStatus === ConferenceStatus.Pending ? 'primary' : 'secondary'}
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Pending)}
        >
          Pending
        </Button>
        <Button
          variant={displayStatus === ConferenceStatus.Rejected ? 'primary' : 'secondary'}
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Rejected)}
        >
          Rejected
        </Button>
      </div>

      <h1 className='my-2 text-2xl font-semibold'>{getStatusTitle(displayStatus)}</h1>

      {filteredConferences.length === 0 ? (
        <p className='text-gray-500'>You do not have any conferences in this category yet.</p>
      ) : (
        filteredConferences.map(conference => (
          // Pass ONLY the data ConferenceItem needs:
          <ConferenceItem key={conference.id} conference={{
            id: conference.id,
            title: conference.title,
            acronym: conference.acronym,
            location: conference.location,
            fromDate: conference.fromDate,
            toDate: conference.toDate,
          }} />
        ))
      )}
      <button onClick={refetch}>Refetch Data</button>
    </div>
  );
};

export default MyConferencesTab;