// BlacklistTab.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react' // <-- Thêm useMemo
import { Link } from '@/src/navigation'
import Button from '../../utils/Button'
import BlacklistConferenceCard from './BlacklistConferenceCard'
import {
  ConferenceInfo,
  Location
} from '../../../../models/response/conference.list.response'
// import { timeAgo, formatDateFull } from '../timeFormat'; // Có thể bỏ nếu không dùng trực tiếp ở đây
// import Tooltip from '../../utils/Tooltip'; // Có thể bỏ nếu không dùng trực tiếp ở đây
import { useTranslations } from 'next-intl'
import { appConfig } from '@/src/middleware'
import { useAuth } from '@/src/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

// BƯỚC 1: IMPORT COMPONENT TÌM KIẾM MỚI
import SearchInput from '../../utils/SearchInput' // <-- Đảm bảo đường dẫn này chính xác

interface BlacklistTabProps {}

// Định nghĩa lại kiểu dữ liệu cho BlacklistedConferences
interface BlacklistedConferenceResponse
  extends Omit<ConferenceInfo, 'dates' | 'location'> {
  conferenceId: string
  title: string
  acronym: string
  location: Location | null
  accessType: string
  dates?: { fromDate?: string; toDate?: string }[]
  createdAt: string
}

const API_GET_BLACKLIST_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1/blacklist-conference`

const BlacklistTab: React.FC<BlacklistTabProps> = () => {
  const t = useTranslations('')
  const language = t('language')

  const [blacklistedConferences, setBlacklistedConferences] = useState<
    BlacklistedConferenceResponse[]
  >([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const { logout } = useAuth()
  const [isBanned, setIsBanned] = useState(false)

  // BƯỚC 2: THÊM STATE CHO TÌM KIẾM
  const [searchTerm, setSearchTerm] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      if (!token) {
        setLoggedIn(false)
        setBlacklistedConferences([])
        return
      }

      setLoggedIn(true)

      const response = await fetch(`${API_GET_BLACKLIST_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 403) {
          console.error('User is banned.')
          setLoggedIn(false)
          setIsBanned(true)
        } else if (response.status === 401) {
          console.error('Authentication error. Please log in.')
          setLoggedIn(false)
        } else {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        setBlacklistedConferences([])
        return
      }

      let blacklist: BlacklistedConferenceResponse[] = await response.json()

      blacklist.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })

      setBlacklistedConferences(blacklist)
    } catch (error) {
      console.error('Failed to fetch blacklist data:', error)
      setBlacklistedConferences([])
      setLoggedIn(false)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // BƯỚC 3: TẠO DANH SÁCH ĐÃ LỌC BẰNG useMemo
  const filteredConferences = useMemo(() => {
    if (!searchTerm) {
      return blacklistedConferences // Trả về danh sách đầy đủ nếu không có từ khóa tìm kiếm
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    return blacklistedConferences.filter(
      conference =>
        conference.title.toLowerCase().includes(lowercasedSearchTerm) ||
        conference.acronym.toLowerCase().includes(lowercasedSearchTerm)
    )
  }, [searchTerm, blacklistedConferences])

  const renderLoading = () => (
    <div className='flex h-80 flex-col items-center justify-center '>
      <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
      <p className='mt-4 text-lg'>
        {t('MyConferences.Loading_your_conferences')}
      </p>
    </div>
  )

  if (loading && initialLoad) {
    return <div className='container mx-auto p-4'>{renderLoading()}</div>
  }

  if (!loggedIn) {
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

  return (
    <div className='container mx-auto min-h-screen bg-gray-10 p-4 md:p-6'>
      <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
        <h1 className='text-xl font-semibold  md:text-2xl'>
          {t('Blacklisted_Conferences')} ({blacklistedConferences.length})
        </h1>
        <Link href='/conferences'>
          <Button variant='primary' size='medium' rounded>
            {t('Explore_All_Conferences')}
          </Button>
        </Link>
      </div>

      {/* BƯỚC 4: THÊM COMPONENT SEARCHINPUT VÀO UI */}
      {/* Chỉ hiển thị thanh tìm kiếm nếu có hội nghị để tìm */}
      {blacklistedConferences.length > 0 && (
        <div className='mb-6'>
          <SearchInput
            initialValue={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder={
              t('Search_blacklisted_conferences') ||
              'Search by title or acronym...'
            }
          />
        </div>
      )}

      {loading && !initialLoad && renderLoading()}

      {/* BƯỚC 5: CẬP NHẬT LOGIC HIỂN THỊ DỰA TRÊN filteredConferences */}
      {!loading && blacklistedConferences.length === 0 && (
        <div className='my-10 rounded-lg bg-white-pure p-10 text-center  shadow-sm'>
          <p className='text-lg'>
            {t('You_have_not_blacklisted_any_conferences_yet')}
          </p>
          <Link href='/conferences'>
            <Button
              variant='link'
              className='mt-2 text-sm text-indigo-600 hover:text-indigo-800'
            >
              {t('Explore_All_Conferences')}
            </Button>
          </Link>
        </div>
      )}

      {!loading &&
        blacklistedConferences.length > 0 &&
        filteredConferences.length === 0 && (
          <div className='my-10 rounded-lg bg-white p-10 text-center  shadow-sm'>
            <p className='text-lg'>{t('No_conferences_match_your_search')}</p>
          </div>
        )}

      {!loading && filteredConferences.length > 0 && (
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {filteredConferences.map(conference => (
            <BlacklistConferenceCard
              key={conference.conferenceId} // Sử dụng conferenceId làm key
              conference={conference}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BlacklistTab
