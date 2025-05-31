// src/app/[locale]/chatbot/stores/conversationStore/conversationSocketEventHandlers.ts
import {
    ConversationStoreState,
    ConversationStoreActions,
    ConversationMetadata,
    InitialHistoryPayload,
    ConversationDeletedPayload,
    ConversationClearedPayload,
    ConversationRenamedPayload,
    ConversationPinStatusChangedPayload,
    FE_DEFAULT_TITLES,
    FE_FALLBACK_DEFAULT_TITLE,
} from './conversationState';
import { useMessageStore } from '../messageStore/messageStore';
import { useUiStore } from '../uiStore';

type StoreGet = () => ConversationStoreState & ConversationStoreActions;
type StoreSet = (
    partial: ConversationStoreState | Partial<ConversationStoreState> | ((state: ConversationStoreState) => ConversationStoreState | Partial<ConversationStoreState>),
    replace?: false | undefined,
    actionName?: string | { type: string; [key: string]: any; [key: number]: any; [key: symbol]: any; }
) => void;

const sortConversationList = (list: ConversationMetadata[]): ConversationMetadata[] => {
    return (Array.isArray(list) ? list : []).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });
};

export const handleSocketConversationList = (
    set: StoreSet,
    list: ConversationMetadata[]
) => {
    const sortedList = sortConversationList(list);

    set(state => {
        let newIsLoadingHistory = state.isLoadingHistory;
        if (!state.activeConversationId || state.isHistoryLoaded) {
            newIsLoadingHistory = false;
        } else {
            console.log(`[ConversationStore _onSocketConversationList] Active conversation (${state.activeConversationId}) exists and its history is not yet loaded. Keeping isLoadingHistory (${state.isLoadingHistory}) as is.`);
        }
        return {
            conversationList: sortedList,
            searchResults: sortedList,
            isLoadingHistory: newIsLoadingHistory
        };
    }, false, '_onSocketConversationList');
};

export const handleSocketInitialHistory = (
    set: StoreSet,
    payload: InitialHistoryPayload
) => {
    const { conversationId, messages: historyItemsBackend } = payload;

    set({
        isLoadingHistory: false,
        activeConversationId: conversationId,
        isHistoryLoaded: true,
    }, false, `_onSocketInitialHistory/setConversationState/${conversationId}`);

    if (Array.isArray(historyItemsBackend)) {
        useMessageStore.getState().loadHistoryMessages(historyItemsBackend);
    } else {
        useMessageStore.getState().loadHistoryMessages([]);
        console.warn(`[ConversationStore _onSocketInitialHistory] Received payload for ${conversationId} with non-array messages. Resetting messages in messageStore.`);
    }
};

export const handleSocketNewConversationStarted = (
    get: StoreGet,
    set: StoreSet,
    payload: { conversationId: string; title: string; lastActivity?: string; isPinned?: boolean; language?: string }
) => {
    console.log(`[ConversationStore _onSocketNewConversationStarted] New Conversation ID: ${payload.conversationId}. Title: "${payload.title}". Explicit flow: ${get().isProcessingExplicitNewChat}`);
    set(state => {
        const langCode = payload.language?.slice(0, 2) || 'en';
        const newConv: ConversationMetadata = {
            id: payload.conversationId,
            title: payload.title || (FE_DEFAULT_TITLES[langCode] || FE_FALLBACK_DEFAULT_TITLE),
            lastActivity: payload.lastActivity || new Date().toISOString(),
            isPinned: payload.isPinned || false,
        };
        const updatedList = sortConversationList([newConv, ...state.conversationList.filter(c => c.id !== payload.conversationId)]);

        return {
            activeConversationId: payload.conversationId,
            isHistoryLoaded: true,
            isLoadingHistory: false,
            conversationList: updatedList,
            searchResults: updatedList,
        };
    }, false, `_onSocketNewConversationStarted/${payload.conversationId}`);

    if (get().isProcessingExplicitNewChat) {
        console.log('[ConversationStore _onSocketNewConversationStarted] Explicit new chat flow detected. Resetting message loading state.');
        useMessageStore.getState().setLoadingState({ isLoading: false, step: 'new_chat_ready', message: '' });
        set({ isProcessingExplicitNewChat: false }, false, '_onSocketNewConversationStarted/resetExplicitFlag');
    } else {
        console.log('[ConversationStore _onSocketNewConversationStarted] Implicit new chat flow. Message loading state will be handled by message events.');
    }
    useUiStore.getState().setShowConfirmationDialog(false);
};

export const handleSocketConversationDeleted = (
    set: StoreSet,
    payload: ConversationDeletedPayload
) => {
    const deletedId = payload.conversationId;
    console.log(`[ConversationStore _onSocketConversationDeleted] Received confirmation for ${deletedId}`);
    set(state => {
        const newConvList = state.conversationList.filter(conv => conv.id !== deletedId);
        let newActiveId = state.activeConversationId;
        let newIsHistoryLoaded = state.isHistoryLoaded;

        if (state.activeConversationId === deletedId) {
            console.log(`[ConversationStore _onSocketConversationDeleted] Deleted conversation ${deletedId} was active. Resetting active state.`);
            newActiveId = null;
            newIsHistoryLoaded = false;
            useMessageStore.getState().resetChatUIForNewConversation(true);
        }
        return {
            conversationList: newConvList,
            activeConversationId: newActiveId,
            isHistoryLoaded: newIsHistoryLoaded,
            searchResults: newConvList,
        };
    }, false, `_onSocketConversationDeleted/${deletedId}`);
};

export const handleSocketConversationCleared = (
    get: StoreGet,
    set: StoreSet,
    payload: ConversationClearedPayload
) => {
    if (get().activeConversationId === payload.conversationId) {
        useMessageStore.getState().setChatMessages(() => []);
        useMessageStore.getState().setLoadingState({ isLoading: false, step: 'idle', message: '' });
    }
    set(state => ({
        conversationList: state.conversationList.map(c => c.id === payload.conversationId ? { ...c, lastActivity: new Date().toISOString() } : c)
    }), false, `_onSocketConversationClearedUpdateList/${payload.conversationId}`);
};

export const handleSocketConversationRenamed = (
    set: StoreSet,
    payload: ConversationRenamedPayload
) => {
    const updater = (prevList: ConversationMetadata[]) =>
        sortConversationList(
            prevList.map(conv =>
                conv.id === payload.conversationId ? { ...conv, title: payload.newTitle, lastActivity: new Date().toISOString() } : conv
            )
        );
    set(state => ({
        conversationList: updater(state.conversationList),
        searchResults: updater(state.searchResults)
    }), false, `_onSocketConversationRenamed/${payload.conversationId}`);
};

export const handleSocketConversationPinStatusChanged = (
    set: StoreSet,
    payload: ConversationPinStatusChangedPayload
) => {
    const updater = (prevList: ConversationMetadata[]) =>
        sortConversationList(
            prevList.map(conv =>
                conv.id === payload.conversationId
                    ? { ...conv, isPinned: payload.isPinned, lastActivity: new Date().toISOString() }
                    : conv
            )
        );
    set(state => ({
        conversationList: updater(state.conversationList),
        searchResults: updater(state.searchResults)
    }), false, `_onSocketConversationPinStatusChanged/${payload.conversationId}`);
};