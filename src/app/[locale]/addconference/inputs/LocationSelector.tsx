// src/app/[locale]/addconference/inputs/LocationSelector.tsx
'use client';

import React from 'react';
// Bỏ State, City import nếu không dùng trực tiếp ở đây, chúng được dùng trong hook
// import { State, City } from '@/src/models/send/addConference.send';
import { useLocationData } from '@/src/hooks/addConference/useLocationData';
import { ConferenceDetailsStepProps } from '../steps/ConferenceDetailsStep';
import AddressInput from './AddressInput';
import ContinentSelect from './ContinentSelect';
import CountrySelect from './CountrySelect';
import StateCitySelect from './StateCitySelect';

interface LocationSelectorProps extends ConferenceDetailsStepProps {
  isRequired: boolean;
}

// Đảm bảo các giá trị này khớp với 'region' trong countries.json
const continentOptions = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania'];

const LocationSelector: React.FC<LocationSelectorProps> = (props) => {
  const {
    formData,
    errors,
    onLocationChange, // Handler này phải cập nhật formData.location ở component cha một cách chính xác
    t,
    cscApiKey,
    setStatesForReview,
    setCitiesForReview,
    isRequired,
  } = props;

  const {
    states,
    cities,
    filteredCountries,
    internalSelectedContinent,
    internalSelectedCountry,
    internalSelectedState,
    internalSelectedCity,
    handleContinentChange,
    handleCountryChange,
    handleStateChange,
    handleCityChange,
  } = useLocationData({
    location: formData.location, // Truyền location hiện tại từ formData
    onLocationChange,           // Truyền handler để hook có thể gọi cập nhật formData cha
    cscApiKey,
    setStatesForReview,
    setCitiesForReview,
  });

  return (
    <div className="sm:col-span-6">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {isRequired && <span className="text-red-500">* </span>}
        {t('Location')}
      </label>
      <div className="mt-2 grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
        <AddressInput
          address={formData.location.address}
          onAddressChange={value => onLocationChange('address', value)}
          t={t}
          required={isRequired}
          error={errors['location.address']}
        />

        <ContinentSelect
          selectedContinent={internalSelectedContinent} // Sử dụng state nội bộ từ hook
          onContinentChange={handleContinentChange}
          continentOptions={continentOptions}
          t={t}
          required={isRequired}
          error={errors['location.continent']}
        />

        <CountrySelect
          selectedCountry={internalSelectedCountry} // Sử dụng state nội bộ từ hook
          onCountryChange={handleCountryChange}
          countries={filteredCountries}
          t={t}
          required={isRequired}
          error={errors['location.country']}
        />

        <StateCitySelect
          selectedState={internalSelectedState} // Sử dụng state nội bộ từ hook
          selectedCity={internalSelectedCity}   // Sử dụng state nội bộ từ hook
          onStateChange={handleStateChange}
          onCityChange={handleCityChange}
          states={states}
          cities={cities}
          t={t}
          required={isRequired}
          // Lỗi cho cityStateProvince có thể áp dụng cho cả State và City tùy thuộc vào logic
          // Nếu bạn muốn tách lỗi riêng cho state và city, bạn cần thêm trường lỗi riêng.
          error={errors['location.cityStateProvince']}
        />
      </div>
    </div>
  );
};

export default LocationSelector;