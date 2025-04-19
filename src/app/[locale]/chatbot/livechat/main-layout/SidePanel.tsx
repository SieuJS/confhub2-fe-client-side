// src/components/SidePanel.tsx (Revised with Flag Logic)
import React from 'react';
import Image from 'next/image'; // <--- Import Image
import { Link } from '@/src/navigation';
import { OutputModality, PrebuiltVoice, Language } from '../multimodal-live-types'; // Or from src/types.ts
import { House, MessageCircleMore, Volume2, Text, X } from 'lucide-react';

// --- Define a clearer type for LanguageOption (including flagCode) ---
interface LanguageOption {
    code: Language;
    name: string;
    flagCode: string; // <-- Add flagCode here
}

// --- Props Interface Update ---
interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentModality: OutputModality;
    onModalityChange: (modality: OutputModality) => void;
    currentVoice: PrebuiltVoice;
    onVoiceChange: (voice: PrebuiltVoice) => void;
    availableVoices: PrebuiltVoice[];
    currentLanguage: Language;
    onLanguageChange: (lang: Language) => void;
    availableLanguages: LanguageOption[]; // <-- Use the updated type
    isConnected: boolean;
}

// --- Helper: Custom Select Arrow SVG ---
const customSelectArrow = `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`;

// --- Helper: Get Flag URL (copied from LangSwitcher) ---
const getFlagUrl = (flagCode: string) => `/country_flags/${flagCode}.svg`; // Đảm bảo thư mục này tồn tại trong public/

// --- Component Definition ---
const SidePanel: React.FC<SidePanelProps> = ({
    isOpen,
    onClose,
    currentModality,
    onModalityChange,
    currentVoice,
    onVoiceChange,
    availableVoices,
    currentLanguage,
    onLanguageChange,
    availableLanguages, // Now expects objects with flagCode
    isConnected,
}) => {
    const isAudioSelected = currentModality === 'audio';

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onVoiceChange(event.target.value as PrebuiltVoice);
    };

    return (
        <div
            className={`fixed inset-y-0 left-0 z-40 flex flex-col overflow-y-auto bg-white text-gray-800 shadow-xl transition-all duration-300 ease-in-out transform ${
                isOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full opacity-90'
                }`}
            aria-hidden={!isOpen}
            aria-labelledby="sidepanel-title"
        >
            {/* Content Wrapper */}
            <div className="flex h-full flex-col p-5">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h2 id="sidepanel-title" className="text-xl font-semibold text-gray-900">
                        Stream Realtime
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

                {/* Navigation */}
                <nav className="mb-6 border-b border-gray-200 pb-4">
                    {/* ... Links remain the same ... */}
                    <Link
                        href="/"
                        className="group flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                    >
                        <House stroke="currentColor" className="h-5 w-5 text-gray-400 group-hover:text-blue-600" size={20} strokeWidth={1.5} />
                        <span>Home</span>
                    </Link>
                    <Link
                        href="/chatbot/chat"
                        className="group mt-1 flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700"
                    >
                        <MessageCircleMore stroke="currentColor" className="h-5 w-5 text-gray-400 group-hover:text-blue-600" size={20} strokeWidth={1.5} />
                        <span>Chat</span>
                    </Link>
                </nav>

                {/* Settings Content */}
                <fieldset
                    id="settings-content"
                    disabled={isConnected}
                    className="flex-grow space-y-6 disabled:cursor-not-allowed disabled:opacity-70"
                >

                    {/* --- Language Selection --- */}
                    <div>
                        <label className="mb-3 block text-sm font-medium text-gray-700">
                            Language
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Map over availableLanguages which now includes flagCode */}
                            {availableLanguages.map(lang => (
                                <button
                                    key={lang.code}
                                    type="button"
                                    onClick={() => onLanguageChange(lang.code)}
                                    disabled={isConnected}
                                    className={`group flex flex-col items-center justify-center rounded-lg border p-4 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${currentLanguage === lang.code
                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' // Selected style
                                            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50' // Default style
                                        }`}
                                    aria-pressed={currentLanguage === lang.code}
                                    title={`Select ${lang.name}`}
                                >
                                    {/* --- START: Replace SVG with Image --- */}
                                    <Image
                                        src={getFlagUrl(lang.flagCode)}
                                        alt={`${lang.name} flag`}
                                        width={28} // Slightly larger for the button context
                                        height={21} // Maintain aspect ratio (approx 4:3)
                                        className="mb-2 h-auto w-[28px] rounded-sm" // Added rounded-sm for subtle style
                                        loading="lazy" // Lazy load flags
                                    />
                                    {/* --- END: Replace SVG with Image --- */}

                                    <span className={`text-sm font-medium ${currentLanguage === lang.code ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-800'}`}>
                                        {lang.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Output Format Section (remains the same) */}
                    <div>
                        <label className="mb-3 block text-sm font-medium text-gray-700">
                            Output Format
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {/* Audio Button */}
                            <button type="button" onClick={() => onModalityChange('audio')} disabled={isConnected} className={`group flex flex-col items-center justify-center rounded-lg border p-4 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${isAudioSelected ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}`} aria-pressed={isAudioSelected} >
                                <Volume2 stroke="currentColor" className={`mb-2 h-6 w-6 ${!isAudioSelected ? 'text-gray-400 group-hover:text-gray-500' : 'text-blue-600'}`} aria-hidden="true" size={20} strokeWidth={1.5} />
                                <span className={`text-sm font-medium ${isAudioSelected ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-800'}`}> Audio </span>
                            </button>
                            {/* Text Button */}
                            <button type="button" onClick={() => onModalityChange('text')} disabled={isConnected} className={`group flex flex-col items-center justify-center rounded-lg border p-4 transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${currentModality === 'text' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'}`} aria-pressed={currentModality === 'text'} >
                                <Text stroke="currentColor" className={`mb-2 h-6 w-6 ${isAudioSelected ? 'text-gray-400 group-hover:text-gray-500' : 'text-blue-600'}`} aria-hidden="true" size={20} strokeWidth={1.5} />
                                <span className={`text-sm font-medium ${currentModality === 'text' ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-800'}`}> Text </span>
                            </button>
                        </div>
                    </div>

                     {/* Voice Selection Section (remains the same) */}
                    <div className={`transition-opacity duration-300 ${isAudioSelected ? 'opacity-100' : 'opacity-0 pointer-events-none h-0 overflow-hidden'}`}>
                         <label htmlFor="voiceSelect" className="mb-2 block text-sm font-medium text-gray-700" > Voice </label>
                         <div className="relative">
                             <select id="voiceSelect" value={currentVoice} onChange={handleSelectChange} className={`w-full appearance-none rounded-md border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:opacity-70 ${!isConnected ? 'cursor-pointer' : 'cursor-not-allowed'}`} style={{ backgroundImage: customSelectArrow, backgroundRepeat: 'no-repeat', backgroundPosition: `right 0.7rem center`, backgroundSize: '1.2em 1.2em', }} disabled={isConnected || !isAudioSelected} >
                                 {availableVoices.map((voice) => (<option key={voice} value={voice}> {voice} </option>))}
                             </select>
                         </div>
                     </div>
                </fieldset>
            </div>
        </div>
    );
};

export default SidePanel;