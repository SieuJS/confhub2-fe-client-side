// src/components/SearchSection.tsx
"use client";

import React from 'react';
import Button from '../utils/Button';
import SearchAdvanceSection from './SearchAdvanceSection';
import useSearchForm from '../../../hooks/conferences/useSearchForm'; // Import the hook


interface SearchSectionProps {
  onSearch: (searchParams: {
    keyword?: string;
    fromDate?: Date | null;
    toDate?: Date | null;
    location?: string | null;
    type?: 'Online' | 'Offline' | 'Hybrid' | null;
    submissionDate?: Date | null;
    publisher?: string | null;
    rank?: string | null;
    source?: string | null;
    averageScore?: string | null;
    topics?: string[];
    fieldOfResearch?: string[];
  }) => void;
  onClear: () => void; // Add onClear prop
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, onClear }) => { // Destructure onClear
  const {
    confKeyword,
    selectedLocation,
    selectedType,
    fromDate,
    toDate,
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
    handleSourceChange,
    selectedSource,
    handleAverageScoreChange,
    selectedAverageScore,
    handleTopicsChange,
    selectedTopics,
    handleFieldsOfResearchChange,
    selectedFieldsOfResearch,
    handlePublisherChange,
    selectedPublisher,
    handleClear, // Get handleClear from the hook
  } = useSearchForm({ onSearch, onClear }); // Pass onClear to the hook


  return (
    <div className="container mx-auto px-4 text-base">
      {/* Use flex-wrap and justify-center for responsiveness */}
      <div className="rounded-full shadow-md flex flex-wrap justify-center items-center border border-black py-2 px-3 space-x-4">
        <div className="flex items-center flex-grow max-w-[500px] basis-full md:basis-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Type a command or search..."
            className="outline-none w-full bg-transparent text-sm"
            value={confKeyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyPress}
          />
        </div>

        {/* Use hidden and block with media queries for dividers */}
        <div className="border-l border-gray-300 h-6 mx-2 hidden md:block"></div>

        <div className="flex items-center space-x-2 px-2">
          <label htmlFor="fromDate" className="text-sm">Start:</label>
          <input
            type="date"
            id="fromDate"
            className="border rounded py-0.5 text-sm bg-transparent w-26"
            onChange={handleStartDateInputChange}
            value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
          />
        </div>

        <div className="flex items-center space-x-2 px-2">
          <label htmlFor="toDate" className="text-sm">End:</label>
          <input
            type="date"
            id="toDate"
            className="border rounded py-0.5 text-sm bg-transparent w-26"
            onChange={handleEndDateInputChange}
            value={toDate ? toDate.toISOString().split('T')[0] : ''}
          />
        </div>

        {/* Use hidden and block with media queries for dividers */}
        <div className="border-l border-gray-300 h-6 mx-2 hidden md:block"></div>

        <div className="relative" ref={locationDropdownRef}>
          <button className="flex items-center space-x-2 bg-transparent outline-none" onClick={toggleLocationDropdown}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-sm">{selectedLocation ? selectedLocation : 'Location'}</span>
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

        {/* Use hidden and block with media queries for dividers */}
        <div className="border-l border-gray-300 h-6 mx-2 hidden md:block"></div>

        <div className="relative" ref={typeDropdownRef}>
          <button className=" flex items-center space-x-2 bg-transparent  outline-none" onClick={toggleTypeDropdown}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span className="text-sm">{selectedType ? selectedType : 'Type'}</span>
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

        {/* Use margin and padding for spacing on smaller screens */}
        <div className="flex space-x-4 md:space-x-4 md:pl-4 md:ml-4 mt-2 md:mt-0">
           <Button variant="primary" size="small" rounded className="" onClick={handleSearchClick}>
            Search
          </Button>
          <Button variant="secondary" size="small" rounded className="" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>

      <SearchAdvanceSection
        isAdvancedOptionsVisible={isAdvancedOptionsVisible}
        toggleAdvancedOptionsVisibility={toggleAdvancedOptionsVisibility}
        onSubmissionDateChange={handleSubmissionDateChange}
        submissionDate={submissionDate}
        onRankChange={handleRankChange}
        selectedRank={selectedRank}
        onSourceChange={handleSourceChange}
        selectedSource={selectedSource}
        onAverageScoreChange={handleAverageScoreChange}
        selectedAverageScore={selectedAverageScore}
        onTopicsChange={handleTopicsChange}
        selectedTopics={selectedTopics}
        onFieldOfResearchChange={handleFieldsOfResearchChange}
        selectedFieldsOfResearch={selectedFieldsOfResearch}
        onPublisherChange={handlePublisherChange}
        selectedPublisher={selectedPublisher}
      />
    </div>
  );
};

export default SearchSection;