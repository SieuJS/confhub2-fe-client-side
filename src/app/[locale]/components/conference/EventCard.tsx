// EventCard.tsx
import React from 'react';
import Image from 'next/image';
import Button from '../../components/utils/Button';
import { ConferenceInfo } from '../../../../models/response/conference.list.response';
import { Link } from '@/src/navigation';

interface EventCardProps {
  event: ConferenceInfo;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const formatDate = (date: string | Date | undefined) => {
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

  // Handle missing location data gracefully
  const locationString = event.location
    ? `${event.location.cityStateProvince || ''}, ${event.location.country || ''}`.trim()
    : 'Location Not Available';

  return (
    <div className="rounded-lg shadow-md overflow-hidden bg-gradient-to-r from-background to-background-secondary hover:shadow-lg transition duration-300 ease-in-out">
      <div className="relative">
        <Image
          src={'/bg-2.jpg'} //  Consider using a placeholder or a default image if event.imageUrl is not always available
          alt={event.title}
          width={400}
          height={200}
          style={{ objectFit: 'cover', width: '100%', height: '200px' }} // Explicitly set height here
          className="w-full"
        />

        {event.rank && (
          <div className="absolute top-2 right-2 bg-gray-800 bg-opacity-75 text-white font-bold px-2 py-1 rounded-md text-sm flex items-center space-x-1">
            <span>{event.rank}</span>
            {/*  Favorite icon (simplified for now, could be a separate component) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none" // Start with no fill
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 cursor-pointer hover:fill-red-500 transition" // Add hover effect
              onClick={(e) => {
                const target = e.currentTarget;
                // Toggle fill color on click.  Better to use state for this, but this is a quick example.
                target.style.fill = target.style.fill === 'red' ? 'none' : 'red';
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

      <div className="flex items-center justify-between pt-2 px-2 bg-background">
        <p className="text-xs text-gray-600">{locationString}</p>
        <p className="text-xs">
          <span className="font-semibold">Date:</span> {formatDate(event.dates.fromDate)} - {formatDate(event.dates.toDate)}
        </p>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 items-center gap-2">
          {/* <div className='flex flex-col items-start text-left col-span-2'>
            <h6 className="font-semibold text-base text-blue-600 hover:text-blue-800">
                <Link href={`/tabs/conferences`}>
                    {event.title}
                </Link>
            </h6>
            <p className="text-xs text-gray-600">{event.acronym}</p>
          </div> */}

          {/* Cột 1: Thông tin sự kiện */}
          <div className='flex flex-col items-start text-left col-span-2'> {/* col-span-2 để cột này chiếm 2 cột */}
            <h6 className="font-semibold text-base">{event.title}</h6>
            <p className="text-xs">{event.acronym}</p> {/* Sử dụng acronym thay vì shortName */}
          </div>

          <div className="justify-self-end self-start col-span-1">
            <Link href={{ pathname: '/tabs/conferences/detail', query: { id: event.id } }}>
              <Button variant="secondary" size="small" rounded className="w-20">
                Detail
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap mt-3 space-x-2 overflow-hidden">
          {event.topics && event.topics.slice(0, 3).map((topic, index) => (  // Limit to 3 topics
            <span
              key={index}
              className="rounded-full px-3 py-1 text-xs text-gray-700 bg-gray-200 mb-2"
            >
              {topic}
            </span>
          ))}
          {event.topics.length > 3 && <span className="text-xs text-gray-600">...</span>}
        </div>
        {/* Research field */}
        <div className="flex flex-wrap mt-3 space-x-2 overflow-hidden">
          {event.researchFields && event.researchFields.slice(0, 3).map((field, index) => (  // Limit to 3 topics
            <span
              key={index}
              className="rounded-full px-3 py-1 text-xs text-gray-700 bg-gray-200 mb-2"
            >
              {field}
            </span>
          ))}
          {event.researchFields.length > 3 && <span className="text-xs text-gray-600">...</span>}
        </div>
      </div>
    </div>
  );
};

export default EventCard;