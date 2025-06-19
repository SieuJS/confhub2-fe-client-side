// src/app/[locale]/journal/detail/HIndexSection.tsx
import { JournalData } from '@/src/models/response/journal.response'
import Image from 'next/image'
import React from 'react'

interface Props {
  journal: JournalData
  t: (key: string) => string
}

export const HIndexSection: React.FC<Props> = ({ journal, t }) => (
  <section
    id='h-index'
    className='border-border scroll-mt-28 border-b py-8 md:py-12'
  >
    <h2 className='mb-4 text-2xl font-bold  md:text-3xl'>
      {t('JournalTabs.hIndexTitle')}
    </h2>
    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
      <div className='flex flex-col items-center'>
        <p className='text-muted-foreground mb-4 text-lg'>
          {t('JournalTabs.hIndexValueIs')}
          <strong className='ml-2 text-3xl font-bold '>
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
      <div className='  max-w-none '>
        <h3 className='text-xl font-semibold '>
          {t('JournalTabs.whatIsHIndex')}
        </h3>
        <p className='py-4'>{t('JournalTabs.hIndexDefinition')}</p>
        <blockquote className='bg-primary/10 border-l-4 border-primary p-8'>
          <p className='font-semibold italic'>
            {t('JournalTabs.hIndexFormula')}
          </p>
        </blockquote>
        <p className='py-4'>{t('JournalTabs.hIndexExample')}</p>
      </div>
    </div>
  </section>
)
