// src/hooks/conferences/useSearchForm.ts
import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from 'react';
import { useSearchParams } from 'next/navigation';
// Thay thế import này
// import continentList from '../../models/data/locations-list.json';
// Bổ sung import mới cho country_en.json
import countryData from '@/src/app/[locale]/addconference/countries_en.json'; // Đảm bảo đường dẫn chính xác

// --- Type Definitions ---
type SearchFieldType = 'keyword' | 'title' | 'acronym';
type ConferenceType = 'Online' | 'Offline' | 'Hybrid';
const AVAILABLE_TYPES: ReadonlyArray<ConferenceType> = ['Online', 'Offline', 'Hybrid'];

interface SearchParams {
  keyword?: string;
  title?: string;
  acronym?: string;
  fromDate?: Date | null;
  toDate?: Date | null;
  location?: string | null;
  type?: ConferenceType | null;
  subFromDate?: Date | null;
  subToDate?: Date | null;
  publisher?: string | null;
  rank?: string | null;
  source?: string | null;
  averageScore?: string | null;
  topics?: string[];
  fieldOfResearch?: string[];
}

interface UseSearchFormProps {
  onSearch: (searchParams: SearchParams) => void;
  onClear?: () => void;
}

// --- Helper Functions for Initialization ---

// Generic helper for single string parameters
const getInitialStringParam = (
    searchParams: URLSearchParams,
    paramName: string
): string | null => {
    return searchParams.get(paramName);
};

// Generic helper for array parameters (like topics)
const getInitialArrayParam = (
    searchParams: URLSearchParams,
    paramName: string
): string[] => {
    return searchParams.getAll(paramName) || [];
}

const getInitialLocationFromUrl = (
  searchParams: URLSearchParams,
  availableLocations: string[]
): string | null => {
  const countryParam = searchParams.get('country');
  if (!countryParam) return null;
  return availableLocations.find(
    (loc) => loc.toLowerCase() === countryParam.toLowerCase()
  ) || null;
};

const getInitialTypeFromUrl = (
  searchParams: URLSearchParams,
  availableTypes: ReadonlyArray<ConferenceType>
): ConferenceType | null => {
    const typeParam = searchParams.get('type');
    if (!typeParam) return null;
    const foundType = availableTypes.find(
        (t) => t.toLowerCase() === typeParam.toLowerCase()
    );
    return foundType ? (foundType as ConferenceType) : null;
};

const getInitialSearchConfig = (
    searchParams: URLSearchParams
): { type: SearchFieldType; value: string } => {
    const title = searchParams.get('title');
    if (title !== null) return { type: 'title', value: title };
    const acronym = searchParams.get('acronym');
    if (acronym !== null) return { type: 'acronym', value: acronym };
    const keyword = searchParams.get('keyword');
    if (keyword !== null) return { type: 'keyword', value: keyword };
    return { type: 'keyword', value: '' };
};

const getInitialDateFromUrl = (
    searchParams: URLSearchParams,
    paramName: string
): Date | null => {
    const dateString = searchParams.get(paramName);
    if (dateString && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        try {
            const timestamp = Date.parse(dateString);
            if (!isNaN(timestamp)) return new Date(timestamp);
        } catch (e) {
             // console.error(`Error parsing date parameter "${paramName}":`, e);
        }
    }
    return null;
};

// Helper to check if any advanced params exist to auto-show the section
const shouldShowAdvancedOptionsInitially = (searchParams: URLSearchParams): boolean => {
    const advancedParams = ['submissionDate', 'publisher', 'rank', 'source', 'averageScore', 'topics', 'fieldOfResearch', 'subFromDate', 'subToDate'];
    return advancedParams.some(param => searchParams.has(param));
};

