// src/app/[locale]/dashoard/myconferences/MyConferenceCard.tsx
import React from 'react'
import { Calendar, MapPin, Hash } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ConferenceResponse } from '@/src/models/response/conference.response'
import StatusBadge from './StatusBadge'
import ConferenceActionButtons from './ConferenceActionButtons'
import { timeAgo, formatDateRange } from '../timeFormat' // Đảm bảo đúng đường dẫn

interface MyConferenceCardProps {
  conference: ConferenceResponse
  onViewReason: (message: string) => void
  onViewSubmitted: (conference: ConferenceResponse) => void
  onEdit: (conference: ConferenceResponse) => void
}

const MyConferenceCard: React.FC<MyConferenceCardProps> = ({
  conference,
  ...actionHandlers
}) => {
  const t = useTranslations('')
  const language = t('language')
  const organization = conference.organizations?.[0]
  const location = organization?.locations?.[0]
  const conferenceDate = organization?.conferenceDates?.find(
    d => d.type === 'conferenceDates'
  )

  const locationString = location
    ? `${location.cityStateProvince || ''}, ${location.country || ''}`.replace(
        /^, |^ |,$| $/,
        ''
      )
    : t('MyConferences.Location_Not_Available')

  return (
    <div className='flex flex-col overflow-hidden rounded-xl bg-white-pure shadow-md transition-shadow duration-300 hover:shadow-xl'>
      {' '}
      {/* THÊM flex flex-col */}
      <div className='flex-grow p-5'>
        {' '}
        {/* THÊM flex-grow */}
        {/* Header: Status và Thời gian tạo */}
        <div className='mb-3 flex items-start justify-between'>
          <StatusBadge status={conference.status} />
          <p className='text-right text-sm text-gray-500'>
            {t('MyConferences.Created')}
            <br />
            {timeAgo(conference.createdAt, language)}
          </p>
        </div>
        {/* Body: Thông tin chính */}
        {/* THÊM leading-tight để xử lý tiêu đề nhiều dòng */}
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
      {/* Footer không cần flex-grow, nó sẽ tự động dính vào cuối do flex-col trên parent */}
      <div className='border-t border-gray-200 bg-gray-10 px-5 py-3'>
        <ConferenceActionButtons conference={conference} {...actionHandlers} />
      </div>
    </div>
  )
}

export default MyConferenceCard
