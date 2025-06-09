// src/app/[locale]/addconference/inputs/ContinentSelect.tsx
import React from 'react';
import clsx from 'clsx';
import { Globe } from 'lucide-react'; // Import icon

interface ContinentSelectProps {
  selectedContinent: string;
  onContinentChange: (value: string) => void;
  continentOptions: string[];
  t: (key: string) => string;
  required: boolean;
  error?: string | null;
}

const ContinentSelect: React.FC<ContinentSelectProps> = ({
  selectedContinent,
  onContinentChange,
  continentOptions,
  t,
  required,
  error,
}) => {
  return (
    <div>
      <label htmlFor="continent" className="block text-sm font-medium text-gray-700">
        <div className="flex items-center"> {/* Flex container cho icon và label text */}
          <Globe className="h-4 w-4 mr-2 text-gray-500" /> {/* Icon */}
          {required && <span className="text-red-500">* </span>}
          {t('Continent')}:
        </div>
      </label>
      <select
        id="continent"
        name="continent"
        className={clsx(
          'p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500',
          error ? 'border-red-500' : 'border-gray-300'
        )}
        value={selectedContinent}
        onChange={e => onContinentChange(e.target.value)}
        title={t('Select_the_continent_where_the_conference_is_located')}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? 'continent-error' : undefined}
      >
        <option value="">{t('Select_Continent')}</option>
        {continentOptions.map(continent => (
          <option key={continent} value={continent}>
            {continent}
          </option>
        ))}
      </select>
      {error && (
        <p id="continent-error" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default ContinentSelect;