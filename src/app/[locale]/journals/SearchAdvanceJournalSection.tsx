// SearchAdvanceJournalSection.tsx
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import locationData from '@/src/models/data/locations-list.json'; // Import trực tiếp file JSON

interface SearchJournalAdvanceSectionProps {
  isAdvancedOptionsVisible: boolean
  toggleAdvancedOptionsVisibility: () => void
  onRegionChange: (region: string | null) => void
  selectedRegion: string | null
  onPublisherChange: (publisher: string | null) => void
  selectedPublisher: string | null
}

const SearchAdvanceJournalSection: React.FC<SearchJournalAdvanceSectionProps> = ({
  isAdvancedOptionsVisible,
  toggleAdvancedOptionsVisibility,
  onRegionChange,
  selectedRegion,
  onPublisherChange,
  selectedPublisher
}) => {
  const t = useTranslations('SearchAdvancedJournal')

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
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Region Filter */}
            <div>
              <label className='mb-2 block font-bold' htmlFor='region'>
                {t('regionLabel')}: {/* Thêm key 'regionLabel' vào file translation */}
              </label>
              <select
                id='region'
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                value={selectedRegion || ''}
                onChange={(e) => onRegionChange(e.target.value || null)}
              >
                <option value=''>{t('allRegionsOption')}</option> {/* Thêm key 'allRegionsOption' */}
                {locationData.map(region => (
                  <option key={region.name} value={region.name}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Publisher Filter */}
            <div>
              <label className='mb-2 block font-bold' htmlFor='publisher'>
                {t('publisherLabel')}:
              </label>
              <input
                id='publisher'
                className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 text-sm leading-tight shadow focus:outline-none'
                type='text'
                placeholder={t('publisherPlaceholder')}
                value={selectedPublisher || ''}
                onChange={(e) => onPublisherChange(e.target.value || null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchAdvanceJournalSection