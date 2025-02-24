// ResultsSection.tsx
import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import Pagination from './Pagination';

interface Event {
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

interface ResultsSectionProps {
  searchQuery: string;
  selectedLocation: string | null;
  selectedType: 'online' | 'offline' | 'hybrid' | null;
  startDate: Date | null;
  endDate: Date | null;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ searchQuery, selectedLocation, selectedType, startDate, endDate }) => {
  const initialEvents: Event[] = [
    {
      id: 1,
      name: 'Tech Conference 2023',
      shortName: 'TechConf',
      startDate: '2023-11-01',
      endDate: '2023-11-03',
      location: 'New York',
      imageUrl: '/conference_image.png',
      rank: 'A',
      averageScore: 4.5,
      topics: ['AI', 'Cloud Computing'],
      type: 'offline',
    },
    {
      id: 2,
      name: 'Online AI Summit',
      shortName: 'AISummit',
      startDate: '2023-12-05',
      endDate: '2023-12-06',
      location: 'Online',
      imageUrl: '/conference_image.png',
      rank: 'B',
      averageScore: 4.0,
      topics: ['AI', 'Machine Learning'],
      type: 'online',
    },
    {
      id: 3,
      name: 'Hybrid DevOps Conference',
      shortName: 'DevOpsConf',
      startDate: '2023-10-15',
      endDate: '2023-10-17',
      location: 'San Francisco',
      imageUrl: '/conference_image.png',
      rank: 'A',
      averageScore: 4.8,
      topics: ['DevOps', 'Cloud'],
      type: 'hybrid',
    },
    {
      id: 4,
      name: 'Cybersecurity Workshop',
      shortName: 'CyberSec',
      startDate: '2023-09-20',
      endDate: '2023-09-21',
      location: 'Chicago',
      imageUrl: '/conference_image.png',
      rank: 'C',
      averageScore: 3.5,
      topics: ['Cybersecurity'],
      type: 'offline',
    },
    {
      id: 5,
      name: 'Data Science Bootcamp',
      shortName: 'DataBootcamp',
      startDate: '2023-08-10',
      endDate: '2023-08-12',
      location: 'Boston',
      imageUrl: '/conference_image.png',
      rank: 'B',
      averageScore: 4.2,
      topics: ['Data Science', 'Big Data'],
      type: 'offline',
    },
    {
      id: 6,
      name: 'Virtual Reality Expo',
      shortName: 'VRExpo',
      startDate: '2023-07-25',
      endDate: '2023-07-27',
      location: 'Online',
      imageUrl: '/conference_image.png',
      rank: 'A',
      averageScore: 4.7,
      topics: ['Virtual Reality', 'AR'],
      type: 'online',
    },
    {
      id: 7,
      name: 'Blockchain Summit 2023',
      shortName: 'BlockchainSummit',
      startDate: '2023-06-15',
      endDate: '2023-06-17',
      location: 'Los Angeles',
      imageUrl: '/conference_image.png',
      rank: 'B',
      averageScore: 4.3,
      topics: ['Blockchain', 'Cryptocurrency'],
      type: 'offline',
    },
  ];

  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  useEffect(() => {
    let filteredEvents = initialEvents;

    // Apply filters
    if (searchQuery) {
      filteredEvents = filteredEvents.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.shortName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLocation) {
      filteredEvents = filteredEvents.filter(event =>
        event.location === selectedLocation
      );
    }

    if (selectedType) {
      filteredEvents = filteredEvents.filter(event =>
        event.type === selectedType
      );
    }

    if (startDate) {
      filteredEvents = filteredEvents.filter(event => {
        const eventStartDate = new Date(event.startDate);
        return eventStartDate >= startDate;
      });
    }

    if (endDate) {
      filteredEvents = filteredEvents.filter(event => {
        const eventEndDate = new Date(event.endDate);
        return eventEndDate <= endDate;
      });
    }

    setEvents(filteredEvents);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, selectedLocation, selectedType, startDate, endDate]);

  // Calculate the events to display on the current page
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="w-3/4 pl-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          Recommended for you ({events.length})
        </h2>
        <div className="flex items-center rounded-md px-2 py-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">Sort by:</span>
          <span className="text-sm ml-1">Conference date</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <Pagination
        eventsPerPage={eventsPerPage}
        totalEvents={events.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
};

export default ResultsSection;
