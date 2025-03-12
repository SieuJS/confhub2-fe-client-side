"use client";

// Conferences.tsx
import { useTranslations } from 'next-intl';
import SearchSection from '../../components/conference/SearchSection';
import ResultsSection from '../../components/conference/ResultsSection';
import { useState } from 'react';
import { ConferenceResponse } from '../../../../models/response/conference.response'; 
import { Header } from '../../components/utils/Header';
import Footer from '../../components/utils/Footer';

// Removed interface Event as we are using ConferenceResponse type

export default function Conferences({ locale }: { locale: string }) {
    const t = useTranslations('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    // Keep selectedType as string | null to be more flexible, or you can refine it based on possible 'type' values in ConferenceResponse
    const [selectedType, setSelectedType] = useState<'online' | 'offline' | 'hybrid' | null>(null);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [submissionDate, setSubmissionDate] = useState<Date | null>(null);
    const [selectedRank, setSelectedRank] = useState<string | null>(null);
    const [selectedSourceYear, setSelectedSourceYear] = useState<string | null>(null);
    const [selectedAverageScore, setSelectedAverageScore] = useState<string | null>(null);
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [selectedFieldsOfResearch, setSelectedFieldsOfResearch] = useState<string[]>([]);
    const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);

    // const handleSearch = (query: string) => {
    //     setSearchQuery(query);
    // };

    const handleSearch = async (searchParams: {
        keyword?: string;
        startDate?: Date | null;
        endDate?: Date | null;
        location?: string | null;
        type?: 'online' | 'offline' | 'hybrid' | null;
        submissionDate?: Date | null;
        publisher?: string | null;
        rank?: string | null;
        sourceYear?: string | null;
        averageScore?: string | null;
        topics?: string[];
        fieldOfResearch?: string[];
    }) => {
        console.log("Thông số tìm kiếm nhận được từ SearchJournalSection:", searchParams);
        setSearchQuery(searchParams.keyword || '');

        // Update state variables for ResultsJournalSection props
        setStartDate(searchParams.startDate || null);
        setEndDate(searchParams.endDate || null);
        setSelectedLocation(searchParams.location || null);
        setSelectedType(searchParams.type || null);
        setSubmissionDate(searchParams.submissionDate || null);
        setSelectedPublisher(searchParams.publisher || null);
        setSelectedRank(searchParams.rank || null);
        setSelectedSourceYear(searchParams.sourceYear || null);
        setSelectedAverageScore(searchParams.averageScore || null);
        setSelectedTopics(searchParams.topics || []);
        setSelectedFieldsOfResearch(searchParams.fieldOfResearch || []);

    };

    return (
        <>
            <Header locale={locale}/>
            <div className="text-center text-2xl">
                <div className="py-14 bg-background w-full"></div>
                <SearchSection
                    onSearch={handleSearch}
                />
                <div className="container mx-auto mt-8 px-4">
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
                        selectedPublisher={selectedPublisher}
                    />
                </div>
            </div>
            <Footer />
        </>
    );
}