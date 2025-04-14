"use client"; // This MUST be the very first line

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import LoadingIndicator from './LoadingIndicator';
import Introduction from './ChatIntroduction';
// --- Updated Import ---
// Chỉ cần import các type cơ bản và hàm gửi request
import {
    sendNonStreamChatRequest,
    ApiHistoryItem, // Rename để tránh trùng lặp nếu cần
    ApiResponse // Rename để rõ ràng đây là response từ API
} from '../../../../app/api/chatbot/chatbotApi'; // Đảm bảo đường dẫn đúng

// --- Simplified Chat Message Type for Display ---
export interface ChatMessageType {
    message: string;
    isUser: boolean;
    type: 'text' | 'error'; // Chỉ cần text hoặc error cho hiển thị
    thought?: string; // Giữ lại thought cho debug lỗi
}

// --- Updated Type Guards for API Response ---

// Type guard for Error Response from API
function isApiErrorResponse(response: ApiResponse): response is { type: 'error'; message: string; thought?: string } {
    return typeof response === 'object' && response !== null && response.type === 'error';
}

// Type guard for Text Message Response from API
function isApiTextMessageResponse(response: ApiResponse): response is { type: 'text'; message: string; thought?: string } {
    return typeof response === 'object' && response !== null && response.type === 'text';
}


function ChatBot() {
    const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
    const [isChatbotLoading, setIsChatbotLoading] = useState<boolean>(false);
    // Timer và các state khác giữ nguyên
    const [timeCounter, setTimeCounter] = useState<string>('0s');
    const timerInterval = useRef<number | null>(null);
    const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
    const [fillInputFunction, setFillInputFunction] = useState<(() => void) | null>(null);
    const [isStreaming, setIsStreaming] = useState<boolean>(false); // Giữ lại nếu vẫn cần toggle

    // --- Updated sendChatMessageNoStream ---
    const sendChatMessageNoStream = useCallback(async (userMessage: string) => {
        // --- BEGIN ADDED CHECK ---
        // Trim userMessage và kiểm tra xem nó có rỗng không
        console.log("User mesage: ", userMessage);
        if (!userMessage.trim()) {
            console.log("Attempted to send an empty or whitespace-only message. Aborting.");
            // Không làm gì cả nếu input rỗng sau khi trim
            return;
        }
        // --- END ADDED CHECK ---
        setIsChatbotLoading(true);
        startTimer(); // Giữ lại timer nếu muốn đo thời gian phản hồi
        if (!hasChatStarted) setHasChatStarted(true); // Đánh dấu chat đã bắt đầu

        const newUserMessage: ChatMessageType = { message: userMessage, isUser: true, type: 'text' }; // Tin nhắn người dùng luôn là type 'text'

        // Thêm tin nhắn người dùng vào state ngay lập tức
        setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

        try {
            // --- Correct History Mapping for API ---
            // Lấy các tin nhắn *trước đó* để làm history
            const historyForApi: ApiHistoryItem[] = chatMessages.map(msg => ({
                // Map từ ChatMessageType sang ApiHistoryItem
                role: msg.isUser ? "user" : "model",
                parts: [{ text: msg.message }],
                // Không cần gửi 'type' của message hiển thị lên API
            }));

            // Gọi API với user input hiện tại và history *trước đó*
            const response: ApiResponse = await sendNonStreamChatRequest(userMessage, historyForApi);

            let newBotMessage: ChatMessageType;

            // --- Simplified Response Handling ---
            if (isApiErrorResponse(response)) {
                console.error('Chat API error:', response.message, 'Thought:', response.thought);
                // Hiển thị lỗi cho người dùng
                newBotMessage = {
                    message: `Sorry, I encountered an error: ${response.message || 'Unknown error'}`,
                    isUser: false,
                    type: 'error', // Đánh dấu là lỗi để hiển thị khác biệt nếu muốn
                    thought: response.thought // Giữ lại thought để debug nếu cần
                };
            } else if (isApiTextMessageResponse(response)) {
                // Hiển thị tin nhắn text từ bot
                newBotMessage = {
                    message: response.message,
                    isUser: false,
                    type: 'text'
                    // Không cần thought cho tin nhắn text thành công trừ khi backend cố ý gửi
                };
            } else {
                // Xử lý trường hợp response không khớp format mong đợi
                console.error('Unexpected API response format:', response);
                newBotMessage = {
                    message: "Sorry, I received an unexpected response from the server.",
                    isUser: false,
                    type: 'error'
                };
            }

            // Thêm tin nhắn của bot vào state
            setChatMessages(prevMessages => [...prevMessages, newBotMessage]);

        } catch (error: any) {
            // Xử lý lỗi mạng hoặc lỗi trong quá trình gọi API
            console.error('Error sending message:', error);
            const networkErrorBotMessage: ChatMessageType = {
                message: "Sorry, I couldn't connect to the server. Please check your connection and try again.",
                isUser: false,
                type: 'error' // Lỗi mạng cũng là type 'error'
            };
            // Thêm tin nhắn lỗi mạng vào state
            setChatMessages(prevMessages => [...prevMessages, networkErrorBotMessage]);
        } finally {
            setIsChatbotLoading(false);
            stopTimer(); // Dừng timer
        }
        // Loại bỏ các dependency không cần thiết như router, pathname nếu không dùng trong hàm này nữa
    }, [chatMessages, hasChatStarted]); // Dependency chính là chatMessages và hasChatStarted


    // --- Timer functions (giữ nguyên) ---
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

    // --- Các hàm khác (giữ nguyên nếu cần cho UI) ---
    const handleFillInput = useCallback((fill: (text: string) => void) => {
        setFillInputFunction(() => fill);
    }, []);

    const toggleStreaming = () => {
        setIsStreaming(!isStreaming);
        // Có thể reset chat hoặc thông báo cho người dùng khi chuyển chế độ
    };

    const handleSendMessage = useCallback((message: string) => {
        // Hiện tại chỉ hỗ trợ non-stream
        if (isStreaming) {
            // Có thể hiển thị thông báo chế độ stream chưa hỗ trợ
            console.warn("Streaming mode is not implemented yet.");
            // Hoặc tự động chuyển sang non-stream
            // sendChatMessageNoStream(message);
        } else {
            sendChatMessageNoStream(message);
        }
    }, [isStreaming, sendChatMessageNoStream]);

    // --- JSX Structure (giữ nguyên) ---
    return (
        <div id="chat-container" className="bg-white rounded-xl shadow-lg w-full mx-auto p-4 flex flex-col max-h-[95vh]">
            <h1 className="text-2xl text-center mb-4 font-semibold text-gray-800 flex-shrink-0">Conferences Suggest Chatbot</h1>

            {/* ChatHistory sẽ nhận messages đã được đơn giản hóa */}
            <ChatHistory messages={chatMessages} />

            <div className="flex-shrink-0">
                {!hasChatStarted && <Introduction onFillInput={handleFillInput} />}
                {isChatbotLoading && <LoadingIndicator /* Có thể hiển thị timeCounter ở đây nếu muốn */ />}
                {/* Giữ lại toggle stream nếu bạn dự định thêm chức năng stream sau */}
                <div className="my-3">
                    <label className="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" className="sr-only peer" checked={isStreaming} onChange={toggleStreaming} />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{isStreaming ? 'Chế độ Stream (Chưa hoạt động)' : 'Chế độ Không Stream'}</span>
                    </label>
                </div>
                <ChatInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
}

export default ChatBot;