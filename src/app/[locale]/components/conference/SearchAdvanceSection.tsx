// SearchAdvanceSection.tsx
"use client";

import React, { useState } from 'react';

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
}

const SearchAdvanceSection: React.FC<SearchAdvanceSectionProps> = ({
  isAdvancedOptionsVisible, toggleAdvancedOptionsVisibility,
  onSubmissionDateChange, submissionDate, onRankChange, selectedRank, onSourceYearChange, selectedSourceYear, onAverageScoreChange, selectedAverageScore, onTopicsChange, selectedTopics, onFieldOfResearchChange, selectedFieldsOfResearch
}) => {
  const [topicsInput, setTopicsInput] = useState('');
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [fieldOfResearchInput, setFieldOfResearchInput] = useState('');
  const [fieldOfResearchSuggestions, setFieldOfResearchSuggestions] = useState<string[]>([]);

  // Example lists - replace with your actual lists
  const availableTopics = [
    "Artificial Intelligence", "Machine Learning", "Data Science", "Cloud Computing", "Cybersecurity",
    "Web Development", "Mobile Development", "Database Management", "Software Engineering", "Network Security",
    "UX/UI Design", "Project Management", "Agile Methodologies", "DevOps", "Blockchain Technology"
  ];
  const availableFieldsOfResearch = [
    "Computer Science", "Information Technology", "Software Engineering", "Data Analytics", "Artificial Intelligence",
    "Cybersecurity", "Information Systems", "Human-Computer Interaction", "Bioinformatics", "Computational Linguistics"
  ];

  const handleTopicInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTopicsInput(inputValue);
    if (inputValue.trim()) {
      const suggestions = availableTopics.filter(topic =>
        topic.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTopics.includes(topic)
      );
      setTopicSuggestions(suggestions);
    } else {
      setTopicSuggestions([]);
    }
  };

  const handleTopicSuggestionClick = (suggestion: string) => {
    if (!selectedTopics.includes(suggestion)) {
      onTopicsChange([...selectedTopics, suggestion]); // Update parent state
    }
    setTopicsInput('');
    setTopicSuggestions([]);
  };

  const handleTopicInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (topicsInput.trim()) {
        const trimmedInput = topicsInput.trim();
        if (!selectedTopics.includes(trimmedInput) && availableTopics.includes(trimmedInput)) {
          onTopicsChange([...selectedTopics, trimmedInput]); // Update parent state
          setTopicsInput('');
          setTopicSuggestions([]);
        } else if (topicSuggestions.length > 0) {
          handleTopicSuggestionClick(topicSuggestions[0]);
        } else {
          setTopicsInput('');
          setTopicSuggestions([]);
        }
      }
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    onTopicsChange(selectedTopics.filter(topic => topic !== topicToRemove)); // Update parent state
  };

  const handleFieldOfResearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setFieldOfResearchInput(inputValue);
    if (inputValue.trim()) {
      const suggestions = availableFieldsOfResearch.filter(field =>
        field.toLowerCase().includes(inputValue.toLowerCase()) && !selectedFieldsOfResearch.includes(field)
      );
      setFieldOfResearchSuggestions(suggestions);
    } else {
      setFieldOfResearchSuggestions([]);
    }
  };

  const handleFieldOfResearchSuggestionClick = (suggestion: string) => {
    if (!selectedFieldsOfResearch.includes(suggestion)) {
      onFieldOfResearchChange([...selectedFieldsOfResearch, suggestion]); // Update parent state
    }
    setFieldOfResearchInput('');
    setFieldOfResearchSuggestions([]);
  };

  const handleFieldOfResearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (fieldOfResearchInput.trim()) {
        const trimmedInput = fieldOfResearchInput.trim();
        if (!selectedFieldsOfResearch.includes(trimmedInput) && availableFieldsOfResearch.includes(trimmedInput)) {
          onFieldOfResearchChange([...selectedFieldsOfResearch, trimmedInput]); // Update parent state
          setFieldOfResearchInput('');
          setFieldOfResearchSuggestions([]);
        } else if (fieldOfResearchSuggestions.length > 0) {
          handleFieldOfResearchSuggestionClick(fieldOfResearchSuggestions[0]);
        } else {
          setFieldOfResearchInput('');
          setFieldOfResearchSuggestions([]);
        }
      }
    }
  };

  const handleRemoveFieldOfResearch = (fieldToRemove: string) => {
    onFieldOfResearchChange(selectedFieldsOfResearch.filter(field => field !== fieldToRemove)); // Update parent state
  };

  const handleSubmissionDateInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const date = event.target.value ? new Date(event.target.value) : null;
    onSubmissionDateChange(date);
  };

  const handleRankChangeInput = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onRankChange(event.target.value === "" ? null : event.target.value);
  };

  const handleSourceYearChangeInput = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onSourceYearChange(event.target.value === "" ? null : event.target.value);
  };

  const handleAverageScoreChangeInput = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onAverageScoreChange(event.target.value === "" ? null : event.target.value);
  };


  return (
    <div>
      <div className="mt-2 flex justify-end">
        <button onClick={toggleAdvancedOptionsVisibility} className="text-sm hover:text-gray-800 focus:outline-none">
          {isAdvancedOptionsVisible ? 'Hide advanced search options' : 'Show more advanced search options'}
        </button>
      </div>

      {isAdvancedOptionsVisible && (
        <div className="mt-4 p-4 border rounded shadow-md">
          {/* Removed title: <p className="text-lg font-semibold mb-4">Advanced Search Options</p> */}

          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="submissionDate">
                Submission Date:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="submissionDate"
                type="date"
                placeholder="Date"
                onChange={handleSubmissionDateInputChange}
                value={submissionDate ? submissionDate.toISOString().split('T')[0] : ''}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="publisher">
                Publisher:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="publisher"
                type="text"
                placeholder="Publisher"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="rank">
                Rank:
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
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

            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="source">
                Source Year:
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="source"
                value={selectedSourceYear || ''}
                onChange={handleSourceYearChangeInput}
              >
                <option value="">Year</option>
                <option value="2023">2023</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block font-bold mb-2" htmlFor="averageScore">
                Avg. Score (1-5):
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                id="averageScore"
                value={selectedAverageScore || ''}
                onChange={handleAverageScoreChangeInput}
              >
                <option value="">Score</option>
                <option value="1">1</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 relative">
              <label className="block font-bold mb-2" htmlFor="topics">
                Topics:
              </label>
              <input
                type="text"
                id="topics"
                value={topicsInput}
                onChange={handleTopicInputChange}
                onKeyDown={handleTopicInputKeyDown}
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                placeholder="Enter topics"
              />
              {topicSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md max-h-48 overflow-y-auto">
                  {topicSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleTopicSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTopics.map((topic, index) => (
                  <div key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                    <span>{topic}</span>
                    <button
                      type="button"
                      className="hover:text-gray-700 focus:outline-none"
                      onClick={() => handleRemoveTopic(topic)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-1 relative">
              <label className="block font-bold mb-2" htmlFor="fieldOfResearch">
                Field of Research:
              </label>
              <input
                type="text"
                id="fieldOfResearch"
                value={fieldOfResearchInput}
                onChange={handleFieldOfResearchInputChange}
                onKeyDown={handleFieldOfResearchInputKeyDown}
                className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-sm"
                placeholder="Enter fields of research"
              />
              {fieldOfResearchSuggestions.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-md max-h-48 overflow-y-auto">
                  {fieldOfResearchSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleFieldOfResearchSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedFieldsOfResearch.map((field, index) => (
                  <div key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm flex items-center gap-1">
                    <span>{field}</span>
                    <button
                      type="button"
                      className="hover:text-gray-700 focus:outline-none"
                      onClick={() => handleRemoveFieldOfResearch(field)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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