const dbUrl = process.env.NEXT_PUBLIC_DATABASE_URL;
// --- Custom Hook ---
const useSearchForm = ({ onSearch, onClear }: UseSearchFormProps) => {
  // --- State Initialization ---
  const searchParams = new URLSearchParams(useSearchParams().toString());

  // Thay đổi cách lấy danh sách quốc gia từ cấu trúc mới của country_en.json
  const countriesList: string[] = countryData.map((country: { name: string }) => country.name);
  const [availableLocations] = useState<string[]>(countriesList);

  // Initialize Basic Fields
  const initialSearchConfig = getInitialSearchConfig(searchParams);
  const initialLocation = getInitialLocationFromUrl(searchParams, availableLocations);
  const initialType = getInitialTypeFromUrl(searchParams, AVAILABLE_TYPES);
  const initialFromDate = getInitialDateFromUrl(searchParams, 'fromDate');
  const initialToDate = getInitialDateFromUrl(searchParams, 'toDate');

  // Initialize Advanced Fields
  const initialPublisher = getInitialStringParam(searchParams, 'publisher');
  const initialRank = getInitialStringParam(searchParams, 'rank');
  const initialSource = getInitialStringParam(searchParams, 'source');
  const initialAverageScore = getInitialStringParam(searchParams, 'averageScore');
  const initialTopics = getInitialArrayParam(searchParams, 'topics');
  const initialFieldsOfResearch = getInitialArrayParam(searchParams, 'fieldOfResearch');
  const initialShowAdvanced = shouldShowAdvancedOptionsInitially(searchParams);
  const initialsubFromDate =  getInitialDateFromUrl(searchParams, 'subFromDate');
  const initialsubToDate =  getInitialDateFromUrl(searchParams, 'subToDate');

  // --- State Variables ---
  // Basic
  const [selectSearchType, setSelectSearchType] = useState<SearchFieldType>(initialSearchConfig.type);
  const [confKeyword, setConfKeyword] = useState<string>(initialSearchConfig.value);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(initialLocation);
  const [selectedType, setSelectedType] = useState<ConferenceType | null>(initialType);
  const [fromDate, setStartDate] = useState<Date | null>(initialFromDate);
  const [toDate, setEndDate] = useState<Date | null>(initialToDate);
  const [isSearchTypeDropdownOpen, setIsSearchTypeDropdownOpen] = useState(false);
  const searchTypeDropdownRef = useRef<HTMLDivElement>(null);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [typeSearchQuery, setTypeSearchQuery] = useState('');
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Advanced
  const [isAdvancedOptionsVisible, setIsAdvancedOptionsVisible] = useState<boolean>(initialShowAdvanced);
  const [subFromDate, setsubFromDate] = useState<Date | null>(initialsubFromDate);
  const [subToDate, setsubToDate] = useState<Date | null>(initialsubToDate);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(initialPublisher);
  const [selectedRank, setSelectedRank] = useState<string | null>(initialRank);
  const [selectedSource, setSelectedSource] = useState<string | null>(initialSource);
  const [selectedAverageScore, setSelectedAverageScore] = useState<string | null>(initialAverageScore);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(initialTopics);
  const [selectedFieldsOfResearch, setSelectedFieldsOfResearch] = useState<string[]>(initialFieldsOfResearch);

  // --- Effects ---
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Handlers ---

  // Basic Handlers
  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => { setConfKeyword(event.target.value); };
  const handleSearchTypeChange = (type: SearchFieldType) => { setSelectSearchType(type); setIsSearchTypeDropdownOpen(false); };
  const toggleSearchTypeDropdown = () => { setIsSearchTypeDropdownOpen(!isSearchTypeDropdownOpen); };
  const handleLocationClick = (location: string) => { setSelectedLocation(location === '' ? null : location); setIsLocationDropdownOpen(false); setLocationSearchQuery(''); };
  const handleTypeClick = (type: string) => { const newType = type === "" ? null : type as ConferenceType | null; setSelectedType(newType); setIsTypeDropdownOpen(false); setTypeSearchQuery(''); };
  const handleLocationSearchChange = (event: ChangeEvent<HTMLInputElement>) => { setLocationSearchQuery(event.target.value); setIsLocationDropdownOpen(true); };
  const handleTypeSearchChange = (event: ChangeEvent<HTMLInputElement>) => { setTypeSearchQuery(event.target.value); setIsTypeDropdownOpen(true); };
  const handleStartDateInputChange = (event: ChangeEvent<HTMLInputElement>) => { const dateValue = event.target.value; setStartDate(dateValue ? new Date(dateValue) : null); };
  const handleEndDateInputChange = (event: ChangeEvent<HTMLInputElement>) => { const dateValue = event.target.value; setEndDate(dateValue ? new Date(dateValue) : null); };
  const toggleLocationDropdown = () => { setIsLocationDropdownOpen(!isLocationDropdownOpen); };
  const toggleTypeDropdown = () => { setIsTypeDropdownOpen(!isTypeDropdownOpen); };

  // Advanced Handlers
  const toggleAdvancedOptionsVisibility = () => { setIsAdvancedOptionsVisible(!isAdvancedOptionsVisible); };
  const handleSubmissionDateRangeChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setsubFromDate(start);
    setsubToDate(end);
};
  const handlePublisherChange = (publisher: string | null) => { setSelectedPublisher(publisher); };
  const handleRankChange = (rank: string | null) => { setSelectedRank(rank); };
  const handleSourceChange = (source: string | null) => { setSelectedSource(source); };
  const handleAverageScoreChange = (averageScore: string | null) => { setSelectedAverageScore(averageScore); };
  const handleTopicsChange = (topics: string[]) => { setSelectedTopics(topics); };
  const handleFieldsOfResearchChange = (fields: string[]) => { setSelectedFieldsOfResearch(fields); };

  // Combined Search/Clear
  const handleSearchClick = () => {
    const searchParamsData: SearchParams = {
      fromDate,
      toDate,
      location: selectedLocation,
      type: selectedType,
      subFromDate: subFromDate,
      subToDate: subToDate,
      publisher: selectedPublisher,
      rank: selectedRank,
      source: selectedSource,
      averageScore: selectedAverageScore,
      topics: selectedTopics && selectedTopics.length > 0 ? selectedTopics : undefined,
      fieldOfResearch: selectedFieldsOfResearch && selectedFieldsOfResearch.length > 0 ? selectedFieldsOfResearch : undefined,
    };

    if (confKeyword) {
        searchParamsData[selectSearchType] = confKeyword;
    }

    onSearch(searchParamsData);
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleClear = () => {
    // Reset Basic state
    setSelectSearchType('keyword');
    setConfKeyword('');
    setSelectedLocation(null);
    setSelectedType(null);
    setStartDate(null);
    setEndDate(null);
    setLocationSearchQuery('');
    setTypeSearchQuery('');

    // Reset Advanced state
    setsubFromDate(null);
    setsubToDate(null);
    setSelectedPublisher(null);
    setSelectedRank(null);
    setSelectedSource(null);
    setSelectedAverageScore(null);
    setSelectedTopics([]);
    setSelectedFieldsOfResearch([]);

    if (onClear) {
      onClear();
    }
  };

  // Filtering Logic
  const filteredLocations = availableLocations.filter((location) =>
    location.toLowerCase().includes(locationSearchQuery.toLowerCase())
  );
  const filteredTypes = AVAILABLE_TYPES.filter((type) =>
    type.toLowerCase().includes(typeSearchQuery.toLowerCase())
  );

  // --- Return Values ---
  return {
    // Basic Search State & Handlers
    confKeyword,
    selectSearchType,
    selectedLocation,
    selectedType,
    fromDate,
    toDate,
    isSearchTypeDropdownOpen,
    searchTypeDropdownRef,
    locationSearchQuery,
    typeSearchQuery,
    isLocationDropdownOpen,
    isTypeDropdownOpen,
    locationDropdownRef,
    typeDropdownRef,
    availableLocations,
    availableTypes: AVAILABLE_TYPES,
    filteredLocations,
    filteredTypes,
    handleKeywordChange,
    handleSearchTypeChange,
    toggleSearchTypeDropdown,
    handleLocationClick,
    handleTypeClick,
    handleLocationSearchChange,
    handleTypeSearchChange,
    handleStartDateInputChange,
    handleEndDateInputChange,
    toggleLocationDropdown,
    toggleTypeDropdown,
    handleKeyPress,

    // Advanced Search State & Handlers
    isAdvancedOptionsVisible,
    subFromDate,
    subToDate,
    selectedPublisher,
    selectedRank,
    selectedSource,
    selectedAverageScore,
    selectedTopics,
    selectedFieldsOfResearch,
    toggleAdvancedOptionsVisibility,
    handleSubmissionDateRangeChange,
    handlePublisherChange,
    handleRankChange,
    handleSourceChange,
    handleAverageScoreChange,
    handleTopicsChange,
    handleFieldsOfResearchChange,

    // General Actions
    handleSearchClick,
    handleClear,
  };
};

export default useSearchForm;