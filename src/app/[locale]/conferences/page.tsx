// page.tsx (Conferences Page)
"use client";

import { useTranslations } from 'next-intl';
import SearchSection from '../conferences/SearchSection';
import ResultsSection from '../conferences/ResultsSection';
import { useState } from 'react';
import { Header } from '../utils/Header';
import Footer from '../utils/Footer';

export default function Conferences({ locale }: { locale: string }) {
  const t = useTranslations('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'Online' | 'Offline' | 'Hybrid' | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [submissionDate, setSubmissionDate] = useState<Date | null>(null);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [selectedSourceYear, setSelectedSourceYear] = useState<string | null>(null);
  const [selectedAverageScore, setSelectedAverageScore] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedFieldsOfResearch, setSelectedFieldsOfResearch] = useState<string[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null); // Keep as string | null

  const handleSearch = async (searchParams: {
    keyword?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    location?: string | null;
    type?: 'Online' | 'Offline' | 'Hybrid' | null;
    submissionDate?: Date | null;
    publisher?: string | null; // Change to string | null
    rank?: string | null;
    sourceYear?: string | null;
    averageScore?: string | null;
    topics?: string[];
    fieldOfResearch?: string[];
  }) => {
    console.log("Search parameters received from SearchJournalSection:", searchParams);
    setSearchQuery(searchParams.keyword || '');

    // Update state variables for ResultsJournalSection props
    setStartDate(searchParams.startDate || null);
    setEndDate(searchParams.endDate || null);
    setSelectedLocation(searchParams.location || null);
    setSelectedType(searchParams.type || null);
    setSubmissionDate(searchParams.submissionDate || null);
    setSelectedPublisher(searchParams.publisher || null); // Update publisher state
    setSelectedRank(searchParams.rank || null);
    setSelectedSourceYear(searchParams.sourceYear || null);
    setSelectedAverageScore(searchParams.averageScore || null);
    setSelectedTopics(searchParams.topics || []);
    setSelectedFieldsOfResearch(searchParams.fieldOfResearch || []);
  };

  return (
    <>
      <Header locale={locale} />
      <div className="text-center text-2xl">
        <div className="py-14 bg-background w-full"></div>
        <SearchSection onSearch={handleSearch} />
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
            selectedPublisher={selectedPublisher} // Pass selectedPublisher
          />
        </div>
      </div>
      <Footer />
    </>
  );
}