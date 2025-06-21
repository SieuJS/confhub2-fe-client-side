// src/app/[locale]/journals/detail/page.tsx (SỬA ĐỔI)

import { getJournalDetails } from '@/src/app/apis/journals/getJournalDetails';
import JournalDetailPageClient from './JournalDetailPageClient'; // Import Client Component
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Loading from '../../utils/Loading'; // Import component Loading chung

// Cấu hình ISR cho toàn bộ trang
export const revalidate = 3600; // 1 giờ

interface JournalDetailPageProps {
  params: { locale: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function JournalDetailPage({ params, searchParams }: JournalDetailPageProps) {
  const journalId = searchParams.id as string;

  if (!journalId) {
    notFound();
  }

  let initialJournalData;
  try {
    initialJournalData = await getJournalDetails(journalId);
  } catch (error: any) {
    if (error.status === 404) {
      notFound();
    }
    // Với các lỗi khác, Next.js sẽ tự động hiển thị trang lỗi
    throw error;
  }

  if (!initialJournalData) {
    notFound();
  }

  return (
    <Suspense fallback={<Loading />}>
      <JournalDetailPageClient initialData={initialJournalData} />
    </Suspense>
  );
}