// src/app/[locale]/dashboard/note/Calendar.tsx

import React, { useRef, useEffect, useState, useCallback } from 'react'
import MonthView from './MonthView'
import WeekView from './WeekView'
import DayView from './DayView'
import useDateNavigation from '../../../../hooks/dashboard/note/useDateNavigation'
import useEventFiltering from '../../../../hooks/dashboard/note/useEventFiltering'
import useDatePickerControl from '../../../../hooks/dashboard/note/useDatePickerControl'
import useViewSwitching from '../../../../hooks/dashboard/note/useViewSwitching'
import AddNoteDialog from './AddNoteDialog'
import { useTranslations } from 'next-intl'

import { CalendarEvent, ViewType } from './types/calendar'
import useEventManagement from '../../../../hooks/dashboard/note/useEventManagement'
import useEventDialog from '../../../../hooks/dashboard/note/useEventDialog'
import CalendarHeader from './CalendarHeader'
import DatePicker from './DatePicker'

interface CalendarProps {
  calendarEvents: CalendarEvent[]
}

const Calendar: React.FC<CalendarProps> = ({ calendarEvents }) => {
  const t = useTranslations('')

  const dateNavigation = useDateNavigation()
  const {
    currentDate,
    setCurrentDate,
    goToPreviousMonth,
    goToNextMonth,
    goToPreviousDay,
    goToNextDay,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    getWeek,
    getDaysInMonth,
    getFirstDayOfMonth,
  } = dateNavigation

  const datePickerControl = useDatePickerControl()
  const { showDatePicker, toggleDatePicker, datePickerRef, setShowDatePicker } =
    datePickerControl

  const viewSwitching = useViewSwitching()
  const {
    view,
    setView,
    showViewOptions,
    toggleViewOptions,
    viewOptionsRef,
    scrollToDate,
  } = viewSwitching

  const { searchText, setSearchText } = useEventFiltering(currentDate)

  const calendarRef = useRef<HTMLDivElement>(null)

  const [highlightedDate, setHighlightedDate] = useState<Date | null>(null)

  const { getDayEvents, getEventTypeColor } = useEventManagement({
    initialEvents: calendarEvents,
    currentDate,
    searchText,
  })

  const {
    showDialog,
    dialogDate,
    selectedEvent,
    selectedEventDetail,
    loadingDetails,
    closeDialog,
  } = useEventDialog({
    calendarRef,
    setHighlightedDate,
  })

  // useEffect để khóa scroll của body khi dialog mở
  useEffect(() => {
    if (showDialog) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function để đảm bảo scroll được bật lại khi component unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDialog]);


  const handleDateSelect = useCallback(
    (date: Date) => {
      setCurrentDate(date)
      setView('day')
      setShowDatePicker(false)
    },
    [setCurrentDate, setView, setShowDatePicker]
  )

  useEffect(() => {
    scrollToDate(currentDate, view, calendarRef)
  }, [currentDate, view, scrollToDate])

  const shortMonthNames = [
    t('January_acronym'), t('February_acronym'), t('March_acronym'),
    t('April_acronym'), t('May_acronym'), t('June_acronym'),
    t('July_acronym'), t('August_acronym'), t('September_acronym'),
    t('October_acronym'), t('November_acronym'), t('December_acronym'),
  ]

  return (
    <section
      className='relative rounded-md bg-background px-2 pt-2 shadow'
      ref={calendarRef}
    >
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        setView={setView}
        showViewOptions={showViewOptions}
        toggleViewOptions={toggleViewOptions}
        viewOptionsRef={viewOptionsRef}
        goToPreviousMonth={goToPreviousMonth}
        goToNextMonth={goToNextMonth}
        goToPreviousDay={goToPreviousDay}
        goToNextDay={goToNextDay}
        goToPreviousWeek={goToPreviousWeek}
        goToNextWeek={goToNextWeek}
        goToToday={goToToday}
        getWeek={getWeek}
        toggleDatePicker={toggleDatePicker}
        searchText={searchText}
        setSearchText={setSearchText}
      />

      <DatePicker
        showDatePicker={showDatePicker}
        datePickerRef={datePickerRef}
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        getDaysInMonth={getDaysInMonth}
        getFirstDayOfMonth={getFirstDayOfMonth}
        handleDateSelect={handleDateSelect}
      />

      {view === 'month' && (
        <MonthView
          currentMonth={currentDate.getMonth()}
          currentYear={currentDate.getFullYear()}
          daysInMonth={getDaysInMonth(currentDate)}
          firstDayOfMonth={getFirstDayOfMonth(currentDate)}
          getDayEvents={getDayEvents}
          getEventTypeColor={getEventTypeColor}
          highlightedDate={highlightedDate}
          calendarRef={calendarRef}
        />
      )}
      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          shortMonthNames={shortMonthNames}
          getDayEvents={getDayEvents}
          getEventTypeColor={getEventTypeColor}
          highlightedDate={highlightedDate}
          calendarRef={calendarRef}
        />
      )}
      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          getDayEvents={getDayEvents}
          getEventTypeColor={getEventTypeColor}
          highlightedDate={highlightedDate}
          calendarRef={calendarRef}
        />
      )}

      {/* Dialog được render trong một lớp phủ toàn màn hình */}
      {showDialog && dialogDate && (
        // Lớp nền mờ (backdrop/overlay)
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeDialog} // Cho phép đóng dialog khi click vào nền mờ
        >
          {/* Container của dialog, ngăn sự kiện click lan ra nền mờ */}
          <div onClick={(e) => e.stopPropagation()}>
            <AddNoteDialog
              date={dialogDate}
              onClose={closeDialog}
              event={selectedEvent}
              eventDetails={selectedEventDetail}
              loadingDetails={loadingDetails}
            />
          </div>
        </div>
      )}
    </section>
  )
}

export default Calendar