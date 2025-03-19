// DayView.tsx
import React from 'react';
import { CalendarEvent } from '../DayNote';

interface DayViewProps {
    currentDate: Date;
    getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[];
    getEventTypeColor: (type: string) => string;
    openDialogForDay: (year: number, month: number, day: number) => void;
     highlightedDate: Date | null; // Prop for highlighting
}

const DayView: React.FC<DayViewProps> = ({ currentDate, getDayEvents, getEventTypeColor, openDialogForDay, highlightedDate }) => {
    const dayNumber = currentDate.getDate();
    const dayEvents = getDayEvents(dayNumber, currentDate.getMonth() + 1, currentDate.getFullYear());
    const isHighlighted = highlightedDate?.toDateString() === currentDate.toDateString();


    return (
        <div
            className={`py-4 border border-gray-200 hover:bg-gray-50 cursor-pointer ${isHighlighted ? 'bg-blue-100' : ''}`} // Apply highlight
            onClick={() => openDialogForDay(currentDate.getFullYear(), currentDate.getMonth(), dayNumber)}
        >
            <div className="text-center text-sm text-gray-900 pb-8">
                {currentDate.toLocaleDateString()}
            </div>
            <div className="flex flex-col gap-0.5 mt-0.5 items-center">
                {dayEvents.map((event, index) => (
                    <div
                        key={`${event.conferenceId}-${index}`}
                        className={`text-xs py-0.5 px-1 ${getEventTypeColor(event.type)} text-white truncate w-full text-center`} // Added w-full and text-center
                        title={event.conference}
                    >
                        {event.conference.split('-')[0].trim()}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DayView;