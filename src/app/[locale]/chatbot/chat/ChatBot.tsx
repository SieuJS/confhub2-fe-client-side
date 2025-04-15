// src/components/ChatBot.tsx (or appropriate path)
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import LoadingIndicator from './LoadingIndicator';
import Introduction from './ChatIntroduction';
import {
    HistoryItem as ApiHistoryItem, StatusUpdate, ResultUpdate, ErrorUpdate, ThoughtStep
} from '../../../../../../NEW-SERVER-TS/src/shared/types'; // Adjust path if needed
import ThoughtProcess from './ThoughtProcess';

// Types
// Update ChatMessageType
export interface ChatMessageType {
    message: string;
    isUser: boolean;
    type: 'text' | 'error';
    thoughts?: ThoughtStep[]; // *** ADD thoughts array ***
}

interface LoadingState {
    isLoading: boolean;
    step: string;
    message: string;
}

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

function ChatBot() {
    const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, step: '', message: '' });
    const [timeCounter, setTimeCounter] = useState<string>('0s');
    const timerInterval = useRef<number | null>(null);
    const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
    const [fillInputFunction, setFillInputFunction] = useState<((text: string) => void) | null>(null); // Corrected type for fillInput

    const socketRef = useRef<Socket | null>(null);
    const isMountedRef = useRef(false);
    // *** Add Ref for Loading State ***
    const loadingStateRef = useRef(loadingState);

    useEffect(() => {
        isMountedRef.current = true;
        console.log("ChatBot Component Mounted");
        return () => {
            isMountedRef.current = false;
            console.log("ChatBot Component Unmounted");
            // Cleanup handled in socket effect
        };
    }, []);

    // Update the loading state ref whenever loadingState changes
    useEffect(() => {
        loadingStateRef.current = loadingState;
    }, [loadingState]);

    // --- Timer functions ---
    const stopTimer = useCallback(() => {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
            console.log("Timer stopped.");
        }
    }, []); // Stable

    const startTimer = useCallback(() => {
        if (timerInterval.current) clearInterval(timerInterval.current);
        const startTime = Date.now();
        setTimeCounter('0s');
        timerInterval.current = window.setInterval(() => {
            if (isMountedRef.current) {
                const elapsedTime = Date.now() - startTime;
                const seconds = (elapsedTime / 1000).toFixed(1);
                setTimeCounter(`${seconds}s`);
            } else {
                stopTimer(); // Call stable stopTimer
            }
        }, 100);
    }, [stopTimer]); // Depends only on stable stopTimer

    // --- Stable Handlers (using refs for state access where needed) ---

    const handleConnect = useCallback(() => {
        console.log('Socket connected:', socketRef.current?.id);
        // No state needed here generally
    }, []); // Stable

    
    // *** Stabilized handleError ***
    // Depends only on stopTimer (stable)
    const handleError = useCallback((error: ErrorUpdate | { message: string }) => {
        if (!isMountedRef.current) return;
        console.error("Socket Error:", error);
        setLoadingState({ isLoading: false, step: 'error', message: 'Error received' });
        stopTimer();
    
        const errorPayload = error as ErrorUpdate; // Type assertion to access thoughts
        const errorBotMessage: ChatMessageType = {
            message: `Sorry, an error occurred: ${error.message || 'Unknown server error'}`,
            isUser: false,
            type: 'error',
            // thought: errorPayload.thought // Keep if needed, otherwise remove
            thoughts: errorPayload.thoughts // *** STORE thoughts ***
        };
        setChatMessages(prev => [...prev, errorBotMessage]);
    }, [stopTimer]);

    // *** Stabilized handleDisconnect ***
    // Now depends only on stable functions (stopTimer, handleError)
    const handleDisconnect = useCallback((reason: Socket.DisconnectReason) => {
        console.warn('Socket disconnected:', reason);
         if (isMountedRef.current) {
             // Access current loading state via ref, *don't* put state in deps array
             if (loadingStateRef.current.isLoading) {
                 // Call stable handleError
                 handleError({ message: `Connection lost: ${reason}. Please try sending your message again.` });
             }
             // Update state directly
             setLoadingState({ isLoading: false, step: 'disconnected', message: 'Connection lost' });
             stopTimer(); // Call stable stopTimer
         }
    }, [stopTimer, handleError]); // Now stable

    // *** Stabilized handleConnectError ***
    // Depends only on stable functions (stopTimer, handleError)
    const handleConnectError = useCallback((err: Error) => {
        console.error('Socket connection error:', err);
        if (isMountedRef.current) {
             handleError({ message: `Failed to connect to chat server: ${err.message}` });
             // Update state directly
             setLoadingState({ isLoading: false, step: 'connection_error', message: 'Connection failed' });
             stopTimer(); // Call stable stopTimer
        }
    }, [stopTimer, handleError]); // Now stable

    const handleStatusUpdate = useCallback((update: StatusUpdate) => {
        if (!isMountedRef.current) return;
        console.log("Socket Status:", update);
        // Update state directly
        setLoadingState({
            isLoading: true,
            step: update.step,
            message: update.message,
        });
    }, []); // Stable

    const handleResult = useCallback((result: ResultUpdate) => {
        if (!isMountedRef.current) return;
        console.log("Socket Result:", result);
        setLoadingState({ isLoading: false, step: '', message: '' });
        stopTimer();
        const newBotMessage: ChatMessageType = {
            message: result.message,
            isUser: false,
            type: 'text',
            thoughts: result.thoughts // *** STORE thoughts ***
        };
        setChatMessages(prev => [...prev, newBotMessage]);
    }, [stopTimer]);
    

    // --- Socket Connection Effect (Now with stable dependencies) ---
    useEffect(() => {
        console.log("Attempting to connect Socket.IO...");
        const socket = io(SOCKET_SERVER_URL, {
            // Consider adding transports and upgrade options if needed
            // transports: ['websocket'], // Force websockets if proxies cause issues with polling
        });
        socketRef.current = socket;

        // --- Setup Event Listeners (using stable handlers) ---
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('status_update', handleStatusUpdate);
        socket.on('chat_result', handleResult);
        socket.on('chat_error', handleError);

        // --- Cleanup Function ---
        return () => {
            console.log("Cleaning up socket connection...");
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off('status_update', handleStatusUpdate);
            socket.off('chat_result', handleResult);
            socket.off('chat_error', handleError);

            if (socket.connected) {
                console.log(`Explicitly disconnecting socket ${socket.id} in cleanup.`);
                socket.disconnect();
            } else {
                console.log(`Socket ${socket.id} already disconnected or never connected, skipping disconnect call in cleanup.`);
            }
            socketRef.current = null;
            console.log("Socket disconnected and listeners removed.");
        };
        // This dependency array now contains only stable functions
    }, [handleConnect, handleDisconnect, handleConnectError, handleStatusUpdate, handleResult, handleError]);


    // --- Send Chat Message via Socket ---
    // Depends on chatMessages, hasChatStarted, startTimer, handleError (stable)
    const sendChatMessage = useCallback(async (userMessage: string) => {
        const trimmedMessage = userMessage.trim();
        if (!trimmedMessage) return;

        if (!socketRef.current || !socketRef.current.connected) {
            console.error("Cannot send message: Socket not connected.");
            handleError({ message: "Not connected to the chat server. Please wait or refresh." });
            return;
        }

        // Update loading state - this will trigger the loadingStateRef update
        setLoadingState({ isLoading: true, step: 'sending', message: 'Sending message...' });
        startTimer();
        if (!hasChatStarted) setHasChatStarted(true);

        // Use functional update for chatMessages if you want to make this callback
        // independent of chatMessages state, but it's usually fine as is.

        const newUserMessage: ChatMessageType = { message: trimmedMessage, isUser: true, type: 'text' };
        const historyForApi: ApiHistoryItem[] = chatMessages.map(msg => ({
            role: msg.isUser ? "user" : "model",
            parts: [{ text: msg.message }],
        }));


        setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

        console.log("Emitting 'send_message' via socket...");
        socketRef.current.emit('send_message', {
            userInput: trimmedMessage,
            history: historyForApi, // Send history *before* the current message
        });

    }, [chatMessages, hasChatStarted, startTimer, handleError]); // Keep dependencies needed for logic

     // --- Other functions ---
     const handleFillInput = useCallback((fill: (text: string) => void) => {
        // Use functional update to ensure stability if needed, but simple set is likely fine
        setFillInputFunction(() => fill);
     }, []);

    // --- JSX Structure ---
    return (
        <div id="chat-container" className="bg-white rounded-xl shadow-lg w-full mx-auto p-4 flex flex-col max-h-[95vh]">
            {/* ... header ... */}
             <h1 className="text-2xl text-center mb-4 font-semibold text-gray-800 flex-shrink-0">Conferences Suggest Chatbot (Socket.IO)</h1>

            <ChatHistory messages={chatMessages} />

            <div className="flex-shrink-0 mt-auto pt-4">
                {!hasChatStarted && <Introduction onFillInput={handleFillInput} />}

                {loadingState.isLoading && (
                    <LoadingIndicator
                        step={loadingState.step}
                        message={loadingState.message}
                        timeCounter={timeCounter}
                    />
                )}

                <ChatInput onSendMessage={sendChatMessage} disabled={loadingState.isLoading} onFillInput={handleFillInput} /> {/* Pass handleFillInput */}
                 <div className="text-center text-xs text-gray-500 mt-2">
                    Socket Status: {socketRef.current?.connected ? `Connected (${socketRef.current.id})` : 'Disconnected'}
                 </div>
            </div>
        </div>
    );
}

export default ChatBot;