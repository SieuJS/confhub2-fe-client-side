// src/app/[locale]/addconference/components/steps/ConferenceReviewStep.tsx
import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Info,
  MapPin,
  CalendarDays,
  ListChecks,
  Image as ImageIcon,
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
  type: 'Offline' | 'Online' | 'Hybrid'
  location: LocationInput
  dates: ImportantDateInput[]
  topics: string[]
  imageUrl: string
  description: string
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
  <div className='py-2.5 border-b border-slate-200 last:border-b-0'>
    <div className='flex items-center text-sm font-medium text-slate-500 mb-1'>
      {icon && React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4 mr-2 text-slate-400 flex-shrink-0' })}
      <span>{label}</span>
    </div>
    <div className='text-slate-800 break-words text-sm sm:text-base'>{children}</div>
  </div>
)

// Helper component for section cards
interface SectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}

const Section: React.FC<SectionProps> = ({ title, icon, children, className = '' }) => (
  <div className={`bg-white shadow-lg rounded-xl p-5 sm:p-6 ${className}`}>
    <div className='flex items-center text-lg sm:text-xl font-semibold text-indigo-700 mb-4 pb-3 border-b border-indigo-100'>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6 mr-3 text-indigo-500 flex-shrink-0' })}
      {title}
    </div>
    <div className='space-y-1'>{children}</div>
  </div>
)

