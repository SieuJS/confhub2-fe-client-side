// hooks/useAddToExtenalCalendar.ts
import { ConferenceResponse } from '../../models/response/conference.response'; // Adjust path

const formatCalendarDate = (date: string | undefined): string => {
    if (!date) return 'TBD';
    date = date.slice(0, -1); //Remove timezone
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-CA');
  };

const  createGoogleCalendarLink = (conference: ConferenceResponse | null) => {
    if (!conference) return;
    const conferenceDates = conference.dates?.find(date => date.type === 'conferenceDates');
    const startDate = formatCalendarDate(conferenceDates?.fromDate);
    const endDate = formatCalendarDate(conferenceDates?.toDate);
    
    const startDateObj = startDate ? new Date(startDate + 'T00:00:00') : new Date(); // Default to current date if not found
    const endDateObj = endDate ? new Date(endDate + 'T23:59:59') : new Date();     // Default to current date if not found


    const start = startDateObj.toISOString().replace(/-|:|\.\d+/g, '');
    const end = endDateObj.toISOString().replace(/-|:|\.\d+/g, '');

    const details = `📢 ${conference.conference?.title}\n📅 Thời gian: ${startDate && endDate ? `${(startDate)} - ${(endDate)}` : 'Dates not available'}\n📍 Địa điểm: ${conference?.locations.address}\n🔗 Chi tiết: ${conference.organization.link}`;


    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: conference.conference?.title,
        dates: `${start}/${end}`,
        details: details,
        location: conference?.locations.address,
        trp: 'false', // Optional: Show/hide "Add to my calendar" button (true/false)
        sprop: `website:${conference.organization.link}`, //Optional. Good practice
        // ctz: 'Asia/Ho_Chi_Minh', // Time zone (optional, but recommended!)
    });
    return `https://www.google.com/calendar/render?${params.toString()}`
}


    

export default createGoogleCalendarLink;
