// src/app/[locale]/chatbot/stores/messageStore/messageActionHandlers.ts
import {
    MessageStoreState,
    MessageStoreActions,
    Part,
    UserFile,
    OriginalUserFileInfo,
    HistoryItem,
    ChatMessageType,
    SendMessageData,
    LanguageCode,
    EditUserMessagePayload,
    PersonalizationPayload
} from './messageState'; // Import from the new state file
import { useSettingsStore } from '../setttingsStore';
import { useSocketStore } from '../socketStore';
import { useUiStore } from '../uiStore';
import { useConversationStore } from '../conversationStore/conversationStore';
import { generateMessageId } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { mapBackendHistoryItemToFrontendChatMessage } from './messageMappers';
import { getPersonalizationData } from './messageSelectors';

// StoreGet remains the same
type StoreGet = () => MessageStoreState & MessageStoreActions;

// Updated DevtoolsAction to be more compatible
interface DevtoolsAction {
    type: string;
    [key: string]: any;
    [key: number]: any; // Add number index signature
    // We could add [key: symbol]: any; but it's often less common for plain action objects
    // and might not be strictly necessary if the underlying type is just `any` for extra props.
    // Let's try without it first, as the error specifically mentioned 'symbol' was missing
    // from *my* DevtoolsAction when comparing to the target.
    // The target type is `{ [x: string]: unknown; [x: number]: unknown; [x: symbol]: unknown; type: string; }`
    // So, to be fully compatible, we should add it.
    [key: symbol]: any; // Add symbol index signature
}

// Updated StoreSet
type StoreSet = (
    partial: MessageStoreState | Partial<MessageStoreState> | ((state: MessageStoreState) => MessageStoreState | Partial<MessageStoreState>),
    replace?: false | undefined,
    action?: string | DevtoolsAction | undefined
) => void;


export const handleSendMessage = (
    get: StoreGet,
    set: StoreSet,
    parts: Part[],
    userFilesForDisplayOptimistic?: UserFile[],
    originalUserFilesInfo?: OriginalUserFileInfo[]
) => {
    const { addChatMessage, setLoadingState, animationControls, resetAwaitFlag, setPendingBotMessageId } = get();
    const { isStreamingEnabled, currentLanguage } = useSettingsStore.getState();
    const { hasFatalConnectionError } = useSocketStore.getState();
    const { handleError, hasFatalError: uiHasFatalError } = useUiStore.getState();
    const { activeConversationId } = useConversationStore.getState();

    if (parts.length === 0) {
        console.warn("[MessageStore] sendMessage called with empty parts.");
        setLoadingState({ isLoading: false, step: 'idle', message: '' });
        return;
    }

    if (hasFatalConnectionError || uiHasFatalError) {
        handleError({ message: "Cannot send message: A critical error occurred.", type: 'error', step: 'send_message_fail_fatal' } as any, false, false);
        setLoadingState({ isLoading: false, step: 'idle', message: '' });
        return;
    }

    animationControls?.stopStreaming();
    resetAwaitFlag();
    setLoadingState({ isLoading: true, step: 'sending_to_bot', message: 'Sending...', agentId: undefined });

    const textContentFromParts = parts.find(part => 'text' in part)?.text || '';
    const filesToDisplay = userFilesForDisplayOptimistic || [];

    const newUserMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'user',
        parts: parts,
        text: textContentFromParts,
        isUser: true,
        type: filesToDisplay.length > 0 ? 'multimodal' : 'text',
        timestamp: new Date().toISOString(),
        files: filesToDisplay.length > 0 ? filesToDisplay : undefined,
    };
    addChatMessage(newUserMessage);
    const botPlaceholderId = `bot-pending-${generateMessageId()}`;
    setPendingBotMessageId(botPlaceholderId);

    const personalizationInfo = getPersonalizationData();

    const payloadForSocket: SendMessageData = {
        parts: parts,
        isStreaming: isStreamingEnabled,
        language: currentLanguage.code as LanguageCode,
        conversationId: activeConversationId,
        frontendMessageId: newUserMessage.id,
        personalizationData: personalizationInfo,
        originalUserFiles: originalUserFilesInfo,
    };
    useSocketStore.getState().emitSendMessage(payloadForSocket);
};

export const handleLoadHistoryMessages = (
    set: StoreSet,
    historyItems: HistoryItem[]
) => {
    const frontendMessages = historyItems
        .map(mapBackendHistoryItemToFrontendChatMessage)
        .filter(msg => msg !== null) as ChatMessageType[]; // Filter out nulls and assert type

    set({
        chatMessages: frontendMessages,
        editingMessageId: null,
        pendingBotMessageId: null,
        loadingState: { isLoading: false, step: 'history_loaded', message: '' }
    }, false, 'loadHistoryMessages');
};

