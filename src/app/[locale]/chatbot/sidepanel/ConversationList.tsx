// src/app/[locale]/chatbot/sidepanel/ConversationList.tsx
import React from 'react';
import { ConversationMetadata } from '../lib/regular-chat.types';
import { History, PlusCircle, Loader2, Trash2, Eraser } from 'lucide-react'; // Added Trash2 and Eraser
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
    conversationList: ConversationMetadata[];
    activeConversationId: string | null;
    onSelectConversation: (conversationId: string) => void;
    onStartNewConversation: () => void;
    isLoading: boolean;
    // --- NEW PROPS ---
    onDeleteConversation: (conversationId: string) => void;
    onClearConversation: (conversationId: string) => void;
    // ---
}

const ConversationList: React.FC<ConversationListProps> = ({
    conversationList,
    activeConversationId,
    onSelectConversation,
    onStartNewConversation,
    isLoading,
    // --- Destructure new props ---
    onDeleteConversation,
    onClearConversation,
    // ---
}) => {

    // --- Event Handlers for Buttons ---
    const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
        e.stopPropagation(); // Prevent triggering onSelectConversation
        // Add confirmation dialog
        if (window.confirm(`Are you sure you want to permanently delete the conversation "${title || 'Untitled'}"?`)) {
            onDeleteConversation(id);
        }
    };

    const handleClearClick = (e: React.MouseEvent, id: string, title: string) => {
        e.stopPropagation(); // Prevent triggering onSelectConversation
        // Optional: Add confirmation if desired
        if (window.confirm(`Are you sure you want to clear all messages from the conversation "${title || 'Untitled'}"? This cannot be undone.`)) {
             onClearConversation(id);
        }
    };
    // ---

    return (
        <div className="flex-grow p-5 pt-3 flex flex-col overflow-hidden">
            {/* Header for Conversation History */}
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
                {!isLoading && conversationList.map((conv) => {
                    const title = conv.title || `Chat ${conv.id.substring(0, 6)}...`; // Consistent title definition
                    return (
                        <div key={conv.id} className="relative group"> {/* Added relative and group */}
                            <button
                                onClick={() => onSelectConversation(conv.id)}
                                disabled={isLoading}
                                className={`w-full text-left pl-3 pr-16 py-2 rounded-md text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-70 ${
                                    conv.id === activeConversationId
                                        ? 'bg-blue-100 text-blue-800 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                aria-current={conv.id === activeConversationId ? 'page' : undefined}
                            >
                                <div className="font-medium truncate">{title}</div>
                                <div className={`text-xs ${conv.id === activeConversationId ? 'text-blue-600' : 'text-gray-500'}`}>
                                    {formatDistanceToNow(new Date(conv.lastActivity), { addSuffix: true })}
                                </div>
                            </button>

                            {/* --- Action Buttons Container --- */}
                            <div className="absolute top-0 right-0 h-full flex items-center pr-2 space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                                {/* Clear Button */}
                                <button
                                    onClick={(e) => handleClearClick(e, conv.id, title)}
                                    disabled={isLoading}
                                    title="Clear Messages"
                                    className="p-1.5 text-gray-500 hover:text-yellow-600 hover:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-yellow-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={`Clear messages in conversation: ${title}`}
                                >
                                    <Eraser className="h-4 w-4" />
                                </button>
                                {/* Delete Button */}
                                <button
                                    onClick={(e) => handleDeleteClick(e, conv.id, title)}
                                    disabled={isLoading}
                                    title="Delete Conversation"
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label={`Delete conversation: ${title}`}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            {/* --- End Action Buttons --- */}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ConversationList;