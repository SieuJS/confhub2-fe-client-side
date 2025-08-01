'use client'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

export default function ThemeSwitch() {
  // Sử dụng namespace 'ThemeSwitch'
  const t = useTranslations('')
  const [isOpen, setIsOpen] = useState(false)
  const { setTheme, resolvedTheme, themes, theme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  useOnClickOutside(ref, () => setIsOpen(false))

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div ref={ref} className='w-full'>
      <div className='relative'>
        <button
          className='text-destructive inline-flex w-full  items-center justify-between gap-1 rounded px-2 py-2 text-sm  hover:bg-gray-10 md:min-w-[100px] md:px-4'
          onClick={toggleDropdown}
          aria-expanded={isOpen}
        >
          {/* Key "Theme" bây giờ nằm trong namespace "ThemeSwitch" */}
          <span>{t('Theme')}</span>
          <svg
            className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox='0 0 20 20'
            fill='currentColor'
            aria-hidden='true'
          >
            <path
              fillRule='evenodd'
              d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
              clipRule='evenodd'
            />
          </svg>
        </button>

        {isOpen && (
          <div className='absolute right-0 z-50 mt-2 w-full origin-top-right rounded-md bg-dropdown shadow-lg'>
            <div
              className=''
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='options-menu'
            >
              {themes.map(themeItem => (
                <button
                  key={themeItem}
                  onClick={() => {
                    setTheme(themeItem)
                    setIsOpen(false)
                  }}
                  className={`block w-full whitespace-nowrap px-2 py-2 text-left text-sm hover:bg-dropdownHover md:px-4 ${
                    themeItem === resolvedTheme
                      ? 'bg-selected text-primary hover:bg-selected'
                      : 'text-secondary'
                  }`}
                >
                  {/* Dịch cả các lựa chọn theme */}
                  {t(themeItem as 'light' | 'dark' | 'system')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
