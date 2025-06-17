// src/app/[locale]/journal/detail/SubjectAreaSection.tsx
import { JournalData } from '@/src/models/response/journal.response'
import React from 'react'

interface Props {
  journal: JournalData
  t: (key: string) => string
}

export const SubjectAreaSection: React.FC<Props> = ({ journal, t }) => (
  <section id='subject-area-category' className='scroll-mt-28 py-8 md:py-12'>
    <h2 className='mb-4 text-2xl font-bold text-foreground md:text-3xl'>
      {t('JournalTabs.subjectAreaTitle')}
    </h2>
    <div className='rounded-lg bg-muted/50 p-6'>
      {journal['Subject Area and Category'] ? (
        <div className='space-y-4'>
          <div>
            <h4 className='font-semibold text-foreground'>
              {t('JournalTabs.fieldOfResearch')}
            </h4>
            <p className='text-muted-foreground'>
              {journal['Subject Area and Category']['Field of Research']}
            </p>
          </div>
          <div>
            <h4 className='font-semibold text-foreground'>
              {t('JournalTabs.categories')}
            </h4>
            <div className='mt-2 flex flex-wrap gap-2'>
              {journal['Subject Area and Category'].Topics.map((topic, index) => (
                <span
                  key={index}
                  className='rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary'
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className='text-muted-foreground'>{t('JournalTabs.noSubjectArea')}</p>
      )}
    </div>
  </section>
)