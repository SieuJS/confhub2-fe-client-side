// NoteTab.tsx
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'; // THÊM useCallback
import Calendar from './Calendar';
import { CalendarEvent } from './Calendar';
import {
  ConferenceResponse,
  ImportantDate
} from '../../../../models/response/conference.response';
import { Link } from '@/src/navigation';
import Button from '../../utils/Button';
import { useTranslations } from 'next-intl';
import { getConferenceFromDB } from '@/src/app/apis/conference/getConferenceDetails';
import { appConfig } from '@/src/middleware';
import { useAuth } from '@/src/contexts/AuthContext';
import { Loader2 } from 'lucide-react'; // THÊM DÒNG NÀY

interface NoteTabProps {}

const API_GET_USER_CALENDAR_ENDPOINT = `${process.env.NEXT_PUBLIC_DATABASE_URL}`;

const NoteTab: React.FC<NoteTabProps> = () => {
  const t = useTranslations('');
  const { logout } = useAuth();

  const [upcomingNotes, setUpcomingNotes] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true); // Biến này kiểm soát liệu đây có phải lần tải đầu tiên không
  const [isBanned, setIsBanned] = useState(false); // Thêm state isBanned
  const [leftWidth, setLeftWidth] = useState(50); // Initial width: 50%
  const [isResizing, setIsResizing] = useState(false);
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const rightSectionRef = useRef<HTMLDivElement>(null);
  const notesContainerRef = useRef<HTMLDivElement>(null); // Ref for notes container
  
  // Biến notesPerRow cần được quản lý bằng state hoặc ref nếu nó thay đổi và ảnh hưởng đến render.
  // Tuy nhiên, nếu nó chỉ được dùng trong getNoteWidth, bạn có thể truyền nó như một đối số
  // hoặc dùng useMemo/useState cho nó. Để đơn giản, ta sẽ dùng let và gọi updateNotesPerRow()
  // khi cần, nhưng lưu ý đây không phải cách React "tối ưu" nhất nếu nó thay đổi thường xuyên.
  let notesPerRow = 3; 

  type NoteType =
    | 'conferenceDates'
    | 'submissionDate'
    | 'notificationDate'
    | 'cameraReadyDate'
    | 'registrationDate'
    | 'yourNote'
    | 'other'; // Thêm 'other' vào type

  const typeColors = useMemo(
    () => ({
      conferenceDates: 'bg-teal-200',
      submissionDate: 'bg-red-200',
      notificationDate: 'bg-blue-200',
      cameraReadyDate: 'bg-orange-200',
      registrationDate: 'bg-cyan-200',
      yourNote: 'bg-yellow-200',
      other: 'bg-gray-200'
    }),
    []
  );

  const getEventTypeColor = useCallback((type: NoteType) => { // Dùng useCallback
    return typeColors[type] || typeColors['other'];
  }, [typeColors]);

  const getTypeText = useCallback((type: NoteType) => { // Dùng useCallback
    switch (type) {
      case 'conferenceDates':
        return t('Conference_Dates');
      case 'submissionDate':
        return t('Submission_Dates');
      case 'notificationDate':
        return t('Notification_Dates');
      case 'cameraReadyDate':
        return t('Camera_Ready_Dates');
      case 'registrationDate':
        return t('Registration_Dates');
      case 'yourNote':
        return t('Your_Notes');
      default:
        return t('Other');
    }
  }, [t]); // Dependency t

  const areDatesContiguous = useCallback((date1: Date, date2: Date): boolean => { // Dùng useCallback
    const diffInTime = Math.abs(date2.getTime() - date1.getTime());
    const diffInDays = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
    return diffInDays === 1;
  }, []);

  const startResizing = useCallback(() => { // Dùng useCallback
    setIsResizing(true);
  }, []);

  const resize = useCallback((e: MouseEvent) => { // Dùng useCallback
    if (!isResizing || !leftSectionRef.current || !rightSectionRef.current)
      return;

    const container = leftSectionRef.current.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newLeftWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    const minWidth = 10;
    const maxWidth = 90;

    if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
      setLeftWidth(newLeftWidth);
    }
    // Không gọi updateNotesPerRow() trong resize, vì nó sẽ gây re-render liên tục.
    // updateNotesPerRow sẽ được gọi trong useEffect lắng nghe leftWidth hoặc khi dữ liệu fetch xong.
  }, [isResizing]);

  const stopResizing = useCallback(() => { // Dùng useCallback
    setIsResizing(false);
  }, []);

  const updateNotesPerRow = useCallback(() => { // Dùng useCallback
    if (notesContainerRef.current) {
      const width = notesContainerRef.current.offsetWidth;
      if (width < 640) {
        notesPerRow = 1;
      } else if (width < 1024) {
        notesPerRow = 2;
      } else {
        notesPerRow = 3;
      }
    }
  }, []); // Không có dependencies nếu notesPerRow là biến let cục bộ. Nếu là state, thêm state vào.

  useEffect(() => {
    updateNotesPerRow(); // Cập nhật khi leftWidth thay đổi
  }, [leftWidth, updateNotesPerRow]); // Thêm updateNotesPerRow vào dependency

  useEffect(() => {
    window.addEventListener('resize', updateNotesPerRow);
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);

    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('resize', updateNotesPerRow);
    };
  }, [isResizing, resize, stopResizing, updateNotesPerRow]); // Thêm tất cả hàm vào dependency

  const fetchData = useCallback(async () => {
    setLoading(true); // Bắt đầu loading
    setError(null); // Xóa lỗi cũ
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        setLoggedIn(false);
        setUpcomingNotes([]);
        setCalendarEvents([]);
        return; // Đảm bảo thoát sớm nếu không có userData
      }

      const user = JSON.parse(userData); // Bạn không sử dụng biến user này
      setLoggedIn(true);

      const calendarResponse = await fetch(
        `${API_GET_USER_CALENDAR_ENDPOINT}/api/v1/calendar/events`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!calendarResponse.ok) {
        if (calendarResponse.status === 403) {
          console.error('User is banned.');
          setLoggedIn(false);
          setIsBanned(true); // Cập nhật trạng thái bị cấm
        } else if (calendarResponse.status === 401) {
          console.error('Authentication error. Please log in.');
          setLoggedIn(false);
        } else {
          throw new Error(`HTTP error! status: ${calendarResponse.status}`);
        }
        setUpcomingNotes([]); // Xóa dữ liệu cũ nếu có lỗi
        setCalendarEvents([]);
        return;
      }

      const calendarData: CalendarEvent[] = await calendarResponse.json();
      setCalendarEvents(calendarData);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = calendarData
        .filter(event => {
          const eventDate = new Date(event.year, event.month - 1, event.day);
          return eventDate >= today;
        })
        .sort((a, b) => {
          const dateA = new Date(a.year, a.month - 1, a.day);
          const dateB = new Date(b.year, b.month - 1, b.day);
          return dateA.getTime() - dateB.getTime();
        });

      const notesWithLocation = await Promise.all(
        upcoming.map(async event => {
          const eventDate = new Date(event.year, event.month - 1, event.day);
          const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          const timeDiff = eventDate.getTime() - new Date().getTime();
          const daysLeft = Math.max(
            0,
            Math.floor(timeDiff / (1000 * 60 * 60 * 24))
          );
          const hoursLeft = Math.max(
            0,
            Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          );
          const countdownString = `${daysLeft}d ${hoursLeft}h `;

          try {
            const conferenceDetails: ConferenceResponse =
              await getConferenceFromDB(event.conferenceId);

            let eventName = '';
            if (conferenceDetails.organizations[0].conferenceDates) {
              const matchingDate =
                conferenceDetails.organizations[0].conferenceDates.find(
                  (d: ImportantDate) => {
                    if (!d) return false;
                    const fromDate = d.fromDate ? new Date(d.fromDate) : null;
                    const toDate = d.toDate ? new Date(d.toDate) : null;
                    const checkDate = new Date(
                      event.year,
                      event.month - 1,
                      event.day
                    );

                    return (
                      (fromDate &&
                        checkDate.getFullYear() === fromDate.getFullYear() &&
                        checkDate.getMonth() === fromDate.getMonth() &&
                        checkDate.getDate() === fromDate.getDate()) ||
                      (fromDate &&
                        toDate &&
                        checkDate >= fromDate &&
                        checkDate <= toDate)
                    );
                  }
                );

              if (matchingDate && matchingDate.name) {
                eventName = matchingDate.name;
              }
            }

            return {
              type: event.type,
              conference: event.conference,
              id: event.conferenceId,
              location: `${conferenceDetails.organizations[0].locations[0].cityStateProvince}, ${conferenceDetails.organizations[0].locations[0].country}`,
              date: formattedDate,
              countdown: countdownString,
              year: event.year,
              month: event.month,
              day: event.day,
              name: eventName
            };
          } catch (locationError) {
            console.error(
              `Error fetching location for conference ${event.conferenceId}:`,
              locationError
            );
            return {
              type: event.type,
              conference: event.conference,
              id: event.conferenceId,
              location: 'Location unavailable',
              date: formattedDate,
              countdown: countdownString,
              year: event.year,
              month: event.month,
              day: event.day,
              name: ''
            };
          }
        })
      );

      const groupedNotes: { [key: string]: any } = {};
      notesWithLocation.forEach(note => {
        const key = `${note.id}-${note.type}`;
        let addedToGroup = false;

        for (const existingKey in groupedNotes) {
          if (existingKey.startsWith(key)) {
            const existingGroup = groupedNotes[existingKey];
            const lastDateInGroup = new Date(
              existingGroup.dates[existingGroup.dates.length - 1].year,
              existingGroup.dates[existingGroup.dates.length - 1].month - 1,
              existingGroup.dates[existingGroup.dates.length - 1].day
            );
            const currentDate = new Date(note.year, note.month - 1, note.day);

            if (areDatesContiguous(lastDateInGroup, currentDate)) {
              existingGroup.dates.push({
                year: note.year,
                month: note.month,
                day: note.day
              });
              addedToGroup = true;
              break;
            }
          }
        }

        if (!addedToGroup) {
          const newKey = `${key}-${note.year}-${note.month}-${note.day}`;
          groupedNotes[newKey] = {
            ...note,
            dates: [{ year: note.year, month: note.month, day: note.day }]
          };
        }
      });

      const finalUpcomingNotes = Object.values(groupedNotes)
        .map((note: any) => {
          const typeText = getTypeText(note.type as NoteType);

          if (note.dates.length > 1) {
            note.dates.sort((a: any, b: any) => {
              const dateA = new Date(a.year, a.month - 1, a.day);
              const dateB = new Date(b.year, b.month - 1, b.day);
              return dateA.getTime() - dateB.getTime();
            });
            const startDate = note.dates[0];
            const endDate = note.dates[note.dates.length - 1];
            const startDateObj = new Date(
              startDate.year,
              startDate.month - 1,
              startDate.day
            );
            const endDateObj = new Date(
              endDate.year,
              endDate.month - 1,
              endDate.day
            );

            const options: Intl.DateTimeFormatOptions = {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            };

            let formattedDateRange = '';
            if (
              startDate.year === endDate.year &&
              startDate.month === endDate.month
            ) {
              const startDay = startDateObj.toLocaleDateString('en-US', {
                day: 'numeric'
              });
              const endDay = endDateObj.toLocaleDateString('en-US', {
                day: 'numeric'
              });
              const monthYear = startDateObj.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              });
              formattedDateRange = `${startDay} - ${endDay} ${monthYear}`;
            } else if (startDate.year === endDate.year) {
              formattedDateRange = `${startDateObj.toLocaleDateString(
                'en-US',
                {
                  month: 'long',
                  day: 'numeric'
                }
              )} - ${endDateObj.toLocaleDateString('en-US', options)}`;
            } else {
              formattedDateRange = `${startDateObj.toLocaleDateString('en-US', options)} - ${endDateObj.toLocaleDateString(
                'en-US',
                options
              )}`;
            }

            return { ...note, date: formattedDateRange, typeText };
          } else {
            const date = note.dates[0];
            const dateObj = new Date(date.year, date.month - 1, date.day);
            const options: Intl.DateTimeFormatOptions = {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            };
            const formattedDate = dateObj.toLocaleDateString('en-US', options);
            return { ...note, date: formattedDate, typeText };
          }
        })
        .slice(0, 6);

      setUpcomingNotes(finalUpcomingNotes);
      updateNotesPerRow();
    } catch (err: any) {
      console.error('Failed to fetch calendar data:', err);
      setError(err.message);
      setUpcomingNotes([]);
      setCalendarEvents([]);
      setLoggedIn(false); // Đặt loggedIn thành false nếu có lỗi fetch
    } finally {
      setLoading(false);
      setInitialLoad(false); // Sau khi fetch xong, dù thành công hay thất bại, đây không còn là lần tải ban đầu
    }
  }, [areDatesContiguous, getTypeText, updateNotesPerRow]); // Thêm dependencies cho fetchData

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hàm render loading
  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center h-80 text-gray-500">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      <p className="mt-4 text-lg">{t('MyConferences.Loading_your_calendar')}</p>
    </div>
  );

  // LOGIC ĐIỀU CHỈNH CHÍNH:
  // 1. Nếu đang tải VÀ là lần tải ban đầu, hiển thị loading spinner.
  if (loading && initialLoad) {
    return <div className='container mx-auto p-4'>{renderLoading()}</div>;
  }

  // 2. Sau khi initialLoad đã hoàn tất, kiểm tra các trạng thái khác.
  if (!loggedIn) {
    if (isBanned) {
      logout({ callApi: true, preventRedirect: true });
      return (
        <div className='container mx-auto p-4 text-center'>
          <h2 className='text-xl font-bold text-red-600 mb-2'>{t('MyConferences.Account_Banned_Title')}</h2>
          <p className='mb-4'>{t('MyConferences.Account_Banned_Message')}</p>
          <Link href='/auth/login'>
            <Button variant='primary'>{t('Sign_In')}</Button>
          </Link>
        </div>
      );
    }
    return (
      <div className='container mx-auto p-4 text-center'>
        <h2 className='text-xl font-semibold mb-2'>{t('MyConferences.Login_Required_Title')}</h2>
        <p className='mb-4'>{t('MyConferences.Login_Required_Message')}</p>
        <Link href='/auth/login'>
          <Button variant='primary'>{t('Sign_In')}</Button>
        </Link>
      </div>
    );
  }

  // Xử lý lỗi sau khi đã kiểm tra đăng nhập và loading ban đầu
  if (error) {
    // Logic cho 'User is banned' đã được chuyển lên trên
    return <div className='container mx-auto p-4 text-red-500'>{error}</div>;
  }

  const getNoteWidth = () => {
    // Cần phải lấy giá trị notesPerRow hiện tại.
    // Nếu notesPerRow là một biến `let` cục bộ, nó sẽ không được lưu giữa các render.
    // Tốt hơn nên làm cho `notesPerRow` là một state hoặc memoized value.
    // Để đơn giản, hãy giữ nguyên logic của bạn, nhưng lưu ý điều này.
    let currentNotesPerRow = 3; 
    if (notesContainerRef.current) {
        const width = notesContainerRef.current.offsetWidth;
        if (width < 640) {
            currentNotesPerRow = 1;
        } else if (width < 1024) {
            currentNotesPerRow = 2;
        } else {
            currentNotesPerRow = 3;
        }
    }
    return `calc((100% / ${currentNotesPerRow}) - 1rem)`; // 1rem gap, adjust as needed
  };


  return (
    <div className='flex h-full w-full flex-col bg-background p-2 md:p-4'>
      {/* Dates Details Section */}
      <section className='mb-4 rounded-md bg-background px-4 pb-6 pt-4 shadow'>
        <h2 className='mb-4 text-lg font-semibold'>{t('Dates_details')}</h2>
        <ul className='flex flex-row gap-4'>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-teal-400'></div>
            <span className='text-sm '>{t('Conference')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-red-400'></div>
            <span className='text-sm '>{t('Submission')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-blue-400'></div>
            <span className='text-sm '>{t('Notification')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-orange-400'></div>
            <span className='text-sm '>{t('Camera_Ready')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-cyan-400'></div>
            <span className='text-sm '>{t('Registration')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-yellow-400'></div>
            <span className='text-sm '>{t('Your_notes')}</span>
          </li>
          <li className='flex items-center'>
            <div className='mr-2 h-4 w-4 rounded-full bg-gray-400'></div>
            <span className='text-sm '>{t('Other')}</span>
          </li>
        </ul>
      </section>
      <div className='flex flex-grow'>
        <div
          ref={leftSectionRef}
          style={{ width: `${leftWidth}%` }}
          className='overflow-auto p-2 md:p-4'
        >
          {/* Upcoming Notes Section */}
          <section className='mb-4 rounded-md bg-background p-2 shadow md:p-4'>
            <h2 className='mb-2 text-lg font-semibold'>
              {t('Upcoming_Notes')}
            </h2>
            {/* Hiển thị loading nếu không phải lần tải ban đầu nhưng vẫn đang tải */}
            {loading && !initialLoad && renderLoading()}

            {!loading && upcomingNotes.length === 0 ? (
              <p>{t('Nothing_important_dates_coming_up')}</p>
            ) : (
              // Chỉ hiển thị danh sách khi không còn loading HOẶC khi đã có dữ liệu
              !loading && (
                <div
                  ref={notesContainerRef}
                  className='flex flex-row flex-wrap gap-4'
                >
                  {upcomingNotes.map((note, index) => (
                    <div
                      key={index}
                      className={`
                        w-full rounded-md border p-4 shadow-md
                        ${notesPerRow === 2 ? `sm:w-[${getNoteWidth()}]` : ''}
                        ${notesPerRow === 3 ? `md:w-[${getNoteWidth()}]` : ''}
                        ${getEventTypeColor(note.type as NoteType)}
                      `}
                    >
                      <div className='flex h-full flex-col text-gray-700'>
                        <div className='h-3/4'>
                          <h3 className='text-lg font-semibold'>
                            {note.conference}
                          </h3>
                          <div className='mt-1 flex items-center'>
                            <span className='text-sm'>{note.location}</span>
                          </div>
                          <p className='mt-1 text-sm font-semibold'>
                            {note.name ? `${note.name}: ` : ''} {note.date}
                          </p>
                          <p className='mt-1 text-xs'>({note.typeText})</p>
                        </div>
                        <div className='flex h-1/4 items-end'>
                          <div className='mt-2 flex w-full items-center justify-between'>
                            <div className='rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700'>
                              {note.countdown}
                            </div>
                            <Link
                              href={{
                                pathname: '/conferences/detail',
                                query: { id: note.id }
                              }}
                            >
                              <Button className='hover: text-xs text-button'>
                                {t('More_details')}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </section>
        </div>

        {/* Resizer */}
        <div
          className={`cursor-col-resize  ${isResizing ? 'bg-blue-500' : 'bg-gray-300'}`}
          onMouseDown={startResizing}
          style={{ width: '5px' }}
        ></div>

        {/* Calendar Section */}
        <div
          ref={rightSectionRef}
          style={{ width: `calc(${100 - leftWidth}% - 3px)` }}
          className='overflow-auto p-4'
        >
          {/* Calendar có thể có loading riêng, hoặc bạn có thể kiểm soát nó ở đây */}
          {loading && !initialLoad ? renderLoading() : <Calendar calendarEvents={calendarEvents} />}
        </div>
      </div>
    </div>
  );
};

export default NoteTab;