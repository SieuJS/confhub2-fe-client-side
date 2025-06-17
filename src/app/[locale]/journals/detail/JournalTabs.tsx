// src/app/[locale]/journal/detail/JournalTabs.tsx
'use client'

import React, { useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { JournalData } from '@/src/models/response/journal.response'

// Hooks (Giả sử bạn có thể tái sử dụng hoặc tạo mới các hook này)
import useSectionNavigation from '@/src/hooks/conferenceDetails/useSectionNavigation'
import useActiveSection from '@/src/hooks/conferenceDetails/useActiveSection'

// Components
import { JournalNav } from './JournalNav'
import { OverviewSection } from './OverviewSection'
import { ImpactFactorSection } from './ImpactFactorSection'
import { HIndexSection } from './HIndexSection'
import { SjrSection } from './SjrSection'
import { SubjectAreaSection } from './SubjectAreaSection'

interface JournalTabsProps {
  journal: JournalData
}

export const JournalTabs: React.FC<JournalTabsProps> = ({ journal }) => {
  const navRef = useRef<HTMLElement>(null)
  const t = useTranslations('')

  // --- Logic điều hướng ---
  const sectionKeys = useMemo(
    () => [
      'overview',
      'impact-factor',
      'h-index',
      'sjr',
      'subject-area-category',
    ],
    []
  )

  const sectionTranslationMap: { [key: string]: string } = {
    overview: 'JournalTabs.overviewTitle',
    'impact-factor': 'JournalTabs.impactFactorTitle',
    'h-index': 'JournalTabs.hIndexTitle',
    sjr: 'JournalTabs.sjrTitle',
    'subject-area-category': 'JournalTabs.subjectAreaTitle',
  }

  // Sử dụng các hook điều hướng tương tự Conference
  const { activeSection, setActiveSection } = useActiveSection({
    navRef,
    updatedSections: sectionKeys,
  })
  useSectionNavigation({ navRef, setActiveSection })

  return (
    <div className='container mx-auto px-0 md:px-4'>
      <JournalNav
        navRef={navRef}
        sectionKeys={sectionKeys}
        activeSection={activeSection}
        sectionTranslationMap={sectionTranslationMap}
        t={t}
      />

      {/* Render các section đã được tách nhỏ */}
      <main>
        <OverviewSection journal={journal} t={t} />
        <ImpactFactorSection journal={journal} t={t} />
        <HIndexSection journal={journal} t={t} />
        <SjrSection journal={journal} t={t} />
        <SubjectAreaSection journal={journal} t={t} />
      </main>
    </div>
  )
}