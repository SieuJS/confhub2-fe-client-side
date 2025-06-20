// SearchAdvanceJournalSection.tsx
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
interface SearchJournalAdvanceSectionProps {
  isAdvancedOptionsVisible: boolean
  toggleAdvancedOptionsVisibility: () => void
  publisher: string
  onPublisherChange: (value: string) => void
  region: string | null
  onRegionChange: (value: string | null) => void
  category: string
  onCategoryChange: (value: string) => void
  issn: string
  onIssnChange: (value: string) => void
  topic: string
  onTopicChange: (value: string) => void
  hIndex: string
  onHIndexChange: (value: string) => void
}

const SearchAdvanceJournalSection: React.FC<SearchJournalAdvanceSectionProps> = ({
  isAdvancedOptionsVisible,
  toggleAdvancedOptionsVisibility,
  publisher,
  onPublisherChange,
  region,
  onRegionChange,
  category,
  onCategoryChange,
  issn,
  onIssnChange,
  topic,
  onTopicChange,
  hIndex,
  onHIndexChange
}) => {
  const t = useTranslations('SearchAdvancedJournal')
  // const quartiles = ['Q1', 'Q2', 'Q3', 'Q4'] // ĐÃ DI CHUYỂN LÊN useSearchJournalForm

  // Mảng các khu vực được set cứng
  const hardcodedRegions: string[] = [
    'Africa',
    'Asiatic Region',
    'Eastern Europe',
    'Latin America',
    'Middle East',
    'Northern America',
    'Pacific Region',
    'Western Europe',
    'ARAB COUNTRIES',
    'BRIICS',
    'EU-27',
    'IBEROAMERICA',
    'LANIC',
    'NORDIC COUNTRIES',
    'OECD'
  ]

  return (
    <div>
      <div className='mt-4 flex justify-end'>
        <button
          onClick={toggleAdvancedOptionsVisibility}
          className='text-sm hover:text-gray-800 focus:outline-none'
        >
          {isAdvancedOptionsVisible
            ? t('hideAdvancedSearch')
            : t('showAdvancedSearch')}
        </button>
      </div>

      {isAdvancedOptionsVisible && (
        <div className='mt-4 rounded border p-4 shadow-md'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {/* Publisher Filter */}
            <div>
              <label className='mb-2 block text-sm font-bold' htmlFor='publisher'>
                {t('publisherLabel')}:
              </label>
              <input
                id='publisher'
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                type='text'
                placeholder={t('publisherPlaceholder')}
                value={publisher}
                onChange={e => onPublisherChange(e.target.value)}
              />
            </div>

            {/* Region Filter */}
            <div>
              <label className='mb-2 block text-sm font-bold' htmlFor='region'>
                {t('regionLabel')}:
              </label>
              <select
                id='region'
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                value={region || ''}
                onChange={e => onRegionChange(e.target.value || null)}
              >
                <option value=''>{t('allRegionsOption')}</option>
                {hardcodedRegions.map(reg => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>


            {/* Category Filter */}
            <div>
              <label className='mb-2 block text-sm font-bold' htmlFor='category'>
                {t('categoryLabel')}:
              </label>
              <input
                id='category'
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                type='text'
                placeholder={t('categoryPlaceholder')}
                value={category}
                onChange={e => onCategoryChange(e.target.value)}
              />
            </div>

            {/* Topic Filter */}
            <div>
              <label className='mb-2 block text-sm font-bold' htmlFor='topic'>
                {t('topicLabel')}:
              </label>
              <input
                id='topic'
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                type='text'
                placeholder={t('topicPlaceholder')}
                value={topic}
                onChange={e => onTopicChange(e.target.value)}
              />
            </div>

            {/* ISSN Filter */}
            <div>
              <label className='mb-2 block text-sm font-bold' htmlFor='issn'>
                {t('issnLabel')}:
              </label>
              <input
                id='issn'
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                type='text'
                placeholder={t('issnPlaceholder')}
                value={issn}
                onChange={e => onIssnChange(e.target.value)}
              />
            </div>

            {/* H-Index Filter */}
            <div>
              <label className='mb-2 block text-sm font-bold' htmlFor='hIndex'>
                {t('hIndexLabel')}:
              </label>
              <input
                id='hIndex'
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                type='text'
                placeholder={t('hIndexPlaceholder')}
                value={hIndex}
                onChange={e => onHIndexChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchAdvanceJournalSection