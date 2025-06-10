// src/app/[locale]/journals/detail/page.tsx

'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
// Giả sử JournalData đã được cập nhật để khớp với cấu trúc API mới
// Nếu chưa, bạn cần định nghĩa lại nó. Dựa trên JSON bạn cung cấp, nó là một object phẳng.
import { JournalData } from '../../../../models/response/journal.response' 
import { Header } from '../../utils/Header'
import Footer from '../../utils/Footer'
import NotFoundPage from '../../utils/NotFoundPage'
import JournalReport from './JournalReport'
import { JournalTabs } from './JournalTabs'
import { RecommendedJournals } from './RecommendedJournals'
import { RecentlyAddedJournals } from './RecentlyAddedJournals'
import SubjectAreasJournals from '../../home/SubjectAreasJournals'
import { useTranslations } from 'next-intl'

const JournalDetails = ({ params: { locale } }: { params: { locale: string } }) => {
  
  const t = useTranslations()

  const searchParams = useSearchParams()
  // API mới sử dụng 'id' (UUID) thay vì 'Sourceid'.
  // Giả sử query param vẫn là 'id' và chứa UUID.
  const journalId = searchParams.get('id') 

  const [journal, setJournal] = useState<JournalData | null | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJournalById = async () => {
      if (!journalId) {
        console.log("No 'id' found in query parameters.")
        setJournal(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      setJournal(undefined)

      try {
        // Lấy base URL từ biến môi trường
        const baseUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
        if (!baseUrl) {
            throw new Error("NEXT_PUBLIC_DATABASE_URL is not defined in environment variables.");
        }

        // Xây dựng URL API để lấy journal cụ thể
        const apiUrl = `${baseUrl}/api/v1/journals/${journalId}`;
        console.log(`Fetching journal from: ${apiUrl}`);

        const response = await fetch(apiUrl);

        // Xử lý trường hợp không tìm thấy (API trả về 404)
        if (response.status === 404) {
          console.log(`Journal with id ${journalId} not found (404).`);
          setJournal(null);
          throw new Error(`Journal not found.`);
        }

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`);
        }

        // Dữ liệu trả về là một object journal duy nhất
        const foundJournal: JournalData = await response.json();
        console.log(`Journal found:`, foundJournal.Title); // Truy cập trực tiếp vào Title
        setJournal(foundJournal);

      } catch (err: any) {
        console.error('Failed to fetch journal:', err);
        setError(err.message || 'An unknown error occurred');
        setJournal(null);
      } finally {
        setLoading(false);
      }
    }

    fetchJournalById();
  }, [journalId]);

  // --- Render Logic ---

  if (loading) {
    return (
      <>
        <Header locale={locale} />
        <div className='flex min-h-screen items-center justify-center'>
          <p>{t('Loading_journal_details')}</p>
        </div>
        <Footer />
      </>
    )
  }

  if (error || journal === null) {
    return (
      <>
        <Header locale={locale} />
        {/* Không hiển thị lỗi "Journal not found" cho người dùng, chỉ hiển thị trang 404 */}
        {error && error !== 'Journal not found.' && (
          <div className='py-4 text-center text-red-500'>
            {t('Error')}: {error}
          </div>
        )}
        <NotFoundPage />
        <Footer />
      </>
    )
  }

  if (journal) {
    // QUAN TRỌNG: Vì cấu trúc dữ liệu đã thay đổi (không còn `journal.data`),
    // bạn cần đảm bảo các component con như JournalReport, JournalTabs
    // cũng được cập nhật để nhận props là `journal` và truy cập trực tiếp
    // các thuộc tính (ví dụ: `journal.Title` thay vì `journal.data.title`).
    return (
      <div className=''>
        <Header locale={locale} />
        <div className='w-full bg-background py-10'></div>
        <JournalReport journal={journal} />
        <JournalTabs journal={journal} />
        {/* <RecommendedJournals /> */}
        <RecentlyAddedJournals />
        <SubjectAreasJournals />
        <Footer />
      </div>
    )
  }

  return (
    <>
      <Header locale={locale} />
      <div className='flex min-h-screen items-center justify-center'>
        <p>{t('Something_went_wrong')}</p>
      </div>
      <Footer />
    </>
  )
}

export default JournalDetails