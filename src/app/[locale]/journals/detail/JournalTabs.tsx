// src/app/[locale]/journal/detail/JournalTabs.tsx
'use client'

import React, { useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { JournalData } from '@/src/models/response/journal.response'

// Hooks
import useSectionNavigation from '@/src/hooks/conferenceDetails/useSectionNavigation'
import useActiveSection from '@/src/hooks/conferenceDetails/useActiveSection'

// === BƯỚC 1: IMPORT CÁC COMPONENT SECTION MỚI ===
import { JournalNav } from './JournalNav'
import { OverviewSection } from './OverviewSection'
import { ImpactFactorSection } from './ImpactFactorSection'
import { HIndexSection } from './HIndexSection'
import { SjrSection } from './SjrSection'
import { SubjectAreaSection } from './SubjectAreaSection'
import { DataSourceSection } from './DataSourceSection'
import { QuartileHistoryChart } from './QuartileHistoryChart' // Biểu đồ Lịch sử Quartile
import { CitationMetricsSection } from './CitationMetricsSection' // Các chỉ số trích dẫn

interface JournalTabsProps {
  journal: JournalData
}

export const JournalTabs: React.FC<JournalTabsProps> = ({ journal }) => {
  const navRef = useRef<HTMLElement>(null)
  const t = useTranslations('')

  // === BƯỚC 2: CẬP NHẬT DANH SÁCH SECTIONKEYS VÀ MAP DỊCH ===
  const sectionKeys = useMemo(
    () =>
      [
        'overview',
        'impact-factor',
        'h-index',
        'sjr',
        'citation-metrics',
        'quartile-history',
        'subject-area-category'
      ].filter(key => {
        // Lọc bỏ các section không có dữ liệu để không hiển thị trên thanh Nav
        if (
          key === 'quartile-history' &&
          (!journal.SupplementaryTable ||
            journal.SupplementaryTable.length === 0)
        ) {
          return false
        }
        // Bạn có thể thêm các điều kiện lọc khác ở đây nếu cần
        return true
      }),
    [journal] // Thêm journal vào dependency để mảng được tính toán lại khi dữ liệu thay đổi
  )

  const sectionTranslationMap: { [key: string]: string } = {
    overview: 'JournalTabs.overviewTitle',
    'impact-factor': 'JournalTabs.impactFactorTitle',
    'h-index': 'JournalTabs.hIndexTitle',
    sjr: 'JournalTabs.sjrTitle',
    'citation-metrics': 'CitationMetrics.navTitle',
    'quartile-history': 'QuartileHistory.navTitle',
    'subject-area-category': 'JournalTabs.subjectAreaTitle'
  }

  const { activeSection, setActiveSection } = useActiveSection({
    navRef,
    updatedSections: sectionKeys
  })
  // useSectionNavigation({ navRef, setActiveSection })

  return (
    <div className='container mx-auto px-0 md:px-4'>
      <JournalNav
        navRef={navRef}
        sectionKeys={sectionKeys}
        activeSection={activeSection}
        sectionTranslationMap={sectionTranslationMap}
        t={t}
      />

      <main>
        {/* === BƯỚC 3: RENDER TẤT CẢ CÁC SECTION THEO ĐÚNG THỨ TỰ LOGIC === */}

        {/* 1. Tổng quan chung */}
        <div id='overview' className='scroll-mt-20'>
          <OverviewSection journal={journal} t={t} />
        </div>

        {/* 2. Các chỉ số chính */}
        <div id='impact-factor' className='scroll-mt-20'>
          <ImpactFactorSection journal={journal} t={t} />
        </div>
        <div id='h-index' className='scroll-mt-20'>
          <HIndexSection journal={journal} t={t} />
        </div>
        <div id='sjr' className='scroll-mt-20'>
          <SjrSection journal={journal} t={t} />
        </div>

        {/* 3. Các chỉ số trích dẫn chi tiết */}
        <div id='citation-metrics' className='scroll-mt-20'>
          <CitationMetricsSection journal={journal} t={t} />
        </div>

        {/* 4. Lịch sử xếp hạng (chỉ hiển thị khi có dữ liệu) */}
        {journal.SupplementaryTable &&
          journal.SupplementaryTable.length > 0 && (
            <div id='quartile-history' className='scroll-mt-20'>
              <QuartileHistoryChart data={journal.SupplementaryTable} t={t} />
            </div>
          )}

        {/* 5. Phân loại lĩnh vực */}
        <div id='subject-area-category' className='scroll-mt-20'>
          <SubjectAreaSection journal={journal} t={t} />
        </div>

        {/* 6. Nguồn dữ liệu (chỉ hiển thị khi có link) */}
        {journal.scimagoLink && (
          // <div id='overview' className='scroll-mt-20'>

          <DataSourceSection scimagoLink={journal.scimagoLink} t={t} />
          // </div>
        )}
      </main>
    </div>
  )
}
