// src/components/conferences/searchSection/KeywordSearchInput.tsx
import React, { ChangeEvent, KeyboardEvent } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { SearchFieldType } from '@/src/hooks/conferences/search/searchForm.utils';

interface KeywordSearchInputProps {
  keyword: string;
  searchType: SearchFieldType;
  isDropdownOpen: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
  onKeywordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (event: KeyboardEvent<HTMLInputElement>) => void;
  onSearchTypeChange: (type: SearchFieldType) => void;
  toggleDropdown: () => void;
  t: (key: string) => string;
}

export const KeywordSearchInput: React.FC<KeywordSearchInputProps> = ({
  keyword, searchType, isDropdownOpen, dropdownRef,
  onKeywordChange, onKeyPress, onSearchTypeChange, toggleDropdown, t
}) => {
  return (
    <div className="flex w-40 flex-grow basis-full items-center xl:max-w-[500px] xl:basis-auto" ref={dropdownRef}>
      <Search className="mr-1 h-5 w-5" />
      <input
        type="text"
        placeholder={t('Type_a_command_or_search')}
        className="w-full bg-transparent text-sm outline-none placeholder:text-primary"
        value={keyword}
        onChange={onKeywordChange}
        onKeyDown={onKeyPress}
      />
      <div className="relative px-5">
        <button
          className="flex items-center space-x-2 bg-transparent outline-none"
          onClick={toggleDropdown}
          title="Select search type"
        >
          <span className="text-sm">
            {searchType === 'keyword' ? t('Keyword') : searchType === 'title' ? t('Title') : t('Acronym')}
          </span>
          <ChevronDown className="ml-1 inline-block h-4 w-4" />
        </button>
        {isDropdownOpen && (
          <div className="absolute left-0 z-10 mt-2 w-32 rounded-md bg-white-pure shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1" role="menu">
              <button onClick={() => onSearchTypeChange('keyword')} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90">{t('Keyword')}</button>
              <button onClick={() => onSearchTypeChange('title')} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90">{t('Title')}</button>
              <button onClick={() => onSearchTypeChange('acronym')} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90">{t('Acronym')}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};