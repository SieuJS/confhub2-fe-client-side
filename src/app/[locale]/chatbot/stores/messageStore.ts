import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    ChatMessageType, LoadingState, ThoughtStep, ErrorUpdate, ChatUpdate, ResultUpdate,
    EmailConfirmationResult, ConfirmSendEmailAction, StatusUpdate
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path
import { StreamingTextAnimationControls } from '@/src/hooks/chatbot/useStreamingTextAnimation'; // Adjust path
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { appConfig } from '@/src/middleware';
import { useSettingsStore } from './setttingsStore';
import { useSocketStore } from './socketStore';
import { useUiStore } from './uiStore';
import { useConversationStore } from './conversationStore';

const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";

// --- Types for Message Store State ---
export interface MessageStoreState {
    chatMessages: ChatMessageType[];
    loadingState: LoadingState;
    animationControls: StreamingTextAnimationControls | null;
    isAwaitingFinalResultRef: React.MutableRefObject<boolean>;
    // Thêm state để lưu ID của tin nhắn bot đang chờ stream
    pendingBotMessageId: string | null; // <<<< THÊM DÒNG NÀY
}


// --- Types for Message Store Actions ---
export interface MessageStoreActions {
    setChatMessages: (newMessagesOrUpdater: ChatMessageType[] | ((prev: ChatMessageType[]) => ChatMessageType[])) => void;
    addChatMessage: (message: ChatMessageType) => void;
    updateMessageById: (messageId: string, updates: Partial<ChatMessageType> | ((prev: ChatMessageType) => Partial<ChatMessageType>)) => void;
    setLoadingState: (loadingState: LoadingState) => void;
    setAnimationControls: (controls: StreamingTextAnimationControls | null) => void; // Allow null
    resetAwaitFlag: () => void;
    setPendingBotMessageId: (id: string | null) => void; // <<<< THÊM DÒNG NÀY

    // Complex Actions
    sendMessage: (userInput: string) => void;
    resetChatUIForNewConversation: (clearActiveIdInOtherStores?: boolean) => void; // Renamed for clarity

    // Socket Event Handlers (called by useChatSocketManager)
    _onSocketStatusUpdate: (data: StatusUpdate) => void;
    _onSocketChatUpdate: (data: ChatUpdate) => void;
    _onSocketChatResult: (data: ResultUpdate) => void;
    _onSocketChatError: (errorData: ErrorUpdate) => void;
    _onSocketEmailConfirmationResult: (result: EmailConfirmationResult) => void;
}

const initialMessageStoreState: MessageStoreState = {
    chatMessages: [],
    loadingState: { isLoading: false, step: '', message: '' },
    animationControls: null,
    isAwaitingFinalResultRef: { current: false },
    pendingBotMessageId: null, // <<<< THÊM DÒNG NÀY
};


