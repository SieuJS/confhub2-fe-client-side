// src/app/[locale]/journal/detail/DataSourceSection.tsx
'use client'

import React from 'react'
import { Info, ExternalLink } from 'lucide-react'

interface DataSourceSectionProps {
  scimagoLink: string
  t: (key: string) => string
}

export const DataSourceSection: React.FC<DataSourceSectionProps> = ({
  scimagoLink,
  t,
}) => {
  return (
    <section id='data-source' className='py-8 md:py-12'>
      <div className='rounded-lg bg-muted/50 p-6'>
        <div className='flex items-center gap-3'>
          <Info className='h-5 w-5 flex-shrink-0 text-foreground' />
          <h3 className='text-lg font-semibold text-foreground'>
            {t('DataSource.title')}
          </h3>
        </div>
        <p className='mt-2 text-muted-foreground'>
          {t('DataSource.description')}{' '}
          <a
            href={scimagoLink}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center font-medium text-primary underline-offset-4 hover:underline'
          >
            Scimago Journal & Country Rank
            <ExternalLink className='ml-1 h-4 w-4' />
          </a>
          .
        </p>
      </div>
    </section>
  )
}