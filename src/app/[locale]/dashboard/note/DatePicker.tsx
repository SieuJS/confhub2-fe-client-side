// src/app/[locale]/dashboard/note/DatePicker.tsx

import React from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface DatePickerProps {
  showDatePicker: boolean
  datePickerRef: React.RefObject<HTMLDivElement>
  currentDate: Date
  setCurrentDate: (date: Date | ((prev: Date) => Date)) => void
  getDaysInMonth: (date: Date) => number
  getFirstDayOfMonth: (date: Date) => number
  handleDateSelect: (date: Date) => void
}

const DatePicker: React.FC<DatePickerProps> = ({
  showDatePicker,
  datePickerRef,
  currentDate,
  setCurrentDate,
  getDaysInMonth,
  getFirstDayOfMonth,
  handleDateSelect,
}) => {
  const t = useTranslations('')
  const pickerDate = new Date(currentDate) // Use a copy to avoid direct mutation issues with currentDate prop

  const monthNames = [
    t('January'),
    t('February'),
    t('March'),
    t('April'),
    t('May'),
    t('June'),
    t('July'),
    t('August'),
    t('September'),
    t('October'),
    t('November'),
    t('December'),
  ]

  if (!showDatePicker) return null

  return (
    <div
      ref={datePickerRef}
      className='absolute z-10 mt-2 rounded-md bg-background p-4 shadow-lg'
      style={{ top: '50px', left: '50px' }} // Keep original inline style
    >
      <div className='mb-2 flex items-center justify-between'>
        <div className='flex-1 text-center font-bold'>
          {monthNames[pickerDate.getMonth()]} {pickerDate.getFullYear()}
        </div>
        <button
          onClick={() =>
            setCurrentDate(
              prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
            )
          }
          className='rounded-full p-1 '
        >
          <ChevronLeft className='h-4 w-4' />
        </button>
        <button
          onClick={() =>
            setCurrentDate(
              prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
            )
          }
          className='rounded-full p-1 '
        >
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>

      <div className='grid grid-cols-7 gap-1 text-center'>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className='0 text-xs font-medium'>
            {day}
          </div>
        ))}
      </div>
      <div className='grid grid-cols-7 gap-1 text-center'>
        {Array.from({ length: getFirstDayOfMonth(pickerDate) }).map(
          (_, index) => (
            <div key={`empty-${index}`} className='p-2'></div>
          )
        )}
        {Array.from({ length: getDaysInMonth(pickerDate) }).map(
          (_, dayIndex) => {
            const dayNumber = dayIndex + 1
            const date = new Date(
              pickerDate.getFullYear(),
              pickerDate.getMonth(),
              dayNumber
            )
            const isCurrentDay =
              date.toDateString() === new Date().toDateString()

            return (
              <div
                key={dayNumber}
                className={`cursor-pointer rounded-full p-2 hover:bg-blue-200 ${isCurrentDay ? 'bg-button ' : ''}`}
                onClick={() => handleDateSelect(date)}
              >
                {dayNumber}
              </div>
            )
          }
        )}
      </div>
    </div>
  )
}

export default DatePicker