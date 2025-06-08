// src/app/[locale]/conferences/detail/MapSection.tsx
'use client'

import React from 'react'
import Map from './Map'

interface MapSectionProps {
  location: string | undefined | null
  t: (key: string) => string
}

export const MapSection: React.FC<MapSectionProps> = ({ location, t }) => {
  return (
    <section
      id='map'
      className='mt-6 rounded-lg bg-white-pure px-2 py-4 shadow-md  md:px-4'
    >
      <h2 className='mb-4 text-xl font-semibold md:text-2xl '>{t('Map')}</h2>
      {location ? (
        <Map location={location} />
      ) : (
        <p className=''>{t('Location_information_is_not_available')}</p>
      )}
    </section>
  )
}