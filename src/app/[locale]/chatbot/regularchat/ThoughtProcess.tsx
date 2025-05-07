// src/components/ThoughtProcess.tsx
import React, { useState } from 'react'
import { ThoughtStep } from '@/src/app/[locale]/chatbot/lib/regular-chat.types' // Adjust path if needed
import {
  FiDownloadCloud, // processing_input
  FiCpu, // thinking
  FiSettings, // function_call (general)
  FiSearch, // retrieving_info, finding_item_id
  FiDatabase, // parsing_api_response, processing_function_result
  FiEdit, // generating_response
  FiAlertTriangle, // function_error, general error steps
  FiMapPin, // map_action_prepared
  FiLink, // navigation_action_prepared
  FiUserCheck, // checking_authentication, checking_follow_status
  FiCheckCircle, // function_success, update_success, item_id_found, etc.
  FiXCircle, // function_failed, data_not_found, item_id_not_found etc.
  FiHelpCircle, // default / unknown step
  FiShare2, // preparing_api_call, executing_api_call
  FiInfo, // validating_*
  FiThumbsUp, // follow_action_prepared (follow)
  FiThumbsDown, // follow_action_prepared (unfollow)
  FiRepeat, // determining_follow_action
  FiZap, // action_prepared (generic)
  FiPlayCircle
} from 'react-icons/fi' // Example icons from Feather Icons
import { MdOutlineAltRoute } from 'react-icons/md'

// --- Enhanced Step Icon Mapping ---
// Using React Icon components directly
const stepIcons: { [key: string]: React.ElementType } = {
  // General Flow
  processing_input: FiDownloadCloud,
  thinking: FiCpu,
  generating_response: FiEdit,

  // Function Calling Core
  function_call: FiSettings, // When the decision to call a function is made
  validating_function_args: FiInfo,
  processing_function_result: FiDatabase, // After getting result back from handler
  function_error: FiAlertTriangle, // General error during function execution
  unknown_function: FiHelpCircle, // If function name not found

  // Data Retrieval / Searching
  retrieving_info: FiSearch, // Generic data fetch
  finding_item_id: FiSearch,
  item_id_found: FiCheckCircle,
  item_id_not_found: FiXCircle,
  data_found: FiCheckCircle,
  processing_request: FiPlayCircle, // Hoặc FiSettings, FiCpu?
  data_not_found: FiXCircle,
  parsing_api_response: FiDatabase,

  // Specific Actions & Validations
  checking_authentication: FiUserCheck,
  checking_status: FiUserCheck, // e.g., follow status
  follow_status_checked: FiCheckCircle, // Maybe FiInfo if just informational

  determining_follow_action: FiRepeat,
  follow_action_determined: FiCheckCircle, // Use FiInfo if just informational?
  preparing_follow_api_call: FiShare2,
  executing_follow_api_call: FiShare2,
  follow_update_success: FiThumbsUp, // More specific than FiCheckCircle maybe
  follow_update_failed: FiAlertTriangle,

  validating_navigation_url: FiInfo,
  navigation_action_prepared: FiLink,

  validating_map_location: FiInfo,
  map_action_prepared: FiMapPin,

  action_prepared: FiZap, // Generic action ready

  // Generic Success/Failure/Warning within steps
  update_success: FiCheckCircle,
  update_failed: FiXCircle,
  api_call_failed: FiAlertTriangle,
  function_warning: FiAlertTriangle,

  // Backend/System Steps (less common for user view but possible)
  max_turns_exceeded: FiAlertTriangle,
  unknown_handler_error: FiAlertTriangle,

  routng_task: MdOutlineAltRoute,
  // --- Fallback ---
  default: FiHelpCircle
}

const getIcon = (stepKey: string): React.ElementType => {
  // Allow mapping multiple backend steps to the same frontend icon easily
  const mapping: { [key: string]: string } = {
    checking_follow_status: 'checking_status',
    executing_backend_call: 'preparing_api_call' // Example backend step name mapped
    // Add more specific backend steps here if they map to an existing icon key
  }
  const mappedKey = mapping[stepKey] || stepKey
  return stepIcons[mappedKey] || stepIcons.default
}

interface ThoughtProcessProps {
  thoughts: ThoughtStep[]
}

const ThoughtProcess: React.FC<ThoughtProcessProps> = ({ thoughts }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (!thoughts || thoughts.length === 0) {
    return null
  }

  const toggleOpen = () => setIsOpen(!isOpen)

  const renderDetails = (details: any) => {
    if (!details || Object.keys(details).length === 0) {
      return null
    }
    // Simple JSON string representation for now. Could be formatted nicely.
    return (
      <pre className='ml-5 mt-1 whitespace-pre-wrap break-words border-l border-gray-300 pl-2 text-[10px] dark:border-gray-600 dark:text-gray-400'>
        {JSON.stringify(details, null, 2)}
      </pre>
    )
  }

  return (
    <div className='bg-gray-5 mb-2  rounded border border-gray-200 text-sm shadow-sm  dark:border-gray-700'>
      <button
        onClick={toggleOpen}
        className='flex w-full items-center justify-between rounded-t px-3 py-1.5 text-left font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:hover:bg-gray-700' // Added focus ring and rounded-t
        aria-expanded={isOpen}
        aria-controls='thought-details' // Accessibility
      >
        <span className='text-xs font-semibold'>
          {' '}
          {/* Slightly bolder text */}
          {isOpen ? 'Hide' : 'Show'} Thought Process ({thoughts.length} steps)
        </span>
        {/* Chevron Icon */}
        <svg
          className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} // Slightly larger icon
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M19 9l-7 7-7-7'
          ></path>
        </svg>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <ul
          id='thought-details' // Accessibility
          className='pretty-scrollbar max-h-60 space-y-2 overflow-y-auto border-t border-gray-200 p-3 dark:border-gray-700' // Increased max-height, padding, spacing, custom scrollbar class (define elsewhere)
        >
          {thoughts.map((thought, index) => {
            const IconComponent = getIcon(thought.step)
            return (
              <li key={index} className='text-xs'>
                {' '}
                {/* Base size for the list item */}
                <div className='flex items-start space-x-2'>
                  {' '}
                  {/* Align icon and text */}
                  <span
                    className='flex-shrink-0 pt-0.5 text-blue-500 dark:text-blue-400'
                    title={thought.step}
                    aria-label={thought.step.replace(/_/g, ' ')}
                  >
                    {' '}
                    {/* Icon styling */}
                    <IconComponent className='h-3.5 w-3.5' />{' '}
                    {/* Consistent icon size */}
                  </span>
                  <div className='flex-grow'>
                    {' '}
                    {/* Container for message and details */}
                    <span>{thought.message}</span>
                    {/* Render Details Conditionally */}
                    {renderDetails(thought.details)}
                  </div>
                  {/* Timestamp aligned to the right */}
                  <span className='flex-shrink-0  whitespace-nowrap pl-2 text-[10px]'>
                    {new Date(thought.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {/* Optional: Add a custom scrollbar style */}
      <style jsx>{`
        .pretty-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .pretty-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .pretty-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.4); // gray-400 with opacity
          border-radius: 3px;
        }
        .dark .pretty-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(107, 114, 128, 0.5); // gray-500 with opacity
        }
      `}</style>
    </div>
  )
}

export default ThoughtProcess
