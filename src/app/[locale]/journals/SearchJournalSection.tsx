// SearchJournalSection.tsx
'use client'

import React from 'react'
import Button from '../utils/Button'
import SearchAdvanceJournalSection from './SearchAdvanceJournalSection'
import useSearchJournalForm from '@/src/hooks/journals/useSearchJounalForm'
import { useTranslations } from 'next-intl'
import { Search, MapPin, BookCopy, Shapes, Ticket } from 'lucide-react' // Thêm Ticket hoặc icon phù hợp

interface SearchJournalSectionProps {
  onSearch: (searchParams: any) => void
  onClear: () => void
}

const SearchJournalSection: React.FC<SearchJournalSectionProps> = ({
  onSearch,
  onClear
}) => {
  const t = useTranslations('SearchJournal')

  const {
    // Values
    searchKeyword,
    selectedCountry,
    selectedAreas,
    selectedQuartile, // Lấy selectedQuartile từ hook
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
    quartiles, // Lấy mảng quartiles từ hook
    // Handlers
    setSearchKeyword,
    setSelectedCountry,
    setSelectedAreas,
    setSelectedQuartile, // Setter cho selectedQuartile
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
  } = useSearchJournalForm({ onSearch, onClear })

  return (
    <div className='container mx-auto px-4 text-base'>
      <div className='flex flex-wrap items-center justify-center gap-y-2 rounded-3xl border border-black px-3 py-2 shadow-md'>
        {/* Search by Title Input */}
        <div className='flex flex-grow basis-full items-center md:basis-auto'>
          <Search className='mr-1 h-5 w-5' />
          <input
            type='text'
            placeholder={t('searchByTitlePlaceholder')}
            className='w-full bg-transparent text-sm outline-none'
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyPress}
          />
        </div>

        <div className='mx-2 hidden h-6 border-l border-gray-300 md:block'></div>

        {/* Areas Dropdown */}
        <div className='relative' ref={areasDropdownRef}>
          <button
            className='flex items-center space-x-2 px-2 bg-transparent outline-none'
            onClick={toggleAreasDropdown}
          >
            <Shapes className='h-4 w-4' />
            <span className='text-sm'>{selectedAreas || t('areasLabel')}</span>
          </button>

          {isAreasDropdownOpen && (
            <div className='absolute left-0 z-10 mt-2 w-64 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
              <div className='max-h-80 overflow-y-scroll py-1'>
                <input
                  type='text'
                  placeholder={t('searchAreasPlaceholder')}
                  className='block w-full px-4 py-2 text-sm text-gray-700 focus:outline-none'
                  onChange={e => setAreasSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
                <button
                  onClick={() => {
                    setSelectedAreas(null)
                    toggleAreasDropdown()
                  }}
                  className="role='menuitem' block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {t('allAreasOption')}
                </button>
                {filteredAreas.map(area => (
                  <button
                    key={area}
                    onClick={() => {
                      setSelectedAreas(area)
                      toggleAreasDropdown()
                    }}
                    className="role='menuitem' block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='mx-2 hidden h-6 border-l border-gray-300 md:block'></div>

        {/* MỚI: Quartile Dropdown */}
        <div className='relative' ref={quartileDropdownRef}>
          <button
            className='flex items-center space-x-2 px-2 bg-transparent outline-none'
            onClick={toggleQuartileDropdown}
          >
            <Ticket className='h-4 w-4' /> {/* Sử dụng icon Ticket */}
            <span className='text-sm'>{selectedQuartile || t('quartileLabel')}</span>
          </button>

          {isQuartileDropdownOpen && (
            <div className='absolute left-0 z-10 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
              <div className='py-1'>
                <button
                  onClick={() => {
                    setSelectedQuartile(null)
                    toggleQuartileDropdown()
                  }}
                  className="role='menuitem' block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {t('allQuartilesOption')}
                </button>
                {quartiles.map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setSelectedQuartile(q)
                      toggleQuartileDropdown()
                    }}
                    className="role='menuitem' block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='mx-2 hidden h-6 border-l border-gray-300 md:block'></div>

        {/* Country Dropdown */}
        <div className='relative' ref={countryDropdownRef}>
          <button
            className='flex items-center space-x-2 px-2 bg-transparent outline-none'
            onClick={toggleCountryDropdown}
          >
            <MapPin className='h-4 w-4' />
            <span className='text-sm'>{selectedCountry || t('countryLabel')}</span>
          </button>

          {isCountryDropdownOpen && (
            <div className='absolute left-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
              <div className='max-h-80 overflow-y-scroll py-1'>
                <input
                  type='text'
                  placeholder={t('searchCountryPlaceholder')}
                  className='block w-full px-4 py-2 text-sm text-gray-700 focus:outline-none'
                  onChange={e => setCountrySearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
                <button
                  onClick={() => {
                    setSelectedCountry(null)
                    toggleCountryDropdown()
                  }}
                  className="role='menuitem' block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {t('allCountriesOption')}
                </button>
                {filteredCountries.map(location => (
                  <button
                    key={location}
                    onClick={() => {
                      setSelectedCountry(location)
                      toggleCountryDropdown()
                    }}
                    className="role='menuitem' block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search and Clear Buttons */}
        <div className='flex space-x-2 md:ml-4 md:space-x-4 md:pl-4'>
          <Button
            variant='primary'
            size='small'
            rounded
            onClick={handleSearchClick}
          >
            {t('searchButton')}
          </Button>
          <Button
            variant='secondary'
            size='small'
            rounded
            onClick={handleClear}
          >
            {t('clearButton')}
          </Button>
        </div>
      </div>

      {/* Advanced Search Section */}
      <SearchAdvanceJournalSection
        isAdvancedOptionsVisible={isAdvancedOptionsVisible}
        toggleAdvancedOptionsVisibility={toggleAdvancedOptionsVisibility}
        // Pass all values and setters
        publisher={publisher}
        onPublisherChange={setPublisher}
        region={selectedRegion}
        onRegionChange={setSelectedRegion}
        category={category}
        onCategoryChange={setCategory}
        issn={issn}
        onIssnChange={setIssn}
        topic={topic}
        onTopicChange={setTopic}
        hIndex={hIndex}
        onHIndexChange={setHIndex}
      />
    </div>
  )
}

export default SearchJournalSection