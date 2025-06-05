// src/app/[locale]/conferences/detail/ConferenceTabs.tsx

'use client'

import React, { useMemo, useRef } from 'react'
import { ConferenceResponse } from '../../../../models/response/conference.response'
import MapDisplay from './Map'
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

type OrgType = ConferenceResponse['organizations'][number]
type RankType = NonNullable<ConferenceResponse['ranks']>[number]

type GroupedDateInfo = {
  name: string
  isNew: boolean
  current: {
    fromDate: string | null | undefined
    toDate: string | null | undefined
  }
  differentOldDates: {
    fromDate: string | null | undefined
    toDate: string | null | undefined
  }[]
}

type GroupedRankInfo = {
  source: string
  rank: string
  fieldsOfResearch: string[]
}

export const ConferenceTabs: React.FC<ConferenceTabsProps> = ({
  conference
}) => {
  const navRef = useRef<HTMLElement>(null)
  const t = useTranslations('')
  const language = t('language')

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return t('TBD')
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return t('Invalid_Date')
      }
      return dateObj.toLocaleDateString(language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return t('Invalid_Date')
    }
  }

  const findLatestOrganization = (): OrgType | null => {
    if (!conference?.organizations || conference.organizations.length === 0)
      return null
    const latestOrg = conference.organizations.reduce(
      (latest: OrgType, current: OrgType): OrgType => {
        let currentCreatedAt: Date | null = null
        try {
          const date = new Date(current.createdAt)
          if (!isNaN(date.getTime())) currentCreatedAt = date
        } catch {}
        let latestCreatedAt: Date | null = null
        try {
          const date = new Date(latest.createdAt)
          if (!isNaN(date.getTime())) latestCreatedAt = date
        } catch {}
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

  const getGroupedDates = (): GroupedDateInfo[] => {
    if (!conference?.organizations || !latestOrganization?.conferenceDates) {
      return []
    }

    const groupedDatesMap = new Map<string, GroupedDateInfo>()
    const latestOrgId = latestOrganization.id
    const olderDateNames = new Set<string>()

    conference.organizations.forEach(org => {
      if (org.id === latestOrgId) return

      if (org.conferenceDates) {
        org.conferenceDates.forEach(oldDateItem => {
          if (oldDateItem?.name) {
            olderDateNames.add(oldDateItem.name)
          }
        })
      }
    })

    latestOrganization.conferenceDates.forEach(dateItem => {
      if (dateItem?.name) {
        const isNewName = !olderDateNames.has(dateItem.name)
        groupedDatesMap.set(dateItem.name, {
          name: dateItem.name,
          isNew: isNewName,
          current: { fromDate: dateItem.fromDate, toDate: dateItem.toDate },
          differentOldDates: []
        })
      }
    })

    const addedOldDates = new Map<string, Set<string>>()
    conference.organizations.forEach(org => {
      if (org.id === latestOrgId) return

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

    const result = Array.from(groupedDatesMap.values())
    result.sort((a, b) => a.name.localeCompare(b.name))
    return result
  }

  const groupedDates = getGroupedDates()

  // --- Process and Group Ranks ---
  const processedRanks = useMemo(() => {
    if (!conference?.ranks || conference.ranks.length === 0) {
      return []
    }

    const rankGroups = new Map<string, GroupedRankInfo>()

    conference.ranks.forEach(rank => {
      const source = rank.source || t('Not_Available')
      const rankValue = rank.rank || t('Not_Available')
      const field = rank.fieldOfResearch

      // Filter out rank entries if fieldOfResearch is UNDEFINED or invalid
      if (
        !field ||
        field.trim() === '' ||
        field.toUpperCase() === 'UNDEFINED'
      ) {
        return // Skip this individual rank item
      }

      const groupKey = `${source}-${rankValue}`

      if (rankGroups.has(groupKey)) {
        const existingGroup = rankGroups.get(groupKey)!
        if (!existingGroup.fieldsOfResearch.includes(field)) {
          existingGroup.fieldsOfResearch.push(field)
        }
      } else {
        rankGroups.set(groupKey, {
          source: source,
          rank: rankValue,
          fieldsOfResearch: [field]
        })
      }
    })

    return Array.from(rankGroups.values())
  }, [conference?.ranks, t])

  const topics = latestOrganization?.topics
  const primaryLocation = latestOrganization?.locations?.[0]
  const summary = latestOrganization?.summary || latestOrganization?.summerize
  const callForPaper = latestOrganization?.callForPaper
  const accessType = latestOrganization?.accessType

  const uniqueFieldsOfResearch = useMemo(() => {
    return conference?.ranks
      ? [
          ...new Set(
            conference.ranks
              .map(rank => rank.fieldOfResearch)
              .filter(
                (field): field is string =>
                  !!field &&
                  field.trim() !== '' &&
                  field.toUpperCase() !== 'UNDEFINED'
              )
          )
        ]
      : []
  }, [conference?.ranks])

  // --- MODIFIED sectionKeys ---
  const sectionKeys = conference
    ? [
        'overview',
        'important-dates',
        'call-for-papers',
        // 'fieldOfResearch-topics',
        ...(conference.ranks ? ['source-rank'] : []), // Include 'source-rank' if conference.ranks array exists (even if empty or all filtered)
        'map'
      ]
    : []
  // --- END MODIFIED sectionKeys ---

  const sectionTranslationMap: { [key: string]: string } = {
    overview: 'Overview',
    'important-dates': 'Important_Dates',
    'call-for-papers': 'Call_for_papers',
    // 'fieldOfResearch-topics': 'FieldOfResearch_and_Topics',
    'source-rank': 'Source_Rank',
    map: 'Map'
  }
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

  return (
    <div className='container mx-auto px-0 md:px-4'>
      <nav
        ref={navRef}
        className='sticky top-14 z-30 flex overflow-x-auto whitespace-nowrap border-b border-gray-200 bg-white-pure bg-opacity-95 py-2 '
      >
        {sectionKeys.map(sectionKey => {
          const hrefId = sectionKey
          const href = `#${hrefId}`
          const translationKey = sectionTranslationMap[sectionKey] || sectionKey
          return (
            <a
              key={sectionKey}
              href={href}
              className={`rounded-lg px-2 py-2 font-medium transition-colors duration-200 md:px-4 ${activeSection === sectionKey ? 'bg-gray-10 text-blue-600 ' : ' hover:bg-gray-10 hover:text-blue-600 '}`}
            >
              {t(translationKey)}
            </a>
          )
        })}
      </nav>

      <section
        id='overview'
        className='mt-4 rounded-lg bg-white-pure px-2 py-4 shadow-md  md:px-4'
      >
        <h2 className='mb-4 text-xl font-semibold md:text-2xl '>
          {t('Overview')}
        </h2>
        <p className='leading-relaxed '>
          {summary || t('No_summary_available')}
        </p>
      </section>

      <section
        id='important-dates'
        className='mt-6 rounded-lg bg-white-pure px-2 py-4 shadow-md  md:px-4'
      >
        <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
          {t('Important_Dates')}
        </h2>
        {!groupedDates || groupedDates.length === 0 ? (
          <p className=''>{t('No_Important_Dates_Available')}</p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='min-w-full border border-gray-300 bg-white-pure text-sm '>
              <thead className='bg-gray-10 '>
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
                  <tr key={groupInfo.name} className='hover:bg-gray-10'>
                    <td className='border-b border-gray-300 px-2 py-4 font-medium md:px-4'>
                      {groupInfo.name}
                      {groupInfo.isNew && (
                        <span className='ml-2 inline-block rounded bg-green-100 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-700'>
                          NEW
                        </span>
                      )}
                    </td>
                    <td className='border-b border-gray-300 px-2 py-4 md:px-4'>
                      {formatDate(groupInfo.current.fromDate)}
                      {groupInfo.differentOldDates.length > 0 && (
                        <span className='ml-2 text-xs text-gray-500'>
                          (
                          {groupInfo.differentOldDates.map((old, i) => (
                            <React.Fragment key={i}>
                              <span className='line-through'>
                                {formatDate(old.fromDate)}
                              </span>
                              {i < groupInfo.differentOldDates.length - 1 &&
                                ', '}
                            </React.Fragment>
                          ))}
                          )
                        </span>
                      )}
                    </td>
                    <td className='border-b border-gray-300 px-2 py-4 md:px-4'>
                      {formatDate(groupInfo.current.toDate)}
                      {groupInfo.differentOldDates.length > 0 && (
                        <span className='ml-2 text-xs '>
                          (
                          {groupInfo.differentOldDates.map((old, i) => (
                            <React.Fragment key={i}>
                              <span className='line-through'>
                                {formatDate(old.toDate)}
                              </span>
                              {i < groupInfo.differentOldDates.length - 1 &&
                                ', '}
                            </React.Fragment>
                          ))}
                          )
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {groupedDates.some(g => g.differentOldDates.length > 0) && (
              <p className='mt-2 text-xs italic '>
                {t(
                  'Strikethrough_values_indicate_different_dates_from_older_records'
                )}
              </p>
            )}
          </div>
        )}
      </section>

      <section
        id='call-for-papers'
        className='mt-6 rounded-lg bg-white-pure px-2 py-4 shadow-md  md:px-4'
      >
        <h2 className='mb-4 text-xl font-semibold md:text-2xl '>
          {t('Call_for_papers')}
        </h2>
        {callForPaper ? (
          <div className='prose prose-sm max-w-none dark:prose-invert sm:prose-base'>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeRaw]}
              components={{
                a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
                  <a {...props} target='_blank' rel='noopener noreferrer' />
                )
              }}
            >
              {callForPaper}
            </ReactMarkdown>
          </div>
        ) : (
          <p className=''>{t('No_call_for_papers_available')}</p>
        )}
      </section>

      {/* <section
        id='fieldOfResearch-topics'
        className='mt-6 rounded-lg bg-white-pure px-2 py-4 shadow-md  md:px-4'
      >
        <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
          {t('FieldOfResearch_and_Topics')}
        </h2>

        <div className='mb-6'>
          <h3 className='mb-2 text-lg font-medium '>
            {t('Field_Of_Research')}
          </h3>
          {uniqueFieldsOfResearch.length > 0 ? (
            <ul className='list-disc pl-5'>
              {uniqueFieldsOfResearch.map((field, index) => (
                <li key={index} className='mb-1'>
                  {field}
                </li>
              ))}
            </ul>
          ) : (
            <p className=''>{t('fieldOfResearch_not_available')}</p>
          )}
        </div>

        <div>
          <h3 className='mb-2 text-lg font-medium '>{t('Topics')}</h3>
          {topics && topics.length > 0 ? (
            <ul className='grid list-disc grid-cols-1 gap-x-12 gap-y-2 pl-5 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2'>
              {topics.map((topic, index) => (
                <li key={index} className='mb-1'>
                  {typeof topic === 'string' ? topic : t('Invalid_Topic')}
                </li>
              ))}
            </ul>
          ) : (
            <p className=''>{t('No_topics_available')}</p>
          )}
        </div>
      </section> */}

      {/* --- MODIFIED Source Rank Section (always visible) --- */}
      <section
        id='source-rank'
        className='mt-6 rounded-lg bg-white-pure px-2 py-4 shadow-md  md:px-4'
      >
        <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
          {t('Source_Rank')}
        </h2>
        {processedRanks.length > 0 ? (
          // Hiển thị các ranks đã xử lý nếu có
          processedRanks.map((group, index) => (
            <div
              key={`${group.source}-${group.rank}-${index}`}
              className='mb-4 border-b border-gray-200 pb-4 last:mb-0 last:border-b-0 last:pb-0'
            >
              <p className=''>
                <strong>{t('Source')}:</strong> {group.source}
              </p>
              <p className=''>
                <strong>{t('Rank')}:</strong> {group.rank}
              </p>
              <p className=''>
                <strong>{t('Field_of_Research')}:</strong>{' '}
                {group.fieldsOfResearch.length > 0
                  ? group.fieldsOfResearch.join(', ')
                  : t('Not_Available')}
              </p>
            </div>
          ))
        ) : (
          // Hiển thị thông báo khi không có thông tin rank hợp lệ
          <p className=''>{t('No_source_rank_information_available')}</p>
        )}
      </section>
      {/* --- END MODIFIED Source Rank Section --- */}

      <section
        id='map'
        className='mt-6 rounded-lg bg-white-pure px-2 py-4 shadow-md  md:px-4'
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
