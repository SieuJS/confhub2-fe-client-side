// src/hooks/conferences/useSearchAdvanceForm.ts

import { useState, ChangeEvent, KeyboardEvent } from 'react';

interface UseSearchAdvanceFormProps {
  onRankChange: (rank: string | null) => void;
  selectedRank: string | null;
  onSourceChange: (source: string | null) => void;
  selectedSource: string | null;
  // ADDED: Props for Publisher
  // onPublisherChange: (publisher: string | null) => void;
  // selectedPublisher: string | null;
  // // ADDED: Props for Average Score
  // onAverageScoreChange: (score: string | null) => void;
  // selectedAverageScore: string | null;
  onTopicsChange: (topics: string[]) => void;
  selectedTopics: string[];
  onFieldOfResearchChange: (fields: string[]) => void;
  selectedFieldsOfResearch: string[];
  availableTopics: string[];
}

const useSearchAdvanceForm = ({
  onRankChange,
  selectedRank,
  onSourceChange,
  selectedSource,
  // ADDED: Destructure new props
  // onPublisherChange,
  // selectedPublisher,
  // onAverageScoreChange,
  // selectedAverageScore,
  onTopicsChange,
  selectedTopics,
  onFieldOfResearchChange,
  selectedFieldsOfResearch,
  availableTopics,
}: UseSearchAdvanceFormProps) => {
  const [topicsInput, setTopicsInput] = useState('');
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [fieldOfResearchInput, setFieldOfResearchInput] = useState('');
  const [fieldOfResearchSuggestions, setFieldOfResearchSuggestions] = useState<string[]>([]);

  const availableFieldsOfResearch = [
    "Computer Science", "Information Technology", "Software Engineering", "Data Analytics", "Artificial Intelligence",
    "Cybersecurity", "Information Systems", "Human-Computer Interaction", "Bioinformatics", "Computational Linguistics"
  ];

  const handleTopicInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setTopicsInput(inputValue);
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      const suggestions = availableTopics.filter(topic =>
        topic.toLowerCase().includes(trimmedInput.toLowerCase()) && !selectedTopics.includes(topic)
      );
      setTopicSuggestions(suggestions);
    } else {
      setTopicSuggestions([]);
    }
  };

  const handleTopicSuggestionClick = (suggestion: string) => {
    onTopicsChange([...selectedTopics, suggestion]);
    setTopicsInput('');
    setTopicSuggestions([]);
  };

  const handleTopicInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedInput = topicsInput.trim();
      if (trimmedInput && !selectedTopics.includes(trimmedInput)) {
        onTopicsChange([...selectedTopics, trimmedInput]);
        setTopicsInput('');
        setTopicSuggestions([]);
      }
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    onTopicsChange(selectedTopics.filter(topic => topic !== topicToRemove));
  };

  const handleFieldOfResearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setFieldOfResearchInput(inputValue);
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      const suggestions = availableFieldsOfResearch.filter(field =>
        field.toLowerCase().includes(trimmedInput.toLowerCase()) && !selectedFieldsOfResearch.includes(field)
      );
      setFieldOfResearchSuggestions(suggestions);
    } else {
      setFieldOfResearchSuggestions([]);
    }
  };
  const handleFieldOfResearchSuggestionClick = (suggestion: string) => {
    onFieldOfResearchChange([...selectedFieldsOfResearch, suggestion]);
    setFieldOfResearchInput('');
    setFieldOfResearchSuggestions([]);
  };

  const handleFieldOfResearchInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmedInput = fieldOfResearchInput.trim();
      if (trimmedInput) {
        if (!selectedFieldsOfResearch.includes(trimmedInput) && availableFieldsOfResearch.includes(trimmedInput)) {
          onFieldOfResearchChange([...selectedFieldsOfResearch, trimmedInput]);
        } else if (fieldOfResearchSuggestions.length > 0) {
          handleFieldOfResearchSuggestionClick(fieldOfResearchSuggestions[0]);
        }
        setFieldOfResearchInput('');
        setFieldOfResearchSuggestions([]);
      }
    }
  };
  const handleRemoveFieldOfResearch = (fieldToRemove: string) => {
    onFieldOfResearchChange(selectedFieldsOfResearch.filter(field => field !== fieldToRemove));
  };

  const handleRankChangeInput = (event: ChangeEvent<HTMLSelectElement>) => {
    onRankChange(event.target.value === "" ? null : event.target.value);
  };

  const handleSourceChangeInput = (event: ChangeEvent<HTMLSelectElement>) => {
    onSourceChange(event.target.value === "" ? null : event.target.value);
  };

  // ADDED: Handler for Publisher dropdown
  // const handlePublisherChangeInput = (event: ChangeEvent<HTMLSelectElement>) => {
  //   onPublisherChange(event.target.value === "" ? null : event.target.value);
  // };

  // // ADDED: Handler for Average Score input
  // const handleAverageScoreChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
  //   onAverageScoreChange(event.target.value === "" ? null : event.target.value);
  // };

  return {
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
    // ADDED: Return new handlers
    // handlePublisherChangeInput,
    // handleAverageScoreChangeInput,
  };
};

export default useSearchAdvanceForm;