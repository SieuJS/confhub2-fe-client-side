// src/hooks/dashboard/note/useEventManagement.ts

import { useState, useMemo, useCallback } from 'react'
import { EVENT_TYPE_COLORS } from '@/src/app/[locale]/dashboard/note/constants/constants'
import { CalendarEvent } from '@/src/app/[locale]/dashboard/note/types/calendar'

interface UseEventManagementProps {
  initialEvents: CalendarEvent[]
  currentDate: Date
  searchText: string
}

interface UseEventManagementReturn {
  allEvents: CalendarEvent[]
  setAllEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>
  filteredEvents: CalendarEvent[]
  getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[]
  getEventTypeColor: (type: string) => string
}

const useEventManagement = ({
  initialEvents,
  currentDate,
  searchText,
}: UseEventManagementProps): UseEventManagementReturn => {
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>(initialEvents)

  const filteredEvents = useMemo(() => {
    const lowerCaseSearchText = searchText.toLowerCase()
    return allEvents.filter(
      event =>
        (event.conference &&
          event.conference.toLowerCase().includes(lowerCaseSearchText)) ||
        (event.type &&
          event.type.toLowerCase().includes(lowerCaseSearchText)) ||
        (event.title && event.title.toLowerCase().includes(lowerCaseSearchText))
    )
  }, [searchText, allEvents])

  const getDayEvents = useCallback(
    (
      day: number,
      month: number = currentDate.getMonth() + 1,
      year: number = currentDate.getFullYear()
    ): CalendarEvent[] => {
      return filteredEvents.filter(
        event =>
          event.day === day && event.month === month && event.year === year
      )
    },
    [filteredEvents, currentDate]
  )

  const typeColors = useMemo(() => EVENT_TYPE_COLORS, [])

  const getEventTypeColor = useCallback(
    (type: string) => {
      return typeColors[type as keyof typeof typeColors] || 'bg-gray-400'
    },
    [typeColors]
  )

  return {
    allEvents,
    setAllEvents,
    filteredEvents,
    getDayEvents,
    getEventTypeColor,
  }
}

export default useEventManagement