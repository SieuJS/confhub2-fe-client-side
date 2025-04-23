// src/app/[locale]/chatbot/chat/RegularChat.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatHistory from './regularchat/ChatHistory';
import ChatInput from './regularchat/ChatInput';
import LoadingIndicator from './regularchat/LoadingIndicator';
import Introduction from './regularchat/ChatIntroduction';
import EmailConfirmationDialog from './EmailConfirmationDialog';
import { useTimer } from '@/src/hooks/chatbot/useTimer';
import { useSharedChatSocket } from './context/ChatSocketContext';
import { Language } from './lib/live-chat.types';

// Define props interface
interface RegularChatProps {
    currentLanguage: Language;
}

function RegularChat({ currentLanguage }: RegularChatProps) {
    // --- Use Hooks ---
    const { timeCounter, startTimer, stopTimer } = useTimer();
    // --- Use the SHARED hook via context ---
    const {
        chatMessages,
        loadingState,
        isConnected,
        sendMessage: sendMessageViaSocket,
        socketId,
        showConfirmationDialog,
        confirmationData,
        handleConfirmSend,
        handleCancelSend,
        closeConfirmationDialog,
        activeConversationId,
        isLoadingHistory,
        sendMessage // Get the actual sendMessage from the shared hook
    } = useSharedChatSocket();

    // --- Component Specific State ---
    const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
    const [fillInputFunction, setFillInputFunction] = useState<((text: string) => void) | null>(null);
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    const [isStreamingEnabled, setIsStreamingEnabled] = useState<boolean>(true);

    // --- Scroll to Bottom ---
    useEffect(() => {
        if (chatHistoryRef.current && !showConfirmationDialog) {
            setTimeout(() => {
                if (chatHistoryRef.current) {
                    chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
                }
            }, 100); 
        }
    }, [chatMessages, showConfirmationDialog]);


    // --- Stop Timer Logic ---
    useEffect(() => {
        // Stop timer if loading finishes OR if the confirmation dialog appears (pauses activity)
        if ((!loadingState.isLoading || showConfirmationDialog) && timeCounter !== '0.0s') {
            stopTimer();
        }
    }, [loadingState.isLoading, showConfirmationDialog, stopTimer, timeCounter]);

    // --- Send Chat Message ---
    const sendChatMessage = useCallback(async (userMessage: string) => {
        const trimmedMessage = userMessage.trim();
        if (!trimmedMessage) return;
        if (!isConnected) {
            console.warn("Attempted to send message while disconnected.");
            // Optionally show a user-facing error message here
            return;
        }
        if (!hasChatStarted) setHasChatStarted(true);
        startTimer();
        // Use the sendMessage function obtained from the context
        sendMessage(trimmedMessage, isStreamingEnabled, currentLanguage);
    }, [isConnected, startTimer, sendMessage, isStreamingEnabled, currentLanguage]);

    // --- Input Interaction Logic --- 
    const handleSetFillInput = useCallback((fillFunc: (text: string) => void) => {
        setFillInputFunction(() => fillFunc);
    }, []);

    const handleSuggestionClick = useCallback((suggestion: string) => {
        if (fillInputFunction) {
            fillInputFunction(suggestion);
        }
    }, [fillInputFunction]);

    // --- Handle Toggle Change --- 
    const handleStreamingToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsStreamingEnabled(event.target.checked);
    };

    // --- QUYẾT ĐỊNH HIỂN THỊ INTRODUCTION ---
    // Hiển thị Intro khi:
    // 1. Không có conversation nào đang active (activeConversationId là null)
    // 2. Mảng chatMessages rỗng
    // 3. Không đang trong quá trình loading history
    const showIntroduction = !activeConversationId && chatMessages.length === 0 && !isLoadingHistory;
    // ---------------------------------------


    // --- JSX Structure ---
    return (
        <div className="relative flex flex-col h-full w-full mx-auto bg-white rounded-xl shadow-xl border border-gray-200">

            {/* Header */}
            <div className="flex-shrink-0 p-2 border-b border-gray-200 bg-gray-50">
                <div className="text-center text-xs text-gray-500 flex items-center justify-center space-x-1">
                    <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span>{isConnected ? 'Connected' : 'Disconnected'} {socketId ? `(ID: ${socketId.substring(0, 5)}...)` : ''}</span>
                </div>
            </div>

            {/* Chat History Area */}
            <div ref={chatHistoryRef} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-white to-gray-50">
                {showIntroduction && (
                    <Introduction onSuggestionClick={handleSuggestionClick} />
                )}
                <ChatHistory messages={chatMessages} />
            </div>

            {/* Loading Indicator Area */}
            {/* Có thể muốn hiển thị loading indicator riêng khi isLoadingHistory */}
            {(loadingState.isLoading || isLoadingHistory) && !showConfirmationDialog && ( 
                <div className="flex-shrink-0 px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <LoadingIndicator
                        step={isLoadingHistory ? 'loading_history' : loadingState.step}
                        message={isLoadingHistory ? 'Loading chat...' : loadingState.message}
                        timeCounter={isLoadingHistory ? undefined : timeCounter}
                    />
                </div>
            )}

            {/* Streaming Toggle UI - Disable while dialog is shown */}
            <div className="flex-shrink-0 px-4 pt-2 pb-1 border-t border-gray-100 bg-gray-50 flex items-center justify-end space-x-2">
                <label htmlFor="streaming-toggle" className={`text-sm text-gray-600 ${loadingState.isLoading || showConfirmationDialog ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                    Stream Response:
                </label>
                <input
                    type="checkbox"
                    id="streaming-toggle"
                    checked={isStreamingEnabled}
                    onChange={handleStreamingToggle}
                    className={`form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${loadingState.isLoading || showConfirmationDialog ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={loadingState.isLoading || showConfirmationDialog || isLoadingHistory} 
                />
            </div>

            {/* Input Area - Disable while dialog is shown */}
            <div className="flex-shrink-0 p-3 md:p-4 border-t border-gray-200 bg-gray-50 pt-2">
                <ChatInput
                    onSendMessage={sendChatMessage}
                    // Disable input when loading, disconnected, OR when confirmation dialog is shown
                    disabled={loadingState.isLoading || !isConnected || showConfirmationDialog || isLoadingHistory} 
                    onRegisterFillFunction={handleSetFillInput}
                />
            </div>

            {/* --- Conditionally Render the Confirmation Dialog --- */}
            <EmailConfirmationDialog
                isOpen={showConfirmationDialog}
                data={confirmationData}
                onConfirm={handleConfirmSend}
                onCancel={handleCancelSend}
                onClose={closeConfirmationDialog} 
            />
        </div>
    );
}

export default RegularChat;