// src/hooks/conferences/useTagInput.ts

import { useState, ChangeEvent, KeyboardEvent } from 'react';

interface UseTagInputProps {
  // The full list of available items for suggestions
  availableSuggestions: string[];
  // The currently selected tags, controlled by the parent component
  selectedTags: string[];
  // A callback to inform the parent of changes to the selected tags
  onTagsChange: (newTags: string[]) => void;
}

/**
 * A generic and reusable hook to manage the logic for a tag input field
 * with autocomplete suggestions.
 */
export const useTagInput = ({
  availableSuggestions,
  selectedTags,
  onTagsChange,
}: UseTagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const trimmedInput = value.trim();

    if (trimmedInput) {
      const filteredSuggestions = availableSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(trimmedInput.toLowerCase()) && !selectedTags.includes(suggestion)
      );
      setSuggestions(filteredSuggestions.slice(0, 10)); // Limit suggestions for performance
    } else {
      setSuggestions([]);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      onTagsChange([...selectedTags, trimmedTag]);
    }
    setInputValue('');
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  return {
    inputValue,
    suggestions,
    handleInputChange,
    handleSuggestionClick,
    handleInputKeyDown,
    handleRemoveTag,
  };
};