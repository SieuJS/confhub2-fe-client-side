// src/hooks/journals/useSearchJournalForm.ts
import { useState, useEffect, useRef, useCallback } from 'react'
import locationData from '@/src/models/data/locations-list.json'; // Import JSON

// Tạo một danh sách phẳng tất cả các quốc gia
const allCountries = locationData.flatMap(region => region.countries);

interface UseSearchJournalFormProps {
  onSearch: (searchParams: {
    search?: string; // Đổi từ keyword
    country?: string | null;
    region?: string | null; // Thêm region
    publisher?: string | null; // Thêm publisher
  }) => void;
  onClear: () => void;
}

const useSearchJournalForm = ({ onSearch, onClear }: UseSearchJournalFormProps) => {
  // --- State chính ---
  const [searchKeyword, setSearchKeyword] = useState(''); // Đổi tên cho rõ nghĩa
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  
  // --- State cho tìm kiếm nâng cao ---
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null);

  // --- State cho UI ---
  const [isAdvancedOptionsVisible, setAdvancedOptionsVisible] = useState(false);
  const [isCountryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Lọc danh sách quốc gia dựa trên input tìm kiếm
  const filteredCountries = countrySearch
    ? allCountries.filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
    : allCountries;

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Handlers ---
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  const toggleCountryDropdown = () => setCountryDropdownOpen(!isCountryDropdownOpen);

  const handleCountrySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCountrySearch(e.target.value);
  };

  const handleCountryClick = (country: string | null) => {
    setSelectedCountry(country);
    setCountryDropdownOpen(false);
  };

  const handleRegionChange = (region: string | null) => {
    setSelectedRegion(region);
  };

  const handlePublisherChange = (publisher: string | null) => {
    setSelectedPublisher(publisher);
  };

  const handleSearchClick = () => {
    onSearch({
      search: searchKeyword,
      country: selectedCountry,
      region: selectedRegion,
      publisher: selectedPublisher,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleClear = () => {
    setSearchKeyword('');
    setSelectedCountry(null);
    setSelectedRegion(null);
    setSelectedPublisher(null);
    onClear(); // Gọi prop onClear để reset URL ở component cha
  };

  const toggleAdvancedOptionsVisibility = () => {
    setAdvancedOptionsVisible(!isAdvancedOptionsVisible);
  };

  return {
    searchKeyword,
    selectedCountry,
    countryDropdownRef,
    isCountryDropdownOpen,
    filteredCountries,
    isAdvancedOptionsVisible,
    selectedRegion,
    selectedPublisher,
    handleKeywordChange,
    handleCountryClick,
    handleCountrySearchChange,
    toggleCountryDropdown,
    handleRegionChange,
    handlePublisherChange,
    handleSearchClick,
    handleKeyPress,
    toggleAdvancedOptionsVisibility,
    handleClear,
  };
};

export default useSearchJournalForm;