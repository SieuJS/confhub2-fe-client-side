// src/hooks/useDateSelection.ts
import { useState, useRef, useEffect } from 'react';

interface UseDateSelectionReturn {
  selectedDate: Date | null;
  isDialogOpen: boolean;
  showDatePicker: boolean;
  openDialogForDay: (day: number) => void;
  closeDialog: () => void;
  toggleDatePicker: () => void;
  handleDateSelect: (day: number) => void;
  datePickerRef: React.RefObject<HTMLDivElement>;
}

const useDateSelection = (currentYear: number, currentMonth: number): UseDateSelectionReturn => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const openDialogForDay = (day: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedDate(null);
  };

  const handleDateSelect = (day: number) => {
     setSelectedDate(new Date(currentYear, currentMonth, day));
    setShowDatePicker(false);
  };

  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  return { selectedDate, isDialogOpen, showDatePicker, openDialogForDay, closeDialog, toggleDatePicker, handleDateSelect, datePickerRef };
};

export default useDateSelection;