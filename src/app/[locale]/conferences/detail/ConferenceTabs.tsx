// src/app/[locale]/conferences/detail/ConferenceTabs.tsx
'use client'

import React, { useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ConferenceResponse } from '../../../../models/response/conference.response'

// Hooks
import useActiveSection from '../../../../hooks/conferenceDetails/useActiveSection'
import { useFormatConferenceData } from '@/src/hooks/conferenceDetails/useFormatConferenceData'

// Utils
import { formatDate as formatDateUtil } from './utils/conferenceUtils'

// Components
import { ConferenceNav } from './ConferenceNav'
import { OverviewSection } from './OverviewSection'
import { ImportantDatesSection } from './ImportantDatesSection'
import { CallForPapersSection } from './CallForPapersSection'
import { SourceRankSection } from './SourceRankSection'
import { MapSection } from './MapSection'

interface ConferenceTabsProps {
  conference: ConferenceResponse | null
}

export const ConferenceTabs: React.FC<ConferenceTabsProps> = ({
  conference
}) => {
  const navRef = useRef<HTMLElement>(null)
  const t = useTranslations('')
  const language = t('language')

  // Centralized data processing hook
  const {
    groupedDates,
    processedRanks,
    summary,
    callForPaper,
    mainLink,
    cfpLink,
    impLink,
    primaryLocation
  } = useFormatConferenceData(conference, t)

  // Create a bound formatDate function to pass to children
  const formatDate = (date: string | null | undefined) =>
    formatDateUtil(date, t, language)

  // --- Navigation Logic ---
  const sectionKeys = useMemo(
    () =>
      conference
        ? [
            'overview',
            'call-for-papers',
            'important-dates',
            ...(conference.ranks ? ['source-rank'] : []),
            'map'
          ]
        : [],
    [conference]
  )

  const sectionTranslationMap: { [key: string]: string } = {
    overview: 'Overview',
    'call-for-papers': 'Call_for_paper',
    'important-dates': 'Important_Dates',
    'source-rank': 'Source_Rank',
    map: 'Map'
  }

  const { activeSection, setActiveSection } = useActiveSection({
    navRef,
    updatedSections: sectionKeys
  })
  // useSectionNavigation({ navRef, setActiveSection })

  if (!conference) {
    return (
      <div className='flex h-40 items-center justify-center'>
        <p className='text-lg '>{t('Loading_conference_details')}</p>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-0 md:px-4'>
      <ConferenceNav
        navRef={navRef}
        sectionKeys={sectionKeys}
        activeSection={activeSection}
        sectionTranslationMap={sectionTranslationMap}
        t={t}
      />

      <div id='overview' className='scroll-mt-28'>
        <OverviewSection summary={summary} t={t} />
      </div>

      <div id='call-for-papers' className='scroll-mt-28'>
        <CallForPapersSection
          callForPaper={callForPaper}
          mainLink={mainLink}
          cfpLink={cfpLink}
          t={t}
        />
      </div>

      <div id='important-dates' className='scroll-mt-28'>
        <ImportantDatesSection
          groupedDates={groupedDates}
          formatDate={formatDate}
          impLink={impLink}
        />
      </div>

      {/* Conditionally render SourceRankSection based on original logic */}
      {conference.ranks && (
        <div id='source-rank' className='scroll-mt-28'>
          <SourceRankSection processedRanks={processedRanks} t={t} />
        </div>
      )}

      <div id='map' className='scroll-mt-28'>
        <MapSection location={primaryLocation?.address} t={t} />
      </div>
    </div>
  )
}
