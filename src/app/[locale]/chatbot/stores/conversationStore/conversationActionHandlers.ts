// src/app/[locale]/chatbot/stores/conversationStore/conversationActionHandlers.ts
import {
    ConversationStoreState,
    ConversationStoreActions,
    initialConversationStoreState,
    ConversationMetadata,
} from './conversationState';
import { useMessageStore } from '../messageStore/messageStore';
import { useSocketStore } from '../socketStore';
import { useUiStore } from '../uiStore';

type StoreGet = () => ConversationStoreState & ConversationStoreActions;
type StoreSet = (
    partial: ConversationStoreState | Partial<ConversationStoreState> | ((state: ConversationStoreState) => ConversationStoreState | Partial<ConversationStoreState>),
    replace?: false | undefined,
    actionName?: string | { type: string; [key: string]: any; [key: number]: any; [key: symbol]: any; }
) => void;


export const handleSetActiveConversationId = (
    get: StoreGet,
    set: StoreSet,
    id: string | null,
    options?: { fromUrl?: boolean; skipUiReset?: boolean }
) => {
    const oldId = get().activeConversationId;
    if (oldId === id && !options?.fromUrl) {
        // console.log(`[ConversationStore] setActiveConversationId: already active ${id}, not from URL. No state change.`);
        return;
    }

    // console.log(`[ConversationStore] setActiveConversationId: ${id}`, options);
    set({ activeConversationId: id }, false, `setActiveConversationId/${id}`);

    if (id && !options?.fromUrl && !options?.skipUiReset) {
        useMessageStore.getState().resetChatUIForNewConversation(false);
        set({ isHistoryLoaded: false }, false, 'setActiveConversationId/resetHistoryLoadedForNewId');
    } else if (!id && !options?.skipUiReset) {
        useMessageStore.getState().resetChatUIForNewConversation(true);
        set({ isHistoryLoaded: false }, false, 'setActiveConversationId/resetHistoryLoadedForNullId');
    }
};

export const handleResetConversationState = (set: StoreSet) => {
    // console.log("[ConversationStore] Resetting conversation state to initial.");
    set(initialConversationStoreState, false, 'resetConversationState');
};

export const handleLoadConversation = (
    get: StoreGet,
    set: StoreSet,
    conversationId: string,
    options?: { isFromUrl?: boolean }
) => {
    const { activeConversationId: currentActiveId, isHistoryLoaded: currentHistoryLoaded, isLoadingHistory } = get();
    const { setIsLoadingHistory, setIsHistoryLoaded, setActiveConversationId } = get(); // Get actions from store
    const { isConnected } = useSocketStore.getState();
    const { handleError } = useUiStore.getState();
    const { setChatMessages, setLoadingState } = useMessageStore.getState();

    if (!isConnected) {
        handleError({ message: 'Cannot load conversation: Not connected.', type: 'error' }, false, false);
        return;
    }
    if (!conversationId) {
        // console.warn("[ConversationStore] Attempted to load conversation with invalid ID.");
        return;
    }
    if (isLoadingHistory && currentActiveId === conversationId) {
        // console.log(`[ConversationStore] Conversation ${conversationId} is already loading.`);
        return;
    }
    if (conversationId === currentActiveId && currentHistoryLoaded && !isLoadingHistory) {
        // console.log(`[ConversationStore] Conversation ${conversationId} is already active, loaded, and not currently loading. Options:`, options);
        if (options?.isFromUrl) {
            setActiveConversationId(conversationId, { fromUrl: true, skipUiReset: true });
        }
        setLoadingState({ isLoading: false, step: 'history_loaded', message: '' });
        setIsLoadingHistory(false);
        return;
    }

    // console.log(`[ConversationStore] Requesting to load conversation ID: ${conversationId}`);
    setIsLoadingHistory(true);
    if ((!options?.isFromUrl && currentActiveId !== conversationId) ||
        (options?.isFromUrl && currentActiveId !== conversationId)) {
        setChatMessages(() => []);
    }
    setIsHistoryLoaded(false);
    setActiveConversationId(conversationId, { fromUrl: options?.isFromUrl, skipUiReset: true });
    setLoadingState({ isLoading: true, step: 'loading_history', message: 'Loading history...' });
    useSocketStore.getState().emitLoadConversation(conversationId);
};

