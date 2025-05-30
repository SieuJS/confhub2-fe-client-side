// src/app/[locale]/chatbot/regularchat/ChatHistory.tsx
import React from 'react';
import ChatMessageDisplay from './ChatMessageDisplay';
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
// Part không cần thiết ở đây nếu ChatMessageType đã bao gồm parts
// import { Part } from '@google/genai';

interface ChatHistoryProps {
    messages: ChatMessageType[];
    isInsideSmallContainer?: boolean;
    onConfirmEdit: (messageId: string, newText: string) => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
    messages,
    isInsideSmallContainer = false,
    onConfirmEdit,
}) => {
    let latestUserMessageId: string | null = null;
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].isUser) {
            latestUserMessageId = messages[i].id;
            break;
        }
    }

    // Lọc ra các tin nhắn không nên hiển thị (FC/FR thuần túy)
    const displayableMessages = messages.filter(msg => {
        // Luôn hiển thị tin nhắn của người dùng
        if (msg.isUser) {
            return true;
        }

        // Đối với tin nhắn của model hoặc function
        if (msg.role === 'model' || msg.role === 'function') {
            // Nếu không có parts và không có text (trường hợp hy hữu, nhưng để an toàn)
            if ((!msg.parts || msg.parts.length === 0) && !msg.text && !msg.botFiles && !msg.action) {
                 // Nếu là function role mà rỗng thì ẩn
                if (msg.role === 'function') return false;
                // Nếu là model role mà rỗng thì cũng có thể ẩn, trừ khi nó là placeholder cho streaming
                // Tuy nhiên, placeholder streaming thường có text: "" nên sẽ không rơi vào đây.
            }

            // Kiểm tra xem parts có tồn tại và có phần tử không
            if (msg.parts && msg.parts.length > 0) {
                // Kiểm tra xem có bất kỳ part nào là text, inlineData, hoặc fileData không
                const hasDisplayablePartContent = msg.parts.some(part => part.text || part.inlineData || part.fileData);

                // Nếu không có part nào có nội dung hiển thị (text, inlineData, fileData)
                // VÀ không có text chính trong tin nhắn, VÀ không có botFiles, VÀ không có action đặc biệt
                // thì có khả năng đây là tin nhắn hệ thống thuần túy (chỉ FC/FR)
                if (!hasDisplayablePartContent && !msg.text && !msg.botFiles && !msg.action) {
                    // Kiểm tra cụ thể hơn xem có phải chỉ là FC/FR không
                    const allPartsAreSystemProcessing = msg.parts.every(part => part.functionCall || part.functionResponse);
                    if (allPartsAreSystemProcessing) {
                        return false; // Không hiển thị tin nhắn này
                    }
                }
            }
        }
        // Mặc định hiển thị tất cả các tin nhắn khác
        return true;
    });

    return (
        <div className="flex flex-col">
            {displayableMessages.map((msg) => { // Sử dụng displayableMessages đã lọc
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
                            isInsideSmallContainer={isInsideSmallContainer}
                            isLatestUserMessage={msg.isUser && msg.id === latestUserMessageId}
                            onConfirmEdit={onConfirmEdit}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default ChatHistory;