// src/app/[locale]/journal/detail/HIndexSection.tsx
import { JournalData } from '@/src/models/response/journal.response'
import Image from 'next/image'
import React from 'react'

interface Props {
  journal: JournalData
  t: (key: string) => string
}

export const HIndexSection: React.FC<Props> = ({ journal, t }) => (
  <section id='h-index' className='scroll-mt-28 border-b border-border py-8 md:py-12'>
    <h2 className='mb-4 text-2xl font-bold text-foreground md:text-3xl'>
      {t('JournalTabs.hIndexTitle')}
    </h2>
    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
      <div className='flex flex-col items-center'>
        <p className='mb-4 text-lg text-muted-foreground'>
          {t('JournalTabs.hIndexValueIs')}
          <strong className='ml-2 text-3xl font-bold text-primary'>
            {journal['H index'] || 'N/A'}
          </strong>
        </p>
        <div className='relative aspect-square w-full max-w-xs'>
          <Image
            src='/Hindex.png'
            alt='H-index Illustration'
            layout='fill'
            objectFit='contain'
          />
        </div>
      </div>
      <div className='prose max-w-none text-muted-foreground dark:prose-invert'>
        <h3 className='text-xl font-semibold text-foreground'>
          {t('JournalTabs.whatIsHIndex')}
        </h3>
        <p>{t('JournalTabs.hIndexDefinition')}</p>
        <blockquote className='border-l-4 border-primary bg-primary/10 p-4'>
          <p className='font-semibold italic'>
            {t('JournalTabs.hIndexFormula')}
          </p>
        </blockquote>
        <p>{t('JournalTabs.hIndexExample')}</p>
      </div>
    </div>
  </section>
)