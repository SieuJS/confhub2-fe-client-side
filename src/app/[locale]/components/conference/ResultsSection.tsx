// components/conference/ResultsSection.tsx
import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import Pagination from '../utils/Pagination';
import { ConferenceListResponse, ConferenceInfo } from '@/src/models/response/conference.list.response';
import { getListConference } from '@/src/api/get_info/get_info';

interface ResultsSectionProps {
  searchQuery: string;
  selectedLocation: string | null;
  selectedType: 'online' | 'offline' | 'hybrid' | null;
  startDate: Date | null;
  endDate: Date | null;
  submissionDate: Date | null; // Not used in this example. Keep if you use a submission date filter.
  selectedRank: string | null;
  selectedPublisher: string | null;  // Not used directly, kept for completeness
  selectedSourceYear: string | null;
  selectedAverageScore: string | null; // Not used directly, kept for completeness
  selectedTopics: string[];
  selectedFieldsOfResearch: string[];
}
type SortOption = 'date' | 'rank' | 'name' | 'submissionDate' | 'startDate' | 'endDate';


const ResultsSection: React.FC<ResultsSectionProps> = ({
  searchQuery, selectedLocation, selectedType, startDate, endDate,
  submissionDate, selectedRank, selectedTopics, selectedFieldsOfResearch, selectedPublisher, selectedAverageScore, selectedSourceYear
}) => {

  const [events, setEvents] = useState<ConferenceInfo[]>([]); //  Store the filtered/sorted events directly
  const [initialEvents, setInitialEvents] = useState<ConferenceInfo[]>([]); // Store *all* events, unfiltered
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;
  const [sortBy, setSortBy] = useState<SortOption>('date'); // Default sort by date
  const [totalItems, setTotalItems] = useState(0); //Total number of events


  useEffect(() => {
    async function getListConf() {
      try {
        const conferenceInfo = await getListConference();
        setInitialEvents(conferenceInfo.payload); // Store *all* conferences here
        setEvents(conferenceInfo.payload);  // Initially, filtered events are the same as all events
        setTotalItems(conferenceInfo.meta.totalItems) // Set initial total item
      } catch (err: any) {
        console.error('Error updating conference data:', err);
      }
    }
    getListConf();
  }, []);


   // Filtering and Sorting logic (inside a useCallback for performance)
   const filterAndSortEvents = React.useCallback(() => {
      if (!initialEvents) {
        return []; // No initial data, return empty array
      }

      let filteredEvents = [...initialEvents];

    // Apply filters (same as before, but using initialEvents)
    if (searchQuery) {
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.acronym.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLocation) {
      filteredEvents = filteredEvents.filter(event =>
        event.location.country.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedType) {
      filteredEvents = filteredEvents.filter(event =>
        event.accessType.toLowerCase() === selectedType.toLowerCase() //convert selected type to lowercase
      );
    }

    if (startDate) {
      filteredEvents = filteredEvents.filter(event =>
        event.dates.fromDate && new Date(event.dates.fromDate) >= startDate
      );
    }

    if (endDate) {
      filteredEvents = filteredEvents.filter(event =>
        event.dates.toDate && new Date(event.dates.toDate) <= endDate
      );
    }
    if (selectedRank) {
      filteredEvents = filteredEvents.filter(event =>
        event.rankSourceFoRData.rank === selectedRank  //  use rankSourceFoRData.rank
      );
    }

    if (selectedSourceYear) {
      filteredEvents = filteredEvents.filter(event =>
        event.year === Number(selectedSourceYear)
      );
    }

    if (selectedTopics && selectedTopics.length > 0) {
      filteredEvents = filteredEvents.filter(event =>
        event.topics.some(topic => selectedTopics.includes(topic))
      );
    }


     if (selectedFieldsOfResearch && selectedFieldsOfResearch.length > 0) {
        filteredEvents = filteredEvents.filter(event =>
        // Check if event.rankSourceFoRData and event.rankSourceFoRData.researchFields exist
            event.rankSourceFoRData?.researchFields.includes(selectedFieldsOfResearch.join(', '))
        );
     }


    // Sorting (same as before, but operates on filteredEvents)
    let sortedEvents = [...filteredEvents];
    switch (sortBy) {
      case 'rank':
        sortedEvents.sort((a, b) => a.rankSourceFoRData.rank.localeCompare(b.rankSourceFoRData.rank)); // Use rankSourceFoRData
        break;
      case 'name':
        sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'startDate':
      case 'date':
        sortedEvents.sort((a, b) => {
          const dateA = a.dates.fromDate ? new Date(a.dates.fromDate).getTime() : -Infinity;
          const dateB = b.dates.fromDate ? new Date(b.dates.fromDate).getTime() : -Infinity;
          return dateA - dateB;
        });
        break;
      case 'endDate':
        sortedEvents.sort((a, b) => {
          const dateA = a.dates.toDate ? new Date(a.dates.toDate).getTime() : -Infinity;
          const dateB = b.dates.toDate ? new Date(b.dates.toDate).getTime() : -Infinity;
          return dateA - dateB;
        });
        break;
    }

      return sortedEvents;

   }, [initialEvents, searchQuery, selectedLocation, selectedType, startDate, endDate, selectedRank, selectedTopics, selectedFieldsOfResearch, selectedSourceYear, sortBy]); // Dependencies for useCallback


  //  Update 'events' and 'currentPage' whenever filters or sorting change
  useEffect(() => {
      const newFilteredEvents = filterAndSortEvents();
      setEvents(newFilteredEvents);
      setCurrentPage(1); // Reset to page 1 on filter/sort change
      setTotalItems(newFilteredEvents.length); //update the total items
  }, [filterAndSortEvents]); //  use the useCallback result as a dependency


  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent); // Use the 'events' state (filtered/sorted)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as SortOption);
  };


  if (!currentEvents || currentEvents.length === 0) {
    return <p>Không tìm thấy hội nghị nào.</p>;
  }

  return (
    <div className="w-full pl-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          Recommended for you ({totalItems})
        </h2>
        <div className="flex items-center rounded-md px-2 py-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm mr-1">Sort by:</span>
          <select className="text-sm border rounded px-2 py-1 bg-transparent focus:outline-none" value={sortBy} onChange={handleSortByChange}>
            <option value="date">Date</option>
            <option value="rank">Rank</option>
            <option value="name">Name</option>
            <option value="startDate">Start Date</option>
            <option value="endDate">End Date</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {currentEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <Pagination
        eventsPerPage={eventsPerPage}
        totalEvents={totalItems}  // Use the total items
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
};

export default ResultsSection;