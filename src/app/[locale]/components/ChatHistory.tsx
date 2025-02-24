import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage'; // Make sure ChatMessage is also in .tsx if converted

interface ChatHistoryProps {
    messages: { message: string; isUser: boolean; isStreaming?: boolean; }[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
    const chatHistoryRef = useRef<HTMLDivElement>(null); // useRef for a div element

    useEffect(() => {
        console.log("ChatHistory nhận messages prop:", messages); // LOG 4: Xem prop messages trong ChatHistory
        const chatHistoryElement = chatHistoryRef.current;
        if (chatHistoryElement) {
            chatHistoryElement.scrollTop = chatHistoryElement.scrollHeight;
        }
    }, [messages]);

    return (
        <div
            id="chat-history"
            className="rounded-lg mb-5 relative overflow-y-auto"
            ref={chatHistoryRef}
        >
            {messages.map((msg, index) => (
                <ChatMessage key={index} message={msg.message} isUser={msg.isUser} />
            ))}
        </div>
    );
};

export default ChatHistory;