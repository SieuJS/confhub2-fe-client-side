// DayView.tsx
import React from 'react'
import { CalendarEvent } from './types/calendar'

interface DayViewProps {
  currentDate: Date
  getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[]
  getEventTypeColor: (type: string) => string
  highlightedDate: Date | null
  calendarRef: React.RefObject<HTMLElement>
}

const DayView: React.FC<DayViewProps> = ({
  currentDate,
  getDayEvents,
  getEventTypeColor,
  highlightedDate,
  calendarRef,
}) => {
  const dayNumber = currentDate.getDate()
  const dayEvents = getDayEvents(
    dayNumber,
    currentDate.getMonth() + 1,
    currentDate.getFullYear()
  )
  const isHighlighted =
    highlightedDate?.toDateString() === currentDate.toDateString()

  const handleDayClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.hasAttribute('data-day') && !target.hasAttribute('data-event')) {
      // Tạm thời vô hiệu hóa việc mở dialog khi click vào vùng trống
      /*
      calendarRef.current?.dispatchEvent(
        new CustomEvent('open-add-note', {
          bubbles: true,
          detail: { date: currentDate, event: e },
        })
      );
      */
      console.log("Clicked on an empty day area. Add-note is disabled.");
    }
  }

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    calendarRef.current?.dispatchEvent(
      new CustomEvent('open-event-details', {
        bubbles: true,
        detail: { event: event, clickEvent: e },
      })
    );
  }

  return (
    <div
      data-day={dayNumber}
      className={`cursor-pointer border border-primary py-4 hover:bg-secondary ${isHighlighted ? 'bg-secondary' : ''}`}
      onClick={handleDayClick}
    >
      <div className='pb-8 text-center text-sm '>
        {currentDate.toLocaleDateString()}
      </div>
      <div className='mt-0.5 flex flex-col items-center gap-0.5'>
        {dayEvents.map((event, index) => (
          <div
            key={`${event.conferenceId}-${index}`}
            data-event="true"
            className={`px-1 py-0.5 text-xs ${getEventTypeColor(event.type)} w-full cursor-pointer truncate text-center text-white`}
            title={event.conference}
            onClick={(e) => handleEventClick(e, event)}
          >
            {event.title || event.conference.split('-')[0].trim()}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DayView