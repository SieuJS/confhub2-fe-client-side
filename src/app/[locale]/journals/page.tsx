// app/[locale]/journals/page.tsx
import { journalService } from '@/src/services/journal.service';
import JournalsPageClient from './JournalsPageClient';
import { JournalApiResponse } from '@/src/models/response/journal.response';

export const revalidate = 600;

interface JournalsPageProps {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// HÀM HELPER ĐỂ XÁC THỰC sortOrder
const getValidSortOrder = (order: string | string[] | undefined): 'asc' | 'desc' => {
  if (order === 'asc') {
    return 'asc';
  }
  // Mặc định là 'desc' cho tất cả các trường hợp còn lại (bao gồm 'desc', undefined, hoặc giá trị không hợp lệ)
  return 'desc';
}

export default async function JournalsPage({ params, searchParams }: JournalsPageProps) {
  console.log("JournalsPage searchParams:", searchParams);
  const apiParams = {
    search: searchParams.search as string || undefined,
    country: searchParams.country as string || undefined,
    areas: searchParams.areas as string || undefined,
    publisher: searchParams.publisher as string || undefined,
    region: searchParams.region as string || undefined,
    type: searchParams.type as string || undefined,
    quartile: searchParams.quartile as string || undefined,
    category: searchParams.category as string || undefined,
    issn: searchParams.issn as string || undefined,
    topic: searchParams.topic as string || undefined,
    hIndex: searchParams.hIndex as string || undefined,
    page: searchParams.page as string || '1',
    limit: '6',
    sortBy: searchParams.sortBy as string || 'createdAt',
    // SỬA ĐỔI Ở ĐÂY: Sử dụng hàm helper
    sortOrder: getValidSortOrder(searchParams.sortOrder),
  };

  let initialData: JournalApiResponse;
  console.log("Fetching initial journals data with params:", apiParams);
  try {
    initialData = await journalService.getAll(apiParams);
  } catch (error) {
    console.error("Failed to fetch initial journals data on server:", error);
    initialData = {
      data: [],
      meta: { total: 0, page: 1, limit: 6, totalPages: 0 }
    };
  }

  return (
    <JournalsPageClient
      locale={params.locale}
      initialData={initialData}
    />
  );
}