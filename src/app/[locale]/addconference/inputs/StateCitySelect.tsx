// src/app/[locale]/addconference/inputs/StateCitySelect.tsx
import React from 'react';
import clsx from 'clsx';
import { Building } from 'lucide-react'; // Import icon
import { State, City } from '@/src/models/send/addConference.send';

interface StateCitySelectProps {
  selectedState: string; // iso2
  selectedCity: string; // name
  onStateChange: (value: string) => void;
  onCityChange: (value: string) => void;
  states: State[];
  cities: City[];
  t: (key: string) => string;
  required: boolean;
  error?: string | null;
}

const StateCitySelect: React.FC<StateCitySelectProps> = ({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  states,
  cities,
  t,
  required,
  error,
}) => {
  const hasStates = states.length > 0;
  const hasCities = cities.length > 0;
  const isDisabled = !hasStates && !hasCities;

  const label = hasStates ? t('State_Province') : t('City');
  const value = hasStates ? selectedState : selectedCity;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (hasStates) {
      onStateChange(e.target.value);
    } else {
      onCityChange(e.target.value);
    }
  };

  return (
    <div>
      <label htmlFor="stateOrCity" className="block text-sm font-medium text-gray-700">
        <div className="flex items-center"> {/* Flex container cho icon và label text */}
          <Building className="h-4 w-4 mr-2 text-gray-500" /> {/* Icon */}
          {label}:
        </div>
      </label>
      <select
        id="stateOrCity"
        className={clsx(
          'p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500',
          error ? 'border-red-500' : 'border-gray-300'
        )}
        value={value}
        onChange={handleChange}
        required={required}
        title={t('Select_the_state_province_or_city_where_the_conference_is_located')}
        disabled={isDisabled}
        aria-invalid={!!error}
        aria-describedby={error ? 'statecity-error' : undefined}
      >
        <option value="">
          {t('Select')} {label}
        </option>
        {hasStates
          ? states.map(state => (
              <option key={state.iso2} value={state.iso2}>
                {state.name}
              </option>
            ))
          : cities.map(city => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
      </select>
      {error && (
        <p id="statecity-error" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default StateCitySelect;