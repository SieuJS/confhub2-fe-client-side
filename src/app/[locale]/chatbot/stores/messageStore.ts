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
    FrontendAction
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { StreamingTextAnimationControls } from '@/src/hooks/chatbot/useStreamingTextAnimation';
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { appConfig } from '@/src/middleware';
import { useSettingsStore } from './setttingsStore';
import { useSocketStore } from './socketStore';
import { useUiStore } from './uiStore';
import { useConversationStore } from './conversationStore';

const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";

export interface MessageStoreState {
    chatMessages: ChatMessageType[];
    loadingState: LoadingState;
    animationControls: StreamingTextAnimationControls | null;
    isAwaitingFinalResultRef: React.MutableRefObject<boolean>;
    pendingBotMessageId: string | null;
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
    _onSocketStatusUpdate: (data: StatusUpdate) => void;
    _onSocketChatUpdate: (data: ChatUpdate) => void;
    _onSocketChatResult: (data: ResultUpdate) => void;
    _onSocketChatError: (errorData: ErrorUpdate) => void;
    _onSocketEmailConfirmationResult: (result: EmailConfirmationResult) => void;
}

const initialMessageStoreState: MessageStoreState = {
    chatMessages: [],
    loadingState: { isLoading: false, step: 'idle', message: '', agentId: undefined },
    animationControls: null,
    isAwaitingFinalResultRef: { current: false },
    pendingBotMessageId: null,
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

            resetChatUIForNewConversation: (clearActiveIdInOtherStores = true) => {
                set({
                    chatMessages: [],
                    loadingState: { isLoading: false, step: 'idle', message: '', agentId: undefined },
                    pendingBotMessageId: null,
                }, false, 'resetChatUIForNewConversation/messages');
                get().animationControls?.stopStreaming();
                get().resetAwaitFlag();
                if (clearActiveIdInOtherStores) {
                    //
                }
                useUiStore.getState().setShowConfirmationDialog(false);
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
                    // Hiện tại: handleError chỉ thêm một tin nhắn vào chat và set loading state.
                    // Nó KHÔNG set hasFatalError trong UiStore từ đây, vì isFatal = false
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
                    isStreaming: isStreamingEnabled, // Sử dụng isStreamingEnabled trực tiếp
                    language: currentLanguage.code,
                    conversationId: activeConversationId,
                });
            },

            _onSocketStatusUpdate: (data: StatusUpdate) => {
                const { agentId, step, message } = data;
                let displayMessage = message;

                if (agentId && agentId !== 'HostAgent') {
                    displayMessage = `[${agentId}] ${message}`;
                }

                set(state => ({
                    loadingState: {
                        ...state.loadingState,
                        isLoading: true,
                        step: step,
                        message: displayMessage,
                        agentId: agentId
                    }
                }), false, `_onSocketStatusUpdate/${agentId || 'unknown_agent'}/${step}`);
            },

            _onSocketChatUpdate: (update) => {
                const { animationControls, isAwaitingFinalResultRef, addChatMessage, setLoadingState, pendingBotMessageId, chatMessages, setPendingBotMessageId } = get(); // Sửa lại: không cần setPendingBotMessageId ở đây vì nó đã có ở scope ngoài
                if (!animationControls) {
                    console.warn("ChatUpdate received but no animationControls");
                    return;
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
                        const streamingMessage = currentAgentId && currentAgentId !== 'HostAgent'
                            ? `[${currentAgentId}] Receiving...`
                            : 'Receiving...';
                        setLoadingState({ isLoading: true, step: 'streaming_response', message: streamingMessage, agentId: currentAgentId });
                    }

                    if (!currentStreamingIdByControls || currentStreamingIdByControls !== pendingBotMessageId) {
                        animationControls.startStreaming(pendingBotMessageId);
                    }
                    if (!isAwaitingFinalResultRef.current) isAwaitingFinalResultRef.current = true;
                    animationControls.processChunk(update.textChunk);

                } else {
                    console.warn("[MessageStore _onSocketChatUpdate] Fallback: No pendingBotMessageId or stream already active with different ID.");
                    isAwaitingFinalResultRef.current = true;
                    const newStreamingId = `streaming-${generateMessageId()}`;
                    addChatMessage({ id: newStreamingId, message: '', isUser: false, type: 'text', thoughts: [], timestamp: new Date().toISOString() });

                    const streamingMessage = currentAgentId && currentAgentId !== 'HostAgent'
                        ? `[${currentAgentId}] Receiving...`
                        : 'Receiving...';
                    // Sử dụng hàm setPendingBotMessageId của store
                    get().setPendingBotMessageId(newStreamingId);
                    setLoadingState({ isLoading: true, step: 'streaming_response', message: streamingMessage, agentId: currentAgentId });

                    animationControls.startStreaming(newStreamingId);
                    animationControls.processChunk(update.textChunk);
                }
            },

            _onSocketChatResult: (result) => { // result should be typed, e.g., { message?: string; thoughts?: any[]; action?: FrontendAction }
                const {
                    animationControls,
                    // isAwaitingFinalResultRef, // Assuming this is handled correctly elsewhere or not directly needed here
                    setLoadingState,
                    updateMessageById,
                    addChatMessage,
                    pendingBotMessageId,
                    setPendingBotMessageId: storeSetPendingBotMessageId,
                    chatMessages,
                    resetAwaitFlag,
                } = get(); // Ensure get() returns all these methods/properties correctly typed

                const { currentLocale, isStreamingEnabled } = useSettingsStore.getState();
                const { setShowConfirmationDialog } = useUiStore.getState();

                animationControls?.completeStream(); // Assuming animationControls is correctly typed and handled

                const targetMessageId = pendingBotMessageId;

                const createMessagePayload = (existingMessageContent?: string): Partial<ChatMessageType> => {
                    let messageContent = result.message || existingMessageContent || "Task completed.";
                    let messageType: ChatMessageType['type'] = 'text';
                    let locationData: string | undefined = undefined;
                    const actionData: FrontendAction | undefined = result.action; // Type FrontendAction correctly

                    if (actionData?.type === 'openMap' && actionData.location) {
                        messageType = 'map';
                        locationData = actionData.location;
                        // Use result.message if provided, otherwise generate a default for map
                        messageContent = result.message || `Showing map for: ${actionData.location}`;
                    } else if (actionData?.type === 'itemFollowStatusUpdated') {
                        messageType = 'follow_update';
                        // messageContent will be the textual response from the backend, e.g., "Successfully followed..."
                        // If result.message is empty for this action, we might want a default, or rely on the FollowUpdateDisplay component
                        // For now, if result.message is empty, it will fall back to "Task completed" via the initial assignment.
                        // Or, ensure backend always sends a message for this.
                        if (!result.message) {
                            messageContent = actionData.payload.followed ? "Item followed." : "Item unfollowed.";
                        }
                    } else if (actionData?.type === 'confirmEmailSend') {
                        messageType = 'text'; // Or a specific type like 'confirmation_request' if you want custom rendering
                        messageContent = result.message || 'Please confirm the action.';
                    } else if (actionData?.type === 'navigate' && !result.message) {
                        // If only a navigate action without a message, provide a default
                        messageContent = `Okay, navigating...`;
                    }

                    // Default message content if none is set by conditions or result.message
                    // This check might be redundant if the initial `messageContent` assignment covers it.
                    if (!result.message && messageContent === "Task completed.") { // Check if it's still the generic default
                        if (actionData?.type === 'openMap' && actionData.location) {
                            messageContent = `Showing map for: ${actionData.location}`;
                        } else if (actionData?.type === 'itemFollowStatusUpdated') {
                            messageContent = actionData.payload.followed ? "Item followed." : "Item unfollowed.";
                        } else if (actionData?.type === 'confirmEmailSend') {
                            messageContent = 'Please confirm the action.';
                        } else if (actionData?.type === 'navigate') {
                            messageContent = `Okay, navigating...`;
                        }
                        // If still "Task completed." and no specific action message, it stays.
                    }


                    return {
                        message: messageContent,
                        thoughts: result.thoughts,
                        type: messageType,
                        location: locationData,
                        action: actionData, // action (with payload) is included here
                        timestamp: new Date().toISOString(),
                    };
                };

                if (targetMessageId) {
                    const messageExists = chatMessages.some(msg => msg.id === targetMessageId);

                    if (messageExists) {
                        // This case is usually for streaming updates where the message shell already exists.
                        // If the final result (non-streamed) also uses targetMessageId, this path is fine.
                        console.log(`[MessageStore _onSocketChatResult] Updating existing message ID: ${targetMessageId}`);
                        updateMessageById(targetMessageId, (prevMsg) => ({
                            ...prevMsg,
                            ...createMessagePayload(prevMsg.message) // Pass existing content for potential merging
                        }));
                    } else if (!isStreamingEnabled) {
                        // Non-streaming mode, and the message with targetMessageId wasn't pre-created.
                        // This means targetMessageId was set, and we are now adding the full message.
                        console.log(`[MessageStore _onSocketChatResult] Adding new message for (non-stream, but ID was pending): ${targetMessageId}`);
                        addChatMessage({
                            id: targetMessageId,
                            isUser: false,
                            // Ensure all required fields of ChatMessageType are provided
                            // The 'as ChatMessageType' cast is a fallback. Ideally, createMessagePayload + id + isUser is enough.
                            ...(createMessagePayload() as Omit<ChatMessageType, 'id' | 'isUser'>)
                        } as ChatMessageType);
                    } else {
                        // Streaming mode, but the targetMessageId (which should have been created on stream start) wasn't found.
                        // This is an unexpected state, so log a warning and add as a new message.
                        console.warn(`[MessageStore _onSocketChatResult] Stream mode, but message ${targetMessageId} not found. Adding as new generated ID.`);
                        addChatMessage({
                            id: generateMessageId(),
                            isUser: false,
                            ...(createMessagePayload() as Omit<ChatMessageType, 'id' | 'isUser'>)
                        } as ChatMessageType);
                    }
                } else {
                    // No pendingBotMessageId. This means the result is entirely new, not an update to a pending message.
                    // This can happen if the bot sends a message proactively or if the pending ID logic failed.
                    console.warn("[MessageStore _onSocketChatResult] No pendingBotMessageId. Adding result as a new message with generated ID.");

                    // We need to determine the type based on the action here as well,
                    // because createMessagePayload might not be called or its result might be overridden.
                    let finalType: ChatMessageType['type'] = 'text';
                    let finalLocation: string | undefined = undefined;
                    const action = result.action;

                    if (action?.type === 'openMap' && action.location) {
                        finalType = 'map';
                        finalLocation = action.location;
                    } else if (action?.type === 'itemFollowStatusUpdated') {
                        finalType = 'follow_update';
                    } // Add other action types if they influence the message 'type' directly

                    addChatMessage({
                        id: generateMessageId(),
                        isUser: false,
                        message: result.message || "Result received", // Provide a default if message is null
                        thoughts: result.thoughts,
                        type: finalType,
                        location: finalLocation,
                        action: result.action,
                        timestamp: new Date().toISOString()
                    });
                }

                resetAwaitFlag();
                setLoadingState({ isLoading: false, step: 'result_received', message: '', agentId: undefined });
                storeSetPendingBotMessageId(null); // Clear the pending ID as the result has been processed

                // Handle side-effects of actions
                const action = result.action;
                if (action?.type === 'navigate' && action.url) {
                    // Ensure BASE_WEB_URL and currentLocale are available and correctly typed
                    const finalUrl = constructNavigationUrl(BASE_WEB_URL, currentLocale, action.url); // Assuming currentLocale.code for locale string
                    openUrlInNewTab(finalUrl);
                } else if (action?.type === 'confirmEmailSend' && action.payload) {
                    // Ensure action.payload can be safely cast to ConfirmSendEmailAction
                    setShowConfirmationDialog(true, action.payload as ConfirmSendEmailAction);
                }
            },


            _onSocketChatError: (errorData: any) => { // Cập nhật type cho errorData nếu có
                const {
                    animationControls,
                    resetAwaitFlag, // Đảm bảo có ở đây
                    setChatMessages: currentStoreSetChatMessages,
                    setLoadingState,
                    setPendingBotMessageId
                } = get();
                const { activeConversationId, setActiveConversationId, setIsHistoryLoaded, setIsLoadingHistory } = useConversationStore.getState();
                const { handleError } = useUiStore.getState();

                console.error("[MessageStore _onSocketChatError] Event: Chat Error received from server:", errorData);
                resetAwaitFlag();
                animationControls?.stopStreaming();
                setPendingBotMessageId(null);

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
                handleError(errorData, true, isFatal);
                setLoadingState({ isLoading: false, step: errorData.step || 'error_received', message: errorData.message, agentId: undefined });
            },

            _onSocketEmailConfirmationResult: (result: any) => { // Cập nhật type cho result nếu có
                const { addChatMessage, setLoadingState, setPendingBotMessageId } = get();
                const { confirmationData, setShowConfirmationDialog } = useUiStore.getState();

                if (confirmationData && result.confirmationId === confirmationData.confirmationId) { // Thêm kiểm tra confirmationData
                    setShowConfirmationDialog(false);
                }
                addChatMessage({
                    id: generateMessageId(), message: result.message, isUser: false,
                    type: result.status === 'success' ? 'text' : 'warning', timestamp: new Date().toISOString()
                });
                setLoadingState({ isLoading: false, step: `email_${result.status}`, message: '', agentId: undefined });
            },
        }),
        {
            name: "MessageStore",
        }
    )
);