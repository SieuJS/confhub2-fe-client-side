// src/hooks/chatbot/useChatSocketManager.ts

import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import {
    useSocketStore,
    useConversationStore,
    useMessageStore,
} from '@/src/app/[locale]/chatbot/stores';
import { useStreamingTextAnimation } from './useStreamingTextAnimation';
// Đảm bảo đường dẫn tới appConfig là chính xác - sử dụng đường dẫn bạn cung cấp
import { appConfig } from '@/src/middleware';
import { useUpdateChatMessageCallbackForAnimation } from '../../app/[locale]/chatbot/stores/storeHooks';
import { useShallow } from 'zustand/react/shallow';

// Lấy URL backend từ appConfig.
const BACKEND_URL_FROM_CONFIG = appConfig.NEXT_PUBLIC_BACKEND_URL || '';
let SOCKET_SERVER_URL_FINAL = BACKEND_URL_FROM_CONFIG;

if (typeof window !== 'undefined' && BACKEND_URL_FROM_CONFIG) {
    try {
        const currentFrontendProtocol = window.location.protocol;
        const backendUrlParsed = new URL(BACKEND_URL_FROM_CONFIG);
        const backendHost = backendUrlParsed.hostname;
        const backendPort = backendUrlParsed.port ? `:${backendUrlParsed.port}` : '';

        if (currentFrontendProtocol === 'https:') {
            SOCKET_SERVER_URL_FINAL = `wss://${backendHost}${backendPort}`;
        } else {
            SOCKET_SERVER_URL_FINAL = `ws://${backendHost}${backendPort}`;
        }
        // console.log(`[SocketManager] Determined final socket URL: ${SOCKET_SERVER_URL_FINAL}`);
    } catch (e) {
        console.error("[SocketManager] Failed to parse backend URL from config:", e);
        SOCKET_SERVER_URL_FINAL = BACKEND_URL_FROM_CONFIG; // Fallback
    }
} else if (typeof window === 'undefined' && BACKEND_URL_FROM_CONFIG) {
    // SSR: Use config directly
    SOCKET_SERVER_URL_FINAL = BACKEND_URL_FROM_CONFIG;
    // console.log("[SocketManager] SSR: Using configured backend URL directly.");
} else if (!BACKEND_URL_FROM_CONFIG) {
    // console.warn("[SocketManager] NEXT_PUBLIC_BACKEND_URL is not configured. Socket connection will not be attempted.");
    SOCKET_SERVER_URL_FINAL = ''; // Ensure it's an empty string if not configured
}


export function useChatSocketManager() {
    const authToken = useSocketStore(state => state.authToken);
    const setSocketInstance = useSocketStore(state => state.setSocketInstance);
    // currentSocketRef từ store có thể không cần thiết nếu chúng ta quản lý socketInstanceRef cục bộ
    // const currentSocketRefFromStore = useSocketStore(state => state.socketRef);

    const socketStoreActions = useSocketStore(
        useShallow(state => ({
            _onSocketConnect: state._onSocketConnect,
            _onSocketDisconnect: state._onSocketDisconnect,
            _onSocketConnectError: state._onSocketConnectError,
            _onSocketAuthError: state._onSocketAuthError,
            _onSocketConnectionReady: state._onSocketConnectionReady,
        }))
    );

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
            setAnimationControls: state.setAnimationControls,
        }))
    );

    const updateCallbackForAnimation = useUpdateChatMessageCallbackForAnimation();
    const animationControls = useStreamingTextAnimation(updateCallbackForAnimation);

    const previousAuthTokenRef = useRef(authToken);
    const isMountedRef = useRef(true);
    const socketInstanceRef = useRef<Socket | null>(null);
    // Ref mới để lưu trữ URL đã sử dụng cho socket hiện tại
    const currentSocketUrlRef = useRef<string | null>(null);


    useEffect(() => {
        isMountedRef.current = true;
        // console.log("useChatSocketManager: Component Mounted");
        return () => {
            isMountedRef.current = false;
            // console.log("useChatSocketManager: Component Unmounted. Initiating cleanup.");
            if (socketInstanceRef.current) {
                // console.log(`[SocketManager] Unmount Cleanup: Disconnecting socket instance (ID: ${socketInstanceRef.current.id || 'N/A'}).`);
                socketInstanceRef.current.removeAllListeners();
                socketInstanceRef.current.disconnect();
                socketInstanceRef.current = null;
                currentSocketUrlRef.current = null; // Clear URL ref on unmount
            }
        };
    }, []);

    useEffect(() => {
        if (isMountedRef.current) {
            messageStoreActions.setAnimationControls(animationControls);
        }
    }, [animationControls, messageStoreActions.setAnimationControls]);

    useEffect(() => {
        // console.log(`[SocketManager] Main Effect. AuthToken: ${authToken}, Current Socket URL: ${currentSocketUrlRef.current}, Desired URL: ${SOCKET_SERVER_URL_FINAL}, Connected: ${socketInstanceRef.current?.connected}`);

        if (!isMountedRef.current) {
            // console.log("[SocketManager] Not mounted, returning.");
            return;
        }

        // 1. Xử lý trường hợp không có URL để kết nối
        if (!SOCKET_SERVER_URL_FINAL) {
            // console.warn("[SocketManager] No final backend URL. Disconnecting if active.");
            if (socketInstanceRef.current) {
                socketInstanceRef.current.removeAllListeners();
                socketInstanceRef.current.disconnect();
                socketInstanceRef.current = null;
                setSocketInstance(null);
            }
            currentSocketUrlRef.current = null;
            previousAuthTokenRef.current = authToken;
            return;
        }

        // 2. Xử lý Auth Token chưa sẵn sàng (undefined)
        if (authToken === undefined) {
            // console.log("[SocketManager] Auth token undefined. Disconnecting if active.");
            if (socketInstanceRef.current) {
                socketInstanceRef.current.removeAllListeners();
                socketInstanceRef.current.disconnect();
                socketInstanceRef.current = null;
                setSocketInstance(null);
            }
            currentSocketUrlRef.current = null;
            // Không cập nhật previousAuthTokenRef để effect chạy lại khi token có giá trị
            return;
        }

        // 3. Kiểm tra xem có cần tạo kết nối mới không
        // Điều kiện để BỎ QUA việc tạo socket mới:
        // - Đã có instance socket (socketInstanceRef.current)
        // - Socket đó đang kết nối (socketInstanceRef.current.connected)
        // - Auth token không thay đổi (previousAuthTokenRef.current === authToken)
        // - URL kết nối không thay đổi (currentSocketUrlRef.current === SOCKET_SERVER_URL_FINAL)
        if (
            socketInstanceRef.current &&
            socketInstanceRef.current.connected &&
            previousAuthTokenRef.current === authToken &&
            currentSocketUrlRef.current === SOCKET_SERVER_URL_FINAL
        ) {
            // console.log("[SocketManager] Conditions met, no need to reconnect.");
            return;
        }

        // 4. Nếu có instance socket cũ, ngắt kết nối nó trước khi tạo cái mới
        // Điều này xảy ra nếu token thay đổi, URL thay đổi, hoặc socket bị ngắt kết nối đột ngột
        if (socketInstanceRef.current) {
            // console.log("[SocketManager] Disconnecting previous socket instance.");
            socketInstanceRef.current.removeAllListeners();
            socketInstanceRef.current.disconnect();
            socketInstanceRef.current = null;
            // setSocketInstance(null) đã được gọi ở đây hoặc sẽ được gọi bởi 'disconnect' event handler
        }
        // Đặt lại currentSocketUrlRef vì instance cũ đã bị ngắt
        currentSocketUrlRef.current = null;
        setSocketInstance(null); // Đảm bảo store được cập nhật

        // 5. Xử lý trường hợp Auth Token là null (đã đăng xuất)
        if (authToken === null) {
            // console.log("[SocketManager] Auth token is null (logged out). Will not connect.");
            previousAuthTokenRef.current = authToken; // Cập nhật ref
            // currentSocketUrlRef đã được set là null ở trên
            return;
        }

        // 6. Tạo kết nối socket mới
        // console.log(`[SocketManager] Attempting to connect to ${SOCKET_SERVER_URL_FINAL}.`);
        const newSocket = io(SOCKET_SERVER_URL_FINAL, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 10000,
            auth: { token: authToken },
            transports: ['websocket'], // Ưu tiên websocket cho WSS
        });

        // Cập nhật refs và store với instance mới
        socketInstanceRef.current = newSocket;
        currentSocketUrlRef.current = SOCKET_SERVER_URL_FINAL; // Lưu URL đã sử dụng
        previousAuthTokenRef.current = authToken;
        if (isMountedRef.current) {
            setSocketInstance(newSocket);
        }

        // --- Đăng ký Event Handlers ---
        const createMountedAwareHandler = <Args extends any[]>(handler: (...args: Args) => void) => {
            return (...args: Args) => {
                // Chỉ thực thi handler nếu component còn mounted VÀ newSocket là instance hiện tại trong ref
                if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                    handler(...args);
                }
            };
        };

        newSocket.on('connect', createMountedAwareHandler(() => {
            if (newSocket.id) { // Đảm bảo newSocket.id có giá trị
                 // console.log(`[SocketManager] Socket connected with ID: ${newSocket.id}`);
                socketStoreActions._onSocketConnect(newSocket.id);
            }
        }));

        newSocket.on('disconnect', createMountedAwareHandler((reason) => {
            // console.log(`[SocketManager] Socket disconnected. Reason: ${reason}`);
            socketStoreActions._onSocketDisconnect(reason);
            // Nếu ngắt kết nối không phải do unmount hoặc tạo socket mới, có thể cần clear currentSocketUrlRef
            // Tuy nhiên, logic ở đầu effect sẽ xử lý việc tạo lại kết nối nếu cần.
            // if (socketInstanceRef.current === newSocket) { // Kiểm tra xem có phải là socket hiện tại không
            //     currentSocketUrlRef.current = null;
            // }
        }));

        newSocket.on('connect_error', createMountedAwareHandler(socketStoreActions._onSocketConnectError));
        newSocket.on('auth_error', createMountedAwareHandler(socketStoreActions._onSocketAuthError));
        newSocket.on('connection_ready', createMountedAwareHandler(socketStoreActions._onSocketConnectionReady));

        // Conversation Store Events
        newSocket.on('conversation_list', createMountedAwareHandler(conversationStoreActions._onSocketConversationList));
        newSocket.on('initial_history', createMountedAwareHandler(conversationStoreActions._onSocketInitialHistory));
        newSocket.on('new_conversation_started', createMountedAwareHandler(conversationStoreActions._onSocketNewConversationStarted));
        newSocket.on('conversation_deleted', createMountedAwareHandler(conversationStoreActions._onSocketConversationDeleted));
        newSocket.on('conversation_cleared', createMountedAwareHandler(conversationStoreActions._onSocketConversationCleared));
        newSocket.on('conversation_renamed', createMountedAwareHandler(conversationStoreActions._onSocketConversationRenamed));
        newSocket.on('conversation_pin_status_changed', createMountedAwareHandler(conversationStoreActions._onSocketConversationPinStatusChanged));

        // Message Store Events
        newSocket.on('status_update', createMountedAwareHandler(messageStoreActions._onSocketStatusUpdate));
        newSocket.on('chat_update', createMountedAwareHandler(messageStoreActions._onSocketChatUpdate));
        newSocket.on('chat_result', createMountedAwareHandler(messageStoreActions._onSocketChatResult));
        newSocket.on('chat_error', createMountedAwareHandler(messageStoreActions._onSocketChatError));
        newSocket.on('email_confirmation_result', createMountedAwareHandler(messageStoreActions._onSocketEmailConfirmationResult));

        // Reconnection events
        newSocket.io.on('reconnect_attempt', createMountedAwareHandler((attemptNumber) => {
            // console.log(`[SocketManager] Reconnect attempt ${attemptNumber}`);
        }));
        newSocket.io.on('reconnect_error', createMountedAwareHandler(socketStoreActions._onSocketConnectError)); // Có thể dùng lại connect_error
        newSocket.io.on('reconnect_failed', createMountedAwareHandler(() => {
            // console.error('[SocketManager] Failed to reconnect after multiple attempts.');
            socketStoreActions._onSocketConnectError(new Error("Failed to reconnect to server."));
        }));
        newSocket.io.on('reconnect', createMountedAwareHandler((attemptNumber) => {
             // console.log(`[SocketManager] Successfully reconnected after ${attemptNumber} attempts. Socket ID: ${newSocket.id}`);
             // Event 'connect' sẽ được kích hoạt sau khi kết nối lại thành công.
        }));

        newSocket.on('error', createMountedAwareHandler((error) => {
            // console.error('[SocketManager] Generic socket.on("error"):', error);
        }));

        // Cleanup function cho effect này
        return () => {
            // console.log(`[SocketManager] Effect Cleanup: Disconnecting socket (ID: ${newSocket.id || 'N/A'}) from main effect.`);
            newSocket.removeAllListeners();
            newSocket.io.removeAllListeners(); // Quan trọng: Xóa listener từ manager
            newSocket.disconnect();

            // Chỉ xóa ref và cập nhật store nếu newSocket là instance hiện tại
            if (socketInstanceRef.current === newSocket) {
                socketInstanceRef.current = null;
                currentSocketUrlRef.current = null;
                // Chỉ set store là null nếu đây thực sự là instance cuối cùng bị ngắt
                // Event 'disconnect' nên xử lý việc setSocketInstance(null) trong store
                // setSocketInstance(null); // Xem xét lại, _onSocketDisconnect nên làm việc này
            }
        };
    }, [
        authToken,
        SOCKET_SERVER_URL_FINAL, // Thêm URL vào dependencies
        setSocketInstance,
        socketStoreActions,
        conversationStoreActions,
        messageStoreActions,
        // isMountedRef không cần vì nó là ref, không thay đổi identity
    ]);

    return null;
}