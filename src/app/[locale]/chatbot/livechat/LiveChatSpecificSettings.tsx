// src/app/[locale]/chatbot/sidepanel/LiveChatSpecificSettings.tsx (hoặc một vị trí phù hợp)
"use client"; // Cần thiết nếu sử dụng hooks

import React from 'react';
import { useTranslations } from 'next-intl';
import { useLiveChatSettings } from '../context/LiveChatSettingsContext'; // Hook cho context
import OutputFormatSelector from './OutputFormatSelector';
import VoiceDropdown from './VoiceDropdown';
// import { useChatStore } from '../stores/chatStore'; // Có thể không cần nếu chỉ dùng chatMode từ prop

interface LiveChatSpecificSettingsProps {
  isLiveServiceConnected?: boolean; // Trạng thái kết nối của dịch vụ live chat
  currentChatMode: 'live' | 'regular'; // Truyền chatMode xuống
}

const LiveChatSpecificSettings: React.FC<LiveChatSpecificSettingsProps> = ({
  isLiveServiceConnected,
  currentChatMode
}) => {
  const t = useTranslations();
  // Hook này giờ đây được gọi một cách an toàn vì component này
  // sẽ chỉ được render KHI LiveChatSettingsProvider đã bao bọc nó.
  const {
    currentModality,
    setCurrentModality,
    currentVoice,
    setCurrentVoice,
    availableVoices,
  } = useLiveChatSettings();

  const connectedStateForDisabling = !!isLiveServiceConnected;
  // currentChatMode ở đây sẽ luôn là 'live' khi component này được render theo logic của RightSettingsPanel
  const disableLiveSettings = connectedStateForDisabling || currentChatMode === 'regular';
  const isAudioSelected = currentModality === 'audio';
  const disableVoiceDropdown = disableLiveSettings || !isAudioSelected;

  return (
    <fieldset
      id='live-settings-content'
      disabled={disableLiveSettings}
      className={`space-y-6 transition-opacity duration-300 opacity-100`}
    >
      <legend className='sr-only'>{t('Live_Stream_Output_Settings')}</legend>
      <OutputFormatSelector
        currentModality={currentModality}
        onModalityChange={setCurrentModality}
        disabled={disableLiveSettings}
      />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isAudioSelected ? 'max-h-40 opacity-100' : 'max-h-0 overflow-hidden opacity-0'
        }`}
      >
        {isAudioSelected && (
          <VoiceDropdown
            currentVoice={currentVoice}
            availableVoices={availableVoices}
            onVoiceChange={setCurrentVoice}
            disabled={disableVoiceDropdown}
          />
        )}
      </div>
    </fieldset>
  );
};

export default LiveChatSpecificSettings;