// src/app/[locale]/chatbot/RightPanel.tsx
import React, { useEffect, useState } from 'react';
import { X, Settings } from 'lucide-react';
import LanguageDropdown from './LanguageDropdown';
import LiveChatSpecificSettings from './livechat/LiveChatSpecificSettings';
import { useTranslations } from 'next-intl';
import { useUiStore, useSettingsStore } from './stores';
import { useShallow } from 'zustand/react/shallow';
import { useLiveChatSettings } from './livechat/contexts/LiveChatSettingsContext';
import { LanguageOption } from './stores';
import { UserResponse } from '@/src/models/response/user.response'; // <<< IMPORT UserResponse type
import { useAuth } from '@/src/contexts/AuthContext'; // <<< IMPORT useAuth


interface RightSettingsPanelProps {
  isLiveChatContextActive?: boolean;
}

// --- SỬA ĐỔI ĐỊNH NGHĨA PROPS CHO LiveAwareLanguageDropdown ---
const LiveAwareLanguageDropdown: React.FC<{
  currentLanguage: LanguageOption; // Sử dụng kiểu LanguageOption trực tiếp
  availableLanguages: LanguageOption[]; // Sử dụng mảng LanguageOption
  setCurrentLanguage: (language: LanguageOption) => void; // Định nghĩa kiểu hàm trực tiếp
}> = ({ currentLanguage, availableLanguages, setCurrentLanguage }) => {
  const { isLiveChatConnected } = useLiveChatSettings();

  return (
    <LanguageDropdown
      currentLanguage={currentLanguage}
      availableLanguages={availableLanguages}
      onLanguageChange={setCurrentLanguage}
      disabled={isLiveChatConnected}
    />
  );
};

