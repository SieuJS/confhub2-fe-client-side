// src/app/[locale]/chatbot/RightSettingsPanel.tsx
import React from 'react';
import { X, Settings } from 'lucide-react';
import LanguageDropdown from './LanguageDropdown';
import LiveChatSpecificSettings from './livechat/LiveChatSpecificSettings';
import { useTranslations } from 'next-intl';
// --- IMPORT STORE MỚI ---
import { useUiStore, useSettingsStore } from './stores'; // Giả sử bạn có file index.ts trong ./stores
import { useShallow } from 'zustand/react/shallow';

interface RightSettingsPanelProps {
  isLiveServiceConnected?: boolean;
  isLiveChatContextActive?: boolean;
}

const RightSettingsPanel: React.FC<RightSettingsPanelProps> = ({
  isLiveServiceConnected,
  isLiveChatContextActive
}) => {
  const t = useTranslations();

  // --- Lấy state từ UiStore ---
  const { isRightPanelOpen, setRightPanelOpen } = useUiStore(
    useShallow(state => ({
      isRightPanelOpen: state.isRightPanelOpen,
      setRightPanelOpen: state.setRightPanelOpen,
    }))
  );

  // --- Lấy state và actions từ SettingsStore ---
  const {
    chatMode,
    currentLanguage,
    availableLanguages,
    isStreamingEnabled,
    setCurrentLanguage,
    setIsStreamingEnabled,
  } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode,
      currentLanguage: state.currentLanguage,
      availableLanguages: state.availableLanguages,
      isStreamingEnabled: state.isStreamingEnabled,
      setCurrentLanguage: state.setCurrentLanguage,
      setIsStreamingEnabled: state.setIsStreamingEnabled,
    }))
  );

  const connectedStateForDisabling = !!isLiveServiceConnected;
  const disableLanguageWhenConnected = connectedStateForDisabling;

  const handleStreamingToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsStreamingEnabled(event.target.checked); // Action từ SettingsStore
  };

  if (!isRightPanelOpen) { // State từ UiStore
    return null;
  }

   return (
    <div
    className={`bg-white-pure h-full flex-shrink-0 shadow-xl transition-all duration-300 ease-in-out  ${
      isRightPanelOpen ? 'w-72 opacity-100' : 'pointer-events-none w-0 opacity-0' // State từ UiStore
      }`}
      aria-hidden={!isRightPanelOpen} // State từ UiStore
    >
      <div className='flex h-full w-full flex-col overflow-y-auto px-4'>
        {/* Header của Panel */}
        <div className='border-gray-20 flex flex-shrink-0 items-center justify-between border-b  pb-4 pt-4 '>
          <div className='flex items-center space-x-2'>
            <Settings size={20} className='' />
            <h2 id='right-panel-title' className='text-lg font-semibold '>
              {t('Settings')}
            </h2>
          </div>
          <button
            onClick={() => setRightPanelOpen(false)} // Action từ UiStore
            className='flex h-8 w-8 items-center justify-center rounded-full  hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:hover:bg-black dark:hover:text-gray-300'
            title={t('Close_settings')}
            aria-label={t('Close_settings')}
          >
            <X size={20} strokeWidth={1.5} className='h-5 w-5' aria-hidden='true'/>
          </button>
        </div>

        <div className='flex-grow space-y-6  pt-4'>
          {/* Streaming Toggle cho Regular Chat */}
          {chatMode === 'regular' && ( // chatMode từ SettingsStore
            <div className='space-y-2 '>
              <label htmlFor='streaming-toggle-settings' className='block text-sm font-medium '>{t('Stream_Response')}</label>
              <label htmlFor='streaming-toggle-settings' className='inline-flex cursor-pointer items-center'>
                <input
                  type='checkbox'
                  id='streaming-toggle-settings'
                  // value='' // không cần value cho checkbox
                  className='peer sr-only'
                  checked={isStreamingEnabled} // isStreamingEnabled từ SettingsStore
                  onChange={handleStreamingToggle}
                />
                <div className="peer relative h-6 w-10 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full"></div>
              </label>
            </div>
          )}

          {/* Language Dropdown (chung cho cả hai mode) */}
          <LanguageDropdown
            currentLanguage={currentLanguage} // Từ SettingsStore
            availableLanguages={availableLanguages} // Từ SettingsStore
            onLanguageChange={setCurrentLanguage} // Action từ SettingsStore
            disabled={disableLanguageWhenConnected}
          />

          {/* Render component con cho Live Chat settings */}
          {isLiveChatContextActive && chatMode === 'live' && ( // chatMode từ SettingsStore
            <LiveChatSpecificSettings
              isLiveServiceConnected={isLiveServiceConnected}
              currentChatMode={chatMode} // chatMode ở đây sẽ là 'live' (từ SettingsStore)
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSettingsPanel;