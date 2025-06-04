// src/app/[locale]/addconference/components/inputs/LocationSelector.tsx
'use client'

import React, { useState, useEffect } from 'react'
import countryData from '../countries.json' // Import countries.json từ thư mục cha
import {
  LocationInput,
  Country,
  State,
  City
} from '@/src/models/send/addConference.send'

interface LocationSelectorProps {
  type: 'Offline' | 'Online' | 'Hybrid'
  location: LocationInput
  setLocation: React.Dispatch<React.SetStateAction<LocationInput>>
  t: (key: string) => string
  cscApiKey: string
  setStatesForReview: React.Dispatch<React.SetStateAction<State[]>>
  setCitiesForReview: React.Dispatch<React.SetStateAction<City[]>>
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  type,
  location,
  setLocation,
  t,
  cscApiKey,
  setStatesForReview,
  setCitiesForReview
}) => {
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedContinent, setSelectedContinent] = useState<string>('')
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])

  const continentOptions = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania']

  useEffect(() => {
    const mappedCountries: Country[] = countryData.map((c: any) => ({
      name: c.name,
      iso2: c.iso2,
      region: c.region
    }))
    setCountries(mappedCountries)
  }, [])

  useEffect(() => {
    if (selectedContinent) {
      const newFilteredCountries = countries.filter(
        country => country.region === selectedContinent
      )
      setFilteredCountries(newFilteredCountries)
    } else {
      setFilteredCountries([])
    }
    setSelectedCountry('')
    setSelectedState('')
    setSelectedCity('')
    setLocation((prevLocation: LocationInput) => ({
      ...prevLocation,
      country: '',
      cityStateProvince: '',
      continent: selectedContinent
    }))
    setStatesForReview([]) // Reset states for review
    setCitiesForReview([]) // Reset cities for review
  }, [
    selectedContinent,
    countries,
    setLocation,
    setStatesForReview,
    setCitiesForReview
  ])

  useEffect(() => {
    const fetchStatesOrCities = async () => {
      if (!selectedCountry) {
        setStates([])
        setCities([])
        setStatesForReview([])
        setCitiesForReview([])
        return
      }

      try {
        const statesResponse = await fetch(
          `https://api.countrystatecity.in/v1/countries/${selectedCountry}/states`,
          {
            headers: {
              'X-CSCAPI-KEY': cscApiKey
            }
          }
        )

        if (!statesResponse.ok) {
          throw new Error(`State API Error: ${statesResponse.status}`)
        }

        const statesData = await statesResponse.json()
        if (statesData.length > 0) {
          const mappedStates = statesData
            .map((s: any) => ({
              name: s.name,
              iso2: s.iso2,
              country_code: s.country_code,
              state_code: s.state_code
            }))
            .sort((a: { name: string }, b: { name: any }) =>
              a.name.localeCompare(b.name)
            )
          setStates(mappedStates)
          setStatesForReview(mappedStates) // Cập nhật cho review
          setCities([])
          setCitiesForReview([]) // Reset cho review
        } else {
          setStates([])
          setStatesForReview([]) // Reset cho review
          const citiesResponse = await fetch(
            `https://api.countrystatecity.in/v1/countries/${selectedCountry}/cities`,
            {
              headers: {
                'X-CSCAPI-KEY': cscApiKey
              }
            }
          )

          if (!citiesResponse.ok) {
            throw new Error(`City API Error: ${citiesResponse.status}`)
          }

          const citiesData = await citiesResponse.json()
          const mappedCities = citiesData.map((c: any) => ({
            name: c.name,
            country_code: c.country_code,
            state_code: c.state_code,
            latitude: c.latitude,
            longitude: c.longitude
          }))
          const uniqueCities = Array.from(
            new Set(mappedCities.map((city: { name: any }) => city.name))
          )
            .map(name => {
              return mappedCities.find(
                (city: { name: unknown }) => city.name === name
              )
            })
            .sort((a: { name: string }, b: { name: any }) =>
              a.name.localeCompare(b.name)
            )
          setCities(uniqueCities as City[])
          setCitiesForReview(uniqueCities as City[]) // Cập nhật cho review
        }
      } catch (error) {
        console.error('Error fetching states or cities:', error)
        setStates([])
        setCities([])
        setStatesForReview([])
        setCitiesForReview([])
      }
    }

    fetchStatesOrCities()
  }, [selectedCountry, cscApiKey, setStatesForReview, setCitiesForReview])

  const handleLocationChange = (field: keyof LocationInput, value: string) => {
    setLocation((prevLocation: LocationInput) => ({
      ...prevLocation,
      [field]: value
    }))
  }

  const handleContinentChange = (continent: string) => {
    setSelectedContinent(continent)
  }

  const handleCountryChange = (countryIso2: string) => {
    setSelectedCountry(countryIso2)
    setSelectedState('')
    setSelectedCity('')
    handleLocationChange(
      'country',
      filteredCountries.find(c => c.iso2 === countryIso2)?.name || ''
    )
    handleLocationChange('cityStateProvince', '') // Reset cityStateProvince when country changes
  }

  const handleStateChange = (stateIso2: string) => {
    setSelectedState(stateIso2)
    handleLocationChange(
      'cityStateProvince',
      states.find(s => s.iso2 === stateIso2)?.name || ''
    )
  }

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName)
    handleLocationChange('cityStateProvince', cityName)
  }

  return (
    <div className='sm:col-span-2'>
      <label className='block text-base  '>* {t('Location')}:</label>
      <div className='grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 md:grid-cols-4'>
        <div>
          <label htmlFor='address' className='block text-sm  '>
            {t('Address')}:
          </label>
          <input
            type='text'
            id='address'
            className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            value={location.address}
            onChange={e => handleLocationChange('address', e.target.value)}
            title={t('Enter_the_address_of_the_conference')}
            required={type === 'Offline' || type === 'Hybrid'}
          />
        </div>
        <div>
          <label htmlFor='continent' className='block text-sm'>
            {t('Continent')}:
          </label>
          <select
            id='continent'
            className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            value={selectedContinent}
            onChange={e => handleContinentChange(e.target.value)}
            title={t('Select_the_continent_where_the_conference_is_located')}
            required={type === 'Offline' || type === 'Hybrid'}
            disabled={type === 'Online'}
          >
            <option value=''>{t('Select_Continent')}</option>
            {continentOptions.map(continent => (
              <option key={continent} value={continent}>
                {continent}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor='country' className='block text-sm'>
            {t('Country')}:
          </label>
          <select
            id='country'
            className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            value={selectedCountry}
            onChange={e => handleCountryChange(e.target.value)}
            title={t('Select_the_country_where_the_conference_is_located')}
            required={type === 'Offline' || type === 'Hybrid'}
            disabled={type === 'Online' || !selectedContinent}
          >
            <option value=''>{t('Select_Country')}</option>
            {filteredCountries.map(country => (
              <option key={country.iso2} value={country.iso2}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor='stateOrCity' className='block text-sm'>
            {cities.length > 0 ? `${t('City')}:` : `${t('State_Province')}:`}
          </label>
          <select
            id='stateOrCity'
            className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            value={states.length > 0 ? selectedState : selectedCity}
            onChange={e =>
              states.length > 0
                ? handleStateChange(e.target.value)
                : handleCityChange(e.target.value)
            }
            required={type === 'Offline' || type === 'Hybrid'}
            title={t(
              'Select_the_state_province_or_city_where_the_conference_is_located'
            )}
            disabled={type === 'Online' || !selectedCountry}
          >
            <option value=''>
              {t('Select')}{' '}
              {cities.length > 0
                ? `${t('City')}` // Simpler label
                : `${t('State_Province')}`}
            </option>
            {states.length > 0
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
        </div>
      </div>
    </div>
  )
}

export default LocationSelector
