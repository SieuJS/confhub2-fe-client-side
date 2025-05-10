// src/app/[locale]/chatbot/chat/ChatHistory.tsx
import React from 'react';
import ChatMessageDisplay from './ChatMessageDisplay';
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';

interface ChatHistoryProps {
    messages: ChatMessageType[];
    isInsideSmallContainer?: boolean; // <-- THÊM PROP MỚI
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
    messages,
    isInsideSmallContainer = false // <-- Giá trị mặc định
}) => {
    return (
        <div className="flex flex-col">
            {messages.map((msg) => (
                <div
                    key={msg.id}
                    className={`flex w-full py-1 ${msg.isUser ? 'justify-end pl-6 sm:pl-10 md:pl-16' : 'justify-start pr-6 sm:pr-10 md:pr-16'}`}
                >
                    <ChatMessageDisplay
                        id={msg.id}
                        message={msg.message}
                        isUser={msg.isUser}
                        type={msg.type}
                        thoughts={msg.thoughts}
                        location={msg.location}
                        isInsideSmallContainer={isInsideSmallContainer} // <-- TRUYỀN PROP XUỐNG
                    />
                </div>
            ))}
        </div>
    );
};

export default ChatHistory;