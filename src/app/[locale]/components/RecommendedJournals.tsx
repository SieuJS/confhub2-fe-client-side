// components/RecommendedJournals.tsx
import React from 'react';

export const RecommendedJournals: React.FC = () => {
  const journals = [
    {
      category: 'TECHNOLOGY',
      imageUrl: 'https://placehold.co/150x150/3498db/fff',
      title: 'AI & Machine Learning Journal 2024',
      publisher: 'Tech Publishers Inc.',
    },
    {
      category: 'HEALTHCARE',
      imageUrl: 'https://placehold.co/150x150/27ae60/fff',
      title: 'Global Health Journal 2024',
      publisher: 'Health Media Group',
    },
    {
      category: 'BUSINESS',
      imageUrl: 'https://placehold.co/150x150/c0392b/fff',
      title: 'Global Marketing Journal',
      publisher: 'Market Leaders Publishing',
    },
    {
      category: 'BUSINESS',
      imageUrl: 'https://placehold.co/150x150/c0392b/fff',
      title: 'Global Marketing Journal',
      publisher: 'Market Leaders Publishing',
    },
    {
      category: 'BUSINESS',
      imageUrl: 'https://placehold.co/150x150/c0392b/fff',
      title: 'Global Marketing Journal',
      publisher: 'Market Leaders Publishing',
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-xl font-semibold text-gray-700 text-center mt-4 mb-4 uppercase">Recommended Journals</h2>
      <p className="text-gray-600 text-center mb-8 text-2xl">Explore recommended and recent journals</p>
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
    <div className="bg-white rounded-lg shadow-md w-60 min-w-60 relative">
      <div className="relative w-full h-32 overflow-hidden">
        <div className={`absolute top-0 left-0 z-10 p-1 px-2 text-xs font-medium text-gray-100 bg-${getCategoryColor(category)}-700 rounded-tl-lg rounded-br-lg`}>
          {category}
        </div>
        <img src={imageUrl} alt="Card image" className="object-cover h-full w-full" />
      </div>
      <div className="p-4 text-gray-700">
        <h3 className="text-sm font-semibold mb-1 truncate">{title}</h3>
        <p className="text-xs">{publisher}</p>
      </div>
      <div className="absolute bottom-0 right-0 p-2 bg-white flex items-center">
        <span className="text-gray-700 text-xs font-bold">Publisher: {publisher}</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
          stroke="currentColor" className="w-4 h-4 text-gray-700 ml-1">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="m11.25 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
  );
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'TECHNOLOGY':
      return 'blue';
    case 'HEALTHCARE':
      return 'green';
    case 'BUSINESS':
      return 'red';
    default:
      return 'gray';
  }
};