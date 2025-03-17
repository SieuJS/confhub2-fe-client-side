// EventCard.tsx
import React from 'react';
import Image from 'next/image';
import Button from '../utils/Button';
import { ConferenceInfo } from '../../../models/response/conference.list.response';
import { Link } from '@/src/navigation';

interface EventCardProps {
  event: ConferenceInfo;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formatDate = (date: string | undefined) => {
    if (!date) return 'TBD';
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return 'Invalid Date';
      }
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  const locationString = `${event.location.cityStateProvince || ''}, ${event.location.country || ''}`.trim() || 'Location Not Available';
  // Function to determine the color based on the rank
  const getRankColor = (rank?: string) => {
    if (!rank) return 'bg-gray-400 text-gray-700'; // Default color

    switch (rank.toUpperCase()) {
      case 'A*':
        return 'bg-yellow-400 text-black';
      case 'A':
        return 'bg-green-500 text-white';
      case 'B':
        return 'bg-blue-500 text-white';
      case 'C':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-400 text-gray-700';
    }
  };

  return (
    <div className="rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition duration-300 ease-in-out flex flex-col"> {/* Removed h-full */}
      {/* Image and Rank */}
      <div className="relative">
        <Image
          src={'/bg-2.jpg'}
          alt={event.title}
          width={400}
          height={225}
          style={{ objectFit: 'cover', width: '100%', height: '180px' }}
          className="w-full"
        />

        {event.rankSourceFoRData && (
          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getRankColor(event.rankSourceFoRData.rank)}`}>
            <span>{event.rankSourceFoRData.rank}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 cursor-pointer hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                const target = e.currentTarget as SVGSVGElement;
                const isFilled = target.getAttribute('fill') === 'red';
                target.setAttribute('fill', isFilled ? 'none' : 'red');
              }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title and Acronym */}
        <div className="mb-2">
          <h3 className="font-bold text-sm text-left text-gray-800">
            {event.title} {event.acronym ? `(${event.acronym})` : ''}
          </h3>
        </div>

        {/* Location and Date */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 inline-block mr-1 -mt-0.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{locationString}</span>
          </div>
          <div className="font-semibold">
            {formatDate(event.dates.fromDate)} - {formatDate(event.dates.toDate)}
          </div>
        </div>

        {/* Topics */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {event.topics.slice(0, 3).map((topic) => (
              <span key={topic} className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs">
                {topic}
              </span>
            ))}
            {event.topics.length > 3 && (
              <span className="text-xs text-gray-500">+{event.topics.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Button */}
        <div className="mt-auto">
          <Link href={{ pathname: '/conferences/detail', query: { id: event.id } }}>
            <Button variant="primary" size="medium" className="w-full">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventCard;