// src/app/[locale]/addconference/inputs/CountrySelect.tsx
import React from 'react';
import clsx from 'clsx';
import { Map } from 'lucide-react';
import { Country } from '@/src/models/send/addConference.send';

interface CountrySelectProps {
  selectedCountry: string;
  onCountryChange: (value: string) => void;
  onBlur: () => void; // Thêm
  isTouched: boolean; // Thêm
  countries: Country[];
  t: (key: string) => string;
  required: boolean;
  error?: string | null;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  selectedCountry,
  onCountryChange,
  onBlur,
  isTouched,
  countries,
  t,
  required,
  error,
}) => {
  const showError = !!error && isTouched;

  return (
    <div>
      <label htmlFor="country" className="block text-sm font-medium text-gray-700">
        <div className="flex items-center">
          <Map className="h-4 w-4 mr-2 text-gray-500" />
          {required && <span className="text-red-500">* </span>}
          {t('Country')}:
        </div>
      </label>
      <select
        id="country"
        className={clsx(
          'p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500',
          showError ? 'border-red-500' : 'border-gray-300'
        )}
        value={selectedCountry}
        onChange={e => onCountryChange(e.target.value)}
        onBlur={onBlur} // Gắn onBlur
        title={t('Select_the_country_where_the_conference_is_located')}
        required={required}
        disabled={countries.length === 0}
        aria-invalid={showError}
        aria-describedby={showError ? 'country-error' : undefined}
      >
        <option value="">{t('Select_Country')}</option>
        {countries.map(country => (
          <option key={country.iso2} value={country.iso2}>
            {country.name}
          </option>
        ))}
      </select>
      {showError && (
        <p id="country-error" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default CountrySelect;