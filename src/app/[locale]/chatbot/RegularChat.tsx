// src/app/[locale]/chatbot/chat/RegularChat.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatHistory from './regularchat/ChatHistory';
import ChatInput from './regularchat/ChatInput';
import LoadingIndicator from './regularchat/LoadingIndicator';
import Introduction from './regularchat/ChatIntroduction';
import EmailConfirmationDialog from './EmailConfirmationDialog'; // Import the dialog component

// Import hooks and types
import { useTimer } from '@/src/hooks/chatbot/useTimer';
import { useChatSocket } from '@/src/hooks/chatbot/useChatSocket'; // Already includes dialog state/handlers
import { appConfig } from '@/src/middleware';
import { Language } from './lib/types'; // Adjust path as needed

const SOCKET_SERVER_URL = appConfig.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Define props interface
interface RegularChatProps {
    currentLanguage: Language;
}

function RegularChat({ currentLanguage }: RegularChatProps) {
    // --- Use Hooks ---
    const { timeCounter, startTimer, stopTimer } = useTimer();
    const {
        chatMessages,
        loadingState,
        isConnected,
        sendMessage: sendMessageViaSocket,
        socketId,
        // --- Destructure the new state and handlers for the dialog ---
        showConfirmationDialog,
        confirmationData,
        handleConfirmSend,
        handleCancelSend,
        closeConfirmationDialog
        // ----------------------------------------------------------
    } = useChatSocket({
        socketUrl: SOCKET_SERVER_URL,
        // Add callbacks if needed:
        // onConnectionChange: (connected) => console.log('Connection status:', connected),
        // onInitialConnectionError: (err) => console.error('Initial connection error:', err),
    });

    // --- Component Specific State ---
    const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
    const [fillInputFunction, setFillInputFunction] = useState<((text: string) => void) | null>(null);
    const chatHistoryRef = useRef<HTMLDivElement>(null);
    const [isStreamingEnabled, setIsStreamingEnabled] = useState<boolean>(true);

    // --- Scroll to Bottom ---
    useEffect(() => {
        // Scroll down only if not showing the confirmation dialog,
        // otherwise, the scroll might be jarring when the dialog appears.
        if (chatHistoryRef.current && !showConfirmationDialog) {
            // Add a small delay to allow the message list to render before scrolling
            setTimeout(() => {
                 if (chatHistoryRef.current) {
                     chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
                 }
            }, 50); // 50ms delay might be enough
        }
    }, [chatMessages, showConfirmationDialog]); // Add showConfirmationDialog as a dependency

    // --- Stop Timer Logic ---
    useEffect(() => {
        // Stop timer if loading finishes OR if the confirmation dialog appears (pauses activity)
        if ((!loadingState.isLoading || showConfirmationDialog) && timeCounter !== '0.0s') {
            stopTimer();
        }
    }, [loadingState.isLoading, showConfirmationDialog, stopTimer, timeCounter]); // Add showConfirmationDialog

    // --- Send Chat Message --- (No changes needed here)
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
        sendMessageViaSocket(trimmedMessage, isStreamingEnabled, currentLanguage);
    }, [isConnected, hasChatStarted, startTimer, sendMessageViaSocket, isStreamingEnabled, currentLanguage]);

    // --- Input Interaction Logic --- (No changes needed here)
    const handleSetFillInput = useCallback((fillFunc: (text: string) => void) => {
        setFillInputFunction(() => fillFunc);
    }, []);

    const handleSuggestionClick = useCallback((suggestion: string) => {
        if (fillInputFunction) {
            fillInputFunction(suggestion);
        }
    }, [fillInputFunction]);

    // --- Handle Toggle Change --- (No changes needed here)
    const handleStreamingToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsStreamingEnabled(event.target.checked);
    };

    // --- JSX Structure ---
    return (
        // Using relative positioning on the main container allows the fixed dialog to overlay correctly
        <div className="relative flex flex-col h-[calc(100vh-1.5rem)] max-h-[900px] w-full max-w mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">

            {/* Header */}
            <div className="flex-shrink-0 p-2 border-b border-gray-200 bg-gray-50">
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
            {/* Hide loading indicator *while* the confirmation dialog is shown, as it's a waiting state */}
            {loadingState.isLoading && !showConfirmationDialog && (
                <div className="flex-shrink-0 px-4 py-2 border-t border-gray-100 bg-gray-50">
                    <LoadingIndicator
                        step={loadingState.step}
                        message={loadingState.message}
                        timeCounter={timeCounter}
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
                    disabled={loadingState.isLoading || showConfirmationDialog} // Disable toggle when loading or confirming
                />
            </div>

            {/* Input Area - Disable while dialog is shown */}
            <div className="flex-shrink-0 p-3 md:p-4 border-t border-gray-200 bg-gray-50 pt-2">
                <ChatInput
                    onSendMessage={sendChatMessage}
                    // Disable input when loading, disconnected, OR when confirmation dialog is shown
                    disabled={loadingState.isLoading || !isConnected || showConfirmationDialog}
                    onRegisterFillFunction={handleSetFillInput}
                />
            </div>

            {/* --- Conditionally Render the Confirmation Dialog --- */}
            {/* It will overlay because of its fixed positioning */}
            <EmailConfirmationDialog
                isOpen={showConfirmationDialog}
                data={confirmationData}
                onConfirm={handleConfirmSend}
                onCancel={handleCancelSend}
                onClose={closeConfirmationDialog} // Use the closer function from the hook
            />
            {/* ------------------------------------------------- */}
        </div>
    );
}

export default RegularChat;