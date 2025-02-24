// Journals.tsx
import React from 'react';
// import { JournalReport } from '../components/JournalReport';
import JournalReport from '../components/JournalReport';
import { RecommendedJournals } from '../components/RecommendedJournals';
import { RecentlyAddedJournals } from '../components/RecentlyAddedJournals';
import { JournalTabs } from '../components/JournalTabs';

const JournalDetails: React.FC = () => {
  return (
    <div className="">
      <div className="py-14 bg-background w-full"></div>
      <JournalReport />
      <JournalTabs />
      <RecommendedJournals />
      <RecentlyAddedJournals />

    </div>
  );
};

export default JournalDetails;