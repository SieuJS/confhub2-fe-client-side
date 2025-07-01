// src/hooks/journals/useJournalResults.ts

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { JournalApiResponse, JournalData } from '../../models/response/journal.response'
import { journalService } from '@/src/services/journal.service' // Sử dụng service

interface UseJournalResultsProps {
  initialData?: JournalApiResponse;
}

const useJournalResults = ({ initialData }: UseJournalResultsProps = {}) => {
  const [journals, setJournals] = useState<JournalData[] | undefined>(initialData?.data);
  const [meta, setMeta] = useState(initialData?.meta || { total: 0, page: 1, limit: 6, totalPages: 0 });
  
  // Khởi tạo loading là false NẾU có initialData
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const prevSearchParamsString = useRef<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Tạo object params từ searchParams hiện tại
      const currentParams = new URLSearchParams(searchParams.toString());
      const apiParams: { [key: string]: any } = {};
      for (const [key, value] of currentParams.entries()) {
        apiParams[key] = value;
      }
      // Đảm bảo các giá trị mặc định
      if (!apiParams.limit) apiParams.limit = '6';
      if (!apiParams.page) apiParams.page = '1';
      if (!apiParams.sortBy) apiParams.sortBy = 'createdAt';
      if (!apiParams.sortOrder) apiParams.sortOrder = 'desc';

      const apiResponse = await journalService.getAll(apiParams);
      setJournals(apiResponse.data);
      setMeta(apiResponse.meta);
    } catch (err: any) {
      // console.error('Failed to fetch journals:', err);
      setError(err.message);
      setJournals([]);
      setMeta({ total: 0, page: 1, limit: 6, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (prevSearchParamsString.current === null) {
      if (initialData) {
        prevSearchParamsString.current = searchParamsString;
        return;
      } else {
        fetchData();
        prevSearchParamsString.current = searchParamsString;
        return;
      }
    }

    if (prevSearchParamsString.current !== searchParamsString) {
      fetchData();
      prevSearchParamsString.current = searchParamsString;
    }
  }, [searchParamsString, initialData, fetchData]);

  const paginate = useCallback((pageNumber: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', String(pageNumber));
    router.push(`${pathname}?${newParams.toString()}`);
  }, [searchParams, pathname, router]);

  const handleSortByChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = event.target.value;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('sortBy', newSortBy);
    newParams.set('page', '1');
    router.push(`${pathname}?${newParams.toString()}`);
  }, [searchParams, pathname, router]);

  return {
    journals,
    totalJournals: meta.total,
    currentPage: meta.page,
    journalsPerPage: meta.limit,
    totalPages: meta.totalPages,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    loading,
    error,
    paginate,
    handleSortByChange,
  };
};

export default useJournalResults;