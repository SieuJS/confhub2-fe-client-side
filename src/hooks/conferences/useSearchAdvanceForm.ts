// src/hooks/conferences/useSearchAdvanceForm.ts

import { ChangeEvent } from 'react';
import { useTagInput } from './useTagInput'; // Import our new generic hook

// The props interface remains unchanged
interface UseSearchAdvanceFormProps {
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
  availableTopics: string[];
}

// A hardcoded list for fields of research
const availableFieldsOfResearch = [
  "Computer Science", "Information Technology", "Software Engineering", "Data Analytics", "Artificial Intelligence",
  "Cybersecurity", "Information Systems", "Human-Computer Interaction", "Bioinformatics", "Computational Linguistics"
];

const useSearchAdvanceForm = (props: UseSearchAdvanceFormProps) => {
  const {
    onRankChange,
    onSourceChange,
    onPublisherChange,
    onTopicsChange,
    selectedTopics,
    onFieldOfResearchChange,
    selectedFieldsOfResearch,
    availableTopics,
  } = props;

  // Instantiate the generic hook for Topics
  const topicsManager = useTagInput({
    availableSuggestions: availableTopics,
    selectedTags: selectedTopics,
    onTagsChange: onTopicsChange,
  });

  // Instantiate the generic hook for Fields of Research
  const fieldsManager = useTagInput({
    availableSuggestions: availableFieldsOfResearch,
    selectedTags: selectedFieldsOfResearch,
    onTagsChange: onFieldOfResearchChange,
  });

  // --- Simple Event Handlers ---
  // These are simple enough to remain here. They adapt a DOM event to the parent's callback.

  const handleRankChangeInput = (event: ChangeEvent<HTMLSelectElement>) => {
    onRankChange(event.target.value === "" ? null : event.target.value);
  };

  const handleSourceChangeInput = (event: ChangeEvent<HTMLSelectElement>) => {
    onSourceChange(event.target.value === "" ? null : event.target.value);
  };

  const handlePublisherChangeInput = (event: ChangeEvent<HTMLInputElement>) => {
    onPublisherChange(event.target.value === "" ? null : event.target.value);
  };

  // --- Return the exact same API as before ---
  return {
    // Values and handlers for Topics from its dedicated manager
    topicsInput: topicsManager.inputValue,
    topicSuggestions: topicsManager.suggestions,
    handleTopicInputChange: topicsManager.handleInputChange,
    handleTopicSuggestionClick: topicsManager.handleSuggestionClick,
    handleTopicInputKeyDown: topicsManager.handleInputKeyDown,
    handleRemoveTopic: topicsManager.handleRemoveTag,

    // Values and handlers for Fields of Research from its dedicated manager
    fieldOfResearchInput: fieldsManager.inputValue,
    fieldOfResearchSuggestions: fieldsManager.suggestions,
    handleFieldOfResearchInputChange: fieldsManager.handleInputChange,
    handleFieldOfResearchSuggestionClick: fieldsManager.handleSuggestionClick,
    handleFieldOfResearchInputKeyDown: fieldsManager.handleInputKeyDown,
    handleRemoveFieldOfResearch: fieldsManager.handleRemoveTag,

    // The simple handlers that remained
    handleRankChangeInput,
    handleSourceChangeInput,
    handlePublisherChangeInput,
  };
};

export default useSearchAdvanceForm;