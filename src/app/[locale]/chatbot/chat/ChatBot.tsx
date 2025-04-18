// src/app/[locale]/chatbot/chat/ChatBot.tsx
"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { SendHorizonal, Loader2, ServerCrash, TriangleAlert } from 'lucide-react'; // Using lucide-react for icons (npm install lucide-react)

import ChatHistory from './ChatHistory'; // Assume this component handles rendering individual messages based on props
import ChatInput from './ChatInput';     // Assume this handles the input field and button logic
import LoadingIndicator from './LoadingIndicator'; // Assume this displays loading info
import Introduction from './ChatIntroduction'; // Assume this shows the intro content

import {
    HistoryItem as ApiHistoryItem, StatusUpdate, ResultUpdate, ErrorUpdate, ThoughtStep, ChatMessageType, LoadingState
} from '@/src/models/chatbot/chatbot';
import { appConfig } from '@/src/middleware';

const SOCKET_SERVER_URL = appConfig.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

function ChatBot() {
    const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, step: '', message: '' });
    const [timeCounter, setTimeCounter] = useState<string>('0s');
    const timerInterval = useRef<number | null>(null);
    const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
    const [fillInputFunction, setFillInputFunction] = useState<((text: string) => void) | null>(null);

    const socketRef = useRef<Socket | null>(null);
    const isMountedRef = useRef(false);
    const loadingStateRef = useRef(loadingState);
    const chatHistoryRef = useRef<HTMLDivElement>(null); // Ref for the history container

    // --- Mount/Unmount and State Ref ---
    useEffect(() => {
        isMountedRef.current = true;
        console.log("ChatBot Component Mounted");
        return () => {
            isMountedRef.current = false;
            console.log("ChatBot Component Unmounted");
            stopTimer(); // Ensure timer stops on unmount
            // Socket cleanup handled in its own effect
        };
    }, []); // Removed stopTimer from deps as it's stable now

    useEffect(() => {
        loadingStateRef.current = loadingState;
    }, [loadingState]);

    // --- Scroll to Bottom ---
    useEffect(() => {
        // Scroll to bottom when messages change
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatMessages]);

    // --- Timer Functions (Stable) ---
    const stopTimer = useCallback(() => {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
            // console.log("Timer stopped."); // Less noisy logging
        }
    }, []);

    const startTimer = useCallback(() => {
        stopTimer(); // Ensure only one timer runs
        const startTime = Date.now();
        setTimeCounter('0.0s'); // Start with decimal
        timerInterval.current = window.setInterval(() => {
            if (isMountedRef.current) {
                const elapsedTime = Date.now() - startTime;
                const seconds = (elapsedTime / 1000).toFixed(1);
                setTimeCounter(`${seconds}s`);
            } else {
                stopTimer();
            }
        }, 100);
    }, [stopTimer]);

    // --- Socket Event Handlers (Stable) ---
    const handleConnect = useCallback(() => {
        console.log('Socket connected:', socketRef.current?.id);
    }, []);

    const handleError = useCallback((error: ErrorUpdate | { message: string; type?: 'error' | 'warning', thoughts?: ThoughtStep[] }) => {
        if (!isMountedRef.current) return;
        console.error("Chat Error:", error);
        const isErrorUpdate = 'step' in error; // Check if it's the structured ErrorUpdate
        const message = error.message || 'An unknown error occurred.';
        const thoughts = 'thoughts' in error ? error.thoughts : undefined;

        // Stop loading indicator & timer
        setLoadingState({ isLoading: false, step: 'error', message: 'Error' });
        stopTimer();

        // Add error message to chat
        const errorBotMessage: ChatMessageType = {
            message: message,
            isUser: false,
            type: 'error', // Mark as error type for specific styling
            thoughts: thoughts
        };
        setChatMessages(prev => [...prev, errorBotMessage]);

    }, [stopTimer]); // Depends only on stable stopTimer

    const handleDisconnect = useCallback((reason: Socket.DisconnectReason) => {
        console.warn('Socket disconnected:', reason);
        if (isMountedRef.current) {
            // Use the ref to check current loading state without adding state dependency
            if (loadingStateRef.current.isLoading) {
                handleError({ message: `Connection lost while processing: ${reason}. Please check your connection and try again.`, type: 'error' });
            } else {
                 // Add a less intrusive warning if not actively loading
                 const warningMessage: ChatMessageType = {
                    message: `Connection lost: ${reason}. You may need to reconnect or refresh.`,
                    isUser: false,
                    type: 'warning', // Use a 'warning' type for styling
                };
                setChatMessages(prev => [...prev, warningMessage]);
            }
            setLoadingState({ isLoading: false, step: 'disconnected', message: 'Disconnected' });
            stopTimer();
        }
    }, [stopTimer, handleError]); // Stable dependencies

    const handleConnectError = useCallback((err: Error) => {
        console.error('Socket connection error:', err);
        if (isMountedRef.current) {
            handleError({ message: `Failed to connect to the chat server. Please check the server and your network.`, type: 'error' });
            setLoadingState({ isLoading: false, step: 'connection_error', message: 'Connection Failed' });
            // No need to call stopTimer here, it wasn't started
        }
    }, [handleError]); // Stable dependency

    const handleStatusUpdate = useCallback((update: StatusUpdate) => {
        if (!isMountedRef.current) return;
        // console.log("Socket Status:", update); // Less noisy logging
        setLoadingState({
            isLoading: true,
            step: update.step,
            message: update.message,
            // Optionally store details if your StatusUpdate includes them
            // details: update.details
        });
    }, []); // Stable

    const handleResult = useCallback((result: ResultUpdate) => {
        if (!isMountedRef.current) return;
        // console.log("Socket Result:", result); // Less noisy logging
        setLoadingState({ isLoading: false, step: 'result_received', message: '' });
        stopTimer();
        const newBotMessage: ChatMessageType = {
            message: result.message,
            isUser: false,
            type: 'text', // Normal text response
            thoughts: result.thoughts
        };
        setChatMessages(prev => [...prev, newBotMessage]);
    }, [stopTimer]); // Stable dependency

    // --- Socket Connection Effect ---
    useEffect(() => {
        console.log("Setting up Socket.IO connection...");
        // Ensure any previous socket is disconnected before creating a new one
        if (socketRef.current) {
            console.log("Disconnecting existing socket before reconnecting...");
            socketRef.current.disconnect();
        }

        const socket = io(SOCKET_SERVER_URL, {
            reconnectionAttempts: 5, // Limit reconnection attempts
            reconnectionDelay: 1000, // Start with 1s delay
            reconnectionDelayMax: 5000, // Max delay 5s
            // transports: ['websocket'], // Consider uncommenting if polling causes issues
        });
        socketRef.current = socket;

        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('status_update', handleStatusUpdate);
        socket.on('chat_result', handleResult);
        socket.on('chat_error', handleError); // Use the unified error handler

        return () => {
            console.log("Cleaning up socket connection effect...");
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off('status_update', handleStatusUpdate);
            socket.off('chat_result', handleResult);
            socket.off('chat_error', handleError);

            if (socket.connected) {
                console.log(`Disconnecting socket ${socket.id} during cleanup.`);
                socket.disconnect();
            }
            socketRef.current = null; // Clear the ref
            console.log("Socket listeners removed and disconnected.");
        };
    }, [SOCKET_SERVER_URL, handleConnect, handleDisconnect, handleConnectError, handleStatusUpdate, handleResult, handleError]); // Add URL and stable handlers


    // --- Send Chat Message ---
    const sendChatMessage = useCallback(async (userMessage: string) => {
        const trimmedMessage = userMessage.trim();
        if (!trimmedMessage) return;

        if (!socketRef.current || !socketRef.current.connected) {
            // Use the unified error handler
            handleError({ message: "Cannot send message: Not connected. Please wait or refresh.", type: 'error' });
            return;
        }

        setLoadingState({ isLoading: true, step: 'sending', message: 'Sending...' });
        startTimer();
        if (!hasChatStarted) setHasChatStarted(true);

        // 1. Create the user message object for display
        const newUserMessage: ChatMessageType = { message: trimmedMessage, isUser: true, type: 'text' };

        // 2. Update the local display state immediately
        //    No need for functional update here unless you have complex async logic inside
        setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

        // 3. Emit ONLY the user input to the backend
        //    The backend will manage the actual API history.
        console.log("Emitting 'send_message' with user input only.");
        socketRef.current.emit('send_message', {
            userInput: trimmedMessage,
            // NO history is sent from the frontend anymore.
        });

    }, [hasChatStarted, startTimer, handleError]); // Dependencies are stable or primitive


    // --- Function to pass down to Introduction/ChatInput ---
    const handleSetFillInput = useCallback((fillFunc: (text: string) => void) => {
        setFillInputFunction(() => fillFunc);
    }, []);

    const handleSuggestionClick = (suggestion: string) => {
        if (fillInputFunction) {
            fillInputFunction(suggestion);
        }
        // Optionally send the message directly:
        // sendChatMessage(suggestion);
    };


    // --- JSX Structure ---
    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[800px] w-full max-w mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">

            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
                <h1 className="text-lg font-semibold text-center text-gray-800">
                    AI Conference Assistant
                </h1>
                 {/* Optional: Connection Status Indicator */}
                 <div className="text-center text-xs text-gray-500 mt-1 flex items-center justify-center space-x-1">
                    <span className={`h-2 w-2 rounded-full ${socketRef.current?.connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    <span>{socketRef.current?.connected ? 'Connected' : 'Disconnected'}</span>
                 </div>
            </div>

            {/* Chat History Area */}
            <div ref={chatHistoryRef} className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-white to-gray-50">
                {!hasChatStarted && (
                    <Introduction onSuggestionClick={handleSuggestionClick} />
                )}
                <ChatHistory messages={chatMessages} /> {/* Pass messages down */}
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


            {/* Input Area */}
            <div className="flex-shrink-0 p-3 md:p-4 border-t border-gray-200 bg-gray-50">
                <ChatInput
                    onSendMessage={sendChatMessage}
                    disabled={loadingState.isLoading}
                    onRegisterFillFunction={handleSetFillInput} // Pass the registration function
                 />
            </div>
        </div>
    );
}

export default ChatBot;