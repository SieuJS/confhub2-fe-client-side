// srchooks/dashboard/note/useNoteData.ts
import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '@/src/app/[locale]/dashboard/note/types/calendar';
import { ConferenceResponse, ImportantDate } from '@/src/models/response/conference.response';
import { getConferenceFromDB } from '@/src/app/apis/conference/getConferenceDetails';
import { areDatesContiguous, getTypeText, NoteType } from '@/src/app/[locale]/dashboard/note/utils/noteUtils';

export const API_GET_USER_CALENDAR_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/calendar/events`;

export interface ProcessedNote {
  type: NoteType;
  conference: string;
  id: string;
  location: string;
  date: string;
  countdown: string;
  year: number;
  month: number;
  day: number;
  name: string;
  typeText: string;
}

export const useNoteData = (t: (key: string) => string) => {
  const [upcomingNotes, setUpcomingNotes] = useState<ProcessedNote[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      if (!userData || !token) {
        setLoggedIn(false);
        setUpcomingNotes([]);
        setCalendarEvents([]);
        return;
      }

      setLoggedIn(true);

      const calendarResponse = await fetch(API_GET_USER_CALENDAR_ENDPOINT, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!calendarResponse.ok) {
        if (calendarResponse.status === 403) {
          setIsBanned(true);
          setLoggedIn(false);
        } else if (calendarResponse.status === 401) {
          setLoggedIn(false);
        } else {
          throw new Error(`HTTP error! status: ${calendarResponse.status}`);
        }
        setUpcomingNotes([]);
        setCalendarEvents([]);
        return;
      }

      const calendarData: CalendarEvent[] = await calendarResponse.json();
      setCalendarEvents(calendarData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = calendarData
        .filter(event => new Date(event.year, event.month - 1, event.day) >= today)
        .sort((a, b) => new Date(a.year, a.month - 1, a.day).getTime() - new Date(b.year, b.month - 1, b.day).getTime());

      const notesWithLocation = await Promise.all(
        upcoming.map(async event => {
          const eventDate = new Date(event.year, event.month - 1, event.day);
          const timeDiff = eventDate.getTime() - new Date().getTime();
          const daysLeft = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
          const hoursLeft = Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
          const countdownString = `${daysLeft}d ${hoursLeft}h `;

          try {
            const conferenceDetails: ConferenceResponse = await getConferenceFromDB(event.conferenceId);
            let eventName = '';
            if (conferenceDetails.organizations[0]?.conferenceDates) {
              const matchingDate = conferenceDetails.organizations[0].conferenceDates.find((d: ImportantDate) => {
                if (!d) return false;
                const fromDate = d.fromDate ? new Date(d.fromDate) : null;
                const toDate = d.toDate ? new Date(d.toDate) : null;
                const checkDate = new Date(event.year, event.month - 1, event.day);
                return (
                  (fromDate && checkDate.getFullYear() === fromDate.getFullYear() && checkDate.getMonth() === fromDate.getMonth() && checkDate.getDate() === fromDate.getDate()) ||
                  (fromDate && toDate && checkDate >= fromDate && checkDate <= toDate)
                );
              });
              if (matchingDate?.name) eventName = matchingDate.name;
            }
            // SỬA LỖI Ở ĐÂY: Thêm thuộc tính 'id' từ 'event.conferenceId'
            return {
              ...event,
              id: event.conferenceId, // <-- Thêm dòng này
              location: `${conferenceDetails.organizations[0]?.locations[0]?.cityStateProvince}, ${conferenceDetails.organizations[0]?.locations[0]?.country}`,
              countdown: countdownString,
              name: eventName
            };
          } catch (locationError) {
            console.error(`Error fetching location for conference ${event.conferenceId}:`, locationError);
            // SỬA LỖI Ở ĐÂY: Thêm thuộc tính 'id' từ 'event.conferenceId'
            return {
              ...event,
              id: event.conferenceId, // <-- Thêm dòng này
              location: 'Location unavailable',
              countdown: countdownString,
              name: ''
            };
          }
        })
      );

      const groupedNotes: { [key: string]: any } = {};
      notesWithLocation.forEach(note => {
        // Bây giờ 'note.id' đã tồn tại và code sẽ chạy đúng
        const key = `${note.id}-${note.type}`;
        let addedToGroup = false;
        for (const existingKey in groupedNotes) {
          if (existingKey.startsWith(key)) {
            const existingGroup = groupedNotes[existingKey];
            const lastDateInGroup = new Date(existingGroup.dates[existingGroup.dates.length - 1].year, existingGroup.dates[existingGroup.dates.length - 1].month - 1, existingGroup.dates[existingGroup.dates.length - 1].day);
            const currentDate = new Date(note.year, note.month - 1, note.day);
            if (areDatesContiguous(lastDateInGroup, currentDate)) {
              existingGroup.dates.push({ year: note.year, month: note.month, day: note.day });
              addedToGroup = true;
              break;
            }
          }
        }
        if (!addedToGroup) {
          const newKey = `${key}-${note.year}-${note.month}-${note.day}`;
          groupedNotes[newKey] = { ...note, dates: [{ year: note.year, month: note.month, day: note.day }] };
        }
      });

      const finalUpcomingNotes = Object.values(groupedNotes)
        .map((note: any): ProcessedNote => {
          const typeText = getTypeText(note.type as NoteType, t);
          if (note.dates.length > 1) {
            note.dates.sort((a: any, b: any) => new Date(a.year, a.month - 1, a.day).getTime() - new Date(b.year, b.month - 1, b.day).getTime());
            const startDate = note.dates[0];
            const endDate = note.dates[note.dates.length - 1];
            const startDateObj = new Date(startDate.year, startDate.month - 1, startDate.day);
            const endDateObj = new Date(endDate.year, endDate.month - 1, endDate.day);
            const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
            let formattedDateRange = '';
            if (startDate.year === endDate.year && startDate.month === endDate.month) {
              formattedDateRange = `${startDateObj.toLocaleDateString('en-US', { day: 'numeric' })} - ${endDateObj.toLocaleDateString('en-US', { day: 'numeric' })} ${startDateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
            } else if (startDate.year === endDate.year) {
              formattedDateRange = `${startDateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDateObj.toLocaleDateString('en-US', options)}`;
            } else {
              formattedDateRange = `${startDateObj.toLocaleDateString('en-US', options)} - ${endDateObj.toLocaleDateString('en-US', options)}`;
            }
            return { ...note, date: formattedDateRange, typeText };
          } else {
            const date = note.dates[0];
            const dateObj = new Date(date.year, date.month - 1, date.day);
            const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            const formattedDate = dateObj.toLocaleDateString('en-US', options);
            return { ...note, date: formattedDate, typeText };
          }
        })
        .slice(0, 6);

      setUpcomingNotes(finalUpcomingNotes);
    } catch (err: any) {
      console.error('Failed to fetch calendar data:', err);
      setError(err.message);
      setUpcomingNotes([]);
      setCalendarEvents([]);
      setLoggedIn(false);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    upcomingNotes,
    calendarEvents,
    loading,
    loggedIn,
    error,
    initialLoad,
    isBanned
  };
};