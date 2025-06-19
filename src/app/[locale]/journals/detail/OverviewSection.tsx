// src/app/[locale]/journal/detail/OverviewSection.tsx
import { JournalData } from '@/src/models/response/journal.response'
import React from 'react'

interface Props {
  journal: JournalData
  t: (key: string) => string
}

export const OverviewSection: React.FC<Props> = ({ journal, t }) => (
  <section
    id='overview'
    className='border-border scroll-mt-28 border-b py-8 md:py-12'
  >
    <h2 className='text-foreground mb-4 text-2xl font-bold md:text-3xl'>
      {t('JournalTabs.overviewTitle')}
    </h2>
    <div className=' max-w-none '>
      <p>
        {journal.Scope ??
          journal['Additional Info']?.slice(5) ??
          t('JournalTabs.noOverview')}
      </p>
    </div>
  </section>
)
