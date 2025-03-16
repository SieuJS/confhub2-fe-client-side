'use client'
import { capitalize } from '@/lib/utils'
import Link from 'next/link'
import {
  usePathname,
  useSearchParams,
  useSelectedLayoutSegments
} from 'next/navigation'
import React, { useState, useRef, useEffect } from 'react'
import { FiGlobe, FiChevronDown } from 'react-icons/fi' // Import FiChevronDown

interface Option {
  country: string
  code: string
}

const LangSwitcher: React.FC = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlSegments = useSelectedLayoutSegments()

  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const options: Option[] = [
    { country: 'English', code: 'en' },
    { country: 'Deutsch', code: 'de' },
    { country: 'Français', code: 'fr' },
    { country: 'Việt Nam', code: 'vi' },
    { country: 'Español', code: 'es' },
    { country: 'Русский', code: 'ru' },
    { country: '中文', code: 'zh' },
    { country: '日本語', code: 'ja' },
    { country: 'العربية', code: 'ar' },
    { country: 'فارسی', code: 'fa' }
  ]

  const getLocalizedUrl = (locale: string) => {
    // Handle edge case where there are no segments (e.g., homepage)
    const segments = urlSegments.join('/')
    const newPath = `/${locale}${segments ? `/${segments}` : ''}`
    const queryString = searchParams.toString()
    return queryString ? `${newPath}?${queryString}` : newPath
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOptionsExpanded(false)
      }
    }

    if (isOptionsExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOptionsExpanded])

  // Determine the current locale, defaulting to English if none is found
  const currentLocale =
    options.find(option => pathname.startsWith(`/${option.code}`)) || options[0] // Default to the first option (English)

  return (
    <div className='flex items-center '>
      <div className='relative' ref={dropdownRef}>
        <button
          className='text-destructive inline-flex w-full items-center justify-between gap-3 rounded px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700' // Added hover styles
          onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
        >
          {capitalize(currentLocale.country)}
          {/* Use FiChevronDown for a more appropriate icon */}
          <FiChevronDown
            className={`transition-transform ${isOptionsExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Added z-50 to ensure the dropdown is above other elements */}
        {isOptionsExpanded && (
          <div className='absolute right-0 z-50 mt-2 w-max origin-top-right rounded-md bg-dropdown shadow-lg'>
            <div
              className='py-1'
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='options-menu'
            >
              {options.map(lang => (
                <Link
                  key={lang.code}
                  href={getLocalizedUrl(lang.code)}
                  passHref
                >
                  {/* Added passHref for proper Link behavior */}
                  <button
                    lang={lang.code}
                    onClick={() => setIsOptionsExpanded(false)} // Close on click
                    className={`block w-full whitespace-nowrap px-4 py-2 text-left text-sm hover:bg-dropdownHover ${
                      pathname.startsWith(`/${lang.code}`)
                        ? 'bg-selected text-primary hover:bg-selected'
                        : 'text-secondary'
                    }`}
                  >
                    {capitalize(lang.country)}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LangSwitcher
