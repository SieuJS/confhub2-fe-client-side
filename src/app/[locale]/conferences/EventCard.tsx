// components/conferences/EventCard.tsx
import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { ConferenceInfo } from '../../../models/response/conference.list.response' // Type for event prop
import { ConferenceResponse } from '@/src/models/response/conference.response' // Type potentially needed by hooks
import { Link } from '@/src/navigation' // Assuming next-intl/link setup
import { useTranslations } from 'next-intl'
import { useRouter } from '@/src/navigation' // Assuming next-intl/navigation setup
import useAuthApi from '@/src/hooks/auth/useAuthApi' // Hook to check login status

// Import the provided hooks for Follow and Calendar actions
import useFollowConference from '@/src/hooks/conferenceDetails/useFollowConference' // Adjust path if needed
import useAddToCalendar from '@/src/hooks/conferenceDetails/useAddToCalendar' // Adjust path if needed

interface EventCardProps {
  event: ConferenceInfo // The data for this specific event card
  className?: string
  style?: React.CSSProperties
}

const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const t = useTranslations('') // For internationalization
  const router = useRouter() // For navigation (e.g., redirecting to login)
  const { isLoggedIn } = useAuthApi() // Get user login status

  // --- Prepare data for hooks ---
  // Hooks expect ConferenceResponse | null. We adapt the ConferenceInfo.
  // Casting is simpler if the structure is compatible enough (primarily needs 'id').
  const conferenceDataForHook = event as unknown as ConferenceResponse | null

  // --- Instantiate hooks for this card ---
  const {
    isFollowing,
    handleFollowClick: triggerFollowAction,
    loading: followLoading,
    error: followError
  } = useFollowConference(conferenceDataForHook)

  const {
    isAddToCalendar,
    handleAddToCalendar: triggerCalendarAction,
    loading: calendarLoading,
    error: calendarError
  } = useAddToCalendar(conferenceDataForHook)

  // --- Local state for UI elements (tooltips) ---
  const [showWebsiteTooltip, setShowWebsiteTooltip] = useState(false)
  const [showFavoriteTooltip, setShowFavoriteTooltip] = useState(false)
  const [showAddCalendarTooltip, setShowAddCalendarTooltip] = useState(false)

  // --- Utility Functions ---

  // Function to check login status before performing an action
  const checkLoginAndRedirect = useCallback(
    (callback: () => void) => {
      if (!isLoggedIn) {
        // Redirect to login page if not logged in
        router.push(`/auth/login`) // Adjust path as needed
      } else {
        // Execute the callback action if logged in
        callback()
      }
    },
    [isLoggedIn, router]
  )

  // Date formatting function
  const formatDate = useCallback((date: Date | undefined): string => {
    if (!date) return 'TBD'
    try {
      return date.toLocaleDateString('en-US', {
        // Use a specific locale for consistency
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (e) {
      console.error('Error formatting date:', date, e)
      return 'Invalid Date' // Handle potential errors
    }
  }, [])

  // Date range formatting function
  const formatDateRange = useCallback(
    (fromDate: string | undefined, toDate: string | undefined) => {
      if (!fromDate || !toDate) return 'TBD'
      try {
        const startDate = new Date(fromDate)
        const endDate = new Date(toDate)
        // Basic validation
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return 'Invalid Date Range'
        }
        if (startDate.toDateString() === endDate.toDateString()) {
          return formatDate(startDate)
        }
        return `${formatDate(startDate)} - ${formatDate(endDate)}`
      } catch (e) {
        console.error('Error formatting date range:', fromDate, toDate, e)
        return 'Invalid Date Range'
      }
    },
    [formatDate] // Dependency
  )

  // Location string generation
  const locationString =
    [event.location?.cityStateProvince, event.location?.country]
      .filter(Boolean) // Remove null/undefined parts
      .join(', ') || // Join with comma and space
    'Location Not Available'

  // Dynamic styling for Rank badge
  const getRankColor = useCallback((rank?: string) => {
    rank = rank?.toUpperCase()
    switch (rank) {
      case 'A*':
        return 'bg-amber-100 text-amber-700 border border-amber-300'
      case 'A':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'B':
        return 'bg-sky-100 text-sky-700 border border-sky-300'
      case 'C':
        return 'bg-orange-100 text-orange-700 border border-orange-300'
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-300'
    }
  }, [])

  // Dynamic styling for Access Type badge
  const getAccessTypeColor = useCallback((accessType?: string) => {
    accessType = accessType?.toUpperCase() // Normalize
    switch (accessType) {
      case 'ONLINE':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'OFFLINE':
        return 'bg-red-100 text-red-700 border border-red-300'
      case 'HYBRID':
        return 'bg-blue-100 text-blue-700 border border-blue-300'
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-300'
    }
  }, [])

  // --- Event Handlers ---

  // Handles clicking the Favorite (Follow) button
  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation() // Prevent card click when clicking button
      checkLoginAndRedirect(triggerFollowAction) // Check login, then call hook's action
      setShowFavoriteTooltip(false) // Hide tooltip immediately
    },
    [checkLoginAndRedirect, triggerFollowAction] // Dependencies
  )

  // Handles clicking the Add to Calendar button
  const handleAddCalendarClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation() // Prevent card click
      checkLoginAndRedirect(triggerCalendarAction) // Check login, then call hook's action
      setShowAddCalendarTooltip(false) // Hide tooltip immediately
    },
    [checkLoginAndRedirect, triggerCalendarAction] // Dependencies
  )

  // Handles clicking the Go to Website button
  const handleGoToWebsite = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
      e.preventDefault() // Prevent potential default link behavior
      e.stopPropagation() // Prevent card click
      if (url) {
        window.open(url, '_blank', 'noopener noreferrer') // Open in new tab securely
      } else {
        console.warn('No URL provided for Go to Website')
        // Optionally show a message to the user
      }
      setShowWebsiteTooltip(false) // Hide tooltip
    },
    [] // No dependencies needed
  )

  // Combine loading states from both hooks
  const isLoading = followLoading || calendarLoading

  // --- Render ---
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg bg-white shadow-lg transition duration-300 ease-in-out hover:shadow-xl dark:bg-black ${className}`}
    >
      {/* Image Section with Badges */}
      <div className='relative hover:opacity-90'>
        <Image
          // Use a placeholder or actual image source
          src={'/bg-2.jpg'} // Example: Use logoUrl if available, fallback to default
          alt={event.title || 'Conference Image'} // Provide meaningful alt text
          width={400}
          height={225} // Adjust aspect ratio as needed
          style={{ objectFit: 'cover', width: '100%', height: '180px' }} // Ensure consistent height
          className='w-full'
          priority // Consider adding priority for above-the-fold images
          onError={e => {
            e.currentTarget.src = '/bg-2.jpg'
          }} // Fallback image on error
        />
        {/* Rank Badge */}
        <div className='absolute right-2 top-0'>
          <span
            className={`font-semibold ${getRankColor(event?.rank || 'No info')} rounded px-2 py-1 text-xs`}
          >
            {event.rank ? `Rank: ${event.rank}` : 'By Users'}
          </span>
        </div>
        {/* Access Type Badge */}
        {event.accessType && (
          <div className='absolute right-2 top-9'>
            {' '}
            {/* Adjusted positioning */}
            <span
              className={`rounded px-2 py-1 text-xs font-semibold ${getAccessTypeColor(event.accessType)}`}
              title={`Access Type: ${event.accessType}`} // Tooltip for access type
            >
              {event.accessType}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className='flex flex-grow flex-col px-4 py-4'>
        {' '}
        {/* Increased padding slightly */}
        {/* Title and Acronym */}
        <div className='mb-2'>
          <Link
            href={{ pathname: `/conferences/detail`, query: { id: event.id } }}
            className='group' // Group for hover effects if needed
          >
            <h3 className='cursor-pointer text-left text-base font-bold  transition duration-300 group-hover:text-blue-600'>
              {' '}
              {/* Adjusted size, added line-clamp */}
              {event.title} {event.acronym ? `(${event.acronym})` : ''}
            </h3>
          </Link>
        </div>
        {/* Location */}
        <div className='mb-3 flex items-center text-xs  transition duration-300 '>
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
            className='lucide lucide-map-pin mr-1.5 flex-shrink-0 text-red-600'
          >
            {' '}
            {/* Adjusted size/margin/color */}
            <path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0' />
            <circle cx='12' cy='10' r='3' />
          </svg>
          <span className='line-clamp-1 text-left'>{locationString}</span>{' '}
          {/* Added line-clamp */}
        </div>
        {/* Date */}
        <div className='mb-3 flex items-center text-xs  transition duration-300 '>
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
            className='lucide lucide-calendar-days mr-1.5 flex-shrink-0 text-red-600'
          >
            {' '}
            {/* Adjusted size/margin/color */}
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
          <span className='text-left'>
            {formatDateRange(event.dates?.fromDate, event.dates?.toDate)}
          </span>
        </div>
        {/* Topics */}
        <div className='mb-4'>
          {' '}
          {/* Increased margin */}
          <div className='flex flex-wrap gap-1.5'>
            {' '}
            {/* Adjusted gap */}
            {event.topics && event.topics.length > 0 ? (
              <>
                {event.topics.slice(0, 3).map(topic => (
                  <Link
                    key={topic}
                    href={{
                      pathname: `/conferences`,
                      query: { topics: topic }
                    }}
                  >
                    <span
                      className='inline-block max-w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium transition  duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-600' /* Adjusted padding */
                      title={topic} // Add tooltip for full topic name
                    >
                      {topic}
                    </span>
                  </Link>
                ))}
                {event.topics.length > 3 && (
                  <span
                    key='more-topics'
                    className='inline-block max-w-full cursor-default overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium dark:bg-gray-800 dark:hover:bg-gray-600'
                    title={`${event.topics.length - 3} more topics`}
                  >
                    +{event.topics.length - 3} {t('more')}
                  </span>
                )}
              </>
            ) : (
              <span className='text-xs italic '>{t('No_topics_listed')}</span>
            )}
          </div>
        </div>
        {/* Action Buttons */}
        <div className='mt-auto flex items-center justify-end border-t border-gray-100 pt-2 dark:border-gray-600'>
          {' '}
          {/* Added border top */}
          <div className='flex space-x-2'>
            {/* Go to Website Button */}
            <div className='relative'>
              <button
                onClick={e => handleGoToWebsite(e, event.link || '')}
                onMouseEnter={() => setShowWebsiteTooltip(true)}
                onMouseLeave={() => setShowWebsiteTooltip(false)}
                className='flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 p-2 transition hover:bg-gray-200  hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-600'
                disabled={!event.link} // Disable if no link
                title={t('Go_to_Website')}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.75'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-square-arrow-out-up-right'
                >
                  <path d='M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6' />
                  <path d='m21 3-9 9' />
                  <path d='M15 3h6v6' />
                </svg>
              </button>
            </div>

            {/* Add to Calendar Button */}
            <div className='relative'>
              <button
                onClick={handleAddCalendarClick}
                onMouseEnter={() => setShowAddCalendarTooltip(true)}
                onMouseLeave={() => setShowAddCalendarTooltip(false)}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 p-2 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-600 ${
                  isAddToCalendar
                    ? 'text-blue-600 hover:text-blue-700'
                    : ' hover:text-gray-800'
                }`}
                style={{ minWidth: '36px', minHeight: '36px' }} // Ensure minimum size
                disabled={isLoading} // Disable during loading
                title={
                  isAddToCalendar
                    ? t('Remove_from_Calendar')
                    : t('Add_to_Calendar')
                }
              >
                {/* Conditionally render spinner or icon */}
                {calendarLoading ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent'></div>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.75'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-calendar-plus'
                  >
                    {' '}
                    {/* Changed Icon slightly */}
                    <path d='M8 2v4' />
                    <path d='M16 2v4' />
                    <path d='M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8' />
                    <path d='M3 10h18' />
                    <path d='M16 19h6' />
                    <path d='M19 16v6' />
                  </svg>
                )}
              </button>
            </div>

            {/* Favorite Button */}
            <div className='relative'>
              <button
                onClick={handleFavoriteClick}
                onMouseEnter={() => setShowFavoriteTooltip(true)}
                onMouseLeave={() => setShowFavoriteTooltip(false)}
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 p-2 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-600 ${
                  // Changed focus ring color
                  isFollowing
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : ' hover:text-gray-800'
                }`}
                style={{ minWidth: '36px', minHeight: '36px' }} // Ensure minimum size
                disabled={isLoading} // Disable during loading
                title={
                  isFollowing
                    ? t('Remove_from_Favorites')
                    : t('Add_to_Favorites')
                }
              >
                {/* Conditionally render spinner or icon */}
                {followLoading ? (
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent'></div>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill={
                      isFollowing ? 'currentColor' : 'none'
                    } /* Fill when favorited */
                    stroke='currentColor'
                    strokeWidth='1.5'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.122 2.122 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
