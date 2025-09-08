// src/hooks/conferences/results/useConferenceDataFetching.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConferenceListResponse } from '@/src/models/response/conference.list.response';
import { fetchConferences, FetchConferencesParams } from '@/src/app/apis/conference/getFilteredConferences';

import { SortConfig } from './useConferenceSorting';

interface UseConferenceDataFetchingProps {
  initialData?: ConferenceListResponse;
  sortConfig?: SortConfig;
}

export const useConferenceDataFetching = ({ initialData, sortConfig }: UseConferenceDataFetchingProps) => {
  const [events, setEvents] = useState<ConferenceListResponse | undefined>(initialData);
  const [totalItems, setTotalItems] = useState(initialData?.meta.totalItems || 0);
  const [currentPage, setCurrentPage] = useState(initialData?.meta.curPage || 1);
  const [eventsPerPage, setEventsPerPage] = useState(initialData?.meta.perPage.toString() || '12');
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const prevSearchParamsString = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const currentParams = new URLSearchParams(searchParams.toString());
      const params: FetchConferencesParams = {
        keyword: currentParams.get('keyword') || undefined,
        title: currentParams.get('title') || undefined,
        acronym: currentParams.get('acronym') || undefined,
        country: currentParams.get('country') || undefined,
        type: currentParams.get('type') as 'Online' | 'Offline' | 'Hybrid' || undefined,
        fromDate: currentParams.get('fromDate') || undefined,
        toDate: currentParams.get('toDate') || undefined,
        rank: currentParams.get('rank') || undefined,
        source: currentParams.get('source') || undefined,
        subFromDate: currentParams.get('subFromDate') || undefined,
        subToDate: currentParams.get('subToDate') || undefined,
        topics: currentParams.getAll('topics'),
        researchFields: currentParams.getAll('researchFields'),
        publisher: currentParams.get('publisher') || undefined,
        page: currentParams.get('page') || '1',
        perPage: currentParams.get('perPage') || '12',
      };
      // Add sort params if present
      if (sortConfig) {
        if (sortConfig.field && sortConfig.field !== 'default') {
          params.sortBy = sortConfig.field;
        }
        if (sortConfig.direction && sortConfig.field !== 'match') {
          params.sortOrder = sortConfig.direction;
        }
      }
      const userData = localStorage.getItem('user');
      if (userData) {
        const { id: recommendId } = JSON.parse(userData);
        params.recommendId = recommendId;
      }
      const data = await fetchConferences(params);
      setEvents(data);
      setTotalItems(data.meta.totalItems);
      setCurrentPage(data.meta.curPage);
      setEventsPerPage(params.perPage!);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams, sortConfig]);

  useEffect(() => {
    // Always fetch when sortConfig or searchParams change
    fetchData();
    prevSearchParamsString.current = searchParamsString;
  }, [searchParamsString, initialData, fetchData, sortConfig]);

  return { events, totalItems, currentPage, eventsPerPage, loading, error };
};