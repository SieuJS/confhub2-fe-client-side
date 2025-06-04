// src/app/[locale]/addconference/components/inputs/ImportantDatesInput.tsx
import React from 'react'
import { ImportantDateInput } from '@/src/models/send/addConference.send'

interface ImportantDatesInputProps {
  dates: ImportantDateInput[]
  handleDateChange: (
    index: number,
    field: keyof ImportantDateInput,
    value: string
  ) => void
  addDate: () => void
  removeDate: (index: number) => void
  dateTypeOptions: { value: string; name: string }[]
  t: (key: string) => string
  conferenceDateStartError: string // New prop for specific error message
}

const ImportantDatesInput: React.FC<ImportantDatesInputProps> = ({
  dates,
  handleDateChange,
  addDate,
  removeDate,
  dateTypeOptions,
  t,
  conferenceDateStartError // Destructure new prop
}) => {
  return (
    <div className='sm:col-span-2'>
      <label className='block text-sm  '>* {t('Important_Dates')}:</label>
      {dates.map((date, index) => (
        <div
          key={index}
          className='mt-1 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-4 lg:gap-x-4'
        >
          <div>
            <label htmlFor={`name-${index}`} className='block text-sm  '>
              {t('Name')}:
            </label>
            <input
              type='text'
              id={`name-${index}`}
              value={date.name}
              onChange={e => handleDateChange(index, 'name', e.target.value)}
              className={`mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm
                    ${index === 0 ? 'pointer-events-none bg-gray-10 opacity-70' : ''}`}
              required={index > 0}
              disabled={index === 0}
            />
          </div>
          <div>
            <label htmlFor={`type-${index}`} className='block text-sm'>
              {t('Type')}:
            </label>
            <select
              id={`type-${index}`}
              value={date.type}
              onChange={e => handleDateChange(index, 'type', e.target.value)}
              className={`mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm ${
                index === 0 ? 'pointer-events-none bg-gray-10 opacity-70' : ''
              }`}
              required={index > 0}
              disabled={index === 0}
            >
              <option value=''>{t('Select_Type')}</option>
              {dateTypeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`fromDate-${index}`} className='block text-sm  '>
              * {t('Start_Date')}:
            </label>
            <input
              type='date'
              id={`fromDate-${index}`}
              value={date.fromDate}
              onChange={e =>
                handleDateChange(index, 'fromDate', e.target.value)
              }
              className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
              required
              title={t('Select_the_start_date')}
            />
            {/* Display error message for conference date if applicable */}
            {index === 0 && conferenceDateStartError && (
              <p className='mt-1 text-xs text-red-500'>
                {conferenceDateStartError}
              </p>
            )}
            {index === 0 && ( // Thêm đoạn mô tả ở đây
              <p className='mt-1 text-xs italic text-gray-500'>
                {t('Conference_date_must_be_7_days_from_now')}
              </p>
            )}
          </div>
          <div className='relative'>
            <label htmlFor={`toDate-${index}`} className='block text-sm  '>
              * {t('End_Date')}:
            </label>
            <input
              type='date'
              id={`toDate-${index}`}
              value={date.toDate}
              onChange={e => handleDateChange(index, 'toDate', e.target.value)}
              min={date.fromDate}
              className='mt-1 block w-full rounded-md border border-button  px-3 py-2 shadow-sm focus:border-button focus:outline-none focus:ring-button sm:text-sm'
              required
              title={t('Select_the_end_date')}
            />
            {index !== 0 && (
              <button
                type='button'
                onClick={() => removeDate(index)}
                className='absolute -right-6 top-1/2 mt-2 -translate-y-1/2 text-red-500 hover:text-red-700 focus:outline-none sm:-right-8'
                aria-label='Remove date'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M6.293 6.293a1 1 0 011.414 0L10 8.586l2.293-2.293a1 1 0 111.414 1.414L11.414 10l2.293 2.293a1 1 0 01-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 01-1.414-1.414L8.586 10 6.293 7.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
      <button
        type='button'
        onClick={addDate}
        className='mt-4 rounded bg-button px-4 py-2 text-sm font-bold text-button-text hover:bg-button focus:ring-2 focus:ring-button focus:ring-offset-2 hover:focus:outline-none'
      >
        {t('Add_Date')}
      </button>
    </div>
  )
}

export default ImportantDatesInput
