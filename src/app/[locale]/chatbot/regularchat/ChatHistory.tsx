// src/app/[locale]/chatbot/chat/ChatHistory.tsx
import React from 'react';
// Assuming ChatMessageComponent handles rendering the bubble and thoughts
// You might need to create/adjust this component based on the ChatMessage/ThoughtProcess logic
import ChatMessageDisplay from './ChatMessageDisplay'; // Renamed for clarity
import { ChatMessageType } from '@/src/models/chatbot/chatbot'; // Adjust path if needed

interface ChatHistoryProps {
    messages: ChatMessageType[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
    // No scrolling logic needed here - parent handles it

    return (
        // This div is just for mapping and adding space between messages
        // The parent component provides the main scrollable container styling
        <div className="space-y-4"> {/* Adds space between message rows */}
            {messages.map((msg, index) => (
                // Each message row uses flex to align left or right
                <div key={index} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start text-left'}`}>
                    {/*
                       Pass all necessary info to the component that renders
                       the actual message bubble and any associated thoughts.
                       This component handles the bubble's appearance based on props.
                    */}
                    <ChatMessageDisplay
                        message={msg.message}
                        isUser={msg.isUser}
                        type={msg.type}
                        thoughts={msg.thoughts}
                    />
                </div>
            ))}
        </div>
    );
};

export default ChatHistory;