// src/app/[locale]/conferences/detail/page.tsx

'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useCallback, Suspense } from 'react'
import ConferenceFeedback from './ConferenceFeedback'
import NotFoundPage from '../../utils/NotFoundPage'
import Loading from '../../utils/Loading'
import { ConferenceTabs } from './ConferenceTabs'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Header } from '../../utils/Header'
import Footer from '../../utils/Footer'
import { useAuth } from '@/src/contexts/AuthContext'

// Import hooks
import useSequentialConferenceData from '@/src/hooks/conferenceDetails/useSequentialConferenceData'
import useFollowConference from '@/src/hooks/conferenceDetails/useFollowConference'
import useShareConference from '@/src/hooks/conferenceDetails/useShareConference'
import useTopicsDisplay from '@/src/hooks/conferenceDetails/useTopicsDisplay'
import useFormatConferenceDates from '@/src/hooks/conferenceDetails/useFormatConferenceDates'
import useAddToCalendar from '@/src/hooks/conferenceDetails/useAddToCalendar'
import useUpdateConference from '@/src/hooks/conferenceDetails/useUpdateConference'
import useBlacklistConference from '@/src/hooks/conferenceDetails/useBlacklistConference'

// Import components
import ConferenceHeader from './ConferenceHeader'
import ConferenceTopics from './ConferenceTopics'
import ConferenceActionButtons from './ConferenceActionButtons'

// Import utility functions
import { transformDates, calculateOverallRating } from './utils/conferenceUtils'

// ==================================================================
// BƯỚC 2.1: IMPORT SERVICE THÔNG BÁO
// ==================================================================
import { notification } from '@/src/utils/toast/notification'; // <<<< THAY ĐỔI QUAN TRỌNG

interface DetailContentProps {
  locale: string
  conferenceId: string | null
}

