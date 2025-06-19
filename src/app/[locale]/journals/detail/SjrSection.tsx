// src/app/[locale]/journal/detail/SjrSection.tsx
import { JournalData } from '@/src/models/response/journal.response'
import Image from 'next/image'
import React from 'react'

interface Props {
  journal: JournalData
  t: (key: string) => string
}

export const SjrSection: React.FC<Props> = ({ journal, t }) => (
  <section
    id='sjr'
    className='border-border scroll-mt-28 border-b py-8 md:py-12'
  >
    <h2 className='text-foreground mb-4 text-2xl font-bold md:text-3xl'>
      {t('JournalTabs.sjrTitle')}
    </h2>
    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
      <div className='flex flex-col items-center'>
        <p className='text-muted-foreground mb-4 text-lg'>
          {t('JournalTabs.sjrValueIs')}
          <strong className='ml-2 text-3xl font-bold text-primary'>
            {journal.SJR || 'N/A'}
          </strong>
        </p>
        <div className='relative aspect-square w-full max-w-xs overflow-hidden rounded-lg shadow-md'>
          <Image
            src='/SJRCard.jpg'
            alt='SJR Illustration'
            layout='fill'
            objectFit='cover'
          />
        </div>
      </div>
      <div className=' max-w-none '>
        <h3 className='text-foreground text-xl font-semibold'>
          {t('JournalTabs.whatIsSjr')}
        </h3>
        <p className='py-4'>{t('JournalTabs.sjrDefinition')}</p>
        <blockquote className='bg-primary/10 border-l-4 border-primary p-8'>
          <p className='font-semibold italic'>{t('JournalTabs.sjrFormula')}</p>
        </blockquote>
        <p className='py-4'>{t('JournalTabs.sjrExample')}</p>
      </div>
    </div>
  </section>
)
