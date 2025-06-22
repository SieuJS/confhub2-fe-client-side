// src/hooks/conferences/useConferenceResults.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { ConferenceListResponse } from '@/src/models/response/conference.list.response';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { fetchConferences, FetchConferencesParams } from '../../app/apis/conference/getFilteredConferences';

interface UseConferenceResultsProps {
  initialData?: ConferenceListResponse;
}

const useConferenceResults = ({ initialData }: UseConferenceResultsProps = {}) => {
  const [events, setEvents] = useState<ConferenceListResponse | undefined>(initialData);
  const [totalItems, setTotalItems] = useState(initialData?.meta.totalItems || 0);
  const [currentPage, setCurrentPage] = useState(initialData?.meta.curPage || 1);
  const [eventsPerPage, setEventPerPage] = useState(initialData?.meta.perPage.toString() || '4');
  
  // Khởi tạo loading là false NẾU có initialData.
  // Điều này cực kỳ quan trọng để ngăn loading khi F5.
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  // Dùng useRef để lưu lại searchParamsString của lần render trước.
  // Chúng ta sẽ so sánh chuỗi này để quyết định có fetch lại không.
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
        publisher: currentParams.get('publisher') || undefined,
        page: currentParams.get('page') || '1',
        perPage: currentParams.get('perPage') || '4',
      };

      const data = await fetchConferences(params);

      setEvents(data);
      setTotalItems(data.meta.totalItems);
      setCurrentPage(data.meta.curPage);
      setEventPerPage(params.perPage!);
    } catch (error: any) {
      console.error("Failed to fetch conferences:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [searchParams]); // Giữ searchParams ở đây để useCallback tạo lại fetchData khi cần

  useEffect(() => {
    // Lần đầu tiên hook này chạy trên client
    if (prevSearchParamsString.current === null) {
      // Nếu có initialData (trường hợp F5), chúng ta không làm gì cả.
      // Chỉ cần lưu lại searchParamsString hiện tại để so sánh cho lần sau.
      if (initialData) {
        prevSearchParamsString.current = searchParamsString;
        return;
      }
      // Nếu không có initialData (trường hợp chuyển tab), chúng ta phải fetch.
      else {
        fetchData();
        prevSearchParamsString.current = searchParamsString;
        return;
      }
    }

    // Từ lần thứ hai trở đi, chỉ fetch nếu searchParamsString thực sự thay đổi.
    if (prevSearchParamsString.current !== searchParamsString) {
      fetchData();
      prevSearchParamsString.current = searchParamsString;
    }
  }, [searchParamsString, initialData, fetchData]);

  const paginate = (pageNumber: number) => {
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('page', String(pageNumber));
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleEventPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPerPage = event.target.value;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('perPage', newPerPage);
    newParams.delete('page');
    router.push(`${pathname}?${newParams.toString()}`);
  };

  return {
    sortedEvents: events,
    totalItems,
    eventsPerPage,
    currentPage,
    paginate,
    handleEventPerPageChange,
    loading,
    error,
  };
};

export default useConferenceResults;