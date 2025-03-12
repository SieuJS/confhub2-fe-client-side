"use client";

import React, { useState, useEffect, useRef } from 'react';
import Button from '../utils/Button';
import SearchAdvanceSection from './SearchAdvanceSection'; // Import the new component
import continentList from '../../../../models/data/continents-list.json'; // Import continent-list.json

interface SearchSectionProps {
  onSearch: (searchParams: {
    keyword?: string;
    startDate?: Date | null;
    endDate?: Date | null;
    location?: string | null;
    type?: 'online' | 'offline' | 'hybrid' | null;
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
  const [confKeyword, setConfKeyword] = React.useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  // Keep selectedType as string | null to be more flexible, or you can refine it based on possible 'type' values in ConferenceResponse
  const [selectedType, setSelectedType] = useState<'online' | 'offline' | 'hybrid' | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const [isAdvancedOptionsVisible, setIsAdvancedOptionsVisible] = useState(false); // State for advanced options visibility
  const [availableLocations, setAvailableLocations] = useState<string[]>([]); // State to hold locations

  const [submissionDate, setSubmissionDate] = useState<Date | null>(null);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [selectedSourceYear, setSelectedSourceYear] = useState<string | null>(null);
  const [selectedAverageScore, setSelectedAverageScore] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedFieldsOfResearch, setSelectedFieldsOfResearch] = useState<string[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);

  const availableTypes = ['online', 'offline', 'hybrid']; // Define available types

  useEffect(() => {
    // Extract countries from continentList.json
    const countriesFromContinentList: string[] = continentList.flatMap(continent => continent.countries);
    setAvailableLocations(countriesFromContinentList);
  }, []);


  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConfKeyword(event.target.value);
  };

  const filteredLocations = availableLocations.filter(location =>
    location.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  const handleSearchClick = () => {
    onSearch({
      keyword: confKeyword,
      startDate: startDate,
      endDate: endDate,
      location: selectedLocation,
      type: selectedType,
      submissionDate: submissionDate,
      publisher: selectedPublisher,
      rank: selectedRank,
      sourceYear: selectedSourceYear,
      averageScore: selectedAverageScore,
      topics: selectedTopics,
      fieldOfResearch: selectedFieldsOfResearch,
    });
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  const filteredTypes = availableTypes.filter(type =>
    type.toLowerCase().includes(typeSearchQuery.toLowerCase())
  );

  const handleLocationClick = (location: string) => {
    setSelectedLocation(location === "" ? null : location);
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
    setLocationSearchQuery("");
  };

  const handleTypeClick = (type: string) => {
    setSelectedType(type === "" ? null : type as 'online' | 'offline' | 'hybrid' | null);
  };

  const handleLocationSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocationSearchQuery(event.target.value);
  };

  const handleTypeSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTypeSearchQuery(event.target.value);
  };

  const handleStartDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value ? new Date(event.target.value) : null;
    setStartDate(date);
  };

  const handleEndDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value ? new Date(event.target.value) : null;
    setEndDate(date);
  };

  const toggleLocationDropdown = () => {
    setIsLocationDropdownOpen(!isLocationDropdownOpen);
  };

  const toggleTypeDropdown = () => {
    setIsTypeDropdownOpen(!isTypeDropdownOpen);
  };

  const toggleAdvancedOptionsVisibility = () => {
    setIsAdvancedOptionsVisible(!isAdvancedOptionsVisible);
  };


  const handleSubmissionDateChange = (date: Date | null) => {
      setSubmissionDate(date);
  };

  const handleRankChange = (rank: string | null) => {
      setSelectedRank(rank);
  };

  const handleSourceYearChange = (sourceYear: string | null) => {
      setSelectedSourceYear(sourceYear);
  };

  const handleAverageScoreChange = (averageScore: string | null) => {
      setSelectedAverageScore(averageScore);
  };

  const handleTopicsChange = (topics: string[]) => {
      setSelectedTopics(topics);
  };

  const handleFieldsOfResearchChange = (fields: string[]) => {
      setSelectedFieldsOfResearch(fields);
  };

  const handlePublisher = (publisher: string | null) => {
      setSelectedPublisher(publisher);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [locationDropdownRef, typeDropdownRef]);

  return (
    <div className="container mx-auto px-4 text-base">
      <div className="rounded-full shadow-md flex border border-black items-center py-8 px-4 space-x-4">
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
            <span>{selectedLocation ? selectedLocation : 'Location'}</span>
          </button>

          {isLocationDropdownOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="py-1 max-h-48 overflow-y-scroll" role="menu" aria-orientation="vertical" aria-labelledby="options-menu"> {/* Tailwind classes here */}
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
        onPublisherChange={handlePublisher}
        selectedPublisher={selectedPublisher}
      />
    </div>
  );
};

export default SearchSection;