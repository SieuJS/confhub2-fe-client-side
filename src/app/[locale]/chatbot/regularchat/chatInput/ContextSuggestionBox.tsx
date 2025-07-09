// src/app/[locale]/chatbot/regularchat/chat-input/components/ContextSuggestionBox.tsx
import React from 'react'
import { useTranslations } from 'next-intl'
import { CURRENT_PAGE_CONTEXT_COMMAND, CURRENT_PAGE_CONTEXT_SUGGESTION_KEY } from '@/src/app/[locale]/chatbot/lib/constants'

interface ContextSuggestionBoxProps {
  onSelect: () => void
}

const ContextSuggestionBox: React.FC<ContextSuggestionBoxProps> = ({ onSelect }) => {
  const t = useTranslations()

  return (
    <div className='absolute bottom-full left-0 right-0 z-10 mb-1 max-h-40 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600'>
      <ul>
        <li
          className='cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600'
          onClick={onSelect}
          onMouseDown={e => e.preventDefault()} // Prevent blur on textarea
        >
          <strong>{CURRENT_PAGE_CONTEXT_COMMAND}</strong> -{' '}
          {t(CURRENT_PAGE_CONTEXT_SUGGESTION_KEY)}
        </li>
      </ul>
    </div>
  )
}

export default ContextSuggestionBox