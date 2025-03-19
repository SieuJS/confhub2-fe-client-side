// AddNoteDialog.tsx
import React, { useState, useEffect, useRef } from 'react'
import { CalendarEvent } from './Calendar' // Import
import Image from 'next/image'

interface AddNoteDialogProps {
  date: Date
  onClose: () => void
  onSave: (note: string, eventType: 'Event' | 'Task' | 'Appointment') => void
  event?: CalendarEvent | null // Optional event prop
  eventDetails?: any | null // Optional event details
  loadingDetails?: boolean
}

const AddNoteDialog: React.FC<AddNoteDialogProps> = ({
  date,
  onClose,
  onSave,
  event,
  eventDetails,
  loadingDetails
}) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState<'Event' | 'Task' | 'Appointment'>(
    'Event'
  )

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
  const startTimeRef = useRef(null)
  const endTimeRef = useRef(null)
  const formattedDate = date.toISOString().split('T')[0]

  // Generate time options (e.g., every 15 minutes)
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
    if (allDay) {
      // handleSave({ title, description, location, guests, meetLink, date: formattedDate, startTime: '00:00', endTime: '23:59' });
    } else {
      if (!startTime || !endTime) {
        alert('Please select both start and end times.')
        return
      }
      // handleSave({ title, description, location, guests, meetLink, date: formattedDate, startTime, endTime });
    }
  }

  // Update state when the event prop changes (for editing)
  useEffect(() => {
    if (event) {
      setTitle(event.title || '') // Use title if available
      setEventType(event.type as 'Event' | 'Task' | 'Appointment')
      // You might set other fields here, like description, based on your event data
    } else {
      // Reset to defaults when adding a new note
      setTitle('')
      setDescription('')
      setEventType('Event')
    }
  }, [event])

  const handleDelete = () => {
    // Implement your delete logic here.  You'll likely need a way
    // to identify the event to delete (e.g., using a unique ID).
    // You might need an `onDelete` prop similar to `onSave`.
    console.log('Delete event:', event)
    onClose()
  }

  const renderAddEditView = () => {
    return (
      <>
        <h2 className='mb-4 text-lg font-semibold'>
          {event ? 'Edit Event' : ''}
        </h2>

        <div className='mb-4'>
          <input
            type='text'
            placeholder='Add title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            className='w-full py-2 placeholder-text-secondary focus:border-b-2 focus:border-background-secondary focus:outline-none'
          />
        </div>

        <div className='mb-4 flex'>
          <button
            className={`rounded-l-md px-4 py-2 ${eventType === 'Event' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setEventType('Event')}
          >
            Event
          </button>
          <button
            className={`px-4 py-2 ${eventType === 'Task' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setEventType('Task')}
          >
            Task
          </button>
          <button
            className={`rounded-r-md px-4 py-2 ${eventType === 'Appointment' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setEventType('Appointment')}
          >
            Appointment schedule
          </button>
        </div>

        <div className='mb-4'>
          <div className='mb-2'>{formattedDate}</div>
          <div className='flex items-center'>
            <div className='relative' ref={startTimeRef}>
              <input
                type='text'
                placeholder='Start Time'
                value={startTime}
                onClick={() => setShowStartTimeDropdown(!showStartTimeDropdown)}
                readOnly // Important: Prevent keyboard input
                className='mr-2 w-24 cursor-pointer px-3 py-2 focus:border-b focus:outline-none focus:ring-2 focus:ring-blue-500'
                disabled={allDay}
              />
              {showStartTimeDropdown && (
                <div className='absolute z-10 max-h-40 w-24 overflow-y-auto rounded border bg-white shadow-md'>
                  {timeOptions.map(time => (
                    <div
                      key={time}
                      className='cursor-pointer px-3 py-1 hover:bg-gray-100'
                      onClick={() => {
                        setStartTime(time)
                        setShowStartTimeDropdown(false)
                      }}
                    >
                      {time}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span>to</span>
            <div className='relative ml-2' ref={endTimeRef}>
              <input
                type='text'
                placeholder='End Time'
                value={endTime}
                onClick={() => setShowEndTimeDropdown(!showEndTimeDropdown)}
                readOnly // Prevent keyboard input
                className='ml-2 w-24 cursor-pointer px-3 py-2 focus:border-b focus:outline-none focus:ring-2 focus:ring-blue-500'
                disabled={allDay}
              />
              {showEndTimeDropdown && (
                <div className='absolute z-10 max-h-40 w-24 overflow-y-auto rounded border bg-white shadow-md'>
                  {timeOptions.map(time => (
                    <div
                      key={time}
                      className='cursor-pointer px-3 py-1 hover:bg-gray-100'
                      onClick={() => {
                        setEndTime(time)
                        setShowEndTimeDropdown(false)
                      }}
                    >
                      {time}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <label className='ml-4 flex items-center'>
              <input
                type='checkbox'
                checked={allDay}
                onChange={e => setAllDay(e.target.checked)}
                className='mr-2'
              />
              All Day
            </label>
          </div>
        </div>

        {/* ... (rest of the component remains the same) ... */}
        <div className='mb-4'>
          {showGuestsInput ? (
            <input
              type='text'
              placeholder='Enter guest names (comma-separated)'
              value={guests}
              onChange={e => setGuests(e.target.value)}
              className='w-full py-2 placeholder-text-secondary focus:border-b-2 focus:border-background-secondary focus:outline-none'
              onBlur={() => setShowGuestsInput(false)}
              autoFocus
            />
          ) : (
            <div onClick={() => setShowGuestsInput(true)}>Add guests</div>
          )}
        </div>

        <div className='mb-4'>
          {showMeetInput ? (
            <input
              type='text'
              placeholder='Enter Google Meet link'
              value={meetLink}
              onChange={e => setMeetLink(e.target.value)}
              className='w-full py-2 placeholder-text-secondary focus:border-b-2 focus:border-background-secondary focus:outline-none'
              onBlur={() => setShowMeetInput(false)}
              autoFocus
            />
          ) : (
            <div onClick={() => setShowMeetInput(true)}>
              Add Google Meet video conferencing
            </div>
          )}
        </div>

        <div className='mb-4'>
          {showLocationInput ? (
            <input
              type='text'
              placeholder='Enter location'
              value={location}
              onChange={e => setLocation(e.target.value)}
              className='w-full py-2 placeholder-text-secondary focus:border-b-2 focus:border-background-secondary focus:outline-none'
              onBlur={() => setShowLocationInput(false)}
              autoFocus
            />
          ) : (
            <div onClick={() => setShowLocationInput(true)}>Add location</div>
          )}
        </div>

        <div className='mb-4'>
          <textarea
            placeholder='Add description'
            value={description}
            onChange={e => setDescription(e.target.value)}
            className='w-full  py-2 placeholder-text-secondary focus:border-b-2 focus:border-background-secondary focus:outline-none'
          />
        </div>

        <div className='flex justify-end'>
          {event && (
            <button
              className='mr-2 px-4 py-2  hover:underline'
              onClick={handleDelete}
            >
              Delete
            </button>
          )}
          <button
            className='px-4 py-2  hover:underline'
            //onClick={onMoreOptions}
          >
            More options
          </button>
          <button
            className='ml-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
            onClick={handleSaveWithTimes} // Use the new save function
            disabled={!title}
          >
            Save
          </button>
        </div>
      </>
    )
  }

  const renderEventDetailView = () => {
    if (loadingDetails) {
      return <div>Loading conference details...</div>
    }
    if (!event || !eventDetails) return null

    return (
      <div>
        <h3 className='mb-2 text-lg font-semibold text-teal-700'>
          {eventDetails.conference.title}
        </h3>
        <p className='mb-2 text-gray-700'>
          Acronym: {eventDetails.conference.acronym}
        </p>
        <p className='mb-2 text-gray-700'>
          Location: {eventDetails.locations.cityStateProvince},{' '}
          {eventDetails.locations.country}
        </p>
        {/* Display important dates */}
        {eventDetails.dates && eventDetails.dates.length > 0 && (
          <div className='mb-2'>
            <h4 className='font-medium'>Important Dates:</h4>
            <ul>
              {eventDetails.dates.map((date: any, index: any) => (
                <li key={index} className='text-gray-700'>
                  {date.name}: {new Date(date.fromDate).toLocaleDateString()} -{' '}
                  {new Date(date.toDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className='mb-2'>
          <h4 className='font-medium'>Topics:</h4>
          <p className='mb-2 text-gray-700'>
            {eventDetails.organization.topics.join(', ')}
          </p>
        </div>

        <div className='mb-4'>
          <a
            href={eventDetails.organization.link}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center text-blue-500 hover:text-blue-700'
          >
            <Image
              src='/images/link-icon.svg'
              alt='More Details'
              width={14}
              height={14}
              className='mr-1'
            />
            More details
          </a>
        </div>
        <div className='flex justify-between'>
          <button
            onClick={handleDelete}
            className='focus:shadow-outline rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700 focus:outline-none'
          >
            Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
      <button
        className='absolute right-2 top-2 text-gray-600 hover:text-gray-800'
        onClick={onClose}
      >
        <svg
          className='h-6 w-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </button>

      {event
        ? event.conferenceId
          ? renderEventDetailView()
          : renderAddEditView()
        : renderAddEditView()}
    </div>
  )
}

export default AddNoteDialog
