// src/app/[locale]/conferences/detail/page.tsx

import { getConferenceFromDB } from '@/src/app/apis/conference/getConferenceDetails';
import ConferenceDetailPageClient from './ConferenceDetailPageClient'; // Component client sẽ tạo ở bước 2
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Loading from '../../utils/Loading';

// Tối ưu hóa nâng cao: Incremental Static Regeneration (ISR)
// Trang chi tiết của một conference sẽ được render lúc build (hoặc lần truy cập đầu tiên)
// và tự động render lại trên server sau mỗi 15 phút nếu có request mới.
// Điều này giúp các trang conference được xem nhiều có tốc độ tải gần như tức thì.
export const revalidate = 600;

interface DetailPageProps {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Đây là một React Server Component, nó chạy trên server!
export default async function DetailPage({ params, searchParams }: DetailPageProps) {
  const conferenceId = searchParams.id as string;

  // Nếu không có ID, trả về trang 404 ngay lập tức trên server.
  if (!conferenceId) {
    notFound();
  }

  // 1. Lấy dữ liệu conference chính trên server
  let initialData;
  try {
    initialData = await getConferenceFromDB(conferenceId);
  } catch (error: any) {
    // Nếu API trả về lỗi 404 hoặc lỗi tương tự, hiển thị trang notFound.
    if (error.status === 404) {
      notFound();
    }
    // Với các lỗi khác, có thể hiển thị một trang lỗi chung
    // Ở đây chúng ta re-throw để Next.js xử lý
    // console.error("Failed to fetch initial conference detail on server:", error);
    throw new Error('Failed to load conference data.');
  }

  // Nếu API không trả về dữ liệu vì lý do nào đó
  if (!initialData) {
    notFound();
  }

  // 2. Render component client và truyền dữ liệu đã fetch được xuống làm prop
  // Bọc trong Suspense để xử lý các phần loading phía client một cách mượt mà hơn
  return (
    <Suspense fallback={<Loading />}>
      <ConferenceDetailPageClient
        locale={params.locale}
        initialData={initialData}
      />
    </Suspense>
  );
}