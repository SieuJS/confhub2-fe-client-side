// src/hooks/useSearchForm.ts
// No changes are needed in useSearchForm.  It ALREADY clears all the fields.
import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import continentList from '../../models/data/locations-list.json'; // Adjust path as necessary

interface SearchParams {
  keyword?: string;
  title?: string;
  acronym?: string;
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
}

interface UseSearchFormProps {
  onSearch: (searchParams: SearchParams) => void;
  onClear?: () => void; // Add onClear prop
}

const useSearchForm = ({ onSearch, onClear }: UseSearchFormProps) => {
  const [confKeyword, setConfKeyword] = useState<string>('');
  const [selectSearchType, setSelectSearchType] = useState<'keyword' | 'title' | 'acronym'>('keyword'); // Thêm state cho kiểu tìm kiếm
  const [isSearchTypeDropdownOpen, setIsSearchTypeDropdownOpen] = useState(false);
  const searchTypeDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'Online' | 'Offline' | 'Hybrid' | null>(null);
  const [fromDate, setStartDate] = useState<Date | null>(null);
  const [toDate, setEndDate] = useState<Date | null>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const [isAdvancedOptionsVisible, setIsAdvancedOptionsVisible] = useState(false);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  const [submissionDate, setSubmissionDate] = useState<Date | null>(null);
  const [selectedRank, setSelectedRank] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [selectedAverageScore, setSelectedAverageScore] = useState<string | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedFieldsOfResearch, setSelectedFieldsOfResearch] = useState<string[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);

  const availableTypes = ['Online', 'Offline', 'Hybrid'];

  // Load locations
  useEffect(() => {
    const countriesFromContinentList: string[] = continentList.flatMap(continent => continent.countries);
    setAvailableLocations(countriesFromContinentList);
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
      if (searchTypeDropdownRef.current && !searchTypeDropdownRef.current.contains(event.target as Node)) {
        setIsSearchTypeDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [locationDropdownRef, typeDropdownRef, searchTypeDropdownRef]);

  const handleSearchTypeChange = (type: 'keyword' | 'title' | 'acronym') => {
    setSelectSearchType(type);
    setIsSearchTypeDropdownOpen(false); // Close dropdown after selection
  };
    
  const toggleSearchTypeDropdown = () => {
    setIsSearchTypeDropdownOpen(!isSearchTypeDropdownOpen);
  };
  
  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfKeyword(event.target.value);
  };

  const filteredLocations = availableLocations.filter(location =>
    location.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  const handleSearchClick = () => {
    const searchParams: SearchParams = {
      fromDate,
      toDate,
      location: selectedLocation,
      type: selectedType,
      submissionDate,
      publisher: selectedPublisher,
      rank: selectedRank,
      source: selectedSource,
      averageScore: selectedAverageScore,
      topics: selectedTopics,
      fieldOfResearch: selectedFieldsOfResearch,
    };

    // Thêm param dựa trên searchType
    if (selectSearchType === 'keyword') {
      searchParams.keyword = confKeyword;
    } else if (selectSearchType === 'title') {
      searchParams.title = confKeyword;
    } else if (selectSearchType === 'acronym') {
      searchParams.acronym = confKeyword;
    }

    onSearch(searchParams);
  };


  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  const filteredTypes = availableTypes.filter(type =>
    type.toLowerCase().includes(typeSearchQuery.toLowerCase())
  );

  const handleLocationClick = (location: string) => {
    setSelectedLocation(location === "" ? null : location);
    setIsLocationDropdownOpen(false); // Close dropdown on selection
    setLocationSearchQuery(""); // Clear search query
  };

  const handleTypeClick = (type: string) => {
    setSelectedType(type === "" ? null : type as 'Online' | 'Offline' | 'Hybrid' | null);
    setIsTypeDropdownOpen(false); // Close dropdown on selection
    setTypeSearchQuery('');     //optional
  };

  const handleLocationSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocationSearchQuery(event.target.value);
    setIsLocationDropdownOpen(true); // Keep dropdown open while searching
  };

  const handleTypeSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTypeSearchQuery(event.target.value);
    setIsTypeDropdownOpen(true);    //optional
  };

  const handleStartDateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value ? new Date(event.target.value) : null;
    setStartDate(date);
  };

  const handleEndDateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleSourceChange = (source: string | null) => {
    setSelectedSource(source);
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

  const handlePublisherChange = (publisher: string | null) => {
    setSelectedPublisher(publisher);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    setConfKeyword('');
    setSelectSearchType('keyword');
    setSelectedLocation(null);
    setSelectedType(null);
    setStartDate(null);
    setEndDate(null);
    setLocationSearchQuery('');
    setTypeSearchQuery('');
    setSubmissionDate(null);
    setSelectedRank(null);
    setSelectedSource(null);
    setSelectedAverageScore(null);
    setSelectedTopics([]);
    setSelectedFieldsOfResearch([]);
    setSelectedPublisher(null);
  };


  return {
    confKeyword,
    selectSearchType,
    isSearchTypeDropdownOpen,
    searchTypeDropdownRef,
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
    availableLocations,
    submissionDate,
    selectedRank,
    selectedSource,
    selectedAverageScore,
    selectedTopics,
    selectedFieldsOfResearch,
    selectedPublisher,
    availableTypes,
    filteredLocations,
    filteredTypes,
    handleKeywordChange,
    handleSearchTypeChange,
    toggleSearchTypeDropdown,
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
    handleRankChange,
    handleSourceChange,
    handleAverageScoreChange,
    handleTopicsChange,
    handleFieldsOfResearchChange,
    handlePublisherChange,
    handleClear, // Return handleClear
  };
};

export default useSearchForm;