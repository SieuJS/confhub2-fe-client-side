// src/app/[locale]/chatbot/chat/ChatHistory.tsx
import React from 'react';
import ChatMessageDisplay from './ChatMessageDisplay';
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';

interface ChatHistoryProps {
    messages: ChatMessageType[];
    isInsideSmallContainer?: boolean;
    onConfirmEdit: (messageId: string, newText: string) => void; // <<< CHỈ CẦN PROP NÀY
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
    messages,
    isInsideSmallContainer = false,
    onConfirmEdit,
}) => {
     // Find the ID of the latest user message
    let latestUserMessageId: string | null = null;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].isUser) {
            latestUserMessageId = messages[i].id;
            break;
        }
    }


    return (
        <div className="flex flex-col">
            {messages.map((msg) => {
                const alignmentClasses = msg.isUser ? 'justify-end' : 'justify-start';
                const messageRowPaddingClasses = isInsideSmallContainer
                    ? (msg.isUser ? 'pl-1 sm:pl-2' : 'pr-1 sm:pr-2')
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
                            action={msg.action}
                            isInsideSmallContainer={isInsideSmallContainer}
                            isLatestUserMessage={msg.isUser && msg.id === latestUserMessageId}
                            onConfirmEdit={onConfirmEdit} // <<< TRUYỀN PROP XUỐNG
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default ChatHistory;