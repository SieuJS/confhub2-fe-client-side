'use client'
import { capitalize } from '@/lib/utils'
import Link from 'next/link'
import {
  usePathname,
  useSearchParams,
  useSelectedLayoutSegments
} from 'next/navigation'
import React, { useState, useRef, useEffect } from 'react'

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
    { country: 'Tiếng Việt', code: 'vi' },
    { country: 'Español', code: 'es' },
    { country: 'Русский', code: 'ru' },
    { country: '中文', code: 'zh' },
    { country: '日本語', code: 'ja' },
    { country: 'العربية', code: 'ar' },
    { country: 'فارسی', code: 'fa' }
  ]

  const getLocalizedUrl = (locale: string) => {
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

  const currentLocale =
    options.find(option => pathname.startsWith(`/${option.code}`)) || options[0]

  return (
    <div className='w-full'>
      <div className='relative' ref={dropdownRef}>
        <button
          className='text-destructive inline-flex w-full items-center justify-between gap-3 rounded px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700'
          onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
        >
          {capitalize(currentLocale.country)}
          {/* SVG Chevron Down */}
          <svg
            className={`h-5 w-5 transition-transform ${isOptionsExpanded ? 'rotate-180' : ''}`}
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
          <div className='absolute right-0 z-50 mt-2 w-full origin-top-right rounded-md bg-dropdown shadow-lg'>
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
                  <button
                    lang={lang.code}
                    onClick={() => setIsOptionsExpanded(false)}
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
