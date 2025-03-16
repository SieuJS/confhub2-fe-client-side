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

// interface ConferenceDates {
//   startDate: Date | null;
//   endDate: Date | null;
// }

// function parseConferenceDates(dateString: string | undefined | null): ConferenceDates {
//     if (!dateString) {
//         return { startDate: null, endDate: null };
//     }

//     const dateParts = dateString.split(' - ');
//     if (dateParts.length === 0 || dateParts.length > 2) {
//         console.error("Invalid date format:", dateString);
//         return { startDate: null, endDate: null };
//     }

//     try {
//         if (dateParts.length === 1) {
//             const [singleDatePart] = dateParts;
//             const [monthAndDay, year] = singleDatePart.split(', ');
//             const [month, days] = monthAndDay.split(" ");

//             if (days.includes("-")) {
//                 const [startDay, endDay] = days.split('-');
//                 const startDate = new Date(`${month} ${startDay}, ${year}`);
//                 const endDate = new Date(`${month} ${endDay}, ${year}`);
//                  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//                   throw new Error("Invalid date format") // Handle invalid date
//                 }
//                 return { startDate, endDate };
//             } else {
//                 const startDate = new Date(`${month} ${days}, ${year}`);
//                  if (isNaN(startDate.getTime())) {
//                     throw new Error("Invalid date format")
//                  }
//                 return { startDate, endDate: startDate }
//             }
//         } else {
//             let [startDateStr, endDateStr] = dateParts;
//             const [startMonth, startDay] = startDateStr.split(" ");

//             let endMonth, endDay, year;
//             if (startDateStr.includes(",")) {
//               console.error("Invalid date format:", dateString)
//               return { startDate: null, endDate: null };
//             }

//             if (!endDateStr.includes(",")) {
//               const currentYear = new Date().getFullYear();
//               endDateStr = endDateStr + `, ${currentYear}`;
//             }
//             [endMonth, endDay, year] = endDateStr.split(/[, ]+/);

//             const startDate = new Date(`${startMonth} ${startDay}, ${year}`);
//             const endDate = new Date(`${endMonth} ${endDay}, ${year}`);
//              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
//               throw new Error("Invalid date format") // Handle invalid date
//             }
//             return { startDate, endDate };
//         }
//     } catch (error) {
//         console.error("Error parsing date string:", dateString, error);
//         return { startDate: null, endDate: null };
//     }
// }

const ResultsSection: React.FC<ResultsSectionProps> = ({
  searchQuery, selectedLocation, selectedType, startDate, endDate,
  submissionDate, selectedRank, selectedTopics, selectedFieldsOfResearch, selectedPublisher, selectedAverageScore, selectedSourceYear
}) => {

  const [events, setEvents] = useState<ConferenceListResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;
  const [sortBy, setSortBy] = useState<SortOption>('date'); // Default sort by date

  useEffect(() => {
    async function getListConf() {
      try {
        const conferenceInfo = await getListConference();
        setEvents(conferenceInfo);
      } catch (err: any) {
        console.error('Error updating conference data:', err);
      }
    }
    getListConf();
  }, []);

  useEffect(() => {
    if (!events?.payload) {
      return; // No data yet, don't filter
    }

    let filteredEvents: ConferenceInfo[] = [...events.payload]; // Create a copy to avoid modifying the original

    // Apply filters
    if (searchQuery) {
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.acronym.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLocation) {
      filteredEvents = filteredEvents.filter(event =>
        event.location['country'].toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedType) {
      filteredEvents = filteredEvents.filter(event =>
        event.accessType === selectedType
      );
    }
    // Date Filtering (using Date objects directly)
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
        event.rank === selectedRank
      );
    }

    if (selectedSourceYear) {
      filteredEvents = filteredEvents.filter(event =>
        event.year === Number(selectedSourceYear)
      );
    }

    if (selectedTopics && selectedTopics.length > 0) {
      filteredEvents = filteredEvents.filter(event => {
        if (!event.topics) {
          return false;
        }
        const eventTopics = event.topics.map(topic => topic.trim());
        return eventTopics.some(topic => selectedTopics.includes(topic));
      });
    }

    if (selectedFieldsOfResearch && selectedFieldsOfResearch.length > 0) {
      filteredEvents = filteredEvents.filter(event => {
        if (!event.researchFields) {
          return false;
        }
        const eventFields = event.researchFields.map(field => field.trim());
        return eventFields.some(field => selectedFieldsOfResearch.includes(field));
      });
    }
    // Sorting
    let sortedEvents = [...filteredEvents]; // Copy again before sorting
    switch (sortBy) {
      case 'rank':
        sortedEvents.sort((a, b) => a.rank.localeCompare(b.rank));
        break;
      case 'name':
        sortedEvents.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'startDate':
      case 'date': // Assuming 'date' sorts by start date
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

    setEvents({ ...events, payload: sortedEvents });  // Update events with the filtered and sorted data
    setCurrentPage(1); // Reset to the first page after filtering/sorting
  }, [searchQuery, selectedLocation, selectedType, startDate, endDate, selectedRank, selectedTopics, selectedFieldsOfResearch, selectedSourceYear, sortBy, events?.meta]); // Include events.meta in dependency array

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events?.payload?.slice(indexOfFirstEvent, indexOfLastEvent);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as SortOption);
  };


  if (!currentEvents || currentEvents.length === 0) {
    return <p>Không tìm thấy hội nghị nào.</p>;
  }

  return (
    <div className="w-full pl-8">
      {/* {selectedSourceYear && <div>Query: {selectedSourceYear}</div>} */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">
          Recommended for you ({events?.payload.length})
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
            {/* <option value="submissionDate">Submission Date</option> */}
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
        totalEvents={events?.payload.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
};

export default ResultsSection;