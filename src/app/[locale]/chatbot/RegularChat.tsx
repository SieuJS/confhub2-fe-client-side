// src/app/[locale]/chatbot/chat/RegularChat.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatHistory from './regularchat/ChatHistory';
import ChatInput from './regularchat/ChatInput';
import LoadingIndicator from './regularchat/LoadingIndicator';
import Introduction from './regularchat/ChatIntroduction';

// Import hooks and types
import { useTimer } from '@/src/hooks/chatbot/useTimer';
import { useChatSocket } from '@/src/hooks/chatbot/useChatSocket';
import { appConfig } from '@/src/middleware';
import { Language } from './lib/types'; // Adjust path as needed

const SOCKET_SERVER_URL = appConfig.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Define props interface
interface RegularChatProps {
    currentLanguage: Language; // <<< Accept language prop
}

function RegularChat({ currentLanguage }: RegularChatProps) { // <<< Destructure prop
    // --- Use Hooks ---
    const { timeCounter, startTimer, stopTimer } = useTimer();
    const {
        chatMessages,
        loadingState,
        isConnected,
        sendMessage: sendMessageViaSocket, // Hook's send function
        socketId
    } = useChatSocket({
        socketUrl: SOCKET_SERVER_URL,
    });

    // --- Component Specific State ---
    const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
    const [fillInputFunction, setFillInputFunction] = useState<((text: string) => void) | null>(null);
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    // --- State for Streaming Toggle ---
    const [isStreamingEnabled, setIsStreamingEnabled] = useState<boolean>(true);

    // --- Scroll to Bottom ---
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatMessages]);

    // --- Stop Timer Logic ---
    useEffect(() => {
        if (!loadingState.isLoading && timeCounter !== '0.0s') {
            stopTimer();
        }
    }, [loadingState.isLoading, stopTimer, timeCounter]);


    // --- Send Chat Message (Pass language to hook) ---
    const sendChatMessage = useCallback(async (userMessage: string) => {
        const trimmedMessage = userMessage.trim();
        if (!trimmedMessage) return;

        if (!isConnected) {
            console.warn("Attempted to send message while disconnected.");
            return;
        }

        if (!hasChatStarted) {
            setHasChatStarted(true);
        }

        startTimer();

        // Pass the current language along with the streaming flag
        sendMessageViaSocket(trimmedMessage, isStreamingEnabled, currentLanguage); // <<< Pass language

    }, [isConnected, hasChatStarted, startTimer, sendMessageViaSocket, isStreamingEnabled, currentLanguage]); // <<< Add currentLanguage dependency


    // --- Input Interaction Logic ---
    const handleSetFillInput = useCallback((fillFunc: (text: string) => void) => {
        setFillInputFunction(() => fillFunc);
    }, []);

    const handleSuggestionClick = useCallback((suggestion: string) => {
        if (fillInputFunction) {
            fillInputFunction(suggestion);
        }
        // Optional: Automatically send suggestion
        // if (suggestion) {
        //    sendChatMessage(suggestion); // Will use current language and streaming settings
        // }
    }, [fillInputFunction]); // Removed sendChatMessage


    // --- Handle Toggle Change ---
    const handleStreamingToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsStreamingEnabled(event.target.checked);
    };

    // --- JSX Structure (No changes needed here for language logic) ---
    return (
        <div className="flex flex-col h-[calc(100vh-1.5rem)] max-h-[900px] w-full max-w mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">

            {/* Header */}
            <div className="flex-shrink-0 p-2 border-b border-gray-200 bg-gray-50">
                {/* <h1 className="text-lg font-semibold text-center text-gray-800">
                    AI Conference Assistant
                </h1> */}
                <div className="text-center text-xs text-gray-500 flex items-center justify-center space-x-1">
                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span>{isConnected ? 'Connected' : 'Disconnected'} {socketId ? `(ID: ${socketId.substring(0, 5)}...)` : ''}</span>
                </div>
            </div>

            {/* Chat History Area */}
            <div ref={chatHistoryRef} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-white to-gray-50">
                {!hasChatStarted && chatMessages.length === 0 && (
                    <Introduction onSuggestionClick={handleSuggestionClick} />
                )}
                <ChatHistory messages={chatMessages} />
            </div>

            {/* Loading Indicator Area */}
            {loadingState.isLoading && (
                <div className="flex-shrink-0 px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <LoadingIndicator
                        step={loadingState.step}
                        message={loadingState.message}
                        timeCounter={timeCounter}
                    />
                </div>
            )}

            {/* Streaming Toggle UI */}
            <div className="flex-shrink-0 px-4 pt-2 pb-1 border-t border-gray-100 bg-gray-50 flex items-center justify-end space-x-2">
                <label htmlFor="streaming-toggle" className="text-sm text-gray-600 cursor-pointer">
                    Stream Response:
                </label>
                <input
                    type="checkbox"
                    id="streaming-toggle"
                    checked={isStreamingEnabled}
                    onChange={handleStreamingToggle}
                    className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    disabled={loadingState.isLoading}
                />
            </div>

            {/* Input Area */}
            <div className="flex-shrink-0 p-3 md:p-4 border-t border-gray-200 bg-gray-50 pt-2">
                <ChatInput
                    onSendMessage={sendChatMessage}
                    disabled={loadingState.isLoading || !isConnected}
                    onRegisterFillFunction={handleSetFillInput}
                />
            </div>
        </div>
    );
}

export default RegularChat;