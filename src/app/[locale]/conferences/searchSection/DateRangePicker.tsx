// src/components/conferences/searchSection/DateRangePicker.tsx
import React, { ChangeEvent } from 'react';

interface DateRangePickerProps {
  fromDate: Date | null;
  toDate: Date | null;
  onFromDateChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToDateChange: (event: ChangeEvent<HTMLInputElement>) => void;
  t: (key: string) => string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  fromDate, toDate, onFromDateChange, onToDateChange, t
}) => {
  return (
    <>
      <div className="flex items-center space-x-2 px-2">
        <label htmlFor="fromDate" className="text-sm">{t('Start')}:</label>
        <input
          type="date"
          id="fromDate"
          className="w-26 rounded border bg-transparent py-0.5 text-sm"
          onChange={onFromDateChange}
          value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
        />
      </div>
      <div className="flex items-center space-x-2 px-2">
        <label htmlFor="toDate" className="text-sm">{t('End')}:</label>
        <input
          type="date"
          id="toDate"
          className="w-26 rounded border bg-transparent py-0.5 text-sm"
          onChange={onToDateChange}
          value={toDate ? toDate.toISOString().split('T')[0] : ''}
        />
      </div>
    </>
  );
};