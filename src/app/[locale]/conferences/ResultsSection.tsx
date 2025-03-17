// src/components/conferences/ResultsSection.tsx
import React from 'react';
import EventCard from './EventCard';
import useConferenceResults from '@/src/hooks/conferences/useConferenceResults'; // Adjust the path as needed
import Pagination from '../utils/Pagination';

// No longer need filter props here
interface ResultsSectionProps {}

const ResultsSection: React.FC<ResultsSectionProps> = () => {
  const {
    sortedEvents,
    totalItems,
    eventsPerPage,
    currentPage,
    sortBy,
    paginate,
    handleSortByChange,
    loading,
    error,
  } = useConferenceResults(); // No props passed to the hook

  if (loading) {
    return <div>Loading conferences...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full">
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
            <option value="startDate">Start Date</option> {/* Added Start Date option */}
            <option value="endDate">End Date</option>     {/* Added End Date option */}
          </select>
        </div>
      </div>

      {sortedEvents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedEvents.map((event) => (
              <EventCard key={event.id} event={event} /> // Added key prop
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