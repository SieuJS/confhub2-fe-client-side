'use client'

import React, { useRef } from 'react'
import { ConferenceResponse } from '../../../../models/response/conference.response'
// --- RENAME THE IMPORT ---
import MapDisplay from './Map' // Renamed from Map to MapDisplay
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import useSectionNavigation from '../../../../hooks/conferenceDetails/useSectionNavigation'
import useActiveSection from '../../../../hooks/conferenceDetails/useActiveSection'
import { useTranslations } from 'next-intl'
import rehypeRaw from 'rehype-raw'

interface ConferenceTabsProps {
  conference: ConferenceResponse | null
}

// Type alias for the organization type within ConferenceResponse
type OrgType = ConferenceResponse['organizations'][number]

// Type for storing grouped date information for rendering
type GroupedDateInfo = {
  name: string
  current: {
    fromDate: string | null | undefined
    toDate: string | null | undefined
  }
  differentOldDates: {
    fromDate: string | null | undefined
    toDate: string | null | undefined
  }[]
}

export const ConferenceTabs: React.FC<ConferenceTabsProps> = ({
  conference
}) => {
  const navRef = useRef<HTMLElement>(null)
  const t = useTranslations('')
  const language = t('language')

  // --- Helper Functions ---
  const formatDate = (date: string | null | undefined): string => {
    // ... (formatDate implementation remains the same)
    if (!date) return t('TBD')
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return t('Invalid_Date')
      }
      return dateObj.toLocaleDateString(language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return t('Invalid_Date')
    }
  }

  // --- Find the LATEST organization based on createdAt ---
  const findLatestOrganization = (): OrgType | null => {
    // ... (findLatestOrganization implementation remains the same)
    if (!conference?.organizations || conference.organizations.length === 0)
      return null
    const latestOrg = conference.organizations.reduce(
      (latest: OrgType, current: OrgType): OrgType => {
        let currentCreatedAt: Date | null = null
        try {
          const date = new Date(current.createdAt)
          if (!isNaN(date.getTime())) currentCreatedAt = date
        } catch { }
        let latestCreatedAt: Date | null = null
        try {
          const date = new Date(latest.createdAt)
          if (!isNaN(date.getTime())) latestCreatedAt = date
        } catch { }
        if (
          currentCreatedAt &&
          (!latestCreatedAt || currentCreatedAt > latestCreatedAt)
        )
          return current
        return latest
      },
      conference.organizations[0]
    )
    return latestOrg
  }

  const latestOrganization = findLatestOrganization()

  // --- Prepare Grouped Dates for the "Important Dates" Section ---
  const getGroupedDates = (): GroupedDateInfo[] => {
    if (!conference?.organizations || !latestOrganization?.conferenceDates) {
      return []
    }

    // --- THIS LINE NOW WORKS ---
    // It correctly refers to the built-in JavaScript Map constructor
    const groupedDatesMap = new Map<string, GroupedDateInfo>()
    // ---

    const latestOrgId = latestOrganization.id

    // 1. Populate map with current dates
    latestOrganization.conferenceDates.forEach(dateItem => {
      if (dateItem?.name) {
        groupedDatesMap.set(dateItem.name, {
          name: dateItem.name,
          current: { fromDate: dateItem.fromDate, toDate: dateItem.toDate },
          differentOldDates: []
        })
      }
    })

    // Set to track unique old dates added per name
    const addedOldDates = new Map<string, Set<string>>()

    // 2. Iterate through ALL orgs to find different old dates
    conference.organizations.forEach(org => {
      if (org.id === latestOrgId) return // Skip latest

      if (org.conferenceDates) {
        org.conferenceDates.forEach(oldDateItem => {
          const groupInfo = oldDateItem?.name
            ? groupedDatesMap.get(oldDateItem.name)
            : undefined

          if (groupInfo) {
            const current = groupInfo.current
            const oldFrom = oldDateItem.fromDate
            const oldTo = oldDateItem.toDate
            const isDifferent =
              current.fromDate !== oldFrom || current.toDate !== oldTo

            if (isDifferent) {
              const oldDateKey = `${oldFrom || 'null'}|${oldTo || 'null'}`
              if (!addedOldDates.has(groupInfo.name)) {
                addedOldDates.set(groupInfo.name, new Set<string>())
              }
              const nameSet = addedOldDates.get(groupInfo.name)!

              if (!nameSet.has(oldDateKey)) {
                groupInfo.differentOldDates.push({
                  fromDate: oldFrom,
                  toDate: oldTo
                })
                nameSet.add(oldDateKey)
              }
            }
          }
        })
      }
    })

    // 4. Convert map to array and sort
    const result = Array.from(groupedDatesMap.values())
    result.sort((a, b) => a.name.localeCompare(b.name))
    return result
  }

  const groupedDates = getGroupedDates()

  // --- Other Data Extraction (remains the same) ---
  const ranks = conference?.ranks
  const topics = latestOrganization?.topics
  const primaryLocation = latestOrganization?.locations?.[0]
  const summary = latestOrganization?.summary || latestOrganization?.summerize
  const callForPaper = latestOrganization?.callForPaper
  const accessType = latestOrganization?.accessType

  // --- Hooks (remain the same) ---
  const sectionKeys = conference
    ? [
      'overview',
      'important-dates',
      'call-for-papers',
      'category-topics',
      ...(ranks && ranks.length > 0 ? ['source-rank'] : []),
      'map'
    ]
    : []
  const sectionTranslationMap: { [key: string]: string } = {
    overview: 'Overview',
    'important-dates': 'Important_Dates',
    'call-for-papers': 'Call_for_papers',
    'category-topics': 'Category_and_Topics',
    'source-rank': 'Source_Rank',
    map: 'Map'
  } // Renamed 'map' key value for clarity if needed, but not strictly necessary
  const { activeSection, setActiveSection } = useActiveSection({
    navRef,
    updatedSections: sectionKeys
  })
  useSectionNavigation({ navRef, setActiveSection })

  if (!conference) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <p className='text-lg '>{t('Loading_conference_details')}</p>
      </div>
    )
  }

  // --- JSX Rendering ---
  return (
    <div className='container mx-auto px-0 py-8 md:px-4'>
      {/* Navigation (remains the same) */}
      <nav
        ref={navRef}
        className='sticky top-14 z-30 flex overflow-x-auto whitespace-nowrap border-b border-gray-200 bg-white bg-opacity-95 py-2'
      >
        {sectionKeys.map(sectionKey => {
          const hrefId = sectionKey
          const href = `#${hrefId}`
          const translationKey = sectionTranslationMap[sectionKey] || sectionKey
          return (
            <a
              key={sectionKey}
              href={href}
              className={`rounded-lg px-2 py-2 font-medium transition-colors duration-200 md:px-4 ${activeSection === sectionKey ? 'bg-gray-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'}`}
            >
              {t(translationKey)}
            </a>
          )
        })}
      </nav>

      {/* Overview Section (remains the same) */}
      <section
        id='overview'
        className='mt-4 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
      >
        <h2 className='mb-4 text-xl font-semibold md:text-2xl '>
          {t('Overview')}
        </h2>
        <p className='leading-relaxed '>
          {summary || t('No_summary_available')}
        </p>
      </section>

      {/* Important Dates Section (Rendering logic remains the same) */}
      <section
        id='important-dates'
        className='mt-6 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
      >
        <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
          {t('Important_Dates')}
        </h2>
        {!groupedDates || groupedDates.length === 0 ? (
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
                {groupedDates.map(groupInfo => (
                  <tr key={groupInfo.name} className='hover:bg-gray-50'>
                    <td className='border-b border-gray-300 px-2 py-4 font-medium md:px-4'>
                      {groupInfo.name}
                    </td>
                    <td className='border-b border-gray-300 px-2 py-4 md:px-4'>
                      {formatDate(groupInfo.current.fromDate)}
                      {groupInfo.differentOldDates.length > 0 && (
                        <span className='ml-2 text-xs text-gray-500'>
                          (
                          {groupInfo.differentOldDates
                            .filter(
                              old => old.fromDate !== groupInfo.current.fromDate
                            )
                            .map((old, index, arr) => (
                              <React.Fragment key={`from-${index}`}>
                                <span className='italic line-through'>
                                  {formatDate(old.fromDate)}
                                </span>
                                {index <
                                  arr.filter(
                                    o =>
                                      o.fromDate !== groupInfo.current.fromDate
                                  ).length -
                                  1 && ', '}
                              </React.Fragment>
                            ))}
                          {groupInfo.differentOldDates.some(
                            old => old.fromDate !== groupInfo.current.fromDate
                          )}
                          )
                        </span>
                      )}
                    </td>
                    <td className='border-b border-gray-300 px-2 py-4 md:px-4'>
                      {formatDate(groupInfo.current.toDate)}
                      {groupInfo.differentOldDates.length > 0 && (
                        <span className='ml-2 text-xs text-gray-500'>
                          (
                          {groupInfo.differentOldDates
                            .filter(
                              old => old.toDate !== groupInfo.current.toDate
                            )
                            .map((old, index, arr) => (
                              <React.Fragment key={`to-${index}`}>
                                <span className='italic line-through'>
                                  {formatDate(old.toDate)}
                                </span>
                                {index <
                                  arr.filter(
                                    o => o.toDate !== groupInfo.current.toDate
                                  ).length -
                                  1 && ', '}
                              </React.Fragment>
                            ))}
                          {groupInfo.differentOldDates.some(
                            old => old.toDate !== groupInfo.current.toDate
                          )}
                          )
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {groupedDates.some(g => g.differentOldDates.length > 0) && (
              <p className='mt-2 text-xs italic text-gray-500'>
                {t(
                  'Strikethrough_values_indicate_different_dates_from_older_records'
                )}
              </p>
            )}
          </div>
        )}
      </section>

      {/* Other Sections (remain the same) */}
      <section
        id='call-for-papers'
        className='mt-6 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
      >
        <h2 className='mb-4 text-xl font-semibold md:text-2xl '>
          {t('Call_for_papers')}
        </h2>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={{

            // Customize components (optional, for more control)
            p: ({ node, ...props }) => <p className='mb-2' {...props} />, // Add margin to paragraphs
            a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
              <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline" />
            ),
            // Add more component overrides as needed (ul, ol, li, code, etc.)
            pre: ({ node, ...props }) => (
              <pre
                className='overflow-x-auto rounded-md bg-gray-100 p-2'
                {...props}
              />
            ),
            code: ({ node, ...props }) => (
              <code className='rounded bg-gray-100 px-1' {...props} />
            ),
            h1: ({ node, ...props }) => (
              <h1 className='my-4 text-2xl font-bold' {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className='my-3 text-xl font-semibold' {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className='my-2 text-lg font-medium' {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className='my-2 list-inside list-disc' {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className='my-2 list-inside list-decimal' {...props} />
            ),
            li: ({ node, ...props }) => <li className='my-1' {...props} />
          }}
        >
          {callForPaper || t('No_call_for_papers_available')}
        </ReactMarkdown>
      </section>
      <section
        id='category-topics'
        className='mt-6 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
      >
        <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
          {t('Category_and_Topics')}
        </h2>
        <div className='mb-6'>
          <h3 className='mb-2 text-xl font-medium '>{t('Category')}</h3>
          <p className=''>{accessType || t('Category_not_available')}</p>
        </div>
        <div>
          <h3 className='mb-2 text-xl font-medium '>{t('Topics')}</h3>
          {topics && topics.length > 0 ? (
            <ul className='grid list-disc grid-cols-1 gap-x-12 gap-y-2 pl-8 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2'>
              {topics.map((topic, index) => (
                <li key={index}>
                  {typeof topic === 'string' ? topic : t('Invalid_Topic')}
                </li>
              ))}
            </ul>
          ) : (
            <p className=''>{t('No_topics_available')}</p>
          )}
        </div>
      </section>
      {ranks && ranks.length > 0 && (
        <section
          id='source-rank'
          className='mt-6 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
        >
          <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
            {t('Source_Rank')}
          </h2>
          {ranks.map((rank, index) => (
            <div
              key={`${rank.source}-${rank.rank}-${index}`}
              className='mb-4 border-b border-gray-200 pb-4 last:mb-0 last:border-b-0 last:pb-0'
            >
              <p className='text-gray-700'>
                <strong>{t('Source')}:</strong>{' '}
                {rank.source || t('Not_Available')}
              </p>
              <p className='text-gray-700'>
                <strong>{t('Rank')}:</strong> {rank.rank || t('Not_Available')}
              </p>
              <p className='text-gray-700'>
                <strong>{t('Field_of_Research')}:</strong>{' '}
                {rank.fieldOfResearch || t('Not_Available')}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Map Section --- USE RENAMED COMPONENT --- */}
      <section
        id='map'
        className='mt-6 rounded-lg bg-white px-2 py-4 shadow-md md:px-4'
      >
        <h2 className='mb-4 text-xl font-semibold md:text-2xl '>{t('Map')}</h2>
        {primaryLocation?.address ? (
          <MapDisplay location={primaryLocation.address} />
        ) : (
          <p className=''>{t('Location_information_is_not_available')}</p>
        )}
      </section>
    </div>
  )
}
