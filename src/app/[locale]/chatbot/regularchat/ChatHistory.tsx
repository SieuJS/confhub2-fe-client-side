// src/app/[locale]/chatbot/regularchat/ChatHistory.tsx
import React from 'react';
import ChatMessageDisplay from './ChatMessageDisplay';
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
// <<< NEW: Import FeedbackType
import { FeedbackType } from './feedback/FeedbackModal';

interface ChatHistoryProps {
    messages: ChatMessageType[];
    isInsideSmallContainer?: boolean;
    onConfirmEdit: (messageId: string, newText: string) => void;
    // <<< NEW PROP
    onOpenFeedbackModal: (messageId: string, type: FeedbackType) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
    messages,
    isInsideSmallContainer = false,
    onConfirmEdit,
    // <<< NEW PROP
    onOpenFeedbackModal,
}) => {
    // ... (logic lấy latestUserMessageId và displayableMessages giữ nguyên) ...
    let latestUserMessageId: string | null = null;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].isUser) {
            latestUserMessageId = messages[i].id;
            break;
        }
    }

    const displayableMessages = messages.filter(msg => {
        if (msg.isUser) {
            return true;
        }
        if (msg.role === 'model' || msg.role === 'function') {
            if ((!msg.parts || msg.parts.length === 0) && !msg.text && !msg.botFiles && !msg.action && (!msg.sources || msg.sources.length === 0) ) {
                if (msg.role === 'function') return false;
            }
            if (msg.parts && msg.parts.length > 0) {
                const hasDisplayablePartContent = msg.parts.some(part => part.text || part.inlineData || part.fileData);
                if (!hasDisplayablePartContent && !msg.text && !msg.botFiles && !msg.action && (!msg.sources || msg.sources.length === 0)) {
                    const allPartsAreSystemProcessing = msg.parts.every(part => part.functionCall || part.functionResponse);
                    if (allPartsAreSystemProcessing) {
                        return false;
                    }
                }
            }
        }
        return true;
    });


    return (
        <div className="flex flex-col">
            {displayableMessages.map((msg) => {
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
                            text={msg.text}
                            parts={msg.parts}
                            files={msg.files}
                            botFiles={msg.botFiles}
                            isUser={msg.isUser}
                            type={msg.type}
                            thoughts={msg.thoughts}
                            location={msg.location}
                            action={msg.action}
                            timestamp={msg.timestamp}
                            sources={msg.sources}
                            isInsideSmallContainer={isInsideSmallContainer}
                            isLatestUserMessage={msg.isUser && msg.id === latestUserMessageId}
                            onConfirmEdit={onConfirmEdit}
                            // <<< PASS THE PROP DOWN
                            onOpenFeedbackModal={onOpenFeedbackModal}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default ChatHistory;