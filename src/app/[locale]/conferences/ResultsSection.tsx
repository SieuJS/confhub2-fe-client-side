// src/components/conferences/ResultsSection.tsx
import React, { useState } from 'react';
import EventCard from './EventCard';
import EventTable from './EventTable';
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
    sortOrder,
    paginate,
    handleSortByChange,
    handleSortOrderChange,
    handleEventPerPageChange,
    loading,
    error,
  } = useConferenceResults();

  const [viewType, setViewType] = useState<'card' | 'table'>('card');

  if (loading) {
    return <div>Loading conferences...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        <h2 className="text-xl font-semibold mb-2 sm:mb-0">
          Conference Results ({totalItems})
        </h2>

        <div className="flex items-center space-x-2">
          {/* Sort Controls */}
          <div className="flex items-center space-x-2">
            <label htmlFor="sort-by" className="mr-2 text-sm">Sort by:</label>
            <select
              id="sort-by"
              className="border rounded px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={sortBy}
              onChange={handleSortByChange}
              title="Select field to sort by"
            >
              <option value="date">Date</option>
              <option value="rank">Rank</option>
              <option value="name">Name</option>
              <option value="toDate">Start Date</option>
              <option value="endDate">End Date</option>
            </select>

            <label htmlFor="event-per-page" className="mr-2 text-sm">Event per page:</label>
            <select
              id="event-per-page"
              className="border rounded px-2 py-1 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={eventsPerPage}
              onChange={handleEventPerPageChange}
              title="Select number of event per page"
            >
              <option value='5'>5</option>
              <option value='10'>10</option>
              <option value='20'>20</option>
              <option value='50'>50</option>
              <option value='100'>100</option>
            </select>

            <button
              onClick={handleSortOrderChange}
              className="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={sortOrder === 'asc' ? 'Sort Ascending' : 'Sort Descending'}
            >
              {sortOrder === 'asc' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#454545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-narrow-wide"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#454545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down-wide-narrow"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg>
              )}
            </button>
          </div>

          {/* View Type Toggle */}
          <button
            onClick={() => setViewType((prev) => prev === 'card' ? 'table' : 'card')}
            className="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={viewType === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
          >
            {viewType === 'card' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#454545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sheet"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" x2="21" y1="9" y2="9" /><line x1="3" x2="21" y1="15" y2="15" /><line x1="9" x2="9" y1="9" y2="21" /><line x1="15" x2="15" y1="9" y2="21" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#454545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>)}
          </button>

          {/* --- ADDED: Download CSV Button --- */}
          <button
            // onClick={handleDownloadCSV}
            className="px-2 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Download CSV"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#454545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-down"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></svg>
          </button>
        </div>
      </div>

      {sortedEvents && sortedEvents?.payload?.length > 0 ? (
        <>
          {viewType === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedEvents.payload.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <EventTable events={sortedEvents.payload} />
          )}
          <div className="mt-4">
            {console.log(currentPage)}
            <Pagination
              eventsPerPage={Number(eventsPerPage)}
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