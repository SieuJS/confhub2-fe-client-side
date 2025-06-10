// src/components/MyConferences/NoteTab/NoteTab.tsx
import React from 'react';
import { useTranslations } from 'next-intl';
import Calendar from './Calendar';
import { useNoteData } from '@/src/hooks/dashboard/note/useNoteData';
import { useResizablePanels } from '@/src/hooks/dashboard/note/useResizablePanels';
import AuthViews from './AuthViews';
import DateDetailsLegend from './DateDetailsLegend';
import UpcomingNotesSection from './UpcomingNotesSection';

interface NoteTabProps {}

const NoteTab: React.FC<NoteTabProps> = () => {
  const t = useTranslations('');
  
  // Custom hook để quản lý logic fetch và xử lý dữ liệu
  const {
    upcomingNotes,
    calendarEvents,
    loading,
    loggedIn,
    error,
    initialLoad,
    isBanned
  } = useNoteData(t);

  // Custom hook để quản lý logic thay đổi kích thước panel
  const {
    leftWidth,
    isResizing,
    startResizing,
    leftSectionRef,
    rightSectionRef
  } = useResizablePanels(50); // 50% là chiều rộng ban đầu

  return (
    <AuthViews
      loading={loading}
      initialLoad={initialLoad}
      loggedIn={loggedIn}
      isBanned={isBanned}
      error={error}
    >
      <div className="flex h-full w-full flex-col bg-background p-2 md:p-4">
        <DateDetailsLegend />

        <div className="flex flex-grow">
          {/* Left Panel */}
          <div
            ref={leftSectionRef}
            style={{ width: `${leftWidth}%` }}
            className="overflow-auto p-2 md:p-4"
          >
            <UpcomingNotesSection
              loading={loading}
              initialLoad={initialLoad}
              notes={upcomingNotes}
            />
          </div>

          {/* Resizer */}
          <div
            className={`cursor-col-resize ${isResizing ? 'bg-blue-500' : 'bg-gray-300'}`}
            onMouseDown={startResizing}
            style={{ width: '5px', flexShrink: 0 }}
          ></div>

          {/* Right Panel */}
          <div
            ref={rightSectionRef}
            style={{ width: `calc(${100 - leftWidth}% - 5px)` }}
            className="overflow-auto p-4"
          >
            <Calendar calendarEvents={calendarEvents} />
          </div>
        </div>
      </div>
    </AuthViews>
  );
};

export default NoteTab;