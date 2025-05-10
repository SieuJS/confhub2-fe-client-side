// src/stores/messageStore.ts (hoặc đường dẫn tương ứng của bạn)
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
    AgentId
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
            resetAwaitFlag: () => {
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
                    handleError({ message: "Cannot send message: A critical error occurred.", type: 'error', step: 'send_message_fail_fatal' }, false, false);
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

            _onSocketChatResult: (result) => {
                const { animationControls, isAwaitingFinalResultRef, setLoadingState, updateMessageById, resetAwaitFlag, addChatMessage, pendingBotMessageId, setPendingBotMessageId: storeSetPendingBotMessageId } = get();
                const { currentLocale } = useSettingsStore.getState();
                const { setShowConfirmationDialog } = useUiStore.getState();

                if (!animationControls) {
                    console.warn("ChatResult received but no animationControls. Adding message directly.");
                     addChatMessage({
                        id: generateMessageId(), isUser: false, message: result.message || "Result received",
                        thoughts: result.thoughts, type: result.action?.type === 'openMap' ? 'map' : 'text',
                        location: result.action?.type === 'openMap' ? result.action.location : undefined,
                        timestamp: new Date().toISOString()
                    });
                    setLoadingState({ isLoading: false, step: 'result_received_no_controls', message: '', agentId: undefined });
                    resetAwaitFlag();
                    storeSetPendingBotMessageId(null);
                    return;
                }

                const streamingIdToUse = pendingBotMessageId || animationControls.currentStreamingId;

                if (!isAwaitingFinalResultRef.current && !streamingIdToUse) {
                    console.warn("[MessageStore _onSocketChatResult] Received result but wasn't expecting one / no stream active. Adding as new.");
                    addChatMessage({
                        id: generateMessageId(), isUser: false, message: result.message || "Result received",
                        thoughts: result.thoughts, type: result.action?.type === 'openMap' ? 'map' : 'text',
                        location: result.action?.type === 'openMap' ? result.action.location : undefined,
                        timestamp: new Date().toISOString()
                    });
                } else if (streamingIdToUse) {
                    animationControls.completeStream(); // This should trigger onContentUpdate for the last time

                    updateMessageById(streamingIdToUse, (prevMsg) => {
                        let finalUpdates: Partial<ChatMessageType> = {
                            message: result.message || prevMsg.message, // prevMsg.message should be updated by onContentUpdate
                            thoughts: result.thoughts || prevMsg.thoughts,
                            timestamp: new Date().toISOString(),
                        };
                        const action = result.action;

                        if (action?.type === 'openMap' && action.location) {
                            finalUpdates.type = 'map';
                            finalUpdates.location = action.location;
                            finalUpdates.message = result.message || `Showing map for: ${action.location}`;
                        } else if (action?.type === 'confirmEmailSend') {
                            finalUpdates.type = 'text';
                            finalUpdates.message = result.message || 'Please confirm the action.';
                        } else if (action?.type === 'navigate' && !result.message) {
                            finalUpdates.message = `Okay, navigating...`;
                        }

                        if (!finalUpdates.message && (!action || (action.type !== 'openMap' && action.type !== 'confirmEmailSend'))) {
                            finalUpdates.message = "Task completed.";
                        }
                        return finalUpdates;
                    });
                } else {
                     console.error("[MessageStore _onSocketChatResult] *** CRITICAL: NO STREAMING ID FOUND AFTER COMPLETION! Adding as new. ***");
                    addChatMessage({ id: generateMessageId(), isUser: false, message: result.message || "Final result", thoughts: result.thoughts, type: 'text', timestamp: new Date().toISOString() });
                }

                resetAwaitFlag();
                setLoadingState({ isLoading: false, step: 'result_received', message: '', agentId: undefined });
                storeSetPendingBotMessageId(null);

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
                    animationControls,
                    resetAwaitFlag,
                    setChatMessages: currentStoreSetChatMessages,
                    setLoadingState,
                    setPendingBotMessageId // <<< Đã sửa ở đây
                } = get();
                const { activeConversationId, setActiveConversationId, setIsHistoryLoaded, setIsLoadingHistory } = useConversationStore.getState();
                const { handleError } = useUiStore.getState();

                console.error("[MessageStore _onSocketChatError] Event: Chat Error received from server:", errorData);
                resetAwaitFlag();
                animationControls?.stopStreaming();
                setPendingBotMessageId(null); // Bây giờ OK

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

            _onSocketEmailConfirmationResult: (result) => {
                const { addChatMessage, setLoadingState, setPendingBotMessageId } = get(); // Thêm setPendingBotMessageId nếu có thể có stream bị ngắt
                const { confirmationData, setShowConfirmationDialog } = useUiStore.getState();

                if (result.confirmationId === confirmationData?.confirmationId) {
                    setShowConfirmationDialog(false);
                }
                addChatMessage({
                    id: generateMessageId(), message: result.message, isUser: false,
                    type: result.status === 'success' ? 'text' : 'warning', timestamp: new Date().toISOString()
                });
                // Có thể reset pendingBotMessageId ở đây nếu một email confirmation result có thể ngắt một stream đang chạy
                // setPendingBotMessageId(null);
                setLoadingState({ isLoading: false, step: `email_${result.status}`, message: '', agentId: undefined });
            },
        }),
        {
            name: "MessageStore",
        }
    )
);