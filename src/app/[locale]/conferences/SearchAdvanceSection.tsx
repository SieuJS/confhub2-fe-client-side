// src/components/SearchAdvanceSection.tsx

'use client'

import React, { useState, useEffect } from 'react'
import useSearchAdvanceForm from '../../../hooks/conferences/useSearchAdvanceForm'
import { useTranslations } from 'next-intl'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { appConfig } from '@/src/middleware' // Import appConfig

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
  onAverageScoreChange: (averageScore: string | null) => void
  selectedAverageScore: string | null
  onTopicsChange: (topics: string[]) => void
  selectedTopics: string[]
  onFieldOfResearchChange: (fields: string[]) => void
  selectedFieldsOfResearch: string[]
  onPublisherChange: (publisher: string | null) => void
  selectedPublisher: string | null
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
  onAverageScoreChange,
  selectedAverageScore,
  onTopicsChange,
  selectedTopics,
  onFieldOfResearchChange,
  selectedFieldsOfResearch,
  onPublisherChange,
  selectedPublisher
}) => {
  const t = useTranslations('')
  
  // --- LOGIC MỚI: FETCH TOPICS KHI CẦN ---
  const [availableTopics, setAvailableTopics] = useState<string[]>([])
  const [topicsLoading, setTopicsLoading] = useState(false)

  useEffect(() => {
    // Chỉ fetch khi:
    // 1. Panel được mở
    // 2. Dữ liệu chưa được fetch (availableTopics rỗng)
    // 3. Không đang trong quá trình fetch
    if (isAdvancedOptionsVisible && availableTopics.length === 0 && !topicsLoading) {
      const fetchTopics = async () => {
        setTopicsLoading(true)
        try {
          const response = await fetch(`${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference-organization/topics`)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          const data: string[] = await response.json()
          setAvailableTopics(data)
        } catch (error) {
          console.error("Could not fetch topics:", error)
        } finally {
          setTopicsLoading(false)
        }
      }
      fetchTopics()
    }
  }, [isAdvancedOptionsVisible, availableTopics.length, topicsLoading]) // Dependencies

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
    handleAverageScoreChangeInput,
    handlePublisherInputChange,
    handlePublisherEnter
  } = useSearchAdvanceForm({
    onRankChange,
    selectedRank,
    onSourceChange,
    selectedSource,
    onAverageScoreChange,
    selectedAverageScore,
    onTopicsChange,
    selectedTopics,
    onFieldOfResearchChange,
    selectedFieldsOfResearch,
    onPublisherChange,
    selectedPublisher,
    // --- TRUYỀN DỮ LIỆU TOPICS XUỐNG HOOK ---
    availableTopics: availableTopics
  })

  return (
    <div>
      <div className='mt-2 flex justify-end'>
        <button
          onClick={toggleAdvancedOptionsVisibility}
          className='text-sm hover:text-gray-80 focus:outline-none'
        >
          {isAdvancedOptionsVisible
            ? t('Hide_advanced_search_options')
            : t('Show_more_advanced_search_options')}
        </button>
      </div>

      {isAdvancedOptionsVisible && (
        <div className='mt-2 rounded border p-4 shadow-md'>
          {/* ... JSX không đổi ... */}
          <div className='mb-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
            {/* --- Date Picker Section --- */}
            <div className='col-span-1'>
              <label
                className='mb-1 block text-sm font-bold '
                htmlFor='submissionDateRange'
              >
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
            
            <div className='col-span-1'>
              <label className='mb-1 block text-sm font-bold' htmlFor='rank'>
                {t('Rank')}:
              </label>
              <select
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none'
                id='rank'
                value={selectedRank || ''}
                onChange={handleRankChangeInput}
              >
                <option value=''>{t('Rank')}</option>
                <option value='A*'>A*</option>
                <option value='A'>A</option>
                <option value='B'>B</option>
                <option value='C'>C</option>
                <option value='Unranked'>Unranked</option>
              </select>
            </div>

            <div className='col-span-1'>
              <label className='mb-1 block text-sm font-bold' htmlFor='source'>
                {t('Source')}:
              </label>
              <select
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none'
                id='source'
                value={selectedSource || ''}
                onChange={handleSourceChangeInput}
              >
                <option value=''>{t('Source')}</option>
                <option value='CORE2023'>CORE2023</option>
                <option value='CORE2021'>CORE2021</option>
                <option value='CORE2020'>CORE2020</option>
                <option value='CORE2018'>CORE2018</option>
                <option value='CORE2017'>CORE2017</option>
                <option value='CORE2014'>CORE2014</option>
                <option value='CORE2013'>CORE2013</option>
                <option value='ERA2010'>ERA2010</option>
              </select>
            </div>

            <div className='relative col-span-2'>
              <label className='mb-1 block text-sm font-bold' htmlFor='topics'>
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
                disabled={topicsLoading} // Vô hiệu hóa input khi đang tải
              />
              {topicSuggestions.length > 0 && (
                <ul className='absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-300 bg-white-pure shadow-md '>
                  {topicSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className='cursor-pointer px-3 py-1 text-sm hover:bg-gray-10 '
                      onClick={() => handleTopicSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className='mt-2 flex flex-wrap gap-1'>
                {selectedTopics.map((topic, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-1 rounded-full bg-gray-20 px-2 py-0.5 text-sm '
                  >
                    <span>{topic}</span>
                    <button
                      type='button'
                      className='hover:text-gray-700 focus:outline-none'
                      onClick={() => handleRemoveTopic(topic)}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-3 w-3'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchAdvanceSection