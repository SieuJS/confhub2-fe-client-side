// src/components/layout/SidePanel.tsx
import React, { useState, useRef, useEffect } from 'react'; // Added useState, useRef, useEffect
import Image from 'next/image';
import { Link } from '@/src/navigation';
import { OutputModality, PrebuiltVoice, Language, LanguageOption, ChatMode } from '@/src/app/[locale]/chatbot/lib/types';
import { House, MessageCircleMore, Volume2, Text, X, Radio, Bot, ChevronDown } from 'lucide-react'; // Added ChevronDown

// --- Props Interface Update (Unchanged) ---
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

// --- Helper: Custom Select Arrow SVG (Unchanged, kept for voice select) ---
const customSelectArrow = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;

// --- Helper: Get Flag URL (Unchanged) ---
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
    const disableLiveSettings = isLiveConnected || currentChatMode === 'regular';

    // --- NEW: State for language dropdown ---
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null); // Ref for click outside detection

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onVoiceChange(event.target.value as PrebuiltVoice);
    };

    // --- NEW: Find selected language object ---
    const selectedLanguage = availableLanguages.find(lang => lang.code === currentLanguage);

    // --- NEW: Handle Language Selection ---
    const handleLanguageSelect = (langCode: Language) => {
        onLanguageChange(langCode);
        setIsLangDropdownOpen(false); // Close dropdown on selection
    };

    // --- NEW: Effect for Click Outside ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsLangDropdownOpen(false);
            }
        };

        if (isLangDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        // Cleanup listener on component unmount or when dropdown closes
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLangDropdownOpen]);


    return (
        // Side Panel Container (Unchanged)
        <div
            className={`flex-shrink-0 h-full bg-white text-gray-800 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'
                }`}
            aria-hidden={!isOpen}
            aria-labelledby="sidepanel-title"
        >
            {/* Inner Content Wrapper (Unchanged) */}
            <div className="flex h-full flex-col p-5 min-w-[18rem] overflow-y-auto">

                {/* Header (Unchanged) */}
                <div className="mb-6 flex flex-shrink-0 items-center justify-between">
                    <h2 id="sidepanel-title" className="text-xl font-semibold text-gray-900">
                        Chatbot Settings
                    </h2>
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

                {/* Navigation (Unchanged) */}
                <nav className="mb-4 flex-shrink-0 border-b border-gray-200 pb-4">
                    {/* ... Link unchanged ... */}
                    <Link
                        href="/"
                        className="group flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                    >
                        <House stroke="currentColor" className="h-5 w-5 text-gray-400 group-hover:text-blue-600" size={20} strokeWidth={1.5} />
                        <span>Home</span>
                    </Link>
                </nav>

                {/* --- Rest of the content --- */}
                <div className="flex-grow">

                    {/* Chat Mode Selection (Unchanged) */}
                    <div className="mb-6">
                         {/* ... unchanged Chat Mode buttons ... */}
                        <label className="mb-3 block text-sm font-medium text-gray-700">
                            Chat Mode
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => onChatModeChange('live')}
                                disabled={isLiveConnected} // Can't change mode while live chat is connected
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
                                disabled={isLiveConnected} // Can't change mode while live chat is connected
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

                    {/* Live Stream Settings (Conditionally Enabled/Visible) */}
                    <fieldset
                        id="settings-content"
                        disabled={disableLiveSettings} // Disable based on connection status OR if not in live mode
                        className={`space-y-6 transition-opacity duration-300 ${currentChatMode === 'live' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`} // Fade out if not live mode
                    >
                        <legend className="mb-3 block text-base font-medium text-gray-900 border-b pb-1">
                            Live Stream Settings
                        </legend>

                        {/* --- MODIFIED: Language Selection Dropdown --- */}
                        <div>
                            <label id="language-select-label" className="mb-2 block text-sm font-medium text-gray-700"> {/* Adjusted margin */}
                                Language
                            </label>
                            {/* --- Relative container for positioning the dropdown panel --- */}
                            <div ref={dropdownRef} className="relative">
                                {/* --- Dropdown Trigger Button --- */}
                                <button
                                    type="button"
                                    disabled={disableLiveSettings}
                                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                    className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                                    aria-haspopup="listbox"
                                    aria-expanded={isLangDropdownOpen}
                                    aria-labelledby="language-select-label"
                                >
                                    {/* --- Selected Value Display --- */}
                                    <span className="flex items-center">
                                        {selectedLanguage ? (
                                            <>
                                                <Image
                                                    src={getFlagUrl(selectedLanguage.flagCode)}
                                                    alt={`${selectedLanguage.name} flag`}
                                                    width={20} // Smaller flag for inline display
                                                    height={15}
                                                    className="mr-2 h-auto w-[20px] flex-shrink-0 rounded-sm"
                                                    loading="lazy"
                                                />
                                                <span className="block truncate text-gray-900">{selectedLanguage.name}</span>
                                            </>
                                        ) : (
                                            <span className="block truncate text-gray-500">Select language...</span> // Fallback
                                        )}
                                    </span>
                                    {/* --- Chevron Icon --- */}
                                    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
                                        <ChevronDown
                                            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''}`}
                                            aria-hidden="true"
                                        />
                                    </span>
                                </button>

                                {/* --- Dropdown Panel --- */}
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
                                                disabled={disableLiveSettings} // Redundant check, but safe
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
                                                {/* Optional: Add a checkmark for the selected item
                                                {currentLanguage === lang.code && (
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                                        <Check size={20} aria-hidden="true" />
                                                    </span>
                                                )}
                                                 */}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* --- End Modified Language Selection --- */}


                        {/* Output Format Section (Unchanged) */}
                         <div>
                            <label className="mb-3 block text-sm font-medium text-gray-700">
                                Output Format
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Audio Button */}
                                <button type="button" onClick={() => onModalityChange('audio')} disabled={disableLiveSettings} className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${isAudioSelected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}`} aria-pressed={isAudioSelected} >
                                    <Volume2 stroke="currentColor" className={`mb-1 h-6 w-6 ${isAudioSelected ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} aria-hidden="true" size={24} />
                                    <span className={`text-sm font-medium ${isAudioSelected ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-800'}`}> Audio </span>
                                </button>
                                {/* Text Button */}
                                <button type="button" onClick={() => onModalityChange('text')} disabled={disableLiveSettings} className={`group flex flex-col items-center justify-center rounded-lg border p-3 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${currentModality === 'text' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}`} aria-pressed={currentModality === 'text'} >
                                    <Text stroke="currentColor" className={`mb-1 h-6 w-6 ${currentModality === 'text' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} aria-hidden="true" size={24} />
                                    <span className={`text-sm font-medium ${currentModality === 'text' ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-800'}`}> Text </span>
                                </button>
                            </div>
                        </div>

                        {/* Voice Selection Section (Unchanged) */}
                        <div className={`transition-opacity duration-300 ${isAudioSelected && currentChatMode === 'live' ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}>
                            <label htmlFor="voiceSelect" className="mb-2 block text-sm font-medium text-gray-700" > Voice </label>
                            <div className="relative">
                                <select
                                    id="voiceSelect"
                                    value={currentVoice}
                                    onChange={handleSelectChange}
                                    disabled={disableLiveSettings || !isAudioSelected}
                                    className="w-full appearance-none rounded-md border border-gray-300 bg-white bg-no-repeat px-3 py-2 pr-8 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
                                    style={{
                                        backgroundImage: customSelectArrow,
                                        backgroundPosition: `right 0.5rem center`,
                                        backgroundSize: `1.5em 1.5em`,
                                    }}
                                >
                                    {availableVoices.map((voice) => (<option key={voice} value={voice}> {voice} </option>))}
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    {/* Placeholder for Regular Chat Settings (Unchanged) */}
                    {currentChatMode === 'regular' && (
                         <div className="mt-6 text-sm text-gray-500">
                            Regular chat mode selected. No specific settings here yet.
                        </div>
                    )}

                </div> {/* End flex-grow wrapper */}

            </div> {/* End Inner Content Wrapper */}
        </div> // End SidePanel Container
    );
};

export default SidePanel;