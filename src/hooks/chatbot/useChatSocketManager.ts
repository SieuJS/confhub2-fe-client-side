// src/hooks/chatbot/useChatSocketManager.ts
import { useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import {
    useSocketStore,
    useConversationStore,
    useMessageStore,
} from '@/src/app/[locale]/chatbot/stores'; // Đảm bảo đường dẫn đúng
import { useAuth } from '@/src/contexts/AuthContext';
import { appConfig } from '@/src/middleware';
import { useShallow } from 'zustand/react/shallow';
// Nếu bạn có các type cụ thể cho payload sự kiện, hãy import chúng
// import { ConversationListPayload, InitialHistoryPayload, ... } from './socketEventPayloadTypes';


// Xác định URL của Socket.IO server
// Logic xác định SOCKET_SERVER_URL_FINAL từ code gốc của bạn có thể được giữ lại
// hoặc đơn giản hóa nếu bạn đã có URL cố định trong appConfig.
// Ví dụ đơn giản hóa:
const SOCKET_SERVER_URL = appConfig.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
// Nếu bạn cần logic phức tạp hơn với wss/ws, hãy giữ lại từ code gốc.
// console.log(`[SocketManager] Final Socket URL: ${SOCKET_SERVER_URL}`);


export function useChatSocketManager() {
    // --- Lấy state và actions từ các store ---
    const {
        setSocketInstance,
        _onSocketConnect,
        _onSocketDisconnect,
        _onSocketConnectError,
        _onSocketAuthError,
        _onSocketConnectionReady,
        disconnectSocket: storeDisconnectSocket,
        setAuthToken: setSocketAuthTokenInStore,
        authToken: currentSocketAuthToken,
        socket: currentSocketInStore, // Đổi tên để rõ ràng hơn là socket từ store
        isConnected: isSocketConnected,
    } = useSocketStore();

    const conversationStoreActions = useConversationStore(
        useShallow(state => ({
            _onSocketConversationList: state._onSocketConversationList,
            _onSocketInitialHistory: state._onSocketInitialHistory,
            _onSocketNewConversationStarted: state._onSocketNewConversationStarted,
            _onSocketConversationDeleted: state._onSocketConversationDeleted,
            _onSocketConversationCleared: state._onSocketConversationCleared,
            _onSocketConversationRenamed: state._onSocketConversationRenamed,
            _onSocketConversationPinStatusChanged: state._onSocketConversationPinStatusChanged,
        }))
    );

    const messageStoreActions = useMessageStore(
        useShallow(state => ({
            _onSocketStatusUpdate: state._onSocketStatusUpdate,
            _onSocketChatUpdate: state._onSocketChatUpdate,
            _onSocketChatResult: state._onSocketChatResult,
            _onSocketChatError: state._onSocketChatError,
            _onSocketEmailConfirmationResult: state._onSocketEmailConfirmationResult,
            // setAnimationControls: state.setAnimationControls, // Nếu dùng animation
        }))
    );

    // Lấy state từ AuthContext
    const { isLoggedIn, getToken, isInitializing: isAuthInitializing } = useAuth();

    // Refs
    const isConnectingRef = useRef(false); // Theo dõi trạng thái đang kết nối để tránh gọi lặp
    const isMountedRef = useRef(true);     // Theo dõi component có mounted không
    // socketInstanceRef không cần thiết nữa nếu currentSocketInStore từ Zustand đủ tin cậy
    // và logic được quản lý tốt.

    // --- useEffect cho isMountedRef ---
    useEffect(() => {
        isMountedRef.current = true;
        console.log("[ChatSocketManager] Hook mounted.");
        return () => {
            isMountedRef.current = false;
            console.log("[ChatSocketManager] Hook unmounted.");
            // Logic cleanup khi hook unmount hoàn toàn (ít xảy ra với global initializer)
            // Nếu có instance socket nào đó còn sót lại và hook này bị unmount,
            // có thể cần ngắt nó ở đây, nhưng useEffect chính đã có cleanup.
        };
    }, []);


    // --- Hàm cập nhật authToken trong socketStore ---
    const updateSocketAuthTokenInStore = useCallback((newToken: string | null) => {
        if (currentSocketAuthToken !== newToken) {
            console.log(`[ChatSocketManager] Updating authToken in socketStore. Old: ${currentSocketAuthToken ? '***' : null}, New: ${newToken ? '***' : null}`);
            setSocketAuthTokenInStore(newToken);
        }
    }, [currentSocketAuthToken, setSocketAuthTokenInStore]);


    // --- Hàm kết nối socket chính ---
    const connectSocket = useCallback(() => {
        if (!isMountedRef.current) {
            console.log('[ChatSocketManager] connectSocket called but component not mounted. Skipping.');
            return;
        }
        if (isConnectingRef.current) {
            console.log('[ChatSocketManager] Already attempting to connect. Skipping connectSocket call.');
            return;
        }

        const tokenFromAuth = getToken();

        if (!tokenFromAuth) {
            console.log('[ChatSocketManager] No auth token from AuthContext. Cannot connect.');
            if (currentSocketInStore && currentSocketInStore.connected) {
                console.log('[ChatSocketManager] Disconnecting existing socket due to missing auth token.');
                storeDisconnectSocket(); // Sẽ gọi currentSocketInStore.disconnect()
            }
            updateSocketAuthTokenInStore(null);
            return;
        }

        // Nếu đã có socket kết nối, và token không thay đổi, thì không làm gì.
        if (currentSocketInStore && currentSocketInStore.connected && currentSocketAuthToken === tokenFromAuth) {
            console.log('[ChatSocketManager] Socket already connected with the correct token. No action needed.');
            return;
        }

        // Nếu có socket instance cũ (có thể đã ngắt kết nối hoặc token thay đổi)
        // Ngắt nó trước khi tạo cái mới để đảm bảo không có nhiều kết nối song song không mong muốn.
        if (currentSocketInStore) {
            console.log(`[ChatSocketManager] Disconnecting previous socket instance (ID: ${currentSocketInStore.id || 'N/A'}) before creating a new one.`);
            currentSocketInStore.removeAllListeners(); // Xóa tất cả listeners của instance cũ
            currentSocketInStore.io.removeAllListeners(); // Xóa listeners của manager
            storeDisconnectSocket(); // Yêu cầu store ngắt kết nối (sẽ gọi disconnect() trên currentSocketInStore)
            // setSocketInstance(null); // Store sẽ tự set socket = null qua _onSocketDisconnect
        }

        isConnectingRef.current = true;
        console.log(`[ChatSocketManager] Attempting to connect to ${SOCKET_SERVER_URL} with token.`);
        updateSocketAuthTokenInStore(tokenFromAuth); // Cập nhật token trong store

        const newSocket = io(SOCKET_SERVER_URL, {
            auth: { token: tokenFromAuth },
            transports: ['websocket', 'polling'], // Ưu tiên websocket
            reconnectionAttempts: 3,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 5000,
            timeout: 10000, // Thời gian chờ kết nối
        });

        if (isMountedRef.current) { // Chỉ set instance nếu component còn mounted
            setSocketInstance(newSocket);
        } else {
            // Nếu component unmounted trong khi đang tạo socket, ngắt socket mới này
            newSocket.disconnect();
            isConnectingRef.current = false;
            return;
        }


        // --- Helper tạo handler an toàn với mount status và instance socket ---
        const createMountedAwareHandler = <Args extends any[]>(handler: (...args: Args) => void, handlerName: string) => {
            return (...args: Args) => {
                // Chỉ thực thi handler nếu:
                // 1. Component còn mounted.
                // 2. Socket được truyền vào (newSocket) là instance socket hiện tại trong store.
                //    Điều này quan trọng để tránh handler của socket cũ chạy trên dữ liệu của socket mới.
                const latestSocketInStore = useSocketStore.getState().socket; // Lấy socket mới nhất từ store
                if (isMountedRef.current && latestSocketInStore === newSocket) {
                    // console.log(`[ChatSocketManager] Executing handler: ${handlerName}`);
                    handler(...args);
                } else {
                    console.warn(`[ChatSocketManager] Handler ${handlerName} skipped. Mounted: ${isMountedRef.current}, Socket match: ${latestSocketInStore === newSocket}`);
                }
            };
        };

        // --- Đăng ký listeners cơ bản cho socket mới ---
        newSocket.on('connect', createMountedAwareHandler(() => {
            isConnectingRef.current = false;
            if (newSocket.id) {
                _onSocketConnect(newSocket.id);
            } else {
                console.error('[ChatSocketManager] Critical: Socket connected but ID is undefined.');
                // Có thể emit lỗi hoặc thử ngắt kết nối
            }
        }, 'on_connect'));

        newSocket.on('disconnect', createMountedAwareHandler((reason: Socket.DisconnectReason) => {
            isConnectingRef.current = false; // Quan trọng: reset cờ nếu bị ngắt
            _onSocketDisconnect(reason);
        }, 'on_disconnect'));

        newSocket.on('connect_error', createMountedAwareHandler((error: Error) => {
            isConnectingRef.current = false;
            _onSocketConnectError(error);
        }, 'on_connect_error'));

        newSocket.on('auth_error', createMountedAwareHandler((error: { message: string }) => {
            isConnectingRef.current = false; // Lỗi auth cũng nên reset cờ
            _onSocketAuthError(error);
        }, 'on_auth_error'));

        newSocket.on('connection_ready', createMountedAwareHandler(_onSocketConnectionReady, 'on_connection_ready'));


        // --- Đăng ký listeners cho dữ liệu (Conversation & Message) ---
        newSocket.on('conversation_list', createMountedAwareHandler(conversationStoreActions._onSocketConversationList, 'on_conversation_list'));
        newSocket.on('initial_history', createMountedAwareHandler(conversationStoreActions._onSocketInitialHistory, 'on_initial_history'));
        newSocket.on('new_conversation_started', createMountedAwareHandler(conversationStoreActions._onSocketNewConversationStarted, 'on_new_conversation_started'));
        newSocket.on('conversation_deleted', createMountedAwareHandler(conversationStoreActions._onSocketConversationDeleted, 'on_conversation_deleted'));
        newSocket.on('conversation_cleared', createMountedAwareHandler(conversationStoreActions._onSocketConversationCleared, 'on_conversation_cleared'));
        newSocket.on('conversation_renamed', createMountedAwareHandler(conversationStoreActions._onSocketConversationRenamed, 'on_conversation_renamed'));
        newSocket.on('conversation_pin_status_changed', createMountedAwareHandler(conversationStoreActions._onSocketConversationPinStatusChanged, 'on_conversation_pin_status_changed'));

        newSocket.on('status_update', createMountedAwareHandler(messageStoreActions._onSocketStatusUpdate, 'on_status_update'));
        newSocket.on('chat_update', createMountedAwareHandler(messageStoreActions._onSocketChatUpdate, 'on_chat_update'));
        newSocket.on('chat_result', createMountedAwareHandler(messageStoreActions._onSocketChatResult, 'on_chat_result'));
        newSocket.on('chat_error', createMountedAwareHandler(messageStoreActions._onSocketChatError, 'on_chat_error'));
        newSocket.on('email_confirmation_result', createMountedAwareHandler(messageStoreActions._onSocketEmailConfirmationResult, 'on_email_confirmation_result'));

        // --- Listeners cho sự kiện reconnect của socket.io manager ---
        newSocket.io.on('reconnect_attempt', createMountedAwareHandler((attemptNumber) => {
            console.log(`[ChatSocketManager] Socket Manager: Reconnect attempt ${attemptNumber}`);
            // Có thể bạn muốn cập nhật UI ở đây
        }, 'on_reconnect_attempt'));

        newSocket.io.on('reconnect_error', createMountedAwareHandler((error: Error) => {
            console.error('[ChatSocketManager] Socket Manager: Reconnect error.', error);
            _onSocketConnectError(error); // Dùng lại handler lỗi kết nối chung
        }, 'on_reconnect_error'));

        newSocket.io.on('reconnect_failed', createMountedAwareHandler(() => {
            console.error('[ChatSocketManager] Socket Manager: Failed to reconnect after multiple attempts.');
            _onSocketConnectError(new Error("Failed to reconnect to server. Please check your connection."));
        }, 'on_reconnect_failed'));

        newSocket.io.on('reconnect', createMountedAwareHandler((attemptNumber) => {
            console.log(`[ChatSocketManager] Socket Manager: Successfully reconnected after ${attemptNumber} attempts. New Socket ID: ${newSocket.id}`);
            // Sự kiện 'connect' của newSocket sẽ tự động được kích hoạt lại.
        }, 'on_reconnect'));

        // Generic error handler cho socket
        newSocket.on('error', createMountedAwareHandler((error: Error) => {
            console.error('[ChatSocketManager] Generic socket.on("error") event:', error);
            // Có thể dispatch một lỗi chung ở đây nếu cần
        }, 'on_error_generic'));

    }, [
        // Dependencies cho useCallback connectSocket
        getToken,
        currentSocketInStore,
        currentSocketAuthToken,
        updateSocketAuthTokenInStore,
        setSocketInstance,
        _onSocketConnect,
        _onSocketDisconnect,
        _onSocketConnectError,
        _onSocketAuthError,
        _onSocketConnectionReady,
        storeDisconnectSocket,
        conversationStoreActions,
        messageStoreActions,
    ]);


    // --- useEffect chính để quản lý kết nối dựa trên trạng thái AuthContext ---
    useEffect(() => {
        if (!isMountedRef.current) return;

        if (isAuthInitializing) {
            console.log('[ChatSocketManager Effect] Auth is initializing, waiting...');
            return;
        }

        const tokenFromAuth = getToken();

        if (isLoggedIn && tokenFromAuth) {
            // Chỉ kết nối nếu:
            // 1. Socket chưa được báo là đã kết nối (isSocketConnected từ store)
            // 2. HOẶC token trong socket store khác với token từ AuthContext
            if (!isSocketConnected || currentSocketAuthToken !== tokenFromAuth) {
                console.log(`[ChatSocketManager Effect] Conditions met for connection. isSocketConnected: ${isSocketConnected}, currentTokenInStore: ${currentSocketAuthToken ? '***' : 'null'}, tokenFromAuth: ${tokenFromAuth ? '***' : 'null'}`);
                connectSocket();
            } else {
                console.log(`[ChatSocketManager Effect] Already connected and token matches. isSocketConnected: ${isSocketConnected}`);
            }
        } else { // Không đăng nhập hoặc không có token
            console.log('[ChatSocketManager Effect] User not logged in or no token. Ensuring disconnection.');
            if (currentSocketInStore && currentSocketInStore.connected) {
                // storeDisconnectSocket sẽ gọi currentSocketInStore.disconnect()
                // và _onSocketDisconnect sẽ cập nhật isConnected = false
                storeDisconnectSocket();
            }
            updateSocketAuthTokenInStore(null); // Cập nhật token trong store là null
            isConnectingRef.current = false;    // Reset cờ nếu đang logout
        }

        // Hàm cleanup cho useEffect này
        // Sẽ chạy khi dependencies thay đổi (trước khi effect chạy lại) hoặc khi hook unmount
        // Mục đích chính là ngắt kết nối socket hiện tại nếu hook bị unmount hoặc nếu
        // trạng thái đăng nhập thay đổi khiến socket không còn cần thiết.
        return () => {
            if (!isMountedRef.current) { // Nếu unmount rồi thì không cần làm gì thêm ở đây
                // console.log('[ChatSocketManager Effect Cleanup] Hook already unmounted.');
                return;
            }
            // console.log('[ChatSocketManager Effect Cleanup] Running cleanup for main effect.');
            // Việc ngắt kết nối khi logout đã được xử lý trong logic if/else ở trên.
            // Cleanup này chủ yếu cho trường hợp hook unmount hoàn toàn.
            const socketToCleanup = useSocketStore.getState().socket; // Lấy socket hiện tại từ store
            if (socketToCleanup) {
                // console.log(`[ChatSocketManager Effect Cleanup] Disconnecting socket (ID: ${socketToCleanup.id || 'N/A'}) from effect return.`);
                // socketToCleanup.disconnect(); // Không nên gọi disconnect trực tiếp ở đây nếu storeDisconnectSocket đã đủ
                                             // _onSocketDisconnect sẽ cập nhật state của store.
            }
        };

    }, [
        // Dependencies cho useEffect chính
        isLoggedIn,
        isAuthInitializing,
        getToken,
        connectSocket, // Callback
        storeDisconnectSocket, // Action từ store
        updateSocketAuthTokenInStore, // Callback
        currentSocketAuthToken, // State từ store
        isSocketConnected,      // State từ store
        // currentSocketInStore KHÔNG nên là dependency trực tiếp ở đây nếu
        // các thay đổi của nó đã được phản ánh qua isSocketConnected hoặc currentSocketAuthToken,
        // để tránh vòng lặp không cần thiết. Tuy nhiên, nếu cleanup cần chính xác instance đó, có thể thêm lại.
    ]);

    // Hook này không trả về gì, chỉ thực hiện side effects
    return null;
}