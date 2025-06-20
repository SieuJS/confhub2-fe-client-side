// src/app/[locale]/journal/detail/JournalNav.tsx
'use client'

import React from 'react'

interface JournalNavProps {
  navRef: React.RefObject<HTMLElement>
  sectionKeys: string[]
  activeSection: string
  sectionTranslationMap: { [key:string]: string }
  t: (key: string) => string
}

export const JournalNav: React.FC<JournalNavProps> = ({
  navRef,
  sectionKeys,
  activeSection,
  sectionTranslationMap,
  t,
}) => {
  return (
    <nav
      ref={navRef}
      className='sticky top-14 z-30 flex overflow-x-auto whitespace-nowrap border-b border-border bg-background/95 py-2 mt-4 backdrop-blur-sm'
    >
      {sectionKeys.map(sectionKey => {
        const href = `#${sectionKey}`
        const translationKey = sectionTranslationMap[sectionKey] || sectionKey
        return (
          <a
            key={sectionKey}
            href={href}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-all duration-200 md:px-4 md:text-base ${
              activeSection === sectionKey
                ? 'bg-primary/10 font-semibold text-primary' // Trạng thái ACTIVE: Nền màu, chữ đậm, màu primary
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground hover:font-semibold' // Trạng thái INACTIVE + HOVER: Nền mờ, chữ nổi bật hơn, chữ BOLD
            }`}
          >
            {t(translationKey)}
          </a>
        )
      })}
    </nav>
  )
}