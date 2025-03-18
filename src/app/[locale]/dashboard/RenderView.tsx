// hooks/useRenderView.ts
import { CalendarEvent } from "./DayNote";

type ViewType = 'day' | 'week' | 'month';

interface RenderViewResult {
    renderMonthView: () => JSX.Element;
    renderWeekView: () => JSX.Element;
    renderDayView: () => JSX.Element;
}

const useRenderView = (
    view: ViewType,
    currentDate: Date,
    firstDayOfMonth: number,
    daysInMonth: number,
    getDayEvents: (day: number, month?: number, year?: number) => CalendarEvent[],
    openDialogForDay: (day: number, currentMonth: number, currentYear: number) => void,
    getEventTypeColor: (type: string) => string,
    getWeek: (date: Date) => number

): RenderViewResult => {

    const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

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
                        onClick={() => openDialogForDay(dayNumber, currentMonth, currentYear)}
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
                        <div key={hour} className="text-xs text-gray-500" style={{ top: `${hour * 48}px` }}>
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
    return { renderMonthView, renderWeekView, renderDayView };
}

export default useRenderView;