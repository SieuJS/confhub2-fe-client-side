// src/app/[locale]/conferences/detail/SourceRankSection.tsx
'use client'

import React from 'react'
import { GroupedRankInfo } from '@/src/hooks/conferenceDetails/useFormatConferenceData'

interface SourceRankSectionProps {
  processedRanks: GroupedRankInfo[]
  t: (key: string) => string
}

export const SourceRankSection: React.FC<SourceRankSectionProps> = ({
  processedRanks,
  t
}) => {
  return (
    <section
      id='source-rank'
      className='mt-6 rounded-lg bg-white-pure px-2 py-4 shadow-md  md:px-4'
    >
      <h2 className='mb-6 text-xl font-semibold md:text-2xl '>
        {t('Source_Rank')}
      </h2>
      {processedRanks.length > 0 ? (
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
        <p className=''>{t('No_source_rank_information_available')}</p>
      )}
    </section>
  )
}