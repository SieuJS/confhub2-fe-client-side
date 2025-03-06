// Trong ChatHistory.tsx
import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChartDisplay from './ChartDisplay';
import { ChatMessageType } from './ChatBot';

interface ChatHistoryProps {
    messages: ChatMessageType[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log("ChatHistory received messages prop:", messages);
        const chatHistoryElement = chatHistoryRef.current;
        if (chatHistoryElement) {
            chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
        }
    }, [messages]);

    return (
        <div id="chat-history" className="p-2 border border-gray-200 rounded-lg mb-5 relative overflow-y-auto" ref={chatHistoryRef}>
            {messages.map((msg, index) => {
                // Thay đổi ở đây: max-w-full hoặc max-w-screen-md (hoặc lớn hơn)
                const containerClasses = `message-container p-3 rounded-xl mb-3 clear-both max-w-full ${msg.isUser ? 'float-right text-right' : 'float-left text-left'}`;
                return (
                    <div key={index} className={containerClasses}>
                        {msg.isUser ? (
                            <ChatMessage message={msg.message} isUser={msg.isUser} />
                        ) : msg.type === 'chart' ? (
                            <ChartDisplay echartsConfig={msg.echartsConfig} sqlResult={msg.sqlResult} description={msg.description} />
                        ) : (
                            <ChatMessage message={msg.message} isUser={msg.isUser} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ChatHistory;