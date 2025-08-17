// src/components/conferences/searchSection/TypeSelector.tsx
import React from 'react';
import { Menu } from 'lucide-react';
import { ConferenceType } from '@/src/hooks/conferences/search/searchForm.utils';

interface TypeSelectorProps {
  selectedType: ConferenceType | null;
  filteredTypes: ReadonlyArray<ConferenceType>;
  isDropdownOpen: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
  onTypeClick: (type: string) => void;
  toggleDropdown: () => void;
  t: (key: string) => string;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  selectedType, filteredTypes, isDropdownOpen, dropdownRef, onTypeClick, toggleDropdown, t
}) => {
  return (
    <div className="xl:relative" ref={dropdownRef}>
      <button className="flex items-center space-x-2 bg-transparent outline-none" onClick={toggleDropdown}>
        <Menu className="h-4 w-4" />
        <span className="text-sm">{selectedType ? selectedType : t('Type')}</span>
      </button>
      {isDropdownOpen && (
        <div className="absolute left-4 right-4 z-10 mt-2 rounded-md bg-white-pure shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none xl:left-0 xl:right-auto xl:w-28">
          <div className="py-1" role="menu">
            <button onClick={() => onTypeClick('')} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90">{t('All_Types')}</button>
            {filteredTypes.map(type => (
              <button key={type} onClick={() => onTypeClick(type)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90">{type}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};