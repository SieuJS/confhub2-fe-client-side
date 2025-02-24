// Journals.tsx
import React from 'react';
// import { JournalReport } from '../components/JournalReport';
import JournalReport from '../components/JournalReport';
import { Footer } from '../components/Footer';
import { RecommendedJournals } from '../components/RecommendedJournals';
import { RecentlyAddedJournals } from '../components/RecentlyAddedJournals';
import { JournalTabs } from '../components/JournalTabs';

const JournalDetails: React.FC = () => {
  return (
    <div className="bg-white-100">
      {/* <FeedbackBar /> */}
      {/* <NavigationBar /> */}
      <JournalReport />
      <JournalTabs />
      <RecommendedJournals />
      <RecentlyAddedJournals />
      <Footer />
    </div>
  );
};

export default JournalDetails;