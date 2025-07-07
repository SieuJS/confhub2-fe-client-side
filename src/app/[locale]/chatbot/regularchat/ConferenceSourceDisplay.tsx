// src/app/[locale]/chatbot/regularchat/ConferenceSourceDisplay.tsx
import React, { useState } from 'react'
import { Link } from '@/src/navigation' // Sử dụng Link từ next-intl/navigation
import {
  ExternalLink,
  CalendarDays,
  MapPin,
  Award,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { DisplayConferenceSourcesPayload } from '../lib/regular-chat.types'
import type { AppPathname } from '@/src/navigation' // Import AppPathname for clarity if needed, though not strictly necessary for the fix itself

interface ConferenceSourceDisplayProps {
  payload: DisplayConferenceSourcesPayload
}

const ConferenceSourceCard: React.FC<
  DisplayConferenceSourcesPayload['conferences'][0]
> = conference => {
  const t = useTranslations('Chatbot') // Namespace cho translations
  // const locale = useLocale(); // locale is not used in this component, can be removed if not needed elsewhere

  // Remove the old detailUrl string construction:
  // const detailUrl = `/conferences/detail?id=${conference.id}`;

  // Define the pathname that matches your pathnames configuration
  const detailPathname: AppPathname = '/conferences/detail'

  return (
    <div className='mb-2 rounded-lg border border-gray-200 bg-white-pure p-3 shadow-sm transition-all hover:shadow-md dark:border-gray-700  dark:hover:border-gray-600'>
      <h4 className='mb-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400'>
        <Link
          href={{
            pathname: detailPathname,
            query: { id: conference.id.toString() } // Ensure id is a string for query params
          }}
          className='hover:underline'
        >
          {conference.title} {conference.acronym && `(${conference.acronym})`}
        </Link>
      </h4>
      <div className='space-y-1 text-xs '>
        {conference.conferenceDates && (
          <div className='flex items-center'>
            <CalendarDays size={14} className='mr-1.5 flex-shrink-0 ' />
            <span>{conference.conferenceDates}</span>
          </div>
        )}
        {conference.location && conference.location !== 'N/A' && (
          <div className='flex items-center'>
            <MapPin size={14} className='mr-1.5 flex-shrink-0 ' />
            <span>{conference.location}</span>
          </div>
        )}
        {conference.rank && conference.rank !== 'N/A' && (
          <div className='flex items-center'>
            <Award size={14} className='mr-1.5 flex-shrink-0 ' />
            <span>
              {t('Rank')}: {conference.rank}{' '}
              {conference.source && `(${conference.source})`}
            </span>
          </div>
        )}
      </div>
      <div className='mt-2.5 flex justify-end'>
        <Link
          href={{
            pathname: detailPathname,
            query: { id: conference.id.toString() } // Ensure id is a string for query params
          }}
          className='dark:focus:ring-offset-gray-850 inline-flex items-center rounded-md bg-gray-10 px-2.5 py-1 text-xs font-medium  transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1  dark:hover:bg-gray-600'
        >
          {t('View_Details')}
          <ExternalLink size={12} className='ml-1' />
        </Link>
      </div>
    </div>
  )
}

// ... rest of the ConferenceSourceDisplay component remains the same
const MAX_INITIAL_DISPLAY_SOURCES = 2

const ConferenceSourceDisplay: React.FC<ConferenceSourceDisplayProps> = ({
  payload
}) => {
  const t = useTranslations('Chatbot')
  const [isExpanded, setIsExpanded] = useState(false)

  if (!payload || !payload.conferences || payload.conferences.length === 0) {
    return null
  }

  const totalConferences = payload.conferences.length
  const conferencesToDisplay = isExpanded
    ? payload.conferences
    : payload.conferences.slice(0, MAX_INITIAL_DISPLAY_SOURCES)
  const canToggle = totalConferences > MAX_INITIAL_DISPLAY_SOURCES

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div className='conference-sources-wrapper my-2 rounded-md border border-sky-300 bg-sky-50 p-2.5 dark:border-sky-700 dark:bg-sky-900/30'>
      {payload.title && (
        <p className='mb-2 text-xs font-medium text-sky-700 dark:text-sky-300'>
          <Info size={14} className='mr-1 inline-block' />
          {payload.title}
        </p>
      )}
      <div
        className={`space-y-1 ${!isExpanded && totalConferences > MAX_INITIAL_DISPLAY_SOURCES ? 'overflow-hidden' : ''}`}
      >
        {conferencesToDisplay.map(conf => (
          <ConferenceSourceCard key={conf.id} {...conf} />
        ))}
      </div>

      {canToggle && (
        <div className='mt-2 flex justify-center'>
          <button
            onClick={toggleExpand}
            className='flex items-center rounded-md px-3 py-1.5 text-xs font-medium text-sky-600 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 dark:text-sky-400 dark:hover:bg-sky-800 dark:focus:ring-offset-sky-900/30'
            aria-expanded={isExpanded}
            aria-controls='conference-source-list'
          >
            {isExpanded ? (
              <>
                {t('Show_Less')}
                <ChevronUp size={14} className='ml-1' />
              </>
            ) : (
              <>
                {t('Show_More_Count', {
                  count: totalConferences - MAX_INITIAL_DISPLAY_SOURCES
                })}
                <ChevronDown size={14} className='ml-1' />
              </>
            )}
          </button>
        </div>
      )}

      <p className='mt-2.5 text-center text-[11px] '>
        {t('Source_Disclaimer')}
      </p>
    </div>
  )
}

export default ConferenceSourceDisplay
