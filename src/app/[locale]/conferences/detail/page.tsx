'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useCallback } from 'react'
import ConferenceFeedback from '../../conferences/detail/ConferenceFeedback'
import NotFoundPage from '../../utils/NotFoundPage'
import Loading from '../../utils/Loading'
import { ConferenceTabs } from '../../conferences/detail/ConferenceTabs'
import { useSearchParams } from 'next/navigation'
import { Header } from '../../utils/Header'
import Footer from '../../utils/Footer'
import { useRouter, usePathname } from 'next/navigation'
import useAuthApi from '@/src/hooks/auth/useAuthApi'
import FloatingChatbot from '@/src/app/[locale]/floatingchatbot/FloatingChatbot'; // <-- IMPORT MỚI

// Import the custom hooks
import useSequentialConferenceData from '@/src/hooks/conferenceDetails/useSequentialConferenceData'
import useFollowConference from '../../../../hooks/conferenceDetails/useFollowConference'
import useShareConference from '../../../../hooks/conferenceDetails/useShareConference'
import useTopicsDisplay from '../../../../hooks/conferenceDetails/useTopicsDisplay'
import useFormatConferenceDates from '../../../../hooks/conferenceDetails/useFormatConferenceDates'
import useAddToCalendar from '../../../../hooks/conferenceDetails/useAddToCalendar'
import useUpdateConference from '../../../../hooks/conferenceDetails/useUpdateConference'
import useBlacklistConference from '../../../../hooks/conferenceDetails/useBlacklistConference'

// Import new components
import ConferenceHeader from './ConferenceHeader';
import ConferenceTopics from './ConferenceTopics';
import ConferenceActionButtons from './ConferenceActionButtons';

// Import utility functions
import { transformDates, calculateOverallRating } from './utils/conferenceUtils';

interface EventCardProps {
  locale: string
}

const Detail: React.FC<EventCardProps> = ({ locale }: EventCardProps) => {
  const t = useTranslations('')
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const router = useRouter()
  const pathname = usePathname()

  const {
    conferenceDataFromDB,
    // conferenceDataFromJSON, // Keep if used elsewhere
    dbError,
    // jsonError, // Keep if used elsewhere
    loading: sequentialLoading
  } = useSequentialConferenceData(id)

  // --- Extract accessType and rank from the last organization ---
  const lastOrganization =
    conferenceDataFromDB?.organizations?.[
    conferenceDataFromDB.organizations.length - 1
    ]
  const firstRankData = conferenceDataFromDB?.ranks?.[0]

  const transformedDatesData = transformDates(lastOrganization?.conferenceDates) // Renamed to avoid conflict

  const {
    isFollowing,
    handleFollowClick,
    loading: followLoading,
    error: followError // You might want to display this error
  } = useFollowConference(conferenceDataFromDB)

  const {
    isAddToCalendar,
    handleAddToCalendar,
    loading: calendarLoading,
    error: calendarError // You might want to display this error
  } = useAddToCalendar(conferenceDataFromDB)

  const {
    isBlacklisted,
    handleBlacklistClick,
    loading: blacklistLoading,
    error: blacklistError // You might want to display this error
  } = useBlacklistConference(conferenceDataFromDB)

  const language = t('language')
  const { isUpdating, updateResult, updateConference } = useUpdateConference()
  const { handleShareClick } = useShareConference(conferenceDataFromDB) // only need the handler now
  const { displayedTopics, hasMoreTopics, showAllTopics, setShowAllTopics } =
    useTopicsDisplay(lastOrganization?.topics || [])

  const { dateDisplay } = useFormatConferenceDates(transformedDatesData, language)
  const { isLoggedIn } = useAuthApi()

  // Removed menu state and refs, they are now in ConferenceActionButtons

  const checkLoginAndRedirect = useCallback((callback: () => void) => { // Keep useCallback
    if (!isLoggedIn) {
      const localePrefix = pathname.split('/')[1]
      const pathWithLocale = `/${localePrefix}/auth/login`
      router.push(pathWithLocale)
    } else {
      callback()
    }
  }, [isLoggedIn, pathname, router])


  useEffect(() => {
    if (updateResult) {
      if (updateResult.success) {
        alert(updateResult.message) // Replace with a better notification system
      } else {
        alert(`Error: ${updateResult.error}`) // Replace with a better notification system
      }
    }
  }, [updateResult, t])

  // --- Loading & Error States ---
  // const isLoading = sequentialLoading || isUpdating; // This can be used for a general loading overlay
  if (dbError === 'Conference not found') return <NotFoundPage />
  if (sequentialLoading && !conferenceDataFromDB) return <Loading />

  const displayOrganization =
    lastOrganization ?? conferenceDataFromDB?.organizations?.[0]
  const overallRating = calculateOverallRating(conferenceDataFromDB?.feedbacks)
  const totalReviews = conferenceDataFromDB?.feedbacks?.length || 0

  return (
    <div className='bg-gray-5 flex min-h-screen flex-col'>
      <Header locale={locale} />

      <div className='container mx-auto flex-grow px-0 py-8 pt-20 md:px-4'>
        {isUpdating && ( // Action Loading Overlay
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <Loading />
          </div>
        )}

        {/* Display errors (e.g., followError, calendarError, blacklistError) using toasts or a notification system */}
        {/* {followError && <p className="text-red-500 text-center">Follow Error: {followError}</p>} */}


        <div className='bg-white-pure rounded-lg p-2 shadow-md md:p-4'>
          <div className='flex flex-col gap-4 md:flex-row'>
            {/* Left Column */}
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

            {/* Right Column (Action Buttons) */}
            <div className='md:w-1/5'>
              <ConferenceActionButtons
                conferenceId={id}
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

          {/* Conference Tabs */}
          <div className='mt-6 border-t pt-6 md:mt-4 md:pt-4'>
            <ConferenceTabs conference={conferenceDataFromDB} />
          </div>
        </div>

        {/* Feedback Section */}
        <div className='bg-white-pure mt-8 rounded-lg p-4 shadow-md md:p-6'>
          <ConferenceFeedback conferenceData={conferenceDataFromDB} />
        </div>
      </div>

      <Footer />
      <FloatingChatbot /> {/* <-- THÊM CHATBOT NỔI Ở ĐÂY */}

    </div>
  )
}

export default Detail