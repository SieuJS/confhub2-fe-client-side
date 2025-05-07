// src/components/chatbot/context/ChatSettingsContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    Language,
    OutputModality,
    PrebuiltVoice,
    LanguageOption,
    ChatMode
} from '../lib/live-chat.types';
import {
    AVAILABLE_LANGUAGES,
    AVAILABLE_VOICES,
    DEFAULT_LANGUAGE,
    DEFAULT_MODALITY,
    DEFAULT_VOICE
} from '../lib/constants';
import { usePathname, useRouter } from '@/src/navigation';

interface ChatSettingsContextType {
    chatMode: ChatMode;
    setChatModeState: (mode: ChatMode) => void;
    currentModality: OutputModality;
    setCurrentModality: (modality: OutputModality) => void;
    currentVoice: PrebuiltVoice;
    setCurrentVoice: (voice: PrebuiltVoice) => void;
    currentLanguage: Language;
    setCurrentLanguage: (lang: Language) => void;
    availableVoices: PrebuiltVoice[];
    availableLanguages: LanguageOption[];
    handleChatModeNavigation: (newMode: ChatMode) => void;
    // --- NEW FOR STREAMING TOGGLE ---
    isStreamingEnabled: boolean;
    setIsStreamingEnabled: (enabled: boolean) => void;
    // ---------------------------------
}

const ChatSettingsContext = createContext<ChatSettingsContextType | undefined>(undefined);

export const useChatSettings = (): ChatSettingsContextType => {
    const context = useContext(ChatSettingsContext);
    if (!context) {
        throw new Error('useChatSettings must be used within a ChatSettingsProvider');
    }
    return context;
};

interface ChatSettingsProviderProps {
    children: ReactNode;
}

export const ChatSettingsProvider: React.FC<ChatSettingsProviderProps> = ({ children }) => {
    const pathname = usePathname();
    const router = useRouter();

    const getInitialChatMode = (): ChatMode => {
        if (pathname.includes('/chatbot/livechat')) { // Kiểm tra path chính xác hơn
            return 'live';
        }
        return 'regular';
    };

    const [chatMode, setChatModeState] = useState<ChatMode>(getInitialChatMode());
    const [currentModality, setCurrentModality] = useState<OutputModality>(DEFAULT_MODALITY);
    const [currentVoice, setCurrentVoice] = useState<PrebuiltVoice>(DEFAULT_VOICE);
    const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);
    // --- NEW STATE FOR STREAMING ---
    const [isStreamingEnabled, setIsStreamingEnabled] = useState<boolean>(true); // Default là true
    // -------------------------------

    const handleChatModeNavigation = (newMode: ChatMode) => {
        if (newMode === chatMode) return;
        // setChatModeState(newMode); // Cập nhật state ngay để UI có thể phản hồi
        if (newMode === 'live') {
            router.push('/chatbot/livechat');
        } else {
            // Mặc định là regular chat nếu không phải live
            router.push('/chatbot/regularchat'); // Hoặc path mặc định của bạn cho regular chat
        }
    };
    
    useEffect(() => {
        const modeFromPath = getInitialChatMode();
        if (modeFromPath !== chatMode) {
            setChatModeState(modeFromPath);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);


    return (
        <ChatSettingsContext.Provider
            value={{
                chatMode,
                setChatModeState,
                currentModality,
                setCurrentModality,
                currentVoice,
                setCurrentVoice,
                currentLanguage,
                setCurrentLanguage,
                availableVoices: AVAILABLE_VOICES,
                availableLanguages: AVAILABLE_LANGUAGES,
                handleChatModeNavigation,
                // --- PROVIDE STREAMING STATE AND SETTER ---
                isStreamingEnabled,
                setIsStreamingEnabled,
                // -----------------------------------------
            }}
        >
            {children}
        </ChatSettingsContext.Provider>
    );
};