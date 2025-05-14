// src/app/[locale]/chatbot/stores/socketStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { Socket } from 'socket.io-client';
import { useMessageStore } from './messageStore';
import { useUiStore } from './uiStore';

// --- Types for Socket Store State ---
export interface SocketStoreState {
    authToken: string | null; // Sửa: Khởi tạo là null, sẽ được set từ AuthContext
    isConnected: boolean;
    socketId: string | null;
    socketRef: React.MutableRefObject<Socket | null>; // Not persisted
    isServerReadyForCommands: boolean;
    hasFatalConnectionError: boolean;
}

// --- Types for Socket Store Actions ---
export interface SendMessagePayload {
    userInput: string;
    isStreaming: boolean;
    language: string;
    conversationId?: string | null;
}

export interface SocketStoreActions {
    setAuthToken: (token: string | null) => void; // Chỉ còn setAuthToken
    setSocketInstance: (socket: Socket | null) => void;
    setIsConnected: (status: boolean, socketId?: string | null) => void;
    setIsServerReadyForCommands: (isReady: boolean) => void;
    setHasFatalConnectionError: (hasError: boolean) => void;
    disconnectSocket: () => void;

    _onSocketConnect: (socketId: string) => void;
    _onSocketDisconnect: (reason: Socket.DisconnectReason) => void;
    _onSocketConnectError: (error: Error) => void;
    _onSocketAuthError: (error: { message: string }) => void;
    _onSocketConnectionReady: (payload: { userId: string, email: string }) => void;


    // Actions that emit socket events (can be called from other stores or components)
    emitGetInitialConversations: () => void;
    emitLoadConversation: (conversationId: string) => void;
    emitStartNewConversation: (payload?: Record<string, any>) => void;
    emitUserConfirmEmail: (confirmationId: string) => void;
    emitUserCancelEmail: (confirmationId: string) => void;
    emitDeleteConversation: (conversationId: string) => void;
    emitClearConversation: (conversationId: string) => void;
    emitRenameConversation: (conversationId: string, newTitle: string) => void;
    emitPinConversation: (conversationId: string, isPinned: boolean) => void;
    emitSendMessage: (payload: SendMessagePayload) => void; // SỬA Ở ĐÂY
}

const initialSocketStoreState: SocketStoreState = {
    authToken: null, // <<<< THAY ĐỔI: Khởi tạo là null
    isConnected: false,
    socketId: null,
    socketRef: { current: null },
    isServerReadyForCommands: false,
    hasFatalConnectionError: false,
};

