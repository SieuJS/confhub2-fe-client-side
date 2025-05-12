// src/app/[locale]/floatingchatbot/FloatingChatbotSettings.tsx
'use client'

import React from 'react'
import { X, Settings } from 'lucide-react'
import LanguageDropdown from '../chatbot/LanguageDropdown'
import { useTranslations } from 'next-intl'
import { useSettingsStore } from '@/src/app/[locale]/chatbot/stores'
import { useShallow } from 'zustand/react/shallow'
import { LanguageOption } from '@/src/app/[locale]/chatbot/stores'

interface FloatingChatbotSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const FloatingChatbotSettings: React.FC<FloatingChatbotSettingsProps> = ({
  isOpen,
  onClose
}) => {
  const t = useTranslations('')

  const {
    currentLanguage,
    availableLanguages,
    isStreamingEnabled,
    isConversationToolbarHiddenInFloatingChat,
    isThoughtProcessHiddenInFloatingChat, // <-- Get new state
    setCurrentLanguage,
    setIsStreamingEnabled,
    setIsConversationToolbarHiddenInFloatingChat,
    setIsThoughtProcessHiddenInFloatingChat // <-- Get new action
  } = useSettingsStore(
    useShallow(state => ({
      currentLanguage: state.currentLanguage,
      availableLanguages: state.availableLanguages,
      isStreamingEnabled: state.isStreamingEnabled,
      isConversationToolbarHiddenInFloatingChat: state.isConversationToolbarHiddenInFloatingChat,
      isThoughtProcessHiddenInFloatingChat: state.isThoughtProcessHiddenInFloatingChat, // <-- Access
      setCurrentLanguage: state.setCurrentLanguage,
      setIsStreamingEnabled: state.setIsStreamingEnabled,
      setIsConversationToolbarHiddenInFloatingChat: state.setIsConversationToolbarHiddenInFloatingChat,
      setIsThoughtProcessHiddenInFloatingChat: state.setIsThoughtProcessHiddenInFloatingChat // <-- Access
    }))
  )

  const handleStreamingToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsStreamingEnabled(event.target.checked)
  }

  const handleToolbarToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsConversationToolbarHiddenInFloatingChat(event.target.checked)
  }

  const handleThoughtProcessToggle = ( // <-- New handler
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsThoughtProcessHiddenInFloatingChat(event.target.checked)
  }


  if (!isOpen) {
    return null
  }

  return (
    <div
      className='absolute inset-0 z-10 flex h-full w-full flex-col overflow-hidden rounded-b-lg bg-white-pure shadow-inner transition-opacity duration-300 ease-in-out'
      aria-modal='true'
      role='dialog'
      aria-labelledby='floating-chatbot-settings-title'
    >
      <div className='flex h-full w-full flex-col overflow-y-auto px-4'>
        <div className='flex flex-shrink-0 items-center justify-between border-b border-gray-20 pb-3 pt-3'>
          <div className='flex items-center space-x-2'>
            <Settings size={18} className='' />
            <h2
              id='floating-chatbot-settings-title'
              className='text-md font-semibold '
            >
              {t('Chat_Settings')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-full  hover:bg-gray-10 hover:text-gray-70 focus:outline-none focus:ring-2 focus:ring-blue-500'
            title={t('Close_settings')}
            aria-label={t('Close_settings')}
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className='flex-grow space-y-5 py-4'>
          {/* Stream Response Setting */}
          <div className='space-y-1'>
            <label
              htmlFor='streaming-toggle-floating'
              className='block text-sm font-medium '
            >
              {t('Stream_Response')}
            </label>
            <label
              htmlFor='streaming-toggle-floating'
              className='inline-flex cursor-pointer items-center'
            >
              <input
                type='checkbox'
                id='streaming-toggle-floating'
                className='peer sr-only'
                checked={isStreamingEnabled}
                onChange={handleStreamingToggle}
              />
              <div className="peer relative h-6 w-10 rounded-full bg-gray-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-30 after:bg-white-pure after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white-pure peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full"></div>
            </label>
          </div>

          {/* Hide Conversation Toolbar Setting */}
          <div className='space-y-1'>
            <label
              htmlFor='toolbar-toggle-floating'
              className='block text-sm font-medium '
            >
              {t('FloatingChat_Hide_Toolbar')}
            </label>
            <label
              htmlFor='toolbar-toggle-floating'
              className='inline-flex cursor-pointer items-center'
            >
              <input
                type='checkbox'
                id='toolbar-toggle-floating'
                className='peer sr-only'
                checked={isConversationToolbarHiddenInFloatingChat}
                onChange={handleToolbarToggle}
              />
              <div className="peer relative h-6 w-10 rounded-full bg-gray-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-30 after:bg-white-pure after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white-pure peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full"></div>
            </label>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {t('FloatingChat_Hide_Toolbar_Description')}
            </p>
          </div>

          {/* Hide Thought Process Setting */}
          <div className='space-y-1'>
            <label
              htmlFor='thought-process-toggle-floating'
              className='block text-sm font-medium '
            >
              {t('FloatingChat_Hide_Thought_Process')} {/* Thêm key translation mới */}
            </label>
            <label
              htmlFor='thought-process-toggle-floating'
              className='inline-flex cursor-pointer items-center'
            >
              <input
                type='checkbox'
                id='thought-process-toggle-floating'
                className='peer sr-only'
                checked={isThoughtProcessHiddenInFloatingChat} // true = hidden
                onChange={handleThoughtProcessToggle}
              />
              <div className="peer relative h-6 w-10 rounded-full bg-gray-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-30 after:bg-white-pure after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white-pure peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full"></div>
            </label>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {t('FloatingChat_Hide_Thought_Process_Description')} {/* Thêm key translation mới */}
            </p>
          </div>

          {/* Language Dropdown Setting */}
          <div className='space-y-1'>
            <LanguageDropdown
              currentLanguage={currentLanguage}
              availableLanguages={availableLanguages}
              onLanguageChange={(lang: LanguageOption) =>
                setCurrentLanguage(lang)
              }
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloatingChatbotSettings