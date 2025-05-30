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


            // --- ĐIỀU CHỈNH _onSocketChatResult ---
            _onSocketChatResult: (result: ResultUpdate) => {
                const {
                    animationControls, setLoadingState, updateMessageById, addChatMessage,
                    pendingBotMessageId, setPendingBotMessageId: storeSetPendingBotMessageId,
                    chatMessages, resetAwaitFlag,
                } = get();
                const { currentLanguage } = useSettingsStore.getState();
                const currentLocale = currentLanguage.code;
                const { setShowConfirmationDialog } = useUiStore.getState();

                animationControls?.completeStream(); // Hoàn thành animation

                const targetMessageId = pendingBotMessageId || result.id || `result-${generateMessageId()}`;

                const createMessagePayloadFromResult = (existingMessageText?: string): Omit<ChatMessageType, 'id' | 'isUser' | 'role'> => {
                    let messageTextContent = ""; // Sẽ được xây dựng từ parts nếu result.message không có
                    let messageParts = result.parts || [];
                    let messageType: ChatMessageType['type'] = 'text';
                    let botFilesForDisplay: ChatMessageType['botFiles'] = [];
                    let locationData: string | undefined = undefined;
                    const actionData: FrontendAction | undefined = result.action;

                    // Ưu tiên result.message nếu có, nếu không thì xây dựng từ parts
                    if (result.message) {
                        messageTextContent = result.message;
                        // Nếu parts rỗng và có result.message, tạo một text part
                        if (messageParts.length === 0) {
                            messageParts = [{ text: result.message }];
                        }
                    } else if (messageParts.length > 0) {
                        messageTextContent = messageParts.filter(p => p.text).map(p => p.text).join('\n');
                    } else if (existingMessageText) { // Fallback nếu parts và result.message đều không có text
                        messageTextContent = existingMessageText;
                        messageParts = [{ text: existingMessageText }];
                    } else {
                        messageTextContent = "Task completed."; // Default cuối cùng
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

                    return {
                        text: messageTextContent, // Quan trọng: `text` được cập nhật đầy đủ
                        parts: messageParts,      // `parts` cũng được cập nhật đầy đủ
                        thoughts: result.thoughts, type: messageType, location: locationData,
                        action: actionData, timestamp: new Date().toISOString(),
                        botFiles: botFilesForDisplay.length > 0 ? botFilesForDisplay : undefined,
                    };
                };

                const existingMessage = chatMessages.find(msg => msg.id === targetMessageId);
                const payloadFromFn = createMessagePayloadFromResult(existingMessage?.text);

                if (existingMessage) {
                    updateMessageById(targetMessageId, (prevMsg) => {
                        const updatedPayload = { ...payloadFromFn, role: 'model' as const, isUser: false };
                        if (result.id && result.id !== targetMessageId) return { ...updatedPayload, id: result.id };
                        return updatedPayload;
                    });
                } else {
                    const finalId = result.id || targetMessageId;
                    addChatMessage({ id: finalId, role: 'model', isUser: false, ...payloadFromFn } as ChatMessageType);
                }

                resetAwaitFlag();
                setLoadingState({ isLoading: false, step: 'result_received', message: '', agentId: undefined });
                storeSetPendingBotMessageId(null);

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

            // --- _onSocketConversationUpdatedAfterEdit ---
            _onSocketConversationUpdatedAfterEdit: (payload: ConversationUpdatedAfterEditPayload) => {
                const { editedUserMessage: backendUserMessage, newBotMessage: backendBotMessage, conversationId } = payload;
                const { activeConversationId } = useConversationStore.getState();
                const { setLoadingState, setEditingMessageId: storeSetEditingMessageId, updateMessageById, addChatMessage } = get();

                if (activeConversationId !== conversationId) {
                    console.warn('[MessageStore _onSocketConversationUpdatedAfterEdit] Received update for a non-active conversation. Ignoring.');
                    return;
                }

                // ID của tin nhắn gốc đang được sửa (lấy từ state vì nó được set khi bắt đầu edit)
                const originalEditingId = get().editingMessageId;
                const currentPendingBotId = get().pendingBotMessageId;

                // Map backend items sang frontend type.
                const mappedEditedUserMessage = mapBackendHistoryItemToFrontendChatMessageForEdit(backendUserMessage);
                const mappedNewBotMessage = backendBotMessage ? mapBackendHistoryItemToFrontendChatMessageForEdit(backendBotMessage) : undefined;

                console.log(`[MessageStore _onSocketConversationUpdatedAfterEdit] Received definitive update. UserMsg ID (from backend, should be original ID): ${mappedEditedUserMessage.id}. Original Edit ID (from state): ${originalEditingId}. BotMsg ID (from backend): ${mappedNewBotMessage?.id}. Pending Bot ID (from state): ${currentPendingBotId}`);

                // Kiểm tra xem ID của tin nhắn user từ backend có khớp với ID đang được edit không
                if (originalEditingId !== mappedEditedUserMessage.id) {
                    console.error(`[MessageStore _onSocketConversationUpdatedAfterEdit] Mismatch! Backend editedUserMessage.id (${mappedEditedUserMessage.id}) does not match current editingMessageId (${originalEditingId}). This indicates a potential issue.`);
                    // Có thể quyết định không cập nhật hoặc xử lý lỗi khác ở đây.
                    // Để an toàn, nếu ID không khớp, có thể không làm gì để tránh làm hỏng state.
                    // Tuy nhiên, backend nên luôn trả về ID gốc của tin nhắn đã được edit.
                }

                set(state => {
                    let chatMessages = [...state.chatMessages];
                    let userMessageUpdated = false;
                    let botMessageHandled = false;

                    // 1. Cập nhật hoặc thay thế tin nhắn người dùng đã được optimistic update.
                    // Sử dụng originalEditingId để tìm tin nhắn đã được optimistic update.
                    const userMessageIndex = chatMessages.findIndex(msg => msg.id === originalEditingId);

                    if (userMessageIndex !== -1) {
                        console.log(`[MessageStore _onSocketConversationUpdatedAfterEdit] Found user message (ID: ${originalEditingId}) at index ${userMessageIndex}. Updating with data from backend.`);
                        chatMessages[userMessageIndex] = mappedEditedUserMessage; // Ghi đè bằng dữ liệu "source of truth" từ backend
                        userMessageUpdated = true;
                    } else {
                        console.warn(`[MessageStore _onSocketConversationUpdatedAfterEdit] User message (ID: ${originalEditingId}) for optimistic update not found. Adding new one from backend. This might lead to duplicates if optimistic update was incorrect.`);
                        // Nếu không tìm thấy (lỗi ở optimistic update?), thêm tin nhắn từ backend vào cuối.
                        // Điều này ít khi xảy ra nếu optimistic update chạy đúng.
                        chatMessages.push(mappedEditedUserMessage);
                    }

                    // 2. Xử lý tin nhắn bot.
                    // Tìm placeholder bot bằng ID đã lưu (currentPendingBotId).
                    const botPlaceholderIndex = currentPendingBotId ? chatMessages.findIndex(msg => msg.id === currentPendingBotId) : -1;

                    if (mappedNewBotMessage) {
                        if (botPlaceholderIndex !== -1) {
                            // Tìm thấy placeholder -> thay thế nó bằng tin nhắn bot thật từ backend.
                            console.log(`[MessageStore _onSocketConversationUpdatedAfterEdit] Replacing bot placeholder (ID: ${currentPendingBotId}) with new bot message (ID: ${mappedNewBotMessage.id}).`);
                            chatMessages[botPlaceholderIndex] = {
                                ...mappedNewBotMessage, // mappedNewBotMessage đã có ID đúng từ backend
                                // Giữ lại thoughts từ streaming nếu placeholder có và mappedNewBotMessage không có
                                thoughts: mappedNewBotMessage.thoughts || chatMessages[botPlaceholderIndex].thoughts,
                            };
                            botMessageHandled = true;
                        } else {
                            // Không tìm thấy placeholder. Điều này có thể xảy ra nếu:
                            // - currentPendingBotId là null (ví dụ, nếu chat_result đến trước conversation_updated_after_edit và đã clear nó)
                            // - Hoặc ID không khớp.
                            // Trong trường hợp này, nếu userMessageIndex hợp lệ, chèn tin nhắn bot mới vào sau tin nhắn người dùng.
                            console.warn(`[MessageStore _onSocketConversationUpdatedAfterEdit] Bot placeholder (ID: ${currentPendingBotId}) not found. Attempting to insert new bot message (ID: ${mappedNewBotMessage.id}) after user message.`);
                            if (userMessageIndex !== -1) { // Chỉ chèn nếu tin nhắn user đã được xử lý
                                chatMessages.splice(userMessageIndex + 1, 0, mappedNewBotMessage);
                                botMessageHandled = true;
                            } else {
                                // Nếu cả user message cũng không tìm thấy, thêm cả hai vào cuối
                                chatMessages.push(mappedNewBotMessage);
                                botMessageHandled = true;
                            }
                        }
                    } else {
                        // Không có tin nhắn bot mới từ backend.
                        if (botPlaceholderIndex !== -1) {
                            console.log(`[MessageStore _onSocketConversationUpdatedAfterEdit] No new bot message from backend. Removing bot placeholder (ID: ${currentPendingBotId}).`);
                            chatMessages.splice(botPlaceholderIndex, 1); // Xóa placeholder
                        }
                        botMessageHandled = true; // Đánh dấu là đã xử lý (dù là xóa)
                    }

                    // 3. Dọn dẹp: Đảm bảo chỉ có các tin nhắn đúng sau khi edit.
                    // Lấy index của user message đã được cập nhật (hoặc thêm mới).
                    const finalUserMessageIndex = chatMessages.findIndex(msg => msg.id === mappedEditedUserMessage.id);

                    if (finalUserMessageIndex !== -1) {
                        let cleanedMessages = chatMessages.slice(0, finalUserMessageIndex + 1); // Giữ lại đến user message
                        if (mappedNewBotMessage) {
                            const finalBotMessageIndex = cleanedMessages.findIndex(msg => msg.id === mappedNewBotMessage.id);
                            if (finalBotMessageIndex !== -1) { // Nếu bot message đã có trong cleanedMessages (do replace/splice)
                                // Không cần làm gì thêm, cleanedMessages đã đúng
                            } else {
                                // Nếu bot message chưa có (ví dụ, splice ở trên không thành công do finalUserMessageIndex sai)
                                // thì thêm nó vào.
                                cleanedMessages.push(mappedNewBotMessage);
                            }
                        }
                        // Các tin nhắn người dùng khác sau đó (nếu có, rất hiếm trong kịch bản edit) sẽ bị loại bỏ.
                        // Nếu muốn giữ lại, cần logic phức tạp hơn. Hiện tại, giả định edit chỉ ảnh hưởng đến cặp user-bot này.
                        chatMessages = cleanedMessages;
                    }


                    return {
                        chatMessages: chatMessages,
                        pendingBotMessageId: null, // Luôn reset pendingBotMessageId
                    };
                }, false, '_onSocketConversationUpdatedAfterEdit/applyDefinitiveUpdate');

                setLoadingState({ isLoading: false, step: 'conversation_updated_after_edit', message: '', agentId: undefined });
                storeSetEditingMessageId(null); // Reset editingMessageId SAU KHI state chatMessages đã được cập nhật
            },
        }),
        { name: "MessageStore" }
    )
);