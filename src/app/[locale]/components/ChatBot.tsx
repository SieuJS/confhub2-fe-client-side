"use client"; // This MUST be the very first line

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import LoadingIndicator from './LoadingIndicator';
import Introduction from './ChatIntroduction';
import { ChatResponse, sendStreamChatRequest, sendNonStreamChatRequest, ChatHistoryType, HistoryItem, ErrorResponse } from '../../../api/chatbot/chatbotApi';

export interface ChatMessageType {
    message: string;
    isUser: boolean;
    type?: 'text' | 'chart' | 'error';
    echartsConfig?: any;
    sqlResult?: any;
    description?: string;
}

function ChatBot() {
    // --- State for Chatbot ---
    const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
    const [isChatbotLoading, setIsChatbotLoading] = useState<boolean>(false);
    const [timeCounter, setTimeCounter] = useState<string>('0s');
    const timerInterval = useRef<number | null>(null);
    const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
    const [fillInputFunction, setFillInputFunction] = useState<(() => void) | null>(null);
    const [isStreaming, setIsStreaming] = useState<boolean>(false); // Mặc định là chế độ Stream


    const sendChatMessageNoStream = useCallback(async (userMessage: string) => {
        console.log("sendChatMessageNoStream called with userMessage:", userMessage);
        setIsChatbotLoading(true);
        startTimer();
        setHasChatStarted(true);

        // Add USER message to chat *without* a type initially.
        const newUserMessage: ChatMessageType = { message: userMessage, isUser: true }; // NO TYPE HERE
        console.log("newUserMessage:", newUserMessage);

        // We will get the index *inside* the updater function.
        let userMessageIndex: number;

        setChatMessages(prevMessages => {
            console.log("Previous chatMessages:", prevMessages);
            const newChatMessages = [...prevMessages, newUserMessage];
            console.log("New chatMessages (after adding user message):", newChatMessages);

            // NOW we get the index, *after* the user message has been added.
            userMessageIndex = newChatMessages.length - 1;

            return newChatMessages; // Return the new state with the user message.
        });


        try {
            // Build history.
            const historyForApi: ChatHistoryType = [...chatMessages, newUserMessage].map((msg): HistoryItem => {  // Use newUserMessage here
                const historyItem: HistoryItem = {
                    role: msg.isUser ? "user" : "model",
                    parts: [{ text: msg.message }],
                    type: msg.type as 'text' | 'chart' | 'error' | undefined,
                };
                console.log("historyItem:", historyItem);
                return historyItem;
            });

            console.log("historyForApi:", historyForApi);

            const response = await sendNonStreamChatRequest(userMessage, historyForApi);
            console.log("Raw response from API:", response);

            if (response) {
                console.log("Response no stream:", response);
                let newBotMessage: ChatMessageType;
                let userMessageType: 'text' | 'chart' | 'error' = 'text'; // Initialize

                if (response.type === 'chart' && 'echartsConfig' in response && 'sqlResult' in response && 'description' in response) {
                    newBotMessage = {
                        message: response.description,
                        isUser: false,
                        type: 'chart',
                        echartsConfig: response.echartsConfig,
                        sqlResult: response.sqlResult,
                        description: response.description
                    };
                    userMessageType = 'chart'; // Set user message type to 'chart'
                } else if (response.type === 'text' && 'message' in response) {
                    newBotMessage = { message: response.message, isUser: false, type: 'text' };
                    userMessageType = 'text'; // set user message type to 'text'
                } else {
                    console.error('Unexpected response format:', response);
                    newBotMessage = { message: "Sorry, I encountered an unexpected response format.", isUser: false, type: 'error' };
                    userMessageType = 'error'; // Set user message type to 'error'
                }
                console.log("newBotMessage:", newBotMessage);

                // Update user message type *and* add bot message in a *single* update.
                setChatMessages(prevMessages => {
                    console.log("Previous chatMessages (before updates):", prevMessages);

                    // Create a *copy* of the previous messages.
                    const updatedChatMessages = [...prevMessages];

                    // Update the *user's* message type using the index.
                    //  Handle potential race condition with a check.
                    if (userMessageIndex !== undefined && updatedChatMessages[userMessageIndex]) {
                        updatedChatMessages[userMessageIndex] = {
                            ...updatedChatMessages[userMessageIndex], // Copy existing
                            type: userMessageType,  // Update type
                        };
                    } else {
                        console.warn("Race condition detected or user message not found.");
                    }


                    // Add the bot's message.
                    updatedChatMessages.push(newBotMessage);

                    console.log("New chatMessages (after all updates):", updatedChatMessages);
                    return updatedChatMessages;
                });

            } else {
                // ... (error handling - no changes needed)
                console.error('Chat API error:', response);  //  Keep consistent error handling.
                const errorBotMessage: ChatMessageType = { message: `Sorry, I encountered an error. Please try again later.`, isUser: false, type: 'error' };

                setChatMessages(prevMessages => {
                    console.log("Previous chatMessages (before adding error message):", prevMessages);
                    const updatedChatMessages = [...prevMessages, errorBotMessage];
                    console.log("New chatMessages (after adding error message):", updatedChatMessages);
                    return updatedChatMessages;
                });
            }

        } catch (error: any) {
            // ... (error handling - no changes needed)
            console.error('Error sending message:', error);
            const networkErrorBotMessage: ChatMessageType = { message: "Sorry, I encountered a network error. Please check your connection and try again.", isUser: false, type: 'error' };
            setChatMessages(prevMessages => [...prevMessages, networkErrorBotMessage]);
        } finally {
            console.log("sendChatMessageNoStream finally block - Setting loading to false");
            setIsChatbotLoading(false);
            stopTimer();
        }
    }, [chatMessages]); // Keep chatMessages in the dependency array

    const sendChatMessageStream = useCallback(async (userMessage: string) => {
        // setIsChatbotLoading(true);
        // startTimer();
        // setHasChatStarted(true);

        // const newUserMessage: ChatMessageType = { message: userMessage, isUser: true };

        // setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

        // const onPartialResponse = (response: ChatResponse | ErrorResponse) => {
        //     setIsChatbotLoading(true); // Keep loading until stream is complete or errors
        //     stopTimer(); // Stop timer for each partial response and restart for next chunk if needed. Consider moving startTimer inside if needed per chunk.

        //     if (response.type === 'chart' && 'echartsConfig' in response && 'sqlResult' in response && 'description' in response) {
        //         const newBotMessage: ChatMessageType = {
        //             message: "Câu trả lời được hiển thị", 
        //             isUser: false,
        //             type: 'chart',
        //             echartsConfig: response.echartsConfig,
        //             sqlResult: response.sqlResult,
        //             description: response.description
        //         };
        //         setChatMessages(prevMessages => [...prevMessages, newBotMessage]);
        //         setIsChatbotLoading(false); // Assuming chart is the final response for this stream. Adjust if needed.
        //         stopTimer(); // Ensure timer is stopped when chart is displayed.
        //     } else if (response.type === 'text' && 'message' in response) {
        //         const botReply = response.message;
        //         setChatMessages(prevMessages => {
        //             const lastMessage = prevMessages[prevMessages.length - 1];
        //             if (!lastMessage || lastMessage.isUser) {
        //                 // Start of bot message
        //                 return [...prevMessages, { message: botReply, isUser: false, type: 'text' }];
        //             } else {
        //                 // Append to existing bot message
        //                 const updatedMessages = [...prevMessages];
        //                 updatedMessages[updatedMessages.length - 1] = { ...lastMessage, message: lastMessage.message + botReply };
        //                 return updatedMessages;
        //             }
        //         });
        //     } else if (response.type === 'error' || !response.type) {
        //         console.error('Stream error or unexpected data:', response);
        //         const errorMsg = response.message || "Stream error occurred.";
        //         const errorBotMessage: ChatMessageType = { message: errorMsg, isUser: false, type: 'error' };
        //         setChatMessages(prevMessages => [...prevMessages, errorBotMessage]);
        //         setIsChatbotLoading(false);
        //         stopTimer();
        //     }

        // };


        // try {
        //     const historyForApi: ChatHistoryType = [...chatMessages, newUserMessage].map(msg => {
        //         if (msg.type === 'chart') {
        //             return {
        //                 role: "model",
        //                 parts: [{ text: msg }], // msg here is ChatMessageType, so msg.message might be incorrect for chart type
        //                 type: 'chart'
        //             } as HistoryItem; // Explicitly cast to HistoryItem
        //         } else {
        //             return {
        //                 role: msg.isUser ? "user" : "model",
        //                 parts: [{ text: msg.message }],
        //                 ...(msg.type ? { type: msg.type } : {}), // Conditionally include type
        //             } as HistoryItem; // Explicitly cast to HistoryItem
        //         }
        //     });

        //     await sendStreamChatRequest(userMessage, historyForApi, onPartialResponse);
        // } catch (error: any) { // Type error as any for generic error handling
        //     console.error('Error sending stream message:', error);
        //     const networkErrorBotMessage: ChatMessageType = { message: "Sorry, I encountered a network error during streaming. Please check your connection and try again.", isUser: false, type: 'error' };
        //     setChatMessages(prevMessages => [...prevMessages, networkErrorBotMessage]);
        //     setIsChatbotLoading(false);
        //     stopTimer();
        // } finally {
        //     if (!isChatbotLoading) { // Only reset loading if it wasn't already set in partial response for errors
        //         setIsChatbotLoading(false);
        //         stopTimer();
        //     }
        // }
        return;
    }, [chatMessages]);


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


    // Hàm để chuyển đổi chế độ Stream
    const toggleStreaming = () => {
        setIsStreaming(!isStreaming);
    };

    // Hàm chọn hàm gửi tin nhắn dựa trên chế độ Stream
    const handleSendMessage = useCallback((message: string) => {
        if (isStreaming) {
            sendChatMessageStream(message);
        } else {
            sendChatMessageNoStream(message);
        }
    }, [isStreaming, sendChatMessageStream, sendChatMessageNoStream]);


    return (
        <div className="bg-gray-100 font-sans p-5">
            <div className="container px-4 py-8 gap-8">

                <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Chatbot
                </h1>
                <div id="chat-container" className="bg-white rounded-xl shadow-lg w-full p-8 flex flex-col">
                    <h1 className="text-2xl text-center mb-6 font-semibold text-gray-800">Conferences Suggest Chatbot</h1>

                    <ChatHistory messages={chatMessages} />

                    {!hasChatStarted && <Introduction onFillInput={handleFillInput} />}

                    {isChatbotLoading && <LoadingIndicator />}
                    {/* Nút chuyển đổi chế độ Stream */}
                    <div className="mb-4">
                        <label className="inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                value=""
                                className="sr-only peer"
                                checked={isStreaming}
                                onChange={toggleStreaming}
                            />
                            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{isStreaming ? 'Chế độ Stream' : 'Chế độ Không Stream'}</span>
                        </label>
                    </div>

                    <ChatInput onSendMessage={handleSendMessage} onFillInput={handleFillInput} />
                </div>

            </div>

        </div>
    );
}

export default ChatBot;