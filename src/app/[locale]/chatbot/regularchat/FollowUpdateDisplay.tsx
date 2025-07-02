// src/app/[locale]/chatbot/regularchat/FollowUpdateDisplay.tsx
import React from 'react'
// Ensure ItemFollowStatusUpdatePayload, FollowItem etc. are correctly imported.
// If they come from `shared/types` directly, update the import path.
import {
  ItemFollowStatusUpdatePayload,
  FollowItem,
  FollowItemDate,
  FollowItemLocation
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'
import {
  CheckCircle2,
  MinusCircle,
  CalendarDays,
  MapPin,
  FileText,
  Newspaper,
  ExternalLink
} from 'lucide-react'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl' // For internationalization
// Assuming you have a Button component. If not, you'll style an <a> tag.
// import Button from '@/src/components/ui/Button'; // Example path to your Button component

interface FollowUpdateDisplayProps {
  payload: ItemFollowStatusUpdatePayload
}

const formatDate = (isoDateString: string): string => {
  if (!isoDateString) return ''
  try {
    return new Date(isoDateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (e) {
    return isoDateString // Fallback
  }
}

const formatFollowItemDateRange = (dates?: FollowItemDate): string | null => {
  if (!dates || !dates.fromDate) return null
  const from = formatDate(dates.fromDate)
  if (!dates.toDate || dates.fromDate === dates.toDate) return from
  const to = formatDate(dates.toDate)
  return `${from} - ${to}`
}

const formatFollowItemLocation = (
  location?: FollowItemLocation
): string | null => {
  if (!location) return null
  const parts: string[] = []
  if (location.cityStateProvince) parts.push(location.cityStateProvince)
  if (location.country) parts.push(location.country)
  return parts.length > 0 ? parts.join(', ') : null
}

const FollowUpdateDisplay: React.FC<FollowUpdateDisplayProps> = ({
  payload
}) => {
  const { item, itemType, followed } = payload
  const t = useTranslations('') // Or your relevant namespace

  const dateString = formatFollowItemDateRange(item.dates)
  const locationString = formatFollowItemLocation(item.location)

  const ItemIcon = itemType === 'conference' ? FileText : Newspaper

  // Determine the detail page path based on itemType
  const detailPathname = '/conferences/detail'

  return (
    <div className='mt-1 rounded-md border border-gray-200 p-3 dark:border-gray-600 dark:bg-gray-700/50'>
      <div className='mb-2 flex items-center'>
        {followed ? (
          <CheckCircle2 className='mr-2 h-5 w-5 flex-shrink-0 text-green-500 dark:text-green-400' />
        ) : (
          <MinusCircle className='mr-2 h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400' />
        )}
        <p className='text-sm font-semibold text-gray-800 dark:text-gray-200'>
          {t('Conference')}{' '}
          {followed ? t('Followed_status') : t('Unfollowed_status')}
        </p>
      </div>

      <div className='space-y-1.5 text-xs text-gray-700 dark:text-gray-300'>
        <div className='flex items-start'>
          <ItemIcon className='mr-2 mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400' />
          <span className='font-medium text-gray-800 dark:text-gray-100'>
            {item.title} ({item.acronym})
          </span>
        </div>
        {dateString && (
          <div className='flex items-start'>
            <CalendarDays className='mr-2 mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400' />
            <span>{dateString}</span>
          </div>
        )}
        {locationString && (
          <div className='flex items-start'>
            <MapPin className='mr-2 mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400' />
            <span>{locationString}</span>
          </div>
        )}
        {item.status && (
          <div className='flex items-start'>
            {/* Using a simple info icon as a placeholder. You can use a specific Lucide icon if preferred. */}
            <span className='mr-2 mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-500 dark:text-gray-400'>
              ℹ️
            </span>
            <span>
              {t('Status')}: {item.status}
            </span>
          </div>
        )}
      </div>

      {/* Details Button Section */}
      <div className='mt-3 flex justify-end border-t border-gray-200 pt-2 dark:border-gray-600/50'>
        {/* === CORRECTED CODE START === */}
        <Link
          href={{
            pathname: detailPathname,
            query: { id: item.id }
          }}
          // Move the className from the <a> tag to the <Link> component
          className='inline-flex items-center justify-center rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-offset-gray-800'
        // No more `passHref` or `legacyBehavior`
        >
          {/* The content now goes directly inside the Link, no more <a> tag */}
          {t('View_Details')}
          <ExternalLink className='ml-1.5 h-3.5 w-3.5' />
        </Link>
        {/* === CORRECTED CODE END === */}
      </div>

    </div>
  )
}

export default FollowUpdateDisplay
