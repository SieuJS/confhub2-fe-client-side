// src/app/[locale]/journal/detail/OverviewSection.tsx
import { JournalData } from '@/src/models/response/journal.response'
import React from 'react'

interface Props {
  journal: JournalData
  t: (key: string) => string
}

export const OverviewSection: React.FC<Props> = ({ journal, t }) => (
  <section id='overview' className='scroll-mt-28 border-b border-border py-8 md:py-12'>
    <h2 className='mb-4 text-2xl font-bold text-foreground md:text-3xl'>
      {t('JournalTabs.overviewTitle')}
    </h2>
    <div className='prose max-w-none text-muted-foreground dark:prose-invert'>
      <p>
        {journal.Scope ?? journal['Additional Info']?.slice(5) ?? t('JournalTabs.noOverview')}
      </p>
    </div>
  </section>
)