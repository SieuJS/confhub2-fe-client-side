'use client'

import React, { useState, useEffect } from 'react'
import useSearchAdvanceForm from '../../../hooks/conferences/useSearchAdvanceForm'
import { useTranslations } from 'next-intl'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { appConfig } from '@/src/middleware'

import * as Tooltip from '@radix-ui/react-tooltip'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'

// --- PROPS INTERFACE ---
interface SearchAdvanceSectionProps {
  isAdvancedOptionsVisible: boolean
  toggleAdvancedOptionsVisibility: () => void
  onSubmissionDateRangeChange: (dates: [Date | null, Date | null]) => void
  subFromDate: Date | null
  subToDate: Date | null
  onRankChange: (rank: string | null) => void
  selectedRank: string | null
  onSourceChange: (source: string | null) => void
  selectedSource: string | null
  // ADDED: Props for Publisher
  onPublisherChange: (publisher: string | null) => void
  selectedPublisher: string | null
  onTopicsChange: (topics: string[]) => void
  selectedTopics: string[]
  onFieldOfResearchChange: (fields: string[]) => void
  selectedFieldsOfResearch: string[]
}

const SearchAdvanceSection: React.FC<SearchAdvanceSectionProps> = ({
  isAdvancedOptionsVisible,
  toggleAdvancedOptionsVisibility,
  onSubmissionDateRangeChange,
  subFromDate,
  subToDate,
  onRankChange,
  selectedRank,
  onSourceChange,
  selectedSource,
  // ADDED: Destructure Publisher props
  onPublisherChange,
  selectedPublisher,
  onTopicsChange,
  selectedTopics,
  onFieldOfResearchChange,
  selectedFieldsOfResearch
}) => {
  const t = useTranslations('')

  // --- INTERNAL STATE FOR DATA LOADING ---
  const [availableTopics, setAvailableTopics] = useState<string[]>([])
  const [topicsLoading, setTopicsLoading] = useState(false)

  const [availableSources, setAvailableSources] = useState<string[]>([])
  const [sourcesLoading, setSourcesLoading] = useState(false)

  // --- useEffect HOOKS FOR API FETCHING ---

  // Fetch Topics
  useEffect(() => {
    if (isAdvancedOptionsVisible && availableTopics.length === 0 && !topicsLoading) {
      const fetchTopics = async () => {
        setTopicsLoading(true)
        try {
          const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference-organization/topics`)
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data: string[] = await response.json()
          setAvailableTopics(data)
        } catch (error) {
          // console.error('Could not fetch topics:', error)
        } finally {
          setTopicsLoading(false)
        }
      }
      fetchTopics()
    }
  }, [isAdvancedOptionsVisible, availableTopics.length, topicsLoading])

  // Fetch Sources
  useEffect(() => {
    if (isAdvancedOptionsVisible && availableSources.length === 0 && !sourcesLoading) {
      const fetchSources = async () => {
        setSourcesLoading(true)
        try {
          const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/admin/conferences/filter-options/sources`)
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data: string[] = await response.json()
          const filteredSources = data.filter(source => source && source.trim().toLowerCase() !== 'unknown')
          setAvailableSources(filteredSources)
        } catch (error) {
          // console.error('Could not fetch sources:', error)
        } finally {
          setSourcesLoading(false)
        }
      }
      fetchSources()
    }
  }, [isAdvancedOptionsVisible, availableSources.length, sourcesLoading])

  // --- CUSTOM HOOK FOR INPUT LOGIC ---
  const {
    topicsInput,
    topicSuggestions,
    fieldOfResearchInput,
    fieldOfResearchSuggestions,
    handleTopicInputChange,
    handleTopicSuggestionClick,
    handleTopicInputKeyDown,
    handleRemoveTopic,
    handleFieldOfResearchInputChange,
    handleFieldOfResearchSuggestionClick,
    handleFieldOfResearchInputKeyDown,
    handleRemoveFieldOfResearch,
    handleRankChangeInput,
    handleSourceChangeInput,
    // ADDED: Handler for Publisher
    handlePublisherChangeInput
  } = useSearchAdvanceForm({
    onRankChange,
    selectedRank,
    onSourceChange,
    selectedSource,
    // ADDED: Pass publisher props to hook
    onPublisherChange,
    selectedPublisher,
    onTopicsChange,
    selectedTopics,
    onFieldOfResearchChange,
    selectedFieldsOfResearch,
    availableTopics: availableTopics
  })

  return (
    <Tooltip.Provider delayDuration={300}>
      <div>
        {/* Toggle advanced filters button */}
        <div className='mt-4 flex justify-end'>
          <button
            onClick={toggleAdvancedOptionsVisibility}
            className='flex items-center text-sm font-semibold text-blue-600 underline transition-colors duration-200 ease-in-out hover:text-blue-800 focus:outline-none'
          >
            {isAdvancedOptionsVisible ? (
              <>
                {t('Hide_advanced_search_options')}
                <ChevronUpIcon className='ml-1 h-4 w-4' />
              </>
            ) : (
              <>
                {t('Show_more_advanced_search_options')}
                <ChevronDownIcon className='ml-1 h-4 w-4' />
              </>
            )}
          </button>
        </div>

        {/* Advanced filters content block */}
        {isAdvancedOptionsVisible && (
          <div className='mt-2 rounded-lg border p-4 shadow-md transition-all duration-300 ease-in-out'>
            {/* First row of filters */}
            <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5'>
              {/* --- Submission Date --- */}
              <div className='col-span-1 md:col-span-3 lg:col-span-1'>
                <label className='mb-1 flex items-center text-sm font-bold' htmlFor='submissionDateRange'>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span className='mr-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600'>?</span>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content className='z-50 max-w-xs rounded-md bg-gray-800 px-3 py-2 text-sm text-white shadow-lg' sideOffset={5} side='bottom'>
                        {t('tooltip_submission_date')}
                        <Tooltip.Arrow className='fill-gray-800' />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                  {t('Submission_Date')}:
                </label>
                <DatePicker
                  selectsRange={true}
                  startDate={subFromDate}
                  endDate={subToDate}
                  onChange={onSubmissionDateRangeChange}
                  isClearable={true}
                  placeholderText={t('Select_Date_Range') ?? 'Select Date Range'}
                  dateFormat='yyyy/MM/dd'
                  className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none'
                  wrapperClassName='w-full'
                  id='submissionDateRange'
                />
              </div>

              {/* --- Rank --- */}
              <div className='col-span-1'>
                <label className='mb-1 flex items-center text-sm font-bold' htmlFor='rank'>
                  {t('Rank')}:
                </label>
                <select
                  id='rank'
                  className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none'
                  value={selectedRank || ''}
                  onChange={handleRankChangeInput}
                >
                  <option value=''>{t('All_Ranks')}</option>
                  <option value='A*'>A*</option>
                  <option value='A'>A</option>
                  <option value='B'>B</option>
                  <option value='C'>C</option>
                  <option value='Unranked'>Unranked</option>
                  <option value='other'>Other</option>
                </select>
              </div>

              {/* --- Source --- */}
              <div className='col-span-1'>
                <label className='mb-1 flex items-center text-sm font-bold' htmlFor='source'>
                  {t('Source')}:
                </label>
                <select
                  id='source'
                  className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none'
                  value={selectedSource || ''}
                  onChange={handleSourceChangeInput}
                  disabled={sourcesLoading}
                >
                  <option value=''>
                    {sourcesLoading ? t('Loading_sources') : t('All_Sources')}
                  </option>
                  {availableSources.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>

              {/* --- Publisher (NEW) --- */}
              <div className='col-span-1'>
                <label className='mb-1 flex items-center text-sm font-bold' htmlFor='publisher'>
                  {t('Publisher')}:
                </label>
                <input
                  type='text'
                  id='publisher'
                  className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none'
                  value={selectedPublisher || ''}
                  onChange={handlePublisherChangeInput}
                  placeholder={t('Enter_publisher_name') ?? 'Enter publisher name'}
                />
              </div>

              {/* --- Average Score (Commented out) --- */}
              {/* <div className='col-span-1'>
                <label className='mb-1 flex items-center text-sm font-bold' htmlFor='averageScore'>
                  {t('Average_Score')}:
                </label>
                <input
                  type='text'
                  id='averageScore'
                  value={selectedAverageScore || ''}
                  onChange={handleAverageScoreChangeInput}
                  className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none'
                  placeholder={t('e.g., 3.5')}
                />
              </div> */}
            </div>

            {/* Second row of filters */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {/* --- Topics --- */}
              <div className='relative col-span-1'>
                <label className='mb-1 flex items-center text-sm font-bold' htmlFor='topics'>
                  {t('Topics')}:
                </label>
                <input
                  type='text'
                  id='topics'
                  value={topicsInput}
                  onChange={handleTopicInputChange}
                  onKeyDown={handleTopicInputKeyDown}
                  className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none'
                  placeholder={topicsLoading ? t('Loading_topics') : t('Enter_topics')}
                  disabled={topicsLoading}
                />
                {topicSuggestions.length > 0 && (
                  <ul className='absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow-md'>
                    {topicSuggestions.map((suggestion, index) => (
                      <li key={index} className='cursor-pointer px-3 py-1 text-sm hover:bg-gray-100' onClick={() => handleTopicSuggestionClick(suggestion)}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
                <div className='mt-2 flex min-h-[2rem] flex-wrap gap-1'>
                  {selectedTopics.map((topic, index) => (
                    <div key={index} className='flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-sm text-blue-800'>
                      <span>{topic}</span>
                      <button type='button' className='text-blue-500 hover:text-blue-700' onClick={() => handleRemoveTopic(topic)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- Field of Research --- */}
              <div className='relative col-span-1'>
                <label className='mb-1 flex items-center text-sm font-bold' htmlFor='fieldOfResearch'>
                  {t('Field_of_Research')}:
                </label>
                <input
                  type='text'
                  id='fieldOfResearch'
                  value={fieldOfResearchInput}
                  onChange={handleFieldOfResearchInputChange}
                  onKeyDown={handleFieldOfResearchInputKeyDown}
                  className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none'
                  placeholder={t('Enter_field_of_research')}
                />
                {fieldOfResearchSuggestions.length > 0 && (
                  <ul className='absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow-md'>
                    {fieldOfResearchSuggestions.map((suggestion, index) => (
                      <li key={index} className='cursor-pointer px-3 py-1 text-sm hover:bg-gray-100' onClick={() => handleFieldOfResearchSuggestionClick(suggestion)}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
                <div className='mt-2 flex min-h-[2rem] flex-wrap gap-1'>
                  {selectedFieldsOfResearch.map((field, index) => (
                    <div key={index} className='flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-sm text-green-800'>
                      <span>{field}</span>
                      <button type='button' className='text-green-500 hover:text-green-700' onClick={() => handleRemoveFieldOfResearch(field)}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Tooltip.Provider>
  )
}

export default SearchAdvanceSection