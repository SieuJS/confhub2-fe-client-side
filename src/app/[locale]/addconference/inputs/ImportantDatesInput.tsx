// src/app/[locale]/addconference/inputs/ImportantDatesInput.tsx
import React from 'react'
import clsx from 'clsx'
import { XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { ConferenceDetailsStepProps } from '../steps/ConferenceDetailsStep'

// Props interface kế thừa từ ConferenceDetailsStepProps
interface ImportantDatesInputProps extends ConferenceDetailsStepProps {}

// Helper function để lấy text cho tooltip
const getTooltipText = (type: string, t: (key: string) => string): string => {
  const tooltips: Record<string, string> = {
    submissionDate: t('Tooltip_SubmissionDate'),
    notificationDate: t('Tooltip_NotificationDate'),
    cameraReadyDate: t('Tooltip_CameraReadyDate'),
    registrationDate: t('Tooltip_RegistrationDate'),
    conferenceDates: t('Tooltip_ConferenceDates'),
    otherDate: t('Tooltip_OtherDate')
  }
  return tooltips[type] || ''
}

const ImportantDatesInput: React.FC<ImportantDatesInputProps> = ({
  formData,
  dateErrors,
  globalDateError,
  touchedFields, // Nhận touchedFields
  handlers, // Nhận handlers
  dateTypeOptions,
  t
}) => {
  return (
    <div className='sm:col-span-6'>
      <label className='mb-2 block text-sm font-medium '>
        <span className='text-red-500'>* </span>
        {t('Important_Dates')}
      </label>

      <p className='mb-4 text-xs  italic'>
        {t('All_start_dates_must_be_at_least_7_days_from_now')}
      </p>

      {/* Lỗi toàn cục vẫn hiển thị ngay lập tức vì nó quan trọng */}
      {globalDateError && (
        <div className='mb-4 rounded-md border border-red-200 bg-red-50 p-3'>
          <p className='text-sm text-red-700'>{globalDateError}</p>
        </div>
      )}

      <div className='space-y-6'>
        {formData.dates.map((date, index) => {
          const errorsForThisDate = dateErrors[index] || {}
          const tooltipText = getTooltipText(date.type, t)

          // Helper function để kiểm tra touched và error cho từng trường con
          const shouldShowError = (
            fieldName: keyof typeof errorsForThisDate
          ) => {
            return (
              touchedFields.has(`dates.${index}.${fieldName}`) &&
              !!errorsForThisDate[fieldName]
            )
          }

          return (
            <div
              key={index}
              className='relative rounded-lg border border-gray-200 p-4'
              title={tooltipText}
            >
              {index > 0 && (
                <button
                  type='button'
                  onClick={() => handlers.removeDate(index)}
                  className='absolute -right-2 -top-2  hover:text-red-600 focus:outline-none'
                  aria-label={t('Remove_date')}
                >
                  <XCircleIcon className='h-6 w-6' />
                </button>
              )}

              <div className='grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-4'>
                {/* --- Name Input --- */}
                <div>
                  <label
                    htmlFor={`name-${index}`}
                    className='block text-sm font-medium '
                  >
                    {index > 0 && <span className='text-red-500'>* </span>}
                    {t('Name')}
                  </label>
                  <input
                    type='text'
                    id={`name-${index}`}
                    value={date.name}
                    onChange={e =>
                      handlers.handleDateChange(index, 'name', e.target.value)
                    }
                    onBlur={() => handlers.handleBlur(`dates.${index}.name`)} // Gắn onBlur
                    className={clsx(
                      'mt-1 block w-full rounded-md p-2 shadow-sm sm:text-sm',
                      shouldShowError('name')
                        ? 'border-red-500'
                        : 'border-gray-300',
                      index === 0
                        ? 'cursor-not-allowed bg-gray-10'
                        : 'focus:border-indigo-500 focus:ring-indigo-500'
                    )}
                    required={index > 0}
                    disabled={index === 0}
                  />
                  {shouldShowError('name') && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errorsForThisDate.name}
                    </p>
                  )}
                </div>

                {/* --- Type Select --- */}
                <div>
                  <label
                    htmlFor={`type-${index}`}
                    className='flex items-center text-sm font-medium '
                  >
                    {index > 0 && <span className='text-red-500'>* </span>}
                    {t('Type')}
                    {tooltipText && (
                      <InformationCircleIcon className='ml-1.5 h-5 w-5 ' />
                    )}
                  </label>
                  <select
                    id={`type-${index}`}
                    value={date.type}
                    onChange={e =>
                      handlers.handleDateChange(index, 'type', e.target.value)
                    }
                    onBlur={() => handlers.handleBlur(`dates.${index}.type`)} // Gắn onBlur
                    className={clsx(
                      'mt-1 block w-full rounded-md p-2.5 shadow-sm sm:text-sm',
                      shouldShowError('type')
                        ? 'border-red-500'
                        : 'border-gray-300',
                      index === 0
                        ? 'cursor-not-allowed bg-gray-10'
                        : 'focus:border-indigo-500 focus:ring-indigo-500'
                    )}
                    required={index > 0}
                    disabled={index === 0}
                  >
                    <option value=''>{t('Select_Type')}</option>
                    {dateTypeOptions
                      .filter(opt =>
                        index === 0
                          ? opt.value === 'conferenceDates'
                          : opt.value !== 'conferenceDates'
                      )
                      .map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.name}
                        </option>
                      ))}
                  </select>
                  {shouldShowError('type') && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errorsForThisDate.type}
                    </p>
                  )}
                </div>

                {/* --- From Date Input --- */}
                <div>
                  <label
                    htmlFor={`fromDate-${index}`}
                    className='block text-sm font-medium '
                  >
                    <span className='text-red-500'>* </span>
                    {t('Start_Date')}
                  </label>
                  <input
                    type='date'
                    id={`fromDate-${index}`}
                    value={date.fromDate}
                    onChange={e =>
                      handlers.handleDateChange(
                        index,
                        'fromDate',
                        e.target.value
                      )
                    }
                    onBlur={() =>
                      handlers.handleBlur(`dates.${index}.fromDate`)
                    } // Gắn onBlur
                    className={clsx(
                      'mt-1 block w-full rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
                      shouldShowError('fromDate')
                        ? 'border-red-500'
                        : 'border-gray-300'
                    )}
                    required
                  />
                  {shouldShowError('fromDate') && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errorsForThisDate.fromDate}
                    </p>
                  )}
                </div>

                {/* --- To Date Input --- */}
                <div>
                  <label
                    htmlFor={`toDate-${index}`}
                    className='block text-sm font-medium '
                  >
                    <span className='text-red-500'>* </span>
                    {t('End_Date')}
                  </label>
                  <input
                    type='date'
                    id={`toDate-${index}`}
                    value={date.toDate}
                    onChange={e =>
                      handlers.handleDateChange(index, 'toDate', e.target.value)
                    }
                    onBlur={() => handlers.handleBlur(`dates.${index}.toDate`)} // Gắn onBlur
                    min={date.fromDate}
                    className={clsx(
                      'mt-1 block w-full rounded-md p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
                      shouldShowError('toDate')
                        ? 'border-red-500'
                        : 'border-gray-300'
                    )}
                    required
                  />
                  {shouldShowError('toDate') && (
                    <p className='mt-1 text-sm text-red-600'>
                      {errorsForThisDate.toDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <button
        type='button'
        onClick={handlers.addDate}
        className='mt-4 rounded-md bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100'
      >
        + {t('Add_Date')}
      </button>
    </div>
  )
}

export default ImportantDatesInput
