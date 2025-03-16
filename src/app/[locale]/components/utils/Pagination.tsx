// Pagination.tsx
import React from 'react';
import { useTranslations } from 'next-intl';

interface PaginationProps {
  eventsPerPage: number;
  totalEvents: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ eventsPerPage, totalEvents, paginate, currentPage }) => {
  const t = useTranslations();

  const totalPages = Math.ceil(totalEvents / eventsPerPage);
  // Don't render pagination if there's only one page or no events.
  if (totalPages <= 1 || totalEvents === 0) {
    return null;
  }

  // Generate an array of page numbers.  More efficient than a loop.
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center mt-8 text-xs pb-4">
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md px-4 py-2 mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('Previous')}
      </button>

      {/*  Show a limited range of page numbers with ellipses  */}
      {pageNumbers.map(number => {
          const isCurrent = number === currentPage;
          const isNearCurrent = Math.abs(number - currentPage) <= 2; // Show 2 pages on either side
          const isFirstOrLast = number === 1 || number === totalPages;

          if (isFirstOrLast || isNearCurrent) {
            return (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md px-4 py-2 mr-1 ${isCurrent ? 'font-bold bg-gray-400' : ''}`}
              >
                {number}
              </button>
            );
          } else if (Math.abs(number - currentPage) === 3) {
             return <span key={number} className="px-4 py-2">...</span>
          } else {
            return null; // Don't render anything for pages far from the current page
          }
      })}

      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t('Next')}
      </button>
    </div>
  );
};

export default Pagination;
