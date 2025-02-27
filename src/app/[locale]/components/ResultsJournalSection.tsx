// ResultsJournalSection.tsx
"use client";

import React, { useState, useEffect } from 'react';
import EventJournalCard from './EventJournalCard';
import Pagination from './Pagination';
import { JournalResponse } from '../../../models/response/journal.response';
import journalsList from '../../../models/data/journals-list.json'; // Import journals-list.json

interface ResultsJournalSectionProps {
    searchQuery: string;
    selectedCountry: string | null;
    selectedPublicationType: string | null;
    selectedSubjectAreas: string[];
    selectedQuartile: string | null;
    selectedOpenAccessTypes: string[];
    selectedPublisher: string | null;
    selectedLanguage: string | null;
    selectedImpactFactor: string | null;
    selectedHIndex: string | null;
    selectedCiteScore: string | null;
    selectedSJR: string | null;
    selectedOverallRank: string | null;
    selectedISSN: string | null;
    loading?: boolean;
}

type JournalSortOption = 'title' | 'issn' | 'publisher' | 'language' | 'impactFactor' | 'citeScore' | 'sjr' | 'overallRank' | 'hIndex';

type JournalEvent = JournalResponse;

const ResultsJournalSection: React.FC<ResultsJournalSectionProps> = ({ // Removed journalsData prop
    searchQuery, selectedCountry, selectedPublicationType,
    selectedSubjectAreas, selectedQuartile, selectedOpenAccessTypes,
    selectedPublisher, selectedLanguage, selectedImpactFactor, selectedHIndex,
    selectedCiteScore, selectedSJR, selectedOverallRank, selectedISSN, loading
}) => {
    const [journals, setJournals] = useState<JournalResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const journalsPerPage = 6;
    const [sortBy, setSortBy] = useState<JournalSortOption>('title');

    useEffect(() => {
        // Load journals data from journalsList.json on component mount
        setJournals(journalsList as JournalResponse[]);
    }, []); // Empty dependency array to run only once on mount


    useEffect(() => {
        if (journals.length === 0) { // Use the local journals state now
            return;
        }

        let filteredJournals = [...journals]; // Use local journals state for filtering

        if (searchQuery) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedCountry) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.countryOfPublication === selectedCountry
            );
        }

        if (selectedPublicationType) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.publicationType === selectedPublicationType
            );
        }

        if (selectedSubjectAreas && selectedSubjectAreas.length > 0) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.subjectAreas?.some(subject => selectedSubjectAreas.includes(subject.area))
            );
        }

        if (selectedQuartile) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.bestQuartileOverall === selectedQuartile
            );
        }

        if (selectedOpenAccessTypes && selectedOpenAccessTypes.length > 0) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.openAccessType && selectedOpenAccessTypes.includes(journal.openAccessType)
            );
        }

        if (selectedPublisher) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.publisher === selectedPublisher
            );
        }

        if (selectedLanguage) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.language === selectedLanguage
            );
        }

        if (selectedISSN) {
            filteredJournals = filteredJournals.filter(journal =>
                journal.issn.some(issn => issn === selectedISSN)
            );
        }

        // Metric filters - Assuming metrics are string ranges like ">10", "<5", "5-10"
        const filterMetric = (metricValue: number | undefined, selectedValue: string | null): boolean => {
            if (!selectedValue || metricValue === undefined) return true;
            try {
                const selectedNum = parseFloat(selectedValue.replace(/[^0-9.-]/g, ''));
                const journalNum = metricValue;

                if (selectedValue.startsWith(">=")) return journalNum >= selectedNum;
                if (selectedValue.startsWith(">")) return journalNum > selectedNum;
                if (selectedValue.startsWith("<=")) return journalNum <= selectedNum;
                if (selectedValue.startsWith("<")) return journalNum < selectedNum;
                if (selectedValue.includes("-")) {
                    const [minStr, maxStr] = selectedValue.split("-");
                    const min = parseFloat(minStr);
                    const max = parseFloat(maxStr);
                    return journalNum >= min && journalNum <= max;
                }

                return journalNum === selectedNum;
            } catch (error) {
                console.error("Error parsing metric value:", error);
                return true;
            }
        };


        if (selectedImpactFactor) {
            filteredJournals = filteredJournals.filter(journal => filterMetric(journal.metrics?.impactFactor, selectedImpactFactor));
        }

        if (selectedHIndex) {
            filteredJournals = filteredJournals.filter(journal => filterMetric(journal.metrics?.hIndex, selectedHIndex));
        }

        if (selectedCiteScore) {
            filteredJournals = filteredJournals.filter(journal => filterMetric(journal.metrics?.citeScore, selectedCiteScore));
        }

        if (selectedSJR) {
            filteredJournals = filteredJournals.filter(journal => filterMetric(journal.metrics?.sjr, selectedSJR));
        }

        if (selectedOverallRank) {
            filteredJournals = filteredJournals.filter(journal => filterMetric(journal.metrics?.overallRank, selectedOverallRank));
        }


        // Apply sorting
        let sortedJournals = [...filteredJournals];
        switch (sortBy) {
            case 'title':
                sortedJournals.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'issn':
                sortedJournals.sort((a, b) => (a.issn?.[0] || '').localeCompare(b.issn?.[0] || ''));
                break;
            case 'publisher':
                sortedJournals.sort((a, b) => (a.publisher || '').localeCompare(b.publisher || ''));
                break;
            case 'language':
                sortedJournals.sort((a, b) => (a.language || '').localeCompare(b.language || ''));
                break;
            case 'impactFactor':
                sortedJournals.sort((a, b) => (b.metrics?.impactFactor || 0) - (a.metrics?.impactFactor || 0));
                break;
            case 'citeScore':
                sortedJournals.sort((a, b) => (b.metrics?.citeScore || 0) - (a.metrics?.citeScore || 0));
                break;
            case 'sjr':
                sortedJournals.sort((a, b) => (b.metrics?.sjr || 0) - (a.metrics?.sjr || 0));
                break;
            case 'overallRank':
                sortedJournals.sort((a, b) => (a.metrics?.overallRank || Infinity) - (b.metrics?.overallRank || Infinity));
                break;
            case 'hIndex':
                sortedJournals.sort((a, b) => (b.metrics?.hIndex || 0) - (a.metrics?.hIndex || 0));
                break;
            default:
                sortedJournals.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        setJournals(sortedJournals);
        // setCurrentPage(1); // REMOVE THIS LINE - Do not reset page on filter/sort
    }, [searchQuery, selectedCountry, selectedPublicationType, selectedSubjectAreas, selectedQuartile, selectedOpenAccessTypes, selectedPublisher, selectedLanguage, selectedImpactFactor, selectedHIndex, selectedCiteScore, selectedSJR, selectedOverallRank, selectedISSN, sortBy, journals]); // Added journals to dependency array as it's used for filtering

    const indexOfLastJournal = currentPage * journalsPerPage;
    const indexOfFirstJournal = indexOfLastJournal - journalsPerPage;
    const currentJournals = journals.slice(indexOfFirstJournal, indexOfLastJournal);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(event.target.value as JournalSortOption);
    };

    if (loading) {
        return <p>Loading journals...</p>;
    }

    if (!journals || journals.length === 0) {
        return <p>No journals found.</p>;
    }

    return (
        <div className="w-full pl-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">
                    Journal Results ({journals.length})
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
                            d="M3 5a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 0110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <span className="text-sm mr-1">Sort by:</span>
                    <select
                        className="text-sm border rounded px-2 py-1 bg-transparent focus:outline-none"
                        value={sortBy}
                        onChange={handleSortByChange}
                    >
                        <option value="title">Title</option>
                        <option value="issn">ISSN</option>
                        <option value="publisher">Publisher</option>
                        <option value="language">Language</option>
                        <option value="impactFactor">Impact Factor</option>
                        <option value="citeScore">CiteScore</option>
                        <option value="sjr">SJR</option>
                        <option value="overallRank">Overall Rank</option>
                        <option value="hIndex">H-index</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentJournals.map((journal) => (
                    <EventJournalCard key={journal.id} journal={journal} />
                ))}
            </div>

            {journals.length > 0 && (
                <Pagination
                    eventsPerPage={journalsPerPage}
                    totalEvents={journals.length}
                    paginate={paginate}
                    currentPage={currentPage}
                />
            )}
        </div>
    );
};

export default ResultsJournalSection;