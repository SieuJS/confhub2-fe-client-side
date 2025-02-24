import React from 'react';

interface PaginationProps {
  eventsPerPage: number;
  totalEvents: number;
  paginate: (pageNumber: number) => void;
  currentPage: number;
}

const Pagination: React.FC<PaginationProps> = ({ eventsPerPage, totalEvents, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalEvents / eventsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center justify-center mt-8">
      <button
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-4 py-2 mr-2"
      >
        Previous
      </button>
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => paginate(number)}
          className={`bg-white hover:bg-gray-100 text-gray-700 rounded-md px-4 py-2 mr-1 ${currentPage === number ? 'font-bold' : ''}`}
        >
          {number}
        </button>
      ))}
      <button
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === pageNumbers.length}
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-4 py-2"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;