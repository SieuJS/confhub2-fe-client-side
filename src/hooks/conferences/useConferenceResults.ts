// src/hooks/useConferenceResults.ts
import { useState, useEffect, useCallback } from 'react';
import { ConferenceInfo } from '@/src/models/response/conference.list.response';

type SortOption = 'date' | 'rank' | 'name' | 'submissionDate' | 'startDate' | 'endDate';

interface UseConferenceResultsProps {
  searchQuery: string;
  selectedLocation: string | null;
  selectedType: 'Online' | 'Offline' | 'Hybrid' | null;
  startDate: Date | null;
  endDate: Date | null;
  submissionDate: Date | null;
  selectedRank: string | null;
  selectedPublisher: string | null;
  selectedSourceYear: string | null;
  selectedAverageScore: string | null;
  selectedTopics: string[];
  selectedFieldsOfResearch: string[];
}

const API_FILTERED_CONFERENCES_ENDPOINT = 'http://localhost:3000/api/v1/filter-conferences';

const useConferenceResults = ({
  searchQuery,
  selectedLocation,
  selectedType,
  startDate,
  endDate,
  submissionDate,
  selectedRank,
  selectedPublisher,
  selectedSourceYear,
  selectedAverageScore,
  selectedTopics,
  selectedFieldsOfResearch,
}: UseConferenceResultsProps) => {
  const [events, setEvents] = useState<ConferenceInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      // Only append parameters if they have a value.  This is important!
      if (searchQuery) queryParams.append('keyword', searchQuery);
      if (selectedLocation) queryParams.append('country', selectedLocation);
      if (selectedType) queryParams.append('type', selectedType);
      if (startDate) queryParams.append('startDate', startDate.toISOString());
      if (endDate) queryParams.append('endDate', endDate.toISOString());
      if (selectedRank) queryParams.append('rank', selectedRank);
      if (selectedSourceYear) queryParams.append('sourceYear', selectedSourceYear);
      if (selectedTopics.length > 0) {
          selectedTopics.forEach(topic => queryParams.append('topics', topic));
      }
      if (selectedPublisher) queryParams.append('publisher', selectedPublisher);

      console.log(`Query: ${API_FILTERED_CONFERENCES_ENDPOINT}?${queryParams.toString()}`)
      const response = await fetch(`${API_FILTERED_CONFERENCES_ENDPOINT}?${queryParams.toString()}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('No conferences found matching your criteria.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      const data = await response.json();
      setEvents(data);
      setTotalItems(data.length);
      setCurrentPage(1);

    } catch (error: any) {
      console.error("Failed to fetch conferences:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedLocation, selectedType, startDate, endDate, selectedRank, selectedSourceYear, selectedTopics, selectedPublisher]);


  // Fetch data on initial load AND when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData is a dependency now


  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as SortOption);
  };

    // Sorting function
  const sortEvents = (eventsToSort: ConferenceInfo[], sortBy: SortOption) => {
    const sortedEvents = [...eventsToSort]; // Create a copy to avoid mutating the original array
    switch (sortBy) {
      case 'rank':
        sortedEvents.sort((a, b) => a.rankSourceFoRData.rank.localeCompare(b.rankSourceFoRData.rank));
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
      default:
        break;
    }
    return sortedEvents;
  }

  const sortedEvents = sortEvents(currentEvents, sortBy); // Sort currentEvents

  return {
    sortedEvents,
    totalItems,
    eventsPerPage,
    currentPage,
    sortBy,
    paginate,
    handleSortByChange,
    loading,
    error,
  };
};

export default useConferenceResults;