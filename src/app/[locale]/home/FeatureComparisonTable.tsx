// src/components/FeatureComparisonTable.tsx
// (Single file, Internal Data, Tooltip *next to icon*, No Category Headers, Title, Increased Padding)

import React, { useState, useMemo } from 'react'

// --- Data Definitions (Interface) ---
interface Feature {
  id: string
  name: string
  description: string | string[]
  requiresLogin: boolean
  isNew?: boolean
}

interface FeatureCategory {
  categoryName: string
  features: Feature[]
}

// --- Static Data ---
const featureData: FeatureCategory[] = [
  {
    categoryName: 'General User Functions',
    features: [
      {
        id: 'auth',
        name: 'Sign Up & Log In',
        description:
          'Log in using a registered account or via Google single sign-on.',
        requiresLogin: false
      },
      {
        id: 'search',
        name: 'Conference Search & Filter',
        description: [
          'Search criteria:',
          'Location',
          'Conference date',
          'Rank',
          'Source',
          'Organization type.'
        ],
        requiresLogin: false
      },
      {
        id: 'location_map',
        name: 'Location Map',
        description:
          'A map showing the conference venue is available on the conference detail page.',
        requiresLogin: false
      },
      {
        id: 'journal_search',
        name: 'Scientific Journal Search',
        description: 'Search for scientific journals.',
        requiresLogin: false
      },
      {
        id: 'chatbot',
        name: 'Chatbot Assistant',
        description: [
          'Answers questions about conference and journal information.',
          'Provides guidance on using the application.',
          'Redirects to relevant pages.',
          'Supports text chat, voice chat, screen sharing, and video.'
        ],
        requiresLogin: false,
        isNew: true
      }
    ]
  },
  {
    categoryName: 'Logged-in User Functions',
    features: [
      {
        id: 'follow',
        name: 'Follow Conference',
        description: 'Click the "Follow" button to track a conference.',
        requiresLogin: true
      },
      {
        id: 'feedback',
        name: 'Conference Feedback',
        description: 'Rate conferences (1-5 stars) and leave comments.',
        requiresLogin: true
      },
      {
        id: 'notes',
        name: 'Personal Notes/Calendar',
        description: [
          'A calendar view shows events/notes for a selected day.',
          'Users can add notes for any specific day using the "+" button.'
        ],
        requiresLogin: true
      },
      {
        id: 'submit_conf',
        name: 'Submit New Conference',
        description:
          'Enter complete conference details and submit. The conference will be added to a pending approval queue.',
        requiresLogin: true
      },
      {
        id: 'notifications',
        name: 'Notifications',
        description: [
          'Receive notifications through the web application.',
          'Receive notifications via registered email.'
        ],
        requiresLogin: true
      },
      {
        id: 'settings',
        name: 'User Settings',
        description: [
          'Option to receive email notifications.',
          'Option to automatically add followed events to personal notes.'
        ],
        requiresLogin: true
      },
      {
        id: 'profile_update',
        name: 'Update Personal Profile',
        description: [
          'Update display name.',
          'Update password.',
          'Update address.'
        ],
        requiresLogin: true
      },
      {
        id: 'chart_visualization',
        name: 'Data Visualization',
        description:
          'Provides capabilities to visualize conference information using charts.',
        requiresLogin: true,
        isNew: true
      }
    ]
  }
]

// --- Helper Components for Icons ---

const CheckIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={2.5}
    stroke='currentColor'
    className={`h-6 w-6 text-green-600 ${className}`}
    aria-hidden='true'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M4.5 12.75l6 6 9-13.5'
    />
  </svg>
)

const CrossIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={2.5}
    stroke='currentColor'
    className={`h-6 w-6 text-red-600 ${className}`}
    aria-hidden='true'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M6 18L18 6M6 6l12 12'
    />
  </svg>
)

const NewBadge: React.FC = () => (
  <span className='ml-2 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 align-middle text-xs font-semibold text-blue-800'>
    NEW
  </span>
)

