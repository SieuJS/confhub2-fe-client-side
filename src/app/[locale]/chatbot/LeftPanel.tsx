// src/app/[locale]/chatbot/LeftPanel.tsx
import React from 'react';
import { ChatMode, ConversationMetadata } from './lib/regular-chat.types'; // Thêm ConversationMetadata
import { X, MessageCircleMore, PlusCircle, Loader2, History } from 'lucide-react'; // Thêm icons
import ChatModeSelector from './sidepanel/ChatModeSelector';
import { formatDistanceToNow } from 'date-fns'; // Thư viện format ngày tháng

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
    isLoading: boolean;
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
    isLoading,
    // --------------------
}) => {
    const disableChatModeSelection = isLiveConnected;

    return (
        <div
            className={`flex-shrink-0 h-full bg-white text-gray-800 shadow-xl transition-all duration-300 ease-in-out overflow-y-hidden ${ // overflow-y-hidden ở đây
                isOpen ? 'w-72 opacity-100' : 'w-0 opacity-0'
                }`}
            aria-hidden={!isOpen}
        >
            {/* Inner Content Wrapper with controlled overflow */}
            <div className="flex h-full flex-col min-w-[18rem] overflow-hidden"> 

                {/* Header for Left Panel */}
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
                        title="Close chat mode"
                        aria-label="Close chat mode"
                    >
                        <X size={20} strokeWidth={1.5} stroke="currentColor" className="h-5 w-5" aria-hidden="true" />
                        <span className="sr-only">Close chat mode</span>
                    </button>
                </div>


                {/* Chat Mode Selector Area */}
                <div className="flex-shrink-0 p-5 pb-3 border-b border-gray-100">
                    <ChatModeSelector
                        currentChatMode={currentChatMode}
                        onChatModeChange={onChatModeChange}
                        disabled={disableChatModeSelection}
                    />
                </div>

                {/* Conversation History Section */}
                <div className="flex-grow p-5 pt-3 flex flex-col overflow-hidden"> 
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                            <History size={16} />
                            <span>Chat History</span>
                        </div>
                        <button
                            onClick={onStartNewConversation}
                            disabled={isLoading} 
                            className="flex items-center space-x-1 px-2 py-1 rounded text-xs text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Start a new chat session"
                        >
                            <PlusCircle size={14} />
                            <span>New Chat</span>
                        </button>
                    </div>

                    {/* Conversation List Area with Scrolling */}
                    <div className="flex-grow overflow-y-auto -mr-3 pr-3 space-y-1"> 
                        {isLoading && (
                            <div className="flex items-center justify-center py-4 text-gray-500">
                                <Loader2 size={18} className="animate-spin mr-2" />
                                <span>Loading...</span>
                            </div>
                        )}
                        {!isLoading && conversationList.length === 0 && (
                            <div className="text-center text-sm text-gray-400 py-4 px-2">
                                No past conversations found. Start a new chat!
                            </div>
                        )}
                        {!isLoading && conversationList.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => onSelectConversation(conv.id)}
                                disabled={isLoading} 
                                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-70 ${conv.id === activeConversationId
                                        ? 'bg-blue-100 text-blue-800 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="font-medium truncate">{conv.title}</div>
                                <div className={`text-xs ${conv.id === activeConversationId ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {formatDistanceToNow(new Date(conv.lastActivity), { addSuffix: true })}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeftPanel;