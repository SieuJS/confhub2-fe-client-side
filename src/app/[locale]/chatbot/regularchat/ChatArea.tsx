// src/app/[locale]/chatbot/regularchat/ChatArea.tsx
import React, { useRef, useEffect } from 'react';
import ChatHistory from './ChatHistory';
import ChatIntroductionDisplay from './ChatIntroduction';
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Đảm bảo import đúng type ChatMessageType
import { LanguageCode } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';

interface ChatAreaProps {
    messages: ChatMessageType[];
    showIntroduction: boolean;
    isSmallContext: boolean;
    languageCode: string;
    showConfirmationDialog: boolean;
    onSuggestionClick: (suggestion: string) => void;
    onConfirmEdit: (messageId: string, newText: string) => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
    messages,
    showIntroduction,
    isSmallContext,
    languageCode,
    showConfirmationDialog,
    onSuggestionClick,
    onConfirmEdit,
}) => {
    const chatHistoryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatHistoryRef.current && !showConfirmationDialog) {
            // Sử dụng requestAnimationFrame để đợi DOM render xong nếu cần độ chính xác cao hơn
            // Hoặc một timeout nhỏ để đảm bảo.
            const timerId = setTimeout(() => {
                if (chatHistoryRef.current) {
                    chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
                }
            }, 50); // Giảm timeout nếu có thể, 100ms có thể hơi lâu
            return () => clearTimeout(timerId);
        }
    }, [messages, showConfirmationDialog]);

    return (
        <div
            ref={chatHistoryRef}
            className='flex-grow space-y-3 overflow-y-auto p-3 md:p-4 dark:bg-gray-800' // Tăng padding một chút
            role="log"
            aria-live="polite" // Thông báo nội dung thay đổi cho screen readers
        >
            {showIntroduction && (
                <ChatIntroductionDisplay
                    onSuggestionClick={onSuggestionClick}
                    language={languageCode as LanguageCode} // Ép kiểu ở đây
                />
            )}
            {/* Chỉ render ChatHistory nếu có messages hoặc showIntroduction là false (tức là đang có active conversation)
          Điều này tránh việc ChatHistory render một div trống không cần thiết khi chỉ có introduction.
      */}
            {(!showIntroduction || messages.length > 0) && (
                <ChatHistory
                    messages={messages}
                    isInsideSmallContainer={isSmallContext}
                    onConfirmEdit={onConfirmEdit}
                />
            )}
        </div>
    );
};

export default ChatArea;