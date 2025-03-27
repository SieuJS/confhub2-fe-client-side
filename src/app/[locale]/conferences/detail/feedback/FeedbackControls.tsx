// src/components/Feedback/FeedbackControls.tsx
import React, { useState, useRef } from 'react';
import useClickOutside from '../../../../../hooks/conferenceDetails/useClickOutside'; // Adjust path as needed
import { SortOption } from '@/src/models/send/feedback.send';

interface FeedbackControlsProps {
  filterStar: number | null;
  sortOption: SortOption;
  totalReviews: number;
  displayedCount: number;
  onFilterChange: (value: number | null) => void;
  onSortChange: (value: SortOption) => void;
}

const FeedbackControls: React.FC<FeedbackControlsProps> = ({
  filterStar,
  sortOption,
  totalReviews,
  displayedCount,
  onFilterChange,
  onSortChange,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(filterDropdownRef, () => setIsFilterOpen(false));
  useClickOutside(sortDropdownRef, () => setIsSortOpen(false));

  const handleFilterClick = (value: number | null) => {
    onFilterChange(value);
    setIsFilterOpen(false);
  };

  const handleSortClick = (value: SortOption) => {
    onSortChange(value);
    setIsSortOpen(false);
  };

  return (
    <div className='mb-6 flex flex-col items-start justify-between space-y-4 sm:flex-row sm:items-center sm:space-y-0'>
      <div>
        <h2 className='text-2xl font-semibold'>Conference Feedback</h2>
        <div className='text-sm text-gray-600'>
          Showing {displayedCount} of {totalReviews} Conference Reviews
        </div>
      </div>

      {/* Filter and Sort Dropdowns */}
      <div className='flex space-x-2'>
        {/* Filter Dropdown */}
        <div className='relative' ref={filterDropdownRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className='inline-flex items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200'
            aria-haspopup="true"
            aria-expanded={isFilterOpen}
          >
            {filterStar === null ? 'All Feedback' : `${filterStar} Star${filterStar > 1 ? 's' : ''}`}
            {/* SVG Arrow Icon */}
             <svg className='-mr-1 ml-2 h-5 w-5' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'><path fillRule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clipRule='evenodd' /></svg>
          </button>
          {isFilterOpen && (
            <div className='absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none' role="menu" aria-orientation="vertical">
              <div className='py-1'>
                <button
                  onClick={() => handleFilterClick(null)}
                  className={`${filterStar === null ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm hover:bg-gray-100`}
                  role='menuitem'
                >
                  All Feedback
                </button>
                {[5, 4, 3, 2, 1].map(starValue => (
                  <button
                    key={starValue}
                    onClick={() => handleFilterClick(starValue)}
                    className={`${filterStar === starValue ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm hover:bg-gray-100`}
                    role='menuitem'
                  >
                    {starValue} Star{starValue > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className='relative' ref={sortDropdownRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className='inline-flex items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200'
            aria-haspopup="true"
            aria-expanded={isSortOpen}
          >
            {sortOption === 'time' ? 'Recently Added' : 'Highest Rated'}
            {/* SVG Arrow Icon */}
             <svg className='-mr-1 ml-2 h-5 w-5' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'><path fillRule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clipRule='evenodd' /></svg>
          </button>
          {isSortOpen && (
            <div className='absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none' role="menu" aria-orientation="vertical">
              <div className='py-1'>
                <button
                  onClick={() => handleSortClick('time')}
                  className={`${sortOption === 'time' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm hover:bg-gray-100`}
                  role='menuitem'
                >
                  Recently Added
                </button>
                <button
                  onClick={() => handleSortClick('star')}
                  className={`${sortOption === 'star' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block w-full px-4 py-2 text-left text-sm hover:bg-gray-100`}
                  role='menuitem'
                >
                  Highest Rated
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackControls;