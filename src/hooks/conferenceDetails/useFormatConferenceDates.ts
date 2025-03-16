// hooks/useFormatConferenceDates.ts

const useFormatConferenceDates = (dates: { type: string; fromDate?: string; toDate?: string; }[] | undefined) => {
    const conferenceDate = dates?.find(date => date.type === 'conferenceDates');
    const fromDateStr = conferenceDate?.fromDate ?? '';
    const toDateStr = conferenceDate?.toDate ?? '';
  
    const fromDateFormatted = fromDateStr ? new Date(fromDateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ') : 'TBD';
    const toDateFormatted = toDateStr ? new Date(toDateStr).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, ' ') : 'TBD';
    const dateDisplay = fromDateFormatted === 'TBD' || toDateFormatted === 'TBD' ? 'TBD' : `${fromDateFormatted.slice(0, 6)} - ${toDateFormatted}`;
  
    return { dateDisplay };
  };
  export default useFormatConferenceDates;