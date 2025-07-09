// src/app/[locale]/floatingchatbot/FloatingChatbotSettings.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import LanguageDropdown from '../chatbot/LanguageDropdown'
import { useTranslations } from 'next-intl'
import { useSettingsStore } from '@/src/app/[locale]/chatbot/stores'
import { useShallow } from 'zustand/react/shallow'
import { useAuth } from '@/src/contexts/AuthContext'
import PersonalizationConfirmationModal from '../chatbot/PersonalizationConfirmationModal'
import { UserResponse } from '@/src/models/response/user.response'

import ModelSelectionDropdown from '../chatbot/ModelSelectionDropdown'
import { AVAILABLE_MODELS } from '../chatbot/lib/models'
import { LanguageOption, ModelOption } from '@/src/app/[locale]/chatbot/stores'

interface FloatingChatbotSettingsProps {
  isOpen: boolean
  onClose: () => void
}

const FloatingChatbotSettings: React.FC<FloatingChatbotSettingsProps> = ({
  isOpen,
  onClose
}) => {
  const t = useTranslations('')
  const { user, isLoggedIn } = useAuth()

  const {
    chatMode,
    currentLanguage,
    availableLanguages,
    isStreamingEnabled,
    isConversationToolbarHiddenInFloatingChat,
    isThoughtProcessHiddenInFloatingChat,
    isPersonalizationEnabled,
    selectedModel,
    setCurrentLanguage,
    setIsStreamingEnabled,
    setIsConversationToolbarHiddenInFloatingChat,
    setIsThoughtProcessHiddenInFloatingChat,
    setIsPersonalizationEnabled,
    setSelectedModel
  } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode,
      currentLanguage: state.currentLanguage,
      availableLanguages: state.availableLanguages,
      isStreamingEnabled: state.isStreamingEnabled,
      isConversationToolbarHiddenInFloatingChat:
        state.isConversationToolbarHiddenInFloatingChat,
      isThoughtProcessHiddenInFloatingChat:
        state.isThoughtProcessHiddenInFloatingChat,
      isPersonalizationEnabled: state.isPersonalizationEnabled,
      selectedModel: state.selectedModel,
      setCurrentLanguage: state.setCurrentLanguage,
      setIsStreamingEnabled: state.setIsStreamingEnabled,
      setIsConversationToolbarHiddenInFloatingChat:
        state.setIsConversationToolbarHiddenInFloatingChat,
      setIsThoughtProcessHiddenInFloatingChat:
        state.setIsThoughtProcessHiddenInFloatingChat,
      setIsPersonalizationEnabled: state.setIsPersonalizationEnabled,
      setSelectedModel: state.setSelectedModel
    }))
  )

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

  const proceedToEnablePersonalization = () => {
    setIsPersonalizationEnabled(true)
  }

  const handlePersonalizationToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enable = event.target.checked
    if (enable) {
      if (!isLoggedIn || !user) {
        alert(t('Error_Login_Required_Generic'))
        event.target.checked = false
        return
      }
      const currentUserData = JSON.parse(
        localStorage.getItem('user') || '{}'
      ) as UserResponse
      const missingFields: string[] = []
      if (!currentUserData.aboutMe)
        missingFields.push(t('Profile_AboutMe_Label'))
      if (
        !currentUserData.interestedTopics ||
        currentUserData.interestedTopics.length === 0
      )
        missingFields.push(t('Profile_InterestedTopics_Label'))

      if (missingFields.length > 0) {
        setMissingInfoFieldsText(missingFields.join(', '))
        setIsMissingInfoModalOpen(true)
        event.target.checked = false
      } else {
        setIsBenefitModalOpen(true)
        event.target.checked = false
      }
    } else {
      setIsPersonalizationEnabled(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn && isPersonalizationEnabled) {
      setIsPersonalizationEnabled(false)
    }
  }, [isLoggedIn, isPersonalizationEnabled, setIsPersonalizationEnabled])

  if (!isOpen) {
    return null
  }

  // Component cho nút bật/tắt (Toggle Switch) để tái sử dụng
  const ToggleSwitch: React.FC<{
    id: string
    checked: boolean
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    label: string
    description?: string
    disabled?: boolean
  }> = ({ id, checked, onChange, label, description, disabled = false }) => (
    <div className='space-y-1'>
      <label htmlFor={id} className='block text-sm font-medium text-gray-800 dark:text-gray-100'>
        {label}
      </label>
      <label
        htmlFor={id}
        className={`inline-flex items-center ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      >
        <input
          type='checkbox'
          id={id}
          className='peer sr-only'
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <div className="peer relative h-6 w-10 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white-pure after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white-pure peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:bg-gray-600 dark:after:border-gray-500 dark:after:bg-gray-700 dark:peer-checked:bg-blue-500 rtl:peer-checked:after:-translate-x-full"></div>
      </label>
      {description && (
        <p className='text-xs text-gray-500 dark:text-gray-400'>
          {description}
        </p>
      )}
    </div>
  )

  return (
    <>
      <div
        className='absolute inset-0 z-10 flex h-full w-80 flex-col overflow-hidden rounded-b-lg bg-white-pure shadow-inner transition-opacity duration-300 ease-in-out dark:bg-gray-800'
        aria-modal='true'
        role='dialog'
        aria-labelledby='floating-chatbot-settings-title'
      >
        <div className='flex h-full w-full flex-col overflow-y-auto px-4'>
          <div className='flex flex-shrink-0 items-center justify-between border-b border-gray-200 pb-3 pt-3 dark:border-gray-700'>
            <div className='flex items-center space-x-2'>
              <h2
                id='floating-chatbot-settings-title'
                className='text-md font-semibold text-gray-800 dark:text-gray-100'
              >
                {t('Chat_Settings')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
              title={t('Close_settings')}
              aria-label={t('Close_settings')}
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className='flex-grow space-y-5 py-4'>
            {/* Stream Response Setting */}
            <ToggleSwitch
              id='streaming-toggle-floating'
              label={t('Stream_Response')}
              checked={isStreamingEnabled}
              onChange={handleStreamingToggle}
            />


            {/* Personalization Toggle */}
            {chatMode === 'regular' && (
              <div className='space-y-1'>
                <ToggleSwitch
                  id='personalization-toggle-floating'
                  label={t('Personalize_Responses_Toggle_Label')}
                  checked={isPersonalizationEnabled}
                  onChange={handlePersonalizationToggle}
                  disabled={!isLoggedIn}
                />
                {!isLoggedIn ? (
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    {t('Personalization_Login_Required_Message')}
                  </p>
                ) : (
                  isPersonalizationEnabled && (
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {t('Personalization_Enabled_Tooltip')}
                    </p>
                  )
                )}
              </div>
            )}

            {/* Model Selection Dropdown */}
            {chatMode === 'regular' && (
              <div className='space-y-1'>
                <ModelSelectionDropdown
                  currentModel={selectedModel}
                  availableModels={AVAILABLE_MODELS}
                  onModelChange={setSelectedModel}
                />
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
                disabled={false}
              />
            </div>

            {/* Hide Conversation Toolbar Setting */}
            <ToggleSwitch
              id='toolbar-toggle-floating'
              label={t('FloatingChat_Hide_Toolbar')}
              checked={isConversationToolbarHiddenInFloatingChat}
              onChange={handleToolbarToggle}
              description={t('FloatingChat_Hide_Toolbar_Description')}
            />

            {/* Hide Thought Process Setting */}
            <ToggleSwitch
              id='thought-process-toggle-floating'
              label={t('FloatingChat_Hide_Thought_Process')}
              checked={isThoughtProcessHiddenInFloatingChat}
              onChange={handleThoughtProcessToggle}
              description={t('FloatingChat_Hide_Thought_Process_Description')}
            />


          </div>
        </div>
      </div>

      {/* Personalization Modals */}
      <PersonalizationConfirmationModal
        isOpen={isMissingInfoModalOpen}
        onClose={() => setIsMissingInfoModalOpen(false)}
        onConfirm={() => {
          setIsMissingInfoModalOpen(false)
          setIsBenefitModalOpen(true)
        }}
        type='missingInfo'
        missingFieldsText={missingInfoFieldsText}
        size='sm'
        positioning='absolute'
      />
      <PersonalizationConfirmationModal
        isOpen={isBenefitModalOpen}
        onClose={() => setIsBenefitModalOpen(false)}
        onConfirm={() => {
          proceedToEnablePersonalization()
          setIsBenefitModalOpen(false)
        }}
        type='enableBenefit'
        size='sm'
        positioning='absolute'
      />
    </>
  )
}

export default FloatingChatbotSettings