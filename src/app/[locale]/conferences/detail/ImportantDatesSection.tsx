import React, { useMemo } from 'react'
import { GroupedDateInfo } from '@/src/hooks/conferenceDetails/useFormatConferenceData'
import { Disclosure, Transition } from '@headlessui/react'
import {
  CalendarDays,
  Camera,
  ChevronUp,
  History,
  Info,
  Bell,
  Send,
  Ticket
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ExternalLink } from 'lucide-react'

interface ImportantDatesSectionProps {
  groupedDates: GroupedDateInfo[]
  formatDate: (date: string | null | undefined) => string
  impLink?: string | undefined | null
  // Bỏ prop t vì mỗi component sẽ tự lấy
}

// --- Component con: Hiển thị các ngày cũ ---
const OldDates: React.FC<{
  dates: GroupedDateInfo['differentOldDates']
  formatDate: (date: string | null | undefined) => string
}> = ({ dates, formatDate }) => {
  const t = useTranslations('ConferenceDetailsPage.ImportantDates')
  if (dates.length === 0) return null

  return (
    <div className='mt-2 pl-5 text-xs italic '>
      <div className='flex items-center'>
        <History className='mr-1.5 h-3 w-3 flex-shrink-0' />
        {/* Đã chuyển "Previously:" thành key dịch */}
        <span>{t('previously')}</span>
      </div>
      <ul className='list-disc pl-5'>
        {dates.map((old, i) => (
          <li key={i} className='line-through'>
            {formatDate(old.fromDate)}
            {old.toDate &&
              old.fromDate !== old.toDate &&
              ` - ${formatDate(old.toDate)}`}
          </li>
        ))}
      </ul>
    </div>
  )
}

// --- Component con: Thẻ hiển thị một mục ngày ---
const DateItemCard: React.FC<{
  dateInfo: GroupedDateInfo
  formatDate: (date: string | null | undefined) => string
}> = ({ dateInfo, formatDate }) => {
  // Component tự lấy hàm t
  const t = useTranslations('ConferenceDetailsPage.ImportantDates')

  return (
    <div className='rounded-md border border-gray-200 bg-gray-10 p-3 transition-shadow hover:shadow-sm'>
      <div className='flex items-start justify-between'>
        <p className='font-semibold '>{dateInfo.name}</p>
        {dateInfo.isNew && (
          // Đã chuyển "NEW" thành key dịch để có thể thay đổi (ví dụ: "MỚI")
          <span className='ml-2 flex-shrink-0 rounded bg-green-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-green-700'>
            {t('newBadge')}
          </span>
        )}
      </div>
      <p className='mt-1 text-sm font-medium text-blue-700'>
        {formatDate(dateInfo.current.fromDate)}
        {dateInfo.current.toDate &&
          dateInfo.current.fromDate !== dateInfo.current.toDate && (
            <span> → {formatDate(dateInfo.current.toDate)}</span>
          )}
      </p>
      <OldDates dates={dateInfo.differentOldDates} formatDate={formatDate} />
    </div>
  )
}

// --- Component chính được thiết kế lại ---
export const ImportantDatesSection: React.FC<ImportantDatesSectionProps> = ({
  groupedDates,
  formatDate,
  impLink
}) => {
  const t = useTranslations('ConferenceDetailsPage.ImportantDates')

  const typeDetails: {
    [key: string]: { icon: React.ReactNode; title: string }
  } = useMemo(
    () => ({
      conferenceDates: {
        icon: <CalendarDays className='h-6 w-6 text-blue-600' />,
        title: t('conferenceDatesTitle')
      },
      submissionDate: {
        icon: <Send className='h-6 w-6 text-purple-600' />,
        title: t('submissionTitle')
      },
      notificationDate: {
        icon: <Bell className='h-6 w-6 text-green-600' />,
        title: t('notificationTitle')
      },
      cameraReadyDate: {
        icon: <Camera className='h-6 w-6 text-red-600' />,
        title: t('cameraReadyTitle')
      },
      registrationDate: {
        icon: <Ticket className='h-6 w-6 text-orange-500' />,
        title: t('registrationTitle')
      },
      otherDate: {
        icon: <Info className='h-6 w-6 ' />,
        title: t('otherTitle')
      }
    }),
    [t]
  )

  const { conferenceDatesGroup, otherGroups } = useMemo(() => {
    const groups: Record<string, GroupedDateInfo[]> = {}
    groupedDates.forEach(dateInfo => {
      const type = dateInfo.type || 'otherDate'
      if (!groups[type]) {
        groups[type] = []
      }
      groups[type].push(dateInfo)
    })

    const customTypeOrder = [
      'submissionDate',
      'notificationDate',
      'cameraReadyDate',
      'registrationDate',
      'otherDate'
    ]

    const sortedOtherGroups = Object.entries(groups)
      .filter(([key]) => key !== 'conferenceDates')
      .sort(
        ([keyA], [keyB]) =>
          customTypeOrder.indexOf(keyA) - customTypeOrder.indexOf(keyB)
      )

    return {
      conferenceDatesGroup: groups['conferenceDates'] || [],
      otherGroups: sortedOtherGroups
    }
  }, [groupedDates])

  const MAX_ITEMS_VISIBLE = 3

  return (
    <section
      id='important-dates'
      className='mt-6 rounded-lg bg-white-pure px-2 py-4 shadow-md md:px-4'
    >
      <div className='mb-4 flex items-center gap-2'>
        <h2 className=' text-xl font-semibold md:text-2xl'>
          {t('sectionTitle')}
        </h2>
        {impLink && (
          <a
            href={impLink}
            target='_blank'
            rel='noopener noreferrer'
            title={t('Go_to_Important_Dates_website')}
            className='text-gray-50 transition-colors hover:text-primary'
          >
            <ExternalLink size={20} />
          </a>
        )}
      </div>
      {groupedDates.length === 0 ? (
        <p className=''>{t('noDatesAvailable')}</p>
      ) : (
        <div className='space-y-8'>
          {conferenceDatesGroup.length > 0 && (
            <div>
              <div className='mb-4 flex items-center border-b border-gray-200 pb-2'>
                {typeDetails['conferenceDates'].icon}
                <h3 className='ml-3 text-lg font-semibold '>
                  {typeDetails['conferenceDates'].title}
                </h3>
              </div>
              <div className='space-y-4'>
                {conferenceDatesGroup.map(dateInfo => (
                  <DateItemCard
                    key={`${dateInfo.type}-${dateInfo.name}`}
                    dateInfo={dateInfo}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {otherGroups.map(([typeKey, group]) => {
              const details = typeDetails[typeKey] || typeDetails['otherDate']
              const useAccordion = group.length > MAX_ITEMS_VISIBLE

              return (
                <div
                  key={typeKey}
                  className='flex flex-col rounded-lg border border-gray-200 bg-white-pure'
                >
                  <div className='flex items-center border-b bg-gray-10 p-3'>
                    {details.icon}
                    <h3 className='ml-3 font-semibold '>{details.title}</h3>
                  </div>
                  <div className='flex-grow space-y-3 p-3'>
                    {group.slice(0, MAX_ITEMS_VISIBLE).map(dateInfo => (
                      <DateItemCard
                        key={`${dateInfo.type}-${dateInfo.name}`}
                        dateInfo={dateInfo}
                        formatDate={formatDate}
                      />
                    ))}

                    {useAccordion && (
                      <Disclosure>
                        {({ open }) => (
                          <>
                            <Disclosure.Button className='flex w-full items-center justify-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium  hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75'>
                              <span>
                                {open
                                  ? t('showLess')
                                  : t('showMore', {
                                      count: group.length - MAX_ITEMS_VISIBLE
                                    })}
                              </span>
                              <ChevronUp
                                className={`${
                                  open ? 'rotate-180 transform' : ''
                                } ml-2 h-5 w-5  transition-transform`}
                              />
                            </Disclosure.Button>
                            <Transition
                              enter='transition duration-100 ease-out'
                              enterFrom='transform scale-95 opacity-0'
                              enterTo='transform scale-100 opacity-100'
                              leave='transition duration-75 ease-out'
                              leaveFrom='transform scale-100 opacity-100'
                              leaveTo='transform scale-95 opacity-0'
                            >
                              <Disclosure.Panel className='mt-3 space-y-3 text-sm '>
                                {group
                                  .slice(MAX_ITEMS_VISIBLE)
                                  .map(dateInfo => (
                                    <DateItemCard
                                      key={`${dateInfo.type}-${dateInfo.name}`}
                                      dateInfo={dateInfo}
                                      formatDate={formatDate}
                                    />
                                  ))}
                              </Disclosure.Panel>
                            </Transition>
                          </>
                        )}
                      </Disclosure>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
