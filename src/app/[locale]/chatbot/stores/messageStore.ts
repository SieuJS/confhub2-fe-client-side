// src/stores/messageStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    ChatMessageType,
    LoadingState,
    ThoughtStep,
    ErrorUpdate,
    ChatUpdate,
    ResultUpdate,
    EmailConfirmationResult,
    ConfirmSendEmailAction,
    StatusUpdate,
    FrontendAction,
    EditUserMessagePayload, // <<< NEW
    ConversationUpdatedAfterEditPayload, // <<< NEW
    ItemFollowStatusUpdatePayload
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { StreamingTextAnimationControls } from '@/src/hooks/regularchat/useStreamingTextAnimation';
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { appConfig } from '@/src/middleware';
import { useSettingsStore } from './setttingsStore';
import { useSocketStore } from './socketStore';
import { useUiStore } from './uiStore';
import { useConversationStore } from './conversationStore';

const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";

export interface EditingMessageState {
    id: string;
    originalText: string;
}

export interface MessageStoreState {
    chatMessages: ChatMessageType[];
    loadingState: LoadingState;
    animationControls: StreamingTextAnimationControls | null;
    isAwaitingFinalResultRef: React.MutableRefObject<boolean>;
    pendingBotMessageId: string | null;
    editingMessageId: string | null; // ID của tin nhắn đang được chỉnh sửa, null nếu không có
}


export interface MessageStoreActions {
    setChatMessages: (newMessagesOrUpdater: ChatMessageType[] | ((prev: ChatMessageType[]) => ChatMessageType[])) => void;
    addChatMessage: (message: ChatMessageType) => void;
    updateMessageById: (messageId: string, updates: Partial<ChatMessageType> | ((prev: ChatMessageType) => Partial<ChatMessageType>)) => void;
    setLoadingState: (loadingState: LoadingState) => void;
    setAnimationControls: (controls: StreamingTextAnimationControls | null) => void;
    resetAwaitFlag: () => void;
    setPendingBotMessageId: (id: string | null) => void;
    sendMessage: (userInput: string) => void;
    resetChatUIForNewConversation: (clearActiveIdInOtherStores?: boolean) => void;
    setEditingMessage: (editingState: EditingMessageState | null) => void; // <<< NEW
    submitEditedMessage: (messageIdToEdit: string, newText: string) => void; // <<< THAY ĐỔI SIGNATURE
    setEditingMessageId: (messageId: string | null) => void;

    clearAuthErrorMessages: () => void; // <<<< THÊM ACTION MỚI

    _onSocketStatusUpdate: (data: StatusUpdate) => void;
    _onSocketChatUpdate: (data: ChatUpdate) => void;
    _onSocketChatResult: (data: ResultUpdate) => void;
    _onSocketChatError: (errorData: ErrorUpdate) => void;
    _onSocketEmailConfirmationResult: (result: EmailConfirmationResult) => void;
    // Socket event handler
    _onSocketConversationUpdatedAfterEdit: (payload: ConversationUpdatedAfterEditPayload) => void;
}

