'use client'
import { capitalize } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { FiSun } from 'react-icons/fi'
import { useOnClickOutside } from 'usehooks-ts'

export default function ThemeSwitch() {
  const t = useTranslations('')
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { setTheme, resolvedTheme, themes, theme } = useTheme()
  const ref = useRef<HTMLDivElement>(null) // Specify the type as HTMLDivElement

  useEffect(() => setMounted(true), [])
  useOnClickOutside(ref, () => setIsOpen(false))

  if (!mounted)
    return (
      // Return a placeholder or null if not mounted.  Avoid rendering the full component.
      <div className='flex items-center justify-center'>
        <button
          className='text-destructive inline-flex w-fit min-w-[95px] items-center justify-between gap-3 text-sm'
          onClick={() => {}} // No-op click handler
          aria-expanded='false'
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
    <div ref={ref} className='px- flex items-center px-2'>
      <div className='relative'>
        <button
          className='text-destructive inline-flex w-full items-center justify-between gap-3 text-sm'
          onClick={toggleDropdown}
          aria-expanded={isOpen}
        >
          <span className='ml-2'>{t('Theme')}</span>
          <FiSun />
        </button>

        {isOpen && (
          <div className='absolute right-0 mt-2 w-max origin-top-right rounded-md bg-dropdown shadow-lg'>
            <div
              className='py-1'
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='options-menu'
            >
              {themes.map(themeItem => (
                <button
                  key={themeItem}
                  onClick={() => {
                    setTheme(themeItem)
                    setIsOpen(false) // Close dropdown after selection
                  }}
                  className={`block w-full whitespace-nowrap px-4 py-2 text-left text-sm hover:bg-dropdownHover ${
                    themeItem === resolvedTheme // Use resolvedTheme for accurate comparison
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