export const handleStartNewConversation = (
    set: StoreSet,
    language: string
) => {
    const { isConnected, isServerReadyForCommands } = useSocketStore.getState();
    const { handleError } = useUiStore.getState();
    const { resetChatUIForNewConversation, setLoadingState: setMessageLoadingState } = useMessageStore.getState();

    if (!isConnected || !isServerReadyForCommands) {
        handleError({ message: 'Cannot start new conversation: Not connected or server not ready.' });
        return;
    }
    // console.log(`[ConversationStore] STARTING NEW CONVERSATION (explicit) with language: ${language}.`);

    set({ isProcessingExplicitNewChat: true }, false, 'startNewConversation/setProcessing');

    resetChatUIForNewConversation(true);
    set({ activeConversationId: null, isHistoryLoaded: false }, false, 'startNewConversation/resetActive');
    setMessageLoadingState({ isLoading: true, step: 'starting_new_chat', message: 'Preparing new chat...' });

    useSocketStore.getState().emitStartNewConversation({ language });
};

export const handleDeleteConversation = (conversationIdToDelete: string): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const { isConnected, hasFatalConnectionError } = useSocketStore.getState();
        const { handleError } = useUiStore.getState();

        if (!isConnected || hasFatalConnectionError) {
            const msg = 'Cannot delete: Socket not connected or in fatal error state.';
            // console.warn(msg);
            handleError({ message: 'Cannot delete conversation: Not connected.' }, false);
            return reject(new Error(msg));
        }
        if (!conversationIdToDelete) {
            const msg = 'Invalid conversation ID for deletion.';
            // console.warn(msg);
            return reject(new Error(msg));
        }
        // console.log(`[ConversationStore] Emitting delete_conversation for: ${conversationIdToDelete}`);
        useSocketStore.getState().emitDeleteConversation(conversationIdToDelete);
        resolve();
    });
};

export const handleClearConversation = (conversationId: string) => {
    const { isConnected, hasFatalConnectionError } = useSocketStore.getState();
    const { handleError } = useUiStore.getState();
    if (!isConnected || hasFatalConnectionError) { handleError({ message: 'Cannot clear: Not connected.' }); return; }
    if (!conversationId) { 
        // console.warn('Invalid conversation ID for clear.'); 
        return; }
    useSocketStore.getState().emitClearConversation(conversationId);
};

export const handleRenameConversation = (conversationId: string, newTitle: string) => {
    const { isConnected, hasFatalConnectionError } = useSocketStore.getState();
    const { handleError } = useUiStore.getState();
    if (!isConnected || hasFatalConnectionError) { handleError({ message: 'Cannot rename: Not connected.' }); return; }
    if (!conversationId || typeof newTitle !== 'string') { 
        // console.warn('Invalid ID or title for rename.'); 
        return; }
    useSocketStore.getState().emitRenameConversation(conversationId, newTitle);
};

export const handlePinConversation = (conversationId: string, isPinned: boolean) => {
    const { isConnected, hasFatalConnectionError } = useSocketStore.getState();
    const { handleError } = useUiStore.getState();
    if (!isConnected || hasFatalConnectionError) { handleError({ message: 'Cannot pin: Not connected.' }); return; }
    if (!conversationId || typeof isPinned !== 'boolean') { 
        // console.warn('Invalid ID or pin status.'); 
        return; }
    useSocketStore.getState().emitPinConversation(conversationId, isPinned);
};

export const handleSearchConversations = (
    get: StoreGet,
    set: StoreSet,
    searchTerm: string
) => {
    const { conversationList } = get();
    const { setIsSearching, setSearchResults } = get(); // Get actions from store

    setIsSearching(true);
    const trimmedSearchTerm = searchTerm.trim().toLowerCase();
    if (!trimmedSearchTerm) {
        setSearchResults(conversationList);
    } else {
        const filtered = conversationList.filter(conv =>
            conv.title.toLowerCase().includes(trimmedSearchTerm)
        );
        setSearchResults(filtered);
    }
    setIsSearching(false);
};