// Journals.tsx (hoặc tốt hơn là đổi tên file thành JournalDetails.tsx)
"use client";
import React from 'react';
import JournalReport from '../JournalReport';
import { RecentlyAddedJournals } from './RecentlyAddedJournals';
import { JournalTabs } from './JournalTabs';
import { JournalResponse } from '../../../../models/response/journal.response';
import { RecommendedJournals } from './RecommendedJournals';
import journalData from '../../../../models/data/journal_data_1_500.json'; // Đảm bảo đường dẫn đúng
import { useSearchParams } from 'next/navigation';
import NotFoundPage from '../../utils/NotFoundPage';
import { Header } from '../../utils/Header';
import Footer from '../../utils/Footer';

// Đổi tên component cho khớp với mục đích
const JournalDetails = ({ locale }: { locale: string }) => {
  const searchParams = useSearchParams();
  const idFromQuery = searchParams.get('id'); // Lấy giá trị từ query param 'id' (thực chất là Sourceid)

  // Tìm kiếm journal dựa trên Sourceid
  const journal: JournalResponse | undefined = journalData.find(
    // So sánh idFromQuery với journal.Sourceid
    (j) => j.Sourceid === idFromQuery
  ) as JournalResponse | undefined; // Ép kiểu nếu cần, nhưng find đã trả về đúng type hoặc undefined

  if (!idFromQuery || !journal) { // Kiểm tra cả idFromQuery có tồn tại không
    return (
      // Có thể thêm Header/Footer vào trang NotFound nếu muốn
      <>
        <Header locale={locale} />
        <NotFoundPage />
        <Footer />
      </>
    );
  }

  return (
    <div className="">
      <Header locale={locale} />
      <div className="py-10 bg-background w-full">
        {/* Có thể thêm tiêu đề trang hoặc breadcrumbs ở đây */}
      </div>
      {/* Truyền journal đã tìm thấy vào các component con */}
      <JournalReport journal={journal} />
      <JournalTabs journal={journal} />
      <RecommendedJournals /> {/* Component này có cần dữ liệu journal không? */}
      <RecentlyAddedJournals /> {/* Component này có cần dữ liệu journal không? */}
      <Footer />
    </div>
  );
};

export default JournalDetails; // Đổi tên export nếu đổi tên component