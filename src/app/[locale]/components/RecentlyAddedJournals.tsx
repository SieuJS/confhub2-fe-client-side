// components/RecentlyAddedJournals.tsx
import React from 'react';
import Image from 'next/image'; // Import Image component
import journalData from '../../../models/data/journals-list.json'; // Import journalData from the specified path
import { JournalResponse } from '../../../models/response/journal.response'; // Import JournalResponse

export const RecentlyAddedJournals: React.FC = () => {
  // Get the first 5 journals from journalData (assuming they are "recently added" in the order of the JSON file)
  const journals = (journalData as JournalResponse[]).slice(0, 5);

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-xl font-semibold  text-center mb-4 uppercase">Recently Added Journals</h2>
      <p className=" text-center mb-8 text-2xl">Explore the latest updated journals</p>
      <div className="overflow-x-auto whitespace-nowrap flex justify-center items-start gap-4 pb-4">
        {journals.map((journal, index) => (
          <JournalCard key={journal.id} journal={journal} />
        ))}
      </div>
    </div>
  );
};

interface JournalCardProps {
  journal: JournalResponse;
}

const JournalCard: React.FC<JournalCardProps> = ({
  journal,
}) => {
  // Extract category from subjectAreas, default to "General" if no subject areas
  const category = journal.subjectAreas && journal.subjectAreas.length > 0
    ? journal.subjectAreas[0].area
    : 'General';

  return (
    <div className="bg-background rounded-lg shadow-md w-60 min-w-60 relative">
      <div className="relative w-full h-32 overflow-hidden">
        <div className={`absolute top-0 left-0 z-10 p-1 px-2 text-xs font-medium  rounded-tl-lg rounded-br-lg bg-secondary text-background`}>
          {category}
        </div>
        <div className="relative w-full h-full">
          <Image
            src={journal.imageUrl || "https://via.placeholder.com/150/34495e/fff?text=No+Image"}
            alt={journal.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
      </div>
      <div className="p-4 ">
        <h3 className="text-sm font-semibold mb-1 truncate">{journal.title}</h3>
        <p className="text-xs">{journal.publisher}</p>
      </div>

    </div>
  );
};