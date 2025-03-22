// src/hooks/useConferenceResults.ts
import { useState, useEffect, useCallback } from 'react';
import { ConferenceInfo } from '@/src/models/response/conference.list.response';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { fetchConferences, FetchConferencesParams } from '../../api/conference/getFilteredConferences'; // Import

type SortOption = 'date' | 'rank' | 'name' | 'submissionDate' | 'startDate' | 'endDate';
type SortOrder = 'asc' | 'desc';

interface UseConferenceResultsProps {
  initialData?: ConferenceInfo[];
  initialTotalItems?: number;
}

const useConferenceResults = ({ initialData, initialTotalItems }: UseConferenceResultsProps = {}) => {
  const [events, setEvents] = useState<ConferenceInfo[]>(initialData || []);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [totalItems, setTotalItems] = useState(initialTotalItems || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Tạo object params từ searchParams.
      const params: FetchConferencesParams = {
        keyword: searchParams.get('keyword') || undefined,
        country: searchParams.get('country') || undefined,
        type: searchParams.get('type') as 'Online' | 'Offline' | 'Hybrid' || undefined,
        startDate: searchParams.get('startDate') || undefined,
        endDate: searchParams.get('endDate') || undefined,
        rank: searchParams.get('rank') || undefined,
        sourceYear: searchParams.get('sourceYear') || undefined,
        topics: searchParams.getAll('topics'), // Không cần kiểm tra null/undefined ở đây.
        publisher: searchParams.get('publisher') || undefined,
        page: searchParams.get('page') || '1',
        sortBy: searchParams.get('sortBy') as SortOption || 'date',
        sortOrder: searchParams.get('sortOrder') as SortOrder || 'asc',
        limit: String(eventsPerPage),
      };

      const data = await fetchConferences(params); // Gọi API.

      setEvents(data.items);
      setTotalItems(data.total);
      setCurrentPage(parseInt(params.page!, 10)); // Dùng page từ params (đã là string).
      setSortBy(params.sortBy!);  // Đã được kiểm tra ở trên.
      setSortOrder(params.sortOrder!); // Đã được kiểm tra ở trên
    } catch (error: any) {
      console.error("Failed to fetch conferences:", error);
      setError(error.message); // Lấy message từ error object.
    } finally {
      setLoading(false);
    }
  }, [searchParams, eventsPerPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const paginate = (pageNumber: number) => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('page', String(pageNumber));

      const localePrefix = pathname.split('/')[1];
      router.push(`/${localePrefix}/conferences?${newParams.toString()}`);
    };

    const handleSortByChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newSortBy = event.target.value as SortOption;
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('sortBy', newSortBy);
      newParams.delete('page'); // Reset to page 1 when sorting changes

      const localePrefix = pathname.split('/')[1];
      router.push(`/${localePrefix}/conferences?${newParams.toString()}`);
    };

    const handleSortOrderChange = () => {
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set('sortOrder', newSortOrder);
      newParams.delete('page'); // Reset to page 1 when sorting changes

      const localePrefix = pathname.split('/')[1];
      router.push(`/${localePrefix}/conferences?${newParams.toString()}`);
    };

    const sortedEvents = events;

  return {
    sortedEvents,
    totalItems,
    eventsPerPage,
    currentPage,
    sortBy,
    sortOrder,
    paginate,
    handleSortByChange,
    handleSortOrderChange,
    loading,
    error,
  };
};

export default useConferenceResults;