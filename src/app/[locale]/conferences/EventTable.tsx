// src/components/conferences/EventTable.tsx
import React from 'react'
import { ConferenceInfo } from '../../../models/response/conference.list.response'
import { useTranslations } from 'next-intl'

interface EventTableProps {
  events: ConferenceInfo[]
}

const EventTable: React.FC<EventTableProps> = ({ events }) => {
  const t = useTranslations('')

  const formatDateRange = (
    fromDate: string | undefined,
    toDate: string | undefined
  ) => {
    if (!fromDate || !toDate) return 'TBD'
    const startDate = new Date(fromDate)
    const endDate = new Date(toDate)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return 'Invalid Date'
    }
    if (startDate.toDateString() === endDate.toDateString()) {
      return startDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }
    return `${startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50 dark:bg-gray-950'>
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Name')}
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Date')}
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Location')}
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Rank')}
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Access_Type')}
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
            >
              {t('Topics')}
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white dark:bg-black'>
          {events.map(event => (
            <tr key={event.id}>
              <td className='whitespace-nowrap px-6 py-4 text-left text-sm font-medium '>
                {event.title} {event.acronym && `(${event.acronym})`}
              </td>
              <td className='whitespace-nowrap px-6 py-4 text-left text-sm '>
                {formatDateRange(event.dates?.fromDate, event.dates?.toDate)}
              </td>
              <td className='whitespace-nowrap px-6 py-4 text-left text-sm '>
                {event.location?.cityStateProvince &&
                  `${event.location.cityStateProvince}, `}
                {event.location?.country}
              </td>
              <td className='whitespace-nowrap px-6 py-4 text-left text-sm '>
                {event?.rank || t('Unranked')}
              </td>
              <td className='whitespace-nowrap px-6 py-4 text-left text-sm '>
                {event.accessType}
              </td>
              <td className='whitespace-nowrap px-6 py-4 text-left text-sm '>
                {event.topics.slice(0, 3).join(', ')}
                {event.topics.length > 3
                  ? ` +${event.topics.length - 3} ${t('more')}`
                  : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EventTable
