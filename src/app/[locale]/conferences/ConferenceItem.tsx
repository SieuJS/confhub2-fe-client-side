// components/conference/ConferenceItem.tsx
import React, { useState } from 'react';
import Image from 'next/image';
import Button from '../utils/Button';
import { ConferenceListResponse } from '../../../models/response/conference.list.response';
import { Link } from '@/src/navigation';

interface ConferenceItemProps {
  conference: ConferenceListResponse['payload'][0]; // Type for a single conference item
}

const ConferenceItem: React.FC<ConferenceItemProps> = ({ conference }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
    // Implement actual follow/unfollow logic here (e.g., API call, update localStorage)
  };

  // Helper function to format dates, now accepting strings
  const formatDate = (dateString: string) => {
    const date = new Date(dateString); // Create a Date object from the string
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-background rounded-md shadow-md p-4 mb-4 grid grid-cols-9 gap-4">
      {/* Column 1: Image */}
      <div className="col-span-1 flex items-center justify-center">
        <Image
          src={"/bg-2.jpg"}
          alt={conference.title}
          width={100}
          height={100}
          className="rounded-md object-cover"
        />
      </div>
      {/* Column 2: Conference Details */}
      <div className="col-span-6 text-left">
        <h3 className="text-lg font-semibold text-button">{conference.title} ({conference.acronym})</h3>
        <p>
          <strong>Dates:</strong>{" "}
          {conference.dates
            ? formatDate(conference.dates.fromDate) + " - " + formatDate(conference.dates.toDate)
            : 'Dates not available'}
        </p>
        <p>
          <strong>Location:</strong> {conference.location.cityStateProvince}, {conference.location.country}
        </p>
      </div>
      {/* Column 3: Buttons */}
      <div className="col-span-2 flex items-center justify-center">
        <Link href={{ pathname: '/conferences/detail', query: { id: conference.id } }}>
          <Button variant="primary" size="medium" rounded className="mr-2 w-24">
            Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ConferenceItem;