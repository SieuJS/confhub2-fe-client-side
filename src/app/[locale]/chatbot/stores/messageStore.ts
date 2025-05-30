// src/app/[locale]/chatbot/stores/messageStore.ts
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
    EditUserMessagePayload,
    ConversationUpdatedAfterEditPayload,
    ItemFollowStatusUpdatePayload,
    PersonalizationPayload,
    HistoryItem,
    InitialHistoryPayload
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { StreamingTextAnimationControls } from '@/src/hooks/regularchat/useStreamingTextAnimation';
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { appConfig } from '@/src/middleware';
import { useSettingsStore } from './setttingsStore';
import { useSocketStore } from './socketStore';
import { useUiStore } from './uiStore';
import { useConversationStore } from './conversationStore';
import { UserResponse } from '@/src/models/response/user.response';
import { Part } from "@google/genai";

const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";

function mapBackendHistoryItemToFrontendChatMessageForEdit(backendItem: HistoryItem): ChatMessageType {
    const textContent = backendItem.parts?.find(p => p.text)?.text ||
        (backendItem.parts?.some(p => p.inlineData || p.fileData) ? `[${backendItem.parts.length} parts content]` : "");
    let messageType: ChatMessageType['type'] = 'text';
    const botFilesForDisplay: ChatMessageType['botFiles'] = [];
    let hasNonTextPart = false;

    backendItem.parts?.forEach(part => {
        if (part.fileData) {
            const mimeType = part.fileData.mimeType || 'application/octet-stream';
            botFilesForDisplay.push({ uri: part.fileData.fileUri, mimeType: mimeType });
            hasNonTextPart = true;
        } else if (part.inlineData) {
            if (part.inlineData.data && part.inlineData.mimeType) {
                botFilesForDisplay.push({
                    mimeType: part.inlineData.mimeType,
                    inlineData: { data: part.inlineData.data, mimeType: part.inlineData.mimeType }
                });
                hasNonTextPart = true;
            }
        }
    });
    if (hasNonTextPart) messageType = 'multimodal';

    return {
        id: backendItem.uuid || `msg-${Date.now()}-${Math.random()}`,
        role: backendItem.role,
        parts: backendItem.parts,
        text: textContent,
        isUser: backendItem.role === 'user',
        type: messageType,
        timestamp: backendItem.timestamp || new Date().toISOString(),
        thoughts: undefined, // Backend history item typically doesn't have live thoughts
        botFiles: botFilesForDisplay.length > 0 ? botFilesForDisplay : undefined,
        // action: backendItem.action, // Giả sử backendItem có thể có action
        // location: backendItem.location, // Giả sử backendItem có thể có location
    };
}

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
    editingMessageId: string | null;
}

export interface MessageStoreActions {
    setChatMessages: (newMessagesOrUpdater: ChatMessageType[] | ((prev: ChatMessageType[]) => ChatMessageType[])) => void;
    addChatMessage: (message: ChatMessageType) => void;
    updateMessageById: (messageId: string, updates: Partial<ChatMessageType> | ((prev: ChatMessageType) => Partial<ChatMessageType>)) => void;
    setLoadingState: (loadingState: LoadingState) => void;
    setAnimationControls: (controls: StreamingTextAnimationControls | null) => void;
    resetAwaitFlag: () => void;
    setPendingBotMessageId: (id: string | null) => void;
    sendMessage: (parts: Part[], userFilesForDisplay?: ChatMessageType['files']) => void;
    resetChatUIForNewConversation: (clearActiveIdInOtherStores?: boolean) => void;
    setEditingMessage: (editingState: EditingMessageState | null) => void;
    submitEditedMessage: (messageIdToEdit: string, newText: string) => void;
    setEditingMessageId: (messageId: string | null) => void;
    clearAuthErrorMessages: () => void;
    _onSocketStatusUpdate: (data: StatusUpdate) => void;
    _onSocketChatUpdate: (data: ChatUpdate) => void;
    _onSocketChatResult: (data: ResultUpdate) => void;
    _onSocketChatError: (errorData: ErrorUpdate) => void;
    _onSocketEmailConfirmationResult: (result: EmailConfirmationResult) => void;
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


// Helper function to get personalization data
const getPersonalizationData = (): PersonalizationPayload | null => {
    const { isPersonalizationEnabled } = useSettingsStore.getState();
    if (!isPersonalizationEnabled) {
        return null;
    }

    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userStr) {
        return null;
    }

