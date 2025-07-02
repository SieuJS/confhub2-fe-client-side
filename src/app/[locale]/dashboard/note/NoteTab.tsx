// src/components/MyConferences/NoteTab/NoteTab.tsx
// src/components/MyConferences/NoteTab/NoteTab.tsx
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Calendar from './Calendar';
import { useNoteData } from '@/src/hooks/dashboard/note/useNoteData';
import { useResizablePanels } from '@/src/hooks/dashboard/note/useResizablePanels';
import AuthViews from './AuthViews';
import DateDetailsLegend from './DateDetailsLegend';
import UpcomingNotesSection from './UpcomingNotesSection';

interface NoteTabProps { }

const NoteTab: React.FC<NoteTabProps> = () => {
  const t = useTranslations('');

  const HEADER_AND_PADDING_HEIGHT = 'calc(110vh)';

  const {
    upcomingNotes,
    calendarEvents,
    loading,
    // loggedIn, // <-- BỎ DÒNG NÀY
    isLoggedIn, // <-- LẤY isLoggedIn TỪ useNoteData
    error,
    initialLoad,
    isBanned
  } = useNoteData(t);

  const {
    leftWidth,
    isResizing,
    startResizing,
    leftSectionRef,
    rightSectionRef
  } = useResizablePanels(50);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };
    handleResize();
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

   return (
    <AuthViews
      loading={loading}
      initialLoad={initialLoad}
      loggedIn={isLoggedIn} // <-- TRUYỀN isLoggedIn VÀO AuthViews
      isBanned={isBanned}
      error={error}
    >
      <div className="flex h-full flex-col bg-background" style={{ height: HEADER_AND_PADDING_HEIGHT }}>
        <DateDetailsLegend />

        <div className="flex min-h-0 flex-grow flex-col md:flex-row">
          <div
            ref={leftSectionRef}
            style={isMobile ? { width: '100%' } : { width: `${leftWidth}%` }}
            className="flex-1 overflow-auto md:flex-none md:pr-4"
          >
            <UpcomingNotesSection
              loading={loading}
              initialLoad={initialLoad}
              notes={upcomingNotes}
            />
          </div>

          <div
            className={`hidden cursor-col-resize md:block ${isResizing ? 'bg-blue-500' : 'bg-gray-300'}`}
            onMouseDown={startResizing}
            style={{ width: '5px', flexShrink: 0 }}
          ></div>

          <div
            ref={rightSectionRef}
            style={isMobile ? { width: '100%' } : { width: `calc(${100 - leftWidth}% - 5px)` }}
            className="mt-4 flex-1 overflow-auto md:mt-0 md:flex-none md:pl-4"
          >
            <div className="md:min-w-[650px]">
              <Calendar calendarEvents={calendarEvents} />
            </div>
          </div>
        </div>
      </div>
    </AuthViews>
  );
};

export default NoteTab;