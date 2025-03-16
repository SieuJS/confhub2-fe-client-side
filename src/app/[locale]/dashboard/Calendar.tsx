// Calendar.tsx
import React, { useState } from 'react';
import DayNote, { CalendarEvent } from './DayNote'; // Import DayNote and CalendarEvent from DayNote.tsx

interface CalendarProps {
  calendarEvents: CalendarEvent[];
}

const Calendar: React.FC<CalendarProps> = ({ calendarEvents }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // To keep track of selected day
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = monthNames[currentMonth];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // Day of the week of the first day (Sunday is 0)

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Submission date': return 'bg-red-500';
      case 'Notification date': return 'bg-blue-500';
      case 'Camera ready date': return 'bg-orange-500';
      case 'Conference date': return 'bg-teal-500';
      default: return 'bg-gray-400'; // Default color
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToPreviousYear = () => {
    setCurrentDate(new Date(currentYear - 1, currentMonth, 1));
  };

  const goToNextYear = () => {
    setCurrentDate(new Date(currentYear + 1, currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const openDialogForDay = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
  };

  const getDayEvents = (day: number): CalendarEvent[] => {
    const displayMonth = currentMonth + 1;
    return calendarEvents.filter(
      event => event.day === day && event.month === displayMonth && event.year === currentYear
    );
  };


  return (
    <section className="p-4 bg-white rounded-md shadow relative"> {/* Make section relative for absolute positioning of dialog */}
      <div className="flex justify-between items-center mb-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm">
              Add Schedule
          </button>

          <div className="flex items-center gap-2">
            <button onClick={goToPreviousMonth} className=" p-1 hover:bg-gray-200 rounded-full transition-colors duration-200">
              <svg className="svg-inline--fa fa-arrow-left fa-w-14" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-left" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="" style={{ width: '14px', height: '14px', color: 'black' }}>
                <path fill="currentColor" d="M257.5 445.1l-22.2 22.2c-9.4 9.4-24.6 9.4-33.9 0L7 273c-9.4-9.4-9.4-24.6 0-33.9L201.4 44.7c9.4-9.4 24.6-9.4 33.9 0l22.2 22.2c9.5 9.5 9.3 25-.4 34.3L136.6 216H424c13.3 0 24 10.7 24 24v32c0 13.3-10.7 24-24 24H136.6l120.5 114.8c9.8 9.3 10 24.8.4 34.3z"></path>
              </svg>
            </button>
            <div className="font-semibold text-lg w-36 text-center">{monthName} {currentYear}</div>
            <button onClick={goToNextMonth}  className=" p-1 hover:bg-gray-200 rounded-full transition-colors duration-200">
              <svg className="svg-inline--fa fa-arrow-right fa-w-14" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="arrow-right" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="" style={{ width: '14px', height: '14px', color: 'black' }}>
                <path fill="currentColor" d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0-33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
              </svg>
            </button>
          </div>
          <button onClick={goToToday} className="mx-1 px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300">Today</button>
          
          
        
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {/* Weekday Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={index} className="py-1 font-medium text-gray-700">{day}</div>
        ))}

        {/* Empty cells before the first day of the month */}
        {Array.from({ length: firstDayOfMonth }).map((_, index) => (
          <div key={`empty-${index}`}></div>
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
          const dayNumber = dayIndex + 1;
          const dayEvents = getDayEvents(dayNumber);

          return (
            <div
              key={dayNumber}
              className="p-1 border border-gray-200 hover:bg-gray-50 cursor-pointer"
              onClick={() => openDialogForDay(dayNumber)}
            >
              <div className="text-sm text-gray-900">{dayNumber}</div>
              {dayEvents.length > 0 && dayEvents.map((event, eventIndex) => (
                <div key={eventIndex} className={`text-xs py-0.5 mt-0.5 rounded ${getEventTypeColor(event.type)} text-white`} title={`${event.conference} - ${event.type}`}>
                  {event.conference.split(' - ')[0]}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Day Dialog */}
      {isDialogOpen && selectedDate && (
        <DayNote // Changed component name to DayNote
          date={selectedDate}
          events={getDayEvents(selectedDate.getDate())}
          onClose={closeDialog}
        />
      )}
    </section>
  );
};

export default Calendar;