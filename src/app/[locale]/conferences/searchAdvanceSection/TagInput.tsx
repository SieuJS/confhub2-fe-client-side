// src/components/conferences/searchAdvanceSection/TagInput.tsx
import React, { ChangeEvent, KeyboardEvent } from 'react';

interface TagInputProps {
  id: string;
  label: string;
  placeholder: string;
  inputValue: string;
  suggestions: string[];
  selectedTags: string[];
  isLoading?: boolean;
  tagBgColor: string;
  tagTextColor: string;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSuggestionClick: (suggestion: string) => void;
  onRemoveTag: (tag: string) => void;
}

export const TagInput: React.FC<TagInputProps> = ({
  id, label, placeholder, inputValue, suggestions, selectedTags, isLoading,
  tagBgColor, tagTextColor, onInputChange, onInputKeyDown, onSuggestionClick, onRemoveTag
}) => (
  <div className="relative col-span-1">
    <label className="mb-1 flex items-center text-sm font-bold" htmlFor={id}>{label}:</label>
    <input
      type="text"
      id={id}
      value={inputValue}
      onChange={onInputChange}
      onKeyDown={onInputKeyDown}
      className="focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none"
      placeholder={placeholder}
      disabled={isLoading}
    />
    {suggestions.length > 0 && (
      <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow-md">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="cursor-pointer px-3 py-1 text-sm hover:bg-gray-100" onClick={() => onSuggestionClick(suggestion)}>
            {suggestion}
          </li>
        ))}
      </ul>
    )}
    <div className="mt-2 flex min-h-[2rem] flex-wrap gap-1">
      {selectedTags.map((tag, index) => (
        <div key={index} className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-sm ${tagBgColor} ${tagTextColor}`}>
          <span>{tag}</span>
          <button type="button" className="hover:text-red-700" onClick={() => onRemoveTag(tag)}>×</button>
        </div>
      ))}
    </div>
  </div>
);