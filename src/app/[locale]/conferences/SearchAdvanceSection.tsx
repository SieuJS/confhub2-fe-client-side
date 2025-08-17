// src/components/conferences/SearchAdvanceSection.tsx

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

// Import hooks
import useSearchAdvanceForm from '../../../hooks/conferences/useSearchAdvanceForm';
import { useAdvancedSearchData } from '../../../hooks/conferences/useAdvancedSearchData';

// Import sub-components
import { SubmissionDatePicker } from './searchAdvanceSection/SubmissionDatePicker';
import { RankSelector } from './searchAdvanceSection/RankSelector';
import { SourceSelector } from './searchAdvanceSection/SourceSelector';
import { PublisherInput } from './searchAdvanceSection/PublisherInput';
import { TagInput } from './searchAdvanceSection/TagInput';
import { MatchScoreSlider } from './searchAdvanceSection/MatchScoreSlider';

// Props interface remains the same
interface SearchAdvanceSectionProps {
  isAdvancedOptionsVisible: boolean;
  toggleAdvancedOptionsVisibility: () => void;
  onSubmissionDateRangeChange: (dates: [Date | null, Date | null]) => void;
  subFromDate: Date | null;
  subToDate: Date | null;
  onRankChange: (rank: string | null) => void;
  selectedRank: string | null;
  onSourceChange: (source: string | null) => void;
  selectedSource: string | null;
  onPublisherChange: (publisher: string | null) => void;
  selectedPublisher: string | null;
  onTopicsChange: (topics: string[]) => void;
  selectedTopics: string[];
  onFieldOfResearchChange: (fields: string[]) => void;
  selectedFieldsOfResearch: string[];
   // Add the new props for the match score range
  onMatchScoreRangeChange: (range: number[]) => void;
  selectedMatchScoreRange: number[];
}


const SearchAdvanceSection: React.FC<SearchAdvanceSectionProps> = (props) => {
  const t = useTranslations('');

  // Hook for fetching data (topics, sources)
  const { availableTopics, topicsLoading, availableSources, sourcesLoading } = useAdvancedSearchData(props.isAdvancedOptionsVisible);

  // Hook for managing form input logic
  const form = useSearchAdvanceForm({ ...props, availableTopics });

  return (
    <Tooltip.Provider delayDuration={300}>
      <div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={props.toggleAdvancedOptionsVisibility}
            className="flex items-center text-sm font-semibold text-blue-600 underline transition-colors duration-200 ease-in-out hover:text-blue-800 focus:outline-none"
          >
            {props.isAdvancedOptionsVisible ? (
              <>{t('Hide_advanced_search_options')} <ChevronUpIcon className="ml-1 h-4 w-4" /></>
            ) : (
              <>{t('Show_more_advanced_search_options')} <ChevronDownIcon className="ml-1 h-4 w-4" /></>
            )}
          </button>
        </div>

        {props.isAdvancedOptionsVisible && (
          <div className="mt-2 rounded-lg border p-4 shadow-md transition-all duration-300 ease-in-out">
            {/* --- MODIFICATION: Changed grid layout to accommodate the new slider --- */}
            <div className="mb-8 grid grid-cols-1 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-5">
              <SubmissionDatePicker
                subFromDate={props.subFromDate}
                subToDate={props.subToDate}
                onSubmissionDateRangeChange={props.onSubmissionDateRangeChange}
                t={t}
              />
              <RankSelector
                selectedRank={props.selectedRank}
                onRankChange={form.handleRankChangeInput}
                t={t}
              />
              <SourceSelector
                selectedSource={props.selectedSource}
                availableSources={availableSources}
                isLoading={sourcesLoading}
                onSourceChange={form.handleSourceChangeInput}
                t={t}
              />
              <PublisherInput
                selectedPublisher={props.selectedPublisher}
                onPublisherChange={form.handlePublisherChangeInput}
                t={t}
              />
              {/* --- ADD 3: Add the new MatchScoreSlider component --- */}
              <MatchScoreSlider
                value={props.selectedMatchScoreRange}
                onValueChange={props.onMatchScoreRangeChange}
                t={t}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TagInput
                id="topics"
                label={t('Topics')}
                placeholder={topicsLoading ? t('Loading_topics') : t('Enter_topics')}
                inputValue={form.topicsInput}
                suggestions={form.topicSuggestions}
                selectedTags={props.selectedTopics}
                isLoading={topicsLoading}
                tagBgColor="bg-blue-100"
                tagTextColor="text-blue-800"
                onInputChange={form.handleTopicInputChange}
                onInputKeyDown={form.handleTopicInputKeyDown}
                onSuggestionClick={form.handleTopicSuggestionClick}
                onRemoveTag={form.handleRemoveTopic}
              />
              <TagInput
                id="fieldOfResearch"
                label={t('Field_of_Research')}
                placeholder={t('Enter_field_of_research')}
                inputValue={form.fieldOfResearchInput}
                suggestions={form.fieldOfResearchSuggestions}
                selectedTags={props.selectedFieldsOfResearch}
                tagBgColor="bg-green-100"
                tagTextColor="text-green-800"
                onInputChange={form.handleFieldOfResearchInputChange}
                onInputKeyDown={form.handleFieldOfResearchInputKeyDown}
                onSuggestionClick={form.handleFieldOfResearchSuggestionClick}
                onRemoveTag={form.handleRemoveFieldOfResearch}
              />
            </div>
          </div>
        )}
      </div>
    </Tooltip.Provider>
  );
};

export default SearchAdvanceSection;