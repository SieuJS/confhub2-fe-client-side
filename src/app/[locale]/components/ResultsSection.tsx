import React from 'react';
import EventCard from './EventCard';
import FilterSidebar from './FilterSidebar';
import Pagination from './Pagination';

const ResultsSection = () => {
  // Dummy data for events (replace with your actual data fetching logic)
  const events = [
    {
      id: 1,
      title: 'ACM POPL 2025',
      subtitle: 'ACM SIGPLAN Symposium on Principle of Programming Languages',
      date: '20 May, 2025 - 21 May, 2025',
      location: 'New York, USA',
      imageUrl: '/conference_image.png',
      grade: 'A+',
      topics: ['Biology', 'Biology', 'Biology', 'Biology'],
    },
    {
      id: 2,
      title: 'ACM 2025',
      subtitle: 'ACM ASIA Conference on Computer and Communications',
      date: '20 - 21 May, 2025',
      location: 'New York, USA',
      imageUrl: '/conference_image.png',
      grade: null,
      topics: ['Biology', 'Software and architecture', 'Biology'],
    },
    {
      id: 3,
      title: 'ACM 2025',
      subtitle: 'ACM ASIA Conference on Computer and Communications',
      date: '20 May - 21 June, 2025',
      location: 'New York, USA',
      imageUrl: '/conference_image.png',
      grade: 'A',
      topics: ['Biology', 'Biology', 'Biology'],
    },
    {
      id: 4,
      title: 'ACM 2025',
      subtitle: 'ACM ASIA Conference on Computer and Communications',
      date: '20 May, 2025 - 21 May, 2025',
      location: 'New York, USA',
      imageUrl: '/conference_image.png',
      grade: 'B',
      topics: ['Biology', 'Biology', 'Biology'],
    },
    {
      id: 5,
      title: 'ACM 2025',
      subtitle: 'ACM ASIA Conference on Computer and Communications',
      date: '20 May, 2025 - 21 May, 2025',
      location: 'New York, USA',
      imageUrl: '/conference_image.png',
      grade: 'C',
      topics: ['Biology', 'Biology', 'Biology'],
    },
    {
      id: 6,
      title: 'ACM 2025',
      subtitle: 'ACM ASIA Conference on Computer and Communications',
      date: '20 May, 2025 - 21 May, 2025',
      location: 'New York, USA',
      imageUrl: '/conference_image.png',
      grade: 'B+',
      topics: ['Biology', 'Biology', 'Biology'],
    },
  ];

  return (
    <div className="container mx-auto mt-8 px-4 flex">
      {/* Filter Sidebar */}
      <FilterSidebar />

      {/* Results Container */}
      <div className="w-3/4 pl-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recommended for you (36)</h2>
          <div className="flex items-center  rounded-md px-2 py-1">
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
            <span className="text-sm ">Sort by:</span>
            <span className="text-sm  ml-1">Conference date</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {events.map((event) => (
    <EventCard key={event.id} event={event} />
  ))}
</div>

        {/* Pagination */}
        <Pagination />
      </div>
    </div>
  );
};

export default ResultsSection;