// src/app/[locale]/chatbot/stores/messageStore/messageStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    MessageStoreState,
    MessageStoreActions,
    initialMessageStoreState,
    Part, UserFile, OriginalUserFileInfo,
    StatusUpdate, ChatUpdate, ResultUpdate, ErrorUpdate, EmailConfirmationResult,
    BackendConversationUpdatedAfterEditPayload, HistoryItem
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
import { useUiStore } from '../uiStore';

export const useMessageStore = create<MessageStoreState & MessageStoreActions>()(
    devtools(
        (set, get) => ({
            ...initialMessageStoreState,

            // ... (setters và các actions khác giữ nguyên) ...
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
            sendMessage: (
                partsForBackend: Part[],
                partsForDisplay: Part[], // <<< THÊM THAM SỐ
                userFilesForDisplayOptimistic?: UserFile[],
                originalUserFilesInfo?: OriginalUserFileInfo[]
            ) => {
                handleSendMessage(get, set, partsForBackend, partsForDisplay, userFilesForDisplayOptimistic, originalUserFilesInfo);
            },
            loadHistoryMessages: (historyItems: HistoryItem[]) => {
                handleLoadHistoryMessages(set, historyItems);
            },
            submitEditedMessage: (messageIdToEdit: string, newText: string) => {
                handleSubmitEditedMessage(get, set, messageIdToEdit, newText);
            },
            resetChatUIForNewConversation: (clearActiveIdInOtherStores = true) => {
                handleResetChatUIForNewConversation(get, set, clearActiveIdInOtherStores);
                useUiStore.getState().setShowConfirmationDialog(false);
            },
            clearAuthErrorMessages: () => {
                handleClearAuthErrorMessages(set);
            },

            // --- Socket event handlers calling handlers ---
            // ... (giữ nguyên)
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