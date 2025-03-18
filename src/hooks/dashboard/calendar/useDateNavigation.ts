// hooks/useDateNavigation.ts
import { useState, useCallback } from 'react';

interface DateNavigationResult {
  currentDate: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToToday: () => void;
  handleDateSelect: (day: number) => void;
  setCurrentDate: (date: Date) => void;
    getWeek: (date: Date) => number;
}

const useDateNavigation = (initialDate: Date = new Date()): DateNavigationResult => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
  }, []);

  const goToPreviousDay = useCallback(() => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() - 1));
  }, []);

  const goToNextDay = useCallback(() => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 1));
  }, []);

    const goToPreviousWeek = useCallback(() => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() - 7));
    }, []);

    const goToNextWeek = useCallback(() => {
         setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), prevDate.getDate() + 7));
    }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleDateSelect = useCallback((day: number) => {
    setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth(), day));
  }, []);

    const getWeek = useCallback((date: Date) => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }, []);

  return {
    currentDate,
    goToPreviousMonth,
    goToNextMonth,
    goToPreviousDay,
    goToNextDay,
    goToPreviousWeek,
    goToNextWeek,
    goToToday,
    handleDateSelect,
    setCurrentDate,
      getWeek
  };
};

export default useDateNavigation;