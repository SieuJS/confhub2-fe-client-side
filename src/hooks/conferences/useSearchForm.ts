// src/hooks/conferences/useSearchForm.ts

import { useState, ChangeEvent, KeyboardEvent } from 'react';
import countryData from '@/src/app/[locale]/addconference/countries_en.json';
import { useSearchFormInitialization } from './search/useSearchFormInitialization';
import { useDropdown } from './search/useDropdown';
import {
  SearchParams,
  SearchFieldType,
  ConferenceType,
  AVAILABLE_TYPES,
  adjustToUTCMidnight,
} from './search/searchForm.utils';

interface UseSearchFormProps {
  onSearch: (searchParams: SearchParams) => void;
  onClear?: () => void;
}

// --- ADD 1: Define the default match score range ---
const DEFAULT_MATCH_SCORE_RANGE = [0, 100];


const useSearchForm = ({ onSearch, onClear }: UseSearchFormProps) => {
  const [availableLocations] = useState<string[]>(() => countryData.map(c => c.name));

  // --- Initialization ---
  const { initialState } = useSearchFormInitialization({
    availableLocations,
    availableTypes: AVAILABLE_TYPES,
  });

  // --- State Variables ---
  // Basic
  const [selectSearchType, setSelectSearchType] = useState<SearchFieldType>(initialState.selectSearchType);
  const [confKeyword, setConfKeyword] = useState<string>(initialState.confKeyword);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(initialState.selectedLocation);
  const [selectedType, setSelectedType] = useState<ConferenceType | null>(initialState.selectedType);
  const [fromDate, setStartDate] = useState<Date | null>(initialState.fromDate);
  const [toDate, setEndDate] = useState<Date | null>(initialState.toDate);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [typeSearchQuery, setTypeSearchQuery] = useState('');

  // Dropdown UI State (using the new generic hook)
  const { ref: searchTypeDropdownRef, isOpen: isSearchTypeDropdownOpen, toggle: toggleSearchTypeDropdown, close: closeSearchTypeDropdown } = useDropdown();
  const { ref: locationDropdownRef, isOpen: isLocationDropdownOpen, toggle: toggleLocationDropdown, close: closeLocationDropdown } = useDropdown();
  const { ref: typeDropdownRef, isOpen: isTypeDropdownOpen, toggle: toggleTypeDropdown, close: closeTypeDropdown } = useDropdown();

  // Advanced
  const [isAdvancedOptionsVisible, setIsAdvancedOptionsVisible] = useState<boolean>(initialState.isAdvancedOptionsVisible);
  const [subFromDate, setsubFromDate] = useState<Date | null>(initialState.subFromDate);
  const [subToDate, setsubToDate] = useState<Date | null>(initialState.subToDate);
  const [selectedRank, setSelectedRank] = useState<string | null>(initialState.selectedRank);
  const [selectedSource, setSelectedSource] = useState<string | null>(initialState.selectedSource);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(initialState.selectedPublisher);
  const [selectedAverageScore, setSelectedAverageScore] = useState<string | null>(initialState.selectedAverageScore);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialState.selectedTopics);
  const [selectedFieldsOfResearch, setSelectedFieldsOfResearch] = useState<string[]>(initialState.selectedFieldsOfResearch);
  // --- ADD 2: Add state for the match score range ---
  const [matchScoreRange, setMatchScoreRange] = useState<number[]>(DEFAULT_MATCH_SCORE_RANGE);

  // --- Handlers ---
  // Basic Handlers
  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => setConfKeyword(event.target.value);
  const handleSearchTypeChange = (type: SearchFieldType) => { setSelectSearchType(type); closeSearchTypeDropdown(); };
  const handleLocationClick = (location: string) => { setSelectedLocation(location === '' ? null : location); closeLocationDropdown(); setLocationSearchQuery(''); };
  const handleTypeClick = (type: string) => { setSelectedType(type === "" ? null : type as ConferenceType | null); closeTypeDropdown(); setTypeSearchQuery(''); };
  const handleLocationSearchChange = (event: ChangeEvent<HTMLInputElement>) => { setLocationSearchQuery(event.target.value); if (!isLocationDropdownOpen) toggleLocationDropdown(); };
  const handleTypeSearchChange = (event: ChangeEvent<HTMLInputElement>) => { setTypeSearchQuery(event.target.value); if (!isTypeDropdownOpen) toggleTypeDropdown(); };
  const handleStartDateInputChange = (event: ChangeEvent<HTMLInputElement>) => setStartDate(event.target.value ? new Date(event.target.value) : null);
  const handleEndDateInputChange = (event: ChangeEvent<HTMLInputElement>) => setEndDate(event.target.value ? new Date(event.target.value) : null);

  // Advanced Handlers
  const toggleAdvancedOptionsVisibility = () => setIsAdvancedOptionsVisible(prev => !prev);
  const handleSubmissionDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setsubFromDate(adjustToUTCMidnight(start));
    setsubToDate(adjustToUTCMidnight(end));
  };
  const handleRankChange = (rank: string | null) => setSelectedRank(rank);
  const handleSourceChange = (source: string | null) => setSelectedSource(source);
  const handlePublisherChange = (publisher: string | null) => setSelectedPublisher(publisher);
  const handleAverageScoreChange = (score: string | null) => setSelectedAverageScore(score);
  const handleTopicsChange = (topics: string[]) => setSelectedTopics(topics);
  const handleFieldsOfResearchChange = (fields: string[]) => setSelectedFieldsOfResearch(fields);
  // --- ADD 3: Add a handler for the match score slider ---
  const handleMatchScoreChange = (newRange: number[]) => {
    setMatchScoreRange(newRange);
  };

  // Combined Search/Clear
  const handleSearchClick = () => {
    const searchParamsData: SearchParams = {
      fromDate, toDate, location: selectedLocation, type: selectedType, subFromDate, subToDate,
      rank: selectedRank, source: selectedSource, publisher: selectedPublisher, averageScore: selectedAverageScore,
      topics: selectedTopics?.length > 0 ? selectedTopics : undefined,
      fieldOfResearch: selectedFieldsOfResearch?.length > 0 ? selectedFieldsOfResearch : undefined,
      // --- ADD 4: Add match score range to the search payload ---
      // Only add it if it's not the default full range.
      matchScoreRange: (matchScoreRange[0] === 0 && matchScoreRange[1] === 100) ? undefined : matchScoreRange,
    };
    if (confKeyword) {
      searchParamsData[selectSearchType] = confKeyword;
    }
    onSearch(searchParamsData);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') handleSearchClick();
  };

  const handleClear = () => {
    setSelectSearchType('keyword');
    setConfKeyword('');
    setSelectedLocation(null);
    setSelectedType(null);
    setStartDate(null);
    setEndDate(null);
    setLocationSearchQuery('');
    setTypeSearchQuery('');
    setsubFromDate(null);
    setsubToDate(null);
    setSelectedRank(null);
    setSelectedSource(null);
    setSelectedPublisher(null);
    setSelectedAverageScore(null);
    setSelectedTopics([]);
    setSelectedFieldsOfResearch([]);
    // --- ADD 5: Reset the match score range on clear ---
    setMatchScoreRange(DEFAULT_MATCH_SCORE_RANGE);

    if (onClear) {
      onClear();
    }
  };


  // Filtering Logic (Derived State)
  const filteredLocations = availableLocations.filter(loc => loc.toLowerCase().includes(locationSearchQuery.toLowerCase()));
  const filteredTypes = AVAILABLE_TYPES.filter(type => type.toLowerCase().includes(typeSearchQuery.toLowerCase()));

  // --- Return Values (Identical to original) ---
  return {
    confKeyword, selectSearchType, selectedLocation, selectedType, fromDate, toDate,
    isSearchTypeDropdownOpen, searchTypeDropdownRef, locationSearchQuery, typeSearchQuery,
    isLocationDropdownOpen, isTypeDropdownOpen, locationDropdownRef, typeDropdownRef,
    availableLocations, availableTypes: AVAILABLE_TYPES, filteredLocations, filteredTypes,
    handleKeywordChange, handleSearchTypeChange, toggleSearchTypeDropdown, handleLocationClick,
    handleTypeClick, handleLocationSearchChange, handleTypeSearchChange, handleStartDateInputChange,
    handleEndDateInputChange, toggleLocationDropdown, toggleTypeDropdown, handleKeyPress,
    isAdvancedOptionsVisible, subFromDate, subToDate, selectedRank, selectedSource,
    selectedPublisher, selectedAverageScore, selectedTopics, selectedFieldsOfResearch,
    toggleAdvancedOptionsVisibility, handleSubmissionDateRangeChange, handleRankChange,

    handleSourceChange, handlePublisherChange, handleAverageScoreChange, handleTopicsChange,
    handleFieldsOfResearchChange, // --- ADD 6: Return the new state and handler ---
    matchScoreRange,
    handleMatchScoreChange, 
    handleSearchClick, handleClear,
  };
};

export default useSearchForm;