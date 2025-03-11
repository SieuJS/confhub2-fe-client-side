// components/conference/ResultsSection.tsx
import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import Pagination from '../utils/Pagination';
import { ConferenceResponse } from '../../../../models/response/conference.response';
import conferenceList from '../../../../models/data/conferences-list.json';


interface ResultsSectionProps {
  searchQuery: string;
  selectedLocation: string | null;
  selectedType: 'online' | 'offline' | 'hybrid' | null;
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

type SortOption = 'date' | 'rank' | 'name' | 'submissionDate' | 'startDate' | 'endDate';

interface ConferenceDates {
  startDate: Date | null;
  endDate: Date | null;
}

function parseConferenceDates(dateString: string | undefined | null): ConferenceDates {
    if (!dateString) {
        return { startDate: null, endDate: null };
    }

    const dateParts = dateString.split(' - ');
    if (dateParts.length === 0 || dateParts.length > 2) {
        console.error("Invalid date format:", dateString);
        return { startDate: null, endDate: null };
    }

    try {
        if (dateParts.length === 1) {
            const [singleDatePart] = dateParts;
            const [monthAndDay, year] = singleDatePart.split(', ');
            const [month, days] = monthAndDay.split(" ");

            if (days.includes("-")) {
                const [startDay, endDay] = days.split('-');
                const startDate = new Date(`${month} ${startDay}, ${year}`);
                const endDate = new Date(`${month} ${endDay}, ${year}`);
                 if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                  throw new Error("Invalid date format") // Handle invalid date
                }
                return { startDate, endDate };
            } else {
                const startDate = new Date(`${month} ${days}, ${year}`);
                 if (isNaN(startDate.getTime())) {
                    throw new Error("Invalid date format")
                 }
                return { startDate, endDate: startDate }
            }
        } else {
            let [startDateStr, endDateStr] = dateParts;
            const [startMonth, startDay] = startDateStr.split(" ");

            let endMonth, endDay, year;
            if (startDateStr.includes(",")) {
              console.error("Invalid date format:", dateString)
              return { startDate: null, endDate: null };
            }

            if (!endDateStr.includes(",")) {
              const currentYear = new Date().getFullYear();
              endDateStr = endDateStr + `, ${currentYear}`;
            }
            [endMonth, endDay, year] = endDateStr.split(/[, ]+/);

            const startDate = new Date(`${startMonth} ${startDay}, ${year}`);
            const endDate = new Date(`${endMonth} ${endDay}, ${year}`);
             if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
              throw new Error("Invalid date format") // Handle invalid date
            }
            return { startDate, endDate };
        }
    } catch (error) {
        console.error("Error parsing date string:", dateString, error);
        return { startDate: null, endDate: null };
    }
}

