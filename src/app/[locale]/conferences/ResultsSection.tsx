// src/components/conferences/ResultsSection.tsx
import React from 'react';
import EventCard from './EventCard';
import useConferenceResults from '@/src/hooks/conferences/useConferenceResults';
import Pagination from '../utils/Pagination';

interface ResultsSectionProps { }

const ResultsSection: React.FC<ResultsSectionProps> = () => {
  const {
    sortedEvents,
    totalItems,
    eventsPerPage,
    currentPage,
    sortBy,
    sortOrder, // Add sortOrder
    paginate,
    handleSortByChange,
    handleSortOrderChange, // Add handleSortOrderChange
    loading,
    error,
  } = useConferenceResults();

  if (loading) {
    return <div>Loading conferences...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">Conference Results ({totalItems})</h2>
        <div className="flex items-center space-x-2"> {/* Added space-x-2 */}
          <label htmlFor="sort-by" className="mr-2 text-sm">Sort by:</label>
          <select
            id="sort-by"
            className="border rounded px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={sortBy}
            onChange={handleSortByChange}
          >
            <option value="date">Date</option>
            <option value="rank">Rank</option>
            <option value="name">Name</option>
            <option value="startDate">Start Date</option>
            <option value="endDate">End Date</option>
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={handleSortOrderChange}
            className="px-3 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sortOrder === 'asc' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>

            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 13.5L12 21m0 0l7.5-7.5M12 21V3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {sortedEvents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          <div className="mt-4">
            <Pagination
              eventsPerPage={eventsPerPage}
              totalEvents={totalItems}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>
        </>
      ) : (
        <p>No conferences found matching your criteria.</p>
      )}
    </div>
  );
};

export default ResultsSection;