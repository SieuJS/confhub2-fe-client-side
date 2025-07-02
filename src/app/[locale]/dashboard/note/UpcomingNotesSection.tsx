// src/app/[locale]/dashboard/note/UpcomingNotesSection.tsx
import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import NoteCard from './NoteCard';
import { ProcessedNote } from '@/src/hooks/dashboard/note/useNoteData';

interface UpcomingNotesSectionProps {
  loading: boolean;
  initialLoad: boolean;
  notes: ProcessedNote[];
}

const renderLoading = (t: any) => (
  <div className="flex flex-col items-center justify-center h-80 text-gray-500">
    <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
    <p className="mt-4 text-lg">{t('MyConferences.Loading_your_calendar')}</p>
  </div>
);

const UpcomingNotesSection: React.FC<UpcomingNotesSectionProps> = ({ loading, initialLoad, notes }) => {
  const t = useTranslations('');

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">{t('Upcoming_Notes')}</h2>
      
      {loading && !initialLoad && renderLoading(t)}

      {!loading && notes.length === 0 ? (
        <p>{t('Nothing_important_dates_coming_up')}</p>
      ) : (
        !loading && (
          <div className="flex flex-wrap gap-4">
            {notes.map((note, index) => (
              <NoteCard 
                key={index} 
                note={note} 
                // FIX: Điều chỉnh class để responsive.
                // - w-full: Trên mobile, mỗi card sẽ chiếm toàn bộ chiều rộng, buộc chúng phải xuống hàng, tạo thành layout 1 cột.
                // - md:w-auto: Trên desktop, chiều rộng sẽ tự động.
                // - md:min-w-[320px] và md:flex-1: Các thuộc tính này chỉ áp dụng trên desktop để giữ layout flex-wrap như cũ.
                className="w-full md:w-auto md:min-w-[320px] md:flex-1"
              />
            ))}
          </div>
        )
      )}
    </section>
  );
};

export default UpcomingNotesSection;