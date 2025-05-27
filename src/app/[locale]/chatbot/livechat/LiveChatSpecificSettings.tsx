// src/app/[locale]/chatbot/livechat/LiveChatSpecificSettings.tsx
"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useLiveChatSettings } from './contexts/LiveChatSettingsContext';
import VoiceDropdown from './VoiceDropdown';
import { Modality as SDKModality } from '@google/genai'; // Import SDK Modality
import OutputFormatSelector from './OutputFormatSelector';
interface LiveChatSpecificSettingsProps {
  currentChatMode: 'live' | 'regular';
}

const LiveChatSpecificSettings: React.FC<LiveChatSpecificSettingsProps> = ({
  currentChatMode
}) => {
  const t = useTranslations();
  const {
    currentModality,    // This should be of type SDKModality from the context
    setCurrentModality, // This should accept SDKModality
    currentVoice,
    setCurrentVoice,
    availableVoices,
    isLiveChatConnected,
  } = useLiveChatSettings();

  const disableLiveSettings = isLiveChatConnected || currentChatMode === 'regular';
  // Compare with SDK enum member
  const isAudioSelected = currentModality === SDKModality.AUDIO;
  const disableVoiceDropdown = disableLiveSettings || !isAudioSelected;

  return (
    <fieldset
      id='live-settings-content'
      disabled={disableLiveSettings}
      className={`space-y-6 transition-opacity duration-300 ${
        disableLiveSettings ? 'opacity-60 cursor-not-allowed' : 'opacity-100'
      }`}
    >
       <legend className='sr-only'>{t('Live_Stream_Output_Settings')}</legend>
      <OutputFormatSelector
        currentModality={currentModality} // Pass SDKModality
        onModalityChange={setCurrentModality} // Expects SDKModality
        disabled={disableLiveSettings}
      />
      <div
        className={`transition-all duration-300 ease-in-out ${
          isAudioSelected && !disableLiveSettings
            ? 'max-h-40 opacity-100'
            : 'max-h-0 overflow-hidden opacity-0 pointer-events-none'
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