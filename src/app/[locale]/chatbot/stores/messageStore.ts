// src/app/[locale]/chatbot/stores/messageStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    ChatMessageType, // Updated type
    LoadingState,
    ThoughtStep,
    ErrorUpdate,
    ChatUpdate, // Expect this to have textChunk, and optionally parts for more complex streaming
    ResultUpdate, // Expect this to have message (string) and/or parts (Part[])
    EmailConfirmationResult,
    ConfirmSendEmailAction,
    StatusUpdate,
    FrontendAction,
    EditUserMessagePayload, // <<< NEW
    ConversationUpdatedAfterEditPayload, // <<< NEW
    ItemFollowStatusUpdatePayload,
    PersonalizationPayload, // Already here
    HistoryItem,
    InitialHistoryPayload
    // SendMessagePayload as SocketSendMessagePayload // Rename to avoid confusion if needed

} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { StreamingTextAnimationControls } from '@/src/hooks/regularchat/useStreamingTextAnimation';
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { appConfig } from '@/src/middleware';
import { useSettingsStore } from './setttingsStore';
import { useSocketStore } from './socketStore';
import { useUiStore } from './uiStore';
import { useConversationStore } from './conversationStore';
import { UserResponse } from '@/src/models/response/user.response';
import { Part } from "@google/genai"; // <<< IMPORT Part

const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";


