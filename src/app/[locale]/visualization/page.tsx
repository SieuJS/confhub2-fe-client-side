// app/[locale]/visualization/page.tsx (NEW FILE)

import { fetchVisualizationData } from '@/src/app/apis/visualization/visualization';
import VisualizationPageClient from './VisualizationPageClient';
import { ConferenceDetailsListResponse } from '@/src/models/response/conference.response';

// Tối ưu hóa nâng cao: Incremental Static Regeneration (ISR)
// Dữ liệu visualization có thể không cần cập nhật quá thường xuyên.
// Đặt revalidate là 1 giờ (3600 giây) là một lựa chọn hợp lý.
// Server sẽ chỉ gọi lại API fetch dữ liệu lớn này 1 giờ một lần.
export const revalidate = 3600;

// Đây là một React Server Component
export default async function VisualizationPage() {
  // 1. Fetch dữ liệu nặng trên server
  let initialData: ConferenceDetailsListResponse | null = null;
  let initialError: string | null = null;

  try {
    initialData = await fetchVisualizationData();
  } catch (error: any) {
    console.error("Failed to fetch initial visualization data on server:", error);
    initialError = error.message || "An unknown error occurred while fetching data.";
    // Trong trường hợp lỗi, chúng ta vẫn render trang client nhưng với initialData là null
    // và một thông báo lỗi ban đầu.
  }

  // 2. Render component client và truyền dữ liệu/lỗi đã fetch được xuống làm prop
  return (
    <VisualizationPageClient
      initialData={initialData}
      initialError={initialError}
    />
  );
}