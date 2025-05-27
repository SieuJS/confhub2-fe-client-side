// src/app/[locale]/chatbot/stores/storeHooks.ts
import { useCallback } from 'react';
import {
    useSocketStore,
    useConversationStore,
    useMessageStore,
    useSettingsStore,
    useUiStore,
} from '@/src/app/[locale]/chatbot/stores';
import { useShallow } from 'zustand/react/shallow';

// Import all necessary types
import {
    ChatMessageType,
    LoadingState,
    ConversationMetadata,
    ConfirmSendEmailAction,
    ThoughtStep,
    ErrorUpdate,
    ChatUpdate,
    ResultUpdate,
    InitialHistoryPayload,
    ConversationDeletedPayload,
    ConversationClearedPayload,
    ConversationRenamedPayload,
    ConversationPinStatusChangedPayload,
    EmailConfirmationResult,
    LanguageCode,
    ChatMode,
    LanguageOption,
    StatusUpdate,
    FrontendAction,
    EditingMessageState, // <<< THÊM TYPE MỚI CHO EDITING MESSAGE
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { StreamingTextAnimationControls } from '@/src/hooks/regularchat/useStreamingTextAnimation';


// === SocketStore Hooks ===

/**
 * Hook to get socket connection status and related info.
 * Auth token is now managed by AuthContext and passed to useChatSocketManager.
 * @returns {object} Socket connection state.
 */
export const useSocketConnectionStatus = () => {
    return useSocketStore(
        useShallow(state => ({
            // authToken: state.authToken, // LOẠI BỎ - AuthToken giờ do AuthContext quản lý
            currentAuthTokenForSocket: state.currentAuthTokenForSocket, // Thêm state này nếu component cần biết token hiện tại đang dùng cho socket
            isConnected: state.isConnected,
            socketId: state.socketId,
            isServerReadyForCommands: state.isServerReadyForCommands,
            hasFatalConnectionError: state.hasFatalConnectionError,
        }))
    );
};

/**
 * Hook to get actions for managing socket connection.
 * @returns {object} Socket connection actions.
 */
export const useSocketActions = () => { // Đổi tên từ useSocketConnectionActions để ngắn gọn hơn
    return useSocketStore(
        useShallow(state => ({
            // initializeAuth: state.initializeAuth, // LOẠI BỎ - AuthContext quản lý init
            // setAuthToken: state.setAuthToken, // LOẠI BỎ - Token được set bởi useChatSocketManager thông qua setCurrentAuthTokenForSocket
            setCurrentAuthTokenForSocket: state.setCurrentAuthTokenForSocket, // Giữ lại nếu có trường hợp đặc biệt cần set từ ngoài, nhưng thường là không
            disconnectSocket: state.disconnectSocket,
            // Các emitters có thể được thêm vào đây nếu component cần gọi trực tiếp
            // Ví dụ: emitGetInitialConversations: state.emitGetInitialConversations
        }))
    );
};

/**
 * Hook to get the raw socket instance ref. Use with extreme caution.
 * Primarily intended for `useChatSocketManager`.
 * @returns {React.MutableRefObject<Socket | null>} The socket ref.
 */
export const useSocketRef = () => {
    return useSocketStore(state => state.socketRef); // Giữ nguyên
};


// === ConversationStore Hooks === (Giữ nguyên, không bị ảnh hưởng trực tiếp bởi thay đổi SocketStore)

export const useConversationListState = () => {
    return useConversationStore(
        useShallow(state => ({
            conversationList: state.conversationList,
            searchResults: state.searchResults,
            isSearching: state.isSearching,
            isLoadingHistory: state.isLoadingHistory,
        }))
    );
};

export const useActiveConversationState = () => {
    return useConversationStore(
        useShallow(state => ({
            activeConversationId: state.activeConversationId,
            isHistoryLoaded: state.isHistoryLoaded,
            isProcessingExplicitNewChat: state.isProcessingExplicitNewChat, // Thêm state này
        }))
    );
};

export const useConversationActions = () => {
    return useConversationStore(
        useShallow(state => ({
            setConversationList: state.setConversationList,
            setActiveConversationId: state.setActiveConversationId,
            setIsLoadingHistory: state.setIsLoadingHistory,
            setIsHistoryLoaded: state.setIsHistoryLoaded,
            setIsProcessingExplicitNewChat: state.setIsProcessingExplicitNewChat, // Thêm action này
            loadConversation: state.loadConversation,
            startNewConversation: state.startNewConversation,
            deleteConversation: state.deleteConversation,
            clearConversation: state.clearConversation,
            renameConversation: state.renameConversation,
            pinConversation: state.pinConversation,
            searchConversations: state.searchConversations,
            resetConversationState: state.resetConversationState, // Thêm action này
        }))
    );
};



// === MessageStore Hooks ===

export const useChatMessageState = () => {
    return useMessageStore(
        useShallow(state => ({
            chatMessages: state.chatMessages,
            loadingState: state.loadingState,
            pendingBotMessageId: state.pendingBotMessageId,
            // editingMessage: state.editingMessage, // <<< CÓ THỂ BỎ
        }))
    );
};

export const useMessageActions = () => {
    return useMessageStore(
        useShallow(state => ({
            setChatMessages: state.setChatMessages,
            addChatMessage: state.addChatMessage,
            updateMessageById: state.updateMessageById,
            setLoadingState: state.setLoadingState,
            setPendingBotMessageId: state.setPendingBotMessageId,
            sendMessage: state.sendMessage,
            resetChatUIForNewConversation: state.resetChatUIForNewConversation,
            clearAuthErrorMessages: state.clearAuthErrorMessages,
            // setEditingMessage: state.setEditingMessage, // <<< BỎ
            submitEditedMessage: state.submitEditedMessage, // Signature đã được cập nhật trong store
        }))
    );
};


export const useUpdateChatMessageCallbackForAnimation = () => {
    const storeUpdateMessageById = useMessageStore(state => state.updateMessageById);
    return useCallback((messageId: string, newContent: string) => {
        storeUpdateMessageById(messageId, (prevMsg) => ({ ...prevMsg, message: newContent, timestamp: new Date().toISOString() }));
    }, [storeUpdateMessageById]);
};

export const useAnimationControls = () => {
    return useMessageStore(
        useShallow(state => ({
            animationControls: state.animationControls,
            setAnimationControls: state.setAnimationControls,
            isAwaitingFinalResultRef: state.isAwaitingFinalResultRef,
            resetAwaitFlag: state.resetAwaitFlag,
        }))
    );
};


// === SettingsStore Hooks === (Giữ nguyên)

export const useChatSettingsState = () => {
    return useSettingsStore(
        useShallow(state => ({
            chatMode: state.chatMode,
            currentLocale: state.currentLocale,
            isStreamingEnabled: state.isStreamingEnabled,
            currentLanguage: state.currentLanguage,
            availableLanguages: state.availableLanguages,
        }))
    );
};

export const useChatSettingsActions = () => {
    return useSettingsStore(
        useShallow(state => ({
            setChatMode: state.setChatMode,
            setCurrentLocale: state.setCurrentLocale,
            setIsStreamingEnabled: state.setIsStreamingEnabled,
            setCurrentLanguage: state.setCurrentLanguage,
            // resetSettingsToDefaults: state.resetSettingsToDefaults, // Thêm nếu có action này
        }))
    );
};


// === UiStore Hooks === (Giữ nguyên)

export const useUIState = () => {
    return useUiStore(
        useShallow(state => ({
            hasFatalError: state.hasFatalError,
            fatalErrorCode: state.fatalErrorCode, // Thêm state này
            showConfirmationDialog: state.showConfirmationDialog,
            confirmationData: state.confirmationData,
            isLeftPanelOpen: state.isLeftPanelOpen,
            isRightPanelOpen: state.isRightPanelOpen,
        }))
    );
};

export const useUIActions = () => {
    return useUiStore(
        useShallow(state => ({
            setHasFatalError: state.setHasFatalError,
            clearFatalError: state.clearFatalError, // Thêm action này
            setShowConfirmationDialog: state.setShowConfirmationDialog,
            toggleLeftPanel: state.toggleLeftPanel,
            setLeftPanelOpen: state.setLeftPanelOpen,
            setRightPanelOpen: state.setRightPanelOpen,
            handleError: state.handleError,
            handleConfirmSend: state.handleConfirmSend,
            handleCancelSend: state.handleCancelSend,
        }))
    );
};


// === Combined "Facade" Hooks ===

export const useConversationManagement = () => {
    const listState = useConversationListState();
    const activeConvState = useActiveConversationState();
    const actions = useConversationActions();
    return { ...listState, ...activeConvState, ...actions };
};

export const useChatInputCore = () => {
    const { sendMessage } = useMessageActions();
    const { isStreamingEnabled, currentLanguage } = useChatSettingsState();
    const { isConnected, isServerReadyForCommands } = useSocketConnectionStatus();
    const { loadingState } = useChatMessageState();
    const { hasFatalError, fatalErrorCode } = useUIState(); // Lấy thêm lỗi từ UIStore

    // Helper để xác định lỗi có liên quan đến xác thực hoặc kết nối không
    const getIsAuthRelatedOrConnectionError = useCallback((code: string | null): boolean => {
        if (!code) return false;
        const criticalErrorCodes = [
            'AUTH_REQUIRED', 'ACCESS_DENIED', 'TOKEN_EXPIRED',
            'AUTH_CONNECTION_ERROR', 'AUTH_HANDSHAKE_FAILED',
            'CONNECTION_FAILED', 'FATAL_SERVER_ERROR'
        ];
        return criticalErrorCodes.includes(code);
    }, []);

    const isInputDisabled = hasFatalError && getIsAuthRelatedOrConnectionError(fatalErrorCode);

    return {
        sendMessage,
        isStreamingEnabled,
        currentLanguage,
        isConnected,
        isServerReadyForCommands,
        isLoading: loadingState.isLoading,
        isInputDisabled, // Prop mới để vô hiệu hóa input
    };
};

export const useChatAreaCore = () => {
    const { chatMessages, loadingState } = useChatMessageState();
    const { activeConversationId, isHistoryLoaded } = useActiveConversationState();
    const { isLoadingHistory } = useConversationListState();
    const { animationControls } = useAnimationControls();

    return {
        chatMessages,
        loadingState,
        activeConversationId,
        isHistoryLoaded,
        isLoadingHistory,
        animationControls,
    };
};

export const useLeftPanelCore = () => {
    const {
        conversationList,
        searchResults,
        isSearching,
    } = useConversationListState();
    const { activeConversationId, isLoadingHistory } = useConversationStore( // Lấy isLoadingHistory trực tiếp từ store gốc nếu cần
        useShallow(state => ({
            activeConversationId: state.activeConversationId,
            isLoadingHistory: state.isLoadingHistory,
        }))
    );
    const {
        startNewConversation,
        searchConversations,
        loadConversation,
        deleteConversation,
    } = useConversationActions();
    const { isLeftPanelOpen } = useUIState();
    const { toggleLeftPanel } = useUIActions(); // Đổi sang toggleLeftPanel nếu chỉ là toggle

    return {
        conversationList,
        searchResults,
        isSearching,
        activeConversationId,
        isLoadingHistory, // Thêm lại isLoadingHistory
        startNewConversation,
        searchConversations,
        loadConversation,
        deleteConversation,
        isLeftPanelOpen,
        toggleLeftPanel, // Sử dụng toggleLeftPanel
    };
};


export const useRightSettingsPanelCore = () => {
    const settingsState = useChatSettingsState();
    const settingsActions = useChatSettingsActions();
    const { isRightPanelOpen } = useUIState();
    const { setRightPanelOpen } = useUIActions();

    return {
        ...settingsState,
        ...settingsActions,
        isRightPanelOpen,
        setRightPanelOpen,
    };
};

/**
 * Hook for a component that needs to initialize application state,
 * primarily setting the locale. Authentication is handled by AuthContext.
 * @returns {object} Actions for app initialization.
 */
export const useAppInitializerCore = () => { // Đổi tên và mục đích
    // initializeAuth đã bị loại bỏ khỏi đây
    const { setCurrentLocale } = useChatSettingsActions();
    // Các trạng thái kết nối có thể được lấy từ useSocketConnectionStatus nếu cần
    // const { isConnected, hasFatalConnectionError } = useSocketConnectionStatus();
    // const { hasFatalError } = useUIState();

    return {
        setCurrentLocale,
        // isConnected, // Có thể trả về nếu component init cần biết
        // hasFatalConnectionError,
        // hasFatalError
    };
};


// --- Re-exporting common types ---
export type {
    ConversationMetadata,
    InitialHistoryPayload,
    ConversationDeletedPayload,
    ConversationClearedPayload,
    ConversationRenamedPayload,
    ConversationPinStatusChangedPayload,
    ChatMessageType,
    LoadingState,
    ThoughtStep,
    ChatUpdate,
    ResultUpdate,
    EmailConfirmationResult,
    StreamingTextAnimationControls,
    LanguageCode,
    ChatMode,
    LanguageOption,
    ConfirmSendEmailAction,
    ErrorUpdate,
    StatusUpdate, // Đảm bảo type này được export nếu nó dùng ở đâu đó
    FrontendAction, // Đảm bảo type này được export
};