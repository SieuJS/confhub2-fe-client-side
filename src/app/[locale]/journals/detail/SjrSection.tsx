// src/app/[locale]/journal/detail/SjrSection.tsx
import { JournalData } from '@/src/models/response/journal.response'
import Image from 'next/image'
import React from 'react'

interface Props {
  journal: JournalData
  t: (key: string) => string
}

export const SjrSection: React.FC<Props> = ({ journal, t }) => (
  <section id='sjr' className='scroll-mt-28 border-b border-border py-8 md:py-12'>
    <h2 className='mb-4 text-2xl font-bold text-foreground md:text-3xl'>
      {t('JournalTabs.sjrTitle')}
    </h2>
    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
      <div className='flex flex-col items-center'>
        <p className='mb-4 text-lg text-muted-foreground'>
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
      <div className='prose max-w-none text-muted-foreground dark:prose-invert'>
        <h3 className='text-xl font-semibold text-foreground'>
          {t('JournalTabs.whatIsSjr')}
        </h3>
        <p>{t('JournalTabs.sjrDefinition')}</p>
        <blockquote className='border-l-4 border-primary bg-primary/10 p-4'>
          <p className='font-semibold italic'>
            {t('JournalTabs.sjrFormula')}
          </p>
        </blockquote>
        <p>{t('JournalTabs.sjrExample')}</p>
      </div>
    </div>
  </section>
)