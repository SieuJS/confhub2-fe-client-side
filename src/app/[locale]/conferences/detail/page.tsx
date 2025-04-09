'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react' // Import useEffect
import Button from '../../utils/Button'
import ConferenceFeedback from '../../conferences/detail/ConferenceFeedback'
import NotFoundPage from '../../utils/NotFoundPage'
import Loading from '../../utils/Loading'
import { ConferenceTabs } from '../../conferences/detail/ConferenceTabs'
import { useSearchParams } from 'next/navigation'
import { Header } from '../../utils/Header'
import Footer from '../../utils/Footer'
import { Link } from '@/src/navigation' // Import useRouter
// import { useLocalStorage } from 'usehooks-ts'; // REMOVE: No direct localStorage
import { useRouter, usePathname } from 'next/navigation'
import { ImportantDate } from '@/src/models/response/conference.response'
import useAuthApi from '@/src/hooks/auth/useAuthApi' // Import useAuthApi

// Import the custom hooks
import useConferenceDataFromDB from '../../../../hooks/conferenceDetails/useConferenceDataFromDB'
import useConferenceDataFromJSON from '../../../../hooks/conferenceDetails/useConferenceDataFromJSON'
import useSequentialConferenceData from '@/src/hooks/conferenceDetails/useSequentialConferenceData'
import useFollowConference from '../../../../hooks/conferenceDetails/useFollowConference'
import useShareConference from '../../../../hooks/conferenceDetails/useShareConference'
import useClickOutside from '../../../../hooks/conferenceDetails/useClickOutside'
import useTopicsDisplay from '../../../../hooks/conferenceDetails/useTopicsDisplay'
import useFormatConferenceDates from '../../../../hooks/conferenceDetails/useFormatConferenceDates'
import useAddToCalendar from '../../../../hooks/conferenceDetails/useAddToCalendar'
import useUpdateConference from '../../../../hooks/conferenceDetails/useUpdateConference' // Import the hook
import useBlacklistConference from '../../../../hooks/conferenceDetails/useBlacklistConference' // Import the new hook

