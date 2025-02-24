import React, { useState } from 'react';
import Image from 'next/image';
import Button from './Button';

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

const ConferenceItem: React.FC<{ conference: Conference }> = ({ conference }) => {
  const [isFollowing, setIsFollowing] = useState(false); // State for follow status
  
    const handleFollowClick = () => {
      setIsFollowing(!isFollowing);
    };
  return (
  <div className="bg-white rounded-md shadow-md p-4 mb-4 grid grid-cols-8 gap-4">
    {/* cột 1 */}
    <div className="col-span-1 flex items-center justify-center">
      <Image
      src={conference.imageUrl}
      alt={conference.name}
      width={150} // Required: Specify width
      height={150} // Required: Specify height
      className="rounded-md" // Keep your classnames
      />
    </div>
    {/* cột 2 */}
    <div className="col-span-6 text-left">
      <h3 className="text-lg font-semibold text-blue-700">{conference.name} ({conference.shortName})</h3>
      <p className="text-gray-700">
        <strong>Dates:</strong> {conference.startDate} - {conference.endDate}
      </p>
      <p className="text-gray-700">
        <strong>Location:</strong> {conference.location}
      </p>
      
      {/* Add more details or actions here if needed */}
    </div>
    {/* cột 3 */}
    <div className="col-span-1 flex items-center justify-center">
      <Button
        onClick={handleFollowClick}
        variant="primary"
        size="medium"
        rounded
        className={`mr-2 w-24 ${isFollowing ? 'bg-green-500' : 'bg-blue-500'}`} // Change color based on follow status
        >
        {isFollowing ? 'Followed' : 'Follow'}
      </Button>
    </div>
  </div>
  );
};

export default ConferenceItem;