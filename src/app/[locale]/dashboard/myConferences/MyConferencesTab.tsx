// frontend/MyConferencesTab.tsx
'use client' // Đảm bảo component này là Client Component

import React, { useState, useMemo, useEffect } from 'react' // Thêm useEffect
import ConferenceItem from '../../conferences/ConferenceItem'
import Button from '../../utils/Button'
import { Link } from '@/src/navigation'
import useMyConferences from '@/src/hooks/dashboard/myConferences/useMyConferences'
import { formatDateFull, timeAgo } from '../timeFormat' // Đường dẫn này cần kiểm tra lại nếu có lỗi
import Tooltip from '../../utils/Tooltip'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/src/contexts/AuthContext' // <<<< THAY ĐỔI QUAN TRỌNG

// Enum for conference status
enum ConferenceStatus {
  Approve = 'APPROVED', // Giữ nguyên giá trị từ backend nếu nó là string
  Pending = 'PENDING',
  Rejected = 'REJECTED'
  // Thêm các status khác nếu có từ backend, ví dụ: 'Draft', 'Cancelled'
}

const MyConferencesTab: React.FC = () => {
  const t = useTranslations('')
  const language = t('language')

  const [displayStatus, setDisplayStatus] = useState<ConferenceStatus | 'All'>( // Thêm 'All' để hiển thị tất cả
    ConferenceStatus.Pending
  )

  // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
  // isInitializing là trạng thái khởi tạo của AuthProvider
  // isLoading (đổi tên thành isAuthLoading) là khi có action bất đồng bộ từ useAuth (ít dùng ở đây)
  const {
    user,
    isLoggedIn,
    isInitializing: isAuthInitializing,
    getToken,
    logout
  } = useAuth()

  // Hook useMyConferences giờ sẽ lấy token từ getToken() của useAuth
  // và chỉ fetch khi user đã được xác thực và isAuthInitializing là false
  const {
    conferences,
    isLoading: isLoadingConferences, // Đổi tên để phân biệt
    error: conferencesError,
    refetch
  } = useMyConferences(user?.id || null, getToken) // Truyền userId (hoặc null) và hàm getToken

  // useEffect để tự động fetch lại khi user thay đổi (ví dụ: login/logout)
  // Hoặc khi isAuthInitializing thay đổi từ true sang false và user đã có
  useEffect(() => {
    if (!isAuthInitializing && user?.id) {
      // console.log('[MyConferencesTab] Auth initialized and user available, ensuring conferences are fetched.');
      // useMyConferences đã có logic fetch khi userId thay đổi,
      // nhưng gọi refetch ở đây có thể hữu ích nếu bạn muốn đảm bảo nó chạy sau khi auth sẵn sàng.
      // Hoặc bạn có thể để useMyConferences tự xử lý dựa trên sự thay đổi của user?.id
      // refetch(); // Cân nhắc có cần thiết không nếu useMyConferences đã handle
    }
  }, [isAuthInitializing, user?.id])

  const transformedConferences = useMemo(() => {
    if (!conferences) {
      return []
    }
    return conferences
      .map(conf => {
        // Bỏ qua các mục không có status hoặc status không phải là string hợp lệ
        if (typeof conf.status !== 'string') {
          // console.warn(`Conference ID ${conf.id} has invalid status:`, conf.status);
          return null // Trả về null để loại bỏ mục này sau
        }
        const normalizedStatus = conf.status.toUpperCase()
        const statusEnum = Object.values(ConferenceStatus).includes(
          normalizedStatus as ConferenceStatus
        )
          ? (normalizedStatus as ConferenceStatus)
          : ConferenceStatus.Pending // Hoặc một giá trị mặc định khác, hoặc loại bỏ nó
        return {
          id: conf.id,
          title: conf.title,
          acronym: conf.acronym,
          // Cẩn thận với optional chaining và truy cập mảng
          location: conf.organizations?.[0]?.locations?.[0]
            ? `${conf.organizations[0].locations[0].cityStateProvince || t('N/A')}, ${conf.organizations[0].locations[0].country || t('N/A')}`
            : t('Location_Not_Available'),
          year: conf.organizations?.[0]?.year?.toString() || t('N/A'), // Đảm bảo là string
          summerize: conf.organizations?.[0]?.summary || '', // Summary có thể là string rỗng
          fromDate: conf.organizations?.[0]?.conferenceDates?.find(
            d => d.type === 'conferenceDates'
          )?.fromDate,
          toDate: conf.organizations?.[0]?.conferenceDates?.find(
            d => d.type === 'conferenceDates'
          )?.toDate,
          websiteUrl: conf.organizations?.[0]?.link || '#', // Cung cấp fallback cho link
          status: statusEnum, // Ép kiểu nếu bạn chắc chắn giá trị status từ backend khớp với enum
          createdAt: conf.createdAt
          // Thêm các trường cần thiết khác từ conf
        }
      })
      .filter(conf => conf !== null)
      .sort((a, b) => {
        if (!a.createdAt) return 1 // Đẩy các item không có createdAt về cuối
        if (!b.createdAt) return -1
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [conferences, t]) // Thêm t vào dependencies nếu các giá trị fallback dùng t

  const filteredConferences = useMemo(() => {
    if (displayStatus === 'All') {
      return transformedConferences
    }
    return transformedConferences.filter(conf => conf.status === displayStatus)
  }, [transformedConferences, displayStatus])

  console.log('[MyConferencesTab] filteredConferences:', filteredConferences)

  // Chờ AuthProvider khởi tạo xong
  if (isAuthInitializing) {
    return (
      <div className='flex h-60 items-center justify-center'>
        <div>{t('Loading_authentication')}</div>
      </div>
    )
  }

    if (conferencesError) {
    if (conferencesError === 'User is banned')
    {
      if (isLoggedIn) { // Chỉ gọi logout nếu user thực sự đang logged in
          logout({ callApi: true, preventRedirect: true });
      }
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
    }
    else
    {
      return (
      <div className='flex h-60 flex-col items-center justify-center'>
        <p className='mb-2 text-red-500'>
          {t('Error_loading_conferences')}: {conferencesError}
        </p>
        <Button onClick={refetch} variant='secondary'>
          {t('Try_Again')}
        </Button>
      </div>
    )
    }
  }
  
  // Nếu chưa đăng nhập sau khi AuthProvider đã khởi tạo
  if (!isLoggedIn) {
    return (
      <div className='container mx-auto p-4'>
        <p className='mb-4'>{t('Please_log_in_to_view_your_conferences')}</p>
        <Link href='/auth/login'>
          <Button variant='primary'>{t('Sign_In')}</Button>
        </Link>
      </div>
    )
  }

  // User đã đăng nhập, giờ kiểm tra trạng thái tải conferences
  if (isLoadingConferences) {
    return (
      <div className='flex h-60 items-center justify-center'>
        <div>{t('Loading_your_conferences')}</div>
      </div>
    )
  }


  // User đã đăng nhập và không có lỗi, dữ liệu đã tải (hoặc rỗng)
  const getStatusTitle = (status: ConferenceStatus | 'All') => {
    if (status === 'All') return t('All_My_Conferences')
    switch (status) {
      case ConferenceStatus.Approve:
        return t('My_conferences_are_approved')
      case ConferenceStatus.Pending:
        return t('My_conferences_are_pending')
      case ConferenceStatus.Rejected:
        return t('My_conferences_are_rejected')
      default:
        return t('My_conferences') // Fallback title
    }
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-6 text-right'>
        <Link href={`/addconference`}>
          <Button variant='primary' size='medium' rounded>
            {t('Add_Conference')}
          </Button>
        </Link>
      </div>

      <div className='my-6 flex flex-wrap items-center justify-center gap-2 border-b pb-4 md:justify-start md:space-x-4'>
        <Button
          variant={displayStatus === 'All' ? 'primary' : 'secondary'} // Cần định nghĩa variant 'primary' và 'secondary'
          size='small'
          onClick={() => setDisplayStatus('All')}
        >
          {t('All')}
        </Button>
        <Button
          variant={
            displayStatus === ConferenceStatus.Pending ? 'primary' : 'secondary'
          }
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Pending)}
        >
          {t('Pending')}
        </Button>
        <Button
          variant={
            displayStatus === ConferenceStatus.Approve ? 'primary' : 'secondary'
          }
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Approve)}
        >
          {t('Approved')}
        </Button>
        <Button
          variant={
            displayStatus === ConferenceStatus.Rejected
              ? 'primary'
              : 'secondary'
          }
          size='small'
          onClick={() => setDisplayStatus(ConferenceStatus.Rejected)}
        >
          {t('Rejected')}
        </Button>
      </div>

      <h1 className='my-4 text-xl font-semibold md:text-2xl'>
        {getStatusTitle(displayStatus)}
        {` (${filteredConferences.length})`}
      </h1>

      {filteredConferences.length === 0 ? (
        <div className='my-10 text-center '>
          <p className='text-lg'>
            {t('You_have_no_conference_in_this_category')}
          </p>
          {displayStatus !== 'All' && (
            <Button
              variant='primary'
              onClick={() => setDisplayStatus('All')}
              className='mt-2 text-sm'
            >
              {t('View_all_conferences')}
            </Button>
          )}
        </div>
      ) : (
        <div className='space-y-6'>
          {filteredConferences.map(conference => (
            <div
              className='rounded-lg border p-2 shadow-md transition-shadow hover:shadow-lg' // Cải thiện styling
              key={conference.id}
            >
              <div className='mb-2 flex items-center text-base '>
                <span className='mr-1'>{t('Created_Time')}: </span>
                <Tooltip text={formatDateFull(conference.createdAt, language)}>
                  <span>{timeAgo(conference.createdAt, language)}</span>
                </Tooltip>
              </div>
              <ConferenceItem
                conference={{
                  // Chỉ truyền những gì ConferenceItem cần
                  id: conference.id,
                  title: conference.title,
                  acronym: conference.acronym,
                  location: conference.location,
                  fromDate: conference.fromDate,
                  toDate: conference.toDate,
                  status: conference.status
                  // websiteUrl: conference.websiteUrl, // Ví dụ nếu ConferenceItem cần
                }}
              />
              {/* Thêm các action button nếu cần, ví dụ: Edit, View Details */}
              {/* <div className="mt-3 flex justify-end space-x-2">
                <Link href={`/UpdateConference?id=${conference.id}`}>
                    <Button variant="outline" size="small">{t('Edit')}</Button>
                </Link>
                <Button variant="dangerOutline" size="small">{t('Delete')}</Button>
              </div> */}
            </div>
          ))}
        </div>
      )}
      {/* Nút refetch có thể không cần thiết nếu data tự động cập nhật hoặc có cơ chế khác */}
      {/* <button onClick={refetch} className="mt-6 rounded bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">
        {t('Refetch_Data')}
      </button> */}
    </div>
  )
}

export default MyConferencesTab
