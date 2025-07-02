import React from 'react'
import { CalendarEvent } from './types/calendar'
import { ConferenceResponse } from '@/src/models/response/conference.response'
import { Link } from '@/src/navigation'

// Import các icon Lucide cần dùng
import {
  X,
  MapPin,
  Calendar as CalendarIcon,
  Tag,
  Info,
  Loader2,
  ExternalLink,
  ArrowRight,
  Factory,
} from 'lucide-react'

interface AddNoteDialogProps {
  date: Date
  onClose: () => void
  event?: CalendarEvent | null
  eventDetails?: ConferenceResponse | null
  loadingDetails?: boolean
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  onClose,
  event,
  eventDetails,
  loadingDetails,
}) => {
  const orgDetails = eventDetails?.organizations?.[0]
  const location = orgDetails?.locations?.[0]
  const accessType = orgDetails?.accessType

  const renderContent = () => {
    if (loadingDetails) {
      return (
        <div className='flex h-48 items-center justify-center'>
          <Loader2 className='h-8 w-8 animate-spin text-button' />
          <span className='ml-2'>Loading details...</span>
        </div>
      )
    }
    if (!event || !eventDetails) {
      return (
        <div className='flex h-48 items-center justify-center'>
          <p>Could not load event details.</p>
        </div>
      )
    }

    return (
      <div className='space-y-4'>
        {/* Acronym */}
        {eventDetails.acronym && (
          <div className='flex items-center text-sm text-text-secondary'>
            <Info className='mr-3 h-4 w-4 flex-shrink-0' />
            <span>{eventDetails.acronym}</span>
          </div>
        )}

        {/* accessType */}
        {accessType && (
          <div className='flex items-center text-sm text-text-secondary'>
            <Factory className='mr-3 h-4 w-4 flex-shrink-0' />
            <span>{accessType}</span>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className='flex items-center text-sm text-text-secondary'>
            <MapPin className='mr-3 h-4 w-4 flex-shrink-0' />
            <span>
              {location.cityStateProvince}, {location.country}
            </span>
          </div>
        )}

        {/* Important Dates */}
        {orgDetails?.conferenceDates && orgDetails.conferenceDates.length > 0 && (
          <div className='text-sm'>
            <div className='mb-2 flex items-center font-medium text-text-primary'>
              <CalendarIcon className='mr-3 h-4 w-4 flex-shrink-0' />
              <span>Important Dates</span>
            </div>
            <ul className='ml-7 list-disc space-y-1.5 text-text-secondary'>
              {orgDetails.conferenceDates.map((d, index) => (
                <li key={index}>
                  <span className='font-semibold'>{d.name || d.type}:</span>{' '}
                  {new Date(d.fromDate).toLocaleDateString()}
                  {d.toDate &&
                    d.toDate !== d.fromDate &&
                    ` - ${new Date(d.toDate).toLocaleDateString()}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Topics */}
        {orgDetails?.topics && orgDetails.topics.length > 0 && (
          <div className='text-sm'>
            <div className='mb-2 flex items-center font-medium text-text-primary'>
              <Tag className='mr-3 h-4 w-4 flex-shrink-0' />
              <span>Topics</span>
            </div>
            <div className='ml-7 flex flex-wrap gap-2'>
              {orgDetails.topics.map((topic, index) => (
                <span
                  key={index}
                  className='rounded-full bg-background-secondary px-2 py-1 text-xs'
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    // Cấu trúc modal với flex-col và giới hạn chiều cao
    // Thay đổi kích thước:
    // - w-full: Luôn chiếm 100% chiều rộng của parent (lớp phủ)
    // - max-w-sm: Giới hạn tối đa 24rem (384px) trên mobile (mặc định)
    // - sm:max-w-lg: Trên màn hình sm (640px trở lên), giới hạn tối đa 32rem (512px)
    // - md:max-w-2xl: Trên màn hình md (768px trở lên), giới hạn tối đa 42rem (672px)
    // - mx-4: Thêm margin ngang để dialog không dính sát vào cạnh màn hình trên mobile
    <div className='relative flex w-full max-w-sm flex-col rounded-lg bg-background shadow-xl max-h-[90vh] mx-4 sm:max-w-lg md:max-w-2xl'>
      {/* Header: Tiêu đề và nút đóng */}
      <div className='flex flex-shrink-0 items-start justify-between border-b border-border p-5'>
        <h3 className='text-xl font-bold text-text-primary'>
          {eventDetails?.title || 'Event Details'}
        </h3>
        <button
          className='text-text-secondary hover:text-text-primary'
          onClick={onClose}
        >
          <X className='h-6 w-6' />
        </button>
      </div>

      {/* Body: Nội dung có thể cuộn */}
      <div className='relative flex-auto overflow-y-auto p-6'>
        {renderContent()}
      </div>

      {/* Footer: Các nút hành động */}
      {eventDetails && (
        <div className='flex flex-shrink-0 flex-wrap items-center justify-end gap-4 border-t border-border p-4'>
          <Link
            href={{
              pathname: '/conferences/detail',
              query: { id: eventDetails.id },
            }}
            className='inline-flex items-center rounded-md bg-button px-4 py-2 text-sm font-medium text-button-text shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
          >
            View Details
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
          {orgDetails?.link && (
            <a
              href={orgDetails.link}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-text-primary shadow-sm hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
            >
              Visit Website
              <ExternalLink className='ml-2 h-4 w-4' />
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default AddNoteDialog