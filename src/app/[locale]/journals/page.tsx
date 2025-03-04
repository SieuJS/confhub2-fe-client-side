"use client";

// Journals.tsx
import { useTranslations } from 'next-intl';
import SearchJournalSection from '../components/journal/SearchJournalSection';
import ResultsJournalSection from '../components/journal/ResultsJournalSection';   // Import ResultsJournalSection
import { useState } from 'react';
import { JournalResponse } from '../../../models/response/journal.response'; // Import JournalResponse type


export default function Journals() {
    const t = useTranslations('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    // Removed journalsData and loading states
    // const [journalsData, setJournalsData] = useState<JournalResponse[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false); // Keep loading state if you want to use it for other purposes, otherwise remove it

    // State for search parameters - extract from searchParams in handleSearch for ResultsSection props
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedPublicationType, setSelectedPublicationType] = useState<string | null>(null);
    const [selectedSubjectAreas, setSelectedSubjectAreas] = useState<string[]>([]);
    const [selectedQuartile, setSelectedQuartile] = useState<string | null>(null);
    const [selectedOpenAccessTypes, setSelectedOpenAccessTypes] = useState<string[]>([]);
    const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
    const [selectedImpactFactor, setSelectedImpactFactor] = useState<string | null>(null);
    const [selectedHIndex, setSelectedHIndex] = useState<string | null>(null);
    const [selectedCiteScore, setSelectedCiteScore] = useState<string | null>(null);
    const [selectedSJR, setSelectedSJR] = useState<string | null>(null);
    const [selectedOverallRank, setSelectedOverallRank] = useState<string | null>(null);
    const [selectedISSN, setSelectedISSN] = useState<string | null>(null);


    const handleSearch = async (searchParams: {
        keyword?: string;
        country?: string | null;
        publicationType?: string | null;
        subjectAreas?: string[];
        quartile?: string | null;
        openAccessTypes?: string[];
        publisher?: string | null;
        language?: string | null;
        impactFactor?: string | null;
        hIndex?: string | null;
        citeScore?: string | null;
        sjr?: string | null;
        overallRank?: string | null;
        issn?: string | null;
    }) => {
        console.log("Thông số tìm kiếm nhận được từ SearchJournalSection:", searchParams);
        setSearchQuery(searchParams.keyword || '');

        // Update state variables for ResultsJournalSection props
        setSelectedCountry(searchParams.country || null);
        setSelectedPublicationType(searchParams.publicationType || null);
        setSelectedSubjectAreas(searchParams.subjectAreas || []);
        setSelectedQuartile(searchParams.quartile || null);
        setSelectedOpenAccessTypes(searchParams.openAccessTypes || []);
        setSelectedPublisher(searchParams.publisher || null);
        setSelectedLanguage(searchParams.language || null);
        setSelectedImpactFactor(searchParams.impactFactor || null);
        setSelectedHIndex(searchParams.hIndex || null);
        setSelectedCiteScore(searchParams.citeScore || null);
        setSelectedSJR(searchParams.sjr || null);
        setSelectedOverallRank(searchParams.overallRank || null);
        setSelectedISSN(searchParams.issn || null);


    };


    return (
        <div className="text-center text-2xl">
            <div className="py-14 bg-background w-full"></div>
            <SearchJournalSection
                onSearch={handleSearch}
            />
            <div className="container mx-auto mt-8 px-4 ">
                <ResultsJournalSection
                    loading={loading}
                    searchQuery={searchQuery}
                    selectedCountry={selectedCountry}
                    selectedPublicationType={selectedPublicationType}
                    selectedSubjectAreas={selectedSubjectAreas}
                    selectedQuartile={selectedQuartile}
                    selectedOpenAccessTypes={selectedOpenAccessTypes}
                    selectedPublisher={selectedPublisher}
                    selectedLanguage={selectedLanguage}
                    selectedImpactFactor={selectedImpactFactor}
                    selectedHIndex={selectedHIndex}
                    selectedCiteScore={selectedCiteScore}
                    selectedSJR={selectedSJR}
                    selectedOverallRank={selectedOverallRank}
                    selectedISSN={selectedISSN}
                />
            </div>
        </div>
    );
}