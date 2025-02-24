// ResultsSection.tsx
import React, { useState, useEffect } from 'react';
import EventCard from './EventCard';
import Pagination from './Pagination';

interface Event {
    id: number;
    name: string;
    shortName: string;
    startDate: string;
    endDate: string;
    location: string;
    imageUrl: string;
    rank: string;
    averageScore: number;
    topics: string[];
    type: 'online' | 'offline' | 'hybrid';
    submissionDate: string;
    source: number;
    fieldOfResearch: string;
    publish: boolean;
}

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

type SortOption = 'date' | 'rank' | 'score' | 'name' | 'submissionDate' | 'startDate' | 'endDate';

const ResultsSection: React.FC<ResultsSectionProps> = ({
    searchQuery, selectedLocation, selectedType, startDate, endDate,
    submissionDate, selectedRank, selectedSourceYear, selectedAverageScore, selectedTopics, selectedFieldsOfResearch
}) => {
    const initialEvents: Event[] = [
        {
            id: 1,
            name: 'Tech Conference 2023',
            shortName: 'TechConf',
            startDate: '2023-11-01',
            endDate: '2023-11-03',
            location: 'New York',
            imageUrl: '/conference_image.png',
            rank: 'A',
            averageScore: 4.5,
            topics: ['AI', 'Cloud Computing'],
            type: 'offline',
            submissionDate: '2023-10-01',
            source: 2023,
            fieldOfResearch: 'Technology',
            publish: true,
        },
        {
            id: 2,
            name: 'Online AI Summit',
            shortName: 'AISummit',
            startDate: '2023-12-05',
            endDate: '2023-12-06',
            location: 'Online',
            imageUrl: '/conference_image.png',
            rank: 'B',
            averageScore: 4.0,
            topics: ['AI', 'Machine Learning'],
            type: 'online',
            submissionDate: '2023-11-15',
            source: 2023,
            fieldOfResearch: 'Artificial Intelligence',
            publish: true,
        },
        {
            id: 3,
            name: 'Hybrid DevOps Conference',
            shortName: 'DevOpsConf',
            startDate: '2023-10-15',
            endDate: '2023-10-17',
            location: 'San Francisco',
            imageUrl: '/conference_image.png',
            rank: 'A',
            averageScore: 4.8,
            topics: ['DevOps', 'Cloud'],
            type: 'hybrid',
            submissionDate: '2023-09-30',
            source: 2023,
            fieldOfResearch: 'DevOps',
            publish: true,
        },
        {
            id: 4,
            name: 'Cybersecurity Workshop',
            shortName: 'CyberSec',
            startDate: '2023-09-20',
            endDate: '2023-09-21',
            location: 'Chicago',
            imageUrl: '/conference_image.png',
            rank: 'C',
            averageScore: 3.5,
            topics: ['Cybersecurity'],
            type: 'offline',
            submissionDate: '2023-08-20',
            source: 2023,
            fieldOfResearch: 'Cybersecurity',
            publish: true,
        },
        {
            id: 5,
            name: 'Data Science Bootcamp',
            shortName: 'DataBootcamp',
            startDate: '2023-08-10',
            endDate: '2023-08-12',
            location: 'Boston',
            imageUrl: '/conference_image.png',
            rank: 'B',
            averageScore: 4.2,
            topics: ['Data Science', 'Big Data'],
            type: 'offline',
            submissionDate: '2023-07-10',
            source: 2023,
            fieldOfResearch: 'Data Science',
            publish: true,
        },
        {
            id: 6,
            name: 'Virtual Reality Expo',
            shortName: 'VRExpo',
            startDate: '2023-07-25',
            endDate: '2023-07-27',
            location: 'Online',
            imageUrl: '/conference_image.png',
            rank: 'A',
            averageScore: 4.7,
            topics: ['Virtual Reality', 'AR'],
            type: 'online',
            submissionDate: '2023-06-25',
            source: 2023,
            fieldOfResearch: 'Virtual Reality',
            publish: true,
        },
        {
            id: 7,
            name: 'Blockchain Summit 2023',
            shortName: 'BlockchainSummit',
            startDate: '2023-06-15',
            endDate: '2023-06-17',
            location: 'Los Angeles',
            imageUrl: '/conference_image.png',
            rank: 'B',
            averageScore: 4.3,
            topics: ['Blockchain', 'Cryptocurrency'],
            type: 'offline',
            submissionDate: '2023-05-15',
            source: 2023,
            fieldOfResearch: 'Blockchain',
            publish: true,
        },
    ];

    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [currentPage, setCurrentPage] = useState(1);
    const eventsPerPage = 6;
    const [sortBy, setSortBy] = useState<SortOption>('date'); // Default sort by date

    useEffect(() => {
        let filteredEvents = initialEvents;

        // Apply filters
        if (searchQuery) {
            filteredEvents = filteredEvents.filter(event =>
                event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.shortName.toLowerCase().includes(searchQuery.toLowerCase())
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
                return eventSubmissionDate <= submissionDate; // Assuming you want events with submission date before or on selected date
            });
        }

        if (selectedRank) {
            filteredEvents = filteredEvents.filter(event =>
                event.rank === selectedRank
            );
        }

        if (selectedSourceYear) {
            filteredEvents = filteredEvents.filter(event =>
                String(event.source) === selectedSourceYear // Convert source to string for comparison
            );
        }

        if (selectedAverageScore) {
            filteredEvents = filteredEvents.filter(event =>
                String(event.averageScore) === selectedAverageScore // Convert averageScore to string
            );
        }

        if (selectedTopics && selectedTopics.length > 0) {
            filteredEvents = filteredEvents.filter(event =>
                event.topics.some(topic => selectedTopics.includes(topic)) // Event topics contain at least one selected topic
            );
        }

        if (selectedFieldsOfResearch && selectedFieldsOfResearch.length > 0) {
            filteredEvents = filteredEvents.filter(event =>
                selectedFieldsOfResearch.includes(event.fieldOfResearch) // Event field matches at least one selected field (exact match for now)
            );
        }

        // Apply sorting
        let sortedEvents = [...filteredEvents]; // Create a copy to avoid mutating original array
        switch (sortBy) {
            case 'rank':
                sortedEvents.sort((a, b) => a.rank.localeCompare(b.rank));
                break;
            case 'score':
                sortedEvents.sort((a, b) => b.averageScore - a.averageScore); // Sort by score descending
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
    }, [searchQuery, selectedLocation, selectedType, startDate, endDate, submissionDate, selectedRank, selectedSourceYear, selectedAverageScore, selectedTopics, selectedFieldsOfResearch, sortBy]);

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
                        <option value="score">Score</option>
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