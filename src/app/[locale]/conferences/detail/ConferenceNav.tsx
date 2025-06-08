// src/app/[locale]/conferences/detail/ConferenceNav.tsx
'use client'

import React from 'react'

interface ConferenceNavProps {
  navRef: React.RefObject<HTMLElement>
  sectionKeys: string[]
  activeSection: string
  sectionTranslationMap: { [key: string]: string }
  t: (key: string) => string
}

export const ConferenceNav: React.FC<ConferenceNavProps> = ({
  navRef,
  sectionKeys,
  activeSection,
  sectionTranslationMap,
  t
}) => {
  return (
    <nav
      ref={navRef}
      className='sticky top-14 z-30 flex overflow-x-auto whitespace-nowrap border-b border-gray-200 bg-white-pure bg-opacity-95 py-2 '
    >
      {sectionKeys.map(sectionKey => {
        const hrefId = sectionKey
        const href = `#${hrefId}`
        const translationKey = sectionTranslationMap[sectionKey] || sectionKey
        return (
          <a
            key={sectionKey}
            href={href}
            className={`rounded-lg px-2 py-2 font-medium transition-colors duration-200 md:px-4 ${activeSection === sectionKey ? 'bg-gray-10 text-blue-600 ' : ' hover:bg-gray-10 hover:text-blue-600 '}`}
          >
            {t(translationKey)}
          </a>
        )
      })}
    </nav>
  )
}