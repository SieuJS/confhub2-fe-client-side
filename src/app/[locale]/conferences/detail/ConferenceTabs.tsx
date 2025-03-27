// ConferenceTabs.tsx
'use client'

import React, { useRef } from 'react'
import { ConferenceResponse } from '../../../../models/response/conference.response'
import Map from './Map'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import useSectionNavigation from '../../../../hooks/conferenceDetails/useSectionNavigation'
import useActiveSection from '../../../../hooks/conferenceDetails/useActiveSection'
import { useTranslations } from 'next-intl'

interface ConferenceTabsProps {
  conference: ConferenceResponse | null
}

export const ConferenceTabs: React.FC<ConferenceTabsProps> = ({
  conference
}) => {
  const navRef = useRef<HTMLElement>(null)
  const t = useTranslations('')
  const language = t('language')
  // Dynamically create the sections array. Include 'source-rank' only if ranks exist.
  // Use keys that can map directly to translation keys (or keep original if needed for IDs)
  const sectionKeys = conference
    ? [
        'overview',
        'important-date',
        'Call for papers', // Keep space for ID matching if necessary, handle href separately
        'category-topics',
        ...(conference.ranks && conference.ranks.length > 0
          ? ['source-rank']
          : []),
        'map'
      ]
    : []

  // Map section keys to translation keys
  const sectionTranslationMap: { [key: string]: string } = {
    overview: 'Overview',
    'important-date': 'Important_Dates', // Reuse existing key
    'Call for papers': 'Call_for_papers',
    'category-topics': 'Category_and_Topics', // Reuse existing key
    'source-rank': 'Source_Rank',
    map: 'Map'
  }

  const { activeSection, setActiveSection } = useActiveSection({
    navRef,
    updatedSections: sectionKeys // Use sectionKeys for tracking active section by ID
  })
  useSectionNavigation({ navRef, setActiveSection })

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return t('TBD')
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      // Use translated string for invalid date
      return t('Invalid_Date')
    }
    // Consider using locale from next-intl if available for formatting consistency
    return dateObj.toLocaleDateString(language, {
      // Keep 'en-US' or make it dynamic based on locale
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!conference) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <p className='text-lg '>{t('Loading_conference_details')}</p>
      </div>
    )
  }

  const organization = conference.organization
  const dates = conference.dates
  const ranks = conference.ranks
  const location = conference.location

  return (
    <div className='container mx-auto px-0 py-8 md:px-4'>
      <nav
        ref={navRef}
        className='sticky top-14 z-30 flex overflow-x-auto whitespace-nowrap border-b border-gray-200 bg-white bg-opacity-95 py-2'
      >
        {sectionKeys.map(sectionKey => {
          // Use the original sectionKey (or a sanitized version) for the href ID
          const hrefId = sectionKey.replace(/\s+/g, '-') // Example: Ensure IDs are valid
          const href = `#${hrefId}`
          const translationKey = sectionTranslationMap[sectionKey] || sectionKey // Fallback to key if map missing

          return (
            <a
              key={sectionKey}
              href={href}
              className={`rounded-lg px-2 py-2 font-medium transition-colors duration-200 md:px-4 ${
                // Compare activeSection (which should match the sectionKey/ID)
                activeSection === sectionKey
                  ? 'bg-gray-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
              }`}
            >
              {/* Use translated name for display */}
              {t(translationKey)}
            </a>
          )
        })}
      </nav>

      {/* Sections - Ensure IDs match the hrefs generated above */}
      <section
        id='overview' // Keep original or sanitized ID
        className='mt-4 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
      >
        <h2 className='mb-4 text-xl font-semibold md:text-2xl '>
          {t('Overview')}
        </h2>
        <p className='leading-relaxed '>
          {organization?.summerize || t('No_summerize_available')}
        </p>
      </section>

      <section
        id='important-date' // Keep original or sanitized ID
        className='mt-6 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
      >
        <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
          {t('Important_Dates')}
        </h2>
        {!dates || dates.length === 0 ? (
          <p className=''>{t('No_Important_Dates_Available')}</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full border border-gray-300 bg-white text-sm'>
              <thead className='bg-gray-100 '>
                <tr>
                  <th className='border-b border-gray-300 px-2 py-3 text-left md:px-4'>
                    {t('Name')}
                  </th>
                  <th className='border-b border-gray-300 px-2 py-3 text-left md:px-4'>
                    {t('From_Date')}
                  </th>
                  <th className='border-b border-gray-300 px-2 py-3 text-left md:px-4'>
                    {t('To_Date')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {dates.map(
                  (dateItem, index) =>
                    dateItem && ( // Check if dateItem is not null
                      <tr key={index} className='hover:bg-gray-50'>
                        <td className='border-b border-gray-300 px-2 py-4 md:px-4'>
                          {/* Use translated 'Not_Available' instead of 'N/A' */}
                          {dateItem?.name || t('Not_Available')}
                        </td>
                        <td className='border-b border-gray-300 px-2 py-4 md:px-4'>
                          {formatDate(dateItem?.fromDate)}
                        </td>
                        <td className='border-b border-gray-300 px-2 py-4 md:px-4'>
                          {formatDate(dateItem?.toDate)}
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Ensure section ID matches href */}
      <section
        id='Call-for-papers' // Example sanitized ID
        className='mt-6 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
      >
        <h2 className='mb-4 text-xl font-semibold md:text-2xl '>
          {t('Call_for_papers')}
        </h2>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]} // Added remarkBreaks
        >
          {organization?.callForPaper || t('No_call_for_papers_available')}
        </ReactMarkdown>
      </section>

      {/* Ensure section ID matches href */}
      <section
        id='category-topics' // Keep original or sanitized ID
        className='mt-6 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
      >
        <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
          {t('Category_and_Topics')}
        </h2>
        <div className='mb-6'>
          <h3 className='mb-2 text-xl font-medium '>{t('Category')}</h3>
          <p className=''>
            {organization?.accessType || t('Category_not_available')}
          </p>
        </div>

        <div>
          <h3 className='mb-2 text-xl font-medium '>{t('Topics')}</h3>
          {organization?.topics && organization.topics.length > 0 ? (
            <ul className='grid list-disc grid-cols-1 gap-2 pl-5  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {organization.topics.map((topic, index) => (
                <li key={index}>{topic}</li>
              ))}
            </ul>
          ) : (
            <p className=''>{t('No_topics_available')}</p>
          )}
        </div>
      </section>

      {/* Source Rank Section (Conditional) */}
      {ranks && ranks.length > 0 && (
        <section
          id='source-rank' // Keep original or sanitized ID
          className='mt-6 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
        >
          <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
            {t('Source_Rank')}
          </h2>
          {ranks.map((rank, index) => (
            <div key={index} className='mb-4 border-b border-gray-200 pb-4'>
              <h3 className='mb-2 text-xl font-medium '>{rank.source}</h3>
              <p className='text-gray-600'>
                <strong>{t('Rank')}:</strong> {rank.rank}
              </p>
              <p className='text-gray-600'>
                <strong>{t('Field_of_Research')}:</strong>{' '}
                {rank.fieldOfResearch}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Ensure section ID matches href */}
      <section
        id='map' // Keep original or sanitized ID
        className='mt-6 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
      >
        <h2 className='mb-4 text-xl font-semibold md:text-2xl '>{t('Map')}</h2>
        {location?.address ? (
          <Map location={location.address} />
        ) : (
          <p className=''>{t('Location_information_is_not_available')}</p>
        )}
      </section>
    </div>
  )
}