export const useMessageStore = create<MessageStoreState & MessageStoreActions>()(
    devtools(
        (set, get) => ({
            ...initialMessageStoreState,

            // --- Setters ---
            setChatMessages: (newMessagesOrUpdater) => { // Action này thuộc messageStore
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
                // console.log("[MessageStore] Resetting isAwaitingFinalResultRef from:", get().isAwaitingFinalResultRef.current);
                get().isAwaitingFinalResultRef.current = false;
            },
            setPendingBotMessageId: (id) => set({ pendingBotMessageId: id }, false, 'setPendingBotMessageId'), // <<<< THÊM DÒNG NÀY

            // --- Complex Actions ---
            resetChatUIForNewConversation: (clearActiveIdInOtherStores = true) => {
                set({
                    chatMessages: [],
                    loadingState: { isLoading: false, step: 'idle', message: '' },
                    pendingBotMessageId: null, // <<<< THÊM DÒNG NÀY ĐỂ RESET
                }, false, 'resetChatUIForNewConversation/messages');
                get().animationControls?.stopStreaming();
                get().resetAwaitFlag();

                if (clearActiveIdInOtherStores) {
                    // setActiveConversationId(null) in conversationStore will handle its part.
                }
                useUiStore.getState().setShowConfirmationDialog(false);
            },
            sendMessage: (userInput) => {
                const { addChatMessage, setLoadingState, animationControls, resetAwaitFlag, setPendingBotMessageId } = get(); // <<<< Thêm setPendingBotMessageId
                const { isStreamingEnabled, currentLanguage } = useSettingsStore.getState();
                const { hasFatalConnectionError } = useSocketStore.getState();
                const { handleError, hasFatalError: uiHasFatalError } = useUiStore.getState();

                const trimmedMessage = userInput.trim();
                if (!trimmedMessage) return;

                if (hasFatalConnectionError || uiHasFatalError) {
                    handleError({ message: "Cannot send message: A critical error occurred.", type: 'error' }, false, false);
                    return;
                }

                animationControls?.stopStreaming(); // Điều này sẽ reset animationControls.currentStreamingId về null
                resetAwaitFlag();
                setLoadingState({ isLoading: true, step: 'sending', message: 'Sending...' });

                const newUserMessage: ChatMessageType = {
                    id: generateMessageId(), message: trimmedMessage, isUser: true, type: 'text', timestamp: new Date().toISOString(),
                };
                addChatMessage(newUserMessage);

                // Tạo một ID cho tin nhắn bot placeholder và lưu nó
                const botPlaceholderId = `bot-pending-${generateMessageId()}`;
                setPendingBotMessageId(botPlaceholderId); // <<<< LƯU ID NÀY

                // KHÔNG addChatMessage cho bot placeholder ở đây nữa.
                // Việc này sẽ do _onSocketChatUpdate xử lý nếu cần.

                useSocketStore.getState().emitSendMessage({
                    userInput: trimmedMessage,
                    isStreaming: isStreamingEnabled,
                    language: currentLanguage.code,
                });
            },


            // --- Socket Event Handlers ---
            _onSocketStatusUpdate: (data) => set({ loadingState: { isLoading: true, step: data.step, message: data.message } }, false, `_onSocketStatusUpdate/${data.step}`),

            _onSocketChatUpdate: (update) => {
                const { animationControls, isAwaitingFinalResultRef, addChatMessage, setLoadingState, pendingBotMessageId, chatMessages, setPendingBotMessageId } = get(); // <<<< Lấy pendingBotMessageId và chatMessages
                if (!animationControls) { console.warn("ChatUpdate received but no animationControls"); return; }

                const currentStreamingIdByControls = animationControls.currentStreamingId;

                // Logic mới: Ưu tiên pendingBotMessageId
                if (pendingBotMessageId) {
                    // Kiểm tra xem message với pendingBotMessageId đã tồn tại chưa
                    const existingBotMessage = chatMessages.find(msg => msg.id === pendingBotMessageId);
                    if (!existingBotMessage) {
                        // Nếu chưa tồn tại, đây là chunk đầu tiên cho message này, thêm nó vào
                        addChatMessage({
                            id: pendingBotMessageId,
                            message: '', // Bắt đầu rỗng
                            isUser: false,
                            type: 'text',
                            thoughts: [],
                            timestamp: new Date().toISOString()
                        });
                        setLoadingState({ isLoading: true, step: 'streaming_response', message: 'Receiving...' });
                    }

                    // Bắt đầu stream hoặc tiếp tục stream cho pendingBotMessageId
                    if (!currentStreamingIdByControls || currentStreamingIdByControls !== pendingBotMessageId) {
                        animationControls.startStreaming(pendingBotMessageId);
                    }
                    if (!isAwaitingFinalResultRef.current) isAwaitingFinalResultRef.current = true;
                    animationControls.processChunk(update.textChunk);

                } else {
                    // Trường hợp không có pendingBotMessageId (ít khả năng xảy ra nếu sendMessage hoạt động đúng)
                    // hoặc nếu currentStreamingIdByControls đã có và đang stream
                    if (isAwaitingFinalResultRef.current || currentStreamingIdByControls) {
                        if (!isAwaitingFinalResultRef.current && currentStreamingIdByControls) isAwaitingFinalResultRef.current = true;
                        animationControls.processChunk(update.textChunk);
                    } else {
                        // Fallback (logic cũ, nhưng lý tưởng là không rơi vào đây)
                        console.warn("[MessageStore _onSocketChatUpdate] Fallback: No pendingBotMessageId, creating new streaming ID.");
                        isAwaitingFinalResultRef.current = true;
                        const newStreamingId = `streaming-${generateMessageId()}`;
                        addChatMessage({ id: newStreamingId, message: '', isUser: false, type: 'text', thoughts: [], timestamp: new Date().toISOString() });
                        setLoadingState({ isLoading: true, step: 'streaming_response', message: 'Receiving...' });
                        animationControls.startStreaming(newStreamingId);
                        animationControls.processChunk(update.textChunk);
                        setPendingBotMessageId(newStreamingId); // Cập nhật pending ID cho lần sau
                    }
                }
            },

            _onSocketChatResult: (result) => {
                const { animationControls, isAwaitingFinalResultRef, setLoadingState, updateMessageById, resetAwaitFlag, addChatMessage, pendingBotMessageId, setPendingBotMessageId } = get(); // <<<< Lấy pendingBotMessageId
                const { currentLocale } = useSettingsStore.getState();
                const { setShowConfirmationDialog } = useUiStore.getState();

                if (!animationControls) { console.warn("ChatResult received but no animationControls"); return; }

                // Ưu tiên pendingBotMessageId nếu có, nếu không thì dùng currentStreamingId từ controls
                const streamingIdToUse = pendingBotMessageId || animationControls.currentStreamingId;

                if (!isAwaitingFinalResultRef.current && !streamingIdToUse) {
                    console.warn("[MessageStore _onSocketChatResult] Received result but wasn't expecting one / no stream active. Adding as new.");
                    addChatMessage({
                        id: generateMessageId(), isUser: false, message: result.message || "Result received",
                        thoughts: result.thoughts, type: result.action?.type === 'openMap' ? 'map' : 'text',
                        location: result.action?.type === 'openMap' ? result.action.location : undefined,
                        timestamp: new Date().toISOString()
                    });
                    resetAwaitFlag();
                    setLoadingState({ isLoading: false, step: 'result_received', message: '' });
                    setPendingBotMessageId(null); // <<<< RESET
                    return;
                }

                resetAwaitFlag();
                const finalStreamedMessage = animationControls.completeStream(); // completeStream sẽ gọi onContentUpdate lần cuối
                setLoadingState({ isLoading: false, step: 'result_received', message: '' });


                if (!streamingIdToUse) {
                    console.error("[MessageStore _onSocketChatResult] *** CRITICAL: NO STREAMING ID FOUND AFTER COMPLETION! ***");
                    // Add as a new message if ID was lost
                    addChatMessage({ id: generateMessageId(), isUser: false, message: result.message || finalStreamedMessage || "Final result", thoughts: result.thoughts, type: 'text', timestamp: new Date().toISOString() });
                    setPendingBotMessageId(null); // <<<< RESET
                    return;
                }

                // updateMessageById đã được gọi nhiều lần bởi onContentUpdate trong animationControls
                // Bây giờ chỉ cần cập nhật các thông tin cuối cùng như thoughts, action, type
                updateMessageById(streamingIdToUse, (prevMsg) => {
                    let finalUpdates: Partial<ChatMessageType> = {
                        message: result.message || prevMsg.message, // Ưu tiên message từ server nếu có
                        thoughts: result.thoughts || prevMsg.thoughts,
                        timestamp: new Date().toISOString(), // Cập nhật timestamp
                    };
                    const action = result.action;

                    if (action?.type === 'openMap' && action.location) {
                        finalUpdates.type = 'map'; finalUpdates.location = action.location;
                        finalUpdates.message = result.message || `Showing map for: ${action.location}`;
                    } else if (action?.type === 'confirmEmailSend') {
                        finalUpdates.type = 'text'; // Or a custom type if you have specific UI for it
                        finalUpdates.message = result.message || 'Please confirm the action.';
                    } else if (action?.type === 'navigate' && !result.message) {
                        finalUpdates.message = `Okay, navigating...`; // Default message for navigation
                    }
                    return finalUpdates;
                });

                // Xử lý action
                const action = result.action;
                if (action?.type === 'navigate' && action.url) {
                    const finalUrl = constructNavigationUrl(BASE_WEB_URL, currentLocale, action.url);
                    openUrlInNewTab(finalUrl);
                } else if (action?.type === 'confirmEmailSend' && action.payload) {
                    setShowConfirmationDialog(true, action.payload as ConfirmSendEmailAction);
                }

                setPendingBotMessageId(null); // <<<< RESET pendingBotMessageId sau khi xử lý xong result
            },
            _onSocketChatError: (errorData: ErrorUpdate) => {
                // Lấy actions/state từ messageStore (store hiện tại)
                const { animationControls, resetAwaitFlag, setChatMessages: currentStoreSetChatMessages } = get(); // Lấy setChatMessages từ get() của messageStore

                // Lấy actions/state từ các store khác
                const { activeConversationId, setActiveConversationId, setIsHistoryLoaded, setIsLoadingHistory } = useConversationStore.getState();
                const { handleError } = useUiStore.getState();

                console.log("[MessageStore _onSocketChatError] Event: Chat Error received from server:", errorData);
                resetAwaitFlag();
                animationControls?.stopStreaming();

                const { step: errorStep, code: errorCode, details, message } = errorData;
                const historyLoadErrorSteps = ['history_not_found_load', 'history_load_fail_server', 'auth_required_load', 'invalid_request_load'];
                const isRelatedToActiveConv = (errorCode === 'CONVERSATION_NOT_FOUND' || errorCode === 'ACCESS_DENIED') && details?.conversationId === activeConversationId;

                if (historyLoadErrorSteps.includes(errorStep || '') || isRelatedToActiveConv) {
                    console.log(`[MessageStore _onSocketChatError] Error (${errorStep || errorCode}: "${message}") related to active/history. Resetting active conv state.`);
                    setActiveConversationId(null, { skipUiReset: true }); // Gọi action của conversationStore

                    // SỬA Ở ĐÂY: Gọi setChatMessages của messageStore
                    currentStoreSetChatMessages(() => []); // Clear messages trong messageStore

                    setIsHistoryLoaded(false); // Gọi action của conversationStore
                    setIsLoadingHistory(false); // Gọi action của conversationStore
                }
                const isFatal = errorCode === 'FATAL_SERVER_ERROR' || errorCode === 'AUTH_REQUIRED' || errorCode === 'ACCESS_DENIED';
                handleError(errorData, true, isFatal); // Gọi action của uiStore
            },
            _onSocketEmailConfirmationResult: (result) => {
                const { addChatMessage, setLoadingState } = get();
                const { confirmationData, setShowConfirmationDialog } = useUiStore.getState();

                if (result.confirmationId === confirmationData?.confirmationId) {
                    setShowConfirmationDialog(false);
                }
                addChatMessage({
                    id: generateMessageId(), message: result.message, isUser: false,
                    type: result.status === 'success' ? 'text' : 'warning', timestamp: new Date().toISOString()
                });
                setLoadingState({ isLoading: false, step: `email_${result.status}`, message: '' });
            },
        }),
        {
            name: "MessageStore",
            // No persist for messages and animation state
        }
    )
);