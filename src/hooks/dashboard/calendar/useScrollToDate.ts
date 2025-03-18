// hooks/useScrollToDate.ts
import { useEffect, RefObject } from 'react';

type ViewType = 'day' | 'week' | 'month';
const useScrollToDate = (calendarRef: RefObject<HTMLDivElement>, currentDate: Date, view: ViewType) => {

    const scrollToDate = (date: Date) => {
        if (calendarRef.current) {
            if (view === 'day' || view === 'week') {
                const containerRect = calendarRef.current.getBoundingClientRect();
                calendarRef.current.scrollTop = 0;
                const timeSlotHeight = 48;
                const hour = date.getHours();

                const scrolltop = (hour * timeSlotHeight) - (containerRect.height/4);
                calendarRef.current.scrollTo({
                    top: scrolltop,
                    behavior: 'smooth'
                });
            } else {
                const dayElement = calendarRef.current.querySelector(`[data-day="${date.getDate()}"]`);
                if (dayElement) {
                    const containerRect = calendarRef.current.getBoundingClientRect();
                    const elementRect = dayElement.getBoundingClientRect();
                    const scrollLeft = elementRect.left - containerRect.left + calendarRef.current.scrollLeft - (containerRect.width / 2) + (elementRect.width/2);

                    calendarRef.current.scrollTo({
                        left: scrollLeft,
                        behavior: 'smooth'
                    });
                }
            }
        }
    };

    useEffect(() => {
      scrollToDate(currentDate);
    }, [currentDate, view]);
}

export default useScrollToDate;