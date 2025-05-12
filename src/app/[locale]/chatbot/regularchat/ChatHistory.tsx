// src/app/[locale]/chatbot/chat/ChatHistory.tsx
import React from 'react';
import ChatMessageDisplay from './ChatMessageDisplay';
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';

interface ChatHistoryProps {
    messages: ChatMessageType[];
    isInsideSmallContainer?: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
    messages,
    isInsideSmallContainer = false
}) => {
    return (
        <div className="flex flex-col">
            {messages.map((msg) => {
                const alignmentClasses = msg.isUser ? 'justify-end' : 'justify-start';
                
                // Giữ nguyên logic padding này. Nó cung cấp không gian cho bubble.
                // Nếu tin nhắn user co lại, padding này sẽ là khoảng cách từ lề tới bubble.
                // Nếu tin nhắn bot full-width, padding này sẽ là khoảng cách rất nhỏ từ lề tới bubble.
                const messageRowPaddingClasses = isInsideSmallContainer
                    ? (msg.isUser ? 'pl-1 sm:pl-2' : 'pr-1 sm:pr-2') // Padding nhỏ cho cả user và bot
                    : (msg.isUser ? 'pl-6 sm:pl-10 md:pl-16' : 'pr-6 sm:pr-10 md:pr-16');

                return (
                    <div
                        key={msg.id}
                        className={`flex w-full py-1 ${alignmentClasses} ${messageRowPaddingClasses}`}
                    >
                        <ChatMessageDisplay
                            id={msg.id}
                            message={msg.message}
                            isUser={msg.isUser}
                            type={msg.type}
                            thoughts={msg.thoughts}
                            location={msg.location}
                            isInsideSmallContainer={isInsideSmallContainer}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default ChatHistory;