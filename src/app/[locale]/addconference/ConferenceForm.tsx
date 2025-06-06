// src/app/[locale]/addconference/ConferenceForm.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LocationInput,
  ImportantDateInput,
  City,
  State,
  ConferenceFormData
} from '@/src/models/send/addConference.send'
import { appConfig } from '@/src/middleware'

import { useAuth } from '@/src/contexts/AuthContext'
// Import các component con
import ConferenceProgressIndicator from './ConferenceProgressIndicator'
import ConferenceDetailsStep from './steps/ConferenceDetailsStep'
import ConferenceReviewStep from './steps/ConferenceReviewStep'
import ConferenceTermsStep from './steps/ConferenceTermsStep'

const API_ADD_CONFERENCE_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/conference/add`
const CSC_API_KEY = process.env.NEXT_PUBLIC_CSC_API_KEY

const ConferenceForm: React.FC = () => {
  const t = useTranslations('')
  const router = useRouter()
  const pathname = usePathname()

  const {logout} = useAuth();
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

  const [statesForReview, setStatesForReview] = useState<State[]>([])
  const [citiesForReview, setCitiesForReview] = useState<City[]>([])

  const [conferenceDateStartError, setConferenceDateStartError] = useState('')

  // Date options, ADDING 'conferenceDates' back in
  const dateTypeOptions = [
    { value: 'submissionDate', name: t('Submission_Date') },
    { value: 'conferenceDates', name: t('Conference_Dates') }, // Re-added this
    { value: 'registrationDate', name: t('Registration_Date') },
    { value: 'notificationDate', name: t('Notification_Date') },
    { value: 'cameraReadyDate', name: t('Camera_Ready_Date') }
  ]

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
    const updatedDateEntry = { ...newDates[index] }
    ;(updatedDateEntry as any)[field] = value
    newDates[index] = updatedDateEntry
    setDates(newDates)

    if (index === 0 && field === 'fromDate') {
      setConferenceDateStartError('')
    }
  }

  const addDate = () => {
    setDates([...dates, { type: '', name: '', fromDate: '', toDate: '' }])
  }

  const removeDate = (index: number) => {
    if (index !== 0) {
      setDates(dates.filter((_, i) => i !== index))
    }
  }

  const goToNextStep = () => {
    if (currentStep === 1) {
      // --- Basic fields validation ---
      if (!title.trim()) {
        alert(t('Please_enter_the_conference_name'))
        return
      }
      if (!acronym.trim()) {
        alert(t('Please_enter_the_acronym'))
        return
      }
      if (
        !link.trim() ||
        (!link.startsWith('http://') && !link.startsWith('https://'))
      ) {
        alert(t('Please_enter_a_valid_link_starting_with_http_or_https'))
        return
      }
      if (!type) {
        alert(t('Please_select_the_conference_type'))
        return
      }

      // --- Location fields (conditionally required based on type) ---
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

      // --- Dates validation ---
      let conferenceDatesFrom: Date | null = null
      const conferenceDateEntry = dates.find(d => d.type === 'conferenceDates')

      if (
        !conferenceDateEntry ||
        !conferenceDateEntry.fromDate ||
        !conferenceDateEntry.toDate
      ) {
        alert(t('Conference_dates_are_missing_or_invalid'))
        return
      }
      conferenceDatesFrom = new Date(conferenceDateEntry.fromDate)

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      sevenDaysFromNow.setHours(0, 0, 0, 0)

      if (conferenceDatesFrom < sevenDaysFromNow) {
        const errorMessage = t('Conference_Date_Start_Validation')
        setConferenceDateStartError(errorMessage)
        alert(errorMessage)
        return
      } else {
        setConferenceDateStartError('')
      }

      for (let i = 0; i < dates.length; i++) {
        const date = dates[i]
        const dateIdentifier = date.name || `${t('Date_entry')} ${i + 1}`

        if (i > 0) {
          // For user-added dates
          if (!date.name.trim()) {
            alert(t('Please_provide_a_name_for_date_entry', { number: i + 1 }))
            return
          }
          // The selected type MUST NOT be 'conferenceDates' for user-added entries
          // This check is now also enforced by filtering options in ImportantDatesInput
          if (!date.type || date.type === 'conferenceDates') {
            alert(
              t('Please_select_a_type_for_date_entry_or_invalid_type', {
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

        if (new Date(date.toDate) < new Date(date.fromDate)) {
          alert(
            t('End_date_cannot_be_before_start_date_for', {
              name: dateIdentifier
            })
          )
          return
        }
      }

      if (conferenceDatesFrom) {
        for (let i = 0; i < dates.length; i++) {
          const date = dates[i]
          if (date.type === 'conferenceDates') continue

          if (
            [
              'submissionDate',
              'registrationDate',
              'notificationDate',
              'cameraReadyDate'
            ].includes(date.type) &&
            date.toDate
          ) {
            const otherDateEnd = new Date(date.toDate)
            otherDateEnd.setHours(0, 0, 0, 0)
            conferenceDatesFrom.setHours(0, 0, 0, 0)

            if (otherDateEnd >= conferenceDatesFrom) {
              alert(
                t('Important_dates_must_end_before_conference_start', {
                  dateName: date.name || t('Unnamed_Date')
                })
              )
              return
            }
          }
        }
      }
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

    if (currentStep === 3 && !agreedToTerms) {
      alert(t('Please_agree_to_the_terms_and_conditions'))
      return
    }

    // Run step 1 validation if somehow submit is clicked before nexting on step 1
    if (currentStep === 1) {
      goToNextStep() // This will re-validate and potentially block submission
      return // Prevent submission if still on step 1
    }

    // --- NEW: Format Location Address ONLY on submit ---
    const locationForSubmission = { ...location } // Create a mutable copy of the location state
    if (type === 'Offline' || type === 'Hybrid') {
      const originalAddress = locationForSubmission.address.trim()
      const cityStateProvince = locationForSubmission.cityStateProvince.trim()
      const country = locationForSubmission.country.trim()

      let combinedAddressParts = []
      if (originalAddress) combinedAddressParts.push(originalAddress)
      if (cityStateProvince) combinedAddressParts.push(cityStateProvince)
      if (country) combinedAddressParts.push(country)

      locationForSubmission.address = combinedAddressParts.join(', ')
    }

    const conferenceData: ConferenceFormData = {
      title,
      acronym,
      link,
      topics,
      type,
      location: locationForSubmission, // Use the formatted location for submission
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
        if (response.status === 403)
        {
          window.location.reload();
          throw new Error(errorData.message + `, you'll automatically logout`);
        }
        else
        {
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${
              errorData.message || 'Unknown error'
            }`
          )
        }
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

  return (
    <div className='mx-auto px-4 py-8 sm:px-6 lg:px-8'>
      <ConferenceProgressIndicator currentStep={currentStep} t={t} />

      <form
        onSubmit={handleSubmit}
        className='grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-6'
      >
        {currentStep === 1 && (
          <ConferenceDetailsStep
            title={title}
            setTitle={setTitle}
            acronym={acronym}
            setAcronym={setAcronym}
            link={link}
            setLink={setLink}
            type={type}
            setType={setType}
            location={location}
            setLocation={setLocation}
            dates={dates}
            handleDateChange={handleDateChange}
            addDate={addDate}
            removeDate={removeDate}
            topics={topics}
            setTopics={setTopics}
            newTopic={newTopic}
            setNewTopic={setNewTopic}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            description={description}
            setDescription={setDescription}
            dateTypeOptions={dateTypeOptions} // Pass all options
            t={t}
            cscApiKey={CSC_API_KEY || ''}
            setStatesForReview={setStatesForReview}
            setCitiesForReview={setCitiesForReview}
            conferenceDateStartError={conferenceDateStartError}
          />
        )}
        {currentStep === 2 && (
          <ConferenceReviewStep
            title={title}
            acronym={acronym}
            link={link}
            type={type}
            location={location} // This location still holds the original address for review
            dates={dates}
            topics={topics}
            imageUrl={imageUrl}
            description={description}
            t={t}
            statesForReview={statesForReview}
            citiesForReview={citiesForReview}
          />
        )}
        {currentStep === 3 && (
          <ConferenceTermsStep
            agreedToTerms={agreedToTerms}
            setAgreedToTerms={setAgreedToTerms}
            t={t}
          />
        )}

        <div className='col-span-1 mt-6 flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:justify-start'>
          {currentStep > 1 && (
            <button
              type='button'
              onClick={goToPreviousStep}
              className='w-full rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-700 focus:outline-none sm:w-auto'
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
              {t('Add_Conference_Submit')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default ConferenceForm
