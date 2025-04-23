// src/app/[locale]/chatbot/MainLayout.tsx
'use client';

import React, { useState, useCallback } from 'react';
import LeftPanel from './LeftPanel';
import RightSettingsPanel from './RightSettingsPanel';
import useConnection from '../chatbot/livechat/hooks/useConnection';
import { LanguageOption, OutputModality, PrebuiltVoice, Language, ChatMode } from './lib/live-chat.types';
import { AlignJustify, Settings } from 'lucide-react';
// --- IMPORT THE CONTEXT HOOK ---
import { useSharedChatSocket } from './context/ChatSocketContext';
import { appConfig } from '@/src/middleware';

interface MainLayoutProps {
    children: React.ReactNode;
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
}

export default function MainLayout({
    children,
    currentChatMode,
    onChatModeChange,
    currentModality,
    onModalityChange,
    currentVoice,
    onVoiceChange,
    availableVoices,
    currentLanguage,
    onLanguageChange,
    availableLanguages
}: MainLayoutProps) {
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);

    const { connected: isLiveConnected } = useConnection();

    // --- Use the SHARED hook via context ---
    const {
        conversationList,
        activeConversationId,
        loadConversation, // Get function from shared context
        startNewConversation, // Get function from shared context
        isLoadingHistory,
        // Get other values if needed by MainLayout itself
    } = useSharedChatSocket();
    // ------------------------------------

    // Handlers now correctly use functions from the shared context
    const handleSelectConversation = useCallback((conversationId: string) => {
        console.log("[MainLayout] Selecting conversation:", conversationId);
        loadConversation(conversationId);
    }, [loadConversation]);

    const handleStartNewConversation = useCallback(() => {
        console.log("[MainLayout] Starting new conversation.");
        startNewConversation();
    }, [startNewConversation]);

    const handleChatModeChange = (mode: ChatMode) => {
        if (isLiveConnected && mode !== 'live') {
            console.warn("Cannot switch from live chat while connected.");
            return;
        }
        onChatModeChange(mode);
    };


    return (
        // Main flex container
        <div className="flex h-screen bg-gray-100 overflow-hidden">

            {/* --- Toggle Button for Left Panel --- */}
            {!isLeftPanelOpen && (
                <button
                    onClick={() => setIsLeftPanelOpen(true)}
                    className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    title="Open chat mode"
                    aria-label="Open chat mode"
                    aria-expanded={isLeftPanelOpen}
                    aria-controls="left-panel-title"
                >
                    <AlignJustify className="h-5 w-5" />
                    <span className="sr-only">Open chat mode</span>
                </button>
            )}
            {/* --- Left Panel (Đã cập nhật props) --- */}
            <LeftPanel
                isOpen={isLeftPanelOpen}
                onClose={() => setIsLeftPanelOpen(false)}
                currentChatMode={currentChatMode}
                onChatModeChange={handleChatModeChange}
                isLiveConnected={isLiveConnected}
                // --- Props from SHARED context ---
                conversationList={conversationList}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onStartNewConversation={handleStartNewConversation}
                isLoading={isLoadingHistory}
            // ---------------------------
            />


            {/* Main Content Area */}
            <main className="flex-1 transition-all duration-300 ease-in-out overflow-hidden relative">
                <div className="h-full w-full">
                    {children}
                </div>
            </main>

            {/* --- Right Panel (Settings) --- */}
            <RightSettingsPanel
                isOpen={isRightPanelOpen}
                onClose={() => setIsRightPanelOpen(false)}
                currentChatMode={currentChatMode}
                currentModality={currentModality}
                onModalityChange={onModalityChange}
                currentVoice={currentVoice}
                onVoiceChange={onVoiceChange}
                availableVoices={availableVoices}
                currentLanguage={currentLanguage}
                onLanguageChange={onLanguageChange}
                availableLanguages={availableLanguages}
                isLiveConnected={isLiveConnected}
            />

            {/* --- Toggle Button for Right Panel --- */}
            {!isRightPanelOpen && (
                <button
                    onClick={() => setIsRightPanelOpen(true)}
                    className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    title="Open settings"
                    aria-label="Open settings"
                    aria-expanded={isRightPanelOpen}
                    aria-controls="right-panel-title"
                >
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Open settings</span>
                </button>
            )}

        </div>
    );
}