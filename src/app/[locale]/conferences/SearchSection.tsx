'use client'

import React from 'react'
import Button from '../utils/Button'
import SearchAdvanceSection from './SearchAdvanceSection'
import useSearchForm from '../../../hooks/conferences/useSearchForm'
import { useTranslations } from 'next-intl'

// Import Lucide icons
import { Search, ChevronDown, MapPin, Menu } from 'lucide-react'

interface SearchSectionProps {
  onSearch: (searchParams: {
    keyword?: string
    fromDate?: Date | null
    toDate?: Date | null
    location?: string | null
    type?: 'Online' | 'Offline' | 'Hybrid' | null
    subFromDate?: Date | null
    subToDate?: Date | null
    rank?: string | null
    source?: string | null
    // ADDED: Publisher to search params type
    publisher?: string | null
    topics?: string[]
    fieldOfResearch?: string[]
  }) => void
  onClear: () => void
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, onClear }) => {
  const t = useTranslations('')

  const {
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
    handleRankChange,
    selectedRank,
    handleSourceChange,
    selectedSource,
    handleAverageScoreChange,
    selectedAverageScore,
    handleTopicsChange,
    selectedTopics,
    handleFieldsOfResearchChange,
    selectedFieldsOfResearch,
    // ADDED: Destructure publisher state and handler
    handlePublisherChange,
    selectedPublisher,
    subFromDate,
    subToDate,
    handleSubmissionDateRangeChange,
    handleClear
  } = useSearchForm({ onSearch, onClear })

  return (
    <div className='container mx-auto px-4 text-base'>
      {/* Giữ `relative` để làm điểm neo cho dropdown trên mobile/tablet */}
      <div className='relative flex flex-wrap items-center justify-between gap-x-2 gap-y-3 rounded-3xl border border-black-pure px-2 py-2 shadow-md'>
        {/* Thay đổi breakpoint từ `md` sang `xl` để có layout tablet tốt hơn */}
        <div
          className='flex w-40 flex-grow basis-full items-center xl:max-w-[500px] xl:basis-auto'
          ref={searchTypeDropdownRef}
        >
          <Search className='mr-1 h-5 w-5' />
          <input
            type='text'
            placeholder={t('Type_a_command_or_search')}
            className='w-full bg-transparent text-sm outline-none placeholder:text-primary'
            value={confKeyword}
            onChange={handleKeywordChange}
            onKeyDown={handleKeyPress}
          />
          <div className='relative px-5'>
            <button
              className='flex items-center space-x-2 bg-transparent outline-none'
              onClick={toggleSearchTypeDropdown}
              title='Select search type'
            >
              <span className='text-sm'>
                {selectSearchType === 'keyword'
                  ? t('Keyword')
                  : selectSearchType === 'title'
                    ? t('Title')
                    : t('Acronym')}
              </span>
              <ChevronDown className='ml-1 inline-block h-4 w-4' />
            </button>
            {isSearchTypeDropdownOpen && (
              <div className='absolute left-0 z-10 mt-2 w-32 rounded-md bg-white-pure shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none '>
                <div
                  className='py-1'
                  role='menu'
                  aria-orientation='vertical'
                  aria-labelledby='options-menu'
                >
                  <button
                    onClick={() => handleSearchTypeChange('keyword')}
                    className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90'
                  >
                    {t('Keyword')}
                  </button>
                  <button
                    onClick={() => handleSearchTypeChange('title')}
                    className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90'
                  >
                    {t('Title')}
                  </button>
                  <button
                    onClick={() => handleSearchTypeChange('acronym')}
                    className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90'
                  >
                    {t('Acronym')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dấu ngăn cách chỉ hiện trên desktop lớn */}
        <div className='mx-2 hidden h-6 border-l border-gray-30 xl:block'></div>

        <div className='flex items-center space-x-2 px-2'>
          <label htmlFor='fromDate' className='text-sm'>
            {t('Start')}:
          </label>
          <input
            type='date'
            id='fromDate'
            className='w-26 rounded border bg-transparent py-0.5 text-sm'
            onChange={handleStartDateInputChange}
            value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
          />
        </div>

        <div className='flex items-center space-x-2 px-2'>
          <label htmlFor='toDate' className='text-sm'>
            {t('End')}:
          </label>
          <input
            type='date'
            id='toDate'
            className='w-26 rounded border bg-transparent py-0.5 text-sm'
            onChange={handleEndDateInputChange}
            value={toDate ? toDate.toISOString().split('T')[0] : ''}
          />
        </div>

        {/* Dấu ngăn cách chỉ hiện trên desktop lớn */}
        <div className='mx-2 hidden h-6 border-l border-gray-300 xl:block'></div>

        {/* Đổi vị trí Type lên trước Location */}
        {/* Thay đổi breakpoint từ `md` sang `xl` */}
        <div className='xl:relative' ref={typeDropdownRef}>
          <button
            className=' flex items-center space-x-2 bg-transparent outline-none'
            onClick={toggleTypeDropdown}
          >
            <Menu className='h-4 w-4' />
            <span className='text-sm'>
              {selectedType ? selectedType : t('Type')}
            </span>
          </button>

          {isTypeDropdownOpen && (
            <div
              className='absolute left-4 right-4 z-10 mt-2 rounded-md bg-white-pure shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none xl:left-0 xl:right-auto xl:w-28'
              tabIndex={0}
            >
              <div
                className='py-1'
                role='menu'
                aria-orientation='vertical'
                aria-labelledby='options-menu'
              >
                <button
                  key='all'
                  onClick={() => handleTypeClick('')}
                  className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90'
                >
                  {t('All_Types')}
                </button>
                {filteredTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => handleTypeClick(type)}
                    className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90'
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dấu ngăn cách chỉ hiện trên desktop lớn */}
        <div className='mx-2 hidden h-6 border-l border-gray-300 xl:block'></div>

        {/* Thay đổi breakpoint từ `md` sang `xl` */}
        <div className='xl:relative' ref={locationDropdownRef}>
          <button
            className='flex items-center space-x-2 bg-transparent outline-none'
            onClick={toggleLocationDropdown}
          >
            <MapPin className='h-4 w-4' />
            <span className='text-sm'>
              {selectedLocation ? selectedLocation : t('Location')}
            </span>
          </button>

          {isLocationDropdownOpen && (
            <div className='absolute left-4 right-4 z-10 mt-2 rounded-md bg-white-pure shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none xl:left-0 xl:right-auto xl:w-48'>
              <div
                className='max-h-80 overflow-y-scroll py-1'
                role='menu'
                aria-orientation='vertical'
                aria-labelledby='options-menu'
              >
                <input
                  type='text'
                  placeholder={t('Search_location')}
                  className='block w-full bg-white-pure px-4 py-2 text-sm placeholder:text-primary focus:outline-none'
                  onChange={handleLocationSearchChange}
                  onClick={e => e.stopPropagation()}
                />
                <button
                  key='all'
                  onClick={() => handleLocationClick('')}
                  className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90'
                >
                  {t('All_Locations')}
                </button>
                {[...new Set(filteredLocations)].map(location => (
                  <button
                    key={location}
                    onClick={() => handleLocationClick(location)}
                    className='block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90'
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Thay đổi breakpoint từ `md` sang `xl` và dùng ml-auto để đẩy sang phải */}
        <div className='flex w-full basis-full justify-end space-x-4 xl:ml-auto xl:w-auto xl:basis-auto xl:pl-4'>
          <Button
            variant='primary'
            size='small'
            rounded
            className=''
            onClick={() => {
              handleSearchClick();
            }}
          >
            {t('Search')}
          </Button>
          <Button
            variant='secondary'
            size='small'
            rounded
            className=''
            onClick={handleClear}
          >
            {t('Clear')}
          </Button>
        </div>
      </div>

      <SearchAdvanceSection
        isAdvancedOptionsVisible={isAdvancedOptionsVisible}
        toggleAdvancedOptionsVisibility={toggleAdvancedOptionsVisibility}
        onRankChange={handleRankChange}
        selectedRank={selectedRank}
        onSourceChange={handleSourceChange}
        selectedSource={selectedSource}
        // onAverageScoreChange={handleAverageScoreChange}
        // selectedAverageScore={selectedAverageScore}
        onTopicsChange={handleTopicsChange}
        selectedTopics={selectedTopics}
        onFieldOfResearchChange={handleFieldsOfResearchChange}
        selectedFieldsOfResearch={selectedFieldsOfResearch}
        // ADDED: Pass publisher props
        onPublisherChange={handlePublisherChange}
        selectedPublisher={selectedPublisher}
        subFromDate={subFromDate}
        subToDate={subToDate}
        onSubmissionDateRangeChange={handleSubmissionDateRangeChange}
      />
    </div>
  )
}

export default SearchSection