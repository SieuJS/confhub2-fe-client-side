// src/app/[locale]/chatbot/stores/conversationStore/conversationStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    ConversationStoreState,
    ConversationStoreActions,
    initialConversationStoreState,
    ConversationMetadata, // For _onSocketConversationList
    InitialHistoryPayload, // For _onSocketInitialHistory
    ConversationDeletedPayload,
    ConversationClearedPayload,
    ConversationRenamedPayload,
    ConversationPinStatusChangedPayload,
} from './conversationState';
import {
    handleSetActiveConversationId,
    handleResetConversationState,
    handleLoadConversation,
    handleStartNewConversation,
    handleDeleteConversation,
    handleClearConversation,
    handleRenameConversation,
    handlePinConversation,
    handleSearchConversations,
} from './conversationActionHandlers';
import {
    handleSocketConversationList,
    handleSocketInitialHistory,
    handleSocketNewConversationStarted,
    handleSocketConversationDeleted,
    handleSocketConversationCleared,
    handleSocketConversationRenamed,
    handleSocketConversationPinStatusChanged,
} from './conversationSocketEventHandlers';

export const useConversationStore = create<ConversationStoreState & ConversationStoreActions>()(
    devtools(
        (set, get) => ({
            ...initialConversationStoreState,

            // --- Basic Setters ---
            setConversationList: (updater) => set(state => ({ conversationList: updater(state.conversationList) }), false, 'setConversationList'),
            setSearchResults: (results) => set({ searchResults: results }, false, 'setSearchResults'),
            setIsSearching: (isSearching) => set({ isSearching: isSearching }, false, 'setIsSearching'),
            setIsLoadingHistory: (isLoading) => set({ isLoadingHistory: isLoading }, false, 'setIsLoadingHistory'),
            setIsHistoryLoaded: (isLoaded) => set({ isHistoryLoaded: isLoaded }, false, 'setIsHistoryLoaded'),
            setIsProcessingExplicitNewChat: (isProcessing) => set({ isProcessingExplicitNewChat: isProcessing }, false, 'setIsProcessingExplicitNewChat'),

            // --- Actions calling handlers ---
            setActiveConversationId: (id, options) => {
                handleSetActiveConversationId(get, set, id, options);
            },
            resetConversationState: () => {
                handleResetConversationState(set);
            },
            loadConversation: (conversationId, options) => {
                handleLoadConversation(get, set, conversationId, options);
            },
            startNewConversation: (language: string) => {
                handleStartNewConversation(set, language);
            },
            deleteConversation: (conversationId: string) => {
                return handleDeleteConversation(conversationId); // Returns promise
            },
            clearConversation: (conversationId: string) => {
                handleClearConversation(conversationId);
            },
            renameConversation: (conversationId: string, newTitle: string) => {
                handleRenameConversation(conversationId, newTitle);
            },
            pinConversation: (conversationId: string, isPinned: boolean) => {
                handlePinConversation(conversationId, isPinned);
            },
            searchConversations: (searchTerm: string) => {
                handleSearchConversations(get, set, searchTerm);
            },

            // --- Socket Event Handlers calling handlers ---
            _onSocketConversationList: (list: ConversationMetadata[]) => {
                handleSocketConversationList(set, list);
            },
            _onSocketInitialHistory: (payload: InitialHistoryPayload) => {
                handleSocketInitialHistory(set, payload);
            },
            _onSocketNewConversationStarted: (payload: { conversationId: string; title: string; lastActivity?: string; isPinned?: boolean; language?: string }) => {
                handleSocketNewConversationStarted(get, set, payload);
            },
            _onSocketConversationDeleted: (payload: ConversationDeletedPayload) => {
                handleSocketConversationDeleted(set, payload);
            },
            _onSocketConversationCleared: (payload: ConversationClearedPayload) => {
                handleSocketConversationCleared(get, set, payload);
            },
            _onSocketConversationRenamed: (payload: ConversationRenamedPayload) => {
                handleSocketConversationRenamed(set, payload);
            },
            _onSocketConversationPinStatusChanged: (payload: ConversationPinStatusChangedPayload) => {
                handleSocketConversationPinStatusChanged(set, payload);
            },
        }),
        {
            name: "ConversationStore",
        }
    )
);