// src/app/[locale]/conferences/detail/OverviewSection.tsx
'use client'

import React from 'react'

interface OverviewSectionProps {
  summary: string | undefined | null
  t: (key: string) => string
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  summary,
  t
}) => {
  return (
    <section
      id='overview'
      className='mt-4 rounded-lg bg-white-pure px-2 py-4 shadow-md  md:px-4'
    >
      <h2 className='mb-4 text-xl font-semibold md:text-2xl '>
        {t('Overview')}
      </h2>
      <p className='leading-relaxed '>{summary || t('No_summary_available')}</p>
    </section>
  )
}