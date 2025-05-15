// src/app/[locale]/conferences/detail/page.tsx

'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useCallback, Suspense } from 'react' // Thêm Suspense
import ConferenceFeedback from './ConferenceFeedback' // Đảm bảo path đúng
import NotFoundPage from '../../utils/NotFoundPage'
import Loading from '../../utils/Loading'
import { ConferenceTabs } from './ConferenceTabs' // Đảm bảo path đúng
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Header } from '../../utils/Header'
import Footer from '../../utils/Footer'
import { useAuth } from '@/src/contexts/AuthContext' // <<<< THAY ĐỔI QUAN TRỌNG
import FloatingChatbot from '@/src/app/[locale]/floatingchatbot/FloatingChatbot'

// Import the custom hooks
import useSequentialConferenceData from '@/src/hooks/conferenceDetails/useSequentialConferenceData'
import useFollowConference from '@/src/hooks/conferenceDetails/useFollowConference' // Path đã được sửa
import useShareConference from '@/src/hooks/conferenceDetails/useShareConference' // Path đã được sửa
import useTopicsDisplay from '@/src/hooks/conferenceDetails/useTopicsDisplay' // Path đã được sửa
import useFormatConferenceDates from '@/src/hooks/conferenceDetails/useFormatConferenceDates' // Path đã được sửa
import useAddToCalendar from '@/src/hooks/conferenceDetails/useAddToCalendar' // Path đã được sửa
import useUpdateConference from '@/src/hooks/conferenceDetails/useUpdateConference' // Path đã được sửa
import useBlacklistConference from '@/src/hooks/conferenceDetails/useBlacklistConference' // Path đã được sửa

// Import new components
import ConferenceHeader from './ConferenceHeader'
import ConferenceTopics from './ConferenceTopics'
import ConferenceActionButtons from './ConferenceActionButtons'

// Import utility functions
import { transformDates, calculateOverallRating } from './utils/conferenceUtils'

interface DetailContentProps {
  locale: string
  conferenceId: string | null
}

const DetailContent: React.FC<DetailContentProps> = ({ locale, conferenceId }) => {
  const t = useTranslations('')
  const router = useRouter()
  const pathname = usePathname()

  // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
  const { isLoggedIn, isInitializing: isAuthInitializing, user } = useAuth(); // Lấy thêm user nếu cần

  const {
    conferenceDataFromDB,
    dbError,
    loading: sequentialLoading
  } = useSequentialConferenceData(conferenceId) // Sử dụng conferenceId từ props

  const lastOrganization =
    conferenceDataFromDB?.organizations?.[
    conferenceDataFromDB.organizations.length - 1
    ]
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

  const language = t('language') // Hoặc có thể lấy locale từ props
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
      if (isAuthInitializing) { // Đợi auth khởi tạo xong
        console.log("[Detail Page] Auth still initializing, action deferred.");
        // Có thể hiển thị thông báo hoặc không làm gì cả
        return;
      }
      if (!isLoggedIn) {
        console.log("[Detail Page] Not logged in, redirecting to login for action.");
        const currentPath = pathname + (conferenceId ? `?id=${conferenceId}` : '');
        localStorage.setItem('returnUrl', currentPath);
        // locale đã có trong pathname, hoặc có thể lấy từ props locale
        router.push(`/${locale}/auth/login`);
      } else {
        callback();
      }
    },
    [isLoggedIn, isAuthInitializing, pathname, router, locale, conferenceId]
  );

  useEffect(() => {
    if (updateResult) {
      if (updateResult.success) {
        alert(updateResult.message) // Thay thế bằng hệ thống thông báo tốt hơn
      } else {
        alert(`Error: ${updateResult.error}`) // Thay thế bằng hệ thống thông báo tốt hơn
      }
    }
  }, [updateResult]) // Bỏ t nếu không dùng

  // --- Loading & Error States ---
  if (isAuthInitializing || (sequentialLoading && !conferenceDataFromDB)) {
    // Ưu tiên hiển thị loading auth nếu nó đang chạy
    // Hoặc loading data conference nếu auth đã xong
    return <Loading />;
  }

  if (dbError === 'Conference not found' || !conferenceId) {
    // Nếu không có conferenceId từ đầu (do URL sai) hoặc API trả về không tìm thấy
    return <NotFoundPage />;
  }
  if (dbError) { // Các lỗi khác từ API
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Error loading conference data: {dbError}</div>
      </div>
    );
  }
  if (!conferenceDataFromDB) { // Trường hợp không có data sau khi loading xong và không có lỗi cụ thể
    return <NotFoundPage />; // Hoặc một thông báo lỗi khác
  }


  const displayOrganization =
    lastOrganization ?? conferenceDataFromDB?.organizations?.[0];
  const overallRating = calculateOverallRating(conferenceDataFromDB?.feedbacks);
  const totalReviews = conferenceDataFromDB?.feedbacks?.length || 0;

  return (
    <div className='flex min-h-screen flex-col'>
      <Header locale={locale} />
      <main className='container mx-auto flex-grow px-0 py-8 pt-20 md:px-4'>
        {isUpdating && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <Loading />
          </div>
        )}

        {/* Hiển thị lỗi từ các action (follow, calendar, blacklist) */}
        {followError && <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">Follow Error: {followError}</div>}
        {calendarError && <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">Calendar Error: {calendarError}</div>}
        {blacklistError && <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">Blacklist Error: {blacklistError}</div>}


        <div className='rounded-lg bg-white p-2 shadow-md md:p-4'> {/* Đổi white-pure thành white */}
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
                conferenceId={conferenceId} // Truyền conferenceId đã được validate
                displayOrganization={displayOrganization}
                isAddToCalendar={isAddToCalendar}
                handleAddToCalendar={handleAddToCalendar}
                calendarLoading={calendarLoading}
                handleShareClick={handleShareClick}
                isFollowing={isFollowing}
                handleFollowClick={handleFollowClick}
                followLoading={followLoading}
                isUpdating={isUpdating} // Loading khi đang update từ API
                updateConference={updateConference}
                isBlacklisted={isBlacklisted}
                handleBlacklistClick={handleBlacklistClick}
                blacklistLoading={blacklistLoading}
                checkLoginAndRedirect={checkLoginAndRedirect}
              // Cân nhắc truyền user.roles vào đây nếu cần kiểm tra quyền hạn cụ thể
              />
            </div>
          </div>

          <div className='mt-6 border-t pt-6 md:mt-4 md:pt-4'>
            <ConferenceTabs conference={conferenceDataFromDB} />
          </div>
        </div>

        <div className='mt-8 rounded-lg bg-white p-4 shadow-md md:p-6'> {/* Đổi white-pure thành white */}
          <ConferenceFeedback conferenceData={conferenceDataFromDB} />
        </div>
      </main>
      <Footer />
      <FloatingChatbot />
    </div>
  )
}

// Component cha để bọc Suspense
const DetailPage = ({
  params: { locale }
}: {
  params: { locale: string }
}) => {
  return (
    <Suspense fallback={<Loading />}> {/* Fallback chung cho cả trang */}
      <PageContent locale={locale} />
    </Suspense>
  );
};

// Component trung gian để lấy searchParams
const PageContent = ({ locale }: { locale: string }) => {
  const searchParams = useSearchParams();
  const conferenceId = searchParams.get('id');

  return <DetailContent locale={locale} conferenceId={conferenceId} />;
}

export default DetailPage;