// src/app/[locale]/addconference/components/steps/ConferenceReviewStep.tsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Info,
  MapPin,
  CalendarDays,
  ListChecks,
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
import { getDateTypeOptions } from '@/src/hooks/addConference/constants'

// Props interface remains the same
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
  summary: string
  callForPaper: string
  t: (key: string) => string
  statesForReview: State[]
  citiesForReview: City[]
}

// Helper component for styled information rows within sections
// Refined for better flexbox behavior and text wrapping
interface InfoDisplayProps {
  label: string
  icon?: React.ReactNode
  children: React.ReactNode
}

const InfoDisplay: React.FC<InfoDisplayProps> = ({ label, icon, children }) => (
  <div className='border-b border-slate-200 py-3 last:border-b-0'>
    <div className='mb-1.5 flex items-center text-sm font-medium text-slate-600'>
      {icon &&
        React.cloneElement(icon as React.ReactElement, {
          className: 'w-4 h-4 mr-2 text-slate-500 flex-shrink-0'
        })}
      <span>{label}</span>
    </div>
    {/* Added min-w-0 to allow text to break correctly within a flex context */}
    <div className='min-w-0 pl-6 text-sm text-slate-900 sm:text-base'>
      {children}
    </div>
  </div>
)

// Helper component for section cards
// No major changes needed, it's already quite responsive
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
  <div
    className={`overflow-hidden rounded-lg bg-white-pure p-4 shadow-md sm:p-6 ${className}`}
  >
    <div className='mb-4 flex items-center border-b border-indigo-100 pb-3 text-lg font-semibold text-indigo-700 sm:text-xl'>
      {React.cloneElement(icon as React.ReactElement, {
        className: 'w-6 h-6 mr-3 text-indigo-500 flex-shrink-0'
      })}
      {title}
    </div>
    <div className='space-y-2'>{children}</div>
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
  summary,
  callForPaper,
  t,
  statesForReview,
  citiesForReview
}) => {
  // Helper to render detail or a fallback message
  const renderDetail = (
    value: string | undefined | null,
    fallbackKey: string = 'Not_provided',
    onlineFallbackKey?: string
  ): React.ReactNode => {
    if (type === 'Online' && onlineFallbackKey) {
      return <span className='italic text-slate-500'>{t(onlineFallbackKey)}</span>
    }
    if (value && String(value).trim() !== '') {
      // Use break-all for long strings like links or acronyms to prevent layout breaking
      return <span className='break-all'>{String(value)}</span>
    }
    return <span className='italic text-slate-500'>{t(fallbackKey)}</span>
  }

  // Helper function to format the address
  const getFormattedAddressForDisplay = (): React.ReactNode => {
    if (type === 'Online') {
      return <span className='italic text-slate-500'>{t('Not_provided')}</span>
    }
    const addressParts = [
      location.address,
      location.cityStateProvince,
      location.country
    ]
      .map(part => part?.trim())
      .filter(Boolean)

    if (addressParts.length > 0) {
      return addressParts.join(', ')
    }
    return <span className='italic text-slate-500'>{t('Not_provided')}</span>
  }

  // Type styling logic remains the same
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

  const dateTypeOptions = getDateTypeOptions(t)

  // Date formatting logic remains the same
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
      if (!fromDate && !toDate)
        return <span className='italic text-slate-500'>{t('N_A')}</span>
      if (
        fromDate &&
        toDate &&
        fromDate.toDateString() === toDate.toDateString()
      ) {
        return fromDate.toLocaleDateString(undefined, options)
      } else if (fromDate && toDate) {
        const fromPart = fromDate.toLocaleDateString(undefined, options)
        const toPart = toDate.toLocaleDateString(undefined, options)
        return `${fromPart} - ${toPart}`
      } else if (fromDate) {
        return fromDate.toLocaleDateString(undefined, options)
      } else if (toDate) {
        return toDate.toLocaleDateString(undefined, options)
      }
    } catch (error) {
      return <span className='italic text-slate-500'>{t('Invalid_Date')}</span>
    }
    return <span className='italic text-slate-500'>{t('N_A')}</span>
  }

  const renderLink = (url: string | undefined | null) => {
    if (url) {
      return (
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='group inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline'
        >
          {/* Truncate long links on small screens, but show full on hover/focus */}
          <span className='truncate'>{url}</span>
          <ExternalLinkIcon
            size={14}
            className='ml-1.5 flex-shrink-0 opacity-70 transition-opacity group-hover:opacity-100'
          />
        </a>
      )
    }
    return renderDetail(null, 'Link_not_provided')
  }

  return (
    // Main wrapper for centering and max-width on large screens
    <div className='mx-auto w-full max-w-7xl bg-gray-10 p-4 sm:p-6 lg:p-8'>
      <header className='mb-6 border-b border-slate-300 pb-4 sm:mb-8'>
        <h2 className='flex items-center text-xl font-bold text-indigo-800 sm:text-2xl md:text-3xl'>
          <PencilLine className='mr-3 h-6 w-6 flex-shrink-0 text-indigo-600 sm:h-8 sm:w-8' />
          {t('Review_Information')}
        </h2>
        <p className='mt-2 text-sm text-slate-600'>
          {t(
            'Please_review_all_conference_details_carefully_before_proceeding'
          )}
        </p>
      </header>

      {/* Main content grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        {/* General Information Section */}
        <div className='lg:col-span-6'>
          <Section title={t('General_Information')} icon={<Info />}>
            <InfoDisplay label={t('Conference_Name')} icon={<FileText />}>
              {renderDetail(title, 'Title_not_provided')}
            </InfoDisplay>
            <InfoDisplay label={t('Acronym')} icon={<FileText />}>
              {renderDetail(acronym, 'Acronym_not_provided')}
            </InfoDisplay>
            <InfoDisplay label={t('Link')} icon={<LinkIcon />}>
              {renderLink(link)}
            </InfoDisplay>
            <InfoDisplay label={t('cfpLink')} icon={<LinkIcon />}>
              {renderLink(cfpLink)}
            </InfoDisplay>
            <InfoDisplay label={t('impLink')} icon={<LinkIcon />}>
              {renderLink(impLink)}
            </InfoDisplay>
            <InfoDisplay
              label={t('Type')}
              icon={React.cloneElement(typeStyle.icon, {
                className: `${typeStyle.icon.props.className} ${typeStyle.color}`
              })}
            >
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${typeStyle.chipColor}`}
              >
                {React.cloneElement(typeStyle.icon, {
                  size: 14,
                  className: 'mr-1'
                })}
                {t(type)}
              </span>
            </InfoDisplay>
          </Section>
        </div>

        {/* Location Section */}
        <div className='lg:col-span-6'>
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
        </div>

        {/* Important Dates & Topics Sections - Full width on the grid */}
        <div className='space-y-6 lg:col-span-12'>
          <Section title={t('Important_Dates')} icon={<CalendarDays />}>
            {dates.length > 0 ? (
              <ul className='space-y-3'>
                {dates.map((date, index) => {
                  const displayTypeName =
                    dateTypeOptions.find(option => option.value === date.type)
                      ?.name || t('N_A')
                  return (
                    <li
                      key={index}
                      className='rounded-md bg-gray-10 p-3 shadow-sm'
                    >
                      <div className='flex flex-wrap items-center justify-between gap-2'>
                        <strong className='text-base text-indigo-700'>
                          {date.name || t('Unnamed_Date')}
                        </strong>
                        <span className='flex-shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700'>
                          {displayTypeName}
                        </span>
                      </div>
                      <div className='mt-1 text-sm text-slate-800'>
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

          <Section title={t('Topics')} icon={<ListChecks />}>
            {topics.length > 0 ? (
              <div className='flex flex-wrap gap-2 pt-1'>
                {topics.map((topic, index) => (
                  <span
                    key={index}
                    className='rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800'
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
      </div>

      {/* Summary & Call for Papers Sections - Full width below the grid */}
      <div className='mt-6 space-y-6'>
        <Section title={t('Summary')} icon={<FileText />}>
          {summary && summary.trim() !== '' ? (
            <div className='prose prose-slate max-w-none dark:prose-invert'>
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

        <Section title={t('Call_for_paper')} icon={<FileText />}>
          {callForPaper && callForPaper.trim() !== '' ? (
            <div className='prose prose-slate max-w-none dark:prose-invert'>
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