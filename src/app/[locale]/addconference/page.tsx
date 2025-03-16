'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Header } from '../utils/Header'
import Footer from '../utils/Footer'
import { useRouter, usePathname } from 'next/navigation'

const API_ADD_CONFERENCE_ENDPOINT = 'http://localhost:3000/api/v1/conferences'
const CSC_API_KEY = process.env.NEXT_PUBLIC_CSC_API_KEY // Get API key from environment variable

interface ConferenceFormData {
  title: string
  acronym: string
  link: string
  topics: string[]
  type: 'offline' | 'online' | 'hybrid'
  location: LocationInput
  dates: ImportantDateInput[]
  imageUrl: string
  description: string
}

interface LocationInput {
  address: string
  cityStateProvince: string
  country: string
  continent: string
}

interface ImportantDateInput {
  type: string
  name: string
  fromDate: string
  toDate: string
}

interface Country {
  name: string
  iso2: string // ISO2 country code
}

interface State {
  name: string
  iso2: string
  country_code: string
  state_code: string
}

const continentData: { [key: string]: string[] } = {
  'North America': [],
  Europe: [],
  Asia: [],
  Africa: [],
  'South America': [],
  Oceania: [],
  Antarctica: []
}

const AddConference = ({ locale }: { locale: string }) => {
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

  // --- CSC API States ---
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('') // ISO2 of selected country
  const [selectedState, setSelectedState] = useState<string>('') // State code of selected state
  const [selectedContinent, setSelectedContinent] = useState<string>('') // Selected continent
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]) // Filtered countries by continent

  const router = useRouter()
  const pathname = usePathname()

  // --- Fetch Countries (All at once)---
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          'https://api.countrystatecity.in/v1/countries',
          {
            headers: {
              'X-CSCAPI-KEY': CSC_API_KEY || ''
            }
          }
        )
        const data = await response.json()

        const mappedCountries: Country[] = data.map((c: any) => ({
          name: c.name,
          iso2: c.iso2
        }))
        setCountries(mappedCountries)

        // Populate continentData
        data.forEach((c: any) => {
          if (c.name === 'United States')
            continentData['North America'].push(c.iso2)
          if (c.name === 'Canada') continentData['North America'].push(c.iso2)
          if (c.name === 'Mexico') continentData['North America'].push(c.iso2)
          if (c.name === 'Brazil') continentData['South America'].push(c.iso2)
          if (c.name === 'Argentina')
            continentData['South America'].push(c.iso2)
          if (c.name === 'Colombia') continentData['South America'].push(c.iso2)
          if (c.name === 'United Kingdom') continentData['Europe'].push(c.iso2)
          if (c.name === 'Germany') continentData['Europe'].push(c.iso2)
          if (c.name === 'France') continentData['Europe'].push(c.iso2)
          if (c.name === 'China') continentData['Asia'].push(c.iso2)
          if (c.name === 'India') continentData['Asia'].push(c.iso2)
          if (c.name === 'Japan') continentData['Asia'].push(c.iso2)
          if (c.name === 'South Africa') continentData['Africa'].push(c.iso2)
          if (c.name === 'Egypt') continentData['Africa'].push(c.iso2)
          if (c.name === 'Nigeria') continentData['Africa'].push(c.iso2)
          if (c.name === 'Australia') continentData['Oceania'].push(c.iso2)
          if (c.name === 'New Zealand') continentData['Oceania'].push(c.iso2)
          //Antarctica has no countries
        })
      } catch (error) {
        console.error('Error fetching countries:', error)
      }
    }

    fetchCountries()
  }, [])

  // --- Filter Countries by Continent ---
  useEffect(() => {
    if (selectedContinent) {
      const countryCodes = continentData[selectedContinent]
      const newFilteredCountries = countries.filter(country =>
        countryCodes.includes(country.iso2)
      )
      setFilteredCountries(newFilteredCountries)
    } else {
      setFilteredCountries([]) // Clear if no continent selected
    }
    // Reset country and state when continent changes
    setSelectedCountry('')
    setSelectedState('')
    setLocation({
      ...location,
      country: '',
      cityStateProvince: '',
      continent: selectedContinent
    })
  }, [selectedContinent, countries])

  // --- Fetch States ---
  useEffect(() => {
    const fetchStates = async () => {
      if (!selectedCountry) {
        setStates([])
        return
      }
      try {
        const response = await fetch(
          `https://api.countrystatecity.in/v1/countries/${selectedCountry}/states`,
          {
            headers: {
              'X-CSCAPI-KEY': CSC_API_KEY || ''
            }
          }
        )
        const data = await response.json()
        const mappedStates = data.map((s: any) => ({
          name: s.name,
          iso2: s.iso2,
          country_code: s.country_code,
          state_code: s.state_code
        }))

        setStates(mappedStates)
      } catch (error) {
        console.error('Error fetching states:', error)
        setStates([])
      }
    }

    fetchStates()
  }, [selectedCountry])

  const handleContinentChange = (continent: string) => {
    setSelectedContinent(continent)
  }

  const handleCountryChange = (countryIso2: string) => {
    setSelectedCountry(countryIso2)
    setSelectedState('') // Reset state when country changes
    setLocation({
      ...location,
      country: filteredCountries.find(c => c.iso2 === countryIso2)?.name || '',
      cityStateProvince: ''
    }) // find full name country
  }

  const handleStateChange = (stateCode: string) => {
    setSelectedState(stateCode)
    setLocation({
      ...location,
      cityStateProvince:
        states.find(s => s.state_code === stateCode)?.name || ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    // Hàm async
    e.preventDefault()
    if (
      !title ||
      !acronym ||
      !link ||
      !type ||
      !location.address ||
      // !location.cityStateProvince ||
      // !location.country ||
      // !location.continent ||
      dates.some(date => !date.fromDate || !date.toDate || !date.name)
    ) {
      alert('Please fill in all required fields.')
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

  const continentOptions = [
    'North America',
    'Europe',
    'Asia',
    'Africa',
    'South America',
    'Oceania',
    'Antarctica'
  ]

  const dateTypeOptions = [
    'submissionDate',
    'conferenceDates',
    'registrationDate',
    'notificationDate',
    'cameraReadyDate'
  ]

  return (
    <>
      <Header locale={locale} />
      <div className='container mx-auto px-16'>
        <div className='w-full bg-background py-14'></div>

        <h1 className='mb-4 text-2xl font-bold'>Add New Conference</h1>

        <form onSubmit={handleSubmit} className='grid gap-5'>
          {/* Basic Information */}
          <div className='sm:col-span-2'>
            <label htmlFor='title' className='block text-sm  '>
              * Conference name:
            </label>
            <input
              type='text'
              id='title'
              className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className='grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-3'>
            {/* Acronym */}
            <div>
              <label htmlFor='acronym' className='block text-sm  '>
                * Acronym:
              </label>
              <input
                type='text'
                id='acronym'
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={acronym}
                onChange={e => setAcronym(e.target.value)}
                required
              />
            </div>

            {/* Link */}
            <div>
              <label htmlFor='link' className='block text-sm  '>
                * Link:
              </label>
              <input
                type='url'
                id='link'
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={link}
                onChange={e => setLink(e.target.value)}
                required
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor='type' className='block text-sm  '>
                * Type:
              </label>
              <select
                id='type'
                className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                value={type}
                onChange={e =>
                  setType(e.target.value as 'offline' | 'online' | 'hybrid')
                }
                required
              >
                <option value='offline'>Offline</option>
                <option value='online'>Online</option>
                <option value='hybrid'>Hybrid</option>
              </select>
            </div>
          </div>

          {/* Location Inputs */}
          <div className='sm:col-span-2'>
            <label className='block text-base  '>* Location:</label>
            <div className='grid grid-cols-1 gap-y-4 sm:grid-cols-4 sm:gap-x-4'>
              <div>
                <label htmlFor='address' className='block text-sm  '>
                  Address:
                </label>
                <input
                  type='text'
                  id='address'
                  className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                  value={location.address}
                  onChange={e =>
                    handleLocationChange('address', e.target.value)
                  }
                  required
                />
              </div>

              {/* --- Continent Dropdown --- */}
              <div>
                <label htmlFor='continent' className='block text-sm'>
                  Continent:
                </label>
                <select
                  id='continent'
                  className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                  value={selectedContinent}
                  onChange={e => handleContinentChange(e.target.value)}
                  required
                >
                  <option value=''>Select Continent</option>
                  {continentOptions.map(continent => (
                    <option key={continent} value={continent}>
                      {continent}
                    </option>
                  ))}
                </select>
              </div>

              {/* --- Country Dropdown --- */}
              <div>
                <label htmlFor='country' className='block text-sm'>
                  Country:
                </label>
                <select
                  id='country'
                  className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                  value={selectedCountry}
                  onChange={e => handleCountryChange(e.target.value)}
                  required
                  disabled={!selectedContinent} // Disable if no continent is selected
                >
                  <option value=''>Select Country</option>
                  {filteredCountries.map(country => (
                    <option key={country.iso2} value={country.iso2}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* --- State Dropdown --- */}
              <div>
                <label htmlFor='state' className='block text-sm'>
                  State/Province:
                </label>
                <select
                  id='state'
                  className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                  value={selectedState}
                  onChange={e => handleStateChange(e.target.value)}
                  required
                  disabled={!selectedCountry} // Disable if no country is selected
                >
                  <option value=''>Select State/Province</option>
                  {states.map(state => (
                    <option key={state.iso2} value={state.state_code}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Important Dates */}
          <div className='sm:col-span-2'>
            <label className='block text-sm  '>Important Dates:</label>
            {dates.map((date, index) => (
              <div key={index} className='mt-1 grid grid-cols-4 gap-4'>
                <div>
                  <label htmlFor={`name-${index}`} className='block text-sm  '>
                    Name:
                  </label>
                  <input
                    type='text'
                    id={`name-${index}`}
                    value={date.name}
                    onChange={e =>
                      handleDateChange(index, 'name', e.target.value)
                    }
                    className={`mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm
                      ${index === 0 ? 'opacity-50' : ''}`}
                    required
                    readOnly={index === 0}
                  />
                </div>
                <div>
                  <label htmlFor={`type-${index}`} className='block text-sm'>
                    Type:
                  </label>
                  <select
                    id={`type-${index}`}
                    value={date.type}
                    onChange={e =>
                      handleDateChange(index, 'type', e.target.value)
                    }
                    className={`mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${
                      index === 0 ? 'pointer-events-none opacity-50' : ''
                    }`}
                    disabled={index === 0}
                  >
                    <option value=''>Select Type</option>
                    {dateTypeOptions.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor={`fromDate-${index}`}
                    className='block text-sm  '
                  >
                    Start Date:
                  </label>
                  <input
                    type='date'
                    id={`fromDate-${index}`}
                    value={date.fromDate}
                    onChange={e =>
                      handleDateChange(index, 'fromDate', e.target.value)
                    }
                    className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor={`toDate-${index}`}
                    className='block text-sm  '
                  >
                    End Date:
                  </label>
                  <input
                    type='date'
                    id={`toDate-${index}`}
                    value={date.toDate}
                    onChange={e =>
                      handleDateChange(index, 'toDate', e.target.value)
                    }
                    className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
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
              className='mt-2 rounded bg-indigo-500 px-4 py-2 font-bold text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            >
              Add Date
            </button>
          </div>

          {/* Topics */}
          <div className='sm:col-span-2'>
            <label htmlFor='newTopic' className='block text-sm  '>
              Topics:
            </label>
            <div className='mt-1 items-center'>
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
              <input
                type='text'
                id='newTopic'
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                className='w-80 flex-1 rounded-l-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
                placeholder='Add a topic'
              />
              <button
                type='button'
                onClick={handleAddTopic}
                className='ml-3 rounded-r-md bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              >
                Add
              </button>
            </div>
          </div>

          {/* Image URL */}
          <div className='sm:col-span-2'>
            <label htmlFor='imageUrl' className='block text-sm  '>
              Image URL:
            </label>
            <input
              type='url'
              id='imageUrl'
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
            />
          </div>
          {/* Description */}
          <div className='sm:col-span-2'>
            <label htmlFor='description' className='block text-sm  '>
              Description:
            </label>
            <textarea
              id='description'
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              className='mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm'
            />
          </div>

          {/* Submit Button */}
          <div className='mt-6 '>
            <button
              type='submit'
              onClick={handleSubmit}
              className='w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm  text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            >
              Add Conference
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  )
}

export default AddConference
