// src/app//[locale]/dashboard/note/CalendarHeader.tsx

import React from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { ViewType } from './types/calendar'

interface CalendarHeaderProps {
  currentDate: Date
  view: ViewType
  setView: React.Dispatch<React.SetStateAction<ViewType>>
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
    t('January'), t('February'), t('March'), t('April'), t('May'), t('June'),
    t('July'), t('August'), t('September'), t('October'), t('November'), t('December'),
  ]

  const shortMonthNames = [
    t('Jan'), t('Feb'), t('Mar'), t('Apr'), t('May'), t('Jun'),
    t('Jul'), t('Aug'), t('Sep'), t('Oct'), t('Nov'), t('Dec'),
  ]

  const renderDateDisplay = () => {
    const commonClasses = "cursor-pointer text-center font-semibold text-sm sm:text-lg whitespace-nowrap";
    
    switch (view) {
      case 'month':
        return (
          <div className={commonClasses} onClick={toggleDatePicker}>
            <span className="hidden sm:inline">{monthNames[currentMonth]}</span>
            <span className="sm:hidden">{shortMonthNames[currentMonth]}</span>
            {' '}{currentYear}
          </div>
        )
      case 'day':
        return (
          <div className={commonClasses} onClick={toggleDatePicker}>
            <span className="hidden sm:inline">{monthNames[currentMonth]}</span>
            <span className="sm:hidden">{shortMonthNames[currentMonth]}</span>
            {' '}{currentDate.getDate()}, {currentYear}
          </div>
        )
      case 'week':
        return (
          <div className={commonClasses}>
            {t('Week')} {getWeek(currentDate)}, {currentYear}
          </div>
        )
      default:
        return null
    }
  }

  const handlePrev = () => {
    if (view === 'month') goToPreviousMonth()
    else if (view === 'day') goToPreviousDay()
    else if (view === 'week') goToPreviousWeek()
  }

  const handleNext = () => {
    if (view === 'month') goToNextMonth()
    else if (view === 'day') goToNextDay()
    else if (view === 'week') goToNextWeek()
  }

  return (
    // Container chính: flex, flex-wrap để các nhóm tự xuống hàng, gap-4 để tạo khoảng cách
    <div className='mb-4 flex flex-wrap items-center justify-between gap-y-4 gap-x-2'>
      
      {/* Nhóm 1: Điều khiển View và Ngày */}
      <div className='flex items-center gap-2'>
        {/* Nút Today */}
        <button
          onClick={goToToday}
          className='rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-background-secondary'
        >
          {t('Today')}
        </button>

        {/* Nút điều hướng Trước/Sau */}
        <div className="flex items-center">
          <button onClick={handlePrev} className='rounded-full p-2 hover:bg-background-secondary'>
            <ChevronLeft className='h-5 w-5 text-text-secondary' />
          </button>
          <button onClick={handleNext} className='rounded-full p-2 hover:bg-background-secondary'>
            <ChevronRight className='h-5 w-5 text-text-secondary' />
          </button>
        </div>

        {/* Hiển thị ngày/tháng/năm */}
        {renderDateDisplay()}
      </div>

      {/* Nhóm 2: Tìm kiếm và chọn View */}
      <div className='flex flex-grow items-center justify-end gap-2 md:flex-grow-0'>
        {/* Ô tìm kiếm */}
        <div className='relative flex-grow md:flex-grow-0'>
          <Search className='pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary' />
          <input
            type='text'
            placeholder={t('Search_events')}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className='w-full rounded-md border bg-background py-2 pl-10 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring'
          />
        </div>

        {/* Nút chọn View */}
        <div className='relative' ref={viewOptionsRef}>
          <button
            type='button'
            className='inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-background-secondary focus:outline-none focus:ring-2 focus:ring-ring'
            onClick={toggleViewOptions}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
            <ChevronDown className='-mr-1 ml-2 h-5 w-5' />
          </button>

          {showViewOptions && (
            <div className='absolute right-0 z-10 mt-2 w-28 origin-top-right rounded-md bg-background shadow-lg ring-1 ring-black ring-opacity-5'>
              <div className='py-1' role='menu'>
                {(['day', 'week', 'month'] as ViewType[]).map(v => (
                  <button
                    key={v}
                    onClick={() => { setView(v); toggleViewOptions(); }}
                    className='block w-full px-4 py-2 text-left text-sm text-text-primary hover:bg-background-secondary'
                    role='menuitem'
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CalendarHeader