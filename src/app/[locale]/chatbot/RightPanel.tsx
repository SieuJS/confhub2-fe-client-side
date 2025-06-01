// src/app/[locale]/chatbot/RightPanel.tsx
import React, { useEffect, useState } from 'react'
import { X, Settings } from 'lucide-react'
import LanguageDropdown from './LanguageDropdown'
import LiveChatSpecificSettings from './livechat/LiveChatSpecificSettings'
import { useTranslations } from 'next-intl'
import { useUiStore, useSettingsStore } from './stores'
import { useShallow } from 'zustand/react/shallow'
import { useLiveChatSettings } from './livechat/contexts/LiveChatSettingsContext'
import { LanguageOption } from './stores'
import { UserResponse } from '@/src/models/response/user.response'
import { useAuth } from '@/src/contexts/AuthContext'
import PersonalizationConfirmationModal from './PersonalizationConfirmationModal'

const LiveAwareLanguageDropdown: React.FC<{
  currentLanguage: LanguageOption
  availableLanguages: LanguageOption[]
  setCurrentLanguage: (language: LanguageOption) => void
}> = ({ currentLanguage, availableLanguages, setCurrentLanguage }) => {
  const { isLiveChatConnected } = useLiveChatSettings()

  return (
    <LanguageDropdown
      currentLanguage={currentLanguage}
      availableLanguages={availableLanguages}
      onLanguageChange={setCurrentLanguage}
      disabled={isLiveChatConnected}
    />
  )
}

interface RightSettingsPanelProps {
  isLiveChatContextActive?: boolean
}

