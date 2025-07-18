// srchooks/dashboard/note/useNoteData.ts
import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '@/src/app/[locale]/dashboard/note/types/calendar';
import { areDatesContiguous, getTypeText, NoteType } from '@/src/app/[locale]/dashboard/note/utils/noteUtils';
import { useAuth } from '@/src/contexts/AuthContext'; // <-- IMPORT useAuth

export const API_GET_USER_CALENDAR_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}/api/v1/calendar/events`;

export interface ProcessedNote {
  type: NoteType;
  conference: string;
  id: string;
  date: string;
  countdown: string;
  year: number;
  month: number;
  day: number;
  name: string;
  typeText: string;
}

export const useNoteData = (t: (key: string) => string) => {
  const { isLoggedIn, logout } = useAuth(); // <-- LẤY isLoggedIn VÀ logout TỪ useAuth

  const [upcomingNotes, setUpcomingNotes] = useState<ProcessedNote[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  // const [loggedIn, setLoggedIn] = useState(false); // <-- BỎ DÒNG NÀY
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isBanned, setIsBanned] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      // const userData = localStorage.getItem('user'); // Không cần thiết nếu chỉ dựa vào isLoggedIn

      // Sử dụng isLoggedIn từ context thay vì kiểm tra token/userData cục bộ
      if (!isLoggedIn) { // <-- SỬ DỤNG isLoggedIn TỪ CONTEXT
        setUpcomingNotes([]);
        setCalendarEvents([]);
        setLoading(false); // Đảm bảo loading được tắt
        setInitialLoad(false); // Đảm bảo initialLoad được tắt
        return;
      }

      // Nếu isLoggedIn là true, nhưng token lại không có (trường hợp hiếm nhưng có thể xảy ra do đồng bộ),
      // thì coi như chưa đăng nhập và thoát.
      if (!token) {
        // Có thể gọi logout ở đây nếu muốn đảm bảo trạng thái nhất quán
        // logout({ callApi: false, preventRedirect: true });
        setUpcomingNotes([]);
        setCalendarEvents([]);
        setLoading(false);
        setInitialLoad(false);
        return;
      }

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
          // Khi bị ban, AuthContext sẽ tự động xử lý logout nếu cần,
          // hoặc bạn có thể gọi logout ở đây để đảm bảo.
          // logout({ callApi: true, preventRedirect: true });
        } else if (calendarResponse.status === 401) {
          // AuthContext sẽ tự động xử lý logout khi nhận 401
          // Không cần setLoggedIn(false) thủ công ở đây
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

      const processedUpcoming = upcoming.map(event => {
        const eventDate = new Date(event.year, event.month - 1, event.day);
        const timeDiff = eventDate.getTime() - new Date().getTime();
        const daysLeft = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60 * 24)));
        const hoursLeft = Math.max(0, Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        const countdownString = `${daysLeft}d ${hoursLeft}h`;

        return {
          ...event,
          id: event.conferenceId,
          countdown: countdownString,
        };
      });

      const groupedNotes: { [key: string]: any } = {};
      processedUpcoming.forEach(note => {
        const key = `${note.id}-${note.name}-${note.type}`;
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
            const { location, ...rest } = note;
            return { ...rest, date: formattedDateRange, typeText };
          } else {
            const date = note.dates[0];
            const dateObj = new Date(date.year, date.month - 1, date.day);
            const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            const formattedDate = dateObj.toLocaleDateString('en-US', options);
            const { location, ...rest } = note;
            return { ...rest, date: formattedDate, typeText };
          }
        })
        .slice(0, 9); // Giới hạn 9 mục, có thể cần phân trang ở đây nếu muốn hiển thị nhiều hơn

      setUpcomingNotes(finalUpcomingNotes);
    } catch (err: any) {
      setError(err.message);
      setUpcomingNotes([]);
      setCalendarEvents([]);
      // Không cần setLoggedIn(false) ở đây, AuthContext sẽ quản lý
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [isLoggedIn, t]); // <-- THÊM isLoggedIn VÀO DEPENDENCY ARRAY

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    upcomingNotes,
    calendarEvents,
    loading,
    // loggedIn, // <-- KHÔNG TRẢ VỀ loggedIn NỮA
    error,
    initialLoad,
    isBanned,
    isLoggedIn // <-- TRẢ VỀ isLoggedIn TỪ CONTEXT
  };
};