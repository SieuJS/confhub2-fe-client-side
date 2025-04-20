// src/components/layout/SidePanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/src/navigation';
import { OutputModality, PrebuiltVoice, Language, LanguageOption, ChatMode } from '@/src/app/[locale]/chatbot/lib/types';
import { House, MessageCircleMore, Volume2, Text, X, Radio, Bot, ChevronDown } from 'lucide-react';

// --- Props Interface ---
interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentChatMode: ChatMode;
    onChatModeChange: (mode: ChatMode) => void;
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

// --- Helpers ---
const getFlagUrl = (flagCode: string) => `/country_flags/${flagCode}.svg`;

// --- Component Definition ---
const SidePanel: React.FC<SidePanelProps> = ({
    isOpen,
    onClose,
    currentChatMode,
    onChatModeChange,
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
    const isAudioSelected = currentModality === 'audio';
    // Disable settings inside the fieldset if live connected OR if in regular mode
    const disableLiveSettings = isLiveConnected || currentChatMode === 'regular';
    // Only disable language selection if actually connected to live stream
    const disableLanguageWhenConnected = isLiveConnected;

    // --- State for language dropdown ---
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const langDropdownRef = useRef<HTMLDivElement>(null); // Renamed ref for clarity

    // --- State for voice dropdown ---
    const [isVoiceDropdownOpen, setIsVoiceDropdownOpen] = useState(false);
    const voiceDropdownRef = useRef<HTMLDivElement>(null); // New ref for voice dropdown

    const selectedLanguage = availableLanguages.find(lang => lang.code === currentLanguage);

    const handleLanguageSelect = (langCode: Language) => {
        onLanguageChange(langCode);
        setIsLangDropdownOpen(false);
    };

    // --- New handler for voice selection ---
    const handleVoiceSelect = (voice: PrebuiltVoice) => {
        onVoiceChange(voice);
        setIsVoiceDropdownOpen(false);
    };

    // --- Effect for Click Outside (Updated to handle both dropdowns) ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check language dropdown
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
                setIsLangDropdownOpen(false);
            }
            // Check voice dropdown
            if (voiceDropdownRef.current && !voiceDropdownRef.current.contains(event.target as Node)) {
                setIsVoiceDropdownOpen(false);
            }
        };

        if (isLangDropdownOpen || isVoiceDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLangDropdownOpen, isVoiceDropdownOpen]); // Depend on both states

    // Determine if the voice dropdown should be disabled
    const disableVoiceDropdown = disableLiveSettings || !isAudioSelected;

    return (
        // Side Panel Container
        <div
            className={`flex-shrink-0 h-full bg-white text-gray-800 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'
                }`}
            aria-hidden={!isOpen}
            aria-labelledby="sidepanel-title"
        >
            {/* Inner Content Wrapper */}
            <div className="flex h-full flex-col p-5 min-w-[18rem] overflow-y-auto">

                {/* Navigation */}
                <nav className="flex-shrink-0 border-b border-gray-200 pb-4">
                     <div className="flex flex-shrink-0 items-center justify-between">
                        <Link
                            href="/"
                            className="group flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                        >
                            <House stroke="currentColor" className="h-5 w-5 text-gray-400 group-hover:text-blue-600" size={20} strokeWidth={1.75} />
                            <span>Home</span>
                        </Link>
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
                </nav>

                {/* Header */}
                <div className="my-4 flex flex-shrink-0 items-center justify-between">
                    <h2 id="sidepanel-title" className="text-xl font-semibold text-gray-900">
                        Chatbot Settings
                    </h2>
                </div>

                {/* --- Rest of the content --- */}
                <div className="flex-grow">

                    {/* Chat Mode Selection */}
                    <div className="mb-6">
                        <label className="mb-3 block text-sm font-medium text-gray-700">
                            Chat Mode
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => onChatModeChange('live')}
                                disabled={isLiveConnected}
                                className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${currentChatMode === 'live'
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                    : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                                    }`}
                                aria-pressed={currentChatMode === 'live'}
                            >
                                <Radio size={24} className={`mb-1 ${currentChatMode === 'live' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                <span className={`text-sm font-medium ${currentChatMode === 'live' ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-800'}`}>
                                    Live Stream
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => onChatModeChange('regular')}
                                disabled={isLiveConnected}
                                className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${currentChatMode === 'regular'
                                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                    : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                                    }`}
                                aria-pressed={currentChatMode === 'regular'}
                            >
                                <Bot size={24} className={`mb-1 ${currentChatMode === 'regular' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
                                <span className={`text-sm font-medium ${currentChatMode === 'regular' ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-800'}`}>
                                    Regular Chat
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Language Selection Dropdown */}
                    <div className="mb-6">
                        <label id="language-select-label" className="mb-2 block text-sm font-medium text-gray-700">
                            Language
                        </label>
                        <div ref={langDropdownRef} className="relative">
                            <button
                                type="button"
                                disabled={disableLanguageWhenConnected}
                                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                                aria-haspopup="listbox"
                                aria-expanded={isLangDropdownOpen}
                                aria-labelledby="language-select-label"
                            >
                                <span className="flex items-center">
                                    {selectedLanguage ? (
                                        <>
                                            <Image
                                                src={getFlagUrl(selectedLanguage.flagCode)}
                                                alt={`${selectedLanguage.name} flag`}
                                                width={20}
                                                height={15}
                                                className="mr-2 h-auto w-[20px] flex-shrink-0 rounded-sm"
                                                loading="lazy"
                                            />
                                            <span className="block truncate text-gray-900">{selectedLanguage.name}</span>
                                        </>
                                    ) : (
                                        <span className="block truncate text-gray-500">Select language...</span>
                                    )}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                    <ChevronDown
                                        className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`}
                                        aria-hidden="true"
                                    />
                                </span>
                            </button>

                            {isLangDropdownOpen && (
                                <div
                                    role="listbox"
                                    aria-labelledby="language-select-label"
                                    className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                >
                                    {availableLanguages.map((lang) => (
                                        <button
                                            key={lang.code}
                                            type="button"
                                            role="option"
                                            aria-selected={currentLanguage === lang.code}
                                            onClick={() => handleLanguageSelect(lang.code)}
                                            disabled={disableLanguageWhenConnected}
                                            className={`relative w-full cursor-default select-none py-2 pl-3 pr-9 text-left hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 ${currentLanguage === lang.code ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-900'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <Image
                                                    src={getFlagUrl(lang.flagCode)}
                                                    alt={`${lang.name} flag`}
                                                    width={20}
                                                    height={15}
                                                    className="mr-2 h-auto w-[20px] flex-shrink-0 rounded-sm"
                                                    loading="lazy"
                                                />
                                                <span className={`block truncate ${currentLanguage === lang.code ? 'font-semibold' : 'font-normal'}`}>
                                                    {lang.name}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* --- End Language Selection --- */}


                    {/* Live Stream Specific Settings (Conditionally Enabled/Visible) */}
                    <fieldset
                        id="settings-content"
                        disabled={disableLiveSettings}
                        className={`space-y-6 transition-opacity duration-300 ${currentChatMode === 'live' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}
                    >
                        {/* <legend className="mb-3 block text-base font-medium text-gray-900 border-b pb-1">
                            Live Stream Settings
                        </legend> */}

                        {/* Output Format Section (Unchanged, inside fieldset) */}
                        <div>
                            <label className="mb-3 block text-sm font-medium text-gray-700">
                                Output Format
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => onModalityChange('audio')} className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${isAudioSelected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}`} aria-pressed={isAudioSelected} >
                                    <Volume2 stroke="currentColor" className={`mb-1 h-6 w-6 ${isAudioSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} aria-hidden="true" size={24} />
                                    <span className={`text-sm font-medium ${isAudioSelected ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-800'}`}> Audio </span>
                                </button>
                                <button type="button" onClick={() => onModalityChange('text')} className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${currentModality === 'text' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}`} aria-pressed={currentModality === 'text'} >
                                    <Text stroke="currentColor" className={`mb-1 h-6 w-6 ${currentModality === 'text' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} aria-hidden="true" size={24} />
                                    <span className={`text-sm font-medium ${currentModality === 'text' ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-800'}`}> Text </span>
                                </button>
                            </div>
                        </div>

                        {/* --- MODIFIED: Voice Selection Dropdown --- */}
                        {/* Show/Hide based on Audio selection and Chat Mode (handled by fieldset) */}
                        <div className={`transition-opacity duration-300 ${isAudioSelected ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}>
                            <label id="voice-select-label" className="mb-2 block text-sm font-medium text-gray-700" > Voice </label>
                            {/* --- Relative container for positioning the dropdown panel --- */}
                            <div ref={voiceDropdownRef} className="relative">
                                {/* --- Dropdown Trigger Button --- */}
                                <button
                                    type="button"
                                    disabled={disableVoiceDropdown} // Use the new disable logic
                                    onClick={() => setIsVoiceDropdownOpen(!isVoiceDropdownOpen)}
                                    className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                                    aria-haspopup="listbox"
                                    aria-expanded={isVoiceDropdownOpen}
                                    aria-labelledby="voice-select-label"
                                >
                                    {/* --- Selected Value Display --- */}
                                    <span className="block truncate text-gray-900">{currentVoice}</span>
                                    {/* --- Chevron Icon --- */}
                                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                        <ChevronDown
                                            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isVoiceDropdownOpen ? 'rotate-180' : ''}`}
                                            aria-hidden="true"
                                        />
                                    </span>
                                </button>

                                {/* --- Dropdown Panel --- */}
                                {isVoiceDropdownOpen && (
                                    <div
                                        role="listbox"
                                        aria-labelledby="voice-select-label"
                                        className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
                                    >
                                        {availableVoices.map((voice) => (
                                            <button
                                                key={voice}
                                                type="button"
                                                role="option"
                                                aria-selected={currentVoice === voice}
                                                onClick={() => handleVoiceSelect(voice)}
                                                disabled={disableVoiceDropdown} // Use the new disable logic
                                                className={`relative w-full cursor-default select-none py-2 pl-3 pr-9 text-left hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 ${currentVoice === voice ? 'bg-blue-50 font-semibold text-blue-700' : 'text-gray-900'
                                                    }`}
                                            >
                                                <span className={`block truncate ${currentVoice === voice ? 'font-semibold' : 'font-normal'}`}>
                                                    {voice}
                                                </span>
                                                {/* Optional Checkmark logic can be added here if needed */}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                         {/* --- End Voice Selection --- */}
                    </fieldset>

                    {/* Placeholder for Regular Chat Settings */}
                    {currentChatMode === 'regular' && (
                        <div className="mt-6 text-sm text-gray-500">
                             {/* You can adjust or remove this message */}
                        </div>
                    )}

                </div> {/* End flex-grow wrapper */}

            </div> {/* End Inner Content Wrapper */}
        </div> // End SidePanel Container
    );
};

export default SidePanel;