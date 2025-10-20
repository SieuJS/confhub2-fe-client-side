// src/components/conferences/resultsSection/ResultsHeader.tsx
import React, { useState } from 'react';
import { LayoutGrid, Sheet } from 'lucide-react';

interface ResultsHeaderProps {
  totalItems: number;
  viewType: 'card' | 'table';
  eventsPerPage: number | string;
  sortConfig: { field: string; direction: 'asc' | 'desc' };
  onViewTypeChange: () => void;
  onEventsPerPageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSortChange: (field?: string, direction?: 'asc' | 'desc') => void;
  t: (key: string) => string;
  isLoggedIn: boolean;
  notHaveRelevantSort?: boolean; // Add flag to indicate if relevant sorting is available
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  totalItems,
  viewType,
  eventsPerPage,
  sortConfig,
  onViewTypeChange,
  onEventsPerPageChange,
  onSortChange,
  t,
  isLoggedIn,
  notHaveRelevantSort,
}) => {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showScoreNotReadyDialog, setShowScoreNotReadyDialog] = useState(false);

  // Check if relevant sorting is not available when user is trying to use it
  React.useEffect(() => {
    if (sortConfig.field === 'relevant' && notHaveRelevantSort === true && isLoggedIn) {
      setShowScoreNotReadyDialog(true);
    }
  }, [sortConfig.field, notHaveRelevantSort, isLoggedIn]);

  return (
  <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <h2 className="text-xl font-semibold">
      {t('Conference_Results')} ({totalItems})
    </h2>
    <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort-field" className="flex-shrink-0 text-sm">
          {t('Sort_by')}:
        </label>
        <select
          id="sort-field"
          className="rounded border bg-gray-10 px-2 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sortConfig.field}
          onChange={(e) => {
            if (e.target.value === 'relevant' && !isLoggedIn) {
              setShowLoginDialog(true);
              return;
            }
            onSortChange(e.target.value);
          }}
          title="Select sort criteria"
        >
          <option value="submissionDate">{t('Submission_Date')}</option>
          <option value="conferenceDate">Conference Date</option>
          <option value="rank">{t('Rank')}</option>
          <option value="type">{t('Type')}</option>
          <option value="default">{t('Default')}</option>
          <option value="relevant">{t('Relevant')}</option>
        </select>
        <select
          id="sort-direction"
          className="rounded border bg-gray-10 px-2 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          value={sortConfig.direction}
          onChange={(e) => onSortChange(undefined, e.target.value as 'asc' | 'desc')}
          title="Select sort direction"
          disabled={sortConfig.field === 'default'}
        >
          <option value="desc">{t('Descending')}</option>
          <option value="asc">{t('Ascending')}</option>
        </select>
      </div>

      {/* Events per page Controls */}
      <div className="flex items-center gap-2">
        <label htmlFor="event-per-page" className="flex-shrink-0 text-sm">
          {t('Events_per_page')}:
        </label>
        <select
          id="event-per-page"
          className="rounded border bg-gray-10 px-2 py-1 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 "
          value={eventsPerPage}
          onChange={onEventsPerPageChange}
          title="Select number of event per page"
        >
          <option value="4">4</option>
          <option value="8">8</option>
          <option value="12">12</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>

      {/* View Type Switcher */}
      <button
        onClick={onViewTypeChange}
        className="rounded bg-gray-20 p-2 text-indigo-600 hover:bg-gray-30 focus:outline-none focus:ring-2 focus:ring-blue-500"
        title={viewType === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
      >
        {viewType === 'card' ? <Sheet className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
      </button>
    </div>

    {/* Login Dialog */}
    {showLoginDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="rounded bg-white p-6 shadow-lg max-w-sm w-full">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Login Required</h3>
          <p className="mb-6 text-gray-700">You need to be logged in to use the &quot;Relevant&quot; sorting option. Please log in to access this feature.</p>
          <div className="flex gap-3">
            <button
              className="flex-1 rounded bg-gray-200 py-2 px-4 text-gray-800 font-medium hover:bg-gray-300"
              onClick={() => {
                setShowLoginDialog(false);
              }}
            >
              Cancel
            </button>
            <button
              className="flex-1 rounded bg-blue-600 py-2 px-4 text-white font-medium hover:bg-blue-700"
              onClick={() => {
                setShowLoginDialog(false);
                // Get locale from localStorage and navigate to login page
                const locale = localStorage.getItem('locale') || 'en';
                window.location.href = `/${locale}/auth/login`;
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Score Not Ready Dialog */}
    {showScoreNotReadyDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="rounded bg-white p-6 shadow-lg max-w-sm w-full">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">Relevance Score Not Ready</h3>
          <p className="mb-6 text-gray-700">The system does not have enough data about your preferences to provide recommendations.
Please rate, write reviews, or interact more with the conferences you are interested in so the system can offer personalized recommendations for you.</p>
          <div className="flex gap-3">
            <button
              className="flex-1 rounded bg-blue-600 py-2 px-4 text-white font-medium hover:bg-blue-700"
              onClick={() => {
                setShowScoreNotReadyDialog(false);
                // Reset to default sorting
                onSortChange('submissionDate', 'desc');
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};