const RightSettingsPanel: React.FC<RightSettingsPanelProps> = ({
  isLiveChatContextActive
}) => {
  const t = useTranslations()
  const { user, isLoggedIn } = useAuth()

  const { isRightPanelOpen, setRightPanelOpen } = useUiStore(
    useShallow(state => ({
      isRightPanelOpen: state.isRightPanelOpen,
      setRightPanelOpen: state.setRightPanelOpen
    }))
  )

  const {
    chatMode,
    currentLanguage,
    availableLanguages,
    isStreamingEnabled,
    isPersonalizationEnabled,
    setCurrentLanguage,
    setIsStreamingEnabled,
    setIsPersonalizationEnabled
  } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode,
      currentLanguage: state.currentLanguage,
      availableLanguages: state.availableLanguages,
      isStreamingEnabled: state.isStreamingEnabled,
      isPersonalizationEnabled: state.isPersonalizationEnabled,
      setCurrentLanguage: state.setCurrentLanguage,
      setIsStreamingEnabled: state.setIsStreamingEnabled,
      setIsPersonalizationEnabled: state.setIsPersonalizationEnabled
    }))
  )

  // State for managing modals
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false)
  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false)
  const [missingInfoFieldsText, setMissingInfoFieldsText] = useState('')

  const handleStreamingToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsStreamingEnabled(event.target.checked)
  }

  const proceedToEnablePersonalization = () => {
    setIsPersonalizationEnabled(true)
  }

  const handlePersonalizationToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enable = event.target.checked

    if (enable) {
      if (!user) {
        alert(t('Error_Login_Required_Generic'))
        // Revert the toggle visually if login is required.
        event.target.checked = false // Revert optimistic UI change of the toggle
        return
      }

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
        // Revert the toggle visually, it will be enabled if user confirms in modal.
        event.target.checked = false
      } else {
        setIsBenefitModalOpen(true)
        // Revert the toggle visually, it will be enabled if user confirms in modal.
        event.target.checked = false
      }
    } else {
      // User is disabling
      setIsPersonalizationEnabled(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn) {
      if (isPersonalizationEnabled) {
        setIsPersonalizationEnabled(false)
      }
    }
  }, [isLoggedIn, isPersonalizationEnabled, setIsPersonalizationEnabled])

  // Handle keyboard escape for closing the panel
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isRightPanelOpen) {
        setRightPanelOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isRightPanelOpen, setRightPanelOpen])

  return (
    <>
      {/* Backdrop (Lớp phủ nền mờ) */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out
          ${isRightPanelOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setRightPanelOpen(false)}
        aria-hidden={!isRightPanelOpen}
        aria-label={t('Close_settings')} // Thêm aria-label cho khả năng truy cập
      />

      {/* Right Panel */}
      <div
        // Đặt panel cố định ở góc phải màn hình
        className={`fixed right-0 top-0 z-50 h-full w-72 transform bg-white-pure shadow-xl transition-transform duration-300 ease-in-out
          ${isRightPanelOpen ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full'}`}
        aria-modal='true' // Cho trình đọc màn hình biết đây là một cửa sổ modal
        role='dialog' // Xác định vai trò là hộp thoại
        aria-labelledby='right-panel-title' // Liên kết với tiêu đề panel
      >
        <div className='flex h-full w-full flex-col overflow-y-auto px-4'>
          <div className='flex flex-shrink-0 items-center justify-between border-b border-gray-200 pb-4 pt-4'>
            <div className='flex items-center space-x-2'>
              <Settings size={20} className='' />
              <h2 id='right-panel-title' className='text-lg font-semibold '>
                {t('Settings')}
              </h2>
            </div>
            <button
              onClick={() => setRightPanelOpen(false)}
              className='flex h-8 w-8 items-center justify-center rounded-full  hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:hover:bg-black dark:hover:text-gray-300'
              title={t('Close_settings')}
              aria-label={t('Close_settings')}
            >
              <X
                size={20}
                strokeWidth={1.5}
                className='h-5 w-5'
                aria-hidden='true'
              />
            </button>
          </div>

          <div className='flex-grow space-y-6  pt-4'>
            {/* Streaming Toggle */}
            {chatMode === 'regular' && (
              <div className='space-y-2 '>
                <label
                  htmlFor='streaming-toggle-settings'
                  className='block text-sm font-medium '
                >
                  {t('Stream_Response')}
                </label>
                <label
                  htmlFor='streaming-toggle-settings'
                  className='inline-flex cursor-pointer items-center'
                >
                  <input
                    type='checkbox'
                    id='streaming-toggle-settings'
                    className='peer sr-only'
                    checked={isStreamingEnabled}
                    onChange={handleStreamingToggle}
                  />
                  <div className="peer relative h-6 w-10 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full"></div>
                </label>
              </div>
            )}

            {/* Personalization Toggle */}
            {chatMode === 'regular' && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <label
                    htmlFor='personalization-toggle-settings'
                    className='block text-sm font-medium'
                  >
                    {t('Personalize_Responses_Toggle_Label')}
                  </label>
                </div>
                <label
                  htmlFor='personalization-toggle-settings'
                  className={`inline-flex items-center ${!isLoggedIn ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <input
                    type='checkbox'
                    id='personalization-toggle-settings'
                    className='peer sr-only'
                    checked={isPersonalizationEnabled}
                    onChange={handlePersonalizationToggle}
                    disabled={!isLoggedIn}
                  />
                  <div className="peer relative h-6 w-10 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full"></div>
                </label>
                {!isLoggedIn && (
                  <p className='mt-1 text-xs text-gray-500'>
                    {t('Personalization_Login_Required_Message')}
                  </p>
                )}
              </div>
            )}

            {isLiveChatContextActive && chatMode === 'live' ? (
              <LiveAwareLanguageDropdown
                currentLanguage={currentLanguage}
                availableLanguages={availableLanguages}
                setCurrentLanguage={setCurrentLanguage}
              />
            ) : (
              <LanguageDropdown
                currentLanguage={currentLanguage}
                availableLanguages={availableLanguages}
                onLanguageChange={setCurrentLanguage}
                disabled={false}
              />
            )}

            {isLiveChatContextActive && chatMode === 'live' && (
              <LiveChatSpecificSettings currentChatMode={chatMode} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
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

export default RightSettingsPanel