    try {
        const userData = JSON.parse(userStr) as UserResponse; // Assuming UserResponse type from your AuthContext
        return {
            firstName: userData.firstName,
            lastName: userData.lastName,
            aboutMe: userData.aboutMe,
            interestedTopics: userData.interestedTopics,
        };
    } catch (error) {
        console.error("Error parsing user data from localStorage for personalization:", error);
        return null;
    }
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
                    editingMessageId: null,
                }, false, 'resetChatUIForNewConversation/messages');
                get().animationControls?.stopStreaming();
                get().resetAwaitFlag();
                if (clearActiveIdInOtherStores) {
                    // Potentially clear active conversation ID in conversationStore if needed
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



            sendMessage: (parts, userFilesForDisplay) => { // <<< NEW IMPLEMENTATION
                const { addChatMessage, setLoadingState, animationControls, resetAwaitFlag, setPendingBotMessageId } = get();
                const { isStreamingEnabled, currentLanguage } = useSettingsStore.getState(); // isPersonalizationEnabled is also here
                const { hasFatalConnectionError } = useSocketStore.getState();
                const { handleError, hasFatalError: uiHasFatalError } = useUiStore.getState();
                const { activeConversationId } = useConversationStore.getState();

                if (parts.length === 0) {
                    console.warn("[MessageStore] sendMessage called with empty parts.");
                    return;
                }

                if (hasFatalConnectionError || uiHasFatalError) {
                    handleError({ message: "Cannot send message: A critical error occurred.", type: 'error', step: 'send_message_fail_fatal' } as any, false, false);
                    return;
                }

                animationControls?.stopStreaming();
                resetAwaitFlag();
                setLoadingState({ isLoading: true, step: 'sending', message: 'Sending...', agentId: undefined });

                const textContent = parts.find(part => 'text' in part)?.text || (userFilesForDisplay && userFilesForDisplay.length > 0 ? `${userFilesForDisplay.length} file(s) sent` : "Message sent");

                const newUserMessage: ChatMessageType = {
                    id: generateMessageId(),
                    role: 'user', // <<< THÊM role
                    parts: parts,
                    text: textContent,
                    isUser: true, // <<< Đảm bảo isUser
                    type: userFilesForDisplay && userFilesForDisplay.length > 0 ? 'multimodal' : 'text',
                    timestamp: new Date().toISOString(),
                    files: userFilesForDisplay,
                };
                addChatMessage(newUserMessage);

                const botPlaceholderId = `bot-pending-${generateMessageId()}`;
                setPendingBotMessageId(botPlaceholderId);

                const personalizationInfo = getPersonalizationData();


                // The payload for socketStore.emitSendMessage needs to match its expected type
                // which should now also be Part[] based
                useSocketStore.getState().emitSendMessage({
                    parts: parts, // Send the structured parts
                    isStreaming: isStreamingEnabled,
                    language: currentLanguage.code,
                    conversationId: activeConversationId,
                    frontendMessageId: newUserMessage.id, // ID of the message added to UI
                    personalizationData: personalizationInfo,
                });
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


            // --- ĐIỀU CHỈNH _onSocketChatUpdate ---
            _onSocketChatUpdate: (update: ChatUpdate) => {
                const {
                    animationControls,
                    isAwaitingFinalResultRef,
                    addChatMessage,
                    setLoadingState,
                    pendingBotMessageId,
                    chatMessages,
                    setPendingBotMessageId: storeSetPendingBotMessageId,
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
                    storeSetPendingBotMessageId(targetMessageId);
                }

                const existingBotMessage = chatMessages.find(msg => msg.id === targetMessageId);

                if (!existingBotMessage) {
                    addChatMessage({
                        id: targetMessageId,
                        role: 'model',
                        parts: [{ text: '' }], // Khởi tạo parts với text rỗng
                        text: '',             // Quan trọng: Khởi tạo text rỗng cho animation
                        isUser: false,
                        type: 'text',         // Bắt đầu là text
                        thoughts: [],
                        timestamp: new Date().toISOString()
                    });
                    const streamingMessage = currentAgentId && currentAgentId !== 'HostAgent' ? `[${currentAgentId}] Receiving...` : 'Receiving...';
                    setLoadingState({ isLoading: true, step: 'streaming_response', message: streamingMessage, agentId: currentAgentId });
                }

                if (!currentStreamingIdByControls || currentStreamingIdByControls !== targetMessageId) {
                    animationControls.startStreaming(targetMessageId);
                }
                if (!isAwaitingFinalResultRef.current) {
                    isAwaitingFinalResultRef.current = true;
                }

                // Chỉ xử lý textChunk cho animation.
                // updateCallbackForAnimation (được gọi bởi processChunk) sẽ cập nhật trường `text`.
                if (update.textChunk) {
                    animationControls.processChunk(update.textChunk);
                }

                // Nếu server gửi `parts` trong `chat_update` (ví dụ, cho non-text elements)
                // Cập nhật trường `parts` mà KHÔNG chạm vào trường `text` ở đây.
                if (update.parts && update.parts.length > 0) {
                    updateMessageById(targetMessageId, prevMsg => {
                        let newCombinedParts = [...(prevMsg.parts || [])];
                        let hasNewNonTextContent = false;

                        update.parts!.forEach(newPart => {
                            if (newPart.text) {
                                // Không xử lý newPart.text ở đây để tránh xung đột với animation
                                // Giả định textChunk là nguồn chính cho text đang stream.
                                // Nếu newPart.text là toàn bộ text đã stream, nó sẽ được xử lý ở chat_result.
                            } else if (newPart.inlineData || newPart.fileData) {
                                // Chỉ thêm các non-text parts mới
                                // Cần logic phức tạp hơn nếu muốn merge/update non-text parts đã có
                                newCombinedParts.push(newPart);
                                hasNewNonTextContent = true;
                            }
                        });
                        // Nếu có non-text parts mới, cập nhật type thành multimodal
                        const newType = hasNewNonTextContent ? 'multimodal' : prevMsg.type;
                        return { parts: newCombinedParts, type: newType }; // Chỉ cập nhật parts và type
                    });
                }
            },


            // --- _onSocketChatResult (Đảm bảo giữ lại thoughts) ---
            _onSocketChatResult: (result: ResultUpdate) => {
                const {
                    animationControls, setLoadingState, updateMessageById, addChatMessage,
                    pendingBotMessageId, setPendingBotMessageId: storeSetPendingBotMessageId,
                    chatMessages, resetAwaitFlag,
                } = get();
                const { currentLanguage } = useSettingsStore.getState();
                const currentLocale = currentLanguage.code;
                const { setShowConfirmationDialog } = useUiStore.getState();

                animationControls?.completeStream();

                const targetMessageId = pendingBotMessageId || result.id || `result-${generateMessageId()}`;
                const existingMessageForThoughts = chatMessages.find(msg => msg.id === targetMessageId);

                const createMessagePayloadFromResult = (
                    // existingTextForFallback?: string, // Không cần thiết nếu result.parts hoặc result.message luôn có
                    currentThoughts?: ThoughtStep[] // Truyền thoughts hiện tại của tin nhắn
                ): Omit<ChatMessageType, 'id' | 'isUser' | 'role'> => {
                    let messageTextContent = "";
                    let messageParts = result.parts || [];
                    let messageType: ChatMessageType['type'] = 'text';
                    let botFilesForDisplay: ChatMessageType['botFiles'] = [];
                    let locationData: string | undefined = undefined;
                    const actionData: FrontendAction | undefined = result.action;

                    if (result.message) {
                        messageTextContent = result.message;
                        if (messageParts.length === 0) messageParts = [{ text: result.message }];
                    } else if (messageParts.length > 0) {
                        messageTextContent = messageParts.filter(p => p.text).map(p => p.text).join('\n');
                    } else {
                        messageTextContent = "Result received."; // Fallback
                        messageParts = [{ text: messageTextContent }];
                    }

                    let hasNonTextPart = false;
                    messageParts.forEach(part => {

                        if (part.fileData) { /* ... (logic giữ nguyên) ... */
                            const mimeType = part.fileData.mimeType || 'application/octet-stream';
                            botFilesForDisplay.push({ uri: part.fileData.fileUri, mimeType: mimeType });
                            hasNonTextPart = true;
                        } else if (part.inlineData) { /* ... (logic giữ nguyên) ... */
                            if (part.inlineData.data && part.inlineData.mimeType) {
                                botFilesForDisplay.push({
                                    mimeType: part.inlineData.mimeType,
                                    inlineData: { data: part.inlineData.data, mimeType: part.inlineData.mimeType }
                                });
                                hasNonTextPart = true;
                            } else { console.warn("[MessageStore] Received inlineData part missing essential data or mimeType:", part.inlineData); }
                        }
                    });
                    if (hasNonTextPart) messageType = 'multimodal';
                    else if (messageParts.every(p => p.text) && messageParts.length > 0) messageType = 'text';


                    // Handle specific action types to potentially override messageType or content
                    if (actionData?.type === 'openMap' && actionData.location) {
                        messageType = 'map';
                        locationData = actionData.location;
                        if (!result.message && !messageParts.some(p => p.text)) {
                            messageTextContent = `Showing map for: ${actionData.location}`;
                            messageParts = [{ text: messageTextContent }];
                        }
                    } else if (actionData?.type === 'itemFollowStatusUpdated') {
                        messageType = 'follow_update';
                        if (!result.message && !messageParts.some(p => p.text) && actionData.payload) {
                            const followPayload = actionData.payload as ItemFollowStatusUpdatePayload;
                            messageTextContent = followPayload.followed ? "Item followed." : "Item unfollowed.";
                            messageParts = [{ text: messageTextContent }];
                        }
                    } else if (actionData?.type === 'confirmEmailSend') {
                        if (!result.message && !messageParts.some(p => p.text)) {
                            messageTextContent = 'Please confirm the action.';
                            messageParts = [{ text: messageTextContent }];
                        }
                    } else if (actionData?.type === 'navigate' && (!result.message && !messageParts.some(p => p.text))) {
                        messageTextContent = `Okay, navigating...`;
                        messageParts = [{ text: messageTextContent }];
                    }


                    // Đảm bảo messageTextContent và messageParts không rỗng một cách không cần thiết
                    if (!messageTextContent && messageParts.length === 0 && botFilesForDisplay.length > 0) {
                        messageTextContent = `${botFilesForDisplay.length} file(s) received.`;
                    } else if (!messageTextContent && messageParts.length === 0 && !actionData && botFilesForDisplay.length === 0) {
                        messageTextContent = "Result received.";
                        messageParts = [{ text: messageTextContent }];
                    }

                    // Xử lý thoughts:
                    // Ưu tiên thoughts từ result nếu có và không rỗng, nếu không thì giữ lại currentThoughts.
                    const finalThoughts = (result.thoughts && result.thoughts.length > 0)
                        ? result.thoughts
                        : currentThoughts;

                    return {
                        text: messageTextContent,
                        parts: messageParts,
                        thoughts: finalThoughts, // <<< SỬ DỤNG finalThoughts
                        type: messageType,
                        location: locationData,
                        action: actionData,
                        timestamp: new Date().toISOString(),
                        botFiles: botFilesForDisplay.length > 0 ? botFilesForDisplay : undefined,
                    };
                };


                const payloadFromFn = createMessagePayloadFromResult(existingMessageForThoughts?.thoughts);

                if (existingMessageForThoughts) {
                    updateMessageById(targetMessageId, (prevMsg) => {
                        // prevMsg là existingMessageForThoughts
                        const updatedPayload = {
                            ...payloadFromFn, // payloadFromFn đã có logic giữ lại/cập nhật thoughts
                            role: 'model' as const,
                            isUser: false
                        };
                        if (result.id && result.id !== targetMessageId) {
                            return { ...updatedPayload, id: result.id }; // Cập nhật ID nếu backend trả về ID khác
                        }
                        return updatedPayload;
                    });
                } else {
                    const finalId = result.id || targetMessageId;
                    addChatMessage({ id: finalId, role: 'model', isUser: false, ...payloadFromFn } as ChatMessageType);
                }

                resetAwaitFlag();
                setLoadingState({ isLoading: false, step: 'result_received', message: '', agentId: undefined });
                storeSetPendingBotMessageId(null); // Quan trọng: Reset pending ID sau khi xử lý xong result


                const finalAction = payloadFromFn.action;
                if (finalAction?.type === 'navigate' && finalAction.url) {
                    const finalUrl = constructNavigationUrl(BASE_WEB_URL, currentLocale, finalAction.url);
                    openUrlInNewTab(finalUrl);
                } else if (finalAction?.type === 'confirmEmailSend' && finalAction.payload) {
                    setShowConfirmationDialog(true, finalAction.payload as ConfirmSendEmailAction);
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
                    currentStoreSetChatMessages(() => []); // Clear messages for this conversation
                    setIsHistoryLoaded(false);
                    setIsLoadingHistory(false);
                }
                const isFatal = errorCode === 'FATAL_SERVER_ERROR' || errorCode === 'AUTH_REQUIRED' || errorCode === 'ACCESS_DENIED';
                handleError(errorData, true, isFatal);
                setLoadingState({ isLoading: false, step: errorData.step || 'error_received', message: errorData.message, agentId: undefined });
            },

            _onSocketEmailConfirmationResult: (emailResult: EmailConfirmationResult) => {
                const { addChatMessage, setLoadingState } = get();
                const { confirmationData, setShowConfirmationDialog } = useUiStore.getState();

                if (confirmationData && emailResult.confirmationId === confirmationData.confirmationId) {
                    setShowConfirmationDialog(false); // Close dialog
                }
                // Add a message to the chat indicating the result of the email action
                addChatMessage({
                    id: generateMessageId(),
                    role: 'model', // <<< THÊM role
                    parts: [{ text: emailResult.message }], // Tạo parts cho tin nhắn text
                    text: emailResult.message,
                    isUser: false, // <<< Đảm bảo isUser
                    type: emailResult.status === 'success' ? 'text' : 'warning',
                    timestamp: new Date().toISOString()
                });
                setLoadingState({ isLoading: false, step: `email_${emailResult.status}`, message: '', agentId: undefined });
            },

            // --- submitEditedMessage ---
            submitEditedMessage: (messageIdToEdit, newText) => {
                const { setChatMessages, setLoadingState, animationControls, resetAwaitFlag, setPendingBotMessageId, setEditingMessageId: storeSetEditingMessageId } = get();
                const { currentLanguage } = useSettingsStore.getState();
                const { activeConversationId } = useConversationStore.getState();

                if (!activeConversationId) {
                    console.warn("[MessageStore submitEditedMessage] No active conversation ID.");
                    return;
                }
                const trimmedNewText = newText.trim();
                if (!trimmedNewText) {
                    console.warn("[MessageStore submitEditedMessage] New text is empty after trimming.");
                    // Optionally, cancel edit mode if text is empty
                    // storeSetEditingMessageId(null);
                    return;
                }

                console.log(`[MessageStore submitEditedMessage] Submitting edit for message ID: ${messageIdToEdit} in conv: ${activeConversationId}`);

                animationControls?.stopStreaming(); // Dừng streaming hiện tại (nếu có)
                resetAwaitFlag(); // Reset cờ chờ kết quả

                const newBotResponsePlaceholderId = `bot-edit-resp-${generateMessageId()}`;

                // Optimistic Update
                setChatMessages(currentMessages => {
                    const userMessageIndex = currentMessages.findIndex(msg => msg.id === messageIdToEdit);
                    if (userMessageIndex === -1) {
                        console.warn(`[MessageStore submitEditedMessage] Message to edit (ID: ${messageIdToEdit}) not found for optimistic update.`);
                        return currentMessages; // Không thay đổi nếu không tìm thấy
                    }

                    const originalMessage = currentMessages[userMessageIndex];
                    const updatedUserMessage: ChatMessageType = {
                        ...originalMessage, // Giữ lại các trường như files, botFiles nếu có (trừ khi edit làm thay đổi chúng)
                        id: messageIdToEdit, // ID không đổi
                        role: 'user',
                        parts: [{ text: trimmedNewText }],
                        text: trimmedNewText,
                        isUser: true,
                        timestamp: new Date().toISOString(), // Cập nhật timestamp
                        type: 'text', // Giả sử edit luôn là text, nếu có thể edit multimodal thì cần logic phức tạp hơn
                        // Xóa các trường có thể không còn liên quan sau khi edit thành text
                        action: undefined,
                        location: undefined,
                        thoughts: undefined, // Thoughts của user message thường không có, nhưng xóa để chắc chắn
                        // files: originalMessage.files, // Giữ lại file người dùng nếu có và edit không xóa chúng
                        // botFiles: undefined, // Tin nhắn user không có botFiles
                    };

                    // Xây dựng danh sách tin nhắn mới:
                    // Bao gồm các tin nhắn TRƯỚC tin nhắn được edit,
                    // tin nhắn đã edit, và placeholder cho bot.
                    // Điều này sẽ loại bỏ tất cả các tin nhắn SAU tin nhắn đang được edit.
                    let newMessagesList = currentMessages.slice(0, userMessageIndex);
                    newMessagesList.push(updatedUserMessage);

                    const botPlaceholder: ChatMessageType = {
                        id: newBotResponsePlaceholderId,
                        role: 'model',
                        parts: [{ text: '' }], // Placeholder
                        text: '',
                        isUser: false,
                        type: 'text', // Bắt đầu là text
                        timestamp: new Date().toISOString(),
                        thoughts: [], // Khởi tạo thoughts rỗng
                    };
                    newMessagesList.push(botPlaceholder);
                    console.log(`[MessageStore submitEditedMessage] Optimistic update: UserMsg (ID ${updatedUserMessage.id}) updated, BotPlaceholder (ID ${botPlaceholder.id}) added. New list length: ${newMessagesList.length}`);
                    return newMessagesList;
                });

                setPendingBotMessageId(newBotResponsePlaceholderId); // ID của placeholder bot cho streaming/result
                // editingMessageId đã được set khi người dùng bắt đầu edit, không cần set lại ở đây.
                // Nó sẽ được reset trong _onSocketConversationUpdatedAfterEdit.

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
            },

            // --- _onSocketConversationUpdatedAfterEdit (Đảm bảo giữ lại thoughts) ---
            _onSocketConversationUpdatedAfterEdit: (payload: ConversationUpdatedAfterEditPayload) => {
                const { editedUserMessage: backendUserMessage, newBotMessage: backendBotMessage, conversationId } = payload;
                const { activeConversationId } = useConversationStore.getState();
                const { setLoadingState, setEditingMessageId: storeSetEditingMessageId } = get();

                if (activeConversationId !== conversationId) {
                    console.warn('[MessageStore _onSocketConvUpdatedAfterEdit] Received update for a non-active conversation. Ignoring.');
                    return;
                }

                const originalEditingId = get().editingMessageId; // ID của tin nhắn user gốc đang được sửa
                const currentPendingBotId = get().pendingBotMessageId; // ID của placeholder bot cho phản hồi edit

                const mappedEditedUserMessage = mapBackendHistoryItemToFrontendChatMessageForEdit(backendUserMessage);
                // mappedNewBotMessageDataOnly từ backend (HistoryItem) sẽ không có "live thoughts"
                const mappedNewBotMessageDataOnly = backendBotMessage ? mapBackendHistoryItemToFrontendChatMessageForEdit(backendBotMessage) : undefined;

                console.log(`[MessageStore _onSocketConvUpdatedAfterEdit] Definitive. UserMsg ID (backend): ${mappedEditedUserMessage.id}. Original Edit ID (state): ${originalEditingId}. BotMsg ID (backend): ${mappedNewBotMessageDataOnly?.id}. Pending Bot ID (state): ${currentPendingBotId}`);

                set(state => {
                    let chatMessages = [...state.chatMessages];
                    const userMessageIndex = chatMessages.findIndex(msg => msg.id === originalEditingId);

                    if (userMessageIndex === -1) {
                        console.warn(`[MessageStore _onSocketConvUpdatedAfterEdit] User message (ID: ${originalEditingId}) not found for definitive update.`);
                        return { chatMessages: state.chatMessages, pendingBotMessageId: state.pendingBotMessageId };
                    }

                    // 1. Cập nhật tin nhắn người dùng bằng dữ liệu "source of truth" từ backend
                    chatMessages[userMessageIndex] = mappedEditedUserMessage;

                    // 2. Xử lý tin nhắn bot
                    // Tìm tin nhắn placeholder bot (nơi thoughts đã được tích lũy/hoàn thiện bởi _onSocketChatResult)
                    const botPlaceholderBeingFinalized = currentPendingBotId ? chatMessages.find(msg => msg.id === currentPendingBotId) : undefined;

                    if (mappedNewBotMessageDataOnly) {
                        let targetBotMsgForUpdate: ChatMessageType | undefined = undefined;
                        let targetBotMsgIndex = -1;

                        if (botPlaceholderBeingFinalized) { // Ưu tiên tìm bằng pending ID (nếu chưa bị clear)
                            targetBotMsgForUpdate = botPlaceholderBeingFinalized;
                            targetBotMsgIndex = chatMessages.findIndex(msg => msg.id === targetBotMsgForUpdate!.id);
                        } else { // Nếu pending ID đã clear (do chat_result đã xử lý), tìm bằng ID cuối cùng từ backend
                            targetBotMsgIndex = chatMessages.findIndex(msg => msg.id === mappedNewBotMessageDataOnly.id);
                            if (targetBotMsgIndex !== -1) {
                                targetBotMsgForUpdate = chatMessages[targetBotMsgIndex];
                            }
                        }

                        if (targetBotMsgForUpdate && targetBotMsgIndex !== -1) {
                            // Đã tìm thấy tin nhắn bot (dù là placeholder hay đã hoàn thiện bởi chat_result)
                            // Hợp nhất: dữ liệu từ backend (ID, parts, text cuối) + thoughts từ phiên bản trên UI
                            chatMessages[targetBotMsgIndex] = {
                                ...mappedNewBotMessageDataOnly, // Dữ liệu chính từ backend (ID, parts, text đã lưu)
                                text: targetBotMsgForUpdate.text, // Giữ lại text đã stream nếu khác với text đã lưu
                                parts: mappedNewBotMessageDataOnly.parts && mappedNewBotMessageDataOnly.parts.length > 0 ? mappedNewBotMessageDataOnly.parts : targetBotMsgForUpdate.parts, // Ưu tiên parts từ backend nếu có
                                thoughts: targetBotMsgForUpdate.thoughts, // QUAN TRỌNG: Giữ lại thoughts từ UI
                                // Các trường khác như type, action, location sẽ lấy từ mappedNewBotMessageDataOnly
                            };
                            console.log(`[MessageStore _onSocketConvUpdatedAfterEdit] Updated/Finalized bot message (ID: ${chatMessages[targetBotMsgIndex].id}) preserving thoughts.`);
                        } else {
                            // Không tìm thấy -> chèn mới (ít xảy ra)
                            console.warn(`[MessageStore _onSocketConvUpdatedAfterEdit] Bot message (Placeholder ID: ${currentPendingBotId}, Backend ID: ${mappedNewBotMessageDataOnly.id}) not found. Inserting new.`);
                            chatMessages.splice(userMessageIndex + 1, 0, { ...mappedNewBotMessageDataOnly, thoughts: undefined }); // Chèn mới không có thoughts
                        }
                    } else { // Không có tin nhắn bot mới từ backend
                        if (botPlaceholderBeingFinalized) {
                            const idxToRemove = chatMessages.findIndex(msg => msg.id === botPlaceholderBeingFinalized.id);
                            if (idxToRemove !== -1) {
                                console.log(`[MessageStore _onSocketConvUpdatedAfterEdit] No new bot message. Removing placeholder (ID: ${botPlaceholderBeingFinalized.id}).`);
                                chatMessages.splice(idxToRemove, 1);
                            }
                        }
                    }

                    // 3. Dọn dẹp cuối cùng để đảm bảo đúng cấu trúc
                    const finalUserMsgIdx = chatMessages.findIndex(m => m.id === mappedEditedUserMessage.id);
                    if (finalUserMsgIdx !== -1) {
                        let cleanedMessages = chatMessages.slice(0, finalUserMsgIdx + 1);
                        if (mappedNewBotMessageDataOnly) {
                            // Tìm lại tin nhắn bot đã được hoàn thiện (có thể ID đã thay đổi)
                            const finalBotMsgInArray = chatMessages.find(m => m.id === mappedNewBotMessageDataOnly.id);
                            if (finalBotMsgInArray) {
                                cleanedMessages.push(finalBotMsgInArray);
                            }
                        }
                        chatMessages = cleanedMessages;
                    }

                    return {
                        chatMessages,
                        pendingBotMessageId: null, // Quan trọng: Reset pending ID
                    };
                }, false, '_onSocketConversationUpdatedAfterEdit/applyAndCleanDefinitive');

                setLoadingState({ isLoading: false, step: 'conversation_updated_after_edit', message: '', agentId: undefined });
                storeSetEditingMessageId(null); // Reset ID đang edit
            },
        }),
        { name: "MessageStore" }
    )
);