const InformationCircleIcon: React.FC<{ className?: string }> = ({
  className = ''
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className={`h-5 w-5 ${className}`}
    aria-hidden='true'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z'
    />
  </svg>
)

// --- Tooltip Content Renderer ---
const TooltipContent: React.FC<{ description: string | string[] }> = ({
  description
}) => {
  if (Array.isArray(description)) {
    return (
      <ul className='list-inside list-disc space-y-1 text-left text-xs'>
        {description.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    )
  }
  return <p className='text-left text-xs'>{description}</p>
}

// --- Main Table Component ---

const FeatureComparisonTable: React.FC = () => {
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null)

  const allFeatures = useMemo(
    () =>
      featureData.reduce(
        (acc, category) => acc.concat(category.features),
        [] as Feature[]
      ),
    [featureData]
  )

  return (
    <div className='w-full p-0 md:p-12'>
      <h2 className='mb-4 text-center text-xl font-semibold text-gray-800'>
        Feature Comparison: Guest vs. Logged-in Users
      </h2>
      <div className='overflow-x-auto border border-gray-200 shadow-md sm:rounded-lg'>
        <table className='w-full text-left text-sm text-gray-700'>
          <thead className='bg-gray-100 text-xs uppercase text-gray-700'>
            <tr>
              {/* Padding px-8 py-5 applied */}
              <th
                scope='col'
                className='w-2/4 border-b border-gray-300 px-8 py-5'
              >
                Feature
              </th>
              <th
                scope='col'
                className='border-b border-gray-300 px-8 py-5 text-center'
              >
                Guest User<span className='sr-only'> Availability</span>
              </th>
              <th
                scope='col'
                className='border-b border-gray-300 px-8 py-5 text-center'
              >
                Logged-in User<span className='sr-only'> Availability</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feature, featureIndex) => (
              <tr
                key={feature.id}
                className={`border-b border-gray-200 last:border-b-0 ${featureIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} transition-colors duration-150 hover:bg-gray-100`}
              >
                {/* Feature Name and Tooltip Trigger - Padding px-8 py-5 applied */}
                <td className='px-8 py-5 align-top'>
                  {' '}
                  {/* Removed relative positioning from td */}
                  <div className='flex items-center space-x-2'>
                    {' '}
                    {/* Main container for feature name + icon */}
                    <span className='font-medium text-gray-900'>
                      {feature.name}
                    </span>
                    {feature.isNew && <NewBadge />}
                    {/* === Tooltip Trigger Area === */}
                    {/* Added 'relative' here to make THIS the positioning context for the tooltip */}
                    <div
                      className='relative flex cursor-help items-center' // Added relative and flex
                      onMouseEnter={() => setActiveTooltipId(feature.id)}
                      onMouseLeave={() => setActiveTooltipId(null)}
                    >
                      <InformationCircleIcon className='text-gray-400 hover:text-blue-600' />

                      {/* Tooltip Element - Now positioned relative to the icon's wrapper div */}
                      {activeTooltipId === feature.id && (
                        <div
                          // Position adjusted: left-full (of icon div), centered vertically, small margin
                          className='absolute left-full top-1/2 z-20 ml-2 w-64 max-w-xs -translate-y-1/2 rounded-md bg-gray-800 p-3 text-white shadow-lg'
                          role='tooltip'
                        >
                          <TooltipContent description={feature.description} />
                        </div>
                      )}
                    </div>
                    {/* === End Tooltip Trigger Area === */}
                  </div>
                </td>

                {/* Guest User Availability - Padding px-8 py-5 applied */}
                <td className='px-8 py-5 text-center align-middle'>
                  <div className='inline-flex h-full w-full items-center justify-center'>
                    {feature.requiresLogin ? (
                      <>
                        <CrossIcon />
                        <span className='sr-only'>Not available</span>
                      </>
                    ) : (
                      <>
                        <CheckIcon />
                        <span className='sr-only'>Available</span>
                      </>
                    )}
                  </div>
                </td>

                {/* Logged-in User Availability - Padding px-8 py-5 applied */}
                <td className='px-8 py-5 text-center align-middle'>
                  <div className='inline-flex h-full w-full items-center justify-center'>
                    <CheckIcon />
                    <span className='sr-only'>Available</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// --- Default Export ---
export default FeatureComparisonTable
