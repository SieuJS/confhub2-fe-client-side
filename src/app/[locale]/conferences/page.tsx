// pages/conferences.tsx (Conferences Page)
"use client";

import { useTranslations } from 'next-intl';
import SearchSection from '../conferences/SearchSection';
import ResultsSection from '../conferences/ResultsSection';
import { Header } from '../utils/Header';
import Footer from '../utils/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export default function Conferences({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialSearchParams, setInitialSearchParams] = useState<string>(""); // Store as a string

  // Initialize initialSearchParams when the component mounts.
  useEffect(() => {
    setInitialSearchParams(searchParams.toString()); // Convert to string
  }, [searchParams]);

  const handleSearch = useCallback(async (searchParamsFromComponent: {
    keyword?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    location?: string | null;
    type?: 'Online' | 'Offline' | 'Hybrid' | null;
    submissionDate?: Date | null;
    publisher?: string | null;
    rank?: string | null;
    sourceYear?: string | null;
    averageScore?: string | null;
    topics?: string[];
    fieldOfResearch?: string[];
  }) => {

    const newParams = new URLSearchParams();
    if (searchParamsFromComponent.keyword) newParams.set('keyword', searchParamsFromComponent.keyword);
    if (searchParamsFromComponent.location) newParams.set('country', searchParamsFromComponent.location);
    if (searchParamsFromComponent.type) newParams.set('type', searchParamsFromComponent.type);
    if (searchParamsFromComponent.startDate) {
      newParams.set('startDate', searchParamsFromComponent.startDate.toISOString().split('T')[0]);
    }
    if (searchParamsFromComponent.endDate) {
      newParams.set('endDate', searchParamsFromComponent.endDate.toISOString().split('T')[0]);
    }
    if (searchParamsFromComponent.rank) newParams.set('rank', searchParamsFromComponent.rank);
    if (searchParamsFromComponent.sourceYear) newParams.set('sourceYear', searchParamsFromComponent.sourceYear);
    if (searchParamsFromComponent.publisher) newParams.set('publisher', searchParamsFromComponent.publisher);

    if (searchParamsFromComponent.topics && searchParamsFromComponent.topics.length > 0) {
        searchParamsFromComponent.topics.forEach(topic => newParams.append('topics', topic));
    }
    if (searchParamsFromComponent.fieldOfResearch && searchParamsFromComponent.fieldOfResearch.length > 0) {
        searchParamsFromComponent.fieldOfResearch.forEach(field => newParams.append('fieldOfResearch', field));
    }


    router.push(`/${locale}/conferences?${newParams.toString()}`);
  }, [locale, router]);


  const handleClear = useCallback(() => {
    router.push(`/${locale}/conferences`);
  }, [locale, router]);


  return (
    <>
      <Header locale={locale} />
      <div className="text-center text-2xl">
        <div className="py-14 bg-background w-full"></div>
        <SearchSection onSearch={handleSearch} onClear={handleClear} />
        <div className="container mx-auto mt-8 px-4">
          <ResultsSection />
        </div>
      </div>
      <Footer />
    </>
  );
}