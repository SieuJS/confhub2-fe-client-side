// src/components/FeatureComparisonTable.tsx

import React, { useState, ElementType } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  Check,
  X,
  Info,
  LayoutGrid,
  UserCheck, // Giữ nguyên UserCheck cho các tính năng tài khoản người dùng
  Sparkles,
} from 'lucide-react'

// --- Data & Type Definitions (No changes) ---
interface Feature {
  id: string
  nameKey: string
  descriptionKey: string | string[]
  availability: {
    guest: boolean | string
    loggedIn: boolean | string
  }
  isNew?: boolean
}

interface FeatureCategory {
  categoryNameKey: string
  icon: ElementType
  features: Feature[]
}

const featureDataConfig: FeatureCategory[] = [
  {
    categoryNameKey: 'FeatureComparisonTable.categories.general',
    icon: LayoutGrid,
    features: [
      {
        id: 'auth',
        nameKey: 'FeatureComparisonTable.features.auth.name',
        descriptionKey: 'FeatureComparisonTable.features.auth.description',
        availability: { guest: true, loggedIn: true },
      },
      {
        id: 'search',
        nameKey: 'FeatureComparisonTable.features.search.name',
        descriptionKey: [
          'FeatureComparisonTable.features.search.description.0',
          'FeatureComparisonTable.features.search.description.1',
          'FeatureComparisonTable.features.search.description.2',
          'FeatureComparisonTable.features.search.description.3',
          'FeatureComparisonTable.features.search.description.4',
          'FeatureComparisonTable.features.search.description.5',
        ],
        availability: { guest: true, loggedIn: true },
      },
      {
        id: 'location_map',
        nameKey: 'FeatureComparisonTable.features.location_map.name',
        descriptionKey:
          'FeatureComparisonTable.features.location_map.description',
        availability: { guest: true, loggedIn: true },
      },
      // Chatbot đã được di chuyển khỏi đây
    ],
  },
  {
    // Đổi tên categoryNameKey để phản ánh rõ hơn
    categoryNameKey: 'FeatureComparisonTable.categories.userAccountFeatures', // Tên mới
    icon: UserCheck, // Giữ nguyên hoặc thay đổi nếu muốn một icon khác cho tài khoản người dùng
    features: [
      // Đã di chuyển Chatbot vào đây
      {
        id: 'chatbot',
        nameKey: 'FeatureComparisonTable.features.chatbot.name',
        descriptionKey: [
          'FeatureComparisonTable.features.chatbot.description.0',
          'FeatureComparisonTable.features.chatbot.description.1',
          'FeatureComparisonTable.features.chatbot.description.2',
          'FeatureComparisonTable.features.chatbot.description.3',
        ],
        availability: { guest: false, loggedIn: true },
        isNew: true,
      },
      {
        id: 'follow',
        nameKey: 'FeatureComparisonTable.features.follow.name',
        descriptionKey: 'FeatureComparisonTable.features.follow.description',
        availability: { guest: false, loggedIn: true },
      },
      {
        id: 'feedback',
        nameKey: 'FeatureComparisonTable.features.feedback.name',
        descriptionKey: 'FeatureComparisonTable.features.feedback.description',
        availability: { guest: false, loggedIn: true },
      },
      {
        id: 'notes',
        nameKey: 'FeatureComparisonTable.features.notes.name',
        descriptionKey: [
          'FeatureComparisonTable.features.notes.description.0',
          'FeatureComparisonTable.features.notes.description.1',
        ],
        availability: { guest: false, loggedIn: true },
      },
      {
        id: 'submit_conf',
        nameKey: 'FeatureComparisonTable.features.submit_conf.name',
        descriptionKey:
          'FeatureComparisonTable.features.submit_conf.description',
        availability: { guest: false, loggedIn: true },
      },
      {
        id: 'notifications',
        nameKey: 'FeatureComparisonTable.features.notifications.name',
        descriptionKey: [
          'FeatureComparisonTable.features.notifications.description.0',
          'FeatureComparisonTable.features.notifications.description.1',
        ],
        availability: { guest: false, loggedIn: true },
      },
      {
        id: 'settings',
        nameKey: 'FeatureComparisonTable.features.settings.name',
        descriptionKey: [
          'FeatureComparisonTable.features.settings.description.0',
          'FeatureComparisonTable.features.settings.description.1',
        ],
        availability: { guest: false, loggedIn: true },
      },
      {
        id: 'profile_update',
        nameKey: 'FeatureComparisonTable.features.profile_update.name',
        descriptionKey: [
          'FeatureComparisonTable.features.profile_update.description.0',
          'FeatureComparisonTable.features.profile_update.description.1',
          'FeatureComparisonTable.features.profile_update.description.2',
        ],
        availability: { guest: false, loggedIn: true },
      },
      {
        id: 'chart_visualization',
        nameKey: 'FeatureComparisonTable.features.chart_visualization.name',
        descriptionKey:
          'FeatureComparisonTable.features.chart_visualization.description',
        availability: { guest: false, loggedIn: true },
        isNew: true,
      },
    ],
  },
]

// --- Helper Components (No changes) ---
const NewBadge: React.FC = () => {
  const t = useTranslations('Common')
  return (
    <span className='ml-2 inline-block rounded-md bg-blue-100 px-2 py-0.5 align-middle text-xs font-semibold text-blue-700'>
      {t('new')}
    </span>
  )
}

interface TooltipContentProps {
  descriptionKey: string | string[]
}
const TooltipContent: React.FC<TooltipContentProps> = ({ descriptionKey }) => {
  const t = useTranslations('')
  if (Array.isArray(descriptionKey)) {
    return (
      <ul className='list-inside list-disc space-y-1 text-left text-sm'>
        {descriptionKey.map((key, index) => (
          <li key={index}>{t(key)}</li>
        ))}
      </ul>
    )
  }
  return <p className='text-left text-sm'>{t(descriptionKey)}</p>
}