const RightSettingsPanel: React.FC<RightSettingsPanelProps> = ({
  isLiveChatContextActive
}) => {
  const t = useTranslations();
  const { user, isLoggedIn } = useAuth(); // <<< GET USER AND LOGIN STATUS


  const { isRightPanelOpen, setRightPanelOpen } = useUiStore(
    useShallow(state => ({
      isRightPanelOpen: state.isRightPanelOpen,
      setRightPanelOpen: state.setRightPanelOpen,
    }))
  );

  const {
    chatMode,
    currentLanguage,
    availableLanguages,
    isStreamingEnabled,
    isPersonalizationEnabled, // <<< GET PERSONALIZATION STATE
    setCurrentLanguage,
    setIsStreamingEnabled,
    setIsPersonalizationEnabled, // <<< GET PERSONALIZATION ACTION
  } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode,
      currentLanguage: state.currentLanguage,
      availableLanguages: state.availableLanguages,
      isStreamingEnabled: state.isStreamingEnabled,
      isPersonalizationEnabled: state.isPersonalizationEnabled, // <<< GET
      setCurrentLanguage: state.setCurrentLanguage,
      setIsStreamingEnabled: state.setIsStreamingEnabled,
      setIsPersonalizationEnabled: state.setIsPersonalizationEnabled, // <<< GET
    }))
  );


  // Local state to manage if the initial benefit popup has been shown for the session/login
  // This is a simple way, could be persisted if needed across sessions more robustly
  const [benefitPopupShownThisSession, setBenefitPopupShownThisSession] = useState(false);


  const handleStreamingToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsStreamingEnabled(event.target.checked);
  };


  const handlePersonalizationToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enable = event.target.checked;

    if (enable) {
      // User is trying to enable
      if (!user) { // Should be covered by isLoggedIn check for disabled, but good practice
        alert(t('Error_Login_Required_Generic'));
        return;
      }

      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}') as UserResponse;
      const missingFields: string[] = [];
      if (!currentUserData.aboutMe) {
        missingFields.push(t('Profile_AboutMe_Label'));
      }
      if (!currentUserData.interestedTopics || currentUserData.interestedTopics.length === 0) {
        missingFields.push(t('Profile_InterestedTopics_Label'));
      }

      if (missingFields.length > 0) {
        const missingFieldsText = missingFields.join(', ');
        const confirmMissing = window.confirm(
          t('Personalization_Warning_Missing_Info_Message', { fields: missingFieldsText }) +
          "\n\n" +
          t('Personalization_Warning_Missing_Info_Enable_Anyway')
        );
        if (!confirmMissing) {
          // User cancelled, do not enable
          return;
        }
      }

      // Show benefit/privacy popup only if not shown before in this "session" or if it's the first time enabling
      // For simplicity, we'll show it every time they toggle from off to on for now.
      // A more sophisticated approach might use another flag in localStorage.
      const confirmBenefit = window.confirm(
        t('Personalization_Benefit_Privacy_Popup_Title') +
        "\n\n" +
        t('Personalization_Benefit_Privacy_Popup_Message')
      );

      if (confirmBenefit) {
        setIsPersonalizationEnabled(true);
        setBenefitPopupShownThisSession(true); // Mark as shown
      } else {
        // User cancelled benefit popup, do not enable
        return;
      }
    } else {
      // User is disabling
      setIsPersonalizationEnabled(false);
    }
  };

  useEffect(() => {
    // If user logs out, reset the "benefit popup shown" flag
    if (!isLoggedIn) {
      setBenefitPopupShownThisSession(false);
      // Optionally, also turn off personalization if it was on
      // if (isPersonalizationEnabled) {
      //   setIsPersonalizationEnabled(false);
      // }
    }
  }, [isLoggedIn, isPersonalizationEnabled, setIsPersonalizationEnabled]);

  if (!isRightPanelOpen) {
    return null;
  }


  return (
    <div
      className={`bg-white-pure h-full flex-shrink-0 shadow-xl transition-all duration-300 ease-in-out  ${isRightPanelOpen ? 'w-72 opacity-100' : 'pointer-events-none w-0 opacity-0'
        }`}
      aria-hidden={!isRightPanelOpen}
    >
      <div className='flex h-full w-full flex-col overflow-y-auto px-4'>
        <div className='border-gray-200 flex flex-shrink-0 items-center justify-between border-b pb-4 pt-4'>
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
            <X size={20} strokeWidth={1.5} className='h-5 w-5' aria-hidden='true' />
          </button>
        </div>

        <div className='flex-grow space-y-6  pt-4'>
          {/* Streaming Toggle */}
          {chatMode === 'regular' && (
            <div className='space-y-2 '>
              <label htmlFor='streaming-toggle-settings' className='block text-sm font-medium '>{t('Stream_Response')}</label>
              <label htmlFor='streaming-toggle-settings' className='inline-flex cursor-pointer items-center'>
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

          {/* Personalization Toggle <<< NEW SECTION >>> */}
          {chatMode === 'regular' && ( // Assuming personalization is for regular chat mode
            <div className='space-y-2'>
              <div className="flex items-center justify-between">
                <label htmlFor='personalization-toggle-settings' className='block text-sm font-medium'>
                  {t('Personalize_Responses_Toggle_Label')}
                </label>
                {/* Optional: Info icon with tooltip for more details */}
                {/* <Info size={16} className="text-gray-400 hover:text-gray-600 cursor-pointer" title={t('Personalization_Tooltip_Info')} /> */}
              </div>
              <label htmlFor='personalization-toggle-settings' className={`inline-flex cursor-pointer items-center ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : ''}`}>
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
                <p className="text-xs text-gray-500 mt-1">{t('Personalization_Login_Required_Message')}</p>
              )}
            </div>
          )}

          {/* Language Dropdown */}
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
              disabled={false} // Not disabled if not in live chat context or not connected
            />
          )}

          {/* Live Chat Specific Settings */}
          {isLiveChatContextActive && chatMode === 'live' && (
            <LiveChatSpecificSettings
              currentChatMode={chatMode}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RightSettingsPanel;