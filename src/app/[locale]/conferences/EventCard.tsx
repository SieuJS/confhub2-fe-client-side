import React, { useState } from 'react';
import Image from 'next/image';
import Button from '../utils/Button';
import { ConferenceInfo } from '../../../models/response/conference.list.response';
import { useRouter, usePathname } from 'next/navigation';
import { Link } from '@/src/navigation'; // Import Link

interface EventCardProps {
  event: ConferenceInfo;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isFavorite, setIsFavorite] = useState(false);

  const formatDate = (date: string | undefined) => {
    return date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD';
  };

  const formatDateRange = (fromDate: string | undefined, toDate: string | undefined) => {
    if (!fromDate || !toDate) return 'TBD';
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Invalid Date';
    }
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(fromDate);
    }
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  };

  const locationString = `${event.location.cityStateProvince || ''}, ${event.location.country || ''}`.trim() || 'Location Not Available';

  const getRankColor = (rank?: string) => {
    rank = rank?.toUpperCase(); // Consistent casing
    switch (rank) {
      case 'A*': return 'bg-yellow-400 text-black';
      case 'A': return 'bg-green-500 text-white';
      case 'B': return 'bg-blue-500 text-white';
      case 'C': return 'bg-orange-500 text-white';
      default: return 'bg-gray-400 text-gray-700';
    }
  };

    // --- ADDED FUNCTION FOR ACCESS TYPE COLOR ---
  const getAccessTypeColor = (accessType?: string) => {
    accessType = accessType?.toUpperCase();
    switch (accessType) {
      case 'ONLINE': return 'bg-green-500 text-white';       // Green for Online
      case 'OFFLINE': return 'bg-red-500 text-white';      // Red for Offline
      case 'HYBRID': return 'bg-blue-500 text-white';     // Blue for Hybrid
      default: return 'bg-gray-400 text-gray-700';      // Default gray
    }
  };

  const handleTopicClick = (topic: string) => {
    const localePrefix = pathname.split('/')[1];
    router.push(`/${localePrefix}/conferences?topics=${topic}`);
  };

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleGoToWebsite = (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
    e.preventDefault(); // Keep this!
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    } else {
      console.warn("No URL provided for Go to Website");
    }
  };

  const handleTitleClick = () => {
      const localePrefix = pathname.split('/')[1];
      router.push(`/${localePrefix}/conferences/detail?id=${event.id}`);
  }

  return (
    <div className="rounded-lg shadow-lg overflow-hidden bg-white hover:shadow-xl transition duration-300 ease-in-out flex flex-col">
      {/* Image and Rank */}
      <div className="relative hover:opacity-90">
        <Image
          src={'/bg-2.jpg'}
          alt={event.title}
          width={400}
          height={225}
          style={{ objectFit: 'cover', width: '100%', height: '180px' }}
          className="w-full"
        />

        {event.rankSourceFoRData && (
          <div className="absolute top-0 right-2">
            <span className={`font-semibold ${getRankColor(event.rankSourceFoRData.rank)} px-2 py-1 rounded text-xs`}>
              {`Rank`}: {event.rankSourceFoRData.rank}
            </span>
          </div>
        )}
        {event.accessType && (
          <div className="absolute top-8 right-2">
            {/* --- USE getAccessTypeColor HERE --- */}
            <span className={`font-semibold ${getAccessTypeColor(event.accessType)} px-2 py-1 rounded text-xs`}>
              {event.accessType}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-2 py-4 flex flex-col flex-grow">
        {/* Title and Acronym - Make the title clickable */}
        <div className="mb-2">
          <h3
            className="font-bold text-sm text-left text-gray-800 hover:text-blue-600 transition duration-300 cursor-pointer"
            onClick={handleTitleClick}
          >
            {event.title} {event.acronym ? `(${event.acronym})` : ''}
          </h3>
        </div>

        {/* Location and Date */}
        <div className="flex items-center text-xs text-gray-600 mb-3 transition duration-300 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b81e1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pinned mr-1 flex-shrink-0">
            <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0" />
            <circle cx="12" cy="8" r="2" />
            <path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712" />
          </svg>
          <span className="text-left">{locationString}</span>
        </div>

        <div className="flex items-center text-xs text-gray-600 mb-3 transition duration-300 hover:text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b81e1e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days mr-1 flex-shrink-0">
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
            <path d="M8 14h.01" />
            <path d="M12 14h.01" />
            <path d="M16 14h.01" />
            <path d="M8 18h.01" />
            <path d="M12 18h.01" />
            <path d="M16 18h.01" />
          </svg>
          <span className="text-left">
            {formatDateRange(event.dates.fromDate, event.dates.toDate)}
          </span>
        </div>

        {/* Topics */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {event.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="rounded-full bg-gray-100 text-gray-700 px-2 py-1 text-xs hover:bg-gray-200 transition duration-200 cursor-pointer"
                onClick={() => handleTopicClick(topic)}
              >
                {topic}
              </span>
            ))}
            {event.topics.length > 3 && (
              <span className="text-xs py-1 text-gray-500">+{event.topics.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Buttons and Actions */}
        <div className="mt-auto flex items-center justify-end">
          {/* Container for Website and Favorite Buttons (Right-aligned) */}
          <div className="flex space-x-2">
            {/* Go to Website Button */}
            <button
              onClick={(e) => handleGoToWebsite(e, event.link || '')}
              className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b81e1e" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-arrow-out-up-right"><path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" /><path d="m21 3-9 9" /><path d="M15 3h6v6" /></svg>
            </button>

            {/* Favorite Button */}
            <button
              onClick={(e) => handleFavoriteClick(e)}
              className={`p-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center ${isFavorite ? 'text-red-500' : ''}`}
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b81e1e" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
                className={`lucide lucide-bell-ring`}>
                <path d="M10.268 21a2 2 0 0 0 3.464 0" /><path d="M22 8c0-2.3-.8-4.3-2-6" /><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" /><path d="M4 2C2.8 3.7 2 5.7 2 8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;