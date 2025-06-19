// src/app/[locale]/floatingchatbot/FloatingChatbotSettings.tsx
'use client'

import React, { useState, useEffect } from 'react' // Added useState, useEffect
import { X, Settings } from 'lucide-react'
import LanguageDropdown from '../chatbot/LanguageDropdown'
import { useTranslations } from 'next-intl'
import { useSettingsStore } from '@/src/app/[locale]/chatbot/stores'
import { useShallow } from 'zustand/react/shallow'
import { LanguageOption } from '@/src/app/[locale]/chatbot/stores'
import { useAuth } from '@/src/contexts/AuthContext' // <<< NEW IMPORT
import PersonalizationConfirmationModal from '../chatbot/PersonalizationConfirmationModal' // <<< NEW IMPORT
import { UserResponse } from '@/src/models/response/user.response' // <<< NEW IMPORT

interface FloatingChatbotSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const FloatingChatbotSettings: React.FC<FloatingChatbotSettingsProps> = ({
  isOpen,
  onClose
}) => {
  const t = useTranslations('')
  const { user, isLoggedIn } = useAuth() // <<< NEW: Auth context

  const {
    chatMode, // <<< NEW: Get chatMode
    currentLanguage,
    availableLanguages,
    isStreamingEnabled,
    isConversationToolbarHiddenInFloatingChat,
    isThoughtProcessHiddenInFloatingChat,
    isPersonalizationEnabled, // <<< NEW: Get personalization state
    setCurrentLanguage,
    setIsStreamingEnabled,
    setIsConversationToolbarHiddenInFloatingChat,
    setIsThoughtProcessHiddenInFloatingChat,
    setIsPersonalizationEnabled // <<< NEW: Get personalization action
  } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode, // <<< NEW
      currentLanguage: state.currentLanguage,
      availableLanguages: state.availableLanguages,
      isStreamingEnabled: state.isStreamingEnabled,
      isConversationToolbarHiddenInFloatingChat:
        state.isConversationToolbarHiddenInFloatingChat,
      isThoughtProcessHiddenInFloatingChat:
        state.isThoughtProcessHiddenInFloatingChat,
      isPersonalizationEnabled: state.isPersonalizationEnabled, // <<< NEW
      setCurrentLanguage: state.setCurrentLanguage,
      setIsStreamingEnabled: state.setIsStreamingEnabled,
      setIsConversationToolbarHiddenInFloatingChat:
        state.setIsConversationToolbarHiddenInFloatingChat,
      setIsThoughtProcessHiddenInFloatingChat:
        state.setIsThoughtProcessHiddenInFloatingChat,
      setIsPersonalizationEnabled: state.setIsPersonalizationEnabled // <<< NEW
    }))
  )

  // <<< NEW: State for modals
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false)
  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false)
  const [missingInfoFieldsText, setMissingInfoFieldsText] = useState('')

  const handleStreamingToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsStreamingEnabled(event.target.checked)
  }

  const handleToolbarToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsConversationToolbarHiddenInFloatingChat(event.target.checked)
  }

  const handleThoughtProcessToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsThoughtProcessHiddenInFloatingChat(event.target.checked)
  }

  // <<< NEW: Handlers for personalization
  const proceedToEnablePersonalization = () => {
    setIsPersonalizationEnabled(true)
  }

  const handlePersonalizationToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enable = event.target.checked

    if (enable) {
      if (!user) {
        // Should be disabled, but as a fallback:
        alert(t('Error_Login_Required_Generic'))
        event.target.checked = false // Revert UI
        return
      }

      // It's good practice to fetch the latest user data if critical,
      // but for this UI flow, localStorage might be acceptable if recently updated.
      // For FloatingChatbot, user data might not be as fresh as in main app.
      // Consider if a fresh fetch is needed or if localStorage is sufficient.
      // For now, using localStorage as per RightPanel.
      const currentUserData = JSON.parse(
        localStorage.getItem('user') || '{}'
      ) as UserResponse
      const missingFields: string[] = []
      if (!currentUserData.aboutMe) {
        missingFields.push(t('Profile_AboutMe_Label'))
      }
      if (
        !currentUserData.interestedTopics ||
        currentUserData.interestedTopics.length === 0
      ) {
        missingFields.push(t('Profile_InterestedTopics_Label'))
      }

      if (missingFields.length > 0) {
        setMissingInfoFieldsText(missingFields.join(', '))
        setIsMissingInfoModalOpen(true)
        event.target.checked = false // Revert optimistic UI change
      } else {
        setIsBenefitModalOpen(true)
        event.target.checked = false // Revert optimistic UI change
      }
    } else {
      // User is disabling
      setIsPersonalizationEnabled(false)
    }
  }

  // <<< NEW: Effect to handle logout
  useEffect(() => {
    if (!isLoggedIn) {
      if (isPersonalizationEnabled) {
        setIsPersonalizationEnabled(false)
      }
    }
  }, [isLoggedIn, isPersonalizationEnabled, setIsPersonalizationEnabled])

  if (!isOpen) {
    return null
  }

  return (
    <>
      {' '}
      {/* Use Fragment to include modals */}
      <div
        className='absolute inset-0 z-10 flex h-full w-full flex-col overflow-hidden rounded-b-lg bg-white-pure shadow-inner transition-opacity duration-300 ease-in-out dark:bg-gray-800'
        aria-modal='true'
        role='dialog'
        aria-labelledby='floating-chatbot-settings-title'
      >
        <div className='flex h-full w-full flex-col overflow-y-auto px-4'>
          <div className='flex flex-shrink-0 items-center justify-between border-b border-gray-20 pb-3 pt-3 dark:border-gray-700'>
            <div className='flex items-center space-x-2'>
              {/* <Settings size={18} className='' /> */}
              <h2
                id='floating-chatbot-settings-title'
                className='text-md font-semibold '
              >
                {t('Chat_Settings')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-full  hover:bg-gray-10 hover:text-gray-70 focus:outline-none focus:ring-2 focus:ring-blue-500  dark:hover:bg-gray-700 dark:hover:text-gray-200'
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
                <div className="peer relative h-6 w-10 rounded-full bg-gray-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-30 after:bg-white-pure after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white-pure peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:bg-gray-600 dark:after:border-gray-500 dark:after:bg-gray-700 dark:peer-checked:bg-blue-500 rtl:peer-checked:after:-translate-x-full"></div>
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
                <div className="peer relative h-6 w-10 rounded-full bg-gray-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-30 after:bg-white-pure after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white-pure peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:bg-gray-600 dark:after:border-gray-500 dark:after:bg-gray-700 dark:peer-checked:bg-blue-500 rtl:peer-checked:after:-translate-x-full"></div>
              </label>
              <p className='text-xs  '>
                {t('FloatingChat_Hide_Toolbar_Description')}
              </p>
            </div>

            {/* Hide Thought Process Setting */}
            <div className='space-y-1'>
              <label
                htmlFor='thought-process-toggle-floating'
                className='block text-sm font-medium '
              >
                {t('FloatingChat_Hide_Thought_Process')}
              </label>
              <label
                htmlFor='thought-process-toggle-floating'
                className='inline-flex cursor-pointer items-center'
              >
                <input
                  type='checkbox'
                  id='thought-process-toggle-floating'
                  className='peer sr-only'
                  checked={isThoughtProcessHiddenInFloatingChat}
                  onChange={handleThoughtProcessToggle}
                />
                <div className="peer relative h-6 w-10 rounded-full bg-gray-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-30 after:bg-white-pure after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white-pure peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:bg-gray-600 dark:after:border-gray-500 dark:after:bg-gray-700 dark:peer-checked:bg-blue-500 rtl:peer-checked:after:-translate-x-full"></div>
              </label>
              <p className='text-xs  '>
                {t('FloatingChat_Hide_Thought_Process_Description')}
              </p>
            </div>

            {/* <<< NEW: Personalization Toggle >>> */}
            {chatMode === 'regular' && (
              <div className='space-y-1'>
                <label
                  htmlFor='personalization-toggle-floating'
                  className='block text-sm font-medium '
                >
                  {t('Personalize_Responses_Toggle_Label')}
                </label>
                <label
                  htmlFor='personalization-toggle-floating'
                  className={`inline-flex items-center ${!isLoggedIn ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <input
                    type='checkbox'
                    id='personalization-toggle-floating'
                    className='peer sr-only'
                    checked={isPersonalizationEnabled}
                    onChange={handlePersonalizationToggle}
                    disabled={!isLoggedIn}
                  />
                  <div className="peer relative h-6 w-10 rounded-full bg-gray-20 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-30 after:bg-white-pure after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white-pure peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:bg-gray-600 dark:after:border-gray-500 dark:after:bg-gray-700 dark:peer-checked:bg-blue-500 rtl:peer-checked:after:-translate-x-full"></div>
                </label>
                {!isLoggedIn && (
                  <p className='text-xs  '>
                    {t('Personalization_Login_Required_Message')}
                  </p>
                )}
                {isLoggedIn && isPersonalizationEnabled && (
                  <p className='text-xs  '>
                    {t('Personalization_Enabled_Tooltip')}
                  </p>
                )}
              </div>
            )}

            {/* Language Dropdown Setting */}
            <div className='space-y-1'>
              <LanguageDropdown
                currentLanguage={currentLanguage}
                availableLanguages={availableLanguages}
                onLanguageChange={(lang: LanguageOption) =>
                  setCurrentLanguage(lang)
                }
                disabled={false} // Language can always be changed in floating chat settings
              />
            </div>
          </div>
        </div>
      </div>
      {/* <<< NEW: Modals >>> */}
      <PersonalizationConfirmationModal
        isOpen={isMissingInfoModalOpen}
        onClose={() => setIsMissingInfoModalOpen(false)}
        onConfirm={() => {
          setIsMissingInfoModalOpen(false)
          setIsBenefitModalOpen(true)
        }}
        type='missingInfo'
        missingFieldsText={missingInfoFieldsText}
      />
      <PersonalizationConfirmationModal
        isOpen={isBenefitModalOpen}
        onClose={() => setIsBenefitModalOpen(false)}
        onConfirm={() => {
          proceedToEnablePersonalization()
          setIsBenefitModalOpen(false)
        }}
        type='enableBenefit'
      />
    </>
  )
}

export default FloatingChatbotSettings
