// src/app/[locale]/conference/detail/ConferenceHeader.tsx
import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
// Import ConferenceOrganizationItem thay vì Organization cho lastOrganization
import {
  ConferenceResponse,
  ConferenceOrganizationItem,
  Rank
} from '@/src/models/response/conference.response'
import { Link } from '@/src/navigation'
// Đảm bảo đường dẫn này đúng với vị trí file conferenceUtils.ts của bạn
import { getAccessTypeColor, getRankColor } from './utils/conferenceUtils'
// Đảm bảo đường dẫn này đúng
import FollowerAvatars from './FollowerAvatars'

interface ConferenceHeaderProps {
  conferenceData: ConferenceResponse | null
  lastOrganization: ConferenceOrganizationItem | undefined // <-- THAY ĐỔI Ở ĐÂY
  firstRankData: Rank | undefined
  dateDisplay: string | null
  overallRating: number
  totalReviews: number
}

const ConferenceHeader: React.FC<ConferenceHeaderProps> = ({
  conferenceData,
  lastOrganization, // Bây giờ lastOrganization sẽ có thuộc tính locations và conferenceDates
  firstRankData,
  dateDisplay,
  overallRating,
  totalReviews
}) => {
  const t = useTranslations('')
  const accessType = lastOrganization?.accessType

  return (
    <div className='flex flex-col items-start md:flex-row'>
      {/* Image container */}
      <div className='mb-4 w-full md:mb-0 md:w-1/4'>
        <Image
          src={'/bg-2.jpg'}
          alt={
            conferenceData?.title
              ? `${conferenceData.title} Logo`
              : 'Conference Logo'
          }
          width={200}
          height={200}
          className='hidden h-auto w-full rounded-lg object-contain md:block'
        />
      </div>

      {/* Text details container */}
      <div className='w-full md:w-3/4 md:pl-6'>
        {/* Warning Section (giữ nguyên) */}
        {conferenceData?.ranks?.length === 0 && (
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
                <p className='font-bold'>{t('Conference_Published_By_User')}</p>
                <p className='text-sm'>
                  {t('Conference_Published_By_User_Description')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Date, Rank, and Access Type (giữ nguyên) */}
        <div className='mb-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1'>
          <p className='text-sm font-semibold text-red-500'>
            {dateDisplay || t('Date_TBA')}
          </p>
          <div className='flex items-center gap-x-2'>
            {firstRankData?.rank && (
              <span
                className={`rounded px-2 py-0.5 text-xs font-semibold ${getRankColor(firstRankData.rank)}`}
                title={`${t('Rank')}: ${firstRankData.rank}${firstRankData.source ? ` (${t('Source')}: ${firstRankData.source})` : ''}`}
              >
                {t('Rank')}: {firstRankData.rank} ({firstRankData.source})
              </span>
            )}
            {accessType && (
              <span
                className={`rounded px-2 py-0.5 text-xs font-semibold ${getAccessTypeColor(accessType)}`}
              >
                {accessType}
              </span>
            )}
          </div>
        </div>

        {/* Title (giữ nguyên) */}
        <h1 className='mb-1 text-xl font-bold md:text-2xl'>
          {conferenceData?.title || t('Conference_Details')}
        </h1>

        {/* Rating (giữ nguyên) */}
        <div className='mb-2 flex items-center text-sm'>
          <div className='mr-1 text-xl text-yellow-500'>★</div>
          <strong>
            {overallRating.toFixed(1)}{' '}
            <span className='ml-1 font-normal'>
              ({totalReviews} {t('Ratings')})
            </span>
          </strong>
        </div>

        {/* Location and Publisher Links */}
        <div className='mb-2 flex flex-wrap gap-x-4 gap-y-1'>
          {/* Bây giờ lastOrganization.locations sẽ hợp lệ */}
          {lastOrganization?.locations?.[0] ? (
            <a
              href='#map'
              className='flex items-center text-sm text-blue-600 hover:underline'
              title={lastOrganization.locations[0]?.address || t('View_map')}
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
                className='lucide lucide-map-pin mr-1 flex-shrink-0'
              >
                <path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z' />
                <circle cx='12' cy='10' r='3' />
              </svg>
              {lastOrganization.locations[0]?.address ||
                lastOrganization.locations[0]?.cityStateProvince ||
                lastOrganization.locations[0]?.country ||
                t('Location_Available')}
            </a>
          ) : (
            <span className='text-sm'>{t('No_location_available')}</span>
          )}
          {lastOrganization?.publisher ? (
            <Link
              className='flex items-center text-sm text-blue-600 hover:underline'
              href={{
                pathname: `/conferences`,
                query: { publisher: lastOrganization.publisher }
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
                className='lucide lucide-book-type mr-1 flex-shrink-0'
              >
                <path d='M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20' />
                <path d='M10 13h4' />
                <path d='M12 6v7' />
                <path d='M16 8V6H8v2' />
              </svg>
              {lastOrganization.publisher}
            </Link>
          ) : (
            <span className='flex items-center text-sm'>
              {t('No_publisher_available')}
            </span>
          )}
        </div>

        {/* Followers Display */}
        <div className='mt-3'>
          <FollowerAvatars followBy={conferenceData?.followBy} />
        </div>
      </div>
    </div>
  )
}

export default ConferenceHeader
