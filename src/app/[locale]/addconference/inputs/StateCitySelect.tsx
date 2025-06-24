// src/app/[locale]/addconference/inputs/StateCitySelect.tsx
import React from 'react'
import clsx from 'clsx'
import { Building } from 'lucide-react'
import { State, City } from '@/src/models/send/addConference.send'

interface StateCitySelectProps {
  selectedState: string
  selectedCity: string
  onStateChange: (value: string) => void
  onCityChange: (value: string) => void
  onStateBlur: () => void // Thêm onStateBlur
  onCityBlur: () => void // Thêm onCityBlur
  isTouched: boolean // Thêm
  states: State[]
  cities: City[]
  t: (key: string) => string
  required: boolean
  error?: string | null
}

const StateCitySelect: React.FC<StateCitySelectProps> = ({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  onStateBlur,
  onCityBlur,
  isTouched,
  states,
  cities,
  t,
  required,
  error
}) => {
  const hasStates = states.length > 0
  const hasCities = cities.length > 0
  const isDisabled = !hasStates && !hasCities
  const showError = !!error && isTouched

  const label = hasStates ? t('State_Province') : t('City')
  const value = hasStates ? selectedState : selectedCity

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (hasStates) {
      onStateChange(e.target.value)
    } else {
      onCityChange(e.target.value)
    }
  }

  const handleBlur = () => {
    if (hasStates) {
      onStateBlur()
    } else {
      onCityBlur()
    }
  }

  return (
    <div>
      <label htmlFor='stateOrCity' className='block text-sm font-medium '>
        <div className='flex items-center'>
          <Building className='mr-2 h-4 w-4 ' />
          {/* Label này không có dấu * vì nó phụ thuộc vào Country */}
          {label}:
        </div>
      </label>
      <select
        id='stateOrCity'
        className={clsx(
          'mt-1 block w-full rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
          showError ? 'border-red-500' : 'border-gray-300'
        )}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur} // Gắn onBlur
        required={required}
        title={t(
          'Select_the_state_province_or_city_where_the_conference_is_located'
        )}
        disabled={isDisabled}
        aria-invalid={showError}
        aria-describedby={showError ? 'statecity-error' : undefined}
      >
        <option value=''>
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
      {showError && (
        <p id='statecity-error' className='mt-1 text-sm text-red-600'>
          {error}
        </p>
      )}
    </div>
  )
}

export default StateCitySelect
