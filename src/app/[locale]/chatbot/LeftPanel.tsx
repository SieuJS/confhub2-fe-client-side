// src/app/[locale]/chatbot/LeftPanel.tsx
import React from 'react';
import { ChatMode, ConversationMetadata } from './lib/regular-chat.types';
import { X, MessageCircleMore } from 'lucide-react';
import ChatModeSelector from './sidepanel/ChatModeSelector';
import ConversationList from './sidepanel/ConversationList';

interface LeftPanelProps {
    isOpen: boolean;
    onClose: () => void;
    currentChatMode: ChatMode;
    onChatModeChange: (mode: ChatMode) => void;
    isLiveConnected: boolean;
    conversationList: ConversationMetadata[];
    activeConversationId: string | null;
    onSelectConversation: (conversationId: string) => void;
    onStartNewConversation: () => void;
    isLoadingConversations: boolean;
    // --- NEW PROPS ---
    onDeleteConversation: (conversationId: string) => void;
    onClearConversation: (conversationId: string) => void;
    // ---
}

const LeftPanel: React.FC<LeftPanelProps> = ({
    isOpen,
    onClose,
    currentChatMode,
    onChatModeChange,
    isLiveConnected,
    conversationList,
    activeConversationId,
    onSelectConversation,
    onStartNewConversation,
    isLoadingConversations,
    // --- Destructure new props ---
    onDeleteConversation,
    onClearConversation,
    // ---
}) => {
    const disableChatModeSelection = isLiveConnected;

    return (
        <div
            className={`flex-shrink-0 h-full bg-white text-gray-800 shadow-xl transition-all duration-300 ease-in-out overflow-y-hidden ${
                isOpen ? 'w-72 opacity-100' : 'w-0 opacity-0' // Adjusted width for potential button space
            }`}
            aria-hidden={!isOpen}
        >
            <div className="flex h-full flex-col min-w-[18rem] overflow-hidden">

                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between p-5 pb-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <MessageCircleMore size={20} className="text-gray-600" />
                        <h2 id="left-panel-title" className="text-lg font-semibold text-gray-900">
                            Chat Mode & History
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                        title="Close panel"
                        aria-label="Close panel"
                    >
                        <X size={20} strokeWidth={1.5} stroke="currentColor" className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Close panel</span>
                    </button>
                </div>

                {/* Chat Mode Selector */}
                <div className="flex-shrink-0 p-5 pb-3 border-b border-gray-100">
                    <ChatModeSelector
                        currentChatMode={currentChatMode}
                        onChatModeChange={onChatModeChange}
                        disabled={disableChatModeSelection}
                    />
                </div>

                {/* Conversation History Section - Pass down new props */}
                <ConversationList
                    conversationList={conversationList}
                    activeConversationId={activeConversationId}
                    onSelectConversation={onSelectConversation}
                    onStartNewConversation={onStartNewConversation}
                    isLoading={isLoadingConversations}
                    // --- Pass down new props ---
                    onDeleteConversation={onDeleteConversation}
                    onClearConversation={onClearConversation}
                    // ---
                />

            </div>
        </div>
    );
};

export default LeftPanel;