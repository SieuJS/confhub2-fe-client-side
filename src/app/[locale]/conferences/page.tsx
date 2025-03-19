// pages/conferences.tsx (Conferences Page)
"use client";

import { useTranslations } from 'next-intl';
import SearchSection from '../conferences/SearchSection';
import ResultsSection from '../conferences/ResultsSection';
import { Header } from '../utils/Header';
import Footer from '../utils/Footer';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import Loading from '../utils/Loading'; // Import the Loading component

export default function Conferences({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [initialSearchParams, setInitialSearchParams] = useState<string>(""); // Store as a string
  const [isLoading, setIsLoading] = useState(true); // Track loading state
  const [conferences, setConferences] = useState([]); // Store fetched conferences
  const [isInitialLoad, setIsInitialLoad] = useState(true); // New state

  // Initialize initialSearchParams when the component mounts.
  useEffect(() => {
    setInitialSearchParams(searchParams.toString()); // Convert to string
    fetchConferences(searchParams.toString()); // Fetch on initial load
  }, [searchParams]);


  const fetchConferences = useCallback(async (paramsString: string) => {
        //setIsLoading(true);
        try {
            const res = await fetch(`/api/conferences?${paramsString}`);
            if (!res.ok) {
              //best practice to throw error
                throw new Error(`Failed to fetch conferences: ${res.status}`);
            }
            const data = await res.json();
            setConferences(data);
        } catch (error) {
            console.error("Error fetching conferences:", error);
             // Consider setting an error state to display to the user.
        } finally {
            setIsLoading(false);
            setIsInitialLoad(false); // Set to false after the *first* load
        }
    }, []);

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
    if (searchParamsFromComponent.submissionDate) {
      newParams.set('submissionDate', searchParamsFromComponent.submissionDate.toISOString().split('T')[0]);
    }
    if (searchParamsFromComponent.averageScore) newParams.set('averageScore', searchParamsFromComponent.averageScore);


    if (searchParamsFromComponent.topics && searchParamsFromComponent.topics.length > 0) {
        searchParamsFromComponent.topics.forEach(topic => newParams.append('topics', topic));
    }
    if (searchParamsFromComponent.fieldOfResearch && searchParamsFromComponent.fieldOfResearch.length > 0) {
        searchParamsFromComponent.fieldOfResearch.forEach(field => newParams.append('fieldOfResearch', field));
    }

      const paramsString = newParams.toString();
      router.push(`/${locale}/conferences?${paramsString}`);
      // Don't fetch here;  useEffect handles it.
  }, [locale, router]);


  const handleClear = useCallback(() => {
    // Clear all search-related query parameters
    const newParams = new URLSearchParams();
    const paramsString = newParams.toString();
    router.push(`/${locale}/conferences?${paramsString}`);
    // Don't fetch here; useEffect handles it

  }, [locale, router]);

  return (
    <>
      <Header locale={locale} />
      <div className="text-center text-2xl">
        <div className="py-10 bg-background w-full"></div>
        <SearchSection onSearch={handleSearch} onClear={handleClear} />
        <div className="container mx-auto mt-4 px-4">
          {/* Conditionally render Loading or ResultsSection */}
          {(isLoading && isInitialLoad) ? (
            <Loading />
          ) : (
            <ResultsSection/>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}