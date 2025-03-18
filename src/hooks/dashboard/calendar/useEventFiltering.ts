// hooks/useEventFiltering.ts
import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '../../../app/[locale]/dashboard/DayNote';

interface EventFilteringResult {
  searchText: string;
  setSearchText: (text: string) => void;
  filteredEvents: CalendarEvent[];
    getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[];
}

const useEventFiltering = (calendarEvents: CalendarEvent[]): EventFilteringResult => {
  const [searchText, setSearchText] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>(calendarEvents);

    const getDayEvents = useCallback((day: number, month: number = new Date().getMonth() + 1, year: number = new  Date().getFullYear()): CalendarEvent[] => {
        return filteredEvents.filter(
          event => event.day === day && event.month === month && event.year === year
        );
    },[filteredEvents]);

  useEffect(() => {
    const lowerCaseSearchText = searchText.toLowerCase();
    const filtered = calendarEvents.filter(event =>
      event.conference.toLowerCase().includes(lowerCaseSearchText) ||
      event.type.toLowerCase().includes(lowerCaseSearchText)
    );
    setFilteredEvents(filtered);
  }, [searchText, calendarEvents]);

  return { searchText, setSearchText, filteredEvents, getDayEvents };
};

export default useEventFiltering;