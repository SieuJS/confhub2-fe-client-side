"use client"; // This MUST be the very first line


import React, { useState, useRef, useCallback } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import LoadingIndicator from './LoadingIndicator';
import Introduction from './ChatIntroduction';
import { sendNonStreamChatRequest, ChatResponse, ChatHistoryType, HistoryItem, ErrorResponse, TextMessageResponse, ChartMessageResponse, InternalNavigationResponse, ExternalNavigationResponse } from '../../../../api/chatbot/chatbotApi';
import { useRouter, usePathname } from 'next/navigation';
import { getPathname } from '@/src/navigation';

export interface ChatMessageType {
    message: string;
    isUser: boolean;
    type?: 'text' | 'chart' | 'error' | 'navigation';
    path?: string;
    url?: string;
    navigationType?: 'internal' | 'external';
    echartsConfig?: any;
    sqlResult?: any;
    description?: string;
    thought?: string;
}

// --- Type Guards (Corrected Order) ---

// Check for ErrorResponse *FIRST*
function isErrorResponse(response: ChatResponse | ErrorResponse): response is ErrorResponse {
    return 'error' in response;
}

// Type guard for TextMessageResponse
function isTextMessageResponse(response: ChatResponse): response is TextMessageResponse {
    return 'type' in response && response.type === 'text'; // Add 'type' in response
}

// Type guard for ChartMessageResponse
function isChartMessageResponse(response: ChatResponse): response is ChartMessageResponse {
    return 'type' in response && response.type === 'chart';// Add 'type' in response
}

// Type guard for InternalNavigationResponse
function isInternalNavigationResponse(response: ChatResponse): response is InternalNavigationResponse {
    return 'type' in response && response.type === 'navigation' && 'navigationType' in response && response.navigationType === 'internal'; // Add 'type' in response
}

// Type guard for ExternalNavigationResponse
function isExternalNavigationResponse(response: ChatResponse): response is ExternalNavigationResponse {
    return 'type' in response && response.type === 'navigation' && 'navigationType' in response && response.navigationType === 'external'; // Add 'type' in response
}

