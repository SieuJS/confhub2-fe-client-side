// src/app/chatbot/page.tsx
"use client";

import { useState } from 'react';
import { LiveAPIProvider } from '@/src/app/[locale]/chatbot/livechat/contexts/LiveAPIContext';
import MainLayout from './MainLayout';
import LiveChatExperience from './LiveChat';
import RegularChat from './RegularChat'; // Assuming this component exists

// Import constants and types
import {
    API_URI,
    AVAILABLE_LANGUAGES,
    AVAILABLE_VOICES,
    DEFAULT_LANGUAGE,
    DEFAULT_MODALITY,
    DEFAULT_VOICE
} from './lib/constants';
import { OutputModality, PrebuiltVoice, Language, ChatMode } from './lib/types';

// Get API Key - Ensure secure handling
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

function UnifiedChatPage() {
    const [chatMode, setChatMode] = useState<ChatMode>('regular'); // Default to regular for easier testing
    const [currentModality, setCurrentModality] = useState<OutputModality>(DEFAULT_MODALITY);
    const [currentVoice, setCurrentVoice] = useState<PrebuiltVoice>(DEFAULT_VOICE);
    const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);

    const handleModalityChange = (modality: OutputModality) => setCurrentModality(modality);
    const handleVoiceChange = (voice: PrebuiltVoice) => setCurrentVoice(voice);
    const handleLanguageChange = (lang: Language) => setCurrentLanguage(lang);

    if (typeof API_KEY !== "string" || !API_KEY) {
        console.error("NEXT_PUBLIC_GEMINI_API_KEY is not set or invalid.");
        return (
            <div className="flex h-screen items-center justify-center text-lg font-semibold text-red-600">
                Configuration Error: Live Chat API Key is missing. Please contact support.
            </div>
        );
    }

    return (
        <LiveAPIProvider url={API_URI} apiKey={API_KEY}>
            <MainLayout
                currentChatMode={chatMode}
                onChatModeChange={setChatMode}
                currentModality={currentModality}
                onModalityChange={handleModalityChange}
                currentVoice={currentVoice}
                onVoiceChange={handleVoiceChange}
                availableVoices={AVAILABLE_VOICES}
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange} // Pass handler
                availableLanguages={AVAILABLE_LANGUAGES}
            >
                {chatMode === 'live' ? (
                    <LiveChatExperience
                        currentModality={currentModality}
                        currentVoice={currentVoice}
                        currentLanguage={currentLanguage}
                    />
                ) : (
                    // Pass currentLanguage to RegularChat
                    <RegularChat currentLanguage={currentLanguage} />
                )}
            </MainLayout>
        </LiveAPIProvider>
    );
}

export default UnifiedChatPage;