// Define the Feedback type (or import it)
export type Feedback = {
  id: string
  organizedId: string | null
  creatorId: string | null
  description: string | null
  star: number | null // Make star nullable
  createdAt: string | null
  updatedAt: string | null
}

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
    conferenceDataFromJSON,
    dbError,
    jsonError,
    loading: sequentialLoading // Đổi tên để tránh trùng lặp
  } = useSequentialConferenceData(id)

  const transformDates = (dates: ImportantDate[] | null | undefined) => {
    if (!dates) {
      return undefined // Or return an empty array: []
    }
    return dates
      .map(date => {
        if (!date) return undefined // Handle null dates within array
        return {
          type: date.type || '', // Provide default values for safety
          fromDate: date.fromDate || undefined, // Keep as undefined if null
          toDate: date.toDate || undefined // Keep as undefined if null
        }
      })
      .filter(date => date !== undefined) // Filter out any null dates
  }

  const {
    isFollowing,
    handleFollowClick,
    loading: followLoading,
    error: followError
  } = useFollowConference(conferenceDataFromJSON)
  const {
    isAddToCalendar,
    handleAddToCalendar,
    loading: calendarLoading,
    error: calendarError
  } = useAddToCalendar(conferenceDataFromJSON)
  const {
    isBlacklisted,
    handleBlacklistClick,
    loading: blacklistLoading,
    error: blacklistError
  } = useBlacklistConference(conferenceDataFromJSON)
  const language = t('language') // Get the language from translations
  const { isUpdating, updateResult, updateConference } = useUpdateConference()
  const { handleShareClick } = useShareConference(conferenceDataFromDB)
  const { displayedTopics, hasMoreTopics, showAllTopics, setShowAllTopics } =
    useTopicsDisplay(conferenceDataFromDB?.organization?.topics || [])
  const transformedDates = transformDates(conferenceDataFromDB?.dates)
  const { dateDisplay } = useFormatConferenceDates(transformedDates, language)
  const { isLoggedIn } = useAuthApi()

  const [openMenu, setOpenMenu] = useState<'share' | 'calendar' | null>(null)
  const menuContainerRef = useRef<HTMLDivElement>(null)

  const toggleShareMenu = () => {
    setOpenMenu(prev => (prev === 'share' ? null : 'share'))
  }

  const closeMenu = () => {
    setOpenMenu(null)
  }

  useClickOutside(menuContainerRef, closeMenu)

  // --- Helper Function for Authentication Check ---
  const checkLoginAndRedirect = (callback: () => void) => {
    if (!isLoggedIn) {
      // --- Prepend Locale Prefix ---
      const localePrefix = pathname.split('/')[1]
      const pathWithLocale = `/${localePrefix}/auth/login`

      router.push(pathWithLocale)
    } else {
      callback() // Execute the original action
    }
  }

  const renderShareMenu = () => {
    if (openMenu !== 'share') return null

    return (
      <div className='absolute right-0 z-20 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
        <div className='py-1'>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('facebook')
                closeMenu()
              })
            }}
            className='share-menu-container block w-full px-4 py-2 text-left text-sm  hover:bg-gray-100'
          >
            <span className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                fill='currentColor'
                className='bi bi-facebook mr-2'
                viewBox='0 0 16 16'
              >
                <path d='M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951' />
              </svg>
              {t('Share_on_Facebook')}
            </span>
          </button>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('twitter')
                closeMenu()
              })
            }}
            className='share-menu-container block w-full px-4 py-2 text-left text-sm  hover:bg-gray-100'
          >
            <span className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                fill='currentColor'
                className='bi bi-twitter-x mr-2'
                viewBox='0 0 16 16'
              >
                <path d='M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z' />
              </svg>
              {t('Share_on_X')}
            </span>
          </button>
          <button
            onClick={() => {
              checkLoginAndRedirect(() => {
                handleShareClick('reddit')
                closeMenu()
              })
            }}
            className='share-menu-container block w-full px-4 py-2 text-left text-sm  hover:bg-gray-100'
          >
            <span className='flex items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='16'
                height='16'
                fill='currentColor'
                className='bi bi-reddit mr-2'
                viewBox='0 0 16 16'
              >
                <path d='M6.167 8a.83.83 0 0 0-.83.83c0 .459.372.84.83.831a.831.831 0 0 0 0-1.661m1.843 3.647c.315 0 1.403-.038 1.976-.611a.23.23 0 0 0 0-.306.213.213 0 0 0-.306 0c-.353.363-1.126.487-1.67.487-.545 0-1.308-.124-1.671-.487a.213.213 0 0 0-.306 0 .213.213 0 0 0 0 .306c.564.563 1.652.61 1.977.61zm.992-2.807c0 .458.373.83.831.83s.83-.381.83-.83a.831.831 0 0 0-1.66 0z' />
                <path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.828-1.165c-.315 0-.602.124-.812.325-.801-.573-1.9-.945-3.121-.993l.534-2.501 1.738.372a.83.83 0 1 0 .83-.869.83.83 0 0 0-.744.468l-1.938-.41a.2.2 0 0 0-.153.028a.2.2 0 0 0-.086.134l-.592 2.788c-1.24.038-2.358.41-3.17.992-.21-.2-.496-.324-.81-.324a1.163 1.163 0 0 0-.478 2.224q-.03.17-.029.353c0 1.795 2.091 3.256 4.669 3.256s4.668-1.451 4.668-3.256c0-.114-.01-.238-.029-.353.401-.181.688-.592.688-1.069 0-.65-.525-1.165-1.165-1.165' />
              </svg>
              {t('Share_on_Reddit')}
            </span>
          </button>
        </div>
      </div>
    )
  }

  const calculateOverallRating = (
    feedbacks: Feedback[] | null | undefined
  ): number => {
    if (!feedbacks || feedbacks.length === 0) return 0
    const totalStars = feedbacks.reduce(
      (sum: number, feedback: Feedback) => sum + (feedback.star ?? 0),
      0
    )
    return totalStars / feedbacks.length
  }

  const renderFollowerAvatars = () => {
    if (!followedBy || followedBy.length === 0) {
      return <p className='text-sm text-gray-500'>{t('No_followers_yet')}</p>
    }

    const maxVisibleFollowers = 5
    const visibleFollowers = followedBy.slice(0, maxVisibleFollowers)
    const remainingFollowers = followedBy.length - maxVisibleFollowers

    return (
      <div className='flex items-center'>
        {visibleFollowers.map((followedBy: any) => (
          <img
            key={followedBy.id}
            src={
              followedBy.avatar
                ? followedBy.avatar
                : `https://ui-avatars.com/api/?name=${followedBy.firstName}+${followedBy.lastName}&background=random&size=32`
            }
            alt={`${followedBy.firstName} ${followedBy.lastName}`}
            width={32}
            height={32}
            className='h-8 w-8 rounded-full border-2 border-white'
            style={{ marginLeft: '-0.25rem' }}
          />
        ))}
        {remainingFollowers > 0 && (
          <span className='ml-2 text-sm text-gray-600'>
            +{remainingFollowers}
          </span>
        )}
      </div>
    )
  }

  useEffect(() => {
    if (updateResult) {
      // Display a notification (consider using a library like react-toastify)
      if (updateResult.success) {
        alert(updateResult.message) // Or use a toast notification
      } else {
        alert(`Error: ${updateResult.error}`)
      }
    }
  }, [updateResult])

  // --- Define Combined Loading State ---
  // Trang đang tải nếu:
  // 1. Dữ liệu chính đang được tải (sequentialLoading).
  // 2. HOẶC dữ liệu chính chưa có sẵn (sau khi sequentialLoading xong nhưng data là null/undefined).
  // 3. HOẶC một trong các hook phụ thuộc (follow, calendar, blacklist) đang tải *trạng thái ban đầu* của chúng.
  // --- Loading & Error States ---
  // Combine loading states if needed for a general overlay
  const isLoading = sequentialLoading || isUpdating
  // Combine errors or display them separately
  if (dbError === 'Conference not found') return <NotFoundPage />
  if (jsonError === 'Conference not found') return <NotFoundPage />

  if (isLoading) return <Loading /> // Show initial loading

  const { conference, organization, location } = conferenceDataFromDB || {}
  const { followedBy, isLessReputable } = conferenceDataFromJSON || {}

  const overallRating = calculateOverallRating(
    conferenceDataFromJSON?.feedBacks
  )
  const totalReviews = conferenceDataFromJSON?.feedBacks?.length || 0

  return (
    <div className='flex min-h-screen flex-col bg-gray-50'>
      <Header locale={locale} />

      <div className='container mx-auto flex-grow px-0 py-8 pt-20 md:px-4'>
        {/* Optional: General loading overlay */}
        {isUpdating && ( // Show overlay for actions, not initial load
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <Loading />
          </div>
        )}

        {/* Display specific errors (e.g., using toasts) */}
        {/* {followError && <Toast type="error" message={followError} />} */}
        {/* {blacklistError && <Toast type="error" message={blacklistError} />} */}
        {/* {updateError && <Toast type="error" message={updateError} />} */}
        {/* {calendarError && <Toast type="error" message={calendarError} />} */}

        <div className='rounded-lg bg-white p-2 shadow-md md:p-4'>
          {' '}
          {/* Main content wrapper */}
          <div className='flex flex-col gap-4 md:flex-row'>
            {/* Left Column */}
            <div className='md:w-4/5'>
              {' '}
              {/* Adjusted width */}
              <div className='flex flex-col items-start md:flex-row'>
                {' '}
                {/* Wrap image and details */}
                <div className='mb-4 md:mb-0 md:w-1/4'>
                  {' '}
                  {/* Image container */}
                  <Image
                    src={'/bg-2.jpg'}
                    alt={
                      conference?.title
                        ? `${conference.title} Logo`
                        : 'Conference Logo'
                    }
                    width={300}
                    height={300}
                    className='hidden h-auto w-full rounded-lg md:block' // Make image responsive
                    style={{ objectFit: 'contain' }}
                  />
                </div>
                <div className='md:w-3/4 md:pl-6'>
                  {' '}
                  {/* Text details container */}
                  {/* ====================== WARNING SECTION ====================== */}
                  {isLessReputable && (
                    <div
                      className='mb-4 rounded-md border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700 shadow-sm'
                      role='alert'
                    >
                      <div className='flex items-center'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='mr-3 h-6 w-6 flex-shrink-0'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                          strokeWidth='2'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
                          />
                        </svg>
                        <div>
                          <p className='font-bold'>
                            {t('Potential_Reputation_Concern')}
                          </p>
                          <p className='text-sm'>
                            {t('Potential_Reputation_Concern_Description')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* ============================================================ */}
                  <p className='text-sm font-semibold text-red-500'>
                    {dateDisplay}
                  </p>
                  <h1 className='mt-1 text-xl font-bold md:text-2xl'>
                    {conference?.title || 'Conference Details'}
                  </h1>
                  <div className='flex items-center text-sm text-gray-600'>
                    <div className='mr-2 text-xl text-yellow-500'>★</div>
                    <strong>
                      {overallRating.toFixed(1)}{' '}
                      <span className='ml-1 text-gray-500'>
                        {' '}
                        ({totalReviews} {t('Ratings')})
                      </span>
                    </strong>
                  </div>
                  <div className='flex gap-4'>
                    <a
                      href='#map'
                      className='mt-1 flex items-center text-sm text-blue-600 hover:underline'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='lucide lucide-map-pin mr-2'
                      >
                        <path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0' />
                        <circle cx='12' cy='10' r='3' />
                      </svg>

                      {location?.address || 'Location Not Available'}
                    </a>
                    <Link
                      className='mt-1 flex items-center text-sm text-blue-600 hover:underline'
                      href={{
                        pathname: `/conferences`,
                        query: { publisher: organization?.publisher }
                      }}
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='lucide lucide-book-type mr-2'
                      >
                        <path d='M10 13h4' />
                        <path d='M12 6v7' />
                        <path d='M16 8V6H8v2' />
                        <path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20' />
                      </svg>

                      {organization?.publisher || 'Unknown'}
                    </Link>
                  </div>
                  {/* Followers Display */}
                  <div className='mt-2'>{renderFollowerAvatars()}</div>
                </div>
              </div>
              <div className='mt-2'>
                <h2 className='mb-2 text-base font-semibold md:text-lg'>
                  {t('Topics')}:
                </h2>
                <div className='flex flex-wrap'>
                  {/* Use optional chaining and nullish coalescing here */}
                  {(displayedTopics || []).map(topic => (
                    <Link
                      key={topic}
                      href={{
                        pathname: `/conferences`,
                        query: { topics: topic }
                      }}
                    >
                      <button className='my-1 mr-2 rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold  hover:bg-gray-300'>
                        {topic}
                      </button>
                    </Link>
                  ))}
                  {hasMoreTopics && (
                    <button
                      className='my-1 mr-2 rounded-full bg-blue-500 px-3 py-1 text-sm font-semibold text-white hover:bg-blue-600'
                      onClick={() => setShowAllTopics(!showAllTopics)}
                    >
                      {showAllTopics ? t('View_Less') : t('View_More')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className='md:w-1/5'>
              <div className='sticky top-4'>
                <div className='flex flex-col gap-3'>
                  {' '}
                  {/* Removed items-stretch */}
                  <Button
                    onClick={() => checkLoginAndRedirect(handleAddToCalendar)}
                    variant={isAddToCalendar ? 'primary' : 'secondary'}
                    size='small'
                    className='mx-4 flex  items-center justify-start gap-x-2' // Added justify-start and gap-x-2 mx-4
                    title={
                      isAddToCalendar
                        ? t(
                            'Remove_this_conference_from_your_personal_calendar'
                          )
                        : t('Add_this_conference_to_your_personal_calendar')
                    } // Tooltip
                    disabled={calendarLoading}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-5 w-5'
                    >
                      <path d='M8 2v4' />
                      <path d='M16 2v4' />
                      <rect width='18' height='18' x='3' y='4' rx='2' />
                      <path d='M3 10h18' />
                      <path d='M8 14h.01' />
                      <path d='M12 14h.01' />
                      <path d='M16 14h.01' />
                      <path d='M8 18h.01' />
                      <path d='M12 18h.01' />
                      <path d='M16 18h.01' />
                    </svg>
                    {isAddToCalendar ? t('Added') : t('Calendar')}
                  </Button>
                  <div
                    className='relative flex flex-col gap-3'
                    ref={menuContainerRef}
                  >
                    <Button
                      onClick={() => checkLoginAndRedirect(toggleShareMenu)}
                      variant='secondary'
                      size='small'
                      className='share-menu-container mx-4 flex items-center justify-start gap-x-2' // Added justify-start and gap-x-2 mx-4
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        strokeWidth='1.5'
                        stroke='currentColor'
                        className='h-5 w-5'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z'
                        />
                      </svg>
                      {t('Share')}
                    </Button>
                    {renderShareMenu()}
                  </div>
                  <Button
                    onClick={() => checkLoginAndRedirect(handleFollowClick)}
                    variant={isFollowing ? 'primary' : 'secondary'}
                    size='small'
                    className='mx-4 flex items-center justify-start gap-x-2' // Added justify-start and gap-x-2 mx-4
                    title={
                      isFollowing
                        ? t(
                            'Remove_this_conference_from_your_personal_follow_list'
                          )
                        : t('Add_this_conference_to_your_personal_follow_list')
                    } // Tooltip
                    disabled={followLoading}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-5 w-5'
                    >
                      <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.122 2.122 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1 -.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
                    </svg>
                    {isFollowing ? t('Followed') : t('Follow')}
                  </Button>
                  <Button
                    variant={'secondary'}
                    size='small'
                    onClick={() =>
                      checkLoginAndRedirect(() => updateConference(id))
                    } // Call updateConference
                    className={`mx-4 flex items-center justify-start gap-x-2 ${isUpdating ? 'cursor-not-allowed opacity-50' : ''}`}
                    disabled={isUpdating}
                    title={t('Update_this_conference')}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-5 w-5'
                    >
                      <path d='M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8' />
                      <path d='M3 3v5h5' />
                      <path d='M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16' />
                      <path d='M16 16h5v5' />
                    </svg>
                    {isUpdating ? t('Updating') : t('Update')}
                  </Button>
                  <Button
                    onClick={() => {
                      if (organization?.link) {
                        window.open(organization.link, '_blank')
                      } else {
                        alert(t('Website_link_is_not_available'))
                      }
                    }}
                    variant={'secondary'}
                    size='small'
                    className='mx-4 flex items-center justify-start gap-x-2' // Added justify-start and gap-x-2 mx-4
                    title={t('Go_to_conference_website')}
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-5 w-5'
                    >
                      <path d='M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6' />
                      <path d='m21 3-9 9' />
                      <path d='M15 3h6v6' />
                    </svg>
                    {t('Website')}
                  </Button>
                  {/* --- Add to Blacklist Button --- */}
                  <Button
                    onClick={() => checkLoginAndRedirect(handleBlacklistClick)}
                    variant={isBlacklisted ? 'primary' : 'secondary'} // Use danger variant when blacklisted
                    size='small'
                    className={`mx-4  flex items-center justify-start gap-x-2 `}
                    disabled={blacklistLoading}
                    title={
                      isBlacklisted
                        ? t(
                            'Remove_this_conference_from_your_personal_blacklist'
                          )
                        : t('Add_this_conference_to_your_personal_blacklist')
                    } // Tooltip
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      className='h-5 w-5'
                    >
                      <path d='m2 2 20 20' />
                      <path d='M8.35 2.69A10 10 0 0 1 21.3 15.65' />
                      <path d='M19.08 19.08A10 10 0 1 1 4.92 4.92' />
                    </svg>
                    {/* Text changes based on state */}
                    {isBlacklisted ? t('Blacklisted') : t('Blacklist')}
                  </Button>
                  {/* Display blacklist error if needed */}
                  {blacklistError && (
                    <p className='mt-1 text-center text-xs text-red-500'>
                      {t('Error')}: {blacklistError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <ConferenceTabs conference={conferenceDataFromDB} />
        </div>

        <div className='mt-8 rounded-lg bg-white p-4 shadow-md'>
          {/* Pass conferenceData to ConferenceFeedback */}
          <ConferenceFeedback conferenceData={conferenceDataFromJSON} />
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Detail
