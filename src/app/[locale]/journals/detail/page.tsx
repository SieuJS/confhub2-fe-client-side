// Journals.tsx
"use client";
import React from 'react';
import JournalReport from '../JournalReport';
import { RecentlyAddedJournals } from './RecentlyAddedJournals';
import { JournalTabs } from './JournalTabs';
import { JournalResponse } from '../../../../models/response/journal.response'; // Import JournalResponse
import { RecommendedJournals } from './RecommendedJournals'; // Import RecommendedJournals
import journalData from '../../../../models/data/journals-list.json'; // Assuming journals.json is in the same directory
import { useSearchParams } from 'next/navigation'; //  USE THIS for query params
import NotFoundPage from '../../utils/NotFoundPage';
import { Header } from '../../utils/Header';
import Footer from '../../utils/Footer';

const JournalDetails = ({ locale }: { locale: string }) => {
  const searchParams = useSearchParams(); // Use useSearchParams
  const id = searchParams.get('id');  // Get the 'id' parameter

  // Find the journal based on the id from the URL params
  const journal: JournalResponse | undefined = journalData.find(
    (journal) => journal.id === id
  ) as JournalResponse | undefined;

  if (!journal) {
    return (
      <NotFoundPage />
    );
  }


  return (
    <div className="">
      <Header locale={locale} />
      <div className="py-14 bg-background w-full">
      </div>
      <JournalReport journal={journal} />
      <JournalTabs journal={journal} />
      <RecommendedJournals />
      <RecentlyAddedJournals />
      <Footer />
    </div>
  );
};

export default JournalDetails;