// src/app/[locale]/chatbot/stores/messageStore/socketEventHandlers.ts
import {
    MessageStoreState,
    MessageStoreActions,
    StatusUpdate,
    ChatUpdate,
    ResultUpdate,
    ErrorUpdate,
    EmailConfirmationResult,
    BackendConversationUpdatedAfterEditPayload,
    ChatMessageType,
    SourceItem

} from './messageState'; // Import from the new state file
import { useSettingsStore } from '../setttingsStore';
import { useUiStore } from '../uiStore';
import { useConversationStore } from '../conversationStore/conversationStore';
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { createMessagePayloadFromResult, mapBackendHistoryItemToFrontendChatMessage } from './messageMappers';
import { appConfig } from '@/src/middleware';
import { ConfirmSendEmailAction } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';


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


const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";

export const handleSocketStatusUpdate = (
    set: StoreSet,
    data: StatusUpdate
) => {
    const { agentId, step, message } = data;
    let displayMessage = message;
    if (agentId && agentId !== 'HostAgent') {
        displayMessage = `[${agentId}] ${message}`;
    }
    set(state => ({
        loadingState: { ...state.loadingState, isLoading: true, step: step, message: displayMessage, agentId: agentId }
    }), false, `_onSocketStatusUpdate/${agentId || 'unknown_agent'}/${step}`);
};

export const handleSocketChatUpdate = (
    get: StoreGet,
    set: StoreSet, // Added set for storeSetPendingBotMessageId
    update: ChatUpdate
) => {
    const {
        animationControls,
        isAwaitingFinalResultRef,
        addChatMessage,
        setLoadingState,
        pendingBotMessageId,
        chatMessages,
        // setPendingBotMessageId: storeSetPendingBotMessageId, // Use 'set' for this
        updateMessageById
    } = get();

    if (!animationControls) {
        console.warn("[MessageStore _onSocketChatUpdate] ChatUpdate received but no animationControls");
        return;
    }

    const currentStreamingIdByControls = animationControls.currentStreamingId;
    const currentAgentId = get().loadingState.agentId;
    let targetMessageId = pendingBotMessageId;

    if (!targetMessageId) {
        console.warn("[MessageStore _onSocketChatUpdate] Fallback: No pendingBotMessageId. Creating new one.");
        targetMessageId = `streaming-fallback-${generateMessageId()}`;
        // storeSetPendingBotMessageId(targetMessageId); // Replaced
        set({ pendingBotMessageId: targetMessageId }, false, 'setPendingBotMessageId/chatUpdateFallback');
    }

    const existingBotMessage = chatMessages.find(msg => msg.id === targetMessageId);

    if (!existingBotMessage) {
        addChatMessage({
            id: targetMessageId!, // targetMessageId is guaranteed to be string here
            role: 'model',
            parts: [{ text: '' }],
            text: '',
            isUser: false,
            type: 'text',
            thoughts: [],
            timestamp: new Date().toISOString()
        });
        const streamingMessage = currentAgentId && currentAgentId !== 'HostAgent' ? `[${currentAgentId}] Receiving...` : 'Receiving...';
        setLoadingState({ isLoading: true, step: 'streaming_response', message: streamingMessage, agentId: currentAgentId });
    }

    if (!currentStreamingIdByControls || currentStreamingIdByControls !== targetMessageId) {
        animationControls.startStreaming(targetMessageId!); // targetMessageId is guaranteed
    }
    if (!isAwaitingFinalResultRef.current) isAwaitingFinalResultRef.current = true;

    if (update.textChunk) animationControls.processChunk(update.textChunk);

    if (update.parts && update.parts.length > 0) {
        updateMessageById(targetMessageId!, prevMsg => { // targetMessageId is guaranteed
            let newCombinedParts = [...(prevMsg.parts || [])];
            let hasNewNonTextContent = false;
            update.parts!.forEach(newPart => {
                if (!newPart.text) {
                    newCombinedParts.push(newPart);
                    hasNewNonTextContent = true;
                }
            });
            const newType = hasNewNonTextContent ? 'multimodal' : prevMsg.type;
            return { parts: newCombinedParts, type: newType };
        });
    }
};

