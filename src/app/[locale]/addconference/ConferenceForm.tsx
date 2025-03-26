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

const API_ADD_CONFERENCE_ENDPOINT = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/add-conference`
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
  const [type, setType] = useState<'offline' | 'online' | 'hybrid'>('offline')
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
    { value: 'submissionDate', name: 'Submission Date' },
    { value: 'conferenceDates', name: 'Conference Dates' },
    { value: 'registrationDate', name: 'Registration Date' },
    { value: 'notificationDate', name: 'Notification Date' },
    { value: 'cameraReadyDate', name: 'Camera Ready Date' }
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
    setLocation({
      ...location,
      country: '',
      cityStateProvince: '',
      continent: selectedContinent
    })
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
    setLocation({
      ...location,
      country: filteredCountries.find(c => c.iso2 === countryIso2)?.name || '',
      cityStateProvince: ''
    })
  }

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode)
    setLocation({
      ...location,
      cityStateProvince:
        states.find(s => s.state_code === stateCode)?.name || ''
    })
  }

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName)
    setLocation({
      ...location,
      cityStateProvince: cityName
    })
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
    newDates[index] = {
      ...newDates[index],
      [field]: value
    }
    setDates(newDates)
  }
  const addDate = () => {
    setDates([...dates, { type: '', name: '', fromDate: '', toDate: '' }])
  }

  const removeDate = (index: number) => {
    if (index !== 0) {
      setDates(dates.filter((_, i) => i !== index))
    }
  }
  const handleLocationChange = (field: keyof LocationInput, value: string) => {
    setLocation({
      ...location,
      [field]: value
    })
  }

  const goToNextStep = () => {
    // Add validation for step 1
    if (currentStep === 1) {
      if (
        !title ||
        !acronym ||
        !link ||
        !type ||
        !location.address ||
        dates.some(date => !date.fromDate || !date.toDate || !date.name)
      ) {
        alert('Please complete all required fields in Step 1.')
        return
      }
    }
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
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions.')
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
      alert('Please log in to add new Conference')
      return
    }
    const user = JSON.parse(userData)
    const userId = user.id
    console.log(conferenceData)
    try {
      const response = await fetch(API_ADD_CONFERENCE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...conferenceData, userId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorData.message}`
        )
      }

      const addedConference = await response.json()
      console.log('Conference added:', addedConference)

      const localePrefix = pathname.split('/')[1]
      const pathWithLocale = `/${localePrefix}/dashboard?tab=myconferences`

      router.push(pathWithLocale)
    } catch (error: any) {
      console.error('Error adding conference:', error.message)
    }
  }

  const renderStepOne = () => (
    <>
      {/* ... (rest of your step one form fields) ... */}
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
              setType(e.target.value as 'offline' | 'online' | 'hybrid')
            }
            required
          >
            <option value='offline'>{t('Offline')}</option>
            <option value='online'>{t('Online')}</option>
            <option value='hybrid'>{t('Hybrid')}</option>
          </select>
        </div>
      </div>

      <div className='sm:col-span-2'>
        <label className='block text-base  '>* {t('Location')}:</label>
        <div className='grid grid-cols-1 gap-y-4 sm:grid-cols-4 sm:gap-x-4'>
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
              required
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
              required
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
              required
              disabled={!selectedContinent}
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
              required
              disabled={!selectedCountry}
            >
              <option value=''>
                {t('Select')}{' '}
                {cities.length > 0
                  ? `${t('City')}:`
                  : `${t('State_Province')}:`}
              </option>
              {states.length > 0
                ? states.map(state => (
                    <option key={state.iso2} value={state.state_code}>
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
        <label className='block text-sm  '>{t('Important_Dates')}:</label>
        {dates.map((date, index) => (
          <div key={index} className='mt-1 grid grid-cols-4 gap-4'>
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
                    ${index === 0 ? 'opacity-50' : ''}`}
                required
                readOnly={index === 0}
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
                  index === 0 ? 'pointer-events-none opacity-50' : ''
                }`}
                disabled={index === 0}
              >
                <option value=''>{t('Select_Type')}</option>
                {dateTypeOptions.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor={`fromDate-${index}`} className='block text-sm  '>
                {t('Start')}:
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
              />
            </div>
            <div>
              <label htmlFor={`toDate-${index}`} className='block text-sm  '>
                {t('End')}:
              </label>
              <input
                type='date'
                id={`toDate-${index}`}
                value={date.toDate}
                onChange={e =>
                  handleDateChange(index, 'toDate', e.target.value)
                }
                className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
                required
              />
            </div>

            {index !== 0 && (
              <button
                type='button'
                onClick={() => removeDate(index)}
                className='mt-6 text-red-500 hover:text-red-700 focus:outline-none'
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
        ))}
        <button
          type='button'
          onClick={addDate}
          className='mt-2 rounded bg-button px-4 py-2 font-bold text-button-text hover:bg-button focus:ring-2 focus:ring-button focus:ring-offset-2 hover:focus:outline-none'
        >
          {t('Add_Date')}
        </button>
      </div>
      <div className='sm:col-span-1'>
        <label htmlFor='newTopic' className='block text-sm  '>
          {t('Topics')}:
        </label>
        <div className='mt-1 items-center'>
          <input
            type='text'
            id='newTopic'
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
            className='w-5/6 flex-1 rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
            placeholder='Add a topic'
          />
          <button
            type='button'
            onClick={handleAddTopic}
            className='ml-3 rounded-md bg-button px-4 py-2 text-button-text hover:bg-button focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
          >
            {t('Add')}
          </button>

          <div className='mt-2'>
            {topics.map((topic, index) => (
              <span
                key={index}
                className='mb-2 mr-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold '
              >
                {topic}
                <button
                  type='button'
                  onClick={() => handleRemoveTopic(topic)}
                  className='hover: ml-1  focus:outline-none'
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className='sm:col-span-1'>
        <label htmlFor='imageUrl' className='block text-sm  '>
          {t('Image_URL')}:
        </label>
        <input
          type='url'
          id='imageUrl'
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
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
          className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
        />
      </div>
    </>
  )

  const renderStepTwo = () => (
    <div className='sm:col-span-2'>
      <h2 className='mb-4 text-xl font-semibold'>{t('Review_Information')}</h2>
      <p>
        <strong>{t('Conference_Name')}:</strong> {title}
      </p>
      <p>
        <strong>{t('Acronym')}:</strong> {acronym}
      </p>
      <p>
        <strong>{t('Link')}:</strong>{' '}
        <a href={link} target='_blank' rel='noopener noreferrer'>
          {link}
        </a>
      </p>
      <p>
        <strong>{t('Type')}:</strong> {t(type)}
      </p>
      <p>
        <strong>{t('Address')}:</strong> {location.address}
      </p>
      <p>
        <strong>{t('Continent')}:</strong> {location.continent}
      </p>
      <p>
        <strong>{t('Country')}:</strong> {location.country}
      </p>
      <p>
        <strong>
          {location.cityStateProvince ? t('City') : t('State_Province')}:
        </strong>{' '}
        {location.cityStateProvince}
      </p>

      <p>
        <strong>{t('Important_Dates')}:</strong>
      </p>
      <ul>
        {dates.map((date, index) => (
          <li key={index}>
            {date.name}: {date.fromDate} - {date.toDate} ({date.type})
          </li>
        ))}
      </ul>
      <p>
        <strong>{t('Topics')}:</strong> {topics.join(', ')}
      </p>
      {imageUrl && (
        <p>
          <strong>{t('Image_URL')}:</strong>{' '}
          <a href={imageUrl} target='_blank' rel='noopener noreferrer'>
            {imageUrl}
          </a>
        </p>
      )}
      <p>
        <strong>{t('Description')}:</strong> {description}
      </p>
    </div>
  )

  const renderStepThree = () => (
    <div className='sm:col-span-2'>
      <h2 className='mb-4 text-xl font-semibold'>
        {t('Terms_and_Conditions')}
      </h2>
      <div className='mb-4 border p-4'>
        {/* Replace this with your actual terms and conditions */}
        <p>
          Bằng cách nhấp vào nút Đăng hội nghị, tôi xác nhận rằng tôi đã đọc,
          hiểu và đồng ý tuân thủ tất cả các điều khoản và điều kiện dành cho
          người tổ chức/đăng tải hội nghị trên nền tảng này. Tôi cũng đồng ý với
          chính sách bảo mật của nền tảng.
        </p>
      </div>
      <label className='flex items-center'>
        <input
          type='checkbox'
          checked={agreedToTerms}
          onChange={e => setAgreedToTerms(e.target.checked)}
          className='mr-2'
        />
        {t('I_agree_to_the_terms_and_conditions')}
      </label>
    </div>
  )

  return (
    <>
      <div className='mb-10'>
        <ol className='flex w-full items-center  '>
          <li
            className={`flex w-full items-center ${currentStep >= 1 ? 'text-button ' : ''} `}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full ring-2  ${currentStep >= 1 ? 'bg-background-secondary ring-button' : 'ring-primary'} `}
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
              {' '}
              {/* Thêm ml-2 để tạo khoảng cách */}
              <h3 className='font-medium leading-tight'>Add conference</h3>
              <p className='text-sm'>Step add conference here</p>
            </div>
          </li>

          <li
            className={`flex w-full items-center ${currentStep >= 2 ? 'text-button ' : ''} `}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full ring-2  ${currentStep >= 2 ? 'bg-background-secondary ring-button' : 'ring-primary'} `}
            >
              <svg
                className='h-3.5 w-3.5  '
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='currentColor'
                viewBox='0 0 18 20'
              >
                <path d='M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z' />
              </svg>
            </span>
            <div className='ml-2 w-full'>
              {' '}
              {/* Thêm ml-2 để tạo khoảng cách */}
              <h3 className='font-medium leading-tight'>Review</h3>
              <p className='text-sm'>Step review here</p>
            </div>
          </li>
          <li
            className={`flex w-full items-center ${currentStep >= 3 ? 'text-button ' : ''} `}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full ring-2  ${currentStep >= 3 ? 'bg-background-secondary ring-button' : 'ring-primary'} `}
            >
              <svg
                className='h-3.5 w-3.5  '
                aria-hidden='true'
                xmlns='http://www.w3.org/2000/svg'
                fill='currentColor'
                viewBox='0 0 18 20'
              >
                <path d='M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2ZM7 2h4v3H7V2Zm5.7 8.289-3.975 3.857a1 1 0 0 1-1.393 0L5.3 12.182a1.002 1.002 0 1 1 1.4-1.436l1.328 1.289 3.28-3.181a1 1 0 1 1 1.392 1.435Z' />
              </svg>
            </span>
            <div className='ml-2 w-full'>
              <h3 className='font-medium leading-tight'>Confirmation</h3>
              <p className='text-sm'>Step confirmation here</p>
            </div>
          </li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className='grid gap-5'>
        {currentStep === 1 && renderStepOne()}
        {currentStep === 2 && renderStepTwo()}
        {currentStep === 3 && renderStepThree()}

        <div className='my-6 flex justify-start gap-4'>
          {currentStep > 1 && (
            <button
              type='button'
              onClick={goToPreviousStep}
              className='rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none'
            >
              {t('Back')}
            </button>
          )}

          {currentStep < 3 && (
            <button
              type='button'
              onClick={goToNextStep}
              className='hover:bg-button-hover rounded bg-button px-4 py-2 text-button-text focus:outline-none'
              disabled={currentStep === 3 && !agreedToTerms}
            >
              {t('Next')}
            </button>
          )}

          {currentStep === 3 && (
            <button
              type='submit'
              onClick={handleSubmit}
              className=' hover:bg-button-hover rounded bg-button px-4 py-2 text-button-text focus:outline-none'
              disabled={!agreedToTerms}
            >
              {t('Add_Conference')}
            </button>
          )}
        </div>
      </form>
    </>
  )
}
export default ConferenceForm