// Helper function để map (nếu cần, hoặc có thể làm inline)
function mapBackendHistoryItemToFrontendChatMessageForEdit(backendItem: HistoryItem): ChatMessageType {
    // backendItem.parts là Part[]
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
                    inlineData: {
                        data: part.inlineData.data,
                        mimeType: part.inlineData.mimeType
                    }
                });
                hasNonTextPart = true;
            }
        }
    });

    if (hasNonTextPart) {
        messageType = 'multimodal';
    }
    // TODO: Logic để xác định messageType dựa trên action (ví dụ: 'map') nếu có action trong backendItem.parts
    // (Hiện tại HistoryItem không có trường 'action' trực tiếp, nó nằm trong Part.functionCall/Response)

    return {
        id: backendItem.uuid || `msg-${Date.now()}-${Math.random()}`, // Đảm bảo có id
        role: backendItem.role, // Giữ lại role nếu ChatMessageType có
        parts: backendItem.parts, // Giữ lại parts gốc
        text: textContent,
        isUser: backendItem.role === 'user',
        type: messageType,
        timestamp: backendItem.timestamp || new Date().toISOString(),
        thoughts: undefined, // backendItem không có thoughts trực tiếp, thoughts thường đi kèm ResultUpdate
        botFiles: botFilesForDisplay.length > 0 ? botFilesForDisplay : undefined,
        // files: undefined, // 'files' trong ChatMessageType là cho file người dùng gửi, không áp dụng ở đây
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
    // sendMessage: (userInput: string) => void; // <<< OLD
    sendMessage: (parts: Part[], userFilesForDisplay?: ChatMessageType['files']) => void; // <<< NEW: Takes Parts array

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
                const { setChatMessages, setLoadingState, animationControls, resetAwaitFlag, setPendingBotMessageId } = get();
                const { currentLanguage } = useSettingsStore.getState();
                const { activeConversationId } = useConversationStore.getState(); // Lấy từ store khác

                if (!activeConversationId) return;
                const trimmedNewText = newText.trim();
                if (!trimmedNewText) return;

                animationControls?.stopStreaming();
                resetAwaitFlag();
                const newBotResponsePlaceholderId = `bot-edit-resp-${generateMessageId()}`;

                setChatMessages(currentMessages => {
                    const userMessageIndex = currentMessages.findIndex(msg => msg.id === messageIdToEdit);
                    if (userMessageIndex === -1) return currentMessages;

                    const updatedUserMessage: ChatMessageType = {
                        ...currentMessages[userMessageIndex], // Giữ lại các trường không thay đổi
                        id: messageIdToEdit, // Đảm bảo id không đổi
                        role: 'user', // <<< THÊM role
                        parts: [{ text: trimmedNewText }],
                        text: trimmedNewText,
                        isUser: true, // <<< Đảm bảo isUser
                        timestamp: new Date().toISOString(),
                        type: 'text',
                        files: undefined, // Xóa file khi sửa thành text
                        botFiles: undefined, // Xóa botFiles
                        action: undefined, // Xóa action
                        thoughts: undefined, // Xóa thoughts
                    };

                    let newMessagesList = currentMessages.slice(0, userMessageIndex);
                    newMessagesList.push(updatedUserMessage);

                    const botPlaceholder: ChatMessageType = {
                        id: newBotResponsePlaceholderId,
                        role: 'model', // <<< THÊM role
                        parts: [{ text: '' }], // Placeholder parts
                        text: '',
                        isUser: false, // <<< Đảm bảo isUser
                        type: 'text',
                        timestamp: new Date().toISOString(),
                        thoughts: [],
                    };
                    newMessagesList.push(botPlaceholder);
                    return newMessagesList;
                });
                setPendingBotMessageId(newBotResponsePlaceholderId);
                setLoadingState({ isLoading: true, step: 'updating_message', message: 'Updating message...', agentId: undefined });
                const personalizationInfo = getPersonalizationData();
                const payload: EditUserMessagePayload & { personalizationData?: PersonalizationPayload | null } = {
                    conversationId: activeConversationId!, messageIdToEdit: messageIdToEdit, newText: trimmedNewText,
                    language: currentLanguage.code, personalizationData: personalizationInfo,
                };
                useSocketStore.getState().emitEditUserMessage(payload);
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

            _onSocketConversationUpdatedAfterEdit: (payload: ConversationUpdatedAfterEditPayload) => {
                const { editedUserMessage, newBotMessage, conversationId } = payload;
                const { activeConversationId } = useConversationStore.getState();
                const { setLoadingState } = get(); // Removed unused vars

                if (activeConversationId !== conversationId) {
                    console.warn('[MessageStore] Received conversation_updated_after_edit for a non-active conversation. Ignoring.');
                    return;
                }
                const mappedEditedUserMessage = mapBackendHistoryItemToFrontendChatMessageForEdit(payload.editedUserMessage as any); // Cast 'as any' nếu type chưa khớp hoàn toàn
                const mappedNewBotMessage = payload.newBotMessage ? mapBackendHistoryItemToFrontendChatMessageForEdit(payload.newBotMessage as any) : undefined; // Cast 'as any'

                console.log(`[MessageStore _onSocketConversationUpdatedAfterEdit] Processing update. User Msg: ${mappedEditedUserMessage.id}, Bot Msg: ${mappedNewBotMessage?.id}`);

                set(state => {
                    let currentMessages = [...state.chatMessages];
                    const userMessageIndex = currentMessages.findIndex(msg => msg.id === editedUserMessage.id);

                    if (userMessageIndex === -1) {
                        console.warn(`[MessageStore _onSocketConversationUpdatedAfterEdit] Original user message ${mappedEditedUserMessage.id} not found.`);
                        // Xử lý thêm tin nhắn nếu không tìm thấy (ít xảy ra nếu optimistic update tốt)
                        currentMessages.push(mappedEditedUserMessage);
                        if (mappedNewBotMessage) currentMessages.push(mappedNewBotMessage);
                        return { chatMessages: currentMessages };
                    }

                    // Cập nhật tin nhắn người dùng
                    currentMessages[userMessageIndex] = mappedEditedUserMessage;

                    // Xử lý tin nhắn bot
                    if (mappedNewBotMessage) {
                        const existingBotMessageIndex = currentMessages.findIndex(msg => msg.id === mappedNewBotMessage.id);
                        if (existingBotMessageIndex !== -1) {
                            // Bot message (placeholder) đã tồn tại, cập nhật nó
                            currentMessages[existingBotMessageIndex] = {
                                ...currentMessages[existingBotMessageIndex], // Giữ lại thoughts từ streaming nếu có
                                ...mappedNewBotMessage,
                                thoughts: currentMessages[existingBotMessageIndex].thoughts || mappedNewBotMessage.thoughts,
                            };
                        } else {
                            // Thêm bot message mới (nếu không có placeholder, hoặc ID khác)
                            // Chèn vào sau tin nhắn người dùng đã sửa
                            currentMessages.splice(userMessageIndex + 1, 0, mappedNewBotMessage);
                        }
                        // Loại bỏ các tin nhắn bot cũ có thể còn sót lại giữa tin nhắn người dùng đã sửa và tin nhắn bot mới
                        currentMessages = currentMessages.filter((msg, index) => {
                            if (index > userMessageIndex && !msg.isUser && msg.id !== mappedNewBotMessage.id) {
                                return false; // Loại bỏ tin nhắn bot cũ không mong muốn
                            }
                            return true;
                        });

                    } else {
                        // Không có tin nhắn bot mới, loại bỏ các tin nhắn bot ngay sau tin nhắn người dùng đã sửa
                        currentMessages = currentMessages.filter((msg, index) => {
                            if (index > userMessageIndex && !msg.isUser) {
                                return false;
                            }
                            return true;
                        });
                    }
                    return { chatMessages: currentMessages };
                }, false, '_onSocketConversationUpdatedAfterEdit/applyDefinitiveUpdate');

                setLoadingState({ isLoading: false, step: 'conversation_updated_after_edit', message: '', agentId: undefined });
            },
        }),
        { name: "MessageStore" }
    )
);