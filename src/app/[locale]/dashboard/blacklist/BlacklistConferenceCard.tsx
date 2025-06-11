// src/app/[locale]/dashboard/blacklist/BlacklistConferenceCard.tsx
import React from 'react'
import { Calendar, MapPin, Hash, Eye, Ban } from 'lucide-react' // Thêm icon Ban
import { useTranslations } from 'next-intl'
import { Link } from '@/src/navigation'
import Button from '../../utils/Button'
import { timeAgo, formatDateRange } from '../timeFormat' // Đảm bảo đúng đường dẫn
import { Location } from '@/src/models/response/conference.list.response' // Import Location

// Định nghĩa lại interface cho dữ liệu card Blacklist
interface BlacklistConferenceResponseForCard {
  conferenceId: string // Đây là conferenceId từ API của bạn
  title: string
  acronym: string
  location: Location | null // Sử dụng Location từ models
  dates?: { fromDate?: string; toDate?: string }[] // API của bạn có vẻ không có type, nên bỏ nó đi
  createdAt: string // Đây là thời gian blacklisted
}

interface BlacklistConferenceCardProps {
  conference: BlacklistConferenceResponseForCard
}

const BlacklistConferenceCard: React.FC<BlacklistConferenceCardProps> = ({
  conference
}) => {
  const t = useTranslations('')
  const language = t('language')

  const conferenceDate = conference.dates?.[0] // Lấy phần tử đầu tiên của mảng dates

  const locationString = (() => {
    if (!conference.location) {
      return t('Location_not_available') || 'Location not available'
    }
    const parts: string[] = []
    if (conference.location.cityStateProvince) {
      parts.push(conference.location.cityStateProvince)
    }
    if (conference.location.country) {
      parts.push(conference.location.country)
    }
    if (parts.length === 0) {
      return t('Location_not_available') || 'Location not available'
    }
    return parts.join(', ')
  })()

  return (
    <div className='flex flex-col overflow-hidden rounded-xl bg-white-pure shadow-md transition-shadow duration-300 hover:shadow-xl'>
      <div className='flex-grow p-5'>
        {/* Header: Thời gian Blacklisted */}
        <div className='mb-3 flex items-start justify-between'>
          <p className='text-left text-sm text-gray-500'>
            {t('Blacklisted_Time')}: {timeAgo(conference.createdAt, language)}
          </p>
          {/* Có thể thêm một badge "Blacklisted" ở đây nếu muốn */}
          <Ban className='h-5 w-5 flex-shrink-0 text-red-500' />{' '}
          {/* Icon cảnh báo */}
        </div>

        {/* Body: Thông tin chính */}
        <h3 className='text-lg font-bold leading-tight text-indigo-700 transition-colors hover:text-indigo-900'>
          {conference.title}
        </h3>
        <div className='mt-2 space-y-2 text-sm text-gray-60'>
          <div className='flex items-center gap-2'>
            <Hash className='h-4 w-4 flex-shrink-0 text-gray-40' />
            <span>{conference.acronym}</span>
          </div>
          <div className='flex items-center gap-2'>
            <Calendar className='h-4 w-4 flex-shrink-0 text-gray-40' />
            <span>
              {conferenceDate
                ? formatDateRange(
                    conferenceDate.fromDate,
                    conferenceDate.toDate,
                    language
                  )
                : t('MyConferences.Date_Not_Available')}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <MapPin className='h-4 w-4 flex-shrink-0 text-gray-40' />
            <span>{locationString}</span>
          </div>
        </div>
      </div>

      {/* Footer: Các nút hành động */}
      <div className='flex justify-end border-t border-gray-200 bg-gray-10 px-5 py-3'>
        <Link
          href={{
            pathname: '/conferences/detail',
            query: { id: conference.conferenceId }
          }}
        >
          <Button
            variant='primary'
            size='small'
            rounded
            className='inline-flex items-center gap-2'
          >
            {t('View_Details')}
          </Button>
        </Link>
        {/* Có thể thêm nút "Unblacklist" ở đây nếu có API */}
      </div>
    </div>
  )
}

export default BlacklistConferenceCard