export const handleSocketChatResult = (
    get: StoreGet,
    set: StoreSet, // Added set for storeSetPendingBotMessageId
    result: ResultUpdate // ResultUpdate đã có sources?: SourceItem[] (từ backend)
) => {
    const {
        animationControls, setLoadingState, updateMessageById, addChatMessage,
        pendingBotMessageId,
        // setPendingBotMessageId: storeSetPendingBotMessageId, // Use 'set'
        chatMessages, resetAwaitFlag,
    } = get();
    const { currentLanguage } = useSettingsStore.getState();
    const currentLocale = currentLanguage.code;
    const { setShowConfirmationDialog } = useUiStore.getState();

    animationControls?.completeStream();

    const targetMessageId = pendingBotMessageId || result.id || `result-${generateMessageId()}`;
    const existingMessageForThoughts = chatMessages.find(msg => msg.id === targetMessageId);

    // createMessagePayloadFromResult cần được cập nhật để xử lý `result.sources`
    // và trả về một payload có trường `sources` cho ChatMessageType
    const payloadFromFn = createMessagePayloadFromResult(result, existingMessageForThoughts?.thoughts);
    // payloadFromFn bây giờ sẽ có dạng:
    // { text?: string, parts?: Part[], thoughts?: ThoughtStep[], action?: FrontendAction, sources?: SourceLink[], type: MessageType }

    if (existingMessageForThoughts) {
        updateMessageById(targetMessageId, (prevMsg) => {
            const updatedPayload = {
                ...payloadFromFn, // payloadFromFn đã chứa sources
                role: 'model' as const,
                isUser: false
            };
            // Nếu backend gửi ID mới cho tin nhắn này (ví dụ, sau khi lưu DB), cập nhật ID
            if (result.id && result.id !== targetMessageId) {
                return { ...updatedPayload, id: result.id };
            }
            return updatedPayload;
        });
    } else {
        const finalId = result.id || targetMessageId;
        // Đảm bảo ChatMessageType được tạo đúng với các trường từ payloadFromFn
        const newBotMessage: ChatMessageType = {
            id: finalId,
            role: 'model',
            isUser: false,
            timestamp: new Date().toISOString(), // Thêm timestamp nếu payloadFromFn không có
            text: payloadFromFn.text,
            parts: payloadFromFn.parts || (payloadFromFn.text ? [{ text: payloadFromFn.text }] : []),
            type: payloadFromFn.type,
            thoughts: payloadFromFn.thoughts,
            action: payloadFromFn.action,
            sources: payloadFromFn.sources, // <<< GÁN SOURCES
        };
        addChatMessage(newBotMessage);
    }
    resetAwaitFlag();
    setLoadingState({ isLoading: false, step: 'result_received', message: '', agentId: undefined });
    // storeSetPendingBotMessageId(null); // Replaced
    set({ pendingBotMessageId: null }, false, 'setPendingBotMessageId/chatResult');


    const finalAction = payloadFromFn.action;
    if (finalAction?.type === 'navigate' && finalAction.url) {
        const finalUrl = constructNavigationUrl(BASE_WEB_URL, currentLocale, finalAction.url);
        openUrlInNewTab(finalUrl);
    } else if (finalAction?.type === 'confirmEmailSend' && finalAction.payload) {
        setShowConfirmationDialog(true, finalAction.payload as ConfirmSendEmailAction);
    }
};

export const handleSocketChatError = (
    get: StoreGet,
    set: StoreSet, // Added set for storeSetPendingBotMessageId and currentStoreSetChatMessages
    errorData: ErrorUpdate
) => {
    const {
        animationControls, resetAwaitFlag,
        // setChatMessages: currentStoreSetChatMessages, // Use 'set'
        setLoadingState,
        // setPendingBotMessageId: storeSetPendingBotMessageId // Use 'set'
    } = get();
    const { activeConversationId, setActiveConversationId, setIsHistoryLoaded, setIsLoadingHistory } = useConversationStore.getState();
    const { handleError } = useUiStore.getState();

    console.error("[MessageStore _onSocketChatError] Event: Chat Error received from server:", errorData);
    resetAwaitFlag();
    animationControls?.stopStreaming();
    // storeSetPendingBotMessageId(null); // Replaced
    set({ pendingBotMessageId: null }, false, 'setPendingBotMessageId/chatError');


    const { step: errorStep, code: errorCode, details, message } = errorData;
    const historyLoadErrorSteps = ['history_not_found_load', 'history_load_fail_server', 'auth_required_load', 'invalid_request_load'];
    const isRelatedToActiveConv = (errorCode === 'CONVERSATION_NOT_FOUND' || errorCode === 'ACCESS_DENIED') && details?.conversationId === activeConversationId;

    if (historyLoadErrorSteps.includes(errorStep || '') || isRelatedToActiveConv) {
        setActiveConversationId(null, { skipUiReset: true });
        // currentStoreSetChatMessages(() => []); // Replaced
        set({ chatMessages: [] }, false, 'setChatMessages/chatErrorClear');
        setIsHistoryLoaded(false);
        setIsLoadingHistory(false);
    }
    const isFatal = errorCode === 'FATAL_SERVER_ERROR' || errorCode === 'AUTH_REQUIRED' || errorCode === 'ACCESS_DENIED';
    handleError(errorData, true, isFatal);
    setLoadingState({ isLoading: false, step: errorData.step || 'error_received', message: errorData.message, agentId: undefined });
};

