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

    return (
        <div className="px-10 py-10 text-center text-2xl">
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
            />
            <div className="container mx-auto mt-8 px-4 flex">
                <FilterSidebar />
                <ResultsSection
                    searchQuery={searchQuery}
                    selectedLocation={selectedLocation}
                    selectedType={selectedType}
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>
        </div>
    );
}