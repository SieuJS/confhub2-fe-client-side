import React from 'react';
import { useTranslations } from 'next-intl'

interface PaginationProps {
  eventsPerPage: number;
  totalEvents: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ eventsPerPage, totalEvents, paginate, currentPage }) => {
  const pageNumbers = [];
  const t = useTranslations('');

  for (let i = 1; i <= Math.ceil(totalEvents / eventsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center mt-8 text-xs pb-4">
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-background hover:bg-background-secondary  rounded-md px-4 py-2 mr-2"
      >
        {t('Previous')}
      </button>
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={`bg-background hover:bg-background-secondary  rounded-md px-4 py-2 mr-1 ${currentPage === number ? 'font-bold' : ''}`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === pageNumbers.length}
        className="bg-background hover:bg-background-secondary  rounded-md px-4 py-2"
      >
        {t('Next')}
      </button>
    </div>
  );
};

export default Pagination;