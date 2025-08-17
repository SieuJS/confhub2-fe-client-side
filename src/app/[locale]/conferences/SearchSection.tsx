// src/components/conferences/SearchSection.tsx

'use client'

import React from 'react';
import { useTranslations } from 'next-intl';
import useSearchForm from '../../../hooks/conferences/useSearchForm';
import Button from '../utils/Button';
import SearchAdvanceSection from './SearchAdvanceSection';

// Import newly created sub-components
import { KeywordSearchInput } from './searchSection/KeywordSearchInput';
import { DateRangePicker } from './searchSection/DateRangePicker';
import { TypeSelector } from './searchSection/TypeSelector';
import { LocationSelector } from './searchSection/LocationSelector';

// The props interface remains unchanged
interface SearchSectionProps {
  onSearch: (searchParams: any) => void;
  onClear: () => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ onSearch, onClear }) => {
  const t = useTranslations('');

  // The hook provides all the state and logic. Its internal complexity is hidden.
  const form = useSearchForm({ onSearch, onClear });

  return (
    <div className='container mx-auto px-4 text-base'>
      <div className='relative flex flex-wrap items-center justify-between gap-x-2 gap-y-3 rounded-3xl border border-black-pure px-2 py-2 shadow-md'>

        <KeywordSearchInput
          keyword={form.confKeyword}
          searchType={form.selectSearchType}
          isDropdownOpen={form.isSearchTypeDropdownOpen}
          dropdownRef={form.searchTypeDropdownRef}
          onKeywordChange={form.handleKeywordChange}
          onKeyPress={form.handleKeyPress}
          onSearchTypeChange={form.handleSearchTypeChange}
          toggleDropdown={form.toggleSearchTypeDropdown}
          t={t}
        />

        <div className='mx-2 hidden h-6 border-l border-gray-30 xl:block'></div>

        <DateRangePicker
          fromDate={form.fromDate}
          toDate={form.toDate}
          onFromDateChange={form.handleStartDateInputChange}
          onToDateChange={form.handleEndDateInputChange}
          t={t}
        />

        <div className='mx-2 hidden h-6 border-l border-gray-300 xl:block'></div>

        <TypeSelector
          selectedType={form.selectedType}
          filteredTypes={form.filteredTypes}
          isDropdownOpen={form.isTypeDropdownOpen}
          dropdownRef={form.typeDropdownRef}
          onTypeClick={form.handleTypeClick}
          toggleDropdown={form.toggleTypeDropdown}
          t={t}
        />

        <div className='mx-2 hidden h-6 border-l border-gray-300 xl:block'></div>

        <LocationSelector
          selectedLocation={form.selectedLocation}
          filteredLocations={form.filteredLocations}
          isDropdownOpen={form.isLocationDropdownOpen}
          dropdownRef={form.locationDropdownRef}
          onLocationClick={form.handleLocationClick}
          onLocationSearchChange={form.handleLocationSearchChange}
          toggleDropdown={form.toggleLocationDropdown}
          t={t}
        />

        <div className='flex w-full basis-full justify-end space-x-4 xl:ml-auto xl:w-auto xl:basis-auto xl:pl-4'>
          <Button variant='primary' size='small' rounded onClick={form.handleSearchClick}>
            {t('Search')}
          </Button>
          <Button variant='secondary' size='small' rounded onClick={form.handleClear}>
            {t('Clear')}
          </Button>
        </div>
      </div>

      {/* The SearchAdvanceSection remains as is, receiving its props directly */}
      <SearchAdvanceSection
        isAdvancedOptionsVisible={form.isAdvancedOptionsVisible}
        toggleAdvancedOptionsVisibility={form.toggleAdvancedOptionsVisibility}
        onRankChange={form.handleRankChange}
        selectedRank={form.selectedRank}
        onSourceChange={form.handleSourceChange}
        selectedSource={form.selectedSource}
        onTopicsChange={form.handleTopicsChange}
        selectedTopics={form.selectedTopics}
        onFieldOfResearchChange={form.handleFieldsOfResearchChange}
        selectedFieldsOfResearch={form.selectedFieldsOfResearch}
        onPublisherChange={form.handlePublisherChange}
        selectedPublisher={form.selectedPublisher}
        subFromDate={form.subFromDate}
        subToDate={form.subToDate}
        onSubmissionDateRangeChange={form.handleSubmissionDateRangeChange}
        // Add the new props for the match score
        onMatchScoreRangeChange={form.handleMatchScoreChange}
        selectedMatchScoreRange={form.matchScoreRange}
      />
    </div>
  );
};

export default SearchSection;