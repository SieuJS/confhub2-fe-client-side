// WeekView.tsx
import React from 'react'
import { CalendarEvent } from './types/calendar'

interface WeekViewProps {
  currentDate: Date
  shortMonthNames: string[]
  getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[]
  getEventTypeColor: (type: string) => string
  highlightedDate: Date | null
  calendarRef: React.RefObject<HTMLElement>
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  shortMonthNames,
  getDayEvents,
  getEventTypeColor,
  highlightedDate,
  calendarRef,
}) => {
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  const days = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    days.push(day)
  }

  const handleDayClick = (e: React.MouseEvent, day: Date) => {
    const target = e.target as HTMLElement;
    if (target.hasAttribute('data-day') && !target.hasAttribute('data-event')) {
      // Tạm thời vô hiệu hóa việc mở dialog khi click vào ngày trống
      /*
      calendarRef.current?.dispatchEvent(
        new CustomEvent('open-add-note', {
          bubbles: true,
          detail: { date: day, event: e },
        })
      );
      */
      // console.log("Clicked on an empty day area. Add-note is disabled.");
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
    <div className='grid grid-cols-7 text-center'>
      {days.map(day => {
        const dayNumber = day.getDate()
        const dayEvents = getDayEvents(
          dayNumber,
          day.getMonth() + 1,
          day.getFullYear()
        )
        const isHighlighted =
          highlightedDate?.toDateString() === day.toDateString()

        return (
          <div
            key={day.toISOString()}
            data-day={dayNumber}
            className={`cursor-pointer border border-primary py-4 hover:bg-secondary ${
              isHighlighted ? 'bg-secondary' : ''
            }`}
            onClick={(e) => handleDayClick(e, day)}
          >
            <div className='pb-8 text-sm '>
              {shortMonthNames[day.getMonth()]} {dayNumber}
            </div>
            <div className='mt-0.5 flex flex-col gap-0.5'>
              {dayEvents.map((event, index) => (
                <div
                  key={`${event.conferenceId}-${index}`}
                  data-event="true"
                  className={`px-1 py-0.5 text-xs ${getEventTypeColor(
                    event.type
                  )} cursor-pointer truncate text-white`}
                  title={event.conference}
                  onClick={(e) => handleEventClick(e, event)}
                >
                  {event.title || event.conference.split('-')[0].trim()}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default WeekView