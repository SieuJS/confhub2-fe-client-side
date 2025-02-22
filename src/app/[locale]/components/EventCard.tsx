import React from 'react';
import Image from 'next/image';
import Button from './Button'; // Import your Button component

interface EventCardProps {
  event: {
    id: number;
    title: string;
    subtitle: string;
    date: string;
    location: string;
    imageUrl: string;
    grade: string | null;
    topics: string[];
  };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className=" rounded-lg shadow-md overflow-hidden "> 
      <div className="relative">
        <Image
          src={event.imageUrl}
          alt={event.title}
          width={400}
          height={200} // Adjust height as needed
          style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
          className="w-full" // Ensure image takes full width
        />

        {event.grade && (
          <div className="absolute top-2 right-2 bg-green-500  font-bold px-2 py-1 rounded-md text-sm flex items-center space-x-1">
            <span>{event.grade}</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-.926 0-1.79.347-2.446.967l-2.373 1.589-2.373-1.589C9.879 3.75 9.016 3.403 8.09 3.403 5.5 3.403 3.403 5.417 3.403 8.25c0 2.485 2.099 4.5 4.688 4.5.926 0 1.79-.347 2.446-.967l2.373-1.589 2.373 1.589c.656.62 1.52 0.967 2.446 0.967 2.589 0 4.688-2.015 4.688-4.5zM12.75 15c2.907 0 5.25 2.343 5.25 5.25v2.25H6.75v-2.25c0-2.907 2.343-5.25 5.25-5.25z" />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">

        <div className="flex items-center justify-between">
          <p className=" text-xs">{event.date} </p>
          <p className=" text-xs">{event.location}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className='flex flex-col items-start text-left'>
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className=" text-xs">{event.subtitle}</p>
          </div>

          <Button variant="primary" size="small" rounded className="w-32"> {/* Removed mt-2 */}
            Detail
          </Button>
        </div>

        <div className="flex mt-2 space-x-2 overflow-x-auto whitespace-nowrap">
          {event.topics.map((topic, index) => (
            <span
              key={index}
              className="bg-gray-200  rounded-full px-3 py-1 text-xs inline-block"
            >
              {topic}
            </span>
          ))}
        </div>


      </div>
    </div>
  );
};

export default EventCard;