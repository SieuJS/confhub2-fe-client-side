// src/components/ChatHistory.tsx
import React, { useRef, useEffect } from 'react';
import ChatMessageComponent from './ChatMessage'; // Renamed from ChatMessage to avoid conflict
import ThoughtProcess from './ThoughtProcess'; // *** IMPORT ThoughtProcess ***
import { ChatMessageType } from './ChatBot';

interface ChatHistoryProps {
    messages: ChatMessageType[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const chatHistoryElement = chatHistoryRef.current;
        if (chatHistoryElement) {
                chatHistoryElement.scrollTo({
                top: chatHistoryElement.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages]);

    return (
        <div
            id="chat-history"
            className="flex-1 p-4 space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4 relative overflow-y-auto bg-white dark:bg-gray-800" // Added padding, space-y, background
            ref={chatHistoryRef}
        >
            {messages.map((msg, index) => {
                // Use flex alignment instead of float for better control
                const containerClasses = `message-container p-3 rounded-xl clear-both max-w-full ${msg.isUser ? 'float-right text-right' : 'float-left text-left'}`;

                return (
                    <div key={index} className={containerClasses}>
                        {/* Container for message bubble and potentially thoughts */}
                        <div className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}>
                            {/* *** Render ThoughtProcess for bot messages *** */}
                            {!msg.isUser && msg.thoughts && msg.thoughts.length > 0 && (
                                <ThoughtProcess thoughts={msg.thoughts} />
                            )}

                            {/* Render the actual message */}
                            <ChatMessageComponent
                                message={msg.message}
                                isUser={msg.isUser}
                                // Pass type if ChatMessageComponent needs it
                                // type={msg.type}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ChatHistory;