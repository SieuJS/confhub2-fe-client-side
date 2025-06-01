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
} from './messageState';
import { useSettingsStore } from '../setttingsStore';
import { useSocketStore } from '../socketStore';
import { useUiStore } from '../uiStore';
import { useConversationStore } from '../conversationStore/conversationStore';
import { generateMessageId } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { mapBackendHistoryItemToFrontendChatMessage } from './messageMappers';
import { getPersonalizationData } from './messageSelectors';

type StoreGet = () => MessageStoreState & MessageStoreActions;
// ... (DevtoolsAction, StoreSet giữ nguyên) ...
interface DevtoolsAction {
    type: string;
    [key: string]: any;
    [key: number]: any;
    [key: symbol]: any;
}
type StoreSet = (
    partial: MessageStoreState | Partial<MessageStoreState> | ((state: MessageStoreState) => MessageStoreState | Partial<MessageStoreState>),
    replace?: false | undefined,
    action?: string | DevtoolsAction | undefined
) => void;


export const handleSendMessage = (
    get: StoreGet,
    set: StoreSet,
    partsForBackend: Part[], // <<< THAM SỐ MỚI
    partsForDisplay: Part[], // <<< THAM SỐ MỚI
    userFilesForDisplayOptimistic?: UserFile[],
    originalUserFilesInfo?: OriginalUserFileInfo[],
    pageContextUrl?: string // <<< THÊM MỚI

) => {
    const { addChatMessage, setLoadingState, animationControls, resetAwaitFlag, setPendingBotMessageId } = get();
    const { isStreamingEnabled, currentLanguage } = useSettingsStore.getState();
    const { hasFatalConnectionError } = useSocketStore.getState();
    const { handleError, hasFatalError: uiHasFatalError } = useUiStore.getState();
    const { activeConversationId } = useConversationStore.getState();

    // partsForBackend được dùng để kiểm tra có gì để gửi không
    if (partsForBackend.length === 0) {
        console.warn("[MessageStore] sendMessage called with empty partsForBackend.");
        setLoadingState({ isLoading: false, step: 'idle', message: '' });
        return;
    }
    // partsForDisplay có thể rỗng nếu user chỉ gửi @currentpage (không có query text)
    // nhưng vẫn phải có partsForBackend (chứa context)

    if (hasFatalConnectionError || uiHasFatalError) {
        handleError({ message: "Cannot send message: A critical error occurred.", type: 'error', step: 'send_message_fail_fatal' } as any, false, false);
        setLoadingState({ isLoading: false, step: 'idle', message: '' });
        return;
    }

    animationControls?.stopStreaming();
    resetAwaitFlag();
    setLoadingState({ isLoading: true, step: 'sending_to_bot', message: 'Sending...', agentId: undefined });

    // Sử dụng partsForDisplay để tạo text hiển thị trên UI
    const textContentFromDisplayParts = partsForDisplay.find(part => 'text' in part)?.text || '';
    const filesToDisplay = userFilesForDisplayOptimistic || [];

    const newUserMessage: ChatMessageType = {
        id: generateMessageId(),
        role: 'user',
        parts: partsForDisplay, // <<< SỬ DỤNG partsForDisplay CHO UI
        text: textContentFromDisplayParts, // Text từ partsForDisplay
        isUser: true,
        type: filesToDisplay.length > 0 ? 'multimodal' : 'text',
        timestamp: new Date().toISOString(),
        files: filesToDisplay.length > 0 ? filesToDisplay : undefined,
        // sources sẽ được thêm vào tin nhắn của model từ backend

    };
    addChatMessage(newUserMessage);
    const botPlaceholderId = `bot-pending-${generateMessageId()}`;
    setPendingBotMessageId(botPlaceholderId);

    const personalizationInfo = getPersonalizationData();

    const payloadForSocket: SendMessageData = {
        parts: partsForBackend, // <<< SỬ DỤNG partsForBackend CHO SOCKET
        isStreaming: isStreamingEnabled,
        language: currentLanguage.code as LanguageCode,
        conversationId: activeConversationId,
        frontendMessageId: newUserMessage.id, // ID của tin nhắn hiển thị trên UI
        personalizationData: personalizationInfo,
        originalUserFiles: originalUserFilesInfo,
        pageContextUrl: pageContextUrl, // <<< TRUYỀN URL

    };
       // Thêm log ở đây để kiểm tra payloadForSocket trước khi emit
    console.log('[MessageActionHandlers handleSendMessage] Payload for socket:', JSON.stringify(payloadForSocket, null, 2));
    useSocketStore.getState().emitSendMessage(payloadForSocket);
    
};

// ... (handleLoadHistoryMessages, handleSubmitEditedMessage, etc. giữ nguyên) ...
export const handleLoadHistoryMessages = (
    set: StoreSet,
    historyItems: HistoryItem[]
) => {
    const frontendMessages = historyItems
        .map(mapBackendHistoryItemToFrontendChatMessage)
        .filter(msg => msg !== null) as ChatMessageType[];

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
    const { setChatMessages, setLoadingState, animationControls, resetAwaitFlag, setPendingBotMessageId } = get();
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
        //
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