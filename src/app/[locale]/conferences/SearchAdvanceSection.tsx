// src/components/SearchAdvanceSection.tsx

'use client'

import React from 'react'
import useSearchAdvanceForm from '../../../hooks/conferences/useSearchAdvanceForm'

interface SearchAdvanceSectionProps {
  isAdvancedOptionsVisible: boolean
  toggleAdvancedOptionsVisibility: () => void
  onSubmissionDateChange: (date: Date | null) => void
  submissionDate: Date | null
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
  onSubmissionDateChange,
  submissionDate,
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
    handleSubmissionDateInputChange,
    handleRankChangeInput,
    handleSourceChangeInput,
    handleAverageScoreChangeInput,
    handlePublisherInputChange,
    handlePublisherEnter
  } = useSearchAdvanceForm({
    onSubmissionDateChange,
    submissionDate,
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
  })

  return (
    <div>
      <div className='mt-2 flex justify-end'>
        <button
          onClick={toggleAdvancedOptionsVisibility}
          className='text-sm hover:text-gray-800 focus:outline-none'
        >
          {isAdvancedOptionsVisible
            ? 'Hide advanced search options'
            : 'Show more advanced search options'}
        </button>
      </div>

      {isAdvancedOptionsVisible && (
        <div className='mt-2 rounded border p-4 shadow-md'>
          {/* Responsive grid layout */}
          <div className='mb-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
            <div className='col-span-1'>
              <label
                className='mb-1 block text-sm font-bold'
                htmlFor='submissionDate'
              >
                {' '}
                {/* Reduced mb */}
                Submission Date:
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none' // Reduced py and px
                id='submissionDate'
                type='date'
                placeholder='Date'
                onChange={handleSubmissionDateInputChange}
                value={
                  submissionDate
                    ? submissionDate.toISOString().split('T')[0]
                    : ''
                }
              />
            </div>

            <div className='col-span-1'>
              <label
                className='mb-1 block text-sm font-bold'
                htmlFor='publisher'
              >
                {' '}
                {/* Reduced mb */}
                Publisher:
              </label>
              <input
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none' // Reduced py and px
                id='publisher'
                type='text'
                placeholder='Publisher'
                value={selectedPublisher || ''}
                onChange={handlePublisherInputChange}
                onKeyDown={handlePublisherEnter}
              />
            </div>

            <div className='col-span-1'>
              <label className='mb-1 block text-sm font-bold' htmlFor='rank'>
                {' '}
                {/* Reduced mb */}
                Rank:
              </label>
              <select
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none' // Reduced py and px
                id='rank'
                value={selectedRank || ''}
                onChange={handleRankChangeInput}
              >
                <option value=''>Rank</option>
                <option value='A*'>A*</option>
                <option value='A'>A</option>
                <option value='B'>B</option>
                <option value='AustralasianB'>Australasian B</option>
                <option value='C'>C</option>
                <option value='AustralasianC'>Australasian C</option>
                <option value='Other'>Other</option>
              </select>
            </div>

            <div className='col-span-1'>
              <label className='mb-1 block text-sm font-bold' htmlFor='source'>
                {' '}
                {/* Reduced mb */}
                Source:
              </label>
              <select
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none' // Reduced py and px
                id='source'
                value={selectedSource || ''}
                onChange={handleSourceChangeInput}
              >
                <option value=''>Source</option>
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

            <div className='col-span-1'>
              <label
                className='mb-1 block text-sm font-bold'
                htmlFor='averageScore'
              >
                {' '}
                {/* Reduced mb */}
                Avg. Score (1-5):
              </label>
              <select
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none' // Reduced py and px
                id='averageScore'
                value={selectedAverageScore || ''}
                onChange={handleAverageScoreChangeInput}
              >
                <option value=''>Score</option>
                <option value='1'>1</option>
                <option value='2'>2</option>
                <option value='3'>3</option>
                <option value='4'>4</option>
                <option value='5'>5</option>
              </select>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='relative col-span-1'>
              <label className='mb-1 block text-sm font-bold' htmlFor='topics'>
                {' '}
                {/* Reduced mb */}
                Topics:
              </label>
              <input
                type='text'
                id='topics'
                value={topicsInput}
                onChange={handleTopicInputChange}
                onKeyDown={handleTopicInputKeyDown}
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none' // Reduced py and px
                placeholder='Enter topics'
              />
              {topicSuggestions.length > 0 && (
                <ul className='absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow-md'>
                  {topicSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className='cursor-pointer px-3 py-1 text-sm hover:bg-gray-100' // Reduced py and px
                      onClick={() => handleTopicSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className='mt-2 flex flex-wrap gap-1'>
                {' '}
                {/* Reduced gap */}
                {selectedTopics.map((topic, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-sm'
                  >
                    {' '}
                    {/* Reduced px and py */}
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
                        {' '}
                        {/* Smaller icon */}
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

            <div className='relative col-span-1'>
              <label
                className='mb-1 block text-sm font-bold'
                htmlFor='fieldOfResearch'
              >
                {' '}
                {/* Reduced mb */}
                Field of Research:
              </label>
              <input
                type='text'
                id='fieldOfResearch'
                value={fieldOfResearchInput}
                onChange={handleFieldOfResearchInputChange}
                onKeyDown={handleFieldOfResearchInputKeyDown}
                className='focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow focus:outline-none' // Reduced py and px
                placeholder='Enter fields of research'
              />
              {fieldOfResearchSuggestions.length > 0 && (
                <ul className='absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow-md'>
                  {fieldOfResearchSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className='cursor-pointer px-3 py-1 text-sm hover:bg-gray-100' // Reduced py and px
                      onClick={() =>
                        handleFieldOfResearchSuggestionClick(suggestion)
                      }
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className='mt-2 flex flex-wrap gap-1'>
                {' '}
                {/* Reduced gap */}
                {selectedFieldsOfResearch.map((field, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-1 rounded-full bg-gray-200 px-2 py-0.5 text-sm'
                  >
                    {' '}
                    {/* Reduced px and py */}
                    <span>{field}</span>
                    <button
                      type='button'
                      className='hover:text-gray-700 focus:outline-none'
                      onClick={() => handleRemoveFieldOfResearch(field)}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-3 w-3'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        {' '}
                        {/* Smaller icon */}
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
