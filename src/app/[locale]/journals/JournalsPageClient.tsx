// app/[locale]/journals/JournalsPageClient.tsx

'use client'

import { useTranslations } from 'next-intl'
import SearchJournalSection from '@/src/app/[locale]/journals/SearchJournalSection' // Cập nhật đường dẫn
import ResultsJournalSection from '@/src/app/[locale]/journals/ResultsJournalSection' // Cập nhật đường dẫn
import { useRouter, usePathname, AppPathname } from '@/src/navigation' // Cập nhật import
import { useCallback } from 'react'
import { JournalApiResponse } from '@/src/models/response/journal.response'

interface SearchParamsFromComponent {
  search?: string;
  country?: string | null;
  areas?: string | null;
  publisher?: string | null;
  region?: string | null;
  type?: string | null;
  quartile?: string | null;
  category?: string | null;
  issn?: string | null;
  topic?: string | null;
  hIndex?: string | null;
}

interface JournalsPageClientProps {
  locale: string;
  initialData: JournalApiResponse;
}

export default function JournalsPageClient({ locale, initialData }: JournalsPageClientProps) {
  const t = useTranslations('')
  const router = useRouter()
  const pathname = usePathname()
  // console.log('JournalsPageClient initialData:', initialData)
  const handleSearch = useCallback(
    (searchParamsFromComponent: SearchParamsFromComponent) => {
      const newParams = new URLSearchParams()

      for (const key in searchParamsFromComponent) {
        const value = searchParamsFromComponent[key as keyof SearchParamsFromComponent]
        if (value) {
          newParams.set(key, value)
        }
      }
      newParams.set('page', '1')

      const query: { [key: string]: string } = {};
      for (const [key, value] of newParams.entries()) {
        query[key] = value;
      }

      router.push({
        pathname: pathname as AppPathname,
        query: query,
      });
    },
    [pathname, router]
  )

  const handleClear = useCallback(() => {
    router.push(pathname as AppPathname)
  }, [pathname, router])

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-grow text-center text-2xl">
        <div className="py-4 bg-background w-full"></div>
        <SearchJournalSection onSearch={handleSearch} onClear={handleClear} />
        <div className="container mx-auto mt-4 px-4 ">
          <ResultsJournalSection initialData={initialData} />
        </div>
      </div>
    </div>
  )
}