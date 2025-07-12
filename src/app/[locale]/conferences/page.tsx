// app/[locale]/conferences/page.tsx

import { fetchConferences, FetchConferencesParams } from '@/src/app/apis/conference/getFilteredConferences';
import ConferencesPageClient from './ConferencesPageClient'; // Component client sẽ tạo ở bước 2
import { ConferenceListResponse } from '@/src/models/response/conference.list.response';

// Tối ưu hóa nâng cao: Incremental Static Regeneration (ISR)
export const revalidate = 30; // 30 giây

interface ConferencesPageProps {
  params: { locale: string }; 
  searchParams: { [key: string]: string | string[] | undefined };
}

// Đây là một React Server Component, nó chạy trên server!
export default async function ConferencesPage({ params, searchParams }: ConferencesPageProps) {
  // 1. Lấy dữ liệu conference trên server cho lần tải đầu tiên
  // Chuyển đổi searchParams từ URL thành params cho API
  const apiParams: FetchConferencesParams = {
    keyword: searchParams.keyword as string || undefined,
    title: searchParams.title as string || undefined,
    acronym: searchParams.acronym as string || undefined,
    country: searchParams.country as string || undefined,
    type: searchParams.type as 'Online' | 'Offline' | 'Hybrid' || undefined,
    fromDate: searchParams.fromDate as string || undefined,
    toDate: searchParams.toDate as string || undefined,
    rank: searchParams.rank as string || undefined,
    source: searchParams.source as string || undefined,
    subFromDate: searchParams.subFromDate as string || undefined,
    subToDate: searchParams.subToDate as string || undefined,
    topics: searchParams.topics as string[] || [],
    researchFields: searchParams.researchFields as string[] || [],
    publisher: searchParams.publisher as string || undefined,
    page: searchParams.page as string || '1',
    perPage: searchParams.perPage as string || '12', // Đặt một giá trị mặc định hợp lý
  };

    // Khai báo initialData với kiểu dữ liệu rõ ràng
  let initialData: ConferenceListResponse;

  try {
    initialData = await fetchConferences(apiParams);
  } catch (error) {
    // console.error("Failed to fetch initial conferences data on server:", error);
    
    // ĐIỀU CHỈNH Ở ĐÂY: Cung cấp đầy đủ các trường cho meta
    initialData = {
      payload: [],
      meta: {
        totalItems: 0,
        curPage: 1,
        perPage: 4,
        totalPage: 0,
        prevPage: null,
        nextPage: null,
      }
    };
  }

  return (
    <ConferencesPageClient
      locale={params.locale}
      initialData={initialData}
    />
  );
}