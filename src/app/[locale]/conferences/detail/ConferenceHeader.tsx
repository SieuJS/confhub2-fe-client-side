// src/app/[locale]/conference/detail/ConferenceHeader.tsx
'use client' // Thêm 'use client' vì chúng ta sẽ dùng hook

import React, { useMemo } from 'react' // Thêm useMemo
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl' // Thêm useLocale
import {
  ConferenceResponse,
  ConferenceOrganizationItem,
  Rank,
} from '@/src/models/response/conference.response'
import { Link } from '@/src/navigation'
import { getAccessTypeColor, getRankColor } from './utils/conferenceUtils'
import FollowerAvatars from './FollowerAvatars'

// === BƯỚC 1: IMPORT TỪ DATE-FNS VÀ LUCIDE REACT ===
import { formatDistanceToNow } from 'date-fns'
import { enUS, vi } from 'date-fns/locale'
import {
  MapPin,       // Thay cho SVG bản đồ
  BookType,     // Thay cho SVG publisher
  AlertTriangle, // Thay cho SVG cảnh báo
  History,      // Icon cho thời gian cập nhật
} from 'lucide-react'

interface ConferenceHeaderProps {
  conferenceData: ConferenceResponse | null
  lastOrganization: ConferenceOrganizationItem | undefined
  firstRankData: Rank | undefined
  dateDisplay: string | null
  overallRating: number
  totalReviews: number
}

const ConferenceHeader: React.FC<ConferenceHeaderProps> = ({
  conferenceData,
  lastOrganization,
  firstRankData,
  dateDisplay,
  overallRating,
  totalReviews,
}) => {
  const t = useTranslations('')
  const currentLocale = useLocale() // Lấy locale hiện tại
  const accessType = lastOrganization?.accessType

  // === BƯỚC 2: LOGIC ĐỊNH DẠNG NGÀY THÁNG CẬP NHẬT ===
  const lastUpdatedText = useMemo(() => {
    if (!conferenceData?.updatedAt) return null

    const dateLocale = currentLocale === 'vi' ? vi : enUS
    try {
      return formatDistanceToNow(new Date(conferenceData.updatedAt), {
        addSuffix: true,
        locale: dateLocale,
      })
    } catch (error) {
      console.error("Invalid date format for 'updatedAt':", conferenceData.updatedAt)
      return null
    }
  }, [conferenceData?.updatedAt, currentLocale])


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
        {/* === BƯỚC 3: CẬP NHẬT SVG CẢNH BÁO === */}
        {conferenceData?.ranks?.length === 0 && (
          <div
            className='mb-4 rounded-md border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700 shadow-sm'
            role='alert'
          >
            <div className='flex items-center'>
              <AlertTriangle className='mr-3 h-6 w-6 flex-shrink-0' />
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

        {/* === BƯỚC 4: THÊM THỜI GIAN CẬP NHẬT === */}
        {lastUpdatedText && (
          <div className='mb-2 flex items-center gap-1.5 text-xs text-muted-foreground'>
            <History size={14} />
            <span>{t('JournalReport.lastUpdated', { time: lastUpdatedText })}</span>
          </div>
        )}

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

        {/* === BƯỚC 5: CẬP NHẬT SVG ĐỊA ĐIỂM VÀ PUBLISHER === */}
        <div className='mb-2 flex flex-wrap gap-x-4 gap-y-1'>
          {lastOrganization?.locations?.[0].address ? (
            <a
              href='#map'
              className='flex items-center text-sm text-blue-600 hover:underline'
              title={lastOrganization.locations[0]?.address || t('View_map')}
            >
              <MapPin className='mr-1 h-4 w-4 flex-shrink-0' />
              {lastOrganization.locations[0]?.address ||
                lastOrganization.locations[0]?.cityStateProvince ||
                lastOrganization.locations[0]?.country ||
                t('No_location_available')}
            </a>
          ) : (

            <span className='flex items-center text-sm'>
              <MapPin className='mr-1 h-4 w-4 flex-shrink-0' />

              {t('No_location_available')}

            </span>
          )}
          {lastOrganization?.publisher ? (
            <Link
              className='flex items-center text-sm text-blue-600 hover:underline'
              href={{
                pathname: `/conferences`,
                query: { publisher: lastOrganization.publisher },
              }}
            >
              <BookType className='mr-1 h-4 w-4 flex-shrink-0' />
              {lastOrganization.publisher}
            </Link>
          ) : (
            <span className='flex items-center text-sm'>
              <BookType className='mr-1 h-4 w-4 flex-shrink-0' />
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