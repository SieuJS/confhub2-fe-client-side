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
      className='sticky top-14 z-30 flex overflow-x-auto whitespace-nowrap border-b border-border bg-background/95 py-2 backdrop-blur-sm'
    >
      {sectionKeys.map(sectionKey => {
        const href = `#${sectionKey}`
        const translationKey = sectionTranslationMap[sectionKey] || sectionKey
        return (
          <a
            key={sectionKey}
            href={href}
            // === THAY THẾ TOÀN BỘ DÒNG CLASSNAME BÊN DƯỚI ===
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 md:px-4 md:text-base ${
              activeSection === sectionKey
                ? 'bg-primary/10 font-semibold text-primary' // Trạng thái ACTIVE: Nền màu, chữ đậm
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground' // Trạng thái INACTIVE + HOVER: Nền mờ và chữ nổi bật hơn khi hover
            }`}
          >
            {t(translationKey)}
          </a>
        )
      })}
    </nav>
  )
}