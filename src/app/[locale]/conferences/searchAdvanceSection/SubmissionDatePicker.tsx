// src/components/conferences/searchAdvanceSection/SubmissionDatePicker.tsx
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as Tooltip from '@radix-ui/react-tooltip';

interface SubmissionDatePickerProps {
  subFromDate: Date | null;
  subToDate: Date | null;
  onSubmissionDateRangeChange: (dates: [Date | null, Date | null]) => void;
  t: (key: string) => string;
}

export const SubmissionDatePicker: React.FC<SubmissionDatePickerProps> = ({
  subFromDate, subToDate, onSubmissionDateRangeChange, t
}) => (
  <div className="col-span-1 md:col-span-3 lg:col-span-1">
    <label className="mb-1 flex items-center text-sm font-bold" htmlFor="submissionDateRange">
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="mr-1 inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600">?</span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="z-50 max-w-xs rounded-md bg-gray-800 px-3 py-2 text-sm text-white shadow-lg" sideOffset={5} side="bottom">
            {t('tooltip_submission_date')}
            <Tooltip.Arrow className="fill-gray-800" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
      {t('Submission_Date')}:
    </label>
    <DatePicker
      selectsRange={true}
      startDate={subFromDate}
      endDate={subToDate}
      onChange={onSubmissionDateRangeChange}
      isClearable={true}
      placeholderText={t('Select_Date_Range') ?? 'Select Date Range'}
      dateFormat="yyyy/MM/dd"
      className="focus:shadow-outline w-full appearance-none rounded border px-2 py-1 text-sm leading-tight shadow placeholder:text-primary focus:outline-none"
      wrapperClassName="w-full"
      id="submissionDateRange"
    />
  </div>
);