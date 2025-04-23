// src/contexts/ChatSocketContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useChatSocket, ChatSocketControls, UseChatSocketProps } from '@/src/hooks/chatbot/useChatSocket'; // Adjust path

// Create context with a default value (can be null or an initial state structure)
const ChatSocketContext = createContext<ChatSocketControls | null>(null);

// Define props for the provider
interface ChatSocketProviderProps extends UseChatSocketProps {
    children: ReactNode;
}

// Provider component
export const ChatSocketProvider: React.FC<ChatSocketProviderProps> = ({ children, ...hookProps }) => {
    const chatControls = useChatSocket(hookProps); // Call the hook here

    return (
        <ChatSocketContext.Provider value={chatControls}>
            {children}
        </ChatSocketContext.Provider>
    );
};

// Custom hook to use the context easily
export const useSharedChatSocket = (): ChatSocketControls => {
    const context = useContext(ChatSocketContext);
    if (!context) {
        throw new Error('useSharedChatSocket must be used within a ChatSocketProvider');
    }
    return context;
};