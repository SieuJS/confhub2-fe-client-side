"use client";

// Conferences.tsx
import { useTranslations } from 'next-intl';
import SearchSection from '../components/SearchSection';
import ResultsSection from '../components/ResultsSection';
import FilterSidebar from '../components/FilterSidebar';
import { useState } from 'react';

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
}

export default function Conferences() {
    const t = useTranslations('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<'online' | 'offline' | 'hybrid' | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [submissionDate, setSubmissionDate] = useState<Date | null>(null);
    const [selectedRank, setSelectedRank] = useState<string | null>(null);
    const [selectedSourceYear, setSelectedSourceYear] = useState<string | null>(null);
    const [selectedAverageScore, setSelectedAverageScore] = useState<string | null>(null);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [selectedFieldsOfResearch, setSelectedFieldsOfResearch] = useState<string[]>([]);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleLocationChange = (location: string | null) => {
        setSelectedLocation(location);
    };

    const handleTypeChange = (type: 'online' | 'offline' | 'hybrid' | null) => {
        setSelectedType(type);
    };

    const handleStartDateChange = (date: Date | null) => {
        setStartDate(date);
    };

    const handleEndDateChange = (date: Date | null) => {
        setEndDate(date);
    };
    const handleSubmissionDateChange = (date: Date | null) => {
        setSubmissionDate(date);
    };

    const handleRankChange = (rank: string | null) => {
        setSelectedRank(rank);
    };

    const handleSourceYearChange = (sourceYear: string | null) => {
        setSelectedSourceYear(sourceYear);
    };

    const handleAverageScoreChange = (averageScore: string | null) => {
        setSelectedAverageScore(averageScore);
    };

    const handleTopicsChange = (topics: string[]) => {
        setSelectedTopics(topics);
    };

    const handleFieldsOfResearchChange = (fields: string[]) => {
        setSelectedFieldsOfResearch(fields);
    };

    return (
        <div className="text-center text-2xl">
            <div className="py-14 bg-background w-full"></div>
        <SearchSection
            onSearch={handleSearch}
            onLocationChange={handleLocationChange}
            selectedLocation={selectedLocation}
            onTypeChange={handleTypeChange}
            selectedType={selectedType}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            startDate={startDate}
            endDate={endDate}

            onSubmissionDateChange={handleSubmissionDateChange}
            submissionDate={submissionDate}
            onRankChange={handleRankChange}
            selectedRank={selectedRank}
            onSourceYearChange={handleSourceYearChange}
            selectedSourceYear={selectedSourceYear}
            onAverageScoreChange={handleAverageScoreChange}
            selectedAverageScore={selectedAverageScore}
            onTopicsChange={handleTopicsChange}
            selectedTopics={selectedTopics}
            onFieldOfResearchChange={handleFieldsOfResearchChange}
            selectedFieldsOfResearch={selectedFieldsOfResearch}
        />
        <div className="container mx-auto mt-8 px-4 flex">
            <ResultsSection
                searchQuery={searchQuery}
                selectedLocation={selectedLocation}
                selectedType={selectedType}
                startDate={startDate}
                endDate={endDate}
                submissionDate={submissionDate}
                selectedRank={selectedRank}
                selectedSourceYear={selectedSourceYear}
                selectedAverageScore={selectedAverageScore}
                selectedTopics={selectedTopics}
                selectedFieldsOfResearch={selectedFieldsOfResearch}
            />
        </div>
    </div>
    );
}