// ConferenceForm.tsx
import React, { useState } from 'react'
import Button from '../utils/Button'
import {
  ConferenceResponse,
  ImportantDate,
  Location
} from '../../../models/response/conference.response' // Import all relevant types

//  Use ConferenceResponse directly, and create separate types for input data if needed
//  This makes it very clear what the form is *submitting*, versus what it receives as a response.
interface ConferenceFormData {
  title: string
  acronym: string
  link: string
  topics: string[]
  type: 'offline' | 'online' | 'hybrid' //  Use a union type for type safety
  location: LocationInput // See type definition below
  dates: ImportantDateInput[] // See type definition below
  description: string
  rank: string
  source: string
}

// Separate type for Location input,  to make is easier to handle input
interface LocationInput {
  address: string
  cityStateProvince: string
  country: string
  continent: string
}

// Separate type for ImportantDate input. Avoids confusion with the server response type.
interface ImportantDateInput {
  type: string
  name: string
  fromDate: string
  toDate: string
}

interface ConferenceFormProps {
  onAdd: (conferenceData: ConferenceFormData) => void // Pass the specific form data type
  onClose: () => void
}

const ConferenceForm: React.FC<ConferenceFormProps> = ({ onAdd, onClose }) => {
  const [title, setTitle] = useState('') // Use descriptive names (title, not name)
  const [acronym, setAcronym] = useState('')
  const [link, setLink] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState('')
  const [type, setType] = useState<'offline' | 'online' | 'hybrid'>('offline') // String literal type
  const [location, setLocation] = useState<LocationInput>({
    // Use the LocationInput type
    address: '',
    cityStateProvince: '',
    country: '',
    continent: ''
  })
  const [dates, setDates] = useState<ImportantDateInput[]>([
    // Use the ImportantDateInput type, initialized with an empty array
    { type: '', name: '', fromDate: '', toDate: '' } // Initial empty date object
  ])

  const [description, setDescription] = useState('')
  const [rank, setRank] = useState('')
  const [source, setsource] = useState('')

  const handleAddTopic = () => {
    if (newTopic.trim() !== '') {
      setTopics([...topics, newTopic.trim()])
      setNewTopic('')
    }
  }

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(topic => topic !== topicToRemove))
  }

  // Handle changes to location fields individually
  const handleLocationChange = (field: keyof LocationInput, value: string) => {
    setLocation({
      ...location,
      [field]: value
    })
  }

  // Handle changes to important dates.  This is now more complex.
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

  // Add a new important date entry
  const addDate = () => {
    setDates([...dates, { type: '', name: '', fromDate: '', toDate: '' }])
  }
  //remove date
  const removeDate = (index: number) => {
    setDates(dates.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Construct the data to be sent.
    const conferenceData: ConferenceFormData = {
      title,
      acronym,
      link,
      topics,
      type,
      location,
      dates,
      description,
      rank,
      source
    }

    onAdd(conferenceData)
    onClose() //close form after submit
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4'
    >
      <div className='sm:col-span-2'>
        <label htmlFor='title' className='block text-sm font-medium '>
          * Conference name:
        </label>
        <input
          type='text'
          id='title'
          className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </div>
      <div className='sm:col-span-1'>
        <label htmlFor='acronym' className='block text-sm font-medium '>
          * Acronym:
        </label>
        <input
          type='text'
          id='acronym'
          className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          value={acronym}
          onChange={e => setAcronym(e.target.value)}
          required
        />
      </div>
      <div className='sm:col-span-1'>
        <label htmlFor='link' className='block text-sm font-medium '>
          * Link:
        </label>
        <input
          type='url'
          id='link'
          className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          value={link}
          onChange={e => setLink(e.target.value)}
          required
        />
      </div>

      <div className='sm:col-span-2'>
        <label htmlFor='type' className='block text-sm font-medium '>
          * Type:
        </label>
        <select
          id='type'
          className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          value={type}
          onChange={e =>
            setType(e.target.value as 'offline' | 'online' | 'hybrid')
          } // Cast to the union type
          required
        >
          <option value='offline'>Offline</option>
          <option value='online'>Online</option>
          <option value='hybrid'>Hybrid</option>
        </select>
      </div>

      {/* Location Inputs */}
      <div className='sm:col-span-2'>
        <label className='block text-sm font-medium '>* Location:</label>
        <div className='grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4'>
          <div>
            <label htmlFor='address' className='block text-sm font-medium '>
              Address:
            </label>
            <input
              type='text'
              id='address'
              className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              value={location.address}
              onChange={e => handleLocationChange('address', e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor='cityStateProvince'
              className='block text-sm font-medium '
            >
              City/State/Province:
            </label>
            <input
              type='text'
              id='cityStateProvince'
              className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              value={location.cityStateProvince}
              onChange={e =>
                handleLocationChange('cityStateProvince', e.target.value)
              }
            />
          </div>
          <div>
            <label htmlFor='country' className='block text-sm font-medium '>
              Country:
            </label>
            <input
              type='text'
              id='country'
              className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              value={location.country}
              onChange={e => handleLocationChange('country', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor='continent' className='block text-sm font-medium '>
              Continent:
            </label>
            <input
              type='text'
              id='continent'
              className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              value={location.continent}
              onChange={e => handleLocationChange('continent', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Important Dates Inputs */}
      <div className='sm:col-span-2'>
        <label className='block text-sm font-medium '>Important Dates:</label>
        {dates.map((date, index) => (
          <div
            key={index}
            className='mt-4 grid grid-cols-1 gap-y-4 border-t pt-4 sm:grid-cols-2 sm:gap-x-4'
          >
            <div>
              <label
                htmlFor={`type-${index}`}
                className='block text-sm font-medium '
              >
                Type:
              </label>
              <input
                type='text'
                id={`type-${index}`}
                className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                value={date.type}
                onChange={e => handleDateChange(index, 'type', e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor={`name-${index}`}
                className='block text-sm font-medium '
              >
                Name:
              </label>
              <input
                type='text'
                id={`name-${index}`}
                className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                value={date.name}
                onChange={e => handleDateChange(index, 'name', e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor={`fromDate-${index}`}
                className='block text-sm font-medium '
              >
                From Date:
              </label>
              <input
                type='date'
                id={`fromDate-${index}`}
                className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                value={date.fromDate}
                onChange={e =>
                  handleDateChange(index, 'fromDate', e.target.value)
                }
              />
            </div>
            <div>
              <label
                htmlFor={`toDate-${index}`}
                className='block text-sm font-medium '
              >
                To Date:
              </label>
              <input
                type='date'
                id={`toDate-${index}`}
                className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                value={date.toDate}
                onChange={e =>
                  handleDateChange(index, 'toDate', e.target.value)
                }
              />
            </div>
            <div className='flex justify-start gap-2 sm:col-span-2'>
              <Button
                type='button'
                variant='primary'
                size='small'
                onClick={() => removeDate(index)}
                className='mt-2'
              >
                Remove Date
              </Button>
            </div>
          </div>
        ))}
        <Button
          type='button'
          variant='primary'
          size='small'
          onClick={addDate}
          className='mt-2'
        >
          Add Date
        </Button>
      </div>

      <div className='sm:col-span-2'>
        <label htmlFor='description' className='block text-sm font-medium '>
          Description:
        </label>
        <textarea
          id='description'
          rows={3}
          className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder='Enter conference description'
        />
      </div>

      <div className='sm:col-span-2'>
        <label htmlFor='rank' className='block text-sm font-medium '>
          Rank:
        </label>
        <input
          type='text'
          id='rank'
          className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          value={rank}
          onChange={e => setRank(e.target.value)}
          placeholder='Enter conference rank'
        />
      </div>

      <div className='sm:col-span-2'>
        <label htmlFor='source' className='block text-sm font-medium '>
          Source:
        </label>
        <input
          type='text'
          id='source'
          className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
          value={source}
          onChange={e => setsource(e.target.value)}
          placeholder='Enter source'
        />
      </div>

      <div className='sm:col-span-2'>
        <label htmlFor='topics' className='block text-sm font-medium '>
          * Topics:
        </label>
        <div className='mt-1 flex flex-wrap gap-2'>
          {topics.map(topic => (
            <div
              key={topic}
              className='flex items-center rounded-md bg-gray-100 px-2 py-1'
            >
              {topic}
              <button
                type='button'
                onClick={() => handleRemoveTopic(topic)}
                className='hover: ml-1 text-gray-500 focus:outline-none'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className='mt-2 flex items-center'>
          <input
            type='text'
            id='newTopic'
            className='mt-1 block w-full rounded-md border border-text-secondary bg-background shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            value={newTopic}
            onChange={e => setNewTopic(e.target.value)}
            placeholder='Add new'
          />
          <Button
            type='button'
            onClick={handleAddTopic}
            variant='primary'
            size='small'
            className='ml-2'
          >
            Add
          </Button>
        </div>
      </div>

      <div className='flex justify-end gap-2 sm:col-span-2'>
        <Button variant='secondary' onClick={onClose}>
          Back
        </Button>
        <Button type='submit' variant='primary'>
          Finish
        </Button>
      </div>
    </form>
  )
}

export default ConferenceForm
