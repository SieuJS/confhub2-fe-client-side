'use client'
import { capitalize } from '@/lib/utils'
import Link from 'next/link'
import {
  usePathname,
  useSearchParams,
  useSelectedLayoutSegments
} from 'next/navigation'
import React, { useState, useRef, useEffect } from 'react'
import { FiGlobe } from 'react-icons/fi'

const LangSwitcher: React.FC = () => {
  interface Option {
    country: string
    code: string
  }

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
    const newPath = `/${locale}/${urlSegments.join('/')}`
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

  const currentLocale = options.find(option =>
    pathname.startsWith(`/${option.code}`)
  ) || { country: 'Language', code: '' }

  return (
    <div className='flex items-center px-4'>
      <div className='relative' ref={dropdownRef}>
        <button
          className='text-destructive inline-flex w-full items-center justify-between gap-3 text-sm'
          onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
        >
          {capitalize(currentLocale.country)} <FiGlobe />
        </button>

        {isOptionsExpanded && (
          <div className='absolute right-0 mt-2 w-max origin-top-right rounded-md bg-dropdown shadow-lg'>
            {' '}
            {/* Changed w-full to w-max */}
            <div
              className='py-1'
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='options-menu'
            >
              {options.map(lang => (
                <Link key={lang.code} href={getLocalizedUrl(lang.code)}>
                  <button
                    lang={lang.code}
                    onMouseDown={e => e.preventDefault()}
                    className={`block w-full whitespace-nowrap px-4 py-2 text-left text-sm hover:bg-dropdownHover ${
                      //Added whitespace-nowrap
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
