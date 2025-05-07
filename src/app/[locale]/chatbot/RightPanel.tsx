// src/app/[locale]/chatbot/RightSettingsPanel.tsx
import React from 'react'
import { X, Settings } from 'lucide-react'
import LanguageDropdown from './sidepanel/LanguageDropdown'
import OutputFormatSelector from './sidepanel/OutputFormatSelector'
import VoiceDropdown from './sidepanel/VoiceDropdown'
import { useTranslations } from 'next-intl'
import { useChatSettings } from './context/ChatSettingsContext'

interface RightSettingsPanelProps {
  isOpen: boolean
  onClose: () => void
  isLiveConnected: boolean
}

const RightSettingsPanel: React.FC<RightSettingsPanelProps> = ({
  isOpen,
  onClose,
  isLiveConnected
}) => {
  const t = useTranslations()
  const {
    chatMode,
    currentModality,
    setCurrentModality,
    currentVoice,
    setCurrentVoice,
    availableVoices,
    currentLanguage,
    setCurrentLanguage,
    availableLanguages,
    isStreamingEnabled,
    setIsStreamingEnabled
  } = useChatSettings()

  const isAudioSelected = currentModality === 'audio'

  const disableLiveSettings = isLiveConnected || chatMode === 'regular'
  const disableLanguageWhenConnected = isLiveConnected
  const disableVoiceDropdown = disableLiveSettings || !isAudioSelected

  const handleStreamingToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsStreamingEnabled(event.target.checked)
  }

  return (
    <div
      className={`bg-white-pure h-full flex-shrink-0 overflow-hidden shadow-xl transition-all duration-300 ease-in-out   ${
        isOpen ? 'w-72 opacity-100' : 'pointer-events-none w-0 opacity-0'
      }`}
      aria-hidden={!isOpen}
    >
      <div className='flex h-full w-full flex-col overflow-y-auto px-4'>
        <div className='border-gray-20 flex flex-shrink-0 items-center justify-between border-b  pb-4 pt-4 '>
          <div className='flex items-center space-x-2'>
            <Settings size={20} className='' />
            <h2 id='right-panel-title' className='text-lg font-semibold '>
              {t('Settings')}
            </h2>
          </div>
          <button
            onClick={onClose}
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
          {chatMode === 'regular' && (
            <div className='space-y-2 '>
              <label
                htmlFor='streaming-toggle-settings'
                className='block text-sm font-medium '
              >
                {t('Stream_Response')}
              </label>
              {/* Thay thế input checkbox bằng mã toggle HTML */}
              <label
                htmlFor='streaming-toggle-settings'
                className='inline-flex cursor-pointer items-center'
              >
                <input
                  type='checkbox'
                  id='streaming-toggle-settings' // Đảm bảo id khớp với htmlFor
                  value=''
                  className='peer sr-only'
                  checked={isStreamingEnabled}
                  onChange={handleStreamingToggle}
                />
                <div className="peer relative h-6 w-10 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full"></div>
                {/* Bạn có thể thêm văn bản mô tả toggle nếu muốn */}
                {/* <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{t('Stream_Response')}</span> */}
              </label>
              {/* Tùy chọn hiển thị trạng thái Enable/Disable */}
              {/* <div className='ml-2 text-sm text-gray-600 dark:text-gray-400'>
                {isStreamingEnabled ? t('Enabled') : t('Disabled')}
              </div> */}
            </div>
          )}

          <LanguageDropdown
            currentLanguage={currentLanguage}
            availableLanguages={availableLanguages}
            onLanguageChange={setCurrentLanguage}
            disabled={disableLanguageWhenConnected}
          />

          <fieldset
            id='live-settings-content'
            disabled={disableLiveSettings}
            className={`space-y-6  transition-opacity duration-300 ${
              chatMode === 'live'
                ? 'opacity-100'
                : 'pointer-events-none opacity-50'
            }`}
          >
            <legend className='sr-only'>
              {t('Live_Stream_Output_Settings')}
            </legend>

            <OutputFormatSelector
              currentModality={currentModality}
              onModalityChange={setCurrentModality}
              disabled={disableLiveSettings}
            />

            <div
              className={`transition-all duration-300 ease-in-out ${isAudioSelected && chatMode === 'live' ? 'max-h-40 opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}
            >
              {isAudioSelected && chatMode === 'live' && (
                <VoiceDropdown
                  currentVoice={currentVoice}
                  availableVoices={availableVoices}
                  onVoiceChange={setCurrentVoice}
                  disabled={disableVoiceDropdown}
                />
              )}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  )
}

export default RightSettingsPanel
