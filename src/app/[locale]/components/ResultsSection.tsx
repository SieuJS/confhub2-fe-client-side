// ResultsSection.tsx
import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import Pagination from './Pagination';
import {ConferenceResponse} from '../../../models/response/conference.response'; // Import your ConferenceResponse type
import conferenceList from '../../../models/data/conferences-list.json'; // Assuming conference-list.json is in the same directory

interface ResultsSectionProps {
    searchQuery: string;
    selectedLocation: string | null;
    selectedType: 'online' | 'offline' | 'hybrid' | null;
    startDate: Date | null;
    endDate: Date | null;
    submissionDate: Date | null;
    selectedRank: string | null;
    selectedSourceYear: string | null;
    selectedAverageScore: string | null;
    selectedTopics: string[];
    selectedFieldsOfResearch: string[];
}

type SortOption = 'date' | 'rank' | 'name' | 'submissionDate' | 'startDate' | 'endDate';

// Define Event type as ConferenceResponse
type Event = ConferenceResponse;

const ResultsSection: React.FC<ResultsSectionProps> = ({
    searchQuery, selectedLocation, selectedType, startDate, endDate,
    submissionDate, selectedRank, selectedTopics, selectedFieldsOfResearch
}) => {
    // Initialize events state with conferenceList data loaded from JSON and typed as ConferenceResponse[]
    const [events, setEvents] = useState<ConferenceResponse[]>(conferenceList as ConferenceResponse[]);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 6;
    const [sortBy, setSortBy] = useState<SortOption>('date'); // Default sort by date

    useEffect(() => {
        let filteredEvents = conferenceList as ConferenceResponse[]; // Start filtering from the loaded conferenceList

        // Apply filters
        if (searchQuery) {
            filteredEvents = filteredEvents.filter(event =>
                event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.acronym.toLowerCase().includes(searchQuery.toLowerCase()) // Using acronym from ConferenceResponse
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

        // Apply advanced filters
        if (submissionDate) {
            filteredEvents = filteredEvents.filter(event => {
                const eventSubmissionDate = new Date(event.submissionDate);
                return eventSubmissionDate <= submissionDate;
            });
        }

        if (selectedRank) {
            filteredEvents = filteredEvents.filter(event =>
                event.rank === selectedRank
            );
        }

        if (selectedTopics && selectedTopics.length > 0) {
            filteredEvents = filteredEvents.filter(event =>
                event.topics.some(topic => selectedTopics.includes(topic))
            );
        }

        if (selectedFieldsOfResearch && selectedFieldsOfResearch.length > 0) {
            filteredEvents = filteredEvents.filter(event =>
                selectedFieldsOfResearch.includes(event.category) // Filtering by event.category (from ConferenceResponse)
            );
        }

        // Apply sorting
        let sortedEvents = [...filteredEvents];
        switch (sortBy) {
            case 'rank':
                sortedEvents.sort((a, b) => a.rank.localeCompare(b.rank));
                break;
            case 'name':
                sortedEvents.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'submissionDate':
                sortedEvents.sort((a, b) => new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime());
                break;
            case 'startDate':
                sortedEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                break;
            case 'endDate':
                sortedEvents.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
                break;
            case 'date': // Sort by conference date (default - which is start date)
            default:
                sortedEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                break;
        }

        setEvents(sortedEvents);
        setCurrentPage(1); // Reset to first page when filters or sort change
    }, [searchQuery, selectedLocation, selectedType, startDate, endDate, submissionDate, selectedRank, selectedTopics, selectedFieldsOfResearch, sortBy]);

    // Calculate the events to display on the current page
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(event.target.value as SortOption);
    };

    return (
        <div className="w-full pl-8">
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
                        <option value="date">Conference date</option>
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