const ConferenceReviewStep: React.FC<ConferenceReviewStepProps> = ({
  title,
  acronym,
  link,
  type,
  location,
  dates,
  topics,
  imageUrl,
  description,
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
      return <span className='italic text-slate-500'>{t(onlineFallbackKey)}</span>
    }
    if (value && String(value).trim() !== '') {
      return String(value)
    }
    return <span className='italic text-slate-500'>{t(fallbackKey)}</span>
  }

  // Helper function to format the address for display in review
  const getFormattedAddressForDisplay = (): React.ReactNode => {
    if (type === 'Online') {
      return <span className='italic text-slate-500'>{t('Not_applicable_for_online')}</span>
    }

    const originalAddress = location.address?.trim()
    const cityStateProvince = location.cityStateProvince?.trim()
    const country = location.country?.trim()

    let combinedAddressParts = []
    if (originalAddress) combinedAddressParts.push(originalAddress)
    if (cityStateProvince) combinedAddressParts.push(cityStateProvince)
    if (country) combinedAddressParts.push(country)

    if (combinedAddressParts.length > 0) {
      return combinedAddressParts.join(', ')
    }
    return <span className='italic text-slate-500'>{t('Not_provided')}</span>
  }

  const getTypeIconAndColor = () => {
    switch (type) {
      case 'Online':
        return { icon: <Monitor className='w-5 h-5 mr-1.5' />, color: 'text-sky-600', chipColor: 'bg-sky-100 text-sky-700' }
      case 'Offline':
        return { icon: <Users className='w-5 h-5 mr-1.5' />, color: 'text-green-600', chipColor: 'bg-green-100 text-green-700' }
      case 'Hybrid':
        return { icon: <GitFork className='w-5 h-5 mr-1.5' />, color: 'text-purple-600', chipColor: 'bg-purple-100 text-purple-700' }
      default:
        return { icon: <ShieldAlert className='w-5 h-5 mr-1.5' />, color: 'text-slate-600', chipColor: 'bg-slate-100 text-slate-700' }
    }
  }
  const typeStyle = getTypeIconAndColor();

  // Lấy các options loại ngày một lần
  const dateTypeOptions = getDateTypeOptions(t);

  return (
    <div className='bg-slate-50 p-3 sm:p-6 rounded-lg min-h-screen'>
      <header className='mb-6 sm:mb-8 pb-4 border-b border-slate-300'>
        <h2 className='text-2xl sm:text-3xl font-bold text-indigo-800 flex items-center'>
          <PencilLine className='w-7 h-7 sm:w-8 sm:h-8 mr-3 text-indigo-600 flex-shrink-0' />
          {t('Review_Information')}
        </h2>
        <p className='mt-2 text-sm text-slate-600'>
          {t('Please_review_all_conference_details_carefully_before_proceeding')}
        </p>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                className='text-blue-600 hover:text-blue-800 hover:underline flex items-center group'
              >
                {link} <ExternalLinkIcon size={14} className='ml-1.5 opacity-70 group-hover:opacity-100 transition-opacity' />
              </a>
            ) : (
              renderDetail(null, 'Link_not_provided')
            )}
          </InfoDisplay>
          <InfoDisplay label={t('Type')} icon={React.cloneElement(typeStyle.icon, { className: `${typeStyle.icon.props.className} ${typeStyle.color}`})}>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full inline-flex items-center ${typeStyle.chipColor}`}>
              {React.cloneElement(typeStyle.icon, {size: 14, className: 'mr-1'})}
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
            {renderDetail(location.continent, 'Not_provided', 'Not_applicable_for_online')}
          </InfoDisplay>
          <InfoDisplay label={t('Country')} icon={<Map />}>
            {renderDetail(location.country, 'Not_provided', 'Not_applicable_for_online')}
          </InfoDisplay>
          <InfoDisplay
            label={
              statesForReview.length > 0 ||
              (!statesForReview.length && !citiesForReview.length && location.cityStateProvince)
                ? t('State_Province')
                : t('City')
            }
            icon={<Building />}
          >
            {renderDetail(location.cityStateProvince, 'Not_provided', 'Not_applicable_for_online')}
          </InfoDisplay>
        </Section>

        {/* Important Dates Section */}
        <Section title={t('Important_Dates')} icon={<CalendarDays />} className="md:col-span-2">
          {dates.length > 0 ? (
            <ul className='space-y-3'>
              {dates.map((date, index) => {
                // Tìm tên hiển thị cho loại ngày từ dateTypeOptions
                const displayTypeName = dateTypeOptions.find(option => option.value === date.type)?.name || t('N_A');
                return (
                  <li key={index} className='p-3 bg-slate-100 rounded-lg shadow-sm'>
                    <div className='flex justify-between items-center'>
                      <strong className='text-indigo-700 text-base'>{date.name || t('Unnamed_Date')}</strong>
                      <span className='text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium'>
                        {displayTypeName} {/* Sử dụng tên hiển thị đã dịch */}
                      </span>
                    </div>
                    <div className='text-sm text-slate-600 mt-1'>
                      {date.fromDate || t('N_A')} - {date.toDate || t('N_A')}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            renderDetail(null, 'No_dates_added')
          )}
        </Section>

        {/* Topics Section */}
        <Section title={t('Topics')} icon={<ListChecks />} className="md:col-span-2">
          {topics.length > 0 ? (
            <div className='flex flex-wrap gap-2 pt-1'>
              {topics.map((topic, index) => (
                <span
                  key={index}
                  className='bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full text-md font-medium shadow-sm'
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

      {/* Image URL Section - Full width */}
      {imageUrl && (
        <div className='mt-6'>
          <Section title={t('Conference_Banner_Image')} icon={<ImageIcon />}>
            <InfoDisplay label={t('Image_Link')} icon={<LinkIcon />}>
              <a
                href={imageUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-600 hover:text-blue-800 hover:underline flex items-center group'
              >
                {imageUrl} <ExternalLinkIcon size={14} className='ml-1.5 opacity-70 group-hover:opacity-100 transition-opacity' />
              </a>
            </InfoDisplay>
          </Section>
        </div>
      )}

      {/* Description / Call for Papers Section - Full width */}
      <div className='mt-6'>
        <Section title={t('Call_for_Papers')} icon={<FileText />}>
          {description && description.trim() !== '' ? (
            <div className='prose prose-base dark:prose-invert max-w-none'>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
            </div>
          ) : (
            <div className='py-2'>
                {renderDetail(null, 'No_description_provided')}
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}

export default ConferenceReviewStep