export const handleSubmitEditedMessage = (
    get: StoreGet,
    set: StoreSet,
    messageIdToEdit: string,
    newText: string
) => {
    const { setChatMessages, setLoadingState, animationControls, resetAwaitFlag, setPendingBotMessageId } = get(); // removed storeSetEditingMessageId as it's handled by setEditingMessageId in main store
    const { currentLanguage } = useSettingsStore.getState();
    const { activeConversationId } = useConversationStore.getState();

    if (!activeConversationId) {
        console.warn("[MessageStore submitEditedMessage] No active conversation ID.");
        return;
    }
    const trimmedNewText = newText.trim();
    if (!trimmedNewText) {
        console.warn("[MessageStore submitEditedMessage] New text is empty after trimming.");
        return;
    }

    console.log(`[MessageStore submitEditedMessage] Submitting edit for message ID: ${messageIdToEdit} in conv: ${activeConversationId}`);

    animationControls?.stopStreaming();
    resetAwaitFlag();

    const newBotResponsePlaceholderId = `bot-edit-resp-${generateMessageId()}`;

    setChatMessages(currentMessages => {
        const userMessageIndex = currentMessages.findIndex(msg => msg.id === messageIdToEdit);
        if (userMessageIndex === -1) {
            console.warn(`[MessageStore submitEditedMessage] Message to edit (ID: ${messageIdToEdit}) not found for optimistic update.`);
            return currentMessages;
        }

        const originalMessage = currentMessages[userMessageIndex];
        const updatedUserMessage: ChatMessageType = {
            ...originalMessage,
            id: messageIdToEdit,
            role: 'user',
            parts: [{ text: trimmedNewText }],
            text: trimmedNewText,
            isUser: true,
            timestamp: new Date().toISOString(),
            type: 'text',
            action: undefined,
            location: undefined,
            thoughts: undefined,
        };

        let newMessagesList = currentMessages.slice(0, userMessageIndex);
        newMessagesList.push(updatedUserMessage);

        const botPlaceholder: ChatMessageType = {
            id: newBotResponsePlaceholderId,
            role: 'model',
            parts: [{ text: '' }],
            text: '',
            isUser: false,
            type: 'text',
            timestamp: new Date().toISOString(),
            thoughts: [],
        };
        newMessagesList.push(botPlaceholder);
        console.log(`[MessageStore submitEditedMessage] Optimistic update: UserMsg (ID ${updatedUserMessage.id}) updated, BotPlaceholder (ID ${botPlaceholder.id}) added. New list length: ${newMessagesList.length}`);
        return newMessagesList;
    });

    setPendingBotMessageId(newBotResponsePlaceholderId);
    setLoadingState({ isLoading: true, step: 'updating_message', message: 'Updating message...', agentId: undefined });

    const personalizationInfo = getPersonalizationData();
    const payload: EditUserMessagePayload & { personalizationData?: PersonalizationPayload | null } = {
        conversationId: activeConversationId,
        messageIdToEdit: messageIdToEdit,
        newText: trimmedNewText,
        language: currentLanguage.code,
        personalizationData: personalizationInfo,
    };
    useSocketStore.getState().emitEditUserMessage(payload);
};

export const handleResetChatUIForNewConversation = (
    get: StoreGet,
    set: StoreSet,
    clearActiveIdInOtherStores = true
) => {
    set({
        chatMessages: [],
        loadingState: { isLoading: false, step: 'idle', message: '', agentId: undefined },
        pendingBotMessageId: null,
        editingMessageId: null,
    }, false, 'resetChatUIForNewConversation/messages');
    get().animationControls?.stopStreaming();
    get().resetAwaitFlag();
    if (clearActiveIdInOtherStores) {
        // Potentially clear active conversation ID in conversationStore if needed
        // This part of logic might need adjustment based on how conversationStore handles it
        // For now, assuming it's handled or not strictly needed by this store directly.
    }
    useUiStore.getState().setShowConfirmationDialog(false);
};

export const handleClearAuthErrorMessages = (
    set: StoreSet
) => {
    console.log("[MessageStore] Clearing authentication error messages from chat.");
    set(state => ({
        chatMessages: state.chatMessages.filter(msg =>
            !(msg.type === 'error' && msg.errorCode === 'AUTH_REQUIRED')
        )
    }), false, 'clearAuthErrorMessages');
};