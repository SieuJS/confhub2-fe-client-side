// src/app/[locale]/journals/detail/page.tsx

'use client'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { JournalData } from '../../../../models/response/journal.response'
import { Header } from '../../utils/Header'
import Footer from '../../utils/Footer'
import NotFoundPage from '../../utils/NotFoundPage'
import JournalReport from './JournalReport'
import { JournalTabs } from './JournalTabs'
import { RecommendedJournals } from './RecommendedJournals'
import { RecentlyAddedJournals } from './RecentlyAddedJournals'
import SubjectAreasJournals from './SubjectAreasJournals'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react' // Import Loader2

const JournalDetails = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  const t = useTranslations()

  const searchParams = useSearchParams()
  const journalId = searchParams.get('id')

  const [journal, setJournal] = useState<JournalData | null | undefined>(
    undefined
  )
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJournalById = async () => {
      if (!journalId) {
        console.log("No 'id' found in query parameters.")
        setJournal(null)
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      setJournal(undefined)

      try {
        const baseUrl = process.env.NEXT_PUBLIC_DATABASE_URL
        if (!baseUrl) {
          throw new Error(
            'NEXT_PUBLIC_DATABASE_URL is not defined in environment variables.'
          )
        }

        const apiUrl = `${baseUrl}/api/v1/journals/${journalId}`
        console.log(`Fetching journal from: ${apiUrl}`)

        const response = await fetch(apiUrl)

        if (response.status === 404) {
          console.log(`Journal with id ${journalId} not found (404).`)
          setJournal(null)
          throw new Error(`Journal not found.`)
        }

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`)
        }

        const foundJournal: JournalData = await response.json()
        console.log(`Journal found:`, foundJournal.Title)
        setJournal(foundJournal)
      } catch (err: any) {
        console.error('Failed to fetch journal:', err)
        setError(err.message || 'An unknown error occurred')
        setJournal(null)
      } finally {
        setLoading(false)
      }
    }

    fetchJournalById()
  }, [journalId])

  // --- Render Logic ---

  if (loading) {
    return (
      <>
        <Header locale={locale} />
        <div className='flex min-h-screen flex-col items-center justify-center '>
          <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
          <p className='mt-4 text-lg'>{t('Loading_journal_details')}</p>
        </div>
        <Footer />
      </>
    )
  }

  if (error || journal === null) {
    return (
      <>
        <Header locale={locale} />
        {/* Không hiển thị lỗi "Journal not found" cho người dùng, chỉ hiển thị trang 404 */}
        {error && error !== 'Journal not found.' && (
          <div className='py-4 text-center text-red-500'>
            {t('Error')}: {error}
          </div>
        )}
        <NotFoundPage />
        <Footer />
      </>
    )
  }

  if (journal) {
    return (
      <div className=''>
        <Header locale={locale} />
        <div className='w-full bg-background py-10'></div>
        <JournalReport journal={journal} />
        <JournalTabs journal={journal} />
        {/* <RecommendedJournals /> */}
        {/* <RecentlyAddedJournals /> */}
        <SubjectAreasJournals />
        <Footer />
      </div>
    )
  }

  return (
    <>
      <Header locale={locale} />
      <div className='flex min-h-screen items-center justify-center'>
        <p>{t('Something_went_wrong')}</p>
      </div>
      <Footer />
    </>
  )
}

export default JournalDetails
