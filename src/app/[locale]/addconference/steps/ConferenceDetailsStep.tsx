// src/app/[locale]/addconference/components/steps/ConferenceDetailsStep.tsx
import React from 'react'
import {
  LocationInput,
  ImportantDateInput,
  City,
  State
} from '@/src/models/send/addConference.send'

import LocationSelector from '../inputs/LocationSelector'
import ImportantDatesInput from '../inputs/ImportantDatesInput'
import TopicsInput from '../inputs/TopicsInput'

interface ConferenceDetailsStepProps {
  title: string
  setTitle: (value: string) => void
  acronym: string
  setAcronym: (value: string) => void
  link: string
  setLink: (value: string) => void
  type: 'Offline' | 'Online' | 'Hybrid'
  setType: (value: 'Offline' | 'Online' | 'Hybrid') => void
  location: LocationInput
  setLocation: React.Dispatch<React.SetStateAction<LocationInput>>
  dates: ImportantDateInput[]
  handleDateChange: (
    index: number,
    field: keyof ImportantDateInput,
    value: string
  ) => void
  addDate: () => void
  removeDate: (index: number) => void
  topics: string[]
  setTopics: (value: string[]) => void
  newTopic: string
  setNewTopic: (value: string) => void
  imageUrl: string
  setImageUrl: (value: string) => void
  description: string
  setDescription: (value: string) => void
  dateTypeOptions: { value: string; name: string }[]
  t: (key: string) => string
  cscApiKey: string
  setStatesForReview: React.Dispatch<React.SetStateAction<State[]>>
  setCitiesForReview: React.Dispatch<React.SetStateAction<City[]>>
  // isCheckingDuplicates: boolean // Đã xóa
  // duplicateError: string // Đã xóa
  conferenceDateStartError: string
}

const ConferenceDetailsStep: React.FC<ConferenceDetailsStepProps> = ({
  title,
  setTitle,
  acronym,
  setAcronym,
  link,
  setLink,
  type,
  setType,
  location,
  setLocation,
  dates,
  handleDateChange,
  addDate,
  removeDate,
  topics,

  setTopics,
  newTopic,
  setNewTopic,
  imageUrl,
  setImageUrl,
  description,
  setDescription,
  dateTypeOptions,
  t,
  cscApiKey,
  setStatesForReview,
  setCitiesForReview,
  // isCheckingDuplicates, // Đã xóa
  // duplicateError, // Đã xóa
  conferenceDateStartError
}) => {
  return (
    <>
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
        {/* {duplicateError && ( */}
        {/* <p className='col-span-full text-red-500 text-sm'> */}
        {/* {duplicateError} */}
        {/* </p> */}
        {/* )} */} {/* Đã xóa */}
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

      <LocationSelector
        type={type}
        location={location}
        setLocation={setLocation}
        t={t}
        cscApiKey={cscApiKey}
        setStatesForReview={setStatesForReview}
        setCitiesForReview={setCitiesForReview}
      />

      <ImportantDatesInput
        dates={dates}
        handleDateChange={handleDateChange}
        addDate={addDate}
        removeDate={removeDate}
        dateTypeOptions={dateTypeOptions}
        t={t}
        conferenceDateStartError={conferenceDateStartError}
      />

      <TopicsInput
        topics={topics}
        setTopics={setTopics}
        newTopic={newTopic}
        setNewTopic={setNewTopic}
        t={t}
      />

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
}

export default ConferenceDetailsStep
