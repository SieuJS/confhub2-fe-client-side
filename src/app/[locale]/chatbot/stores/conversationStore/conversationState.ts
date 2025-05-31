// src/app/[locale]/chatbot/stores/conversationStore/conversationState.ts
import {
    ConversationMetadata,
    InitialHistoryPayload,
    ConversationDeletedPayload,
    ConversationClearedPayload,
    ConversationRenamedPayload,
    ConversationPinStatusChangedPayload,
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';

// Define default titles for fallback on frontend if needed (though backend should provide it)
export const FE_DEFAULT_TITLES: { [key: string]: string } = {
    en: "New Chat",
    vi: "Cuộc trò chuyện mới",
};
export const FE_FALLBACK_DEFAULT_TITLE = "New Chat";

// --- Types for Conversation Store State ---
export interface ConversationStoreState {
    conversationList: ConversationMetadata[];
    activeConversationId: string | null;
    searchResults: ConversationMetadata[];
    isSearching: boolean;
    isLoadingHistory: boolean;
    isHistoryLoaded: boolean;
    isProcessingExplicitNewChat: boolean;
}

// --- Types for Conversation Store Actions ---
export interface ConversationStoreActions {
    setConversationList: (updater: (prev: ConversationMetadata[]) => ConversationMetadata[]) => void;
    setActiveConversationId: (id: string | null, options?: { fromUrl?: boolean; skipUiReset?: boolean }) => void;
    setSearchResults: (results: ConversationMetadata[]) => void;
    setIsSearching: (isSearching: boolean) => void;
    setIsLoadingHistory: (isLoading: boolean) => void;
    setIsHistoryLoaded: (isLoaded: boolean) => void;
    setIsProcessingExplicitNewChat: (isProcessing: boolean) => void;

    // Complex Actions
    loadConversation: (conversationId: string, options?: { isFromUrl?: boolean }) => void;
    startNewConversation: (language: string) => void;
    deleteConversation: (conversationId: string) => Promise<void>;
    clearConversation: (conversationId: string) => void;
    renameConversation: (conversationId: string, newTitle: string) => void;
    pinConversation: (conversationId: string, isPinned: boolean) => void;
    searchConversations: (searchTerm: string) => void;
    resetConversationState: () => void;

    // Socket Event Handlers
    _onSocketConversationList: (list: ConversationMetadata[]) => void;
    _onSocketInitialHistory: (payload: InitialHistoryPayload) => void;
    _onSocketNewConversationStarted: (payload: { conversationId: string; title: string; lastActivity?: string; isPinned?: boolean; language?: string }) => void;
    _onSocketConversationDeleted: (payload: ConversationDeletedPayload) => void;
    _onSocketConversationCleared: (payload: ConversationClearedPayload) => void;
    _onSocketConversationRenamed: (payload: ConversationRenamedPayload) => void;
    _onSocketConversationPinStatusChanged: (payload: ConversationPinStatusChangedPayload) => void;
}

export const initialConversationStoreState: ConversationStoreState = {
    conversationList: [],
    activeConversationId: null,
    searchResults: [],
    isSearching: false,
    isLoadingHistory: false,
    isHistoryLoaded: false,
    isProcessingExplicitNewChat: false,
};

// Re-export types that might be needed by handlers
export type {
    ConversationMetadata,
    InitialHistoryPayload,
    ConversationDeletedPayload,
    ConversationClearedPayload,
    ConversationRenamedPayload,
    ConversationPinStatusChangedPayload,
};