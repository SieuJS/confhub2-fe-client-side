// src/components/common/Pagination.tsx
import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPageNumbersToShow?: number;
  className?: string;
}

const GeneralPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPageNumbersToShow = 5,
  className = '',
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // --- Logic to determine which page numbers to display ---
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const visiblePages = new Set<number>();

    const effectiveMaxPages = Math.max(3, maxPageNumbersToShow);
    const halfMaxPages = Math.floor(effectiveMaxPages / 2);

    // Always include first and last page
    visiblePages.add(1);
    if (totalPages > 1) {
      visiblePages.add(totalPages);
    }

    // Add pages around current page to the set
    for (let i = currentPage - halfMaxPages; i <= currentPage + halfMaxPages; i++) {
      if (i >= 1 && i <= totalPages) {
        visiblePages.add(i);
      }
    }

    // Convert set to sorted array
    const sortedVisiblePages = Array.from(visiblePages).sort((a, b) => a - b);

    // Add numbers and ellipses to the final list
    let lastAddedPage: number | null = null;
    for (const pageNum of sortedVisiblePages) {
      // If there's a gap larger than 1 between the last added page and the current pageNum, add an ellipsis
      if (lastAddedPage !== null && pageNum > lastAddedPage + 1) {
        pages.push('...');
      }
      pages.push(pageNum);
      lastAddedPage = pageNum;
    }
    return pages;
  };

  const pageNumbersToDisplay = getPageNumbers();

  // --- Tailwind CSS Classes ---
  const buttonBaseClass = "min-w-[32px] h-8 flex items-center justify-center px-3 text-sm rounded-md transition-colors duration-200 ease-in-out";
  const buttonInactiveClass = "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300";
  const buttonActiveClass = "bg-blue-600 text-white border border-blue-600 shadow-md cursor-default";
  const buttonDisabledClass = "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed pointer-events-none"; // pointer-events-none for full disable
  const ellipsisClass = "px-3 py-1 text-sm text-gray-500";


  return (
    <nav aria-label="Pagination" className={`flex justify-center items-center ${className}`}>
      <ul className="inline-flex items-center space-x-2"> {/* Use space-x for modern spacing */}
        {/* Previous Button */}
        <li>
          <button
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${buttonBaseClass} ${currentPage === 1 ? buttonDisabledClass : buttonInactiveClass}`}
            aria-label="Go to previous page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
          </button>
        </li>

        {/* Page Number Buttons & Ellipsis */}
        {pageNumbersToDisplay.map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className={ellipsisClass} aria-hidden="true">...</span>
            ) : (
              <button
                onClick={() => handlePageClick(page as number)}
                disabled={page === currentPage}
                className={`${buttonBaseClass} ${page === currentPage ? buttonActiveClass : buttonInactiveClass
                  } focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-75`}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next Button */}
        <li>
          <button
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${buttonBaseClass} ${currentPage === totalPages ? buttonDisabledClass : buttonInactiveClass}`}
            aria-label="Go to next page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default GeneralPagination;