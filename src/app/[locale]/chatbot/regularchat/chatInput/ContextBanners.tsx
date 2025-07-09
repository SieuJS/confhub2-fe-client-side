// src/app/[locale]/chatbot/regularchat/chat-input/components/ContextBanners.tsx
import React from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, Info } from 'lucide-react'
import { CURRENT_PAGE_CONTEXT_INFO_TEXT_KEY } from '@/src/app/[locale]/chatbot/lib/constants'

interface ContextBannersProps {
  contextSuggestionMessage: string | null
  isContextAttachedNextSend: boolean
  isCurrentPageFeatureEnabled: boolean
}

const ContextBanners: React.FC<ContextBannersProps> = ({
  contextSuggestionMessage,
  isContextAttachedNextSend,
  isCurrentPageFeatureEnabled
}) => {
  const t = useTranslations()

  return (
    <>
      {contextSuggestionMessage && (
        <div className='mb-1 flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 dark:border-red-700 dark:bg-red-900 dark:text-red-400'>
          <AlertTriangle size={14} className='mr-2 flex-shrink-0' />
          {contextSuggestionMessage}
        </div>
      )}
      {isContextAttachedNextSend && isCurrentPageFeatureEnabled && (
        <div className='mb-1 flex items-center rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs text-blue-600 dark:border-blue-700 dark:bg-blue-900 dark:text-blue-300'>
          <Info size={14} className='mr-2 flex-shrink-0' />
          {t(CURRENT_PAGE_CONTEXT_INFO_TEXT_KEY)}
        </div>
      )}
    </>
  )
}

export default ContextBanners