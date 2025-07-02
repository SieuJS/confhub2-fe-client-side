// BlacklistTab.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from '@/src/navigation'
import Button from '../../utils/Button'
import BlacklistConferenceCard from './BlacklistConferenceCard'
import {
  ConferenceInfo,
  Location
} from '../../../../models/response/conference.list.response'
import { useTranslations } from 'next-intl'
import { appConfig } from '@/src/middleware'
import { useAuth } from '@/src/contexts/AuthContext' // <-- Đảm bảo import useAuth
import { Loader2 } from 'lucide-react'
import SearchInput from '../../utils/SearchInput'
import GeneralPagination from '../../utils/GeneralPagination'

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
const ITEMS_PER_PAGE = 8; // Số lượng mục trên mỗi trang, bạn có thể điều chỉnh

const BlacklistTab: React.FC<BlacklistTabProps> = () => {
  const t = useTranslations('')
  // const language = t('language') // Không cần thiết nếu không sử dụng

  const [blacklistedConferences, setBlacklistedConferences] = useState<
    BlacklistedConferenceResponse[]
  >([])
  const [loading, setLoading] = useState(true)
  // const [loggedIn, setLoggedIn] = useState(false) // <-- BỎ DÒNG NÀY
  const [initialLoad, setInitialLoad] = useState(true)
  const { logout, isLoggedIn } = useAuth() // <-- LẤY isLoggedIn TỪ useAuth
  const [isBanned, setIsBanned] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')

      // Sử dụng isLoggedIn từ context thay vì kiểm tra token cục bộ
      if (!isLoggedIn) { // <-- SỬ DỤNG isLoggedIn TỪ CONTEXT
        // setLoggedIn(false) // Không cần thiết
        setBlacklistedConferences([])
        return
      }

      // setLoggedIn(true) // Không cần thiết

      const response = await fetch(`${API_GET_BLACKLIST_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 403) {
          setIsBanned(true)
          // setLoggedIn(false) // Không cần thiết
        } else if (response.status === 401) {
          // setLoggedIn(false) // Không cần thiết
          // Nếu 401, AuthContext sẽ tự động xử lý logout nếu cần
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
      setBlacklistedConferences([])
      // setLoggedIn(false) // Không cần thiết
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [isLoggedIn]) // <-- THÊM isLoggedIn VÀO DEPENDENCY ARRAY CỦA useCallback

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Reset current page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredConferences = useMemo(() => {
    if (!searchTerm) {
      return blacklistedConferences
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    return blacklistedConferences.filter(
      conference =>
        conference.title.toLowerCase().includes(lowercasedSearchTerm) ||
        conference.acronym.toLowerCase().includes(lowercasedSearchTerm)
    )
  }, [searchTerm, blacklistedConferences])

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(filteredConferences.length / ITEMS_PER_PAGE);

  const paginatedConferences = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredConferences.slice(startIndex, endIndex);
  }, [currentPage, filteredConferences]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  // Sử dụng isLoggedIn từ context
  if (!isLoggedIn) { // <-- SỬ DỤNG isLoggedIn TỪ CONTEXT
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
        <>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {paginatedConferences.map(conference => (
              <BlacklistConferenceCard
                key={conference.conferenceId}
                conference={conference}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className='mt-8'>
              <GeneralPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BlacklistTab