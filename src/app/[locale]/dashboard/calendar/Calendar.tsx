import React, { useMemo, useRef, useEffect, useState } from 'react';
import DayNote, { CalendarEvent } from '../DayNote';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import useDateNavigation from '../../../../hooks/dashboard/calendar/useDateNavigation';
import useEventFiltering from '../../../../hooks/dashboard/calendar/useEventFiltering'; // Simplified hook
import useDialogControl from '../../../../hooks/dashboard/calendar/useDialogControl';
import useDatePickerControl from '../../../../hooks/dashboard/calendar/useDatePickerControl';
import useViewSwitching from '../../../../hooks/dashboard/calendar/useViewSwitching';

interface CalendarProps {
    calendarEvents: CalendarEvent[];
}

const Calendar: React.FC<CalendarProps> = ({ calendarEvents }) => {
    const dateNavigation = useDateNavigation();
    const { currentDate, setCurrentDate, goToPreviousMonth, goToNextMonth, goToPreviousDay, goToNextDay, goToPreviousWeek, goToNextWeek, goToToday, getWeek, getDaysInMonth, getFirstDayOfMonth } = dateNavigation;

    const dialogControl = useDialogControl();
    const { isDialogOpen, selectedDate, openDialogForDay, closeDialog, setSelectedDate } = dialogControl;

    const datePickerControl = useDatePickerControl();
    const { showDatePicker, toggleDatePicker, datePickerRef, setShowDatePicker } = datePickerControl;

    const viewSwitching = useViewSwitching();
    const { view, setView, showViewOptions, toggleViewOptions, viewOptionsRef, scrollToDate } = viewSwitching;

    const calendarRef = useRef<HTMLDivElement>(null);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const [highlightedDate, setHighlightedDate] = useState<Date | null>(null);
    const [allEvents, setAllEvents] = useState<CalendarEvent[]>(calendarEvents);

    // Get searchText and setSearchText from useEventFiltering
    const { searchText, setSearchText } = useEventFiltering(currentDate); // Simplified usage

      // Use useMemo for filtering *inside* Calendar.tsx
    const filteredEvents = useMemo(() => {
        const lowerCaseSearchText = searchText.toLowerCase();
        return allEvents.filter(event =>
            (event.conference && event.conference.toLowerCase().includes(lowerCaseSearchText)) ||
            (event.type && event.type.toLowerCase().includes(lowerCaseSearchText)) ||
            (event.title && event.title.toLowerCase().includes(lowerCaseSearchText))
        );
    }, [searchText, allEvents]);


    // Function to get day events, now using the *correct* filteredEvents
    const getDayEvents = (day: number, month: number = currentDate.getMonth() + 1, year: number = currentDate.getFullYear()): CalendarEvent[] => {
        return filteredEvents.filter(event => event.day === day && event.month === month && event.year === year);
    };

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

    const handleDateSelect = (date: Date) => {
      setCurrentDate(date);
      setView('day');
      setShowDatePicker(false);
    };

    useEffect(() => {
      scrollToDate(currentDate, view, calendarRef);
    }, [currentDate, view, scrollToDate]);

    useEffect(() => {
        setHighlightedDate(selectedDate);
    }, [selectedDate]);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const pickerDate = new Date(currentDate);

    const handleAddEvent = (newEvent: CalendarEvent) => {
        setAllEvents(prevEvents => [...prevEvents, newEvent]);
        closeDialog();
    };
    // Save allEvents to local storage when it changes
    useEffect(() => {
        localStorage.setItem('calendarEvents', JSON.stringify(allEvents));
    }, [allEvents]);

    return (
        <section className="pt-2 px-2 bg-white rounded-md shadow relative" ref={calendarRef}>
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 px-2">
                    {/* View Switcher - No Changes */}
                    <div className="relative inline-block text-left z-10" ref={viewOptionsRef}>
                        <button
                            type="button"
                            className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={toggleViewOptions}
                        >
                            {view.charAt(0).toUpperCase() + view.slice(1)}
                            <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        <div className={`origin-top-right absolute left-0 mt-2 w-24 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${showViewOptions ? '' : 'hidden'}`}>
                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <button onClick={() => { setView('day'); toggleViewOptions(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left" role="menuitem">Day</button>
                                <button onClick={() => { setView('week'); toggleViewOptions(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left" role="menuitem">Week</button>
                                <button onClick={() => { setView('month'); toggleViewOptions(); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left" role="menuitem">Month</button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons - No Changes */}
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
                            <div className="font-semibold text-lg w-36 text-center cursor-pointer"
                                onClick={toggleDatePicker}>
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

                {/* Search Input - No Changes */}
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

            {/* Date Picker - No Changes */}
            {showDatePicker && (
                <div ref={datePickerRef} className="absolute z-10 mt-2 bg-white rounded-md shadow-lg p-4" style={{ top: '50px', left: '50px' }}>
                    <div className="flex justify-between items-center mb-2">
                        <div className='text-center font-bold flex-1'>{monthNames[pickerDate.getMonth()]} {pickerDate.getFullYear()}</div>
                        <button onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="p-1 hover:bg-gray-200 rounded-full">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <button onClick={() => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="p-1 hover:bg-gray-200 rounded-full">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                            <div key={day} className="text-xs font-medium text-gray-500">{day}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {Array.from({ length: getFirstDayOfMonth(pickerDate) }).map((_, index) => (
                            <div key={`empty-${index}`} className="p-2"></div>
                        ))}
                        {Array.from({ length: getDaysInMonth(pickerDate) }).map((_, dayIndex) => {
                            const dayNumber = dayIndex + 1;
                            const date = new Date(pickerDate.getFullYear(), pickerDate.getMonth(), dayNumber);
                            const isCurrentDay = date.toDateString() === new Date().toDateString();

                            return (
                                <div
                                    key={dayNumber}
                                    className={`p-2 rounded-full cursor-pointer hover:bg-blue-200 ${isCurrentDay ? 'bg-blue-500 text-white' : ''}`}
                                    onClick={() => handleDateSelect(date)}
                                >
                                    {dayNumber}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

             {/* View Rendering - Pass filteredEvents, openDialogForDay, highlightedDate */}
            {view === 'month' && (
                <MonthView
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    daysInMonth={getDaysInMonth(currentDate)}
                    firstDayOfMonth={getFirstDayOfMonth(currentDate)}
                    getDayEvents={getDayEvents}
                    openDialogForDay={(day) => {
                        openDialogForDay(currentYear, currentMonth, day);
                        setHighlightedDate(new Date(currentYear, currentMonth, day));
                    }}
                    getEventTypeColor={getEventTypeColor}
                    highlightedDate={highlightedDate}
                />
            )}
            {view === 'week' && (
                <WeekView
                    currentDate={currentDate}
                    shortMonthNames={shortMonthNames}
                    getDayEvents={getDayEvents}
                    getEventTypeColor={getEventTypeColor}
                    openDialogForDay={(year, month, day) => {
                        openDialogForDay(year, month, day);
                        setHighlightedDate(new Date(year, month, day));
                    }}
                    highlightedDate={highlightedDate}
                />
            )}
            {view === 'day' && (
                <DayView
                    currentDate={currentDate}
                    getDayEvents={getDayEvents}
                    getEventTypeColor={getEventTypeColor}
                    openDialogForDay={(year, month, day) => {
                        openDialogForDay(year, month, day);
                        setHighlightedDate(new Date(year, month, day));
                    }}
                    highlightedDate={highlightedDate}
                />
            )}

            {/* DayNote Dialog - No Changes */}
            {isDialogOpen && selectedDate && (
                <DayNote
                    date={selectedDate}
                    events={getDayEvents(selectedDate.getDate(), selectedDate.getMonth() + 1, selectedDate.getFullYear())}
                    onClose={closeDialog}
                    onAddEvent={handleAddEvent}
                />
            )}
        </section>
    );
};

export default Calendar;