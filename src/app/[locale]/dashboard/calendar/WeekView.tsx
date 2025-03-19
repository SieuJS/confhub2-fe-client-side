// WeekView.tsx
import React from 'react';
import { CalendarEvent } from '../DayNote';

interface WeekViewProps {
    currentDate: Date;
    shortMonthNames: string[];
    getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[];
    getEventTypeColor: (type: string) => string;
    openDialogForDay: (year: number, month: number, day: number) => void;
    highlightedDate: Date | null; // Prop for highlighting
}

const WeekView: React.FC<WeekViewProps> = ({
    currentDate,
    shortMonthNames,
    getDayEvents,
    getEventTypeColor,
    openDialogForDay,
    highlightedDate
}) => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Go to the beginning of the week (Sunday)

    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
    }

    return (
      <div className="grid grid-cols-7 text-center">
        {days.map((day) => {
          const dayNumber = day.getDate();
          const dayEvents = getDayEvents(dayNumber, day.getMonth() + 1, day.getFullYear());
          const isHighlighted = highlightedDate?.toDateString() === day.toDateString();

          return (
            <div
              key={day.toISOString()}
              className={`py-4 border border-gray-200 hover:bg-gray-50 cursor-pointer ${
                isHighlighted ? 'bg-blue-100' : ''
              }`} // Apply highlight
              onClick={() => openDialogForDay(day.getFullYear(), day.getMonth(), dayNumber)}
            >
              <div className="text-sm text-gray-900 pb-8">
                {shortMonthNames[day.getMonth()]} {dayNumber}
              </div>
              <div className="flex flex-col gap-0.5 mt-0.5">
                {dayEvents.map((event, index) => (
                  <div
                    key={`${event.conferenceId}-${index}`}
                    className={`text-xs py-0.5 px-1 ${getEventTypeColor(
                      event.type
                    )} text-white truncate`}
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

export default WeekView;