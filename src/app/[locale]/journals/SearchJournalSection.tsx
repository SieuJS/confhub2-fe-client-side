// SearchJournalSection.tsx
'use client'

import React from 'react'
import Button from '../utils/Button'
import SearchAdvanceJournalSection from './SearchAdvanceJournalSection'
import useSearchJournalForm from '../../../hooks/journals/useSearchJounalForm'
import { useTranslations } from 'next-intl'
import { Search, MapPin } from 'lucide-react'

interface SearchJournalSectionProps {
  onSearch: (searchParams: {
    search?: string
    country?: string | null
    region?: string | null
    publisher?: string | null
  }) => void
  onClear: () => void
}

const SearchJournalSection: React.FC<SearchJournalSectionProps> = ({
  onSearch,
  onClear
}) => {
  const t = useTranslations('SearchJournal')

  const {
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
    handleClear: handleClearForm
  } = useSearchJournalForm({ onSearch, onClear })

  const handleClearClick = () => {
    handleClearForm()
  }

  return (
    <div className='container mx-auto px-4 text-base'>
      <div className='flex flex-wrap items-center justify-center space-x-4 rounded-full border border-black px-3 py-2 shadow-md'>
        {/* Search by Title Input */}
        <div className='flex flex-grow basis-full items-center md:basis-auto'>
          <Search className='mr-1 h-5 w-5' />
          <input
            type='text'
            placeholder={t('searchByTitlePlaceholder')} // Đổi key translation
            className='w-full bg-transparent text-sm outline-none'
            value={searchKeyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyPress}
          />
        </div>

        <div className='mx-2 hidden h-6 border-l border-gray-300 md:block'></div>

        {/* Country Dropdown */}
        <div className='relative' ref={countryDropdownRef}>
          <button
            className=' flex items-center space-x-2 bg-transparent  outline-none'
            onClick={toggleCountryDropdown}
          >
            <MapPin className='h-4 w-4' />
            <span className='text-sm'>
              {selectedCountry ? selectedCountry : t('countryLabel')}
            </span>
          </button>

          {isCountryDropdownOpen && (
            <div
              className='absolute left-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
              tabIndex={-1}
            >
              <div
                className='max-h-48 overflow-y-scroll py-1'
                role='menu'
                aria-orientation='vertical'
                aria-labelledby='options-menu'
              >
                <input
                  type='text'
                  placeholder={t('searchCountryPlaceholder')}
                  className='block w-full px-4 py-2 text-sm text-gray-700 focus:outline-none'
                  onChange={handleCountrySearchChange}
                  onClick={e => e.stopPropagation()}
                />
                <button
                  onClick={() => handleCountryClick(null)}
                  className="role='menuitem' block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  {t('allCountriesOption')}
                </button>
                {filteredCountries.map(location => (
                  <button
                    key={location}
                    onClick={() => handleCountryClick(location)}
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
        <div className='mt-2 flex space-x-4 md:ml-4 md:mt-0 md:space-x-4 md:pl-4'>
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
            onClick={handleClearClick}
          >
            {t('clearButton')}
          </Button>
        </div>
      </div>

      {/* Advanced Search Section */}
      <SearchAdvanceJournalSection
        isAdvancedOptionsVisible={isAdvancedOptionsVisible}
        toggleAdvancedOptionsVisibility={toggleAdvancedOptionsVisibility}
        onRegionChange={handleRegionChange}
        selectedRegion={selectedRegion}
        onPublisherChange={handlePublisherChange}
        selectedPublisher={selectedPublisher}
      />
    </div>
  )
}

export default SearchJournalSection