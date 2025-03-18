// Calendar.tsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import DayNote, { CalendarEvent } from './DayNote';

interface CalendarProps {
  calendarEvents: CalendarEvent[];
}

type ViewType = 'day' | 'week' | 'month'; // Define the view types

const Calendar: React.FC<CalendarProps> = ({ calendarEvents }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>(calendarEvents);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<ViewType>('month'); // State to control the view type
  const [showViewOptions, setShowViewOptions] = useState(false); // State to control ViewType dropdown

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const datePickerRef = useRef<HTMLDivElement>(null);
  const viewOptionsRef = useRef<HTMLDivElement>(null); // Ref for the view options

  const typeColors = useMemo(() => {
    return {
      conferenceDates: 'bg-teal-500',
      submissionDate: 'bg-red-500',
      notificationDate: 'bg-blue-500',
      cameraReadyDate: 'bg-orange-500',
      registrationDate: 'bg-cyan-500',
    };
  }, []);

  const getEventTypeColor = (type: string) => {
    return typeColors[type as keyof typeof typeColors] || 'bg-gray-400';
  };

  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  };

  const goToPreviousDay = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() - 1));
  };

  const goToNextDay = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 1));
  };

  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() - 7));
  };

  const goToNextWeek = () => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 7));
  };


  const goToToday = () => {
    setCurrentDate(new Date());
    setShowDatePicker(false);
  };

  const openDialogForDay = (day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
  };

  const getDayEvents = (day: number, month: number = currentMonth + 1, year: number = currentYear): CalendarEvent[] => {

    return filteredEvents.filter(
      event => event.day === day && event.month === month && event.year === year
    );
  };


  const handleDateSelect = (day: number) => {
    setCurrentDate(new Date(currentYear, currentMonth, day));
    setShowDatePicker(false);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const toggleViewOptions = () => {
    setShowViewOptions(!showViewOptions);
  }

  const scrollToDate = (date: Date) => {
    if (calendarRef.current) {
      // Day view and week view scroll adjustment
      if (view === 'day' || view === 'week') {
        const containerRect = calendarRef.current.getBoundingClientRect();
        calendarRef.current.scrollTop = 0; // Reset scroll top
        const timeSlotHeight = 48; // Height of each time slot, you may need to adjust it
        const hour = date.getHours();

        const scrolltop = (hour * timeSlotHeight) - (containerRect.height / 4);
        calendarRef.current.scrollTo({
          top: scrolltop,
          behavior: 'smooth'
        });
      } else {
        // Month view
        const dayElement = calendarRef.current.querySelector(`[data-day="${date.getDate()}"]`);
        if (dayElement) {
          const containerRect = calendarRef.current.getBoundingClientRect();
          const elementRect = dayElement.getBoundingClientRect();
          const scrollLeft = elementRect.left - containerRect.left + calendarRef.current.scrollLeft - (containerRect.width / 2) + (elementRect.width / 2);

          calendarRef.current.scrollTo({
            left: scrollLeft,
            behavior: 'smooth'
          });
        }
      }
    }
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewOptionsRef.current && !viewOptionsRef.current.contains(event.target as Node)) {
        setShowViewOptions(false);
      }
    };

    if (showViewOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showViewOptions]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  useEffect(() => {
    const lowerCaseSearchText = searchText.toLowerCase();
    const filtered = calendarEvents.filter(event =>
      event.conference.toLowerCase().includes(lowerCaseSearchText) ||
      event.type.toLowerCase().includes(lowerCaseSearchText)
    );
    setFilteredEvents(filtered);

    if (lowerCaseSearchText.length > 0 && filtered.length > 0) {
      let closestEvent = filtered[0];
      let closestDiff = Math.abs(new Date(closestEvent.year, closestEvent.month - 1, closestEvent.day).getTime() - currentDate.getTime());

      for (let i = 1; i < filtered.length; i++) {
        const eventDate = new Date(filtered[i].year, filtered[i].month - 1, filtered[i].day);
        const diff = Math.abs(eventDate.getTime() - currentDate.getTime());
        if (diff < closestDiff) {
          closestDiff = diff;
          closestEvent = filtered[i];
        }
      }
      const eventDate = new Date(closestEvent.year, closestEvent.month - 1, closestEvent.day);
      setCurrentDate(eventDate);
    }
  }, [searchText, calendarEvents]);

  useEffect(() => {
    scrollToDate(currentDate);
  }, [currentDate, view]); // Add view to the dependency array


  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Get Week Number
  const getWeek = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000; // 86400000 milliseconds in a day
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Render functions for different views
  const renderMonthView = () => (
    <div className="grid grid-cols-7 text-center">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="font-medium text-gray-700">{day}</div>
      ))}

      {Array.from({ length: firstDayOfMonth }).map((_, index) => (
        <div key={`empty-${index}`} className="p-1"></div>
      ))}

      {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
        const dayNumber = dayIndex + 1;
        const dayEvents = getDayEvents(dayNumber);

        return (
          <div
            key={dayNumber}
            className="py-4 border border-gray-200 hover:bg-gray-50 cursor-pointer"
            onClick={() => openDialogForDay(dayNumber)}
            data-day={dayNumber}
          >
            <div className="text-sm text-gray-900 pb-8">{dayNumber}</div>
            <div className="flex flex-col gap-0.5 mt-0.5">
              {dayEvents.map((event, index) => (
                <div
                  key={`${event.conferenceId}-${index}`}
                  className={`text-xs py-0.5 px-1 ${getEventTypeColor(event.type)} text-white truncate`}
                  title={event.conference}
                >
                  {event.conference.split('-')[0].trim()}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay()); // Start of the week (Sunday)
    const weekEvents = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekEvents.push(...getDayEvents(day.getDate(), day.getMonth() + 1, day.getFullYear()));
    }

    return (
      <div className="grid grid-cols-7 text-center border-b">
        {/* Day Headers */}
        {Array.from({ length: 7 }).map((_, i) => {
          const day = new Date(weekStart);
          day.setDate(weekStart.getDate() + i);
          return (
            <div key={i} className="font-medium text-gray-700 border-r last:border-r-0">
              {shortMonthNames[day.getMonth()]} {day.getDate()}
            </div>
          );
        })}
        {/* Time Slots (Rows) */}
        <div className="col-span-7 grid grid-rows-24 relative" style={{ gridTemplateRows: 'repeat(24, 48px)' }}>
          {/* Time Labels */}
          {Array.from({ length: 24 }).map((_, hour) => (
            <div key={hour} className="text-xs text-gray-500 absolute" style={{ top: `${hour * 48}px` }}>
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
          ))}

          {/* Event Display */}

          {weekEvents.map((event, index) => {
            const eventStart = new Date(event.year, event.month - 1, event.day);
            const dayIndex = (eventStart.getDay() - weekStart.getDay() + 7) % 7; // 0 for Sun, 1 for Mon, ...
            const topOffset = eventStart.getHours() * 48;  // 48px per hour
            return (
              <div
                key={`${event.conferenceId}-${index}`}
                className={`absolute  ${getEventTypeColor(event.type)} text-white text-xs p-1 rounded`}
                style={{
                  top: `${topOffset}px`,
                  left: `${(100 / 7) * dayIndex}%`,  // Divide the week into 7 equal parts
                  width: `${100 / 7}%`, // Event width
                  height: '48px'
                }}
                title={event.conference}
              >
                {event.conference.split('-')[0].trim()}
              </div>

            )
          })}

        </div>
      </div>
    )
  };

  const renderDayView = () => {

    const dayEvents = getDayEvents(currentDate.getDate(), currentDate.getMonth() + 1, currentDate.getFullYear());
    return (
      <div className="relative h-[1152px]"> {/* Container for 24 hours (24 * 48px) */}
        {/* Time labels */}
        {Array.from({ length: 24 }).map((_, hour) => (
          <div key={hour} className="text-xs text-gray-500 absolute" style={{ top: `${hour * 48}px` }}>
            {/* 12 AM, 1 AM - 11 AM, 12 PM, 1 PM - 11 PM */}
            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
          </div>
        ))}

        {/* Horizontal lines for each hour */}
        {Array.from({ length: 24 }).map((_, hour) => (
          <div key={`line-${hour}`} className="absolute border-t border-gray-300 w-full" style={{ top: `${hour * 48}px` }}></div>
        ))}

        {/* Display events for the selected day */}
        {dayEvents.map((event, index) => (
          <div
            key={`${event.conferenceId}-${index}`}
            className={`absolute left-14 ${getEventTypeColor(event.type)} text-white py-0.5 px-1 text-xs rounded`}
            style={{ top: `${currentDate.getHours() * 48}px`, width: 'calc(100% - 56px)', height: '48px' }} // Start at current hour, occupy full width minus time label
            title={event.conference}
          >
            {event.conference.split('-')[0].trim()}
          </div>
        ))}
      </div>
    );

  };



  return (
    <section className="pt-2 bg-white rounded-md shadow relative" ref={calendarRef}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 px-2">
          {/* View Switcher */}
          <div className="relative inline-block text-left" ref={viewOptionsRef}>
            <button
              type="button"
              className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={toggleViewOptions}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)} {/* Capitalize the first letter */}
              <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <div className={`origin-top-right absolute left-0 mt-2 w-24 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${showViewOptions ? '' : 'hidden'}`}>
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button onClick={() => { setView('day'); setShowViewOptions(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left" role="menuitem">Day</button>
                <button onClick={() => { setView('week'); setShowViewOptions(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left" role="menuitem">Week</button>
                <button onClick={() => { setView('month'); setShowViewOptions(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left" role="menuitem">Month</button>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          {view === 'month' && (
            <>
              <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-200 rounded-full">
                <svg className="svg-inline--fa fa-arrow-left fa-w-14" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="" style={{ width: '14px', height: '14px', color: 'black' }}>
                  <path fill="currentColor" d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"></path>
                </svg>
              </button>
              <div
                className="font-semibold text-lg w-36 text-center cursor-pointer relative"
                onClick={toggleDatePicker}
              >
                {monthNames[currentMonth]} {currentYear}
              </div>
              <button onClick={goToNextMonth} className="p-1 hover:bg-gray-200 rounded-full">
                <svg className="svg-inline--fa fa-arrow-right fa-w-14" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="" style={{ width: '14px', height: '14px', color: 'black' }}>
                  <path fill="currentColor" d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0-33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
                </svg>
              </button>
            </>
          )}

          {view === 'day' && (
            <>
              <button onClick={goToPreviousDay} className="p-1 hover:bg-gray-200 rounded-full">
                <svg className="svg-inline--fa fa-arrow-left fa-w-14" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="" style={{ width: '14px', height: '14px', color: 'black' }}>
                  <path fill="currentColor" d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"></path>
                </svg>
              </button>
              <div className="font-semibold text-lg w-36 text-center">
                {monthNames[currentMonth]} {currentDate.getDate()}, {currentYear}
              </div>
              <button onClick={goToNextDay} className="p-1 hover:bg-gray-200 rounded-full">
                <svg className="svg-inline--fa fa-arrow-right fa-w-14" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="" style={{ width: '14px', height: '14px', color: 'black' }}>
                  <path fill="currentColor" d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0-33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
                </svg>
              </button>
            </>
          )}

          {view === 'week' && (
            <>
              <button onClick={goToPreviousWeek} className="p-1 hover:bg-gray-200 rounded-full">
                <svg className="svg-inline--fa fa-arrow-left fa-w-14" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="" style={{ width: '14px', height: '14px', color: 'black' }}>
                  <path fill="currentColor" d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"></path>
                </svg>
              </button>
              <div className="font-semibold text-lg w-36 text-center">
                Week {getWeek(currentDate)}, {currentYear}
              </div>
              <button onClick={goToNextWeek} className="p-1 hover:bg-gray-200 rounded-full">
                <svg className="svg-inline--fa fa-arrow-right fa-w-14" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="" style={{ width: '14px', height: '14px', color: 'black' }}>
                  <path fill="currentColor" d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0-33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
                </svg>
              </button>
            </>
          )}
        </div>

        <div className="flex items-center mx-auto">
          <input
            type="text"
            placeholder="Search events..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="p-2 border rounded"
          />
        </div>

        <button onClick={goToToday} className="mx-2 px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300">Today</button>
      </div>

      {showDatePicker && (
        <div ref={datePickerRef} className="absolute z-10 mt-2 bg-white rounded-md shadow-lg p-4" style={{ top: '50px', left: '50px' }}>
          <div className="flex justify-between items-center mb-2">
            <div className='text-center font-bold flex-1'>{monthNames[currentMonth]} {currentYear}</div>
            <button onClick={goToPreviousMonth} className="p-1 hover:bg-gray-200 rounded-full">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <button onClick={goToNextMonth} className="p-1 hover:bg-gray-200 rounded-full">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-xs font-medium text-gray-500">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
              const dayNumber = dayIndex + 1;
              const isCurrentDay = dayNumber === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
              return (
                <div
                  key={dayNumber}
                  className={`p-2 rounded-full cursor-pointer hover:bg-blue-200 ${isCurrentDay ? 'bg-blue-500 text-white' : ''}`}
                  onClick={() => handleDateSelect(dayNumber)}
                >
                  {dayNumber}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Conditionally render based on the selected view */}
      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}

      {isDialogOpen && selectedDate && (
        <DayNote
          date={selectedDate}
          events={getDayEvents(selectedDate.getDate())}
          onClose={closeDialog}
        />
      )}
    </section>
  );
};

export default Calendar;