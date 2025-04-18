// components/conferences/EventCard.tsx
import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import { ConferenceInfo } from '../../../models/response/conference.list.response'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'

interface EventCardProps {
  event: ConferenceInfo
  className?: string
  style?: React.CSSProperties
}

const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const t = useTranslations('')

  const [isFavorite, setIsFavorite] = useState(false)
  const [showWebsiteTooltip, setShowWebsiteTooltip] = useState(false)
  const [showFavoriteTooltip, setShowFavoriteTooltip] = useState(false)

  const formatDate = useCallback((date: Date | undefined): string => {
    if (!date) return 'TBD'
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }, [])

  const formatDateRange = useCallback(
    (fromDate: string | undefined, toDate: string | undefined) => {
      if (!fromDate || !toDate) return 'TBD'
      const startDate = new Date(fromDate)
      const endDate = new Date(toDate)
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 'Invalid Date'
      }
      if (startDate.toDateString() === endDate.toDateString()) {
        return formatDate(startDate)
      }
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    },
    [formatDate]
  )

  const locationString =
    `${event.location?.cityStateProvince || ''}, ${event.location?.country || ''}`.trim() ||
    'Location Not Available'

  const getRankColor = useCallback((rank?: string) => {
    rank = rank?.toUpperCase()
    switch (rank) {
      case 'A*':
        return 'bg-amber-100 text-amber-700'
      case 'A':
        return 'bg-green-100 text-green-700'
      case 'B':
        return 'bg-sky-100 text-sky-700'
      case 'C':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }, [])

  const getAccessTypeColor = useCallback((accessType?: string) => {
    accessType = accessType?.toUpperCase()
    switch (accessType) {
      case 'ONLINE':
        return 'bg-green-100 text-green-700 border border-green-300'
      case 'OFFLINE':
        return 'bg-red-100 text-red-700 border border-red-300'
      case 'HYBRID':
        return 'bg-blue-100 text-blue-700 border border-blue-300'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }, [])

  const handleFavoriteClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      setIsFavorite(!isFavorite)
      setShowFavoriteTooltip(false)
    },
    [isFavorite]
  )

  const handleGoToWebsite = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, url: string) => {
      e.preventDefault()
      e.stopPropagation()
      if (url) {
        window.open(url, '_blank')
      } else {
        console.warn('No URL provided for Go to Website')
      }
      setShowWebsiteTooltip(false)
    },
    []
  )

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg bg-white shadow-lg transition duration-300 ease-in-out hover:shadow-xl ${className}`}
    >
      {/* Image and Rank */}
      <div className='relative hover:opacity-90'>
        <Image
          src={'/bg-2.jpg'}
          alt={event.title}
          width={400}
          height={225}
          style={{ objectFit: 'cover', width: '100%', height: '180px' }}
          className='w-full'
          priority
        />
        {/* --- Conditional Rank Display --- */}
        <div className='absolute right-2 top-0'>
          <span
            className={`font-semibold ${getRankColor(event?.rank || 'No info')} rounded px-2 py-1 text-xs`}
          >
            {event.rank ? `Rank: ${event.rank}` : 'Unranked'}
          </span>
        </div>

        {event.accessType && (
          <div className='absolute right-2 top-8'>
            <span
              className={`font-semibold ${getAccessTypeColor(event.accessType)} rounded px-2 py-1 text-xs`}
            >
              {event.accessType}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className='flex flex-grow flex-col px-2 py-4'>
        {/* Title and Acronym */}
        <div className='mb-2'>
          <Link
            href={{ pathname: `/conferences/detail`, query: { id: event.id } }}
          >
            <h3 className='cursor-pointer text-left text-sm font-bold text-gray-800 transition duration-300 hover:text-blue-600'>
              {event.title} {event.acronym ? `(${event.acronym})` : ''}
            </h3>
          </Link>
        </div>

        {/* Location and Date */}
        <div className='mb-3 flex items-center text-xs text-gray-600 transition duration-300 hover:text-gray-800'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#b81e1e'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='lucide lucide-map-pinned mr-1 flex-shrink-0'
          >
            <path d='M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0' />
            <circle cx='12' cy='8' r='2' />
            <path d='M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712' />
          </svg>
          <span className='text-left'>{locationString}</span>
        </div>

        <div className='mb-3 flex items-center text-xs text-gray-600 transition duration-300 hover:text-gray-800'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#b81e1e'
            strokeWidth='1.5'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='lucide lucide-calendar-days mr-1 flex-shrink-0'
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
          <span className='text-left'>
            {/* Access the first element of the dates array */}
            {formatDateRange(event.dates?.fromDate, event.dates?.toDate)}
          </span>
        </div>

        {/* Topics */}
        <div className='mb-3'>
          <div className='flex flex-wrap gap-2'>
            {event.topics.slice(0, 3).map(topic => (
              <Link
                key={topic}
                href={{ pathname: `/conferences`, query: { topics: topic } }}
              >
                <span
                  className=' inline-block max-w-64 cursor-pointer overflow-hidden text-ellipsis
              whitespace-nowrap rounded-full bg-gray-100 px-2 py-1 align-bottom text-xs
              text-gray-700 transition duration-200
              hover:bg-gray-200'
                >
                  {topic}
                </span>
              </Link>
            ))}
            {event.topics.length > 3 && (
              <span
                key='more-topics'
                className=' inline-block max-w-64 cursor-pointer overflow-hidden text-ellipsis
                whitespace-nowrap rounded-full bg-gray-100 px-2 py-1 align-bottom text-xs
                text-gray-700 transition duration-200
                hover:bg-gray-200'
              >
                +{event.topics.length - 3} {t('more')}
              </span>
            )}
          </div>
        </div>

        {/* Buttons and Actions */}
        <div className='mt-auto flex items-center justify-end'>
          <div className='flex space-x-2'>
            {/* Go to Website Button with Tooltip */}
            <div className='relative'>
              <button
                onClick={e => handleGoToWebsite(e, event.link || '')}
                onMouseEnter={() => setShowWebsiteTooltip(true)}
                onMouseLeave={() => setShowWebsiteTooltip(false)}
                className='flex items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500'
                style={{ minWidth: '36px', minHeight: '36px' }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#454545'
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
              {showWebsiteTooltip && (
                <div className='absolute bottom-full left-1/2 z-10 mb-2  -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white'>
                  {t('Go_to_Website')}
                </div>
              )}
            </div>

            {/* Favorite Button with Tooltip */}
            <div className='relative'>
              <button
                onClick={e => handleFavoriteClick(e)}
                onMouseEnter={() => setShowFavoriteTooltip(true)}
                onMouseLeave={() => setShowFavoriteTooltip(false)}
                className={`flex items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFavorite ? 'text-red-500' : ''}`}
                style={{ minWidth: '36px', minHeight: '36px' }}
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
                >
                  <path d='M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z' />
                </svg>
              </button>
              {showFavoriteTooltip && (
                <div className='absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white'>
                  {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventCard
