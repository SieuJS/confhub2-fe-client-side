// src/hooks/useSearchForm.ts
// No changes are needed in useSearchForm.  It ALREADY clears all the fields.
import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import continentList from '../../models/data/locations-list.json'; // Adjust path as necessary

interface SearchParams {
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
}

interface UseSearchFormProps {
  onSearch: (searchParams: SearchParams) => void;
  onClear?: () => void; // Add onClear prop
}

const useSearchForm = ({ onSearch, onClear }: UseSearchFormProps) => {
  const [confKeyword, setConfKeyword] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'Online' | 'Offline' | 'Hybrid' | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
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
  const [selectedSourceYear, setSelectedSourceYear] = useState<string | null>(null);
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
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [locationDropdownRef, typeDropdownRef]);

  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setConfKeyword(event.target.value);
  };

  const filteredLocations = availableLocations.filter(location =>
    location.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );

  const handleSearchClick = () => {
    onSearch({
      keyword: confKeyword,
      startDate,
      endDate,
      location: selectedLocation,
      type: selectedType,
      submissionDate,
      publisher: selectedPublisher,
      rank: selectedRank,
      sourceYear: selectedSourceYear,
      averageScore: selectedAverageScore,
      topics: selectedTopics,
      fieldOfResearch: selectedFieldsOfResearch,
    });
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

  const handlePublisherChange = (publisher: string | null) => {
    setSelectedPublisher(publisher);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
    setConfKeyword('');
    setSelectedLocation(null);
    setSelectedType(null);
    setStartDate(null);
    setEndDate(null);
    setLocationSearchQuery('');
    setTypeSearchQuery('');
    setSubmissionDate(null);
    setSelectedRank(null);
    setSelectedSourceYear(null);
    setSelectedAverageScore(null);
    setSelectedTopics([]);
    setSelectedFieldsOfResearch([]);
    setSelectedPublisher(null);
  };


  return {
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
    availableLocations,
    submissionDate,
    selectedRank,
    selectedSourceYear,
    selectedAverageScore,
    selectedTopics,
    selectedFieldsOfResearch,
    selectedPublisher,
    availableTypes,
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
    handleRankChange,
    handleSourceYearChange,
    handleAverageScoreChange,
    handleTopicsChange,
    handleFieldsOfResearchChange,
    handlePublisherChange,
    handleClear, // Return handleClear
  };
};

export default useSearchForm;