const DetailContent: React.FC<DetailContentProps> = ({
  locale,
  conferenceId
}) => {
  const t = useTranslations('ConferenceDetail') // Sử dụng namespace để quản lý translation
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn, isInitializing: isAuthInitializing, user, logout } = useAuth()

  const {
    conferenceDataFromDB,
    dbError,
    loading: sequentialLoading
  } = useSequentialConferenceData(conferenceId)

  const lastOrganization = conferenceDataFromDB?.organizations?.[0]
  const firstRankData = conferenceDataFromDB?.ranks?.[0]
  const transformedDatesData = transformDates(lastOrganization?.conferenceDates)

  const {
    isFollowing,
    handleFollowClick,
    loading: followLoading,
    error: followError
  } = useFollowConference(conferenceDataFromDB)

  const {
    isAddToCalendar,
    handleAddToCalendar,
    loading: calendarLoading,
    error: calendarError
  } = useAddToCalendar(conferenceDataFromDB)

  const {
    isBlacklisted,
    handleBlacklistClick,
    loading: blacklistLoading,
    error: blacklistError
  } = useBlacklistConference(conferenceDataFromDB)

  const language = useTranslations('')('language')
  const { isUpdating, updateResult, updateConference } = useUpdateConference()
  const { handleShareClick } = useShareConference(conferenceDataFromDB)
  const { displayedTopics, hasMoreTopics, showAllTopics, setShowAllTopics } =
    useTopicsDisplay(lastOrganization?.topics || [])

  const { dateDisplay } = useFormatConferenceDates(
    transformedDatesData,
    language
  )

  const checkLoginAndRedirect = useCallback(
    (callback: () => void) => {
      if (isAuthInitializing) {
        return
      }
      if (!isLoggedIn) {
        const currentPath =
          pathname + (conferenceId ? `?id=${conferenceId}` : '')
        localStorage.setItem('returnUrl', currentPath)
        router.push(`/${locale}/auth/login`)
      } else {
        callback()
      }
    },
    [isLoggedIn, isAuthInitializing, pathname, router, locale, conferenceId]
  )

  // ==================================================================
  // BƯỚC 2.2: THAY THẾ ALERT() BẰNG NOTIFICATION SERVICE
  // ==================================================================
  useEffect(() => {
    if (updateResult) {
      if (updateResult.success) {
        // Sử dụng notification.success
        notification.success(updateResult.message || t('updateSuccess'));
      } else {
        // Sử dụng notification.error
        notification.error(updateResult.error || t('updateError'));
      }
    }
  }, [updateResult, t])


  // ==================================================================
  // BƯỚC 2.3: GOM CÁC useEffect LỖI VÀO MỘT CHỖ CHO GỌN
  // ==================================================================
  useEffect(() => {
    // Lấy lỗi đầu tiên xuất hiện
    const errorMessage = followError || calendarError || blacklistError;

    if (errorMessage) {
      // Kiểm tra các thông điệp lỗi cụ thể nếu cần
      if (errorMessage === 'User is banned') {
        notification.error(t('userBannedError')); // Dùng key translation cho chuyên nghiệp
      } else {
        // Hiển thị các lỗi khác
        notification.error(errorMessage);
      }
    }
    // Phụ thuộc vào các biến lỗi và hàm t (nếu dùng)
  }, [followError, calendarError, blacklistError, t]);


  // --- Loading & Error States ---
  if (isAuthInitializing || (sequentialLoading && !conferenceDataFromDB)) {
    return <Loading />
  }

  if (dbError === 'Conference not found' || dbError?.includes('404') || !conferenceId) {
    return <NotFoundPage />
  }
  if (dbError) {
    return (
      <div className='flex h-screen items-center justify-center'>
        {/* Hiển thị lỗi một cách thân thiện hơn */}
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-red-500 mb-2'>{t('errorLoadingTitle')}</h2>
          <p>{t('errorLoadingMessage', { error: dbError })}</p>
        </div>
      </div>
    )
  }
  if (!conferenceDataFromDB) {
    return <NotFoundPage />
  }

  const displayOrganization =
    lastOrganization ?? conferenceDataFromDB?.organizations?.[0]
  const overallRating = calculateOverallRating(conferenceDataFromDB?.feedbacks)
  const totalReviews = conferenceDataFromDB?.feedbacks?.length || 0

  return (
    <div className='flex min-h-screen flex-col'>
      <Header locale={locale} />
      <main className='container mx-auto flex-grow px-0 py-8 pt-20 md:px-4'>
        {isUpdating && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <Loading />
          </div>
        )}

        <div className='rounded-lg bg-white-pure p-2 shadow-md md:p-4'>
          <div className='flex flex-col gap-4 md:flex-row'>
            <div className='md:w-4/5'>
              <ConferenceHeader
                conferenceData={conferenceDataFromDB}
                lastOrganization={lastOrganization}
                firstRankData={firstRankData}
                dateDisplay={dateDisplay}
                overallRating={overallRating}
                totalReviews={totalReviews}
              />
              <ConferenceTopics
                displayedTopics={displayedTopics}
                hasMoreTopics={hasMoreTopics}
                showAllTopics={showAllTopics}
                setShowAllTopics={setShowAllTopics}
              />
            </div>

            <div className='md:w-1/5'>
              <ConferenceActionButtons
                conferenceId={conferenceId}
                displayOrganization={displayOrganization}
                isAddToCalendar={isAddToCalendar}
                handleAddToCalendar={handleAddToCalendar}
                calendarLoading={calendarLoading}
                handleShareClick={handleShareClick}
                isFollowing={isFollowing}
                handleFollowClick={handleFollowClick}
                followLoading={followLoading}
                isUpdating={isUpdating}
                updateConference={updateConference}
                isBlacklisted={isBlacklisted}
                handleBlacklistClick={handleBlacklistClick}
                blacklistLoading={blacklistLoading}
                checkLoginAndRedirect={checkLoginAndRedirect}
              />
            </div>
          </div>
          <div className='mt-6 border-t pt-6 md:mt-4 md:pt-4'>
            <ConferenceTabs conference={conferenceDataFromDB} />
          </div>
        </div>

        <div className='mt-8 rounded-lg bg-white-pure p-4 shadow-md md:p-6'>
          <ConferenceFeedback conferenceData={conferenceDataFromDB} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Component cha để bọc Suspense
const DetailPage = ({ params: { locale } }: { params: { locale: string } }) => {
  return (
    <Suspense fallback={<Loading />}>
      <PageContent locale={locale} />
    </Suspense>
  )
}

// Component trung gian để lấy searchParams
const PageContent = ({ locale }: { locale: string }) => {
  const searchParams = useSearchParams()
  const conferenceId = searchParams.get('id')

  return <DetailContent locale={locale} conferenceId={conferenceId} />
}

export default DetailPage