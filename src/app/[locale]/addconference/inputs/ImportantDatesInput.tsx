import React from 'react';
import clsx from 'clsx';
import { XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import { ConferenceDetailsStepProps } from '../steps/ConferenceDetailsStep';

// Props interface giờ chỉ cần kế thừa từ ConferenceDetailsStepProps
interface ImportantDatesInputProps extends ConferenceDetailsStepProps { }

// Helper function để lấy text cho tooltip, giúp component chính gọn gàng hơn
const getTooltipText = (type: string, t: (key: string) => string): string => {
  const tooltips: Record<string, string> = {
    submissionDate: t('Tooltip_SubmissionDate'),
    notificationDate: t('Tooltip_NotificationDate'),
    cameraReadyDate: t('Tooltip_CameraReadyDate'),
    registrationDate: t('Tooltip_RegistrationDate'),
    conferenceDates: t('Tooltip_ConferenceDates'),
    otherDate: t('Tooltip_OtherDate'),
  };
  return tooltips[type] || '';
};


const ImportantDatesInput: React.FC<ImportantDatesInputProps> = ({
  formData,
  dateErrors,
  globalDateError, // Nhận lỗi toàn cục
  onDateChange,
  addDate,
  removeDate,
  dateTypeOptions,
  t,
}) => {
  return (
    <div className="sm:col-span-6">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        <span className="text-red-500">* </span>
        {t('Important_Dates')}
      </label>

      {/* THÊM HELPER TEXT TỔNG QUÁT Ở ĐÂY */}
      <p className="mb-4 text-xs text-gray-500 italic">
        {t('All_start_dates_must_be_at_least_7_days_from_now')}
      </p>


      {/* HIỂN THỊ LỖI TOÀN CỤC */}
      {globalDateError && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{globalDateError}</p>
        </div>
      )}

      <div className="space-y-6">
        {formData.dates.map((date, index) => {
          const errorsForThisDate = dateErrors[index] || {};
          const tooltipText = getTooltipText(date.type, t);

          return (
            <div
              key={index}
              className="p-4 border border-gray-200 rounded-lg relative"
              title={tooltipText} // Thêm tooltip cho toàn bộ khối
            >
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeDate(index)}
                  className="absolute -top-2 -right-2 text-gray-400 hover:text-red-600 focus:outline-none"
                  aria-label={t('Remove_date')}
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              )}

              <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* --- Name Input --- */}
                <div>
                  <label htmlFor={`name-${index}`} className="block text-sm font-medium text-gray-700">
                    {index > 0 && <span className="text-red-500">* </span>}
                    {t('Name')}
                  </label>
                  <input
                    type="text"
                    id={`name-${index}`}
                    value={date.name}
                    onChange={e => onDateChange(index, 'name', e.target.value)}
                    className={clsx(
                      'p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm',
                      errorsForThisDate.name ? 'border-red-500' : 'border-gray-300',
                      index === 0 ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-indigo-500'
                    )}
                    required={index > 0}
                    disabled={index === 0}
                  />
                  {errorsForThisDate.name && <p className="mt-1 text-sm text-red-600">{errorsForThisDate.name}</p>}
                </div>

                {/* --- Type Select --- */}
                <div>
                  <label htmlFor={`type-${index}`} className="flex items-center text-sm font-medium text-gray-700">
                    {index > 0 && <span className="text-red-500">* </span>}
                    {t('Type')}
                    {/* Icon Tooltip (hiển thị khi có tooltip text) */}
                    {tooltipText && (
                      <InformationCircleIcon className="ml-1.5 h-5 w-5 text-gray-400" />
                    )}
                  </label>
                  <select
                    id={`type-${index}`}
                    value={date.type}
                    onChange={e => onDateChange(index, 'type', e.target.value)}
                    className={clsx(
                      'p-2.5 mt-1 block w-full rounded-md shadow-sm sm:text-sm',
                      errorsForThisDate.type ? 'border-red-500' : 'border-gray-300',
                      index === 0 ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-indigo-500'
                    )}
                    required={index > 0}
                    disabled={index === 0}
                  >
                    <option value="">{t('Select_Type')}</option>
                    {dateTypeOptions
                      .filter(opt => index === 0 ? opt.value === 'conferenceDates' : opt.value !== 'conferenceDates')
                      .map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.name}</option>
                      ))}
                  </select>
                  {errorsForThisDate.type && <p className="mt-1 text-sm text-red-600">{errorsForThisDate.type}</p>}
                </div>

                 {/* --- From Date Input --- */}
                <div>
                  <label htmlFor={`fromDate-${index}`} className="block text-sm font-medium text-gray-700">
                    <span className="text-red-500">* </span>{t('Start_Date')}
                  </label>
                  <input
                    type="date"
                    id={`fromDate-${index}`}
                    value={date.fromDate}
                    onChange={e => onDateChange(index, 'fromDate', e.target.value)}
                    className={clsx(
                      'p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500',
                      errorsForThisDate.fromDate ? 'border-red-500' : 'border-gray-300'
                    )}
                    required
                  />
                  {errorsForThisDate.fromDate && <p className="mt-1 text-sm text-red-600">{errorsForThisDate.fromDate}</p>}
                  
                </div>

                {/* --- To Date Input --- */}
                <div>
                  <label htmlFor={`toDate-${index}`} className="block text-sm font-medium text-gray-700">
                    <span className="text-red-500">* </span>{t('End_Date')}
                  </label>
                  <input
                    type="date"
                    id={`toDate-${index}`}
                    value={date.toDate}
                    onChange={e => onDateChange(index, 'toDate', e.target.value)}
                    min={date.fromDate}
                    className={clsx(
                      'p-2 mt-1 block w-full rounded-md shadow-sm sm:text-sm focus:border-indigo-500 focus:ring-indigo-500',
                      errorsForThisDate.toDate ? 'border-red-500' : 'border-gray-300'
                    )}
                    required
                  />
                  {errorsForThisDate.toDate && <p className="mt-1 text-sm text-red-600">{errorsForThisDate.toDate}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={addDate}
        className="mt-4 rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100"
      >
        + {t('Add_Date')}
      </button>
    </div>
  );
};

export default ImportantDatesInput;