const ResultsSection: React.FC<ResultsSectionProps> = ({
  searchQuery, selectedLocation, selectedType, startDate, endDate,
  submissionDate, selectedRank, selectedTopics, selectedFieldsOfResearch, selectedPublisher, selectedAverageScore, selectedSourceYear
}) => {
  const [events, setEvents] = useState<ConferenceResponse[]>(conferenceList as ConferenceResponse[]);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;
  const [sortBy, setSortBy] = useState<SortOption>(); // Default sort by date

  useEffect(() => {
    let filteredEvents = conferenceList as ConferenceResponse[];

    // Apply filters
    if (searchQuery) {
      filteredEvents = filteredEvents.filter(event =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.acronym.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedLocation) {
      filteredEvents = filteredEvents.filter(event =>
        event.location?.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    if (selectedType) {
      filteredEvents = filteredEvents.filter(event =>
        event.type === selectedType
      );
    }

    // --- Date Filtering ---
    if (startDate) {
      filteredEvents = filteredEvents.filter(event => {
        const { startDate: eventStartDate } = parseConferenceDates(event.conferenceDates);
        return eventStartDate && (eventStartDate >= startDate || eventStartDate.toDateString() == startDate.toDateString());
      });
    }

    if (endDate) {
      filteredEvents = filteredEvents.filter(event => {
        const { endDate: eventEndDate } = parseConferenceDates(event.conferenceDates);
        return eventEndDate && (eventEndDate <= endDate || eventEndDate.toDateString() == endDate.toDateString());
      });
    }

    if (submissionDate) {
        filteredEvents = filteredEvents.filter(event => {
            // Assuming submissionDate is a single date, not a range.  Adjust if needed.
            const eventSubmissionDates = event.submissionDate; // This is a Record<string, string>
             if(!eventSubmissionDates) return false; // If no submission dates at all, filter it out.

             // Check *any* of the submission dates.
             for(const deadline of Object.values(eventSubmissionDates)) { // Iterate through values.
                const parsedSubmissionDate = new Date(deadline);  // Parse the individual date string.
                if(!isNaN(parsedSubmissionDate.getTime()) && parsedSubmissionDate <= submissionDate) { // Make sure it is a valid date.
                    return true; // If *any* date matches, include the event.
                }
             }
             return false; // If no dates matched, filter the event out.
        });
    }

    if (selectedRank) {
      filteredEvents = filteredEvents.filter(event =>
        event.rank === selectedRank
      );
    }

    if (selectedSourceYear) {
      filteredEvents = filteredEvents.filter(event =>
        event.source === selectedSourceYear
      );
    }
    
    if (selectedPublisher) {
      filteredEvents = filteredEvents.filter(event =>
        event.publisher === selectedPublisher
      );
      
    }

    if (selectedAverageScore) {
      filteredEvents = filteredEvents.filter(event =>
        event.rating === selectedAverageScore
      );
      
    }

    if (selectedTopics && selectedTopics.length > 0) {
      filteredEvents = filteredEvents.filter(event => {
          if (!event.topics) {
              return false;
          }
          const eventTopics = event.topics.split(',').map(topic => topic.trim());
          return eventTopics.some(topic => selectedTopics.includes(topic));
      });
    }

    if (selectedFieldsOfResearch && selectedFieldsOfResearch.length > 0) {
      filteredEvents = filteredEvents.filter(event => {
          if(!event.fieldOfResearch) {
            return false;
          }
          const eventFields = event.fieldOfResearch.split(',').map(field => field.trim());
          return eventFields.some(field => selectedFieldsOfResearch.includes(field));
      });

    
}

    // --- Sorting ---
    let sortedEvents = [...filteredEvents];
    switch (sortBy) {
      case 'rank':
        sortedEvents.sort((a, b) => a.rank.localeCompare(b.rank));
        break;
      case 'name':
        sortedEvents.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'submissionDate':
        sortedEvents.sort((a, b) => {
            // Find the *earliest* submission deadline for each conference.
            const submissionDatesA = a.submissionDate ? Object.values(a.submissionDate) : [];
            const submissionDatesB = b.submissionDate ? Object.values(b.submissionDate) : [];
            // Use Infinity so if no date, this event is put at last
            const earliestDateA = submissionDatesA.length > 0 ? Math.min(...submissionDatesA.map(date => new Date(date).getTime())) : Infinity;
            const earliestDateB = submissionDatesB.length > 0 ? Math.min(...submissionDatesB.map(date => new Date(date).getTime())) : Infinity;

            return earliestDateA - earliestDateB;
        });
        break;
      case 'startDate':
      case 'date':
        sortedEvents.sort((a, b) => {
          const { startDate: startDateA } = parseConferenceDates(a.conferenceDates);
          const { startDate: startDateB } = parseConferenceDates(b.conferenceDates);

          if (!startDateA) return 1;   // Put events without start date at the end
          if (!startDateB) return -1;  // Put events without start date at the end

          return startDateA.getTime() - startDateB.getTime();
        });
        break;
      case 'endDate':
        sortedEvents.sort((a, b) => {
            const { endDate: endDateA } = parseConferenceDates(a.conferenceDates);
            const { endDate: endDateB } = parseConferenceDates(b.conferenceDates);

            if (!endDateA) return 1; // Put events without end date at the end
            if (!endDateB) return -1;

            return endDateA.getTime() - endDateB.getTime();
        });
        break;

    }


    setEvents(sortedEvents);
    setCurrentPage(1);
  }, [searchQuery, selectedLocation, selectedType, startDate, endDate, submissionDate, selectedRank, selectedTopics, selectedFieldsOfResearch, selectedPublisher, selectedSourceYear, sortBy]);

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value as SortOption);
  };

  
  if (!currentEvents || currentEvents.length === 0) {
    return <p>Không tìm thấy hội nghị nào.</p>;
  }
  return (
    <div className="w-full pl-8">
      {selectedSourceYear && <div>Query: {selectedSourceYear}</div>}
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
          <span className="text-sm mr-1">Sort by:</span>
          <select
            className="text-sm border rounded px-2 py-1 bg-transparent focus:outline-none"
            value={sortBy}
            onChange={handleSortByChange}
          >
            <option value=""></option>
            <option value="rank">Rank</option>
            <option value="name">Name</option>
            <option value="submissionDate">Submission Date</option>
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
        totalEvents={events.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </div>
  );
};

export default ResultsSection;