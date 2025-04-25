// src/app/[locale]/chatbot/RightSettingsPanel.tsx
import React from 'react';
import { OutputModality, PrebuiltVoice, Language, LanguageOption, ChatMode } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import { X, Settings } from 'lucide-react';
import LanguageDropdown from './sidepanel/LanguageDropdown';
import OutputFormatSelector from './sidepanel/OutputFormatSelector';
import VoiceDropdown from './sidepanel/VoiceDropdown';

interface RightSettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentChatMode: ChatMode;
    currentModality: OutputModality;
    onModalityChange: (modality: OutputModality) => void;
    currentVoice: PrebuiltVoice;
    onVoiceChange: (voice: PrebuiltVoice) => void;
    availableVoices: PrebuiltVoice[];
    currentLanguage: Language;
    onLanguageChange: (lang: Language) => void;
    availableLanguages: LanguageOption[];
    isLiveConnected: boolean;
}

const RightSettingsPanel: React.FC<RightSettingsPanelProps> = ({
    isOpen,
    onClose,
    currentChatMode,
    currentModality,
    onModalityChange,
    currentVoice,
    onVoiceChange,
    availableVoices,
    currentLanguage,
    onLanguageChange,
    availableLanguages,
    isLiveConnected,
}) => {
    // --- Calculate derived states specific to this panel's content ---
    const isAudioSelected = currentModality === 'audio';
    // Disable settings inside the fieldset if live connected OR if in regular mode
    const disableLiveSettings = isLiveConnected || currentChatMode === 'regular';
    // Only disable language selection if actually connected to live stream
    const disableLanguageWhenConnected = isLiveConnected;
    // Determine if the voice dropdown should be disabled
    const disableVoiceDropdown = disableLiveSettings || !isAudioSelected;

    return (
        <div
            className={`flex-shrink-0 h-full bg-white text-gray-800 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'
                }`}
            aria-hidden={!isOpen}
        >
            {/* Inner Content Wrapper */}
            <div className="flex h-full flex-col p-5 min-w-[18rem] overflow-y-auto">

                {/* Header for Right Panel */}
                <div className="flex-shrink-0 flex items-center justify-between pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Settings size={20} className="text-gray-600" />
                        <h2 id="right-panel-title" className="text-lg font-semibold text-gray-900">
                            Settings
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        title="Close settings"
                        aria-label="Close settings"
                    >
                        <X size={20} strokeWidth={1.5} stroke="currentColor" className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Close settings</span>
                    </button>
                </div>

                {/* --- Settings Content --- */}
                <div className="flex-grow pt-4">

                    {/* Use LanguageDropdown */}
                    <LanguageDropdown
                        currentLanguage={currentLanguage}
                        availableLanguages={availableLanguages}
                        onLanguageChange={onLanguageChange}
                        disabled={disableLanguageWhenConnected}
                    />

                    {/* Live Stream Specific Settings (Conditionally Enabled/Visible) */}
                    <fieldset
                        id="live-settings-content"
                        disabled={disableLiveSettings}
                        className={`space-y-6 transition-opacity duration-300 ${
                            // Apply opacity based on chat mode only, fieldset handles pointer events
                            currentChatMode === 'live' ? 'opacity-100' : 'opacity-50'
                            } ${
                            // Ensure pointer events are disabled correctly when not live mode
                            currentChatMode !== 'live' ? 'pointer-events-none' : ''
                            }`}
                    >
                        {/* Use a visually hidden legend for accessibility if needed */}
                        <legend className="sr-only">Live Stream Output Settings</legend>

                        {/* Use OutputFormatSelector */}
                        <OutputFormatSelector
                            currentModality={currentModality}
                            onModalityChange={onModalityChange}
                            disabled={disableLiveSettings}
                        />

                        {/* Conditionally render VoiceDropdown */}
                        <div className={`transition-all duration-300 ease-in-out ${isAudioSelected && currentChatMode === 'live' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            {isAudioSelected && currentChatMode === 'live' && (
                                <VoiceDropdown
                                    currentVoice={currentVoice}
                                    availableVoices={availableVoices}
                                    onVoiceChange={onVoiceChange}
                                    disabled={disableVoiceDropdown}
                                />
                            )}
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    );
};

export default RightSettingsPanel;