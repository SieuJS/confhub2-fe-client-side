// pages/conferences.tsx (Conferences Page)
'use client'

import { useTranslations } from 'next-intl'
import SearchSection from '../conferences/SearchSection' // Adjust path if necessary
import ResultsSection from '../conferences/ResultsSection' // Adjust path if necessary
import { Header } from '../utils/Header' // Adjust path if necessary
import Footer from '../utils/Footer' // Adjust path if necessary
import { useRouter, usePathname } from 'next/navigation' // Added usePathname
import { useCallback } from 'react'
import FloatingChatbot from '@/src/app/[locale]/floatingchatbot/FloatingChatbot'
import useUserBlacklist from '@/src/hooks/auth/useUserBlacklist'

// It's good practice to import the type from the hook if it's exported.
// If not, define it accurately here.
// Assuming SearchParams type from useSearchForm.ts looks like this:
interface SearchParamsForURL {
  keyword?: string
  title?: string
  acronym?: string
  fromDate?: Date | null
  toDate?: Date | null
  location?: string | null
  type?: 'Online' | 'Offline' | 'Hybrid' | null
  subFromDate?: Date | null // <-- UPDATED
  subToDate?: Date | null // <-- UPDATED
  publisher?: string | null
  rank?: string | null
  source?: string | null
  averageScore?: string | null
  topics?: string[]
  fieldOfResearch?: string[]
}

export default function Conferences({
  params: { locale }
}: {
  params: { locale: string }
}) {
  const t = useTranslations('')
  const { blacklistedEventIds } = useUserBlacklist()

  const router = useRouter()
  const pathname = usePathname() // Get the current pathname

  const handleSearch = useCallback(
    async (searchParamsFromComponent: SearchParamsForURL) => {
      // <-- Use the updated interface
      const newParams = new URLSearchParams()
      if (searchParamsFromComponent.keyword)
        newParams.set('keyword', searchParamsFromComponent.keyword)
      if (searchParamsFromComponent.title)
        newParams.set('title', searchParamsFromComponent.title)
      if (searchParamsFromComponent.acronym)
        newParams.set('acronym', searchParamsFromComponent.acronym)
      if (searchParamsFromComponent.location)
        newParams.set('country', searchParamsFromComponent.location) // 'country' is what useSearchForm reads
      if (searchParamsFromComponent.type)
        newParams.set('type', searchParamsFromComponent.type)
      if (searchParamsFromComponent.fromDate) {
        newParams.set(
          'fromDate',
          searchParamsFromComponent.fromDate.toISOString().split('T')[0]
        )
      }
      if (searchParamsFromComponent.toDate) {
        newParams.set(
          'toDate',
          searchParamsFromComponent.toDate.toISOString().split('T')[0]
        )
      }
      if (searchParamsFromComponent.rank)
        newParams.set('rank', searchParamsFromComponent.rank)
      if (searchParamsFromComponent.source)
        newParams.set('source', searchParamsFromComponent.source)
      if (searchParamsFromComponent.publisher)
        newParams.set('publisher', searchParamsFromComponent.publisher)

      // --- MODIFIED SECTION FOR SUBMISSION DATE RANGE ---
      if (searchParamsFromComponent.subFromDate) {
        newParams.set(
          'subFromDate', // Parameter name expected by useSearchForm's getInitialDateFromUrl
          searchParamsFromComponent.subFromDate.toISOString().split('T')[0]
        )
      }
      if (searchParamsFromComponent.subToDate) {
        newParams.set(
          'subToDate', // Parameter name expected by useSearchForm's getInitialDateFromUrl
          searchParamsFromComponent.subToDate.toISOString().split('T')[0]
        )
      }
      // --- END MODIFIED SECTION ---

      if (searchParamsFromComponent.averageScore)
        newParams.set('averageScore', searchParamsFromComponent.averageScore)

      if (
        searchParamsFromComponent.topics &&
        searchParamsFromComponent.topics.length > 0
      ) {
        searchParamsFromComponent.topics.forEach(topic =>
          newParams.append('topics', topic)
        )
      }
      if (
        searchParamsFromComponent.fieldOfResearch &&
        searchParamsFromComponent.fieldOfResearch.length > 0
      ) {
        searchParamsFromComponent.fieldOfResearch.forEach(field =>
          newParams.append('fieldOfResearch', field)
        )
      }

      const paramsString = newParams.toString()
      // Use pathname to ensure navigation is relative to the current page structure
      router.push(`${pathname}${paramsString ? `?${paramsString}` : ''}`)
    },
    [pathname, router] // locale is implicitly part of pathname from next-intl routing
  )

  const handleClear = useCallback(() => {
    // Navigate to the current page without any query parameters
    router.push(pathname)
  }, [pathname, router])

  return (
    <>
      <Header locale={locale} />
      <div className='text-center text-2xl'>
        <div className='w-full bg-background py-10'></div>
        <SearchSection onSearch={handleSearch} onClear={handleClear} />
        <div className='container mx-auto mt-4 px-0 md:px-4'>
          <ResultsSection userBlacklist={blacklistedEventIds} />
        </div>
      </div>
      <Footer />

      <FloatingChatbot />
    </>
  )
}
