// src/components/conferences/searchSection/LocationSelector.tsx
import React, { ChangeEvent } from 'react';
import { MapPin } from 'lucide-react';

interface LocationSelectorProps {
  selectedLocation: string | null;
  filteredLocations: string[];
  isDropdownOpen: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
  onLocationClick: (location: string) => void;
  onLocationSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
  toggleDropdown: () => void;
  t: (key: string) => string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation, filteredLocations, isDropdownOpen, dropdownRef,
  onLocationClick, onLocationSearchChange, toggleDropdown, t
}) => {
  return (
    <div className="xl:relative" ref={dropdownRef}>
      <button className="flex items-center space-x-2 bg-transparent outline-none" onClick={toggleDropdown}>
        <MapPin className="h-4 w-4" />
        <span className="text-sm">{selectedLocation ? selectedLocation : t('Location')}</span>
      </button>
      {isDropdownOpen && (
        <div className="absolute left-4 right-4 z-10 mt-2 rounded-md bg-white-pure shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none xl:left-0 xl:right-auto xl:w-48">
          <div className="max-h-80 overflow-y-scroll py-1" role="menu">
            <input
              type="text"
              placeholder={t('Search_location')}
              className="block w-full bg-white-pure px-4 py-2 text-sm placeholder:text-primary focus:outline-none"
              onChange={onLocationSearchChange}
              onClick={e => e.stopPropagation()}
            />
            <button onClick={() => onLocationClick('')} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90">{t('All_Locations')}</button>
            {[...new Set(filteredLocations)].map(location => (
              <button key={location} onClick={() => onLocationClick(location)} className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-10 hover:text-gray-90">{location}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};