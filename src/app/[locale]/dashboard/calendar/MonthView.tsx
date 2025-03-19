// MonthView.tsx
import React from 'react';
import { CalendarEvent } from './Calendar';

interface MonthViewProps {
    currentMonth: number;
    currentYear: number;
    daysInMonth: number;
    firstDayOfMonth: number;
    getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[];
    getEventTypeColor: (type: string) => string;
    highlightedDate: Date | null;
    calendarRef:  React.RefObject<HTMLElement>; // Add calendarRef prop

}

const MonthView: React.FC<MonthViewProps> = ({
    currentMonth,
    currentYear,
    daysInMonth,
    firstDayOfMonth,
    getDayEvents,
    getEventTypeColor,
    highlightedDate,
    calendarRef // Receive calendarRef
}) => {
    return (
        <div className="grid grid-cols-7 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="font-medium text-gray-700">{day}</div>
            ))}

            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="p-1"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
                const dayNumber = dayIndex + 1;
                const dayEvents = getDayEvents(dayNumber, currentMonth + 1, currentYear);
                const isHighlighted = highlightedDate?.getDate() === dayNumber &&
                                      highlightedDate?.getMonth() === currentMonth &&
                                      highlightedDate?.getFullYear() === currentYear;


                return (
                    <div
                        key={dayNumber}
                        className={`py-4 border border-gray-200 hover:bg-gray-50 cursor-pointer ${isHighlighted ? 'bg-blue-100' : ''}`}
                        onClick={(e) => {
                            const date = new Date(currentYear, currentMonth, dayNumber);
                            if(e.target instanceof HTMLElement){
                                const closestDiv = (e.target as HTMLElement).closest('div[data-day]');
                                 if (closestDiv) {
                                    // element is click in div has data-day attribute
                                    // open add note dialog.
                                    calendarRef.current?.dispatchEvent(new CustomEvent('open-add-note', {
                                        bubbles: true,
                                        detail: { date: date, event: e }
                                    }));

                                 }
                            }
                        }} // Pass click event
                        data-day={dayNumber}
                    >
                        <div className="text-sm text-gray-900 pb-8">{dayNumber}</div>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                            {dayEvents.map((event, index) => (
                                <div
                                     key={`${event.conferenceId}-${index}`}
                                    className={`text-xs py-0.5 px-1 ${getEventTypeColor(event.type)} text-white truncate cursor-pointer`}
                                    title={event.conference}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                         if(e.target instanceof HTMLElement){
                                             calendarRef.current?.dispatchEvent(new CustomEvent('open-event-details', {
                                                bubbles: true,
                                                detail: { event: event, clickEvent: e }
                                            }));
                                         }
                                    }} // Pass event data and click event
                                >
                                    {event.title || event.conference.split('-')[0].trim()} {/* Display title or conference */}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MonthView;