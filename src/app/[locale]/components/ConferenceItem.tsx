import React, { useState } from 'react';
import Image from 'next/image';
import Button from './Button';
import { ConferenceResponse } from '../../../models/response/conference.response'; // Import ConferenceResponse

// Replace interface Conference with type Conference = ConferenceResponse
type Conference = ConferenceResponse;

const ConferenceItem: React.FC<{ conference: Conference }> = ({ conference }) => {
  const [isFollowing, setIsFollowing] = useState(false); // State for follow status

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
  };
  return (
    <div className="bg-background rounded-md shadow-md p-4 mb-4 grid grid-cols-9 gap-4">
      {/* cột 1 */}
      <div className="col-span-1 flex items-center justify-center">
        <Image
          src={conference.imageUrl || "/images/default-conference.png"} // Use default image if imageUrl is missing
          alt={conference.name}
          width={100} // Adjusted width for better fit
          height={100} // Adjusted height for better fit
          className="rounded-md object-cover" // object-cover to maintain aspect ratio
        />
      </div>
      {/* cột 2 */}
      <div className="col-span-6 text-left">
        <h3 className="text-lg font-semibold text-button">{conference.name} ({conference.acronym})</h3> {/* Use conference.acronym */}
        <p className="">
          <strong>Dates:</strong> {conference.startDate} - {conference.endDate}
        </p>
        <p className="">
          <strong>Location:</strong> {conference.location}
        </p>

        {/* Add more details or actions here if needed */}
      </div>
      {/* cột 3 */}
      <div className="col-span-2 flex items-center justify-center">
        <Button
          variant="primary"
          size="medium"
          rounded
          className={`mr-2 w-24`}
        >
          Update
        </Button>

        <Button
          onClick={handleFollowClick}
          variant={`${isFollowing ? 'primary' : 'secondary'}`}
          size="medium"
          rounded
          className={`mr-2 w-24 `}
        >
          {isFollowing ? 'Followed' : 'Follow'}
        </Button>
      </div>
    </div>
  );
};

export default ConferenceItem;