const initialMessageStoreState: MessageStoreState = {
    chatMessages: [],
    loadingState: { isLoading: false, step: 'idle', message: '', agentId: undefined },
    animationControls: null,
    isAwaitingFinalResultRef: { current: false },
    pendingBotMessageId: null,
    editingMessageId: null,

};

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
            resetAwaitFlag: () => { // Đảm bảo hàm này được định nghĩa đúng
                get().isAwaitingFinalResultRef.current = false;
            },
            setPendingBotMessageId: (id) => set({ pendingBotMessageId: id }, false, 'setPendingBotMessageId'),

            setEditingMessageId: (messageId) => set({ editingMessageId: messageId }, false, `setEditingMessageId/${messageId}`),


            resetChatUIForNewConversation: (clearActiveIdInOtherStores = true) => {
                set({
                    chatMessages: [],
                    loadingState: { isLoading: false, step: 'idle', message: '', agentId: undefined },
                    pendingBotMessageId: null,
                    editingMessageId: null, // <<< RESET Ở ĐÂY

                }, false, 'resetChatUIForNewConversation/messages');
                get().animationControls?.stopStreaming();
                get().resetAwaitFlag();
                if (clearActiveIdInOtherStores) {
                    // useConversationStore.getState().setActiveConversationId(null); // This might be handled elsewhere
                }
                useUiStore.getState().setShowConfirmationDialog(false);
            },


            clearAuthErrorMessages: () => {
                console.log("[MessageStore] Clearing authentication error messages from chat.");
                set(state => ({
                    chatMessages: state.chatMessages.filter(msg =>
                        !(msg.type === 'error' && msg.errorCode === 'AUTH_REQUIRED')
                    )
                }), false, 'clearAuthErrorMessages');
            },


            submitEditedMessage: (messageIdToEdit, newText) => {
                const {
                    setChatMessages, // <<< Get setChatMessages
                    setLoadingState,
                    animationControls,
                    resetAwaitFlag,
                    setPendingBotMessageId, // <<< Get setPendingBotMessageId
                    // chatMessages, // We'll get this from the updater function
                } = get();
                const { currentLanguage } = useSettingsStore.getState();
                const { activeConversationId } = useConversationStore.getState();

                if (!activeConversationId) {
                    console.warn('[MessageStore] submitEditedMessage called without an active conversation.');
                    // Optionally, show an error to the user
                    // get()._onSocketChatError({ type: 'error', message: 'Cannot edit message: No active conversation.' });
                    return;
                }
                const trimmedNewText = newText.trim();
                if (!trimmedNewText) {
                    console.warn('[MessageStore] submitEditedMessage called with empty new text.');
                    // Optionally, show an error or revert edit UI
                    // get().setEditingMessageId(null); // Revert UI if edit box is open
                    return;
                }

                animationControls?.stopStreaming();
                resetAwaitFlag(); // Reset any pending streaming state

                // --- Optimistic UI Update ---
                const newBotResponsePlaceholderId = `bot-edit-resp-${generateMessageId()}`;

                setChatMessages(currentMessages => {
                    const userMessageIndex = currentMessages.findIndex(msg => msg.id === messageIdToEdit);
                    if (userMessageIndex === -1) {
                        console.warn(`[MessageStore submitEditedMessage] Original user message ${messageIdToEdit} not found for optimistic update.`);
                        // Cannot proceed with optimistic update if message isn't found
                        // Might need to emit an error or handle this state.
                        // For now, let backend handle it, but UI won't be optimistic.
                        return currentMessages;
                    }

                    // 1. Create the updated user message object
                    const updatedUserMessage: ChatMessageType = {
                        ...currentMessages[userMessageIndex],
                        message: trimmedNewText,
                        timestamp: new Date().toISOString(), // Update timestamp
                    };

                    // 2. Slice messages up to and including the user's message, then add the updated user message
                    // This effectively removes any messages after the user's message (i.e., the old bot response).
                    let newMessagesList = currentMessages.slice(0, userMessageIndex);
                    newMessagesList.push(updatedUserMessage);

                    // 3. Add a placeholder for the new bot response
                    const botPlaceholder: ChatMessageType = {
                        id: newBotResponsePlaceholderId, // Use the generated placeholder ID
                        message: '', // Empty initially, will be filled by streaming or final result
                        isUser: false,
                        type: 'text', // Default type
                        timestamp: new Date().toISOString(),
                        thoughts: [], // Initialize empty thoughts
                    };
                    newMessagesList.push(botPlaceholder);

                    console.log(`[MessageStore submitEditedMessage] Optimistically updated UI. User msg ID: ${messageIdToEdit}, New bot placeholder ID: ${newBotResponsePlaceholderId}`);
                    return newMessagesList;
                });
                // --- End Optimistic UI Update ---

                setPendingBotMessageId(newBotResponsePlaceholderId); // Set this so chat_update/chat_result stream into it
                setLoadingState({ isLoading: true, step: 'updating_message', message: 'Updating message...', agentId: undefined });
                // get().setEditingMessageId(null); // Clear editing mode UI state

                console.log(`[MessageStore submitEditedMessage] Preparing to emit 'edit_user_message'. MessageIDToEdit: "${messageIdToEdit}", NewText: "${trimmedNewText}"`);


                const payload: EditUserMessagePayload = {
                    conversationId: activeConversationId,
                    messageIdToEdit: messageIdToEdit, // This is the original ID of the user message
                    newText: trimmedNewText,
                    language: currentLanguage.code,
                };
                useSocketStore.getState().emitEditUserMessage(payload);
            },


            sendMessage: (userInput) => {
                const { addChatMessage, setLoadingState, animationControls, resetAwaitFlag, setPendingBotMessageId } = get();
                const { isStreamingEnabled, currentLanguage } = useSettingsStore.getState();
                const { hasFatalConnectionError } = useSocketStore.getState();
                const { handleError, hasFatalError: uiHasFatalError } = useUiStore.getState();
                const { activeConversationId } = useConversationStore.getState();

                const trimmedMessage = userInput.trim();
                if (!trimmedMessage) return;

                if (hasFatalConnectionError || uiHasFatalError) {
                    handleError({ message: "Cannot send message: A critical error occurred.", type: 'error', step: 'send_message_fail_fatal' } as any, false, false);
                    return;
                }

                animationControls?.stopStreaming();
                resetAwaitFlag();
                setLoadingState({ isLoading: true, step: 'sending', message: 'Sending...', agentId: undefined });

                const newUserMessage: ChatMessageType = {
                    id: generateMessageId(), message: trimmedMessage, isUser: true, type: 'text', timestamp: new Date().toISOString(),
                };
                addChatMessage(newUserMessage);

                const botPlaceholderId = `bot-pending-${generateMessageId()}`;
                setPendingBotMessageId(botPlaceholderId);

                useSocketStore.getState().emitSendMessage({
                    userInput: trimmedMessage,
                    isStreaming: isStreamingEnabled,
                    language: currentLanguage.code,
                    conversationId: activeConversationId,
                    frontendMessageId: newUserMessage.id,
                });
            },

            _onSocketConversationUpdatedAfterEdit: (payload) => {
                const { editedUserMessage, newBotMessage, conversationId } = payload;
                const { activeConversationId } = useConversationStore.getState();
                const { setLoadingState, setPendingBotMessageId, resetAwaitFlag, animationControls } = get();

                if (activeConversationId !== conversationId) {
                    console.warn('[MessageStore] Received conversation_updated_after_edit for a non-active conversation. Ignoring.');
                    return;
                }

                // animationControls?.stopStreaming(); // Có thể không cần nếu _onSocketChatResult đã stop
                // resetAwaitFlag(); // Có thể không cần nếu _onSocketChatResult đã reset
                // setPendingBotMessageId(null); // _onSocketChatResult đã set

                console.log(`[MessageStore _onSocketConversationUpdatedAfterEdit] Processing update for conv: ${conversationId}. Edited User Msg ID: ${editedUserMessage.id}, New Bot Msg ID: ${newBotMessage?.id}`);

                set(state => {
                    let currentMessages = [...state.chatMessages]; // Tạo bản sao để thay đổi
                    console.log(`[MessageStore _onSocketConversationUpdatedAfterEdit] State before:`, currentMessages.map(m => ({ id: m.id, text: m.message.substring(0, 15), thoughts: !!m.thoughts, isUser: m.isUser })));

                    const userMessageIndex = currentMessages.findIndex(msg => msg.id === editedUserMessage.id);

                    if (userMessageIndex === -1) {
                        console.warn(`[MessageStore _onSocketConversationUpdatedAfterEdit] Original user message ${editedUserMessage.id} not found. Appending.`);
                        if (!currentMessages.find(m => m.id === editedUserMessage.id)) {
                            currentMessages.push(editedUserMessage);
                        }
                        if (newBotMessage && newBotMessage.id && !currentMessages.find(m => m.id === newBotMessage.id)) {
                            currentMessages.push(newBotMessage); // newBotMessage này không có thoughts
                        }
                        return { chatMessages: currentMessages };
                    }

                    // Cập nhật user message
                    currentMessages[userMessageIndex] = {
                        ...currentMessages[userMessageIndex],
                        ...editedUserMessage // editedUserMessage từ payload không có thoughts
                    };

                    // Xử lý bot message
                    if (newBotMessage && newBotMessage.id) {
                        const existingBotMessageIndex = currentMessages.findIndex(msg => msg.id === newBotMessage.id);

                        if (existingBotMessageIndex !== -1) {
                            console.log(`[MessageStore _onSocketConversationUpdatedAfterEdit] Bot message ${newBotMessage.id} (from edit context) already exists. Merging, preserving existing thoughts.`);
                            const existingBotMsg = currentMessages[existingBotMessageIndex];
                            currentMessages[existingBotMessageIndex] = {
                                ...existingBotMsg, // Lấy message hiện tại (có thể đã có thoughts từ _onSocketChatResult)
                                ...newBotMessage,  // Ghi đè các trường từ payload (message, type, timestamp,...)
                                thoughts: existingBotMsg.thoughts || newBotMessage.thoughts, // Ưu tiên thoughts đã có, nếu không thì lấy từ payload (thường là undefined)
                            };
                        } else {
                            // Trường hợp này ít xảy ra nếu _onSocketChatResult luôn chạy trước cho streaming
                            // Nếu bot message chưa tồn tại, thêm nó vào (sẽ không có thoughts nếu payload không có)
                            console.log(`[MessageStore _onSocketConversationUpdatedAfterEdit] Adding new bot message ${newBotMessage.id} (from edit context, no prior _onSocketChatResult).`);
                            currentMessages.push(newBotMessage);
                        }
                    } else if (newBotMessage && !newBotMessage.id) {
                        console.warn(`[MessageStore _onSocketConversationUpdatedAfterEdit] New bot message in payload but without an ID.`);
                    }

                    // Đảm bảo user message và bot message mới (nếu có) là hai tin nhắn cuối cùng theo đúng thứ tự
                    // Bằng cách loại bỏ chúng (nếu có) và thêm lại vào cuối
                    const finalMessages = currentMessages.filter(
                        msg => msg.id !== editedUserMessage.id && (!newBotMessage || msg.id !== newBotMessage.id)
                    );
                    finalMessages.push(currentMessages[userMessageIndex]); // Thêm lại user message đã cập nhật
                    if (newBotMessage && newBotMessage.id) {
                        const finalBotMsg = currentMessages.find(msg => msg.id === newBotMessage.id);
                        if (finalBotMsg) {
                            finalMessages.push(finalBotMsg); // Thêm lại bot message đã cập nhật (với thoughts được bảo toàn)
                        }
                    }


                    console.log(`[MessageStore _onSocketConversationUpdatedAfterEdit] Final messages:`, finalMessages.map(m => ({ id: m.id, text: m.message.substring(0, 15), thoughts: !!m.thoughts, isUser: m.isUser })));
                    return { chatMessages: finalMessages };
                }, false, '_onSocketConversationUpdatedAfterEdit/applyDefinitiveUpdate');

                // setLoadingState đã được xử lý bởi _onSocketChatResult nếu là streaming
                // Nếu là non-streaming edit, thì cần setLoadingState(false) ở đây.
                // Để đơn giản, có thể gọi lại, không sao:
                setLoadingState({ isLoading: false, step: 'conversation_updated_after_edit', message: '', agentId: undefined });
            },

            _onSocketStatusUpdate: (data: StatusUpdate) => {
                const { agentId, step, message } = data;
                let displayMessage = message;
                if (agentId && agentId !== 'HostAgent') {
                    displayMessage = `[${agentId}] ${message}`;
                }
                set(state => ({
                    loadingState: { ...state.loadingState, isLoading: true, step: step, message: displayMessage, agentId: agentId }
                }), false, `_onSocketStatusUpdate/${agentId || 'unknown_agent'}/${step}`);
            },

            _onSocketChatUpdate: (update) => {
                const { animationControls, isAwaitingFinalResultRef, addChatMessage, setLoadingState, pendingBotMessageId, chatMessages, setPendingBotMessageId: storeSetPendingBotMessageId } = get();
                if (!animationControls) {
                    console.warn("ChatUpdate received but no animationControls"); return;
                }
                const currentStreamingIdByControls = animationControls.currentStreamingId;
                const currentAgentId = get().loadingState.agentId;

                if (pendingBotMessageId) {
                    const existingBotMessage = chatMessages.find(msg => msg.id === pendingBotMessageId);
                    if (!existingBotMessage) {
                        addChatMessage({
                            id: pendingBotMessageId, message: '', isUser: false, type: 'text',
                            thoughts: [], timestamp: new Date().toISOString()
                        });
                        const streamingMessage = currentAgentId && currentAgentId !== 'HostAgent' ? `[${currentAgentId}] Receiving...` : 'Receiving...';
                        setLoadingState({ isLoading: true, step: 'streaming_response', message: streamingMessage, agentId: currentAgentId });
                    }
                    if (!currentStreamingIdByControls || currentStreamingIdByControls !== pendingBotMessageId) {
                        animationControls.startStreaming(pendingBotMessageId);
                    }
                    if (!isAwaitingFinalResultRef.current) isAwaitingFinalResultRef.current = true;
                    animationControls.processChunk(update.textChunk);
                } else {
                    console.warn("[MessageStore _onSocketChatUpdate] Fallback: No pendingBotMessageId. This might be unexpected during an active operation.");
                    isAwaitingFinalResultRef.current = true;
                    const newStreamingId = `streaming-${generateMessageId()}`;
                    addChatMessage({ id: newStreamingId, message: '', isUser: false, type: 'text', thoughts: [], timestamp: new Date().toISOString() });
                    const streamingMessage = currentAgentId && currentAgentId !== 'HostAgent' ? `[${currentAgentId}] Receiving...` : 'Receiving...';
                    storeSetPendingBotMessageId(newStreamingId);
                    setLoadingState({ isLoading: true, step: 'streaming_response', message: streamingMessage, agentId: currentAgentId });
                    animationControls.startStreaming(newStreamingId);
                    animationControls.processChunk(update.textChunk);
                }
            },

            _onSocketChatResult: (result: ResultUpdate) => {
                const {
                    animationControls,
                    setLoadingState,
                    updateMessageById,
                    addChatMessage,
                    pendingBotMessageId,
                    setPendingBotMessageId: storeSetPendingBotMessageId,
                    chatMessages,
                    resetAwaitFlag,
                } = get();

                const { currentLocale, isStreamingEnabled } = useSettingsStore.getState();
                const { setShowConfirmationDialog } = useUiStore.getState();

                animationControls?.completeStream();

                const targetMessageId = pendingBotMessageId; // This is the ID used for streaming (e.g., bot-pending-..., bot-edit-resp-...)

                // --- Helper to create message payload from result ---
                const createMessagePayloadFromResult = (existingMessageContent?: string): Omit<ChatMessageType, 'id' | 'isUser'> => {
                    let messageContent = result.message || existingMessageContent || "Task completed.";
                    let messageType: ChatMessageType['type'] = 'text';
                    let locationData: string | undefined = undefined;
                    const actionData: FrontendAction | undefined = result.action;

                    if (actionData?.type === 'openMap' && actionData.location) {
                        messageType = 'map';
                        locationData = actionData.location;
                        messageContent = result.message || `Showing map for: ${actionData.location}`;
                    } else if (actionData?.type === 'itemFollowStatusUpdated') {
                        messageType = 'follow_update';
                        if (!result.message && actionData.payload) { // Ensure payload exists
                            const followPayload = actionData.payload as ItemFollowStatusUpdatePayload;
                            messageContent = followPayload.followed ? "Item followed." : "Item unfollowed.";
                        }
                    } else if (actionData?.type === 'confirmEmailSend') {
                        messageType = 'text'; // Or a specific type like 'confirmation_request'
                        messageContent = result.message || 'Please confirm the action.';
                    } else if (actionData?.type === 'navigate' && !result.message) {
                        messageContent = `Okay, navigating...`;
                    }
                    // Ensure messageContent is not empty if all else fails
                    if (!messageContent && messageContent !== "") messageContent = "Result received.";


                    return {
                        message: messageContent,
                        thoughts: result.thoughts,
                        type: messageType,
                        location: locationData,
                        action: actionData,
                        timestamp: new Date().toISOString(),
                    };
                };
                // --- End Helper ---

                if (targetMessageId) {
                    const messageExistsIndex = chatMessages.findIndex(msg => msg.id === targetMessageId);

                    if (messageExistsIndex !== -1) {
                        console.log(`[MessageStore _onSocketChatResult] Updating existing message (placeholder ID: ${targetMessageId}) with final content.`);
                        updateMessageById(targetMessageId, (prevMsg) => {
                            const newPayload = createMessagePayloadFromResult(prevMsg.message);
                            // If backend sends the final ID in chat_result (result.id), use it.
                            // This 'promotes' the placeholder to its final, backend-acknowledged ID.
                            if (result.id && result.id !== targetMessageId) { // <<< THIS LOGIC IS ALREADY HERE
                                console.log(`[MessageStore _onSocketChatResult] Promoting placeholder ${targetMessageId} to final backend ID ${result.id}`);
                                return { ...newPayload, id: result.id }; // Update ID and content
                            }
                            return newPayload; // Otherwise, just update content, ID remains the placeholder
                        });
                    } else if (!isStreamingEnabled) {
                        // Non-streaming mode, and the message with targetMessageId wasn't pre-created (as expected for non-streaming).
                        // This means targetMessageId was set (e.g. by sendMessage), and we are now adding the full message.
                        const finalId = result.id || targetMessageId; // <<< USES result.id
                        console.log(`[MessageStore _onSocketChatResult] Adding new message (non-stream, ID was pending): ${finalId}`);
                        addChatMessage({
                            id: finalId,
                            isUser: false,
                            ...createMessagePayloadFromResult()
                        } as ChatMessageType);
                    } else {
                        // Streaming mode, but the targetMessageId (which should have been created on stream start) wasn't found.
                        // This is an unexpected state. Log a warning and add as a new message.
                        const finalId = result.id || generateMessageId(); // <<< USES result.id
                        console.warn(`[MessageStore _onSocketChatResult] Stream mode, but placeholder message ${targetMessageId} not found. Adding as new with ID: ${finalId}.`);
                        addChatMessage({
                            id: finalId,
                            isUser: false,
                            ...createMessagePayloadFromResult()
                        } as ChatMessageType);
                    }
                } else {
                    // No pendingBotMessageId. This means the result is entirely new, not an update to a pending message.
                    // This can happen if the bot sends a message proactively or if the pending ID logic failed.
                    const finalId = result.id || generateMessageId(); // <<< USES result.id
                    console.warn(`[MessageStore _onSocketChatResult] No pendingBotMessageId. Adding result as a new message with ID: ${finalId}.`);
                    addChatMessage({
                        id: finalId,
                        isUser: false,
                        ...createMessagePayloadFromResult()
                    } as ChatMessageType);
                }

                resetAwaitFlag();
                setLoadingState({ isLoading: false, step: 'result_received', message: '', agentId: undefined });
                storeSetPendingBotMessageId(null); // Clear the pending ID as the result has been processed

                // Handle side-effects of actions
                const action = result.action;
                if (action?.type === 'navigate' && action.url) {
                    const finalUrl = constructNavigationUrl(BASE_WEB_URL, currentLocale, action.url);
                    openUrlInNewTab(finalUrl);
                } else if (action?.type === 'confirmEmailSend' && action.payload) {
                    setShowConfirmationDialog(true, action.payload as ConfirmSendEmailAction);
                }
            },

            _onSocketChatError: (errorData: ErrorUpdate) => {
                const {
                    animationControls, resetAwaitFlag, setChatMessages: currentStoreSetChatMessages,
                    setLoadingState, setPendingBotMessageId: storeSetPendingBotMessageId
                } = get();
                const { activeConversationId, setActiveConversationId, setIsHistoryLoaded, setIsLoadingHistory } = useConversationStore.getState();
                const { handleError } = useUiStore.getState();

                console.error("[MessageStore _onSocketChatError] Event: Chat Error received from server:", errorData);
                resetAwaitFlag();
                animationControls?.stopStreaming();
                storeSetPendingBotMessageId(null);

                const { step: errorStep, code: errorCode, details, message } = errorData;
                const historyLoadErrorSteps = ['history_not_found_load', 'history_load_fail_server', 'auth_required_load', 'invalid_request_load'];
                const isRelatedToActiveConv = (errorCode === 'CONVERSATION_NOT_FOUND' || errorCode === 'ACCESS_DENIED') && details?.conversationId === activeConversationId;

                if (historyLoadErrorSteps.includes(errorStep || '') || isRelatedToActiveConv) {
                    setActiveConversationId(null, { skipUiReset: true });
                    currentStoreSetChatMessages(() => []);
                    setIsHistoryLoaded(false);
                    setIsLoadingHistory(false);
                }
                const isFatal = errorCode === 'FATAL_SERVER_ERROR' || errorCode === 'AUTH_REQUIRED' || errorCode === 'ACCESS_DENIED';
                handleError(errorData, true, isFatal); // Assuming handleError takes ErrorUpdate
                setLoadingState({ isLoading: false, step: errorData.step || 'error_received', message: errorData.message, agentId: undefined });
            },

            _onSocketEmailConfirmationResult: (emailResult: EmailConfirmationResult) => {
                const { addChatMessage, setLoadingState } = get(); // Removed setPendingBotMessageId
                const { confirmationData, setShowConfirmationDialog } = useUiStore.getState();

                if (confirmationData && emailResult.confirmationId === confirmationData.confirmationId) {
                    setShowConfirmationDialog(false);
                }
                addChatMessage({
                    id: generateMessageId(), message: emailResult.message, isUser: false,
                    type: emailResult.status === 'success' ? 'text' : 'warning', timestamp: new Date().toISOString()
                });
                setLoadingState({ isLoading: false, step: `email_${emailResult.status}`, message: '', agentId: undefined });
            },
        }),
        {
            name: "MessageStore",
        }
    )
);