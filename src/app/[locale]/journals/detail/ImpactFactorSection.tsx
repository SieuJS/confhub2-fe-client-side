// src/app/[locale]/journal/detail/ImpactFactorSection.tsx
import { JournalData } from '@/src/models/response/journal.response'
import React from 'react'

interface Props {
  journal: JournalData
  t: (key: string) => string
}

export const ImpactFactorSection: React.FC<Props> = ({ journal, t }) => (
  <section
    id='impact-factor'
    className='border-border scroll-mt-28 border-b py-8 md:py-12'
  >
    <h2 className='text-foreground mb-4 text-2xl font-bold md:text-3xl'>
      {t('JournalTabs.impactFactorTitle')}
    </h2>
    <div className=' mb-6 max-w-none '>
      {/* <p>
        {t('JournalTabs.impactFactorIntro', {
          year: journal.bioxbio?.[0]?.Year || new Date().getFullYear(),
          title: journal.Title,
          value: journal.bioxbio?.[0]?.Impact_factor || 'N/A',
        })}
        {journal.bioxbio && (
          <span>
            {t('JournalTabs.impactFactorComputedIn', {
              year: parseInt(journal.bioxbio[0]?.Year || '2023') + 1,
            })}
          </span>
        )}
      </p> */}
      <p>{t('JournalTabs.impactFactorDefinition')}</p>
    </div>

    <div className='bg-muted/50 grid grid-cols-1 gap-8 rounded-lg p-6 md:grid-cols-2'>
      {/* Cột trái: Bảng */}
      <div>
        <div className='border-border overflow-x-auto rounded-lg border'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-muted text-muted-foreground'>
              <tr>
                <th scope='col' className='px-6 py-3 font-semibold'>
                  {t('JournalTabs.year')}
                </th>
                <th scope='col' className='px-6 py-3 font-semibold'>
                  {t('JournalTabs.impactFactor')}
                </th>
              </tr>
            </thead>
            <tbody>
              {journal.bioxbio?.map((history, index) => (
                <tr
                  key={index}
                  className='border-border border-t bg-background'
                >
                  <td className='px-6 py-3'>{history.Year}</td>
                  <td className='px-6 py-3 font-medium'>
                    {history.Impact_factor}
                  </td>
                </tr>
              ))}
              {(!journal.bioxbio || journal.bioxbio.length === 0) && (
                <tr className='border-border border-t bg-background'>
                  <td className='px-6 py-4 text-center' colSpan={2}>
                    {t('JournalTabs.noHistory')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Cột phải: Giải thích */}
      <div className=' max-w-none  '>
        <h3 className='text-foreground text-xl font-semibold'>
          {t('JournalTabs.howCalculated')}
        </h3>
        <p className='py-4'>{t('JournalTabs.ifCalculationText1')}</p>
        <blockquote className='bg-primary/10 border-l-4 border-primary p-8'>
          <p className='font-semibold italic'>{t('JournalTabs.ifFormula')}</p>
        </blockquote>
        <p className='py-4'>{t('JournalTabs.ifCalculationText2')}</p>
      </div>
    </div>
  </section>
)
