// components/RecentlyAddedJournals.tsx
import React from 'react';

export const RecentlyAddedJournals: React.FC = () => {
  const journals = [
    {
      category: 'CONSUMERS & BRANDS',
      imageUrl: 'https://placehold.co/150x150/34495e/fff',
      title: 'Journal of Supermarket Loyalty Programs',
      publisher: 'Statista',
    },
    {
      category: 'INDUSTRIES & MARKETS',
      imageUrl: 'https://placehold.co/150x150/34495e/fff',
      title: 'Journal of Advertising in New Zealand',
      publisher: 'Statista',
    },
    {
      category: 'INDUSTRIES & MARKETS',
      imageUrl: 'https://placehold.co/150x150/34495e/fff',
      title: 'Journal of Advertising in Indonesia',
      publisher: 'Statista',
    },
    {
      category: 'DIGITAL & TRENDS',
      imageUrl: 'https://placehold.co/150x150/34495e/fff',
      title: 'Journal of Social Media Advertising & Marketing Worldwide',
      publisher: 'Statista',
    },
    {
      category: 'CONSUMERS & BRANDS',
      imageUrl: 'https://placehold.co/150x150/34495e/fff',
      title: 'Journal of Supermarket Loyalty Programs',
      publisher: 'Statista',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-xl font-semibold  text-center mb-4 uppercase">Recently Added Journals</h2>
      <p className=" text-center mb-8 text-2xl">Explore the latest updated journals</p>
      <div className="overflow-x-auto whitespace-nowrap flex justify-center items-start gap-4 pb-4">
        {journals.map((journal, index) => (
          <JournalCard key={index} {...journal} />
        ))}
      </div>
    </div>
  );
};

interface JournalCardProps {
  category: string;
  imageUrl: string;
  title: string;
  publisher: string;
}

const JournalCard: React.FC<JournalCardProps> = ({
  category,
  imageUrl,
  title,
  publisher,
}) => {
  return (
    <div className="bg-background rounded-lg shadow-md w-60 min-w-60 relative">
      <div className="relative w-full h-32 overflow-hidden">
        <div className={`absolute top-0 left-0 z-10 p-1 px-2 text-xs font-medium  rounded-tl-lg rounded-br-lg`}>
          {category}
        </div>
        <img src={imageUrl} alt="Card image" className="object-cover h-full w-full" />
      </div>
      <div className="p-4 ">
        <h3 className="text-sm font-semibold mb-1 truncate">{title}</h3>
        <p className="text-xs">{publisher}</p>
      </div>
      
    </div>
  );
};