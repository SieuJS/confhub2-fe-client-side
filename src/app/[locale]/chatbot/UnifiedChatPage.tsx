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
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY; // No need to cast here, check below

function UnifiedChatPage() {
    const [chatMode, setChatMode] = useState<ChatMode>('live'); // Default to live mode

    // Settings state managed here to pass to SidePanel and LiveChatExperience
    const [currentModality, setCurrentModality] = useState<OutputModality>(DEFAULT_MODALITY);
    const [currentVoice, setCurrentVoice] = useState<PrebuiltVoice>(DEFAULT_VOICE);
    const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);

    // --- Settings Handlers ---
    // We prevent changes if connected *within* the SidePanel/LiveChatExperience
    const handleModalityChange = (modality: OutputModality) => setCurrentModality(modality);
    const handleVoiceChange = (voice: PrebuiltVoice) => setCurrentVoice(voice);
    const handleLanguageChange = (lang: Language) => setCurrentLanguage(lang);

    // --- API Key Check ---
    if (typeof API_KEY !== "string" || !API_KEY) {
        console.error("NEXT_PUBLIC_GEMINI_API_KEY is not set or invalid.");
        // Consider a more user-friendly error display component
        return (
            <div className="flex h-screen items-center justify-center text-lg font-semibold text-red-600">
                Configuration Error: Live Chat API Key is missing. Please contact support.
            </div>
        );
    }

    return (
        // LiveAPIProvider wraps everything needing the live connection context
        <LiveAPIProvider url={API_URI} apiKey={API_KEY}>
            <MainLayout
                // Mode control
                currentChatMode={chatMode}
                onChatModeChange={setChatMode}

                // Pass settings state and handlers to MainLayout (which passes to SidePanel)
                currentModality={currentModality}
                onModalityChange={handleModalityChange}
                currentVoice={currentVoice}
                onVoiceChange={handleVoiceChange}
                availableVoices={AVAILABLE_VOICES}
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
                availableLanguages={AVAILABLE_LANGUAGES}
            >
                {/* Conditional rendering based on chatMode */}
                {chatMode === 'live' ? (
                    <LiveChatExperience
                        // Pass settings required by the live chat view
                        currentModality={currentModality}
                        currentVoice={currentVoice}
                        currentLanguage={currentLanguage}
                        // We don't need to pass handlers back up if state is managed here
                    />
                ) : (
                    <RegularChat />
                )}
            </MainLayout>
        </LiveAPIProvider>
    );
}

export default UnifiedChatPage;