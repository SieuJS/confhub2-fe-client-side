// MonthView.tsx
import React from 'react';
import { CalendarEvent } from '../DayNote';

interface MonthViewProps {
    currentMonth: number;
    currentYear: number;
    daysInMonth: number;
    firstDayOfMonth: number;
    getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[];
    openDialogForDay: (day: number) => void;
    getEventTypeColor: (type: string) => string;
    highlightedDate: Date | null; // Prop for highlighting
}

const MonthView: React.FC<MonthViewProps> = ({
    currentMonth,
    currentYear,
    daysInMonth,
    firstDayOfMonth,
    getDayEvents,
    openDialogForDay,
    getEventTypeColor,
    highlightedDate
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
                        className={`py-4 border border-gray-200 hover:bg-gray-50 cursor-pointer ${isHighlighted ? 'bg-blue-100' : ''}`} // Apply highlight
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
};

export default MonthView;