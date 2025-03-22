import { ConferenceResponse } from "@/src/models/response/conference.response";
import * as ics from 'ics';

const formatCalendarDate = (date: string | undefined): string => {
    if (!date) return 'TBD';
    date = date.slice(0, -1); //Remove timezone
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-CA');
  };


const createICalendarEvent = (conference: ConferenceResponse | null) => {
    if (!conference) return;
    const conferenceDates = conference.dates?.find(date => date.type === 'conferenceDates');
    const startDate = formatCalendarDate(conferenceDates?.fromDate);
    const endDate = formatCalendarDate(conferenceDates?.toDate);
    const startDateObj = startDate ? new Date(startDate + 'T00:00:00') : new Date(); // Default to current date if not found
    const endDateObj = endDate ? new Date(endDate + 'T23:59:59') : new Date();     // Default to current date if not found


    const start = [
        startDateObj.getFullYear(),
        startDateObj.getMonth() + 1, //getMonth() trả về 0-11
        startDateObj.getDate(),
        startDateObj.getHours(),
        startDateObj.getMinutes(),
    ];

    const end = [
        endDateObj.getFullYear(),
        endDateObj.getMonth() + 1,
        endDateObj.getDate(),
        endDateObj.getHours(),
        endDateObj.getMinutes(),
    ];
    const event: ics.EventAttributes = {
        start: start as ics.DateArray,
        end: end as ics.DateArray,
        title: conference.conference.title,
        description: `📢 ${conference.conference.title}\n📅 Thời gian: ${startDate && endDate ? `${startDate} - ${endDate}` : 'Dates not available'}\n📍 Địa điểm: ${conference.locations.address}\n🔗 Chi tiết: ${conference.organization.link}`,
        location: conference.locations.address,
        url: conference.organization.link,
        organizer: { name: 'Conference Organizer' }, // Add organizer info if available
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
    };

    const { error, value } = ics.createEvent(event);

    if (error) {
        console.error('Error creating iCalendar event:', error);
        return null; // Or handle the error appropriately
    }
    return value; // This is the iCalendar data as a string.
}

export default createICalendarEvent;

