'use client'

import { useTranslations } from 'next-intl'
import SearchSection from '@/src/app/[locale]/conferences/SearchSection'
import ResultsSection from '@/src/app/[locale]/conferences/ResultsSection'
// --- MODIFICATION 1: Import useSearchParams ---
import { useRouter, usePathname } from '@/src/navigation' 
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import useUserBlacklist from '@/src/hooks/auth/useUserBlacklist'
import { ConferenceListResponse } from '@/src/models/response/conference.list.response'
import { AppPathname } from '@/src/navigation'

// ... (interface definitions remain the same)
interface SearchParamsForURL {
  keyword?: string;
  title?: string;
  acronym?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
  location?: string | null;
  type?: 'Online' | 'Offline' | 'Hybrid' | null;
  subFromDate?: Date | null;
  subToDate?: Date | null;
  rank?: string | null;
  source?: string | null;  
  publisher?: string | null;
  topics?: string[];
  fieldOfResearch?: string[];
  matchScoreRange?: number[];
}

interface ConferencesPageClientProps {
  locale: string;
  initialData: ConferenceListResponse;
}

export default function ConferencesPageClient({ locale, initialData }: ConferencesPageClientProps) {
  const t = useTranslations('')
  const { blacklistedEventIds } = useUserBlacklist()

  const router = useRouter()
  const pathname = usePathname()
  // --- MODIFICATION 2: Get the current search params ---
  const searchParams = useSearchParams()

  const handleSearch = useCallback(
    async (searchParamsFromComponent: SearchParamsForURL) => {
      // --- MODIFICATION 3: Preserve the 'perPage' value ---
      const currentPerPage = searchParams.get('perPage');
      
      // Start with a blank slate for the new search filters
      const newParams = new URLSearchParams();

      // --- (The rest of this block is unchanged) ---
      if (searchParamsFromComponent.keyword) newParams.set('keyword', searchParamsFromComponent.keyword);
      if (searchParamsFromComponent.title) newParams.set('title', searchParamsFromComponent.title);
      if (searchParamsFromComponent.acronym) newParams.set('acronym', searchParamsFromComponent.acronym);
      if (searchParamsFromComponent.location) newParams.set('country', searchParamsFromComponent.location);
      if (searchParamsFromComponent.type) newParams.set('type', searchParamsFromComponent.type);
      if (searchParamsFromComponent.fromDate) newParams.set('fromDate', searchParamsFromComponent.fromDate.toISOString().split('T')[0]);
      if (searchParamsFromComponent.toDate) newParams.set('toDate', searchParamsFromComponent.toDate.toISOString().split('T')[0]);
      if (searchParamsFromComponent.rank) newParams.set('rank', searchParamsFromComponent.rank);
      if (searchParamsFromComponent.source) newParams.set('source', searchParamsFromComponent.source);
      if (searchParamsFromComponent.publisher) newParams.set('publisher', searchParamsFromComponent.publisher);
      if (searchParamsFromComponent.subFromDate) newParams.set('subFromDate', searchParamsFromComponent.subFromDate.toISOString().split('T')[0]);
      if (searchParamsFromComponent.subToDate) newParams.set('subToDate', searchParamsFromComponent.subToDate.toISOString().split('T')[0]);
      if (searchParamsFromComponent.topics && searchParamsFromComponent.topics.length > 0) {
        searchParamsFromComponent.topics.forEach(topic => newParams.append('topics', topic));
      }
      if (searchParamsFromComponent.fieldOfResearch && searchParamsFromComponent.fieldOfResearch.length > 0) {
        searchParamsFromComponent.fieldOfResearch.forEach(field => newParams.append('researchFields', field));
      }
      const range = searchParamsFromComponent.matchScoreRange;
      if (range) {
        const isDefaultRange = range[0] === 0 && range[1] === 100;
        if (!isDefaultRange) {
          newParams.set('matchScoreRange', range.join(','));
        }
      }

      // --- MODIFICATION 4: Add the preserved 'perPage' value back to the new params ---
      // If a 'perPage' value exists in the current URL, add it to the new search.
      if (currentPerPage) {
        newParams.set('perPage', currentPerPage);
      }
      // Note: We intentionally do NOT add the 'page' parameter.
      // A new search should always reset the user to page 1.
      // Our data fetching hook defaults to page 1 if the param is missing, which is the correct behavior.

      const query: { [key: string]: string | string[] } = {};
      for (const [key, value] of newParams.entries()) {
        if (query[key]) {
          if (Array.isArray(query[key])) {
            (query[key] as string[]).push(value);
          } else {
            query[key] = [query[key] as string, value];
          }
        } else {
          query[key] = value;
        }
      }
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      if(userData) {
        const t = await fetch('/apis/logs/user-interaction', {
          method: 'POST',
          body: JSON.stringify({
            userId: userData.id,
            trustCredit: userData.trustCredit || 0,
            action: 'search',
            content: JSON.stringify(query),
          }),
          headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Log interaction response:', t);
    }

      router.push({
        pathname: pathname as AppPathname,
        query: query,
      });
    },
    [pathname, router, searchParams] // --- MODIFICATION 5: Add searchParams to dependency array
  );

  useEffect(() => {
    async function logUserInteraction() {
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      if(userData) {
        const t = await fetch('/apis/logs/user-interaction', {
          method: 'POST',
          body: JSON.stringify({
            userId: userData.id,
            trustCredit: userData.trustCredit || 0,
            action: 'search',
            content: JSON.stringify({
              conferences : initialData?.payload.map(conference => conference.id) || []
            }),
          }),
          headers: {
          'Content-Type': 'application/json',
        },
      });
    }
     } 
    logUserInteraction();
  }, [initialData]);

  const handleClear = useCallback(() => {
    router.push(pathname as AppPathname);
  }, [pathname, router]);

  return (
     <>
      <div className='text-center text-2xl mb-10'>
        <div className='w-full bg-background py-4'></div>
        <SearchSection onSearch={handleSearch} onClear={handleClear} />
        <div className='container mx-auto mt-4 px-0 md:px-4'>
          <ResultsSection
            userBlacklist={blacklistedEventIds}
            initialData={initialData}
          />
        </div>
      </div>
    </>
  )
}