function ChatBot() {
    const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
    const [isChatbotLoading, setIsChatbotLoading] = useState<boolean>(false);
    const [timeCounter, setTimeCounter] = useState<string>('0s');
    const timerInterval = useRef<number | null>(null);
    const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
    const [fillInputFunction, setFillInputFunction] = useState<(() => void) | null>(null);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const router = useRouter();
    const pathname = usePathname();

    const sendChatMessageNoStream = useCallback(async (userMessage: string) => {
        setIsChatbotLoading(true);
        startTimer();
        setHasChatStarted(true);

        const newUserMessage: ChatMessageType = { message: userMessage, isUser: true };
        let userMessageIndex: number;

        setChatMessages(prevMessages => {
            const newChatMessages = [...prevMessages, newUserMessage];
            userMessageIndex = newChatMessages.length - 1;
            return newChatMessages;
        });

        try {
            const historyForApi: ChatHistoryType = [...chatMessages, newUserMessage].map(msg => ({
                role: msg.isUser ? "user" : "model",
                parts: [{ text: msg.message }],
                type: msg.type
            }));

            const response = await sendNonStreamChatRequest(userMessage, historyForApi);

            let newBotMessage: ChatMessageType;
            let userMessageType: 'text' | 'chart' | 'error' | 'navigation' = 'text';

            // --- Use Type Guards (Correct Order) ---
            if (isErrorResponse(response)) {
                console.error('Chat API error:', response.error);
                newBotMessage = { message: `Sorry, I encountered an error: ${response.error}`, isUser: false, type: 'error', thought: response.thought };
                userMessageType = 'error'
            }
            else if (isInternalNavigationResponse(response)) {
                newBotMessage = { message: `Redirecting to ${response.path}...`, isUser: false, type: 'navigation', path: response.path, navigationType: 'internal' };
                userMessageType = 'navigation';
                if (typeof window !== 'undefined') {

                    // --- Prepend Locale Prefix ---
                    const localePrefix = pathname.split('/')[1]; // Extract locale prefix (e.g., "en")
                    const pathWithLocale = `/${localePrefix}${response.path}`; // Construct path with locale

                    router.push(pathWithLocale); // Use path with locale for internal navigation
                } else {
                    console.error("Cannot navigate on the server-side.");
                    newBotMessage = { message: "Sorry, I couldn't navigate to that page.", isUser: false, type: 'error' };
                    userMessageType = "error";
                }
            } else if (isExternalNavigationResponse(response)) {
                newBotMessage = { message: `Redirecting to ${response.url}...`, isUser: false, type: 'navigation', url: response.url, navigationType: 'external' };
                userMessageType = 'navigation';
                if (typeof window !== 'undefined') {
                    window.location.href = response.url;
                }
            } else if (isChartMessageResponse(response)) {
                newBotMessage = {
                    message: response.description,
                    isUser: false,
                    type: 'chart',
                    echartsConfig: response.echartsConfig,
                    sqlResult: response.sqlResult,
                    description: response.description,
                    thought: response.thought,
                };
                userMessageType = 'chart';
            } else if (isTextMessageResponse(response)) {
                newBotMessage = { message: response.message, isUser: false, type: 'text', thought: response.thought };
                userMessageType = 'text';
            } else {
                console.error('Unexpected response format:', response);
                newBotMessage = { message: "Sorry, I encountered an unexpected response format.", isUser: false, type: 'error' };
                userMessageType = 'error';
            }


            setChatMessages(prevMessages => {
                const updatedChatMessages = [...prevMessages];
                if (userMessageIndex !== undefined && updatedChatMessages[userMessageIndex]) {
                    updatedChatMessages[userMessageIndex] = { ...updatedChatMessages[userMessageIndex], type: userMessageType };
                }
                updatedChatMessages.push(newBotMessage);
                return updatedChatMessages;
            });

        } catch (error: any) {
            console.error('Error sending message:', error);
            const networkErrorBotMessage: ChatMessageType = { message: "Sorry, I encountered a network error. Please check your connection and try again.", isUser: false, type: 'error' };
            setChatMessages(prevMessages => [...prevMessages, networkErrorBotMessage]);
        } finally {
            setIsChatbotLoading(false);
            stopTimer();
        }
    }, [chatMessages, router, pathname, getPathname]);


    const startTimer = () => {
        const startTime = Date.now();
        setTimeCounter('0s');
        timerInterval.current = window.setInterval(() => {
            const elapsedTime = Date.now() - startTime;
            const seconds = (elapsedTime / 1000).toFixed(1);
            setTimeCounter(`${seconds}s`);
        }, 100);
    };

    const stopTimer = () => {
        if (timerInterval.current) {
            clearInterval(timerInterval.current);
            timerInterval.current = null;
        }
    };

    const handleFillInput = useCallback((fill: (text: string) => void) => {
        setFillInputFunction(() => fill);
    }, []);

    const toggleStreaming = () => {
        setIsStreaming(!isStreaming);
    };

    const handleSendMessage = useCallback((message: string) => {
        if (isStreaming) {
            // sendChatMessageStream(message); // Implement stream handling
        } else {
            sendChatMessageNoStream(message);
        }
    }, [isStreaming, sendChatMessageNoStream]);
    return (
                <div id="chat-container" className="bg-white rounded-xl shadow-lg w-full p-4 flex flex-col">
                    <h1 className="text-2xl text-center mb-6 font-semibold text-gray-800">Conferences Suggest Chatbot</h1>
                    <ChatHistory messages={chatMessages} />
                    {!hasChatStarted && <Introduction onFillInput={handleFillInput} />}
                    {isChatbotLoading && <LoadingIndicator />}
                    <div className="mb-4">
                        <label className="inline-flex items-center cursor-pointer">
                            <input type="checkbox" value="" className="sr-only peer" checked={isStreaming} onChange={toggleStreaming} />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{isStreaming ? 'Chế độ Stream' : 'Chế độ Không Stream'}</span>
                        </label>
                    </div>
                    <ChatInput onSendMessage={handleSendMessage} onFillInput={handleFillInput} />
                </div>
    );
}

export default ChatBot;
