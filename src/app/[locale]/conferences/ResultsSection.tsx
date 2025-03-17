// src/components/conferences/ResultsSection.tsx
import React from 'react';
import EventCard from './EventCard';
import useConferenceResults from '../../../hooks/conferences/useConferenceResults'; // Adjust the path as needed
import Pagination from '../utils/Pagination';

interface ResultsSectionProps {
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

const ResultsSection: React.FC<ResultsSectionProps> = ({
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
  selectedFieldsOfResearch
}) => {
  const {
    sortedEvents,  // Use sortedEvents instead of currentEvents
    totalItems,
    eventsPerPage,
    currentPage,
    sortBy,
    paginate,
    handleSortByChange,
    loading, // Get loading state
    error,     // Get error

  } = useConferenceResults({
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
    selectedFieldsOfResearch
  });

  // Display loading message
  if (loading) {
    return <div>Loading conferences...</div>;
  }

    // Display error message
  if (error) {
      return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full"> {/* Added w-full */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Conference Results ({totalItems})</h2>
        <div className="flex items-center">
          <label htmlFor="sort-by" className="mr-2">Sort by:</label>
          <select
            id="sort-by"
            className="border rounded px-2 py-1"
            value={sortBy}
            onChange={handleSortByChange}
          >
            <option value="date">Date</option>
            <option value="rank">Rank</option>
            <option value="name">Name</option>
            {/* Add other sort options if needed */}
          </select>
        </div>
      </div>

      {sortedEvents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"> {/* Grid layout */}
            {sortedEvents.map((event) => (
              <EventCard event={event} />
            ))}
          </div>
          <Pagination
            eventsPerPage={eventsPerPage}
            totalEvents={totalItems}
            paginate={paginate}
            currentPage={currentPage}
          />
        </>
      ) : (
        <p>No conferences found matching your criteria.</p>
      )}
    </div>
  );
};

export default ResultsSection;