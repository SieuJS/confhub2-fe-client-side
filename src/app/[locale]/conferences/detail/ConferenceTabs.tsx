// src/app/[locale]/conferences/detail/ConferenceTabs.tsx
'use client'

import React, { useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { ConferenceResponse } from '../../../../models/response/conference.response'

// Hooks
import useSectionNavigation from '../../../../hooks/conferenceDetails/useSectionNavigation'
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
            'important-dates',
            'call-for-papers',
            ...(conference.ranks ? ['source-rank'] : []),
            'map'
          ]
        : [],
    [conference]
  )

  const sectionTranslationMap: { [key: string]: string } = {
    overview: 'Overview',
    'important-dates': 'Important_Dates',
    'call-for-papers': 'Call_for_papers',
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
      <ConferenceNav
        navRef={navRef}
        sectionKeys={sectionKeys}
        activeSection={activeSection}
        sectionTranslationMap={sectionTranslationMap}
        t={t}
      />

      <OverviewSection summary={summary} t={t} />

      <ImportantDatesSection
        groupedDates={groupedDates}
        formatDate={formatDate}
        t={t}
      />

      <CallForPapersSection callForPaper={callForPaper} t={t} />

      {/* Conditionally render SourceRankSection based on original logic */}
      {conference.ranks && (
        <SourceRankSection processedRanks={processedRanks} t={t} />
      )}

      <MapSection location={primaryLocation?.address} t={t} />
    </div>
  )
}