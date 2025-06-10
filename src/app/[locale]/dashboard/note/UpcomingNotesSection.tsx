// src/app/[locale]/dashboard/note/UpcomingNotesSection.tsx
import React, { useState, useLayoutEffect, useRef, useMemo } from 'react';
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
  const notesContainerRef = useRef<HTMLDivElement>(null);
  const [notesPerRow, setNotesPerRow] = useState(3);

  // useLayoutEffect để tính toán trước khi trình duyệt paint, tránh flicker
  useLayoutEffect(() => {
    const updateNotesPerRow = () => {
      if (notesContainerRef.current) {
        const width = notesContainerRef.current.offsetWidth;
        if (width < 640) setNotesPerRow(1);
        else if (width < 1024) setNotesPerRow(2);
        else setNotesPerRow(3);
      }
    };

    updateNotesPerRow(); // Chạy lần đầu
    const resizeObserver = new ResizeObserver(updateNotesPerRow);
    if (notesContainerRef.current) {
      resizeObserver.observe(notesContainerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []); // Chỉ chạy một lần để thiết lập observer

  const noteWidth = useMemo(() => {
    if (notesPerRow === 1) return '100%';
    return `calc((100% / ${notesPerRow}) - 1rem)`; // 1rem là gap
  }, [notesPerRow]);

  return (
    <section className="mb-4 rounded-md bg-background p-2 shadow md:p-4">
      <h2 className="mb-2 text-lg font-semibold">{t('Upcoming_Notes')}</h2>
      
      {loading && !initialLoad && renderLoading(t)}

      {!loading && notes.length === 0 ? (
        <p>{t('Nothing_important_dates_coming_up')}</p>
      ) : (
        !loading && (
          <div ref={notesContainerRef} className="flex flex-row flex-wrap gap-4">
            {notes.map((note, index) => (
              <NoteCard key={index} note={note} style={{ width: noteWidth }} />
            ))}
          </div>
        )
      )}
    </section>
  );
};

export default UpcomingNotesSection;