export const handleSocketEmailConfirmationResult = (
    get: StoreGet,
    set: StoreSet, // Added for setLoadingState
    emailResult: EmailConfirmationResult
) => {
    const { addChatMessage } = get(); // setLoadingState will be called via set
    const { confirmationData, setShowConfirmationDialog } = useUiStore.getState();

    if (confirmationData && emailResult.confirmationId === confirmationData.confirmationId) {
        setShowConfirmationDialog(false);
    }
    addChatMessage({
        id: generateMessageId(),
        role: 'model',
        parts: [{ text: emailResult.message }],
        text: emailResult.message,
        isUser: false,
        type: emailResult.status === 'success' ? 'text' : 'warning',
        timestamp: new Date().toISOString()
    });
    // setLoadingState({ isLoading: false, step: `email_${emailResult.status}`, message: '', agentId: undefined }); // Replaced
    set({ loadingState: { isLoading: false, step: `email_${emailResult.status}`, message: '', agentId: undefined } }, false, `setLoadingState/emailConfirmation`);
};


export const handleSocketConversationUpdatedAfterEdit = (
    get: StoreGet,
    set: StoreSet,
    payload: BackendConversationUpdatedAfterEditPayload
) => {
    const { editedUserMessage: backendUserMessage, newBotMessage: backendBotMessage, conversationId } = payload;
    const { activeConversationId } = useConversationStore.getState();
    const { setLoadingState } = get();

    if (activeConversationId !== conversationId) {
        console.warn('[MessageStore _onSocketConvUpdatedAfterEdit] Received update for a non-active conversation. Ignoring.');
        return;
    }

    const originalEditingId = get().editingMessageId;
    const currentPendingBotId = get().pendingBotMessageId;

    const mappedEditedUserMessage = mapBackendHistoryItemToFrontendChatMessage(backendUserMessage);
    // mapBackendHistoryItemToFrontendChatMessage cần được cập nhật để map cả sources
    const mappedNewBotMessageDataOnly = backendBotMessage ? mapBackendHistoryItemToFrontendChatMessage(backendBotMessage) : undefined;
    // mappedNewBotMessageDataOnly bây giờ sẽ có dạng ChatMessageType (có thể có sources)

    // If the edited user message itself becomes non-displayable (highly unlikely for user edits, but for completeness)
    if (!mappedEditedUserMessage) {
        console.warn(`[MessageStore _onSocketConvUpdatedAfterEdit] Edited user message (ID: ${backendUserMessage.uuid}) became non-displayable after mapping. This is unusual. Aborting update for this message.`);
        // Decide on recovery strategy: maybe remove it from chatMessages? Or just log and do nothing further with it.
        // For now, let's not proceed with updating this specific message if it's null.
        // The rest of the logic might still need to clean up the bot placeholder.
    }


    console.log(`[MessageStore _onSocketConvUpdatedAfterEdit] Definitive. UserMsg ID (backend): ${mappedEditedUserMessage?.id}. Original Edit ID (state): ${originalEditingId}. BotMsg ID (backend): ${mappedNewBotMessageDataOnly?.id}. Pending Bot ID (state): ${currentPendingBotId}`);

    set(state => {
        let chatMessages = [...state.chatMessages];

        if (mappedEditedUserMessage) { // Only proceed if user message is displayable
            const userMessageIndex = chatMessages.findIndex(msg => msg.id === originalEditingId);

            if (userMessageIndex !== -1) {
                chatMessages[userMessageIndex] = mappedEditedUserMessage; // mappedEditedUserMessage là ChatMessageType đầy đủ
            } else {
                console.warn(`[MessageStore _onSocketConvUpdatedAfterEdit] User message (ID: ${originalEditingId}) not found for definitive update.`);
            }
        } else {
            const userMessageIndex = chatMessages.findIndex(msg => msg.id === originalEditingId);
            if (userMessageIndex !== -1) {
                console.log(`[MessageStore _onSocketConvUpdatedAfterEdit] Original user message (ID: ${originalEditingId}) became non-displayable. Removing it.`);
                chatMessages.splice(userMessageIndex, 1);
            }
        }

        const botPlaceholderBeingFinalized = currentPendingBotId ? chatMessages.find(msg => msg.id === currentPendingBotId) : undefined;

        if (mappedNewBotMessageDataOnly) { // If bot message is displayable
            let targetBotMsgForUpdate: ChatMessageType | undefined = undefined;
            let targetBotMsgIndex = -1;

            if (botPlaceholderBeingFinalized) {
                targetBotMsgForUpdate = botPlaceholderBeingFinalized;
                targetBotMsgIndex = chatMessages.findIndex(msg => msg.id === targetBotMsgForUpdate!.id);
            } else {
                // Nếu không có placeholder, thử tìm bằng ID từ backend (trường hợp không streaming edit)
                targetBotMsgIndex = chatMessages.findIndex(msg => msg.id === mappedNewBotMessageDataOnly.id);
                if (targetBotMsgIndex !== -1) {
                    targetBotMsgForUpdate = chatMessages[targetBotMsgIndex];
                }
            }
            if (targetBotMsgForUpdate && targetBotMsgIndex !== -1) {
                // Cập nhật tin nhắn bot hiện có, giữ lại text/thoughts nếu đang stream, nhưng ghi đè sources
                chatMessages[targetBotMsgIndex] = {
                    ...mappedNewBotMessageDataOnly, // Chứa parts, type, sources từ backend
                    id: mappedNewBotMessageDataOnly.id || targetBotMsgForUpdate.id, // Ưu tiên ID từ backend
                    text: targetBotMsgForUpdate.text, // Giữ lại text đang stream nếu có
                    thoughts: targetBotMsgForUpdate.thoughts, // Giữ lại thoughts đang stream nếu có
                    // sources đã có trong mappedNewBotMessageDataOnly
                };
                console.log(`[MessageStore _onSocketConvUpdatedAfterEdit] Updated/Finalized bot message (ID: ${chatMessages[targetBotMsgIndex].id}) preserving thoughts.`);
            } else {
                console.warn(`[MessageStore _onSocketConvUpdatedAfterEdit] Bot message (Placeholder ID: ${currentPendingBotId}, Backend ID: ${mappedNewBotMessageDataOnly.id}) not found. Inserting new.`);
                // Find the index of the (potentially updated or removed) user message
                const finalUserMsgIdx = mappedEditedUserMessage ? chatMessages.findIndex(m => m.id === mappedEditedUserMessage.id) : -1;
                 const newBotMsgWithDefaults: ChatMessageType = {
                    ...mappedNewBotMessageDataOnly, // Chứa parts, type, sources từ backend
                    thoughts: undefined, // Không có thoughts khi chèn mới
                    timestamp: mappedNewBotMessageDataOnly.timestamp || new Date().toISOString(), // Đảm bảo có timestamp
                };
                if (finalUserMsgIdx !== -1) {
                    chatMessages.splice(finalUserMsgIdx + 1, 0, newBotMsgWithDefaults);
                } else {
                    chatMessages.push(newBotMsgWithDefaults);
                }
            }
         } else { 
            if (botPlaceholderBeingFinalized) {
                const idxToRemove = chatMessages.findIndex(msg => msg.id === botPlaceholderBeingFinalized.id);
                if (idxToRemove !== -1) {
                    console.log(`[MessageStore _onSocketConvUpdatedAfterEdit] No new bot message or bot message non-displayable. Removing placeholder (ID: ${botPlaceholderBeingFinalized.id}).`);
                    chatMessages.splice(idxToRemove, 1);
                }
            }
        }

        // Final cleanup: ensure only the edited user message (if displayable) and its subsequent bot message (if displayable) remain after the original edit point.
         if (mappedEditedUserMessage) {
            const finalUserMsgIdx = chatMessages.findIndex(m => m.id === mappedEditedUserMessage.id);
            if (finalUserMsgIdx !== -1) {
                let cleanedMessages = chatMessages.slice(0, finalUserMsgIdx + 1);
                if (mappedNewBotMessageDataOnly) {
                    const finalBotMsgInArray = chatMessages.find(m => m.id === mappedNewBotMessageDataOnly.id);
                    if (finalBotMsgInArray) {
                        cleanedMessages.push(finalBotMsgInArray);
                    }
                }
                chatMessages = cleanedMessages;
            }
        }

        return {
            chatMessages,
            pendingBotMessageId: null,
        };
    }, false, '_onSocketConversationUpdatedAfterEdit/applyAndCleanDefinitive');

    setLoadingState({ isLoading: false, step: 'conversation_updated_after_edit', message: '', agentId: undefined });
    set({ editingMessageId: null }, false, 'setEditingMessageId/convUpdated');
};
