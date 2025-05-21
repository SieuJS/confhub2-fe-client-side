// src/components/ConferenceForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import countryData from '../addconference/countries.json'
import { useTranslations } from 'next-intl'
import {
  LocationInput,
  ImportantDateInput,
  City,
  State,
  Country,
  ConferenceFormData
} from '@/src/models/send/addConference.send'
import { appConfig } from '@/src/middleware'

const API_ADD_CONFERENCE_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference/add`
const CSC_API_KEY = process.env.NEXT_PUBLIC_CSC_API_KEY

const ConferenceForm: React.FC = () => {
  const t = useTranslations('')
  const router = useRouter()
  const pathname = usePathname()

  const [currentStep, setCurrentStep] = useState(1)
  const [title, setTitle] = useState('')
  const [acronym, setAcronym] = useState('')
  const [link, setLink] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState('')
  const [type, setType] = useState<'Offline' | 'Online' | 'Hybrid'>('Offline')
  const [location, setLocation] = useState<LocationInput>({
    address: '',
    cityStateProvince: '',
    country: '',
    continent: ''
  })
  const [dates, setDates] = useState<ImportantDateInput[]>([
    {
      type: 'conferenceDates',
      name: 'Conference Date',
      fromDate: '',
      toDate: ''
    }
  ])
  const [imageUrl, setImageUrl] = useState('')
  const [description, setDescription] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // --- Location States ---
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedState, setSelectedState] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedContinent, setSelectedContinent] = useState<string>('')
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])

  const continentOptions = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania']
  const dateTypeOptions = [
    { value: 'submissionDate', name: t('Submission_Date') },
    { value: 'conferenceDates', name: t('Conference_Dates') },
    { value: 'registrationDate', name: t('Registration_Date') },
    { value: 'notificationDate', name: t('Notification_Date') },
    { value: 'cameraReadyDate', name: t('Camera_Ready_Date') }
  ]

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
    setLocation(prevLocation => ({
      ...prevLocation,
      country: '',
      cityStateProvince: '',
      continent: selectedContinent
    }))
  }, [selectedContinent, countries])

  useEffect(() => {
    const fetchStatesOrCities = async () => {
      if (!selectedCountry) {
        setStates([])
        setCities([])
        return
      }

      try {
        const statesResponse = await fetch(
          `https://api.countrystatecity.in/v1/countries/${selectedCountry}/states`,
          {
            headers: {
              'X-CSCAPI-KEY': CSC_API_KEY || ''
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
          setCities([])
        } else {
          setStates([])
          const citiesResponse = await fetch(
            `https://api.countrystatecity.in/v1/countries/${selectedCountry}/cities`,
            {
              headers: {
                'X-CSCAPI-KEY': CSC_API_KEY || ''
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
        }
      } catch (error) {
        console.error('Error fetching states or cities:', error)
        setStates([])
        setCities([])
      }
    }

    fetchStatesOrCities()
  }, [selectedCountry])

  const handleContinentChange = (continent: string) => {
    setSelectedContinent(continent)
  }

  const handleCountryChange = (countryIso2: string) => {
    setSelectedCountry(countryIso2)
    setSelectedState('')
    setSelectedCity('')
    setLocation(prevLocation => ({
      ...prevLocation,
      country: filteredCountries.find(c => c.iso2 === countryIso2)?.name || '',
      cityStateProvince: ''
    }))
  }

  const handleStateChange = (stateIso2: string) => {
    setSelectedState(stateIso2)
    setLocation(prevLocation => ({
      ...prevLocation,
      cityStateProvince: states.find(s => s.iso2 === stateIso2)?.name || ''
    }))
  }

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName)
    setLocation(prevLocation => ({
      ...prevLocation,
      cityStateProvince: cityName
    }))
  }
  const handleAddTopic = () => {
    if (newTopic.trim() !== '') {
      setTopics([...topics, newTopic.trim()])
      setNewTopic('')
    }
  }

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove))
  }

  const handleDateChange = (
    index: number,
    field: keyof ImportantDateInput,
    value: string
  ) => {
    const newDates = [...dates]
    const updatedDateEntry = { ...newDates[index] } // Create a mutable copy

    // Apply the change to the copied entry
    ;(updatedDateEntry as any)[field] = value

    // Perform validations using the potentially updated values in updatedDateEntry
    const fromDateStr = updatedDateEntry.fromDate
    const toDateStr = updatedDateEntry.toDate

    // Check date consistency only if both dates are present
    if (
      (field === 'fromDate' || field === 'toDate') &&
      fromDateStr &&
      toDateStr
    ) {
      const fromDateObj = new Date(fromDateStr)
      const toDateObj = new Date(toDateStr)

      if (toDateObj < fromDateObj) {
        if (field === 'toDate') {
          alert(t('End_date_cannot_be_before_start_date'))
        } else {
          // field === 'fromDate'
          alert(t('Start_date_cannot_be_after_end_date_please_adjust_dates'))
        }
        // The state will be set with this invalid combination,
        // and goToNextStep will perform the strict validation.
        // The alert provides immediate feedback.
      }
    }

    newDates[index] = updatedDateEntry
    setDates(newDates)
  }

  const addDate = () => {
    setDates([...dates, { type: '', name: '', fromDate: '', toDate: '' }])
  }

  const removeDate = (index: number) => {
    if (index !== 0) {
      // Ensure the first date entry (Conference Dates) is not removed
      setDates(dates.filter((_, i) => i !== index))
    }
  }
  const handleLocationChange = (field: keyof LocationInput, value: string) => {
    setLocation(prevLocation => ({
      ...prevLocation,
      [field]: value
    }))
  }

  const goToNextStep = () => {
    if (currentStep === 1) {
      // Basic fields validation
      if (!title.trim()) {
        alert(t('Please_enter_the_conference_name'))
        return
      }
      if (!acronym.trim()) {
        alert(t('Please_enter_the_acronym'))
        return
      }
      if (!link.trim()) {
        // Basic URL validation (can be improved with regex if needed)
        if (!link.startsWith('http://') && !link.startsWith('https://')) {
          alert(t('Please_enter_a_valid_link_starting_with_http_or_https'))
          return
        }
        alert(t('Please_enter_the_conference_link')) // This might be redundant if the above catches it.
        // Or, this is for empty link.
        return
      }
      if (!type) {
        alert(t('Please_select_the_conference_type')) // Should not happen due to default
        return
      }

      // Location fields (conditionally required based on type)
      if (type === 'Offline' || type === 'Hybrid') {
        if (!location.address.trim()) {
          alert(t('Please_enter_the_address'))
          return
        }
        if (!location.continent) {
          alert(t('Please_select_the_continent'))
          return
        }
        if (!location.country) {
          alert(t('Please_select_the_country'))
          return
        }
        if (!location.cityStateProvince) {
          alert(t('Please_select_the_city_state_province'))
          return
        }
      }

      // Dates validation
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i]
        const dateIdentifier = date.name || `${t('Date_entry')} ${i + 1}`

        // Name and Type are required for dates added by the user (index > 0)
        // The first date entry has fixed name and type and its inputs are disabled.
        if (i > 0) {
          // For user-added dates
          if (!date.name.trim()) {
            alert(t('Please_provide_a_name_for_date_entry', { number: i + 1 }))
            return
          }
          if (!date.type) {
            alert(
              t('Please_select_a_type_for_date_entry', {
                name: date.name || i + 1
              })
            )
            return
          }
        }

        if (!date.fromDate) {
          alert(t('Please_provide_a_start_date_for', { name: dateIdentifier }))
          return
        }
        if (!date.toDate) {
          alert(t('Please_provide_an_end_date_for', { name: dateIdentifier }))
          return
        }

        // Date order validation: End date must be after or same as start date
        if (new Date(date.toDate) < new Date(date.fromDate)) {
          alert(
            t('End_date_cannot_be_before_start_date_for', {
              name: dateIdentifier
            })
          )
          return
        }
      }
      // Topics validation (optional, but if you want to make it required)
      // if (topics.length === 0) {
      //   alert(t('Please_add_at_least_one_topic'));
      //   return;
      // }
    }

    // If all validations pass for the current step
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Final validation check, especially if user could bypass goToNextStep somehow
    // or if some fields are only relevant at the final submission.
    // For now, assuming goToNextStep covers Step 1, and Step 3 has its own check.
    if (currentStep === 1) {
      // If somehow submit is pressed on step 1
      goToNextStep() // Run step 1 validation
      if (
        !title.trim() ||
        !acronym.trim() ||
        !link.trim() ||
        dates.some(
          d =>
            !d.fromDate ||
            !d.toDate ||
            new Date(d.toDate) < new Date(d.fromDate)
        )
      ) {
        // Check if validation failed by re-checking critical fields
        return // Don't proceed if validation would fail
      }
    }

    if (!agreedToTerms) {
      alert(t('Please_agree_to_the_terms_and_conditions'))
      return
    }

    const conferenceData: ConferenceFormData = {
      title,
      acronym,
      link,
      topics,
      type,
      location,
      dates,
      imageUrl,
      description
    }

    const userData = localStorage.getItem('user')
    if (!userData) {
      console.error('User not logged in')
      alert(t('Please_log_in_to_add_new_Conference'))
      return
    }
    const user = JSON.parse(userData)
    const userId = user.id
    console.log('Submitting conferenceData:', conferenceData)
    try {
      const response = await fetch(API_ADD_CONFERENCE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ...conferenceData, userId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${
            errorData.message || 'Unknown error'
          }`
        )
      }

      const addedConference = await response.json()
      console.log('Conference added:', addedConference)

      const localePrefix = pathname.split('/')[1]
      const pathWithLocale = `/${localePrefix}/dashboard?tab=myconferences`

      router.push(pathWithLocale)
    } catch (error: any) {
      console.error('Error adding conference:', error.message)
      alert(`${t('Error_adding_conference')}: ${error.message}`)
    }
  }

  const renderStepOne = () => (
    <>
      {/* Step 1 Form Fields (Content largely unchanged, focus was on logic) */}
      <div className='sm:col-span-2'>
        <label htmlFor='title' className='block text-sm  '>
          * {t('Conference_Name')}:
        </label>
        <input
          type='text'
          id='title'
          className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
          value={title}
          onChange={e => setTitle(e.target.value)}
          title={t('Enter_the_name_of_the_conference')}
          required
        />
      </div>

      <div className='grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-3'>
        <div>
          <label htmlFor='acronym' className='block text-sm  '>
            * {t('Acronym')}:
          </label>
          <input
            type='text'
            id='acronym'
            className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            value={acronym}
            onChange={e => setAcronym(e.target.value)}
            title={t('Enter_the_acronym_of_the_conference')}
            required
          />
        </div>

        <div>
          <label htmlFor='link' className='block text-sm  '>
            * {t('Link')}:
          </label>
          <input
            type='url'
            id='link'
            className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            value={link}
            onChange={e => setLink(e.target.value)}
            title={t('Enter_the_link_of_the_conference')}
            required
          />
        </div>

        <div>
          <label htmlFor='type' className='block text-sm  '>
            * {t('Type')}:
          </label>
          <select
            id='type'
            className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            value={type}
            onChange={e =>
              setType(e.target.value as 'Offline' | 'Online' | 'Hybrid')
            }
            required
          >
            <option value='Offline'>{t('Offline')}</option>
            <option value='Online'>{t('Online')}</option>
            <option value='Hybrid'>{t('Hybrid')}</option>
          </select>
        </div>
      </div>

      <div className='sm:col-span-2'>
        <label className='block text-base  '>* {t('Location')}:</label>
        <div className='grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 md:grid-cols-4'>
          {' '}
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
      <div className='sm:col-span-2'>
        <label className='block text-sm  '>* {t('Important_Dates')}:</label>
        {dates.map((date, index) => (
          <div
            key={index}
            className='mt-1 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-4'
          >
            <div>
              <label htmlFor={`name-${index}`} className='block text-sm  '>
                {t('Name')}:
              </label>
              <input
                type='text'
                id={`name-${index}`}
                value={date.name}
                onChange={e => handleDateChange(index, 'name', e.target.value)}
                className={`mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm
                    ${index === 0 ? 'pointer-events-none bg-gray-100 opacity-70' : ''}`}
                required={index > 0} // Only required for user-added dates
                disabled={index === 0}
              />
            </div>
            <div>
              <label htmlFor={`type-${index}`} className='block text-sm'>
                {t('Type')}:
              </label>
              <select
                id={`type-${index}`}
                value={date.type}
                onChange={e => handleDateChange(index, 'type', e.target.value)}
                className={`mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm ${
                  index === 0
                    ? 'pointer-events-none bg-gray-100 opacity-70'
                    : ''
                }`}
                required={index > 0} // Only required for user-added dates
                disabled={index === 0}
              >
                <option value=''>{t('Select_Type')}</option>
                {dateTypeOptions.map(
                  (
                    opt // Renamed 'type' to 'opt' to avoid conflict
                  ) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.name}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label htmlFor={`fromDate-${index}`} className='block text-sm  '>
                * {t('Start_Date')}:{' '}
                {/* Made label more explicit for required field */}
              </label>
              <input
                type='date'
                id={`fromDate-${index}`}
                value={date.fromDate}
                onChange={e =>
                  handleDateChange(index, 'fromDate', e.target.value)
                }
                className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
                required
                title={t('Select_the_start_date')}
              />
            </div>
            <div className='relative'>
              <label htmlFor={`toDate-${index}`} className='block text-sm  '>
                * {t('End_Date')}:{' '}
                {/* Made label more explicit for required field */}
              </label>
              <input
                type='date'
                id={`toDate-${index}`}
                value={date.toDate}
                onChange={e =>
                  handleDateChange(index, 'toDate', e.target.value)
                }
                min={date.fromDate} // HTML5 validation for end date >= start date
                className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
                required
                title={t('Select_the_end_date')}
              />
              {index !== 0 && (
                <button
                  type='button'
                  onClick={() => removeDate(index)}
                  className='absolute -right-6 top-1/2 mt-2 -translate-y-1/2 text-red-500 hover:text-red-700 focus:outline-none sm:-right-8'
                  aria-label='Remove date'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-5 w-5'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type='button'
          onClick={addDate}
          className='mt-4 rounded bg-button px-4 py-2 text-sm font-bold text-button-text hover:bg-button focus:ring-2 focus:ring-button focus:ring-offset-2 hover:focus:outline-none'
        >
          {t('Add_Date')}
        </button>
      </div>
      <div className='sm:col-span-2'>
        <label htmlFor='newTopic' className='block text-sm  '>
          {t('Topics')}:
        </label>
        <div className='mt-1 flex flex-col sm:flex-row sm:items-center sm:gap-3'>
          <input
            type='text'
            id='newTopic'
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
            className='flex-grow rounded-md border border-button px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            placeholder={t('Add_a_topic')}
          />
          <button
            type='button'
            onClick={handleAddTopic}
            className='mt-2 w-full rounded-md bg-button px-4 py-2 text-sm text-button-text hover:bg-button focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 sm:mt-0 sm:w-auto'
          >
            {t('Add')}
          </button>
        </div>
        <div className='mt-3 flex flex-wrap gap-2'>
          {topics.map((topic, index) => (
            <span
              key={index}
              className='inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold '
            >
              {topic}
              <button
                type='button'
                onClick={() => handleRemoveTopic(topic)}
                className='hover: ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full  hover:bg-gray-300 focus:bg-gray-400 focus:text-white focus:outline-none'
                aria-label={`Remove ${topic}`}
              >
                <svg
                  className='h-2 w-2'
                  stroke='currentColor'
                  fill='none'
                  viewBox='0 0 8 8'
                >
                  <path
                    strokeLinecap='round'
                    strokeWidth='1.5'
                    d='M1 1l6 6m0-6L1 7'
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      </div>
      <div className='sm:col-span-2'>
        <label htmlFor='imageUrl' className='block text-sm  '>
          {t('Image_URL')}:
        </label>
        <input
          type='url'
          id='imageUrl'
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          className='mt-1 block w-full rounded-md border border-button px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
        />
      </div>
      <div className='sm:col-span-2'>
        <label htmlFor='description' className='block text-sm  '>
          {t('Description')}:
        </label>
        <textarea
          id='description'
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          className='mt-1 block w-full rounded-md border border-button px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
        />
      </div>
    </>
  )

  const renderStepTwo = () => (
    <div className='space-y-3 sm:col-span-2'>
      <h2 className='mb-4 text-lg font-semibold sm:text-xl'>
        {t('Review_Information')}
      </h2>
      <p>
        <strong>{t('Conference_Name')}:</strong> {title}
      </p>
      <p>
        <strong>{t('Acronym')}:</strong> {acronym}
      </p>
      <p>
        <strong>{t('Link')}:</strong>{' '}
        <a
          href={link}
          target='_blank'
          rel='noopener noreferrer'
          className='break-all text-button hover:underline'
        >
          {link}
        </a>
      </p>
      <p>
        <strong>{t('Type')}:</strong> {t(type)}
      </p>
      <p>
        <strong>{t('Address')}:</strong>{' '}
        {location.address ||
          (type === 'Online'
            ? t('Not_applicable_for_online')
            : t('Not_provided'))}
      </p>
      <p>
        <strong>{t('Continent')}:</strong>{' '}
        {location.continent ||
          (type === 'Online'
            ? t('Not_applicable_for_online')
            : t('Not_provided'))}
      </p>
      <p>
        <strong>{t('Country')}:</strong>{' '}
        {location.country ||
          (type === 'Online'
            ? t('Not_applicable_for_online')
            : t('Not_provided'))}
      </p>
      <p>
        <strong>
          {states.length > 0 ||
          (!states.length && !cities.length && location.cityStateProvince)
            ? t('State_Province')
            : t('City')}
          :
        </strong>{' '}
        {location.cityStateProvince ||
          (type === 'Online'
            ? t('Not_applicable_for_online')
            : t('Not_provided'))}
      </p>
      <div>
        <strong>{t('Important_Dates')}:</strong>
        <ul className='mt-1 list-disc space-y-1 pl-5'>
          {dates.map((date, index) => (
            <li key={index}>
              {date.name || t('Unnamed_Date')}: {date.fromDate || t('N_A')} -{' '}
              {date.toDate || t('N_A')} ({date.type || t('N_A')})
            </li>
          ))}
        </ul>
      </div>
      <div>
        <strong>{t('Topics')}:</strong>
        {topics.length > 0 ? (
          <span className='ml-2'>{topics.join(', ')}</span>
        ) : (
          <span className='ml-2 italic '>{t('No_topics_added')}</span>
        )}
      </div>
      {imageUrl && (
        <p>
          <strong>{t('Image_URL')}:</strong>{' '}
          <a
            href={imageUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='break-all text-button hover:underline'
          >
            {imageUrl}
          </a>
        </p>
      )}
      <p>
        <strong>{t('Description')}:</strong>{' '}
        {description || (
          <span className='italic '>{t('No_description_provided')}</span>
        )}
      </p>
    </div>
  )

  const renderStepThree = () => (
    <div className='sm:col-span-2'>
      <h2 className='mb-4 text-lg font-semibold sm:text-xl'>
        {t('Terms_and_Conditions')}
      </h2>
      <div className='mb-4 max-h-60 overflow-y-auto rounded border p-4'>
        <p>{t('Terms_and_Conditions_Description')}</p>
      </div>
      <label className='flex items-center'>
        <input
          type='checkbox'
          checked={agreedToTerms}
          onChange={e => setAgreedToTerms(e.target.checked)}
          className='mr-2 h-4 w-4 rounded border-gray-300 text-button focus:ring-button'
        />
        <span className='text-sm'>
          {t('I_agree_to_the_terms_and_conditions')}
        </span>
      </label>
    </div>
  )

  return (
    <div className='mx-auto  px-4 py-8 sm:px-6 lg:px-8'>
      <div className='mb-8 sm:mb-10'>
        <div className='flex items-center justify-center sm:justify-start'>
          {/* Step 1 */}
          <div
            className={`flex w-full items-center ${currentStep === 1 ? 'flex' : 'hidden lg:flex'} ${currentStep >= 1 ? 'text-button' : ''}`}
          >
            <span
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-2 ${currentStep >= 1 ? 'bg-background-secondary ring-button' : 'ring-primary'}`}
            >
              <svg
                className='h-3.5 w-3.5'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 16 12'
              >
                <path
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M1 5.917 5.724 10.5 15 1.5'
                />
              </svg>
            </span>
            <div className='ml-2 w-full'>
              <h3 className='font-medium leading-tight'>
                {t('Add_Conference_Info')} {/* More specific */}
              </h3>
            </div>
            <div className='ml-2 hidden h-0.5 w-full bg-gray-300 lg:block'></div>
          </div>

          {/* Step 2 */}
          <div
            className={`flex w-full items-center ${currentStep === 2 ? 'flex' : 'hidden lg:flex'} ${currentStep >= 2 ? 'text-button' : ''}`}
          >
            <div className='mr-6 hidden h-0.5 w-full bg-gray-300 lg:block'></div>
            <span
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-2 ${currentStep >= 2 ? 'bg-background-secondary ring-button' : 'ring-primary'}`}
            >
              <svg
                className='h-3.5 w-3.5'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='currentColor'
                viewBox='0 0 18 20'
              >
                <path d='M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z' />
              </svg>
            </span>
            <div className='ml-2 w-full'>
              <h3 className='font-medium leading-tight'>{t('Review')}</h3>
            </div>
            <div className=' hidden h-0.5 w-full bg-gray-300 lg:block'></div>
          </div>

          {/* Step 3 */}
          <div
            className={`flex w-full items-center ${currentStep === 3 ? 'flex' : 'hidden lg:flex'} ${currentStep >= 3 ? 'text-button' : ''}`}
          >
            <div className='mr-6 hidden h-0.5 w-full bg-gray-300 lg:block'></div>
            <span
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-2 ${currentStep >= 3 ? 'bg-background-secondary ring-button' : 'ring-primary'}`}
            >
              <svg
                className='h-3.5 w-3.5'
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='currentColor'
                viewBox='0 0 18 20'
              >
                <path d='M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2ZM7 2h4v3H7V2Zm5.7 8.289-3.975 3.857a1 1 0 0 1-1.393 0L5.3 12.182a1.002 1.002 0 1 1 1.4-1.436l1.328 1.289 3.28-3.181a1 1 0 1 1 1.392 1.435Z' />
              </svg>
            </span>
            <div className='ml-2 w-full'>
              <h3 className='font-medium leading-tight'>{t('Confirmation')}</h3>
            </div>
          </div>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className='grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-6'
      >
        {currentStep === 1 && renderStepOne()}
        {currentStep === 2 && renderStepTwo()}
        {currentStep === 3 && renderStepThree()}

        <div className='col-span-1 mt-6 flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-start'>
          {currentStep > 1 && (
            <button
              type='button'
              onClick={goToPreviousStep}
              className='w-full rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-700 focus:outline-none sm:w-auto' // Changed background for better contrast
            >
              {t('Back')}
            </button>
          )}

          {currentStep < 3 && (
            <button
              type='button'
              onClick={goToNextStep}
              className='hover:bg-button-hover w-full rounded bg-button px-4 py-2 text-sm text-button-text focus:outline-none sm:w-auto'
            >
              {t('Next')}
            </button>
          )}

          {currentStep === 3 && (
            <button
              type='submit'
              className='hover:bg-button-hover w-full rounded bg-button px-4 py-2 text-sm text-button-text focus:outline-none sm:w-auto'
              disabled={!agreedToTerms}
            >
              {t('Add_Conference_Submit')}{' '}
              {/* More specific for submit button */}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
export default ConferenceForm
