import React from 'react';
import Image from 'next/image';
import Button from './Button'; // Import your Button component

interface EventCardProps {
  event: {
    id: number;
    name: string;
    shortName: string;
    startDate: string;
    endDate: string;
    location: string;
    imageUrl: string;
    rank: string | null;
    averageScore: number;
    topics: string[];
    type: 'online' | 'offline' | 'hybrid'; 
  };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className="rounded-lg shadow-md overflow-hidden bg-background-secondary">
      <div className="relative">
        <Image
          src={event.imageUrl}
          alt={event.name}
          width={400}
          height={200} // Adjust height as needed
          style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
          className="w-full" // Ensure image takes full width
        />

        {event.rank && (
          <div className="absolute top-2 right-2 bg-background-secondary font-bold px-2 py-1 rounded-md text-sm flex items-center space-x-1">
            <span>{event.rank}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 cursor-pointer"
              onClick={(e) => {
                const target = e.currentTarget;
                if (target.style.fill === 'red') {
                  target.style.fill = 'none';
                } else {
                  target.style.fill = 'red';
                }
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
        <p className="text-xs">{event.startDate} - {event.endDate}</p>
        <p className="text-xs">{event.location}</p>
      </div>

      <div className="p-2">

      <div className="grid grid-cols-3 items-center gap-2">
  {/* Cột 1: Thông tin sự kiện */}
  <div className='flex flex-col items-start text-left col-span-2'> {/* col-span-2 để cột này chiếm 2 cột */}
    <h6 className="font-semibold text-base">{event.name}</h6>
    <p className="text-xs">{event.shortName}</p>
  </div>

  {/* Cột 2: Nút Detail */}
  <div className="justify-self-end self-start col-span-1"> {/* justify-self-end để đẩy nút về phía bên phải cột, self-start để đẩy nút lên trên */}
    <Button variant="secondary" size="small" rounded className="w-20">
      Detail
    </Button>
  </div>
</div>

        <div className="flex flex-wrap mt-2 space-x-2 overflow-hidden">
          {event.topics.map((topic, index) => (
            <span
              key={index}
              className=" rounded-full px-2 py-1 text-xs inline-block mb-2 bg-background"
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
