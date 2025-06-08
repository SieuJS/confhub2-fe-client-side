// src/app/[locale]/addconference/components/inputs/LocationSelector.tsx
'use client'

import React, { useState, useEffect } from 'react'
import countryData from '../countries.json'
import {
  LocationInput,
  Country,
  State,
  City
} from '@/src/models/send/addConference.send'

interface LocationSelectorProps {
  type: 'Offline' | 'Online' | 'Hybrid'
  location: LocationInput

  // FIX: Change the type of setLocation to be more accurate
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

  // Internal states to drive select inputs and API calls,
  // initialized from the 'location' prop for persistence
  const [internalSelectedContinent, setInternalSelectedContinent] = useState(
    location.continent || ''
  )
  const [internalSelectedCountry, setInternalSelectedCountry] = useState('') // ISO2 code
  const [internalSelectedState, setInternalSelectedState] = useState('') // ISO2 code
  const [internalSelectedCity, setInternalSelectedCity] = useState('') // City name

  // Options for continent dropdown
  const continentOptions = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania']

  // 1. Load initial countries data from JSON
  useEffect(() => {
    const mappedCountries: Country[] = countryData.map((c: any) => ({
      name: c.name,
      iso2: c.iso2,
      region: c.region
    }))
    setCountries(mappedCountries)
  }, [])

  // 2. Filter countries based on internalSelectedContinent
  const filteredCountries = internalSelectedContinent
    ? countries.filter(country => country.region === internalSelectedContinent)
    : []

  // 3. Sync internalSelectedContinent with location.continent from parent
  useEffect(() => {
    if (
      location.continent &&
      location.continent !== internalSelectedContinent
    ) {
      setInternalSelectedContinent(location.continent)
    } else if (!location.continent && internalSelectedContinent) {
      setInternalSelectedContinent('')
    }
  }, [location.continent, internalSelectedContinent])

  // 4. Sync internalSelectedCountry (ISO2) with location.country (Name)
  // This effect runs when location.country (from parent) or the full countries list changes
  useEffect(() => {
    if (countries.length > 0 && location.country) {
      const matchedCountry = countries.find(c => c.name === location.country)
      if (matchedCountry && matchedCountry.iso2 !== internalSelectedCountry) {
        setInternalSelectedCountry(matchedCountry.iso2)
      } else if (!matchedCountry && internalSelectedCountry) {
        // If parent's country name doesn't match any loaded country, clear internal
        setInternalSelectedCountry('')
      }
    } else if (!location.country && internalSelectedCountry) {
      // If parent's country prop is empty, clear internal
      setInternalSelectedCountry('')
    }
  }, [location.country, countries, internalSelectedCountry])

  // 5. Fetch states/cities based on internalSelectedCountry
  useEffect(() => {
    const fetchStatesOrCities = async () => {
      if (!internalSelectedCountry) {
        setStates([])
        setCities([])
        setStatesForReview([])
        setCitiesForReview([])
        return
      }

      try {
        const statesResponse = await fetch(
          `https://api.countrystatecity.in/v1/countries/${internalSelectedCountry}/states`,
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
          setStatesForReview(mappedStates)
          setCities([])
          setCitiesForReview([])
        } else {
          setStates([])
          setStatesForReview([])
          const citiesResponse = await fetch(
            `https://api.countrystatecity.in/v1/countries/${internalSelectedCountry}/cities`,
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
          setCitiesForReview(uniqueCities as City[])
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
  }, [
    internalSelectedCountry,
    cscApiKey,
    setStatesForReview,
    setCitiesForReview
  ])

  // 6. Sync internalSelectedState/City with location.cityStateProvince
  // This is crucial for persistence as location.cityStateProvince can be either a state or city name
  useEffect(() => {
    if (location.cityStateProvince) {
      if (states.length > 0) {
        // If states are available, try to match as a state
        const foundState = states.find(
          s => s.name === location.cityStateProvince
        )
        if (foundState && foundState.iso2 !== internalSelectedState) {
          setInternalSelectedState(foundState.iso2)
          setInternalSelectedCity('') // Clear city if it's a state
        } else if (!foundState && internalSelectedState) {
          // If prop exists but doesn't match current states
          setInternalSelectedState('') // Clear if not found in current states
        }
      }
      if (cities.length > 0) {
        // If cities are available, try to match as a city
        const foundCity = cities.find(
          c => c.name === location.cityStateProvince
        )
        if (foundCity && foundCity.name !== internalSelectedCity) {
          setInternalSelectedCity(foundCity.name)
          setInternalSelectedState('') // Clear state if it's a city
        } else if (!foundCity && internalSelectedCity) {
          // If prop exists but doesn't match current cities
          setInternalSelectedCity('') // Clear if not found in current cities
        }
      }
    } else {
      // If location.cityStateProvince is empty, clear both internal selections
      setInternalSelectedState('')
      setInternalSelectedCity('')
    }
  }, [
    location.cityStateProvince,
    states,
    cities,
    internalSelectedState,
    internalSelectedCity
  ])

  // Handlers for user interaction (these update both the parent's location prop AND internal states)
  const handleLocationChange = (field: keyof LocationInput, value: string) => {
    setLocation(prevLocation => ({
      ...prevLocation,
      [field]: value
    }))
  }

  const handleContinentChange = (continent: string) => {
    setInternalSelectedContinent(continent) // Update internal state
    handleLocationChange('continent', continent)
    handleLocationChange('country', '') // Clear dependent fields in parent
    handleLocationChange('cityStateProvince', '') // Clear dependent fields in parent
    // Also clear internal states of dependents immediately for cleaner UI reset
    setInternalSelectedCountry('')
    setInternalSelectedState('')
    setInternalSelectedCity('')
  }

  const handleCountryChange = (countryIso2: string) => {
    setInternalSelectedCountry(countryIso2) // Update internal state
    const countryName =
      filteredCountries.find(c => c.iso2 === countryIso2)?.name || ''
    handleLocationChange('country', countryName)
    handleLocationChange('cityStateProvince', '') // Clear dependent field in parent
    setInternalSelectedState('') // Clear internal states of dependents immediately
    setInternalSelectedCity('')
  }

  const handleStateChange = (stateIso2: string) => {
    setInternalSelectedState(stateIso2) // Update internal state
    handleLocationChange(
      'cityStateProvince',
      states.find(s => s.iso2 === stateIso2)?.name || ''
    )
  }

  const handleCityChange = (cityName: string) => {
    setInternalSelectedCity(cityName) // Update internal state
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
            value={location.address} // Bound directly to prop.location.address
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
            value={internalSelectedContinent} // Bound to internal state
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
            value={internalSelectedCountry} // Bound to internal state (ISO2)
            onChange={e => handleCountryChange(e.target.value)}
            title={t('Select_the_country_where_the_conference_is_located')}
            required={type === 'Offline' || type === 'Hybrid'}
            disabled={type === 'Online' || !internalSelectedContinent}
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
            value={
              states.length > 0 ? internalSelectedState : internalSelectedCity
            } // Bound to internal state
            onChange={e =>
              states.length > 0
                ? handleStateChange(e.target.value)
                : handleCityChange(e.target.value)
            }
            required={type === 'Offline' || type === 'Hybrid'}
            title={t(
              'Select_the_state_province_or_city_where_the_conference_is_located'
            )}
            disabled={type === 'Online' || !internalSelectedCountry}
          >
            <option value=''>
              {t('Select')}{' '}
              {cities.length > 0 ? `${t('City')}` : `${t('State_Province')}`}
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
