// hooks/useDialog.ts
import { useState, useCallback } from 'react';

interface DialogResult {
  isDialogOpen: boolean;
  selectedDate: Date | null;
  openDialogForDay: (day: number, currentMonth: number, currentYear: number) => void;
  closeDialog: () => void;
}

const useDialog = (): DialogResult => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const openDialogForDay = useCallback((day: number, currentMonth: number, currentYear: number) => {
    setSelectedDate(new Date(currentYear, currentMonth, day));
    setIsDialogOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedDate(null);
  }, []);

  return { isDialogOpen, selectedDate, openDialogForDay, closeDialog };
};

export default useDialog;