// src/components/SearchAdvanceSection.tsx

"use client";

import React from 'react';
import useSearchAdvanceForm from '../../../hooks/conferences/useSearchAdvanceForm';

interface SearchAdvanceSectionProps {
  isAdvancedOptionsVisible: boolean;
  toggleAdvancedOptionsVisibility: () => void;
  onSubmissionDateChange: (date: Date | null) => void;
  submissionDate: Date | null;
  onRankChange: (rank: string | null) => void;
  selectedRank: string | null;
  onSourceYearChange: (sourceYear: string | null) => void;
  selectedSourceYear: string | null;
  onAverageScoreChange: (averageScore: string | null) => void;
  selectedAverageScore: string | null;
  onTopicsChange: (topics: string[]) => void;
  selectedTopics: string[];
  onFieldOfResearchChange: (fields: string[]) => void;
  selectedFieldsOfResearch: string[];
  onPublisherChange: (publisher: string | null) => void;
  selectedPublisher: string | null;
}

const SearchAdvanceSection: React.FC<SearchAdvanceSectionProps> = ({
  isAdvancedOptionsVisible,
  toggleAdvancedOptionsVisibility,
  onSubmissionDateChange,
  submissionDate,
  onRankChange,
  selectedRank,
  onSourceYearChange,
  selectedSourceYear,
  onAverageScoreChange,
  selectedAverageScore,
  onTopicsChange,
  selectedTopics,
  onFieldOfResearchChange,
  selectedFieldsOfResearch,
  onPublisherChange,
  selectedPublisher,
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
    handleSourceYearChangeInput,
    handleAverageScoreChangeInput,
    handlePublisherInputChange,
    handlePublisherEnter
  } = useSearchAdvanceForm({
    onSubmissionDateChange,
    submissionDate,
    onRankChange,
    selectedRank,
    onSourceYearChange,
    selectedSourceYear,
    onAverageScoreChange,
    selectedAverageScore,
    onTopicsChange,
    selectedTopics,
    onFieldOfResearchChange,
    selectedFieldsOfResearch,
    onPublisherChange,
    selectedPublisher,
  });

  return (
    <div>
      <div className="mt-2 flex justify-end">
        <button onClick={toggleAdvancedOptionsVisibility} className="text-sm hover:text-gray-800 focus:outline-none">
          {isAdvancedOptionsVisible ? 'Hide advanced search options' : 'Show more advanced search options'}
        </button>
      </div>

      {isAdvancedOptionsVisible && (
        <div className="mt-2 p-4 border rounded shadow-md">
          {/* Responsive grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-2">
            <div className="col-span-1">
              <label className="block text-sm font-bold mb-1" htmlFor="submissionDate"> {/* Reduced mb */}
                Submission Date:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-1 px-2 text-sm leading-tight focus:outline-none focus:shadow-outline" // Reduced py and px
                id="submissionDate"
                type="date"
                placeholder="Date"
                onChange={handleSubmissionDateInputChange}
                value={submissionDate ? submissionDate.toISOString().split('T')[0] : ''}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-bold mb-1" htmlFor="publisher"> {/* Reduced mb */}
                Publisher:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-1 px-2 text-sm leading-tight focus:outline-none focus:shadow-outline" // Reduced py and px
                id="publisher"
                type="text"
                placeholder="Publisher"
                value={selectedPublisher || ""}
                onChange={handlePublisherInputChange}
                onKeyDown={handlePublisherEnter}
              />
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-bold mb-1" htmlFor="rank"> {/* Reduced mb */}
                Rank:
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-1 px-2 text-sm leading-tight focus:outline-none focus:shadow-outline" // Reduced py and px
                id="rank"
                value={selectedRank || ''}
                onChange={handleRankChangeInput}
              >
                <option value="">Rank</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-bold mb-1" htmlFor="source"> {/* Reduced mb */}
                Source Year:
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-1 px-2 text-sm leading-tight focus:outline-none focus:shadow-outline" // Reduced py and px
                id="source"
                value={selectedSourceYear || ''}
                onChange={handleSourceYearChangeInput}
              >
                <option value="">Year</option>
                <option value="2022">2022</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-sm font-bold mb-1" htmlFor="averageScore"> {/* Reduced mb */}
                Avg. Score (1-5):
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-1 px-2 text-sm leading-tight focus:outline-none focus:shadow-outline" // Reduced py and px
                id="averageScore"
                value={selectedAverageScore || ''}
                onChange={handleAverageScoreChangeInput}
              >
                <option value="">Score</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 relative">
              <label className="block text-sm font-bold mb-1" htmlFor="topics"> {/* Reduced mb */}
                Topics:
              </label>
              <input
                type="text"
                id="topics"
                value={topicsInput}
                onChange={handleTopicInputChange}
                onKeyDown={handleTopicInputKeyDown}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-sm leading-tight focus:outline-none focus:shadow-outline" // Reduced py and px
                placeholder="Enter topics"
              />
              {topicSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md max-h-48 overflow-y-auto">
                  {topicSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer" // Reduced py and px
                      onClick={() => handleTopicSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex flex-wrap gap-1"> {/* Reduced gap */}
                {selectedTopics.map((topic, index) => (
                  <div key={index} className="bg-gray-200 rounded-full px-2 py-0.5 text-sm flex items-center gap-1"> {/* Reduced px and py */}
                    <span>{topic}</span>
                    <button
                      type="button"
                      className="hover:text-gray-700 focus:outline-none"
                      onClick={() => handleRemoveTopic(topic)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"> {/* Smaller icon */}
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 relative">
              <label className="block text-sm font-bold mb-1" htmlFor="fieldOfResearch"> {/* Reduced mb */}
                Field of Research:
              </label>
              <input
                type="text"
                id="fieldOfResearch"
                value={fieldOfResearchInput}
                onChange={handleFieldOfResearchInputChange}
                onKeyDown={handleFieldOfResearchInputKeyDown}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-sm leading-tight focus:outline-none focus:shadow-outline" // Reduced py and px
                placeholder="Enter fields of research"
              />
              {fieldOfResearchSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md max-h-48 overflow-y-auto">
                  {fieldOfResearchSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-3 py-1 text-sm hover:bg-gray-100 cursor-pointer" // Reduced py and px
                      onClick={() => handleFieldOfResearchSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex flex-wrap gap-1"> {/* Reduced gap */}
                {selectedFieldsOfResearch.map((field, index) => (
                  <div key={index} className="bg-gray-200 rounded-full px-2 py-0.5 text-sm flex items-center gap-1"> {/* Reduced px and py */}
                    <span>{field}</span>
                    <button
                      type="button"
                      className="hover:text-gray-700 focus:outline-none"
                      onClick={() => handleRemoveFieldOfResearch(field)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"> {/* Smaller icon */}
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
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
  );
};

export default SearchAdvanceSection;