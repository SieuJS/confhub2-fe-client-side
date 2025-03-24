// SearchJournalSection.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from '../utils/Button';
import SearchAdvanceJournalSection from './SearchAdvanceJournalSection';
import useSearchJournalForm from '../../../hooks/journals/useSearchJounalForm'; // Import the hook


interface SearchJournalSectionProps {
  onSearch: (searchParams: {
    keyword?: string;
    country?: string | null;
    publicationType?: string | null;
    subjectAreas?: string[];
    quartile?: string | null;
    openAccessTypes?: string[];
    publisher?: string | null;
    language?: string | null;
    impactFactor?: string | null;
    hIndex?: string | null;
    citeScore?: string | null;
    sjr?: string | null;
    overallRank?: string | null;
    issn?: string | null;
  }) => void;
  onClear: () => void;
}

const SearchJournalSection: React.FC<SearchJournalSectionProps> = ({ onSearch, onClear }) => {
  const {
    journalKeyword,
    selectedCountry,
    countryDropdownRef,
    isCountryDropdownOpen,
    filteredCountries,
    selectedPublicationType,
    publicationTypeDropdownRef,
    isPublicationTypeDropdownOpen,
    availablePublicationTypes,
    isAdvancedOptionsVisible,
    selectedSubjectAreas,
    selectedQuartile,
    selectedISSN,
    selectedOpenAccessTypes,
    selectedPublisher,
    selectedLanguage,
    selectedImpactFactor,
    selectedHIndex,
    selectedCiteScore,
    selectedSJR,
    selectedOverallRank,
    handleKeywordChange,
    handleCountryClick,
    handleCountrySearchChange,
    toggleCountryDropdown,
    handlePublicationTypeClick,
    togglePublicationTypeDropdown,
    handleSubjectAreasChange,
    handleQuartileChange,
    handleISSNChange,
    handleOpenAccessTypesChange,
    handlePublisherChange,
    handleLanguageChange,
    handleImpactFactorChange,
    handleHIndexChange,
    handleCiteScoreChange,
    handleSJRChange,
    handleOverallRankChange,
    handleSearchClick,
    handleKeyPress,
    toggleAdvancedOptionsVisibility,
    handleClear,
  }
  = useSearchJournalForm({onSearch, onClear});


  return (
    <div className="container mx-auto px-4 text-base">
      <div className="rounded-full shadow-md flex flex-wrap justify-center items-center border border-black py-2 px-3 space-x-4">
        <div className="flex items-center flex-grow basis-full md:basis-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Nhập từ khóa Tiêu đề/Tên Journal..."
            className="outline-none w-full bg-transparent text-sm"
            value={journalKeyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyPress}
          />
        </div>

        <div className="border-l border-gray-300 h-6 mx-2 hidden md:block"></div>

        <div className="relative" ref={countryDropdownRef}>
          <button className=" flex items-center space-x-2 bg-transparent  outline-none" onClick={toggleCountryDropdown}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="text-sm">{selectedCountry ? selectedCountry : 'Quốc gia'}</span>
          </button>

          {isCountryDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10" tabIndex={0}>
              <div className="py-1 max-h-48 overflow-y-scroll" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <input
                  type="text"
                  placeholder="Tìm kiếm quốc gia..."
                  className="block w-full px-4 py-2 text-sm text-gray-700 focus:outline-none"
                  onChange={handleCountrySearchChange}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  key="all"
                  onClick={() => handleCountryClick("")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 role='menuitem'"
                >
                  Tất cả Quốc gia
                </button>
                {[...new Set(filteredCountries)].map((location) => (
                  <button
                    key={location}
                    onClick={() => handleCountryClick(location)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 role='menuitem'"
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-l border-gray-300 h-6 mx-2 hidden md:block"></div>


        <div className="relative" ref={publicationTypeDropdownRef}>
          <button className=" flex items-center space-x-2 bg-transparent  outline-none" onClick={togglePublicationTypeDropdown}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            <span className='text-sm'>{selectedPublicationType ? selectedPublicationType : 'Loại Ấn Phẩm'}</span>
          </button>

          {isPublicationTypeDropdownOpen && (
            <div className="absolute left-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10" tabIndex={0}>
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button
                  key="all"
                  onClick={() => handlePublicationTypeClick("")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 role='menuitem'"
                >
                  Tất cả Loại
                </button>
                {availablePublicationTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handlePublicationTypeClick(type)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 role='menuitem'"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-4 md:space-x-4 md:pl-4 md:ml-4 mt-2 md:mt-0">
          <Button variant="primary" size="small" rounded className="" onClick={handleSearchClick}>
            Tìm kiếm
          </Button>
          <Button variant="secondary" size="small" rounded className="" onClick={handleClear}>
              Clear
          </Button>
        </div>
      </div>

      {/* Thêm SearchAdvanceJournalSection ở đây */}
      <SearchAdvanceJournalSection
        isAdvancedOptionsVisible={isAdvancedOptionsVisible}
        toggleAdvancedOptionsVisibility={toggleAdvancedOptionsVisibility}
        onSubjectAreasChange={handleSubjectAreasChange}
        selectedSubjectAreas={selectedSubjectAreas}
        onQuartileChange={handleQuartileChange}
        selectedQuartile={selectedQuartile}
        onOpenAccessTypesChange={handleOpenAccessTypesChange}
        selectedOpenAccessTypes={selectedOpenAccessTypes}
        onPublisherChange={handlePublisherChange}
        selectedPublisher={selectedPublisher}
        onLanguageChange={handleLanguageChange}
        selectedLanguage={selectedLanguage}
        onImpactFactorChange={handleImpactFactorChange}
        selectedImpactFactor={selectedImpactFactor}
        onHIndexChange={handleHIndexChange}
        selectedHIndex={selectedHIndex}
        onCiteScoreChange={handleCiteScoreChange}
        selectedCiteScore={selectedCiteScore}
        onSJRChange={handleSJRChange}
        selectedSJR={selectedSJR}
        onOverallRankChange={handleOverallRankChange}
        selectedOverallRank={selectedOverallRank}
        onISSNChange={handleISSNChange}
        selectedISSN={selectedISSN}
      />
    </div>
  );
};

export default SearchJournalSection;