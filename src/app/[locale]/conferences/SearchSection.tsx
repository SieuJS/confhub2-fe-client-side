// src/components/SearchSection.tsx

"use client";

import React from 'react';
import Button from '../utils/Button';
import SearchAdvanceSection from './SearchAdvanceSection';
import useSearchForm from '../../../hooks/conferences/useSearchForm'; // Import the hook


interface SearchSectionProps {
  onSearch: (searchParams: {
    keyword?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    location?: string | null;
    type?: 'Online' | 'Offline' | 'Hybrid' | null;
    submissionDate?: Date | null;
    publisher?: string | null;
    rank?: string | null;
    sourceYear?: string | null;
    averageScore?: string | null;
    topics?: string[];
    fieldOfResearch?: string[];
  }) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch }) => {
  const {
    confKeyword,
    selectedLocation,
    selectedType,
    startDate,
    endDate,
    locationSearchQuery,
    typeSearchQuery,
    isLocationDropdownOpen,
    isTypeDropdownOpen,
    locationDropdownRef,
    typeDropdownRef,
    isAdvancedOptionsVisible,
    filteredLocations,
    filteredTypes,
    handleKeywordChange,
    handleSearchClick,
    handleKeyPress,
    handleLocationClick,
    handleTypeClick,
    handleLocationSearchChange,
    handleTypeSearchChange,
    handleStartDateInputChange,
    handleEndDateInputChange,
    toggleLocationDropdown,
    toggleTypeDropdown,
    toggleAdvancedOptionsVisibility,
    handleSubmissionDateChange,
    submissionDate,
    handleRankChange,
    selectedRank,
    handleSourceYearChange,
    selectedSourceYear,
    handleAverageScoreChange,
    selectedAverageScore,
    handleTopicsChange,
    selectedTopics,
    handleFieldsOfResearchChange,
    selectedFieldsOfResearch,
    handlePublisherChange,  // Use the corrected handler name
    selectedPublisher,     // Include selectedPublisher
  } = useSearchForm({ onSearch });


  return (
    <div className="container mx-auto px-4 text-base">
      <div className="rounded-full shadow-md flex border border-black items-center py-8 px-4 space-x-4">
        <div className="flex items-center flex-grow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Type a command or search..."
            className="outline-none w-full bg-transparent"
            value={confKeyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyPress}
          />
        </div>

        <div className="border-l border-gray-300 h-6"></div>

        <div className="flex items-center space-x-2">
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            className="border rounded px-2 py-1 bg-transparent"
            onChange={handleStartDateInputChange}
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
          />
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            className="border rounded px-2 py-1 bg-transparent"
            onChange={handleEndDateInputChange}
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
          />
        </div>

        <div className="border-l border-gray-300 h-6"></div>

        <div className="relative" ref={locationDropdownRef}>
          <button className=" flex items-center space-x-2 bg-transparent  outline-none" onClick={toggleLocationDropdown}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span>{selectedLocation ? selectedLocation : 'Location'}</span>
          </button>

          {isLocationDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1 max-h-48 overflow-y-scroll" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <input
                  type="text"
                  placeholder="Search location..."
                  className="block w-full px-4 py-2 text-sm text-gray-700 focus:outline-none"
                  onChange={handleLocationSearchChange}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  key="all"
                  onClick={() => handleLocationClick("")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 role='menuitem'"
                >
                  All Locations
                </button>
                {[...new Set(filteredLocations)].map((location) => (
                  <button
                    key={location}
                    onClick={() => handleLocationClick(location)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 role='menuitem'"
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-l border-gray-300 h-6"></div>

        <div className="relative" ref={typeDropdownRef}>
          <button className=" flex items-center space-x-2 bg-transparent  outline-none" onClick={toggleTypeDropdown}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span>{selectedType ? selectedType : 'Type'}</span>
          </button>

          {isTypeDropdownOpen && (
            <div className="absolute left-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10" tabIndex={0}>
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button
                  key="all"
                  onClick={() => handleTypeClick("")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 role='menuitem'"
                >
                  All Types
                </button>
                {filteredTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeClick(type)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 role='menuitem'"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Button variant="primary" size="large" rounded className="" onClick={handleSearchClick}>
          Search
        </Button>
      </div>

      <SearchAdvanceSection
        isAdvancedOptionsVisible={isAdvancedOptionsVisible}
        toggleAdvancedOptionsVisibility={toggleAdvancedOptionsVisibility}
        onSubmissionDateChange={handleSubmissionDateChange}
        submissionDate={submissionDate}
        onRankChange={handleRankChange}
        selectedRank={selectedRank}
        onSourceYearChange={handleSourceYearChange}
        selectedSourceYear={selectedSourceYear}
        onAverageScoreChange={handleAverageScoreChange}
        selectedAverageScore={selectedAverageScore}
        onTopicsChange={handleTopicsChange}
        selectedTopics={selectedTopics}
        onFieldOfResearchChange={handleFieldsOfResearchChange}
        selectedFieldsOfResearch={selectedFieldsOfResearch}
        onPublisherChange={handlePublisherChange} // Pass the corrected handler
        selectedPublisher={selectedPublisher}   // Pass selectedPublisher
      />
    </div>
  );
};

export default SearchSection;