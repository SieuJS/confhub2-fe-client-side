// src/app/[locale]/addconference/components/steps/ConferenceReviewStep.tsx
import React from 'react'
import {
  LocationInput,
  ImportantDateInput,
  City,
  State
} from '@/src/models/send/addConference.send'

interface ConferenceReviewStepProps {
  title: string
  acronym: string
  link: string
  type: 'Offline' | 'Online' | 'Hybrid'
  location: LocationInput
  dates: ImportantDateInput[]
  topics: string[]
  imageUrl: string
  description: string
  t: (key: string) => string
  statesForReview: State[]
  citiesForReview: City[]
}

const ConferenceReviewStep: React.FC<ConferenceReviewStepProps> = ({
  title,
  acronym,
  link,
  type,
  location,
  dates,
  topics,
  imageUrl,
  description,
  t,
  statesForReview,
  citiesForReview
}) => {
  // Helper function to format the address for display in review
  const getFormattedAddressForDisplay = () => {
    if (type === 'Online') {
      return t('Not_applicable_for_online')
    }

    const originalAddress = location.address.trim()
    const cityStateProvince = location.cityStateProvince.trim()
    const country = location.country.trim()

    let combinedAddressParts = []
    if (originalAddress) combinedAddressParts.push(originalAddress)
    if (cityStateProvince) combinedAddressParts.push(cityStateProvince)
    if (country) combinedAddressParts.push(country)

    return combinedAddressParts.join(', ') || t('Not_provided')
  }

  return (
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
      {/* Updated to use the helper function for address display */}
      <p>
        <strong>{t('Address')}:</strong> {getFormattedAddressForDisplay()}
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
          {statesForReview.length > 0 ||
          (!statesForReview.length &&
            !citiesForReview.length &&
            location.cityStateProvince)
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
}

export default ConferenceReviewStep
