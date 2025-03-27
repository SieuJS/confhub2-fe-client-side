'use client'
import { capitalize } from '@/lib/utils'
import {
  usePathname,
  useSearchParams,
  useSelectedLayoutSegments
} from 'next/navigation'
import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

interface Option {
  country: string
  code: string
  flagCode: string
}

const LangSwitcher: React.FC = () => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // useSelectedLayoutSegments might not be needed if we derive from pathname
  // const urlSegments = useSelectedLayoutSegments() // You might not need this line anymore

  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // --- Updated options array ---
  const options: Option[] = [
    { country: 'English', code: 'en', flagCode: 'gb' },
    { country: 'Deutsch', code: 'de', flagCode: 'de' },
    { country: 'Français', code: 'fr', flagCode: 'fr' },
    { country: 'Tiếng Việt', code: 'vi', flagCode: 'vn' },
    { country: 'Español', code: 'es', flagCode: 'es' },
    { country: 'Русский', code: 'ru', flagCode: 'ru' },
    { country: '中文', code: 'zh', flagCode: 'cn' },
    { country: '日本語', code: 'ja', flagCode: 'jp' },
    { country: '한국어', code: 'ko', flagCode: 'kr' }, // <-- Added Korean
    { country: 'العربية', code: 'ar', flagCode: 'sa' },
    { country: 'فارسی', code: 'fa', flagCode: 'ir' }
  ]
  // --- End of updated options ---

  // --- Updated getLocalizedUrl ---
  const getLocalizedUrl = (locale: string): string => {
    // Find the current locale prefix in the pathname
    const currentLocaleCode = options.find(
      option =>
        pathname.startsWith(`/${option.code}/`) ||
        pathname === `/${option.code}`
    )?.code

    let newPath = pathname

    // If a known locale prefix exists, remove it
    if (currentLocaleCode) {
      if (pathname === `/${currentLocaleCode}`) {
        // Path was just the locale (e.g., /en), replace it
        newPath = ''
      } else if (pathname.startsWith(`/${currentLocaleCode}/`)) {
        // Path had locale and more segments (e.g., /en/about)
        newPath = pathname.substring(`/${currentLocaleCode}`.length) // Get the part after the locale (e.g., /about)
      }
      // If pathname doesn't start with a known locale, assume default locale and keep the path as is
    }

    // Prepend the new locale, ensuring a leading slash if newPath is not empty
    const finalPath = `/${locale}${newPath}`

    const queryString = searchParams.toString()
    return queryString ? `${finalPath}?${queryString}` : finalPath
  }
  // --- End of updated getLocalizedUrl ---

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

  // --- Determine current locale ---
  // Check if the first segment of the pathname matches any known locale code
  const firstPathSegment = pathname.split('/')[1] // Get the first segment (e.g., 'en' from '/en/about')
  const currentOption = options.find(option => option.code === firstPathSegment)
  const currentLocale = currentOption || options[0] // Default to the first option (English) if no locale prefix found
  // --- End of current locale determination ---

  const getFlagUrl = (flagCode: string) => `/country_flags/${flagCode}.svg`

  return (
    <div className='w-full'>
      <div className='relative' ref={dropdownRef}>
        <button
          className='text-destructive inline-flex w-full items-center justify-between gap-2 rounded px-2 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 md:px-4'
          onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
          aria-haspopup='true'
          aria-expanded={isOptionsExpanded}
          id='options-menu' // Added id for aria-labelledby
        >
          <span className='inline-flex items-center gap-2'>
            <Image
              src={getFlagUrl(currentLocale.flagCode)}
              alt={`${currentLocale.country} flag`}
              width={20}
              height={15}
              className='h-auto w-[20px]' // Explicit width can help prevent layout shifts
              priority={true} // Prioritize loading the current locale's flag
            />
            {/* Use currentLocale determined above */}
            {capitalize(currentLocale.country)}
          </span>
          <svg
            className={`h-5 w-5 flex-shrink-0 transition-transform ${isOptionsExpanded ? 'rotate-180' : ''}`}
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

        {isOptionsExpanded && (
          <div className='absolute right-0 z-50 mt-2 w-full min-w-max origin-top-right rounded-md bg-dropdown shadow-lg'>
            <div
              className='py-1'
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='options-menu'
            >
              {options.map(lang => (
                <a
                  key={lang.code}
                  href={getLocalizedUrl(lang.code)}
                  lang={lang.code}
                  onClick={() => setIsOptionsExpanded(false)} // Close dropdown on click
                  className={`flex w-full items-center gap-2 whitespace-nowrap px-2 py-2 text-left text-sm hover:bg-dropdownHover md:px-4 ${
                    currentLocale.code === lang.code // Compare with determined currentLocale
                      ? 'bg-selected text-primary hover:bg-selected'
                      : 'text-secondary'
                  }`}
                  role='menuitem'
                >
                  <Image
                    src={getFlagUrl(lang.flagCode)}
                    alt={`${lang.country} flag`}
                    width={20}
                    height={15}
                    className='h-auto w-[20px]' // Explicit width
                    loading='lazy' // Lazy load flags in the dropdown
                  />
                  {capitalize(lang.country)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LangSwitcher
