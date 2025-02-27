// SearchJournalSection.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';
import SearchAdvanceJournalSection from './SearchAdvanceJournalSection';


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
}

const SearchJournalSection: React.FC<SearchJournalSectionProps> = ({ onSearch }) => {
  const [journalKeyword, setJournalKeyword] = useState<string>('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedPublicationType, setSelectedPublicationType] = useState<string | null>(null);
  const [isPublicationTypeDropdownOpen, setIsPublicationTypeDropdownOpen] = useState(false);
  const publicationTypeDropdownRef = useRef<HTMLDivElement>(null);

  // State cho tìm kiếm nâng cao
  const [isAdvancedOptionsVisible, setIsAdvancedOptionsVisible] = useState(false);
  const [selectedSubjectAreas, setSelectedSubjectAreas] = useState<string[]>([]);
  const [selectedQuartile, setSelectedQuartile] = useState<string | null>(null);
  const [selectedOpenAccessTypes, setSelectedOpenAccessTypes] = useState<string[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedImpactFactor, setSelectedImpactFactor] = useState<string | null>(null);
  const [selectedHIndex, setSelectedHIndex] = useState<string | null>(null);
  const [selectedCiteScore, setSelectedCiteScore] = useState<string | null>(null);
  const [selectedSJR, setSelectedSJR] = useState<string | null>(null);
  const [selectedOverallRank, setSelectedOverallRank] = useState<string | null>(null);
  const [selectedISSN, setSelectedISSN] = useState<string | null>(null);

  const availableCountries = ['United States', 'United Kingdom', 'Germany', 'Vietnam', 'Japan', 'China', 'France', 'Canada', 'Australia']; // Ví dụ danh sách quốc gia
  const availablePublicationTypes = ['Journal', 'Conference Proceedings', 'Book Series'];

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJournalKeyword(event.target.value);
  };

  const filteredCountries = availableCountries.filter(country =>
    country.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

 
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleCountryClick = (country: string) => {
    setSelectedCountry(country === "" ? null : country);
    setIsCountryDropdownOpen(false);
  };

  const handlePublicationTypeClick = (type: string) => {
    setSelectedPublicationType(type === "" ? null : type);
    setIsPublicationTypeDropdownOpen(false);
  };

  const handleCountrySearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCountrySearchQuery(event.target.value);
  };

  const toggleCountryDropdown = () => {
    setIsCountryDropdownOpen(!isCountryDropdownOpen);
  };

  const togglePublicationTypeDropdown = () => {
    setIsPublicationTypeDropdownOpen(!isPublicationTypeDropdownOpen);
  };

  const handleSearchClick = () => {
    onSearch({
      keyword: journalKeyword,
      country: selectedCountry,
      publicationType: selectedPublicationType,
      subjectAreas: selectedSubjectAreas,
      quartile: selectedQuartile,
      openAccessTypes: selectedOpenAccessTypes,
      publisher: selectedPublisher,
      language: selectedLanguage,
      impactFactor: selectedImpactFactor,
      hIndex: selectedHIndex,
      citeScore: selectedCiteScore,
      sjr: selectedSJR,
      overallRank: selectedOverallRank,
      issn: selectedISSN,
    });
  };

  const toggleAdvancedOptionsVisibility = () => {
    setIsAdvancedOptionsVisible(!isAdvancedOptionsVisible);
  };

  const handleSubjectAreasChange = (subjects: string[]) => {
    setSelectedSubjectAreas(subjects);
  };

  const handleQuartileChange = (quartile: string | null) => {
    setSelectedQuartile(quartile);
  };

  const handleOpenAccessTypesChange = (oaTypes: string[]) => {
    setSelectedOpenAccessTypes(oaTypes);
  };

  const handlePublisherChange = (publisher: string | null) => {
    setSelectedPublisher(publisher);
  };

  const handleLanguageChange = (language: string | null) => {
    setSelectedLanguage(language);
  };

  const handleImpactFactorChange = (impactFactor: string | null) => {
    setSelectedImpactFactor(impactFactor);
  };

  const handleHIndexChange = (hIndex: string | null) => {
    setSelectedHIndex(hIndex);
  };

  const handleCiteScoreChange = (citeScore: string | null) => {
    setSelectedCiteScore(citeScore);
  };

  const handleSJRChange = (sjr: string | null) => {
    setSelectedSJR(sjr);
  };

  const handleOverallRankChange = (overallRank: string | null) => {
    setSelectedOverallRank(overallRank);
  };

  const handleISSNChange = (issn: string | null) => {
    setSelectedISSN(issn);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
      if (publicationTypeDropdownRef.current && !publicationTypeDropdownRef.current.contains(event.target as Node)) {
        setIsPublicationTypeDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [countryDropdownRef, publicationTypeDropdownRef]);

  return (
    <div className="container mx-auto px-4 text-base">
      <div className="rounded-full shadow-md flex items-center py-8 px-4 space-x-4">
        <div className="flex items-center flex-grow">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Nhập từ khóa Tiêu đề/Tên Journal..."
            className="outline-none w-full bg-transparent"
            value={journalKeyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyPress}
          />
        </div>

        <div className="border-l border-gray-300 h-6"></div>

        <div className="relative" ref={countryDropdownRef}>
          <button className=" flex items-center space-x-2 bg-transparent  outline-none" onClick={toggleCountryDropdown}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            <span>{selectedCountry ? selectedCountry : 'Quốc gia'}</span>
          </button>

          {isCountryDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10" tabIndex={0}>
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
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
                {filteredCountries.map((country) => (
                  <button
                    key={country}
                    onClick={() => handleCountryClick(country)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 role='menuitem'"
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-l border-gray-300 h-6"></div>


        <div className="relative" ref={publicationTypeDropdownRef}>
          <button className=" flex items-center space-x-2 bg-transparent  outline-none" onClick={togglePublicationTypeDropdown}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
            <span>{selectedPublicationType ? selectedPublicationType : 'Loại Ấn Phẩm'}</span>
          </button>

          {isPublicationTypeDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10" tabIndex={0}>
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


        <Button variant="primary" size="large" rounded className="" onClick={handleSearchClick}>
          Tìm kiếm
        </Button>
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