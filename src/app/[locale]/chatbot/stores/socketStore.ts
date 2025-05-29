// src/app/[locale]/chatbot/stores/socketStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware'; // Loại bỏ persist và createJSONStorage nếu không persist gì
import { Socket } from 'socket.io-client';
import { useMessageStore } from './messageStore';
import { useUiStore } from './uiStore';
import { EditUserMessagePayload, PersonalizationPayload } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // <<< NEW

// --- Types for Socket Store State ---
export interface SocketStoreState {
    // authToken giờ đây sẽ được truyền từ bên ngoài, không persist trong store này
    currentAuthTokenForSocket: string | null; // Đổi tên để rõ ràng hơn, và không còn undefined
    isConnected: boolean;
    socketId: string | null;
    socketRef: React.MutableRefObject<Socket | null>; // Not persisted
    isServerReadyForCommands: boolean;
    hasFatalConnectionError: boolean;
}

export interface SendMessagePayload { // Example, if you have a specific type for sendMessage
    userInput: string;
    isStreaming: boolean;
    language: string; // Or LanguageCode
    conversationId: string | null;
    frontendMessageId: string;
    personalizationData?: PersonalizationPayload | null; // <<< ADDED
}

export interface SocketStoreActions {
    // setAuthToken được giữ lại để useChatSocketManager có thể set token cho kết nối hiện tại
    setCurrentAuthTokenForSocket: (token: string | null) => void;
    // initializeAuth BỊ LOẠI BỎ
    setSocketInstance: (socket: Socket | null) => void;
    setIsConnected: (status: boolean, socketId?: string | null) => void;
    setIsServerReadyForCommands: (isReady: boolean) => void;
    setHasFatalConnectionError: (hasError: boolean) => void;
    disconnectSocket: () => void;

    // Socket Event Handlers (Giữ nguyên)
    _onSocketConnect: (socketId: string) => void;
    _onSocketDisconnect: (reason: Socket.DisconnectReason) => void;
    _onSocketConnectError: (error: Error) => void;
    _onSocketAuthError: (error: { message: string }) => void;
    _onSocketConnectionReady: (payload: { userId: string, email: string }) => void;

    // Actions that emit socket events (Giữ nguyên)
    emitGetInitialConversations: () => void;
    emitLoadConversation: (conversationId: string) => void;
    emitStartNewConversation: (payload?: Record<string, any>) => void;
    emitUserConfirmEmail: (confirmationId: string) => void;
    emitUserCancelEmail: (confirmationId: string) => void;
    emitDeleteConversation: (conversationId: string) => void;
    emitClearConversation: (conversationId: string) => void;
    emitRenameConversation: (conversationId: string, newTitle: string) => void;
    emitPinConversation: (conversationId: string, isPinned: boolean) => void;
    emitSendMessage: (payload: SendMessagePayload) => void;
    emitEditUserMessage: (payload: EditUserMessagePayload) => void; // <<< NEW
}

const initialSocketStoreState: SocketStoreState = {
    currentAuthTokenForSocket: null, // Khởi tạo là null, sẽ được set bởi useChatSocketManager
    isConnected: false,
    socketId: null,
    socketRef: { current: null },
    isServerReadyForCommands: false,
    hasFatalConnectionError: false,
};

export const useSocketStore = create<SocketStoreState & SocketStoreActions>()(
    devtools(
        // Không còn persist ở đây vì token được quản lý bởi AuthContext
        (set, get) => ({
            ...initialSocketStoreState,

            // --- Setters ---
            setCurrentAuthTokenForSocket: (token) => {
                console.log(`[SocketStore] setCurrentAuthTokenForSocket called with token: ${token ? 'exists' : 'null'}`);
                set({ currentAuthTokenForSocket: token, hasFatalConnectionError: false }, false, 'setCurrentAuthTokenForSocket');
            },
            // initializeAuth: BỊ LOẠI BỎ

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
            },

            // --- Socket Event Handlers (Giữ nguyên logic bên trong) ---
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
                }), false, '_onSocketDisconnect');
                useMessageStore.getState().setLoadingState({ isLoading: false, step: 'disconnected', message: `Disconnected: ${reason}` });
            },
            _onSocketConnectError: (error) => { // error ở đây thường là Error của JS, có thể có `data` nếu server gửi
                console.error("[SocketStore _onSocketConnectError]", error);

                let errorCode = 'CONNECTION_FAILED'; // Mã lỗi mặc định
                let errorMessage = error.message;
                const isAuthRelatedByName = error.message.toLowerCase().includes('auth') || error.message.toLowerCase().includes('token');

                // Kiểm tra xem error.data có tồn tại và có code không (thường do server bắn về khi handshake)
                // Ví dụ, server middleware của socket.io có thể gọi next(new Error("Auth failed", { data: { code: "AUTH_HANDSHAKE_FAILED" } }))
                if (error && (error as any).data && (error as any).data.code) {
                    errorCode = (error as any).data.code;
                    if ((error as any).data.message) {
                        errorMessage = (error as any).data.message;
                    }
                } else if (isAuthRelatedByName) {
                    errorCode = 'AUTH_CONNECTION_ERROR'; // Mã cụ thể hơn nếu phát hiện từ tên
                }

                set({ isConnected: false, socketId: null, isServerReadyForCommands: false, hasFatalConnectionError: true }, false, '_onSocketConnectError/setFatal');
                // Truyền error object đầy đủ, hoặc một object mới với code và message đã được xử lý
                useUiStore.getState().handleError({ message: errorMessage, code: errorCode, type: 'error' }, true, true);
            },

            _onSocketAuthError: (error) => { // error ở đây là { message: string } từ server
                console.error("[SocketStore _onSocketAuthError]", error);
                set({ isConnected: false, socketId: null, isServerReadyForCommands: false, hasFatalConnectionError: true }, false, '_onSocketAuthError/setFatal');
                // Giữ nguyên việc truyền code AUTH_REQUIRED
                useUiStore.getState().handleError({ message: error.message, type: 'error', code: 'AUTH_REQUIRED' }, true, true);
            },
            _onSocketConnectionReady: (payload) => {
                console.log(`[SocketStore _onSocketConnectionReady] Server ready. UserID: ${payload.userId}`);
                set({ isServerReadyForCommands: true }, false, '_onSocketConnectionReady');
                get().emitGetInitialConversations();
            },


            // --- Emitters ---
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
            emitStartNewConversation: (payload = {}) => { // payload will now be { language: 'en' } or { language: 'vi' }
                const { socketRef, isConnected } = get();
                if (socketRef.current && isConnected) {
                    console.log('[SocketStore] Emitting start_new_conversation with payload:', payload); // Log to verify
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
                console.log(`[SocketStore] Emitting 'send_message'. ConvID: ${payload.conversationId}, Lang: ${payload.language}, Stream: ${payload.isStreaming}. Socket ID: ${socketRef.current?.id}. User Info: ${payload.personalizationData}`);
                socketRef.current.emit('send_message', payload);
            },
            emitEditUserMessage: (payload) => {
                const { socketRef, isConnected, isServerReadyForCommands } = get();
                if (!socketRef.current || !isConnected || !isServerReadyForCommands) {
                    useUiStore.getState().handleError({ message: "Cannot edit message: Not connected or server not ready.", type: 'error' }, false, false);
                    return;
                }
                console.log(`[SocketStore] Emitting 'edit_user_message'. ConvID: ${payload.conversationId}, MsgID: ${payload.messageIdToEdit}`);
                socketRef.current.emit('edit_user_message', payload);
            },
        }),
        { name: "SocketStore" } // devtools name
    )
);