const AvailabilityCell: React.FC<{ value: boolean | string }> = ({
  value,
}) => {
  const t = useTranslations('FeatureComparisonTable.availability')
  if (typeof value === 'string') {
    return <p className='text-sm text-gray-700'>{value}</p>
  }
  if (value) {
    return (
      <>
        <Check className='h-5 w-5 text-blue-600' />
        <span className='sr-only'>{t('available')}</span>
      </>
    )
  }
  return (
    <>
      <X className='h-5 w-5 text-gray-400' />
      <span className='sr-only'>{t('notAvailable')}</span>
    </>
  )
}

// --- Main Table Component ---
const FeatureComparisonTable: React.FC = () => {
  const t = useTranslations('FeatureComparisonTable')
  const tg = useTranslations('') // Global namespace for features
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null)

  const totalFeatures = featureDataConfig.reduce(
    (acc, category) => acc + category.features.length,
    0,
  )
  let featureCounter = 0

  return (
    <div className='w-full bg-white-pure py-16 sm:py-24'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='flow-root'>
          <div className='-mx-6 -my-2 overflow-x-auto'>
            <div className='inline-block min-w-full px-6 py-2 align-middle'>
              <table className='min-w-full border-separate border-spacing-0'>
                <thead>
                  <tr>
                    <td className='p-6 align-bottom text-gray-900'>
                      <h2 className='text-4xl font-light tracking-tight'>
                        <strong className='font-bold'>
                          {t('headers.mainTitleStrong')}
                        </strong>{' '}
                        {t('headers.mainTitleNormal')}
                      </h2>
                      <p className='mt-2 mb-8 text-lg leading-8 text-gray-600'>
                        {t('headers.mainSubtitle')}
                      </p>
                    </td>
                    <th className='h-full max-w-xs p-6 align-top'>
                      <div className='flex h-full flex-col justify-between text-center'>
                        <div>
                          <p className='text-sm font-semibold uppercase tracking-wide text-gray-500'>
                            {t('headers.guest')}
                          </p>
                          <p className='mt-4 text-sm text-gray-600'>
                            {t('headers.guestDescription')}
                          </p>
                        </div>
                      </div>
                    </th>
                    <th className='relative h-full max-w-xs rounded-t-lg border-x border-t-4 border-blue-600 bg-white-pure p-6 align-top shadow-md'>
                      <div className='flex h-full flex-col justify-between text-center'>
                        <div>
                          <p className='text-sm font-semibold uppercase tracking-wide text-blue-600'>
                            {t('headers.loggedIn')}
                          </p>
                          <p className='mt-4 text-sm text-gray-600'>
                            {t('headers.loggedInDescription')}
                          </p>
                        </div>
                        <div className='mt-6'>
                          <Link
                            href='/auth/register'
                            className='inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700'
                          >
                            {t('headers.registerNow')}
                          </Link>
                        </div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureDataConfig.map((category) => (
                    <React.Fragment key={category.categoryNameKey}>
                      {/* ====== MODIFIED: Category Header Row ====== */}
                      <tr className='border-b border-gray-200'>
                        {/* Cell 1: Title */}
                        <th
                          scope='row'
                          className='bg-gray-10 py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6'
                        >
                          <div className='flex items-center gap-x-3'>
                            <category.icon
                              className='h-5 w-5 text-blue-600'
                              aria-hidden='true'
                            />
                            {tg(category.categoryNameKey)}
                          </div>
                        </th>
                        {/* Cell 2: Guest Column (empty but keeps structure) */}
                        <th scope='row' className='bg-gray-10'></th>
                        {/* Cell 3: Logged-in Column (with vertical border) */}
                        <th
                          scope='row'
                          className='bg-gray-10 border-x border-blue-600'
                        ></th>
                      </tr>

                      {/* Feature Rows */}
                      {category.features.map((feature) => {
                        featureCounter++
                        const isLastRow = featureCounter === totalFeatures

                        return (
                          <tr
                            key={feature.id}
                            className='border-b border-gray-200 last:border-none'
                          >
                            <td className='relative py-5 pl-4 pr-3 text-sm sm:pl-6'>
                              <div className='flex items-center font-medium text-gray-900'>
                                <span>{tg(feature.nameKey)}</span>
                                {feature.isNew && <NewBadge />}
                                <div
                                  className='relative ml-2 flex cursor-help items-center'
                                  onMouseEnter={() =>
                                    setActiveTooltipId(feature.id)
                                  }
                                  onMouseLeave={() => setActiveTooltipId(null)}
                                >
                                  <Info className='h-4 w-4 text-gray-500 hover:text-blue-600' />
                                  {activeTooltipId === feature.id && (
                                    <div
                                      className='absolute left-full top-1/2 z-20 ml-3 w-72 -translate-y-1/2 rounded-lg border border-gray-200 bg-white-pure p-3 shadow-xl'
                                      role='tooltip'
                                    >
                                      <TooltipContent
                                        descriptionKey={feature.descriptionKey}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className='py-5 text-center'>
                              <div className='inline-flex w-full justify-center'>
                                <AvailabilityCell
                                  value={feature.availability.guest}
                                />
                              </div>
                            </td>
                            {/* ====== MODIFIED: Logged-in User Cell ====== */}
                            <td
                              className={`py-5 text-center border-x border-blue-600 ${
                                isLastRow
                                  ? 'border-b rounded-b-lg'
                                  : ''
                              }`}
                            >
                              <div className='inline-flex w-full justify-center'>
                                <AvailabilityCell
                                  value={feature.availability.loggedIn}
                                />
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureComparisonTable