'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from '@/src/navigation'
import Button from '../../utils/Button'
import FollowedConferenceCard from './FollowedConferenceCard'
import FollowedJournalCard from './FollowedJournalCard'
import {
  ConferenceInfo,
  Location
} from '@/src/models/response/conference.list.response'
import { useTranslations } from 'next-intl'
import { appConfig } from '@/src/middleware'
import { useAuth } from '@/src/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import SearchInput from '../../utils/SearchInput'

// --- TYPE DEFINITIONS ---

// Kiểu dữ liệu cho Conference được follow
interface FollowedConferenceResponse
  extends Omit<ConferenceInfo, 'dates' | 'location'> {
  id: string
  followedAt: string
  dates?: { fromDate?: string; toDate?: string }[]
  location: Location | null
  accessType: string
}

// Kiểu dữ liệu THÔ trả về từ API /journal-follows/by-user (có cấu trúc lồng nhau)
interface ApiFollowedJournalResponse {
  id: string; // ID của bản ghi follow
  journalId: string;
  createdAt: string; // Thời gian follow
  belongsTo: {
    id: string; // ID của journal
    title: string;
    publisher: string | null;
    country: string | null;
    issn: string | null;
  };
}

// Kiểu dữ liệu journal ĐÃ ĐƯỢC XỬ LÝ (phẳng) để truyền vào component Card
interface ProcessedFollowedJournal {
  id: string; // ID của journal
  Title: string;
  Publisher: string | null;
  Country: string | null;
  ISSN: string | null;
  followedAt: string; // Thời gian follow
}

// --- CONSTANTS & HELPER COMPONENTS ---

