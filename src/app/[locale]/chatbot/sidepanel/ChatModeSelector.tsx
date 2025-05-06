// src/components/layout/sidepanel/ChatModeSelector.tsx
import React from 'react'
import { ChatMode } from '@/src/app/[locale]/chatbot/lib/live-chat.types'
import { Radio, Bot } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ChatModeSelectorProps {
  currentChatMode: ChatMode
  onChatModeChange: (mode: ChatMode) => void
  disabled: boolean // Combined disable logic
}

const ChatModeSelector: React.FC<ChatModeSelectorProps> = ({
  currentChatMode,
  onChatModeChange,
  disabled
}) => {
  const t = useTranslations()

  return (
    <div className='mb-6'>
      <label className='mb-3 block text-sm font-medium text-gray-700'>
        {t('Chat_Mode')}
      </label>
      <div className='grid grid-cols-2 gap-3'>
        <button
          type='button'
          onClick={() => onChatModeChange('live')}
          disabled={disabled}
          className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
            currentChatMode === 'live'
              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
          }`}
          aria-pressed={currentChatMode === 'live'}
        >
          <Radio
            size={24}
            className={`mb-1 ${currentChatMode === 'live' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}
          />
          <span
            className={`text-sm font-medium ${currentChatMode === 'live' ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-800'}`}
          >
            {t('Live_Stream')}
          </span>
        </button>
        <button
          type='button'
          onClick={() => onChatModeChange('regular')}
          disabled={disabled}
          className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${
            currentChatMode === 'regular'
              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
          }`}
          aria-pressed={currentChatMode === 'regular'}
        >
          <Bot
            size={24}
            className={`mb-1 ${currentChatMode === 'regular' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}
          />
          <span
            className={`text-sm font-medium ${currentChatMode === 'regular' ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-800'}`}
          >
            {t('Regular_Chat')}
          </span>
        </button>
      </div>
    </div>
  )
}

export default ChatModeSelector
