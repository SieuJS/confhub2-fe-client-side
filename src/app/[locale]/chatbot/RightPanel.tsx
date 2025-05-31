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
import { UserResponse } from '@/src/models/response/user.response';
import { useAuth } from '@/src/contexts/AuthContext';
import PersonalizationConfirmationModal from './PersonalizationConfirmationModal';
import GoogleSearchConfirmationModal from './GoogleSearchConfirmationModal'; // <<< IMPORT MODAL MỚI

const LiveAwareLanguageDropdown: React.FC<{
  currentLanguage: LanguageOption;
  availableLanguages: LanguageOption[];
  setCurrentLanguage: (language: LanguageOption) => void;
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


interface RightSettingsPanelProps {
  isLiveChatContextActive?: boolean;
}

const RightSettingsPanel: React.FC<RightSettingsPanelProps> = ({
  isLiveChatContextActive
}) => {
  const t = useTranslations();
  const { user, isLoggedIn } = useAuth();

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
    isPersonalizationEnabled,
    isGoogleSearchEnabled, // <<< LẤY STATE MỚI
    setCurrentLanguage,
    setIsStreamingEnabled,
    setIsPersonalizationEnabled,
    setIsGoogleSearchEnabled, // <<< LẤY ACTION MỚI
  } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode,
      currentLanguage: state.currentLanguage,
      availableLanguages: state.availableLanguages,
      isStreamingEnabled: state.isStreamingEnabled,
      isPersonalizationEnabled: state.isPersonalizationEnabled,
      isGoogleSearchEnabled: state.isGoogleSearchEnabled, // <<<
      setCurrentLanguage: state.setCurrentLanguage,
      setIsStreamingEnabled: state.setIsStreamingEnabled,
      setIsPersonalizationEnabled: state.setIsPersonalizationEnabled,
      setIsGoogleSearchEnabled: state.setIsGoogleSearchEnabled, // <<<
    }))
  );

  // State for managing modals
  const [isBenefitModalOpen, setIsBenefitModalOpen] = useState(false);
  const [isMissingInfoModalOpen, setIsMissingInfoModalOpen] = useState(false);
  const [missingInfoFieldsText, setMissingInfoFieldsText] = useState('');
  const [isGoogleSearchModalOpen, setIsGoogleSearchModalOpen] = useState(false); // <<< STATE CHO MODAL MỚI

  const handleStreamingToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsStreamingEnabled(event.target.checked);
  };

  const proceedToEnablePersonalization = () => {
    setIsPersonalizationEnabled(true);
  };

  const handlePersonalizationToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enable = event.target.checked;

    if (enable) {
      if (!user) {
        alert(t('Error_Login_Required_Generic'));
        event.target.checked = false; // Revert toggle if login required
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
        setMissingInfoFieldsText(missingFields.join(', '));
        setIsMissingInfoModalOpen(true);
        event.target.checked = false; 
      } else {
        setIsBenefitModalOpen(true);
        event.target.checked = false; 
      }
    } else {
      setIsPersonalizationEnabled(false);
    }
  };

  const handleGoogleSearchToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const enable = event.target.checked;
    if (enable) {
      setIsGoogleSearchModalOpen(true);
      event.target.checked = false; // Revert optimistic UI change, actual change on modal confirm
    } else {
      setIsGoogleSearchEnabled(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      if (isPersonalizationEnabled) {
         setIsPersonalizationEnabled(false);
      }
      // Google Search can remain enabled even if logged out, so no change here for isGoogleSearchEnabled
    }
  }, [isLoggedIn, isPersonalizationEnabled, setIsPersonalizationEnabled]);


  if (!isRightPanelOpen) {
    return null;
  }

  return (
    <>
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

            {/* Personalization Toggle */}
            {chatMode === 'regular' && (
              <div className='space-y-2'>
                <div className="flex items-center justify-between">
                  <label htmlFor='personalization-toggle-settings' className='block text-sm font-medium'>
                    {t('Personalize_Responses_Toggle_Label')}
                  </label>
                </div>
                <label htmlFor='personalization-toggle-settings' className={`inline-flex items-center ${!isLoggedIn ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
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

            {/* Google Search Toggle */}
            {chatMode === 'regular' && (
              <div className='space-y-2'>
                <div className="flex items-center justify-between">
                  <label htmlFor='google-search-toggle-settings' className='block text-sm font-medium'>
                    {t('Enable_Google_Search_Toggle_Label')}
                  </label>
                </div>
                <label htmlFor='google-search-toggle-settings' className='inline-flex cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    id='google-search-toggle-settings'
                    className='peer sr-only'
                    checked={isGoogleSearchEnabled}
                    onChange={handleGoogleSearchToggle}
                    // Không bị disable khi chưa login
                  />
                  <div className="peer relative h-6 w-10 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full"></div>
                </label>
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
                <LiveChatSpecificSettings
                currentChatMode={chatMode}
                />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PersonalizationConfirmationModal
        isOpen={isMissingInfoModalOpen}
        onClose={() => setIsMissingInfoModalOpen(false)}
        onConfirm={() => {
          setIsMissingInfoModalOpen(false);
          setIsBenefitModalOpen(true);     
        }}
        type="missingInfo"
        missingFieldsText={missingInfoFieldsText}
      />

      <PersonalizationConfirmationModal
        isOpen={isBenefitModalOpen}
        onClose={() => setIsBenefitModalOpen(false)}
        onConfirm={() => {
          proceedToEnablePersonalization();
          setIsBenefitModalOpen(false);
        }}
        type="enableBenefit"
      />

      <GoogleSearchConfirmationModal
        isOpen={isGoogleSearchModalOpen}
        onClose={() => setIsGoogleSearchModalOpen(false)}
        onConfirm={() => {
          setIsGoogleSearchEnabled(true);
          setIsGoogleSearchModalOpen(false);
        }}
      />
    </>
  );
};

export default RightSettingsPanel;