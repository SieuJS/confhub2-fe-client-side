// src/app/[locale]/addconference/inputs/LocationSelector.tsx
'use client'

import React from 'react'
import { useLocationData } from '@/src/hooks/addConference/useLocationData'
import { ConferenceDetailsStepProps } from '../steps/ConferenceDetailsStep'
import AddressInput from './AddressInput'
import ContinentSelect from './ContinentSelect'
import CountrySelect from './CountrySelect'
import StateCitySelect from './StateCitySelect'

interface LocationSelectorProps extends ConferenceDetailsStepProps {
  isRequired: boolean
}

const continentOptions = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania']

const LocationSelector: React.FC<LocationSelectorProps> = props => {
  const {
    formData,
    errors,
    touchedFields, // Nhận touchedFields
    handlers, // Nhận handlers
    t,
    cscApiKey,
    setStatesForReview,
    setCitiesForReview,
    isRequired
  } = props

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
    handleCityChange
  } = useLocationData({
    location: formData.location,
    onLocationChange: handlers.handleLocationChange, // Sử dụng handler từ object handlers
    cscApiKey,
    setStatesForReview,
    setCitiesForReview
  })

  return (
    <div className='sm:col-span-6'>
      <label className='mb-2 block text-sm font-medium '>
        {isRequired && <span className='text-red-500'>* </span>}
        {t('Location')}
      </label>
      <div className='mt-2 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4'>
        <AddressInput
          address={formData.location?.address}
          onAddressChange={value =>
            handlers.handleLocationChange('address', value)
          }
          onBlur={() => handlers.handleBlur('location.address')} // Truyền onBlur
          isTouched={touchedFields.has('location.address')} // Truyền isTouched
          t={t}
          required={isRequired}
          error={errors['location.address']}
        />

        <ContinentSelect
          selectedContinent={internalSelectedContinent}
          onContinentChange={handleContinentChange}
          onBlur={() => handlers.handleBlur('location.continent')} // Truyền onBlur
          isTouched={touchedFields.has('location.continent')} // Truyền isTouched
          continentOptions={continentOptions}
          t={t}
          required={isRequired}
          error={errors['location.continent']}
        />

        <CountrySelect
          selectedCountry={internalSelectedCountry}
          onCountryChange={handleCountryChange}
          onBlur={() => handlers.handleBlur('location.country')} // Truyền onBlur
          isTouched={touchedFields.has('location.country')} // Truyền isTouched
          countries={filteredCountries}
          t={t}
          required={isRequired}
          error={errors['location.country']}
        />

        <StateCitySelect
          selectedState={internalSelectedState}
          selectedCity={internalSelectedCity}
          onStateChange={handleStateChange}
          onCityChange={handleCityChange}
          // Coi việc blur ở State hoặc City là blur của cả cụm
          onStateBlur={() => handlers.handleBlur('location.cityStateProvince')}
          onCityBlur={() => handlers.handleBlur('location.cityStateProvince')}
          // isTouched cho cả cụm
          isTouched={touchedFields.has('location.cityStateProvince')}
          states={states}
          cities={cities}
          t={t}
          required={isRequired}
          error={errors['location.cityStateProvince']}
        />
      </div>
    </div>
  )
}

export default LocationSelector
