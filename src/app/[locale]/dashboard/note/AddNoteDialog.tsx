// src/app/[locale]/note/AddNoteDialog.tsx

import React from 'react'
import { CalendarEvent } from './types/calendar'
import { ConferenceResponse } from '@/src/models/response/conference.response'
import { Link } from '@/src/navigation' // *** 1. Import Link từ Next.js ***

// Import các icon Lucide cần dùng
import {
  X,
  MapPin,
  Link as LinkIcon, // Đổi tên để tránh trùng với component Link
  Calendar as CalendarIcon,
  Tag,
  Info,
  Loader2,
  ExternalLink, // Icon cho link ra ngoài
  ArrowRight,
  Factory, // Icon cho link nội bộ
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
  /*
  // --- START: Tạm thời comment out logic Add/Edit Note ---
  const t = useTranslations('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<'Event' | 'Task' | 'Appointment'>('Event')
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [location, setLocation] = useState('')
  const [showGuestsInput, setShowGuestsInput] = useState(false)
  const [guests, setGuests] = useState('')
  const [showMeetInput, setShowMeetInput] = useState(false)
  const [meetLink, setMeetLink] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [allDay, setAllDay] = useState(false)
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false)
  const [showEndTimeDropdown, setShowEndTimeDropdown] = useState(false)
  const startTimeRef = useRef<HTMLInputElement>(null)
  const endTimeRef = useRef<HTMLInputElement>(null)
  const formattedDate = date.toISOString().split('T')[0]

  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hourStr = String(hour).padStart(2, '0')
        const minuteStr = String(minute).padStart(2, '0')
        options.push(`${hourStr}:${minuteStr}`)
      }
    }
    return options
  }
  const timeOptions = generateTimeOptions()

  const handleSaveWithTimes = () => {
    const noteContent = `${title}\n${description}\nLocation: ${location}\nGuests: ${guests}\nMeet: ${meetLink}\nStart: ${startTime}\nEnd: ${endTime}\nAll Day: ${allDay}`
    // onSave(noteContent, eventType) // onSave không còn tồn tại
    onClose()
  }

  useEffect(() => {
    if (event && !event.conferenceId) {
      setTitle(event.title || '')
      setEventType(event.type as 'Event' | 'Task' | 'Appointment')
    } else if (!event) {
      setTitle('')
      setDescription('')
      setEventType('Event')
      setLocation('')
      setGuests('')
      setMeetLink('')
      setStartTime('')
      setEndTime('')
      setAllDay(false)
    }
  }, [event])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        startTimeRef.current &&
        !startTimeRef.current.contains(e.target as Node) &&
        showStartTimeDropdown
      ) {
        setShowStartTimeDropdown(false)
      }
      if (
        endTimeRef.current &&
        !endTimeRef.current.contains(e.target as Node) &&
        showEndTimeDropdown
      ) {
        setShowEndTimeDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showStartTimeDropdown, showEndTimeDropdown])



  const renderAddEditView = () => {
    // JSX for Add/Edit view
  }
  // --- END: Tạm thời comment out logic Add/Edit Note ---
  */

  const renderEventDetailView = () => {
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

    const orgDetails = eventDetails.organizations?.[0]
    const location = orgDetails?.locations?.[0]
    const accessType = orgDetails?.accessType

    return (
      <div className='space-y-4'>
        {/* Title */}
        <h3 className='text-xl font-bold text-text-primary'>
          {eventDetails.title}
        </h3>

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
            <span>
              {accessType}
            </span>
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
            <ul className='ml-7 list-disc space-y-1 text-text-secondary'>
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

        {/* --- 2. SỬA PHẦN HIỂN THỊ CÁC NÚT LINK --- */}
        <div className='flex flex-wrap items-center gap-4 pt-2'>
          {/* Nút đi tới trang chi tiết trong hệ thống */}
          <Link
            href={{
              pathname: '/conferences/detail',
              query: { id: eventDetails.id }, // Sử dụng id từ eventDetails
            }}
            className='inline-flex items-center rounded-md bg-button px-4 py-2 text-sm font-medium text-button-text shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
          >
            View Details
            <ArrowRight className='ml-2 h-4 w-4' />
          </Link>

          {/* Nút đi tới trang web của hội nghị */}
          {orgDetails?.link && (
            <a
              href={orgDetails.link}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center rounded-md border border-gray-300 bg-background px-4 py-2 text-sm font-medium text-text-primary shadow-sm hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2'
            >
              Visit Website
              <ExternalLink className='ml-2 h-4 w-4' />
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='relative w-full max-w-md rounded-lg bg-background p-6 shadow-xl'>
      <button
        className='absolute right-4 top-4 text-text-secondary hover:text-text-primary'
        onClick={onClose}
      >
        <X className='h-6 w-6' />
      </button>
      {renderEventDetailView()}
    </div>
  )
}

export default AddNoteDialog