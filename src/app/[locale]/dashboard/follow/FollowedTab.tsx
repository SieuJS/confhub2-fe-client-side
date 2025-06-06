// FollowedTab.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { Link } from '@/src/navigation'
import Button from '../../utils/Button'
import ConferenceItem from '../../conferences/ConferenceItem'
import { ConferenceInfo } from '../../../../models/response/conference.list.response'
import { timeAgo, formatDateFull } from '../timeFormat'
import Tooltip from '../../utils/Tooltip'
import { useTranslations } from 'next-intl'
import { appConfig } from '@/src/middleware'
import { useAuth } from '@/src/contexts/AuthContext' // <<<< THAY ĐỔI QUAN TRỌNG
interface FollowedTabProps {}

// Kế thừa ConferenceInfo (ngoại trừ 'dates') và thêm trường 'followedAt'
interface FollowedConferenceResponse extends Omit<ConferenceInfo, 'dates'> {
  id: string // Đảm bảo ID có mặt và là string
  followedAt: string // Trường này sẽ chứa timestamp khi người dùng follow
  // Định nghĩa lại kiểu cho 'dates' để phản ánh nó là một MẢNG
  dates?: { fromDate?: string; toDate?: string }[]
}

const API_GET_USER_ENDPOINT = `${appConfig.NEXT_PUBLIC_DATABASE_URL}/api/v1`

const FollowedTab: React.FC<FollowedTabProps> = () => {
  const t = useTranslations('')
  const language = t('language')

  const [followedConferences, setFollowedConferences] = useState<
    FollowedConferenceResponse[]
  >([])
  const [loading, setLoading] = useState(true)
  const [loggedIn, setLoggedIn] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true) // Dùng để kiểm soát trạng thái loading ban đầu
  const [isBanned, setIsBanned] = useState(false)
  const {logout} = useAuth();

  const fetchData = useCallback(async () => {
    setLoading(true) // Bắt đầu loading khi fetchData được gọi
    const token = localStorage.getItem('token')

    if (!token) {
      console.warn('No token found, cannot fetch followed conferences.')
      setLoggedIn(false)
      setFollowedConferences([]) // Xóa dữ liệu cũ nếu không có token
      setLoading(false)
      setInitialLoad(false)
      return
    }

    setLoggedIn(true) // Đặt trạng thái loggedIn nếu có token

    try {
      const response = await fetch(
        `${API_GET_USER_ENDPOINT}/follow-conference/followed`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Authentication error. Please log in.')
          setLoggedIn(false)
        } else if (response.status === 403) {
          console.error('User is banned.')
          setLoggedIn(false)
          setIsBanned(true);
        } else{
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        setFollowedConferences([]) // Xóa dữ liệu nếu có lỗi
        return // Dừng thực thi nếu có lỗi
      }

      let followed: FollowedConferenceResponse[] = await response.json()

      // Sắp xếp danh sách theo followedAt giảm dần (mới nhất lên trên)
      followed.sort((a, b) => {
        const dateA = new Date(a.followedAt).getTime()
        const dateB = new Date(b.followedAt).getTime()
        return dateB - dateA
      })

      setFollowedConferences(followed)
    } catch (error) {
      console.error('Failed to fetch followed conferences:', error)
      setFollowedConferences([]) // Xóa dữ liệu nếu fetch thất bại
      setLoggedIn(false) // Giả định lỗi fetch có thể do xác thực
    } finally {
      setLoading(false) // Dừng loading
      setInitialLoad(false) // Đã hoàn thành lần tải đầu tiên
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // --- Hiển thị UI dựa trên trạng thái ---
  // Chỉ hiển thị "Loading" ở lần tải đầu tiên
  if (loading && initialLoad) {
    return <div className='container mx-auto p-4'>{t('Loading')}</div>
  }

  // Hiển thị thông báo yêu cầu đăng nhập nếu chưa đăng nhập
  if (!loggedIn) {
    if (isBanned) {
    logout({callApi: true, preventRedirect: true});
    return (
      <div className='container mx-auto p-4'>
        <p className='mb-4'>
          {t(`User_is_banned!_You'll_automatically_logout!`)}
        </p>
        <p className='mb-4'>{t('Please_use_another_account_to_view_blacklisted_conferences')}</p>
          <Link href='/auth/login'>
            <Button variant='primary'>{t('Sign_In')}</Button>
          </Link>
      </div>
  )
  } else
    return (
      <div className='container mx-auto p-4'>
        <p className='mb-4'>
          {t('Please_log_in_to_view_followed_conferences')}
        </p>
        <Link href='/auth/login'>
          <Button variant='primary'>{t('Sign_In')}</Button>
        </Link>
      </div>
    )
  }

  // --- Kết thúc hiển thị UI dựa trên trạng thái ---

  return (
    <div className='container mx-auto p-2 md:p-4'>
      <div className='mb-2 flex items-center justify-between'>
        <h1 className='text-xl font-semibold md:text-2xl'>
          {t('Followed_Conferences')}
        </h1>
        <button
          onClick={fetchData} // Tải lại dữ liệu khi click
          className='rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
          aria-label='Refresh followed conferences'
          disabled={loading} // Tắt nút khi đang tải
        >
          {/* Refresh Icon */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className={`lucide lucide-refresh-cw ${loading ? 'animate-spin' : ''}`} // Thêm hiệu ứng spin khi tải
          >
            <path d='M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.67 2.62' />
            <path d='M22 4v4h-4' />
          </svg>
        </button>
      </div>

      {followedConferences.length === 0 ? (
        <p>{t('You_are_not_following_any_conferences_yet')}</p>
      ) : (
        followedConferences.map(conference => {
          // Xây dựng chuỗi địa điểm theo yêu cầu người dùng
          const locationString = (() => {
            if (!conference.location) {
              return t('Location_not_available') || 'Location not available'
            }
            const parts: string[] = []
            if (conference.location.cityStateProvince) {
              parts.push(conference.location.cityStateProvince)
            }
            if (conference.location.country) {
              parts.push(conference.location.country)
            }
            // Nếu mảng parts rỗng (đối tượng location có nhưng các trường con rỗng/null)
            if (parts.length === 0) {
              return t('Location_not_available') || 'Location not available'
            }
            return parts.join(', ')
          })()

          return (
            <div
              className='mb-4 rounded-xl md:border-2 md:px-4 md:py-2 md:shadow-xl'
              key={conference.id}
            >
              {/* Hiển thị thời gian follow */}
              {conference.followedAt && (
                <div className='flex text-xs md:text-base'>
                  <span className='mr-1 '>{t('Followed_Time')}: </span>
                  <Tooltip
                    text={formatDateFull(conference.followedAt, language)}
                  >
                    <span>{timeAgo(conference.followedAt, language)}</span>
                  </Tooltip>
                </div>
              )}

              {/* Truyền dữ liệu conference đến ConferenceItem */}
              <ConferenceItem
                conference={{
                  id: conference.id,
                  title: conference.title,
                  acronym: conference.acronym,
                  location: locationString, // Sử dụng chuỗi địa điểm đã được xử lý
                  // ************** Sửa lỗi Dates not available ở đây **************
                  fromDate: conference.dates?.[0]?.fromDate, // Lấy phần tử đầu tiên của mảng dates
                  toDate: conference.dates?.[0]?.toDate // Lấy phần tử đầu tiên của mảng dates
                }}
              />
            </div>
          )
        })
      )}
    </div>
  )
}

export default FollowedTab
