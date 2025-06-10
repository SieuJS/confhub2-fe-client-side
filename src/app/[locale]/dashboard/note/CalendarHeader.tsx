// src/app/[locale]/dashboard/note/CalendarHeader.tsx
// src/components/calendar/CalendarHeader.tsx

import React from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { ViewType } from './types/calendar'

interface CalendarHeaderProps {
  currentDate: Date
  view: ViewType // Thay đổi từ string sang ViewType
  setView: React.Dispatch<React.SetStateAction<ViewType>> // Thay đổi kiểu của setView
  showViewOptions: boolean
  toggleViewOptions: () => void
  viewOptionsRef: React.RefObject<HTMLDivElement>
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  goToPreviousDay: () => void
  goToNextDay: () => void
  goToPreviousWeek: () => void
  goToNextWeek: () => void
  goToToday: () => void
  getWeek: (date: Date) => number
  toggleDatePicker: () => void
  searchText: string
  setSearchText: (text: string) => void
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  view,
  setView,
  showViewOptions,
  toggleViewOptions,
  viewOptionsRef,
  goToPreviousMonth,
  goToNextMonth,
  goToPreviousDay,
  goToNextDay,
  goToPreviousWeek,
  goToNextWeek,
  goToToday,
  getWeek,
  toggleDatePicker,
  searchText,
  setSearchText,
}) => {
  const t = useTranslations('')

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

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

  return (
    <div className='mb-2 flex items-center justify-between'>
      <div className='flex items-center gap-2 px-2'>
        <div
          className='relative z-10 inline-block text-left'
          ref={viewOptionsRef}
        >
          <button
            type='button'
            className='inline-flex items-center justify-center rounded-md border border-background-secondary bg-background px-4 py-2 text-sm font-medium  shadow-sm hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
            onClick={toggleViewOptions}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
            <ChevronDown className='-mr-1 ml-2 h-5 w-5' />
          </button>

          <div
            className={`absolute left-0 mt-2 w-24 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-text-secondary ring-opacity-5 ${showViewOptions ? '' : 'hidden'}`}
          >
            <div
              className='py-1'
              role='menu'
              aria-orientation='vertical'
              aria-labelledby='options-menu'
            >
              <button
                onClick={() => {
                  setView('day') // 'day' là một ViewType hợp lệ
                  toggleViewOptions()
                }}
                className='block w-full px-4 py-2 text-left text-sm  hover:bg-background-secondary '
                role='menuitem'
              >
                {t('Day')}
              </button>
              <button
                onClick={() => {
                  setView('week') // 'week' là một ViewType hợp lệ
                  toggleViewOptions()
                }}
                className='block w-full px-4 py-2 text-left text-sm  hover:bg-background-secondary '
                role='menuitem'
              >
                {t('Week')}
              </button>
              <button
                onClick={() => {
                  setView('month') // 'month' là một ViewType hợp lệ
                  toggleViewOptions()
                }}
                className='block w-full px-4 py-2 text-left text-sm  hover:bg-background-secondary '
                role='menuitem'
              >
                {t('Month')}
              </button>
            </div>
          </div>
        </div>

        {view === 'month' && (
          <>
            <button onClick={goToPreviousMonth} className='rounded-full p-1 '>
              <ChevronLeft
                className='h-4 w-4'
                style={{ color: 'var(--text-secondary)' }}
              />
            </button>
            <div
              className='relative w-36 cursor-pointer text-center text-lg font-semibold'
              onClick={toggleDatePicker}
            >
              {monthNames[currentMonth]} {currentYear}
            </div>
            <button onClick={goToNextMonth} className='rounded-full p-1 '>
              <ChevronRight
                className='h-4 w-4'
                style={{ color: 'var(--text-secondary)' }}
              />
            </button>
          </>
        )}

        {view === 'day' && (
          <>
            <button onClick={goToPreviousDay} className='rounded-full p-1 '>
              <ChevronLeft
                className='h-4 w-4'
                style={{ color: 'var(--text-secondary)' }}
              />
            </button>
            <div
              className='w-36 cursor-pointer text-center text-lg font-semibold'
              onClick={toggleDatePicker}
            >
              {monthNames[currentMonth]} {currentDate.getDate()},{' '}
              {currentYear}
            </div>
            <button onClick={goToNextDay} className='rounded-full p-1 '>
              <ChevronRight
                className='h-4 w-4'
                style={{ color: 'var(--text-secondary)' }}
              />
            </button>
          </>
        )}

        {view === 'week' && (
          <>
            <button onClick={goToPreviousWeek} className='rounded-full p-1 '>
              <ChevronLeft
                className='h-4 w-4'
                style={{ color: 'var(--text-secondary)' }}
              />
            </button>
            <div className='w-36 text-center text-lg font-semibold'>
              {t('Week')} {getWeek(currentDate)}, {currentYear}
            </div>
            <button onClick={goToNextWeek} className='rounded-full p-1 '>
              <ChevronRight
                className='h-4 w-4'
                style={{ color: 'var(--text-secondary)' }}
              />
            </button>
          </>
        )}
      </div>

      <div className='mx-auto flex items-center'>
        <Search className='mr-2 h-5 w-5 text-text-secondary' />
        <input
          type='text'
          placeholder={t('Search_events')}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          className='rounded border bg-background p-2'
        />
      </div>

      <button
        onClick={goToToday}
        className='hover:bg-bakcground-secondary mx-2 rounded-md bg-background px-3 py-1 text-sm hover:bg-background-secondary'
      >
        {t('Today')}
      </button>
    </div>
  )
}

export default CalendarHeader