export const useSocketStore = create<SocketStoreState & SocketStoreActions>()(
    devtools(
        // Không persist authToken ở đây nữa, nó sẽ được quản lý bởi AuthContext
        // và truyền vào qua setAuthToken
        (set, get) => ({
            ...initialSocketStoreState,

            setAuthToken: (token) => {
                console.log(`[SocketStore] setAuthToken called with token: ${token ? '******' : 'null'}`);
                // Nếu token thay đổi, và đang kết nối, có thể cần ngắt kết nối cũ và kết nối lại
                // với token mới (logic này sẽ nằm trong useChatSocketManager)
                set({ authToken: token, hasFatalConnectionError: false });
            },
            // initializeAuth: () => { /* <<<< LOẠI BỎ initializeAuth >>>> */ },
            setSocketInstance: (socket) => {
                const currentStoreSocketRef = get().socketRef;
                currentStoreSocketRef.current = socket;
                console.log('[SocketStore] setSocketInstance called. New socket.current set.', socket ? socket.id : null);
            },
            setIsConnected: (status, socketId = null) => set({ isConnected: status, socketId: status ? socketId : null }, false, 'setIsConnected'),
            setIsServerReadyForCommands: (isReady) => set({ isServerReadyForCommands: isReady }, false, 'setIsServerReadyForCommands'),
            setHasFatalConnectionError: (hasError) => set({ hasFatalConnectionError: hasError }, false, 'setHasFatalConnectionError'),
            disconnectSocket: () => {
                const socket = get().socketRef.current;
                if (socket) {
                    console.log('[SocketStore] disconnectSocket called. Disconnecting...');
                    socket.disconnect();
                }
                // Không reset authToken ở đây. Việc này sẽ do AuthContext và useChatSocketManager quyết định.
            },

            _onSocketConnect: (socketIdParam) => {
                console.log(`[SocketStore _onSocketConnect] Connected with ID ${socketIdParam}`);
                set({
                    isConnected: true,
                    socketId: socketIdParam,
                    hasFatalConnectionError: false,
                }, false, '_onSocketConnect');
                useMessageStore.getState().setLoadingState({ isLoading: false, step: 'connected', message: 'Connected' });
            },
            _onSocketDisconnect: (reason) => {
                console.log(`[SocketStore _onSocketDisconnect] Disconnected. Reason: ${reason}`);
                useMessageStore.getState().animationControls?.stopStreaming();
                useMessageStore.getState().resetAwaitFlag();
                set(state => ({
                    isConnected: false,
                    socketId: null,
                    isServerReadyForCommands: false,
                    // Giữ nguyên hasFatalConnectionError trừ khi có lý do cụ thể để reset
                }), false, '_onSocketDisconnect');
                useMessageStore.getState().setLoadingState({ isLoading: false, step: 'disconnected', message: `Disconnected: ${reason}` });
            },
            _onSocketConnectError: (error) => {
                console.error("[SocketStore _onSocketConnectError]", error);
                const isAuthRelated = error.message.toLowerCase().includes('auth') || error.message.toLowerCase().includes('token');
                set({ isConnected: false, socketId: null, isServerReadyForCommands: false, hasFatalConnectionError: true }, false, '_onSocketConnectError/setFatal');
                useUiStore.getState().handleError(error, true, isAuthRelated);
            },
            _onSocketAuthError: (error) => {
                console.error("[SocketStore _onSocketAuthError]", error);
                set({ isConnected: false, socketId: null, isServerReadyForCommands: false, hasFatalConnectionError: true }, false, '_onSocketAuthError/setFatal');
                // Nếu lỗi auth, có thể cần logout người dùng ở AuthContext
                // Điều này phức tạp, có thể cần một cơ chế event bus hoặc callback
                useUiStore.getState().handleError({ ...error, type: 'error', code: 'AUTH_REQUIRED' }, true, true);
            },
            _onSocketConnectionReady: (payload) => {
                console.log(`[SocketStore _onSocketConnectionReady] Server ready. UserID: ${payload.userId}`);
                set({ isServerReadyForCommands: true }, false, '_onSocketConnectionReady');
                get().emitGetInitialConversations();
            },

            // --- Emitters (giữ nguyên) ---
            emitGetInitialConversations: () => {
                const { socketRef, isConnected } = get();
                if (socketRef.current && isConnected) {
                    console.log('[SocketStore] Emitting get_initial_conversations');
                    socketRef.current.emit('get_initial_conversations');
                } else {
                    console.warn('[SocketStore] Cannot emit get_initial_conversations: Socket not ready.');
                }
            },
            emitLoadConversation: (conversationId) => {
                const { socketRef, isConnected } = get();
                if (socketRef.current && isConnected && conversationId) {
                    console.log(`[SocketStore] Emitting load_conversation for ID: ${conversationId}`);
                    socketRef.current.emit('load_conversation', { conversationId });
                } else {
                    console.warn('[SocketStore] Cannot emit load_conversation: Socket not ready or no ID.');
                }
            },
            emitStartNewConversation: (payload = {}) => {
                const { socketRef, isConnected } = get();
                if (socketRef.current && isConnected) {
                    console.log('[SocketStore] Emitting start_new_conversation');
                    socketRef.current.emit('start_new_conversation', payload);
                } else {
                    console.warn('[SocketStore] Cannot emit start_new_conversation: Socket not ready.');
                }
            },
            emitUserConfirmEmail: (confirmationId) => {
                const { socketRef, isConnected } = get();
                if (socketRef.current && isConnected) {
                    socketRef.current.emit('user_confirm_email', { confirmationId });
                }
            },
            emitUserCancelEmail: (confirmationId) => {
                const { socketRef, isConnected } = get();
                if (socketRef.current && isConnected) {
                    socketRef.current.emit('user_cancel_email', { confirmationId });
                }
            },
            emitDeleteConversation: (conversationId) => {
                const { socketRef, isConnected } = get();
                if (socketRef.current && isConnected && conversationId) {
                    socketRef.current.emit('delete_conversation', { conversationId });
                }
            },
            emitClearConversation: (conversationId) => {
                const { socketRef, isConnected } = get();
                if (socketRef.current && isConnected && conversationId) {
                    socketRef.current.emit('clear_conversation', { conversationId });
                }
            },
            emitRenameConversation: (conversationId, newTitle) => {
                const { socketRef, isConnected } = get();
                if (socketRef.current && isConnected && conversationId) {
                    socketRef.current.emit('rename_conversation', { conversationId, newTitle });
                }
            },
            emitPinConversation: (conversationId, isPinned) => {
                const { socketRef, isConnected } = get();
                if (socketRef.current && isConnected && conversationId) {
                    socketRef.current.emit('pin_conversation', { conversationId, isPinned });
                }
            },
             emitSendMessage: (payload) => {
                const { socketRef, isConnected, isServerReadyForCommands } = get();
                if (!socketRef.current || !isConnected || !isServerReadyForCommands) {
                    useUiStore.getState().handleError({ message: "Cannot send message: Not connected or server not ready.", type: 'error' }, false, false);
                    return;
                }
                console.log(`[SocketStore] Emitting 'send_message'. ConvID: ${payload.conversationId}, Lang: ${payload.language}, Stream: ${payload.isStreaming}. Socket ID: ${socketRef.current?.id}`);
                socketRef.current.emit('send_message', payload);
            },
        }),
        // devtools config
        { name: "SocketStore" }
    )
);