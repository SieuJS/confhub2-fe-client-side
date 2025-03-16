'use client'
import { capitalize } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { FiSun, FiChevronDown } from 'react-icons/fi' // Added FiChevronDown
import { useOnClickOutside } from 'usehooks-ts'

export default function ThemeSwitch() {
  const t = useTranslations('')
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { setTheme, resolvedTheme, themes, theme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])
  useOnClickOutside(ref, () => setIsOpen(false))

  if (!mounted)
    return (
      <div className='flex items-center justify-center'>
        <button
          className='text-destructive inline-flex w-fit min-w-[95px] items-center justify-between gap-3 text-sm'
          onClick={() => {}}
          aria-expanded='false'
          disabled // Disable the button when not mounted
        >
          <span className='ml-2'>{t('Theme')}</span>
          <FiSun />
        </button>
      </div>
    )

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div ref={ref} className='px- flex items-center '>
      <div className='relative'>
        <button
          className='text-destructive inline-flex w-full items-center justify-between gap-3 rounded px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700' // Added hover styles and padding/rounding
          onClick={toggleDropdown}
          aria-expanded={isOpen}
        >
          <span>{t('Theme')}</span>
          {/* Use FiChevronDown for a more appropriate icon */}
          <FiChevronDown
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Added z-50 to ensure the dropdown is above other elements */}
        {isOpen && (
          <div className='absolute right-0 z-50 mt-2 w-max origin-top-right rounded-md bg-dropdown shadow-lg'>
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
                  className={`block w-full whitespace-nowrap px-4 py-2 text-left text-sm hover:bg-dropdownHover ${
                    themeItem === resolvedTheme
                      ? 'bg-selected text-primary hover:bg-selected'
                      : 'text-secondary'
                  }`}
                >
                  {capitalize(themeItem)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
