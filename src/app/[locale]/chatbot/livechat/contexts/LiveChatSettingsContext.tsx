// src/app/[locale]/chatbot/livechat/contexts/LiveChatSettingsContext.tsx

"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { OutputModality, PrebuiltVoice } from '../../lib/live-chat.types';
import { AVAILABLE_VOICES_LIVE_CHAT, DEFAULT_MODALITY_LIVE_CHAT, DEFAULT_VOICE_LIVE_CHAT } from '../../lib/constants';
import { Modality as SDKModality } from '@google/genai';
// --- Interface cho Context Value ---
interface LiveChatSettingsContextType {
    currentModality: OutputModality;
    setCurrentModality: (modality: OutputModality) => void;
    currentVoice: PrebuiltVoice;
    setCurrentVoice: (voice: PrebuiltVoice) => void;
    availableVoices: PrebuiltVoice[];
    // --- THÊM TRẠNG THÁI KẾT NỐI VÀ SETTER ---
    isLiveChatConnected: boolean;
    setLiveChatConnected: (isConnected: boolean) => void;
}

interface LiveChatSettingsProviderProps {
    children: ReactNode;
}

const LiveChatSettingsContext = createContext<LiveChatSettingsContextType | undefined>(undefined);

export const useLiveChatSettings = (): LiveChatSettingsContextType => {
    const context = useContext(LiveChatSettingsContext);
    if (!context) {
        throw new Error('useLiveChatSettings must be used within a LiveChatSettingsProvider');
    }
    return context;
};

export const LiveChatSettingsProvider: React.FC<LiveChatSettingsProviderProps> = ({ children }) => {
    const [currentModality, _setCurrentModality] = useState<OutputModality>(DEFAULT_MODALITY_LIVE_CHAT);
    const [currentVoice, setCurrentVoice] = useState<PrebuiltVoice>(DEFAULT_VOICE_LIVE_CHAT);
    const [isLiveChatConnected, setLiveChatConnected] = useState<boolean>(false);

    const setCurrentModality = (modality: OutputModality) => {
        // console.log('[LiveChatSettingsContext] Setting modality to:', modality, SDKModality[modality]); // Log the enum value and its string name
        _setCurrentModality(modality);
    };

    return (
        <LiveChatSettingsContext.Provider
            value={{
                currentModality,
                setCurrentModality,
                currentVoice,
                setCurrentVoice,
                availableVoices: AVAILABLE_VOICES_LIVE_CHAT,
                // --- TRUYỀN STATE VÀ SETTER MỚI VÀO CONTEXT VALUE ---
                isLiveChatConnected,
                setLiveChatConnected,
            }}
        >
            {children}
        </LiveChatSettingsContext.Provider>
    );
};