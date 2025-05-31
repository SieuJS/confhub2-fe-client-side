// src/app/[locale]/chatbot/stores/messageStore/messageStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    MessageStoreState,
    MessageStoreActions,
    initialMessageStoreState,
    Part, UserFile, OriginalUserFileInfo, // Types used directly in actions
    StatusUpdate, ChatUpdate, ResultUpdate, ErrorUpdate, EmailConfirmationResult, BackendConversationUpdatedAfterEditPayload, HistoryItem // Types for socket handlers
} from './messageState';
import {
    handleSendMessage,
    handleLoadHistoryMessages,
    handleSubmitEditedMessage,
    handleResetChatUIForNewConversation,
    handleClearAuthErrorMessages
} from './messageActionHandlers';
import {
    handleSocketStatusUpdate,
    handleSocketChatUpdate,
    handleSocketChatResult,
    handleSocketChatError,
    handleSocketEmailConfirmationResult,
    handleSocketConversationUpdatedAfterEdit
} from './socketEventHandlers';
import { useUiStore } from '../uiStore'; // Keep for resetChatUI access, though logic moved

export const useMessageStore = create<MessageStoreState & MessageStoreActions>()(
    devtools(
        (set, get) => ({
            ...initialMessageStoreState,

            setChatMessages: (newMessagesOrUpdater) => {
                if (typeof newMessagesOrUpdater === 'function') {
                    set(state => ({ chatMessages: newMessagesOrUpdater(state.chatMessages) }), false, 'setChatMessages (updater fn)');
                } else {
                    set({ chatMessages: newMessagesOrUpdater }, false, 'setChatMessages (direct array)');
                }
            },
            addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] }), false, 'addChatMessage'),
            updateMessageById: (messageId, updates) => set(state => ({
                chatMessages: state.chatMessages.map(msg =>
                    msg.id === messageId
                        ? { ...msg, ...(typeof updates === 'function' ? updates(msg) : updates) }
                        : msg
                )
            }), false, `updateMessageById/${messageId}`),
            setLoadingState: (loadingState) => set({ loadingState }, false, 'setLoadingState'),
            setAnimationControls: (controls) => set({ animationControls: controls }, false, 'setAnimationControls'),
            resetAwaitFlag: () => {
                get().isAwaitingFinalResultRef.current = false;
            },
            setPendingBotMessageId: (id) => set({ pendingBotMessageId: id }, false, 'setPendingBotMessageId'),
            setEditingMessageId: (messageId) => set({ editingMessageId: messageId }, false, `setEditingMessageId/${messageId}`),

            // --- Actions calling handlers ---
            sendMessage: (parts: Part[], userFilesForDisplayOptimistic?: UserFile[], originalUserFilesInfo?: OriginalUserFileInfo[]) => {
                handleSendMessage(get, set, parts, userFilesForDisplayOptimistic, originalUserFilesInfo);
            },
            loadHistoryMessages: (historyItems: HistoryItem[]) => {
                handleLoadHistoryMessages(set, historyItems);
            },
            submitEditedMessage: (messageIdToEdit: string, newText: string) => {
                handleSubmitEditedMessage(get, set, messageIdToEdit, newText);
            },
            resetChatUIForNewConversation: (clearActiveIdInOtherStores = true) => {
                // Original implementation directly accessed useUiStore, we keep it for now.
                // If useUiStore.getState().setShowConfirmationDialog was the *only* cross-store call here,
                // it could be passed as an argument to the handler. But for simplicity and strict no-logic-change,
                // direct call from main store is fine as it was. The handler `handleResetChatUIForNewConversation`
                // will focus on `messageStore`'s state.
                handleResetChatUIForNewConversation(get, set, clearActiveIdInOtherStores);
                // The setShowConfirmationDialog was part of the original function, so it stays here
                // to ensure no logic is missed from being moved.
                useUiStore.getState().setShowConfirmationDialog(false);
            },
            clearAuthErrorMessages: () => {
                handleClearAuthErrorMessages(set);
            },

            // --- Socket event handlers calling handlers ---
            _onSocketStatusUpdate: (data: StatusUpdate) => {
                handleSocketStatusUpdate(set, data);
            },
            _onSocketChatUpdate: (update: ChatUpdate) => {
                handleSocketChatUpdate(get, set, update);
            },
            _onSocketChatResult: (result: ResultUpdate) => {
                handleSocketChatResult(get, set, result);
            },
            _onSocketChatError: (errorData: ErrorUpdate) => {
                handleSocketChatError(get, set, errorData);
            },
            _onSocketEmailConfirmationResult: (emailResult: EmailConfirmationResult) => {
                handleSocketEmailConfirmationResult(get, set, emailResult);
            },
            _onSocketConversationUpdatedAfterEdit: (payload: BackendConversationUpdatedAfterEditPayload) => {
                handleSocketConversationUpdatedAfterEdit(get, set, payload);
            },
        }),
        { name: "MessageStore" }
    )
);