// Journals.tsx
import React from 'react';
import JournalReport from '../components/journal/JournalReport';
import { RecentlyAddedJournals } from '../components/journal/RecentlyAddedJournals';
import { JournalTabs } from '../components/journal/JournalTabs';
import { JournalResponse } from '../../../models/response/journal.response'; // Import JournalResponse
import { RecommendedJournals } from '../components/journal/RecommendedJournals'; // Import RecommendedJournals
import journalData from '../../../models/data/journals-list.json'; // Assuming journals.json is in the same directory

const JournalDetails: React.FC = () => {
  // Lấy journal đầu tiên từ danh sách (ví dụ)
  const journal: JournalResponse = journalData[0] as JournalResponse;

  return (
    <div className="">
      <div className="py-14 bg-background w-full">
          <h1>{journal.title}</h1>
      </div>
      <JournalReport journal={journal} />
      <JournalTabs journal={journal} />
      <RecommendedJournals />
      <RecentlyAddedJournals /> 
    </div>
  );
};

export default JournalDetails;