const API_BASE_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1`

const LoadingSpinner = ({ message }: { message: string }) => (
  <div className='flex h-80 flex-col items-center justify-center '>
    <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
    <p className='mt-4 text-lg'>{message}</p>
  </div>
)

// --- MAIN COMPONENT ---

const FollowedTab: React.FC = () => {
  const t = useTranslations('')
  const { logout, isLoggedIn } = useAuth()

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<'conferences' | 'journals'>(
    'conferences'
  )
  const [followedConferences, setFollowedConferences] = useState<
    FollowedConferenceResponse[]
  >([])
  const [followedJournals, setFollowedJournals] = useState<
    ProcessedFollowedJournal[]
  >([])
  const [loading, setLoading] = useState(true)
  const [isBanned, setIsBanned] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // --- DATA FETCHING (Tách thành 2 hàm riêng biệt để đảm bảo type-safety) ---

  // Hàm chỉ để fetch danh sách conferences đã follow
  const fetchFollowedConferences = useCallback(async (): Promise<FollowedConferenceResponse[]> => {
    const token = localStorage.getItem('token')
    if (!token) return []

    try {
      const response = await fetch(`${API_BASE_ENDPOINT}/follow-conference/followed`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        if (response.status === 403) setIsBanned(true)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: FollowedConferenceResponse[] = await response.json()
      data.sort((a, b) => new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime())
      return data
    } catch (error) {
      console.error('Failed to fetch followed conferences:', error)
      return [] // Trả về mảng rỗng khi có lỗi
    }
  }, [])

  // Hàm chỉ để fetch danh sách journals đã follow
  const fetchFollowedJournals = useCallback(async (): Promise<ProcessedFollowedJournal[]> => {
    const token = localStorage.getItem('token')
    if (!token) return []

    try {
      const response = await fetch(`${API_BASE_ENDPOINT}/journal-follows/by-user`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!response.ok) {
        if (response.status === 403) setIsBanned(true)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const rawData: ApiFollowedJournalResponse[] = await response.json()
      
      // Chuyển đổi dữ liệu từ cấu trúc lồng nhau sang phẳng
      const processedData: ProcessedFollowedJournal[] = rawData.map(item => ({
        id: item.belongsTo.id,
        Title: item.belongsTo.title,
        Publisher: item.belongsTo.publisher,
        Country: item.belongsTo.country,
        ISSN: item.belongsTo.issn,
        followedAt: item.createdAt
      }));

      processedData.sort((a, b) => new Date(b.followedAt).getTime() - new Date(a.followedAt).getTime())
      return processedData
    } catch (error) {
      console.error('Failed to fetch followed journals:', error)
      return [] // Trả về mảng rỗng khi có lỗi
    }
  }, [])

  // --- useEffect for Initial Data Load ---
  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }

    const loadAllData = async () => {
      setLoading(true)
      // Gọi song song 2 hàm fetch, Promise.all sẽ trả về kết quả đúng kiểu
      const [conferences, journals] = await Promise.all([
        fetchFollowedConferences(),
        fetchFollowedJournals()
      ])
      
      setFollowedConferences(conferences)
      setFollowedJournals(journals)

      setLoading(false)
    }

    loadAllData()
  }, [isLoggedIn, fetchFollowedConferences, fetchFollowedJournals])

  // --- FILTERING LOGIC ---
  const filteredConferences = useMemo(() => {
    if (!searchTerm) return followedConferences
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    return followedConferences.filter(
      conference =>
        conference.title.toLowerCase().includes(lowercasedSearchTerm) ||
        conference.acronym.toLowerCase().includes(lowercasedSearchTerm)
    )
  }, [searchTerm, followedConferences])

  const filteredJournals = useMemo(() => {
    if (!searchTerm) return followedJournals
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    return followedJournals.filter(
      journal =>
        journal.Title.toLowerCase().includes(lowercasedSearchTerm) ||
        (journal.ISSN &&
          journal.ISSN.toLowerCase().includes(lowercasedSearchTerm))
    )
  }, [searchTerm, followedJournals])

  // --- RENDER LOGIC ---
  if (loading) {
    return (
      <LoadingSpinner
        message={t('MyConferences.Loading_your_followed_items')}
      />
    )
  }

  if (!isLoggedIn) {
    if (isBanned) {
      logout({ callApi: true, preventRedirect: true })
      return (
        <div className='container mx-auto p-4 text-center'>
          <h2 className='mb-2 text-xl font-bold text-red-600'>
            {t('MyConferences.Account_Banned_Title')}
          </h2>
          <p className='mb-4'>{t('MyConferences.Account_Banned_Message')}</p>
          <Link href='/auth/login'>
            <Button variant='primary'>{t('Sign_In')}</Button>
          </Link>
        </div>
      )
    }
    return (
      <div className='container mx-auto p-4 text-center'>
        <h2 className='mb-2 text-xl font-semibold'>
          {t('MyConferences.Login_Required_Title')}
        </h2>
        <p className='mb-4'>{t('MyConferences.Login_Required_Message')}</p>
        <Link href='/auth/login'>
          <Button variant='primary'>{t('Sign_In')}</Button>
        </Link>
      </div>
    )
  }

  const renderContent = () => {
    if (activeTab === 'conferences') {
      if (followedConferences.length === 0)
        return (
          <div className='my-10 text-center '>
            <p>{t('You_are_not_following_any_conferences_yet')}</p>
          </div>
        )
      if (filteredConferences.length === 0)
        return (
          <div className='my-10 text-center '>
            <p>{t('No_conferences_match_your_search')}</p>
          </div>
        )
      return (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {filteredConferences.map(conference => (
            <FollowedConferenceCard
              key={conference.id}
              conference={conference}
            />
          ))}
        </div>
      )
    }

    if (activeTab === 'journals') {
      if (followedJournals.length === 0)
        return (
          <div className='my-10 text-center '>
            <p>{t('You_are_not_following_any_journals_yet')}</p>
          </div>
        )
      if (filteredJournals.length === 0)
        return (
          <div className='my-10 text-center '>
            <p>{t('No_journals_match_your_search')}</p>
          </div>
        )
      return (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {filteredJournals.map(journal => (
            <FollowedJournalCard key={journal.id} journal={journal} />
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className='container mx-auto min-h-screen bg-gray-10 p-4 md:p-6'>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        <h1 className='text-xl font-semibold  md:text-2xl'>
          {t('My_Follows')}
        </h1>
        <Link href={activeTab === 'conferences' ? '/conferences' : '/journals'}>
          <Button variant='primary' size='medium' rounded>
            {activeTab === 'conferences'
              ? t('Explore_All_Conferences')
              : t('Explore_All_Journals')}
          </Button>
        </Link>
      </div>

      <div className='mb-6 border-b border-gray-200'>
        <nav className='-mb-px flex space-x-6' aria-label='Tabs'>
          <button
            onClick={() => setActiveTab('conferences')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'conferences'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent  hover:border-gray-300 hover:text-gray-70'
            }`}
          >
            {t('Conferences')} ({followedConferences.length})
          </button>
          <button
            onClick={() => setActiveTab('journals')}
            className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
              activeTab === 'journals'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent  hover:border-gray-300 hover:text-gray-70'
            }`}
          >
            {t('Journals')} ({followedJournals.length})
          </button>
        </nav>
      </div>

      {(followedConferences.length > 0 || followedJournals.length > 0) && (
        <div className='mb-6'>
          <SearchInput
            initialValue={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder={
              activeTab === 'conferences'
                ? t('Search_followed_conferences') ||
                  'Search by name or acronym...'
                : t('Search_followed_journals') || 'Search by title or ISSN...'
            }
          />
        </div>
      )}

      {renderContent()}
    </div>
  )
}

export default FollowedTab