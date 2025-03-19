// DayView.tsx
import React from 'react';
import { CalendarEvent } from './Calendar';

interface DayViewProps {
    currentDate: Date;
    getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[];
    getEventTypeColor: (type: string) => string;
    highlightedDate: Date | null;
    calendarRef: React.RefObject<HTMLElement>; // Add calendarRef prop
}

const DayView: React.FC<DayViewProps> = ({ currentDate, getDayEvents, getEventTypeColor, highlightedDate, calendarRef }) => {
    const dayNumber = currentDate.getDate();
    const dayEvents = getDayEvents(dayNumber, currentDate.getMonth() + 1, currentDate.getFullYear());
    const isHighlighted = highlightedDate?.toDateString() === currentDate.toDateString();

    return (
        <div
            className={`py-4 border border-gray-200 hover:bg-gray-50 cursor-pointer ${isHighlighted ? 'bg-blue-100' : ''}`}
             onClick={(e) => {
                if(e.target instanceof HTMLElement){
                    const closestDiv = (e.target as HTMLElement).closest('div[data-day]');
                        if (closestDiv) {
                        // element is click in div has data-day attribute
                        // open add note dialog.
                        calendarRef.current?.dispatchEvent(new CustomEvent('open-add-note', {
                            bubbles: true,
                            detail: { date: currentDate, event: e }
                        }));

                        }
                    }
                }} // Pass the full date and click event
                data-day={dayNumber}
        >
            <div className="text-center text-sm text-gray-900 pb-8">
                {currentDate.toLocaleDateString()}
            </div>
            <div className="flex flex-col gap-0.5 mt-0.5 items-center">
                {dayEvents.map((event, index) => (
                    <div
                        key={`${event.conferenceId}-${index}`}
                        className={`text-xs py-0.5 px-1 ${getEventTypeColor(event.type)} text-white truncate w-full text-center cursor-pointer`} // Added cursor-pointer
                        title={event.conference}
                        onClick={(e) => {
                             e.stopPropagation();
                            if(e.target instanceof HTMLElement){
                                calendarRef.current?.dispatchEvent(new CustomEvent('open-event-details', {
                                    bubbles: true,
                                    detail: { event: event, clickEvent: e }
                                }));
                            }
                        }} // Handle event click
                    >
                        {event.title || event.conference.split('-')[0].trim()}  {/* Display title or conference */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DayView;