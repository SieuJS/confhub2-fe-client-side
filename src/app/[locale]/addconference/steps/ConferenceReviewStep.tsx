// src/app/[locale]/addconference/components/steps/ConferenceReviewStep.tsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Info,
  MapPin,
  CalendarDays,
  ListChecks,
  // Image as ImageIcon,
  Link as LinkIcon,
  Globe,
  Building,
  Users,
  Monitor,
  GitFork,
  FileText,
  ExternalLinkIcon,
  Map,
  Pin,
  ShieldAlert,
  PencilLine
} from 'lucide-react'

import {
  LocationInput,
  ImportantDateInput,
  City,
  State
} from '@/src/models/send/addConference.send'

// Import hàm getDateTypeOptions từ constants
import { getDateTypeOptions } from '@/src/hooks/addConference/constants'

interface ConferenceReviewStepProps {
  title: string
  acronym: string
  link: string
  cfpLink: string
  impLink: string
  type: 'Offline' | 'Online' | 'Hybrid'
  location: LocationInput
  dates: ImportantDateInput[]
  topics: string[]
  // imageUrl?: string
  summary: string
  callForPaper: string
  t: (key: string) => string
  statesForReview: State[]
  citiesForReview: City[]
}

// Helper component for styled information rows within sections
interface InfoDisplayProps {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}

const InfoDisplay: React.FC<InfoDisplayProps> = ({ label, icon, children }) => (
  <div className='border-b border-slate-200 py-2.5 last:border-b-0'>
    <div className='mb-1 flex items-center text-sm font-medium '>
      {icon &&
        React.cloneElement(icon as React.ReactElement, {
          className: 'w-4 h-4 mr-2  flex-shrink-0'
        })}
      <span>{label}</span>
    </div>
    <div className='break-words text-sm  sm:text-base'>{children}</div>
  </div>
)

// Helper component for section cards
interface SectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}

const Section: React.FC<SectionProps> = ({
  title,
  icon,
  children,
  className = ''
}) => (
  <div className={`rounded-xl bg-white-pure p-5 shadow-lg sm:p-6 ${className}`}>
    <div className='mb-4 flex items-center border-b border-indigo-100 pb-3 text-lg font-semibold text-indigo-700 sm:text-xl'>
      {React.cloneElement(icon as React.ReactElement, {
        className: 'w-6 h-6 mr-3 text-indigo-500 flex-shrink-0'
      })}
      {title}
    </div>
    <div className='space-y-1'>{children}</div>
  </div>
)

const ConferenceReviewStep: React.FC<ConferenceReviewStepProps> = ({
  title,
  acronym,
  link,
  cfpLink,
  impLink,
  type,
  location,
  dates,
  topics,
  // imageUrl,
  summary,
  callForPaper,
  t,
  statesForReview,
  citiesForReview
}) => {
  // Helper to render detail or a fallback message, returns ReactNode
  const renderDetail = (
    value: string | undefined | null,
    fallbackKey: string = 'Not_provided',
    onlineFallbackKey?: string
  ): React.ReactNode => {
    if (type === 'Online' && onlineFallbackKey) {
      return <span className='italic '>{t(onlineFallbackKey)}</span>
    }
    if (value && String(value).trim() !== '') {
      return String(value)
    }
    return <span className='italic '>{t(fallbackKey)}</span>
  }

  // Helper function to format the address for display in review
  const getFormattedAddressForDisplay = (): React.ReactNode => {
    if (type === 'Online') {
      return <span className='italic '>{t('Not_provided')}</span>
    }

    const originalAddress = location.address?.trim()
    const cityStateProvince = location.cityStateProvince?.trim()
    const country = location.country?.trim()

    let combinedAddressParts = []
    if (originalAddress) combinedAddressParts.push(originalAddress)
    // if (cityStateProvince) combinedAddressParts.push(cityStateProvince)
    // if (country) combinedAddressParts.push(country)

    if (combinedAddressParts.length > 0) {
      return combinedAddressParts.join(', ')
    }
    return <span className='italic '>{t('Not_provided')}</span>
  }

  const getTypeIconAndColor = () => {
    switch (type) {
      case 'Online':
        return {
          icon: <Monitor className='mr-1.5 h-5 w-5' />,
          color: 'text-green-600',
          chipColor: 'bg-green-100 text-green-700'
        }
      case 'Offline':
        return {
          icon: <Users className='mr-1.5 h-5 w-5' />,
          color: 'text-red-600',
          chipColor: 'bg-red-100 text-red-700'
        }
      case 'Hybrid':
        return {
          icon: <GitFork className='mr-1.5 h-5 w-5' />,
          color: 'text-blue-600',
          chipColor: 'bg-blue-100 text-blue-700'
        }
      default:
        return {
          icon: <ShieldAlert className='mr-1.5 h-5 w-5' />,
          color: '',
          chipColor: ' '
        }
    }
  }
  const typeStyle = getTypeIconAndColor()

  // Lấy các options loại ngày một lần
  const dateTypeOptions = getDateTypeOptions(t)

  // Helper function to format dates
  const formatDateRange = (
    fromDateStr?: string,
    toDateStr?: string
  ): React.ReactNode => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }

    try {
      const fromDate = fromDateStr ? new Date(fromDateStr) : null
      const toDate = toDateStr ? new Date(toDateStr) : null

      if (!fromDate && !toDate) {
        return <span className='italic '>{t('N_A')}</span>
      }

      if (
        fromDate &&
        toDate &&
        fromDate.toDateString() === toDate.toDateString()
      ) {
        // Same date, format as "Month Day, Year"
        return fromDate.toLocaleDateString(undefined, options)
      } else if (fromDate && toDate) {
        // Different dates, format as "Month Day, Year - Month Day, Year"
        const fromPart = fromDate.toLocaleDateString(undefined, options)
        const toPart = toDate.toLocaleDateString(undefined, options)
        return `${fromPart} - ${toPart}`
      } else if (fromDate) {
        // Only fromDate available
        return fromDate.toLocaleDateString(undefined, options)
      } else if (toDate) {
        // Only toDate available
        return toDate.toLocaleDateString(undefined, options)
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return <span className='italic '>{t('Invalid_Date')}</span>
    }
    return <span className='italic '>{t('N_A')}</span>
  }

  return (
    <div className='min-h-screen rounded-lg bg-gray-5 p-3 sm:p-6'>
      <header className='mb-6 border-b border-slate-300 pb-4 sm:mb-8'>
        <h2 className='flex items-center text-2xl font-bold text-indigo-800 sm:text-3xl'>
          <PencilLine className='mr-3 h-7 w-7 flex-shrink-0 text-indigo-600 sm:h-8 sm:w-8' />
          {t('Review_Information')}
        </h2>
        <p className='mt-2 text-sm '>
          {t(
            'Please_review_all_conference_details_carefully_before_proceeding'
          )}
        </p>
      </header>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
        {/* General Information Section */}
        <Section title={t('General_Information')} icon={<Info />}>
          <InfoDisplay label={t('Conference_Name')} icon={<FileText />}>
            {renderDetail(title, 'Title_not_provided')}
          </InfoDisplay>
          <InfoDisplay label={t('Acronym')} icon={<FileText />}>
            {renderDetail(acronym, 'Acronym_not_provided')}
          </InfoDisplay>
          <InfoDisplay label={t('Link')} icon={<LinkIcon />}>
            {link ? (
              <a
                href={link}
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-center text-blue-600 hover:text-blue-800 hover:underline'
              >
                {link}{' '}
                <ExternalLinkIcon
                  size={14}
                  className='ml-1.5 opacity-70 transition-opacity group-hover:opacity-100'
                />
              </a>
            ) : (
              renderDetail(null, 'Link_not_provided')
            )}
          </InfoDisplay>
          <InfoDisplay label={t('cfpLink')} icon={<LinkIcon />}>
            {cfpLink ? (
              <a
                href={cfpLink}
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-center text-blue-600 hover:text-blue-800 hover:underline'
              >
                {cfpLink}{' '}
                <ExternalLinkIcon
                  size={14}
                  className='ml-1.5 opacity-70 transition-opacity group-hover:opacity-100'
                />
              </a>
            ) : (
              renderDetail(null, 'Link_not_provided')
            )}
          </InfoDisplay>
          <InfoDisplay label={t('impLink')} icon={<LinkIcon />}>
            {impLink ? (
              <a
                href={impLink}
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-center text-blue-600 hover:text-blue-800 hover:underline'
              >
                {impLink}{' '}
                <ExternalLinkIcon
                  size={14}
                  className='ml-1.5 opacity-70 transition-opacity group-hover:opacity-100'
                />
              </a>
            ) : (
              renderDetail(null, 'Link_not_provided')
            )}
          </InfoDisplay>
          <InfoDisplay
            label={t('Type')}
            icon={React.cloneElement(typeStyle.icon, {
              className: `${typeStyle.icon.props.className} ${typeStyle.color}`
            })}
          >
            <span
              className={`inline-flex items-center rounded-full p-2 text-xs font-semibold ${typeStyle.chipColor}`}
            >
              {React.cloneElement(typeStyle.icon, {
                size: 14,
                className: 'mr-1'
              })}
              {t(type)}
            </span>
          </InfoDisplay>
        </Section>

        {/* Location Section */}
        <Section title={t('Location_Details')} icon={<MapPin />}>
          <InfoDisplay label={t('Address')} icon={<Pin />}>
            {getFormattedAddressForDisplay()}
          </InfoDisplay>
          <InfoDisplay label={t('Continent')} icon={<Globe />}>
            {renderDetail(location.continent, 'Not_provided', 'Not_provided')}
          </InfoDisplay>
          <InfoDisplay label={t('Country')} icon={<Map />}>
            {renderDetail(location.country, 'Not_provided', 'Not_provided')}
          </InfoDisplay>
          <InfoDisplay
            label={
              statesForReview.length > 0 ||
              (!statesForReview.length &&
                !citiesForReview.length &&
                location.cityStateProvince)
                ? t('State_Province')
                : t('City')
            }
            icon={<Building />}
          >
            {renderDetail(
              location.cityStateProvince,
              'Not_provided',
              'Not_provided'
            )}
          </InfoDisplay>
        </Section>

        {/* Important Dates Section */}
        <Section
          title={t('Important_Dates')}
          icon={<CalendarDays />}
          className='md:col-span-2'
        >
          {dates.length > 0 ? (
            <ul className='space-y-3'>
              {dates.map((date, index) => {
                // Tìm tên hiển thị cho loại ngày từ dateTypeOptions
                const displayTypeName =
                  dateTypeOptions.find(option => option.value === date.type)
                    ?.name || t('N_A')
                return (
                  <li
                    key={index}
                    className='rounded-lg bg-gray-10 p-3 shadow-sm'
                  >
                    <div className='flex items-center justify-between'>
                      <strong className='text-base text-indigo-700'>
                        {date.name || t('Unnamed_Date')}
                      </strong>
                      <span className='rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700'>
                        {displayTypeName} {/* Sử dụng tên hiển thị đã dịch */}
                      </span>
                    </div>
                    <div className='mt-1 text-sm '>
                      {/* Sử dụng hàm formatDateRange mới */}
                      {formatDateRange(date.fromDate, date.toDate)}
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            renderDetail(null, 'No_dates_added')
          )}
        </Section>

        {/* Topics Section */}
        <Section
          title={t('Topics')}
          icon={<ListChecks />}
          className='md:col-span-2'
        >
          {topics.length > 0 ? (
            <div className='flex flex-wrap gap-2 pt-1'>
              {topics.map((topic, index) => (
                <span
                  key={index}
                  className='text-md rounded-full bg-emerald-100 px-3 py-1.5 font-medium text-emerald-800 shadow-sm'
                >
                  {topic}
                </span>
              ))}
            </div>
          ) : (
            renderDetail(null, 'No_topics_added')
          )}
        </Section>
      </div>

      {/* Image URL Section - Full width
      {imageUrl && (
        <div className='mt-6'>
          <Section title={t('Conference_Banner_Image')} icon={<ImageIcon />}>
            <InfoDisplay label={t('Image_Link')} icon={<LinkIcon />}>
              <a
                href={imageUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='group flex items-center text-blue-600 hover:text-blue-800 hover:underline'
              >
                {imageUrl}{' '}
                <ExternalLinkIcon
                  size={14}
                  className='ml-1.5 opacity-70 transition-opacity group-hover:opacity-100'
                />
              </a>
            </InfoDisplay>
          </Section>
        </div>
      )} */}

      {/* Summary Section - Full width */}
      <div className='mt-6'>
        <Section title={t('Summary')} icon={<FileText />}>
          {summary && summary.trim() !== '' ? (
            <div className='prose prose-base max-w-none dark:prose-invert [&_*]:text-[var(--primary)]'>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {summary}
              </ReactMarkdown>
            </div>
          ) : (
            <div className='py-2'>
              {renderDetail(null, 'No_summary_provided')}
            </div>
          )}
        </Section>
      </div>

      {/* Call for Papers Section - Full width */}
      <div className='mt-6'>
        <Section title={t('Call_for_paper')} icon={<FileText />}>
          {callForPaper && callForPaper.trim() !== '' ? (
            <div className='prose prose-base max-w-none dark:prose-invert [&_*]:text-[var(--primary)]'>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {callForPaper}
              </ReactMarkdown>
            </div>
          ) : (
            <div className='py-2'>
              {renderDetail(null, 'No_Call_for_paper_provided')}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

export default ConferenceReviewStep
