// MonthView.tsx
import React from 'react'
import { CalendarEvent } from './types/calendar'
import { useTranslations } from 'next-intl'

interface MonthViewProps {
  currentMonth: number
  currentYear: number
  daysInMonth: number
  firstDayOfMonth: number
  getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[]
  getEventTypeColor: (type: string) => string
  highlightedDate: Date | null
  calendarRef: React.RefObject<HTMLElement>
}

const MonthView: React.FC<MonthViewProps> = ({
  currentMonth,
  currentYear,
  daysInMonth,
  firstDayOfMonth,
  getDayEvents,
  getEventTypeColor,
  highlightedDate,
  calendarRef,
}) => {
  const t = useTranslations('')

  const daysInWeek = [
    t('Sun'), t('Mon'), t('Tue'), t('Wed'), t('Thu'), t('Fri'), t('Sat'),
  ]

  const handleDayClick = (e: React.MouseEvent, dayNumber: number) => {
    // Logic này chỉ nên được kích hoạt khi click vào vùng trống của ngày,
    // không phải khi click vào một event cụ thể.
    // Vì hiện tại chúng ta đã vô hiệu hóa việc thêm note, nên có thể để trống hoặc comment out.
    const target = e.target as HTMLElement;
    // Chỉ dispatch 'open-add-note' nếu click vào chính ô ngày (div có data-day)
    // và không phải là một event con (div có data-event).
    if (target.hasAttribute('data-day') && !target.hasAttribute('data-event')) {
        // Tạm thời vô hiệu hóa việc mở dialog khi click vào ngày trống
        /*
        const date = new Date(currentYear, currentMonth, dayNumber);
        calendarRef.current?.dispatchEvent(
            new CustomEvent('open-add-note', {
                bubbles: true,
                detail: { date: date, event: e },
            })
        );
        */
       // console.log("Clicked on an empty day area. Add-note is disabled.");
    }
  }

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    // Ngăn sự kiện click lan lên ô ngày cha
    e.stopPropagation();

    // Dispatch sự kiện để mở dialog chi tiết
    calendarRef.current?.dispatchEvent(
      new CustomEvent('open-event-details', {
        bubbles: true, // bubbles: true là cần thiết để sự kiện có thể được lắng nghe ở cấp cao hơn (Calendar.tsx)
        detail: { event: event, clickEvent: e },
      })
    );
  }

  return (
    <div className='grid grid-cols-7 text-center'>
      {daysInWeek.map(day => (
        <div key={day} className='font-medium '>
          {day}
        </div>
      ))}

      {Array.from({ length: firstDayOfMonth }).map((_, index) => (
        <div key={`empty-${index}`} className='p-1'></div>
      ))}

      {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
        const dayNumber = dayIndex + 1
        const dayEvents = getDayEvents(dayNumber, currentMonth + 1, currentYear)
        const isHighlighted =
          highlightedDate?.getDate() === dayNumber &&
          highlightedDate?.getMonth() === currentMonth &&
          highlightedDate?.getFullYear() === currentYear

        return (
          <div
            key={dayNumber}
            data-day={dayNumber} // Thêm data-day để xác định ô ngày
            className={`cursor-pointer border border-primary py-4 hover:bg-secondary ${isHighlighted ? 'bg-secondary' : ''}`}
            onClick={(e) => handleDayClick(e, dayNumber)}
          >
            <div className='pb-8 text-sm '>{dayNumber}</div>
            <div className='mt-0.5 flex flex-col gap-0.5'>
              {dayEvents.map((event, index) => (
                <div
                  key={`${event.conferenceId}-${index}`}
                  data-event="true" // Thêm data-event để xác định đây là một event
                  className={`px-1 py-0.5 text-xs ${getEventTypeColor(event.type)} cursor-pointer truncate text-white`}
                  title={event.conference}
                  onClick={(e) => handleEventClick(e, event)} // Bỏ comment và sử dụng hàm xử lý riêng
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

export default MonthView