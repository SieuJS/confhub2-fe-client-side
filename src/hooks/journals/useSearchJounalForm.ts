// src/hooks/journals/useSearchJournalForm.ts
import { useState, useEffect, useRef } from 'react'
import countryData from '@/src/app/[locale]/addconference/countries_en.json'

const allCountries = countryData.map((country: { name: string }) => country.name)

interface SearchParams {
  search?: string
  country?: string | null
  areas?: string | null
  publisher?: string | null
  region?: string | null
  type?: string | null
  quartile?: string | null // Giữ nguyên, vì nó là một tham số tìm kiếm hợp lệ
  category?: string | null
  issn?: string | null
  topic?: string | null
  hIndex?: string | null
}

interface UseSearchJournalFormProps {
  onSearch: (searchParams: SearchParams) => void
  onClear: () => void
}

const useSearchJournalForm = ({
  onSearch,
  onClear
}: UseSearchJournalFormProps) => {
  // --- State chính ---
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedAreas, setSelectedAreas] = useState<string | null>(null)
  const [selectedQuartile, setSelectedQuartile] = useState<string | null>(null) // Đổi tên từ 'quartile' thành 'selectedQuartile' để tránh nhầm lẫn với props

  // --- State cho tìm kiếm nâng cao ---
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [publisher, setPublisher] = useState<string>('')
  const [type, setType] = useState<string>('')
  // const [quartile, setQuartile] = useState<string | null>(null) // Đã di chuyển lên state chính
  const [category, setCategory] = useState<string>('')
  const [issn, setIssn] = useState<string>('')
  const [topic, setTopic] = useState<string>('')
  const [hIndex, setHIndex] = useState<string>('')

  // --- State cho UI ---
  const [isAdvancedOptionsVisible, setAdvancedOptionsVisible] = useState(false)

  // Country Dropdown State
  const [isCountryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const countryDropdownRef = useRef<HTMLDivElement>(null)

  // Areas Dropdown State
  const [isAreasDropdownOpen, setAreasDropdownOpen] = useState(false)
  const [areasSearch, setAreasSearch] = useState('') // Để tìm kiếm trong Areas
  const areasDropdownRef = useRef<HTMLDivElement>(null) // Ref cho Areas dropdown

  // MỚI: Quartile Dropdown State
  const [isQuartileDropdownOpen, setQuartileDropdownOpen] = useState(false)
  const quartileDropdownRef = useRef<HTMLDivElement>(null)
  const quartiles = ['Q1', 'Q2', 'Q3', 'Q4'] // Dữ liệu cứng cho Quartile

  // Lọc quốc gia
  const filteredCountries = countrySearch
    ? allCountries.filter(c =>
        c.toLowerCase().includes(countrySearch.toLowerCase())
      )
    : allCountries

  // Lọc Areas (không thay đổi)
  const subjectAreaNames: string[] = [
    'Agricultural and Biological Sciences',
    'Arts and Humanities',
    'Biochemistry, Genetics and Molecular Biology',
    'Business, Management and Accounting',
    'Chemical Engineering',
    'Chemistry',
    'Computer Science',
    'Decision Sciences',
    'Dentistry',
    'Earth and Planetary Sciences',
    'Economics, Econometrics and Finance',
    'Energy',
    'Engineering',
    'Environmental Science',
    'Health Professions',
    'Immunology and Microbiology',
    'Materials Science',
    'Mathematics',
    'Medicine',
    'Multidisciplinary',
    'Neuroscience',
    'Nursing',
    'Pharmacology, Toxicology and Pharmaceutics',
    'Physics and Astronomy',
    'Psychology',
    'Social Sciences',
    'Veterinary'
  ];

  const filteredAreas = areasSearch
    ? subjectAreaNames.filter(area =>
        area.toLowerCase().includes(areasSearch.toLowerCase())
      )
    : subjectAreaNames;


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Logic cho Country dropdown
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryDropdownOpen(false)
      }
      // Logic cho Areas dropdown
      if (
        areasDropdownRef.current &&
        !areasDropdownRef.current.contains(event.target as Node)
      ) {
        setAreasDropdownOpen(false)
      }
      // MỚI: Logic cho Quartile dropdown
      if (
        quartileDropdownRef.current &&
        !quartileDropdownRef.current.contains(event.target as Node)
      ) {
        setQuartileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // --- Handlers ---
  const toggleCountryDropdown = () => setCountryDropdownOpen(!isCountryDropdownOpen);
  const toggleAreasDropdown = () => setAreasDropdownOpen(!isAreasDropdownOpen);
  // MỚI: Handler cho Quartile dropdown
  const toggleQuartileDropdown = () => setQuartileDropdownOpen(!isQuartileDropdownOpen);


  const handleSearchClick = () => {
    onSearch({
      search: searchKeyword,
      country: selectedCountry,
      areas: selectedAreas,
      quartile: selectedQuartile, // Truyền selectedQuartile vào search params
      region: selectedRegion,
      publisher: publisher,
      type: type,
      category: category,
      issn: issn,
      topic: topic,
      hIndex: hIndex
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick()
    }
  }

  const handleClear = () => {
    setSearchKeyword('')
    setSelectedCountry(null)
    setSelectedAreas(null)
    setSelectedQuartile(null) // Reset Quartile
    setSelectedRegion(null)
    setPublisher('')
    setType('')
    setCategory('')
    setIssn('')
    setTopic('')
    setHIndex('')
    onClear()
  }

  const toggleAdvancedOptionsVisibility = () => {
    setAdvancedOptionsVisible(!isAdvancedOptionsVisible)
  }

  return {
    // Values
    searchKeyword,
    selectedCountry,
    selectedAreas,
    selectedQuartile, // Trả về selectedQuartile
    selectedRegion,
    publisher,
    type,
    category,
    issn,
    topic,
    hIndex,
    // UI State
    countryDropdownRef,
    isCountryDropdownOpen,
    filteredCountries,
    isAdvancedOptionsVisible,
    // Areas Dropdown UI State
    areasDropdownRef,
    isAreasDropdownOpen,
    filteredAreas,
    // MỚI: Quartile Dropdown UI State
    quartileDropdownRef,
    isQuartileDropdownOpen,
    quartiles, // Trả về mảng quartiles
    // Handlers
    setSearchKeyword,
    setSelectedCountry,
    setSelectedAreas,
    setSelectedQuartile, // Trả về setter cho selectedQuartile
    setSelectedRegion,
    setPublisher,
    setType,
    setCategory,
    setIssn,
    setTopic,
    setHIndex,
    setCountrySearch,
    toggleCountryDropdown,
    // Areas Dropdown Handlers
    setAreasSearch,
    toggleAreasDropdown,
    // MỚI: Quartile Dropdown Handlers
    toggleQuartileDropdown,
    handleSearchClick,
    handleKeyPress,
    toggleAdvancedOptionsVisibility,
    handleClear
  }
}

export default useSearchJournalForm