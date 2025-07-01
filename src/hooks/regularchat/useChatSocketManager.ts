
// src/hooks/chatbot/useChatSocketManager.ts
import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import {
    useSocketStore,
    useConversationStore,
    useMessageStore,
} from '@/src/app/[locale]/chatbot/stores';
import { useStreamingTextAnimation } from './useStreamingTextAnimation';
import { appConfig } from '@/src/middleware';
import { useUpdateChatMessageCallbackForAnimation } from '../../app/[locale]/chatbot/stores/storeHooks';
import { useShallow } from 'zustand/react/shallow';
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG

// ... (Phần tính toán socketIoBaseUrl và socketIoPathOption giữ nguyên) ...
// Lấy URL backend từ appConfig.
const BACKEND_URL_CONFIG = appConfig.NEXT_PUBLIC_BACKEND_URL || '';
let socketIoBaseUrl: string = '';
let socketIoPathOption: string | undefined = undefined;

if (typeof window !== 'undefined' && BACKEND_URL_CONFIG) {
    try {
        const backendUrlParsed = new URL(BACKEND_URL_CONFIG);
        const socketProtocol = backendUrlParsed.protocol === 'https:' ? 'wss:' : 'ws:';
        socketIoBaseUrl = `${socketProtocol}//${backendUrlParsed.hostname}${backendUrlParsed.port ? `:${backendUrlParsed.port}` : ''}`;
        let normalizedBackendPath = backendUrlParsed.pathname.startsWith('/') ? backendUrlParsed.pathname : '/' + backendUrlParsed.pathname;
        if (normalizedBackendPath !== '/' && !normalizedBackendPath.endsWith('/')) {
            normalizedBackendPath += '/';
        }
        socketIoPathOption = normalizedBackendPath + 'socket.io/';
        // console.log(`[SocketManager Init] Calculated socket base URL: ${socketIoBaseUrl}`);
        // console.log(`[SocketManager Init] Calculated socket path option: ${socketIoPathOption}`);
    } catch (e) {
        // console.error("[SocketManager Init] Failed to parse backend URL from config:", e);
        socketIoBaseUrl = ''; // Invalidate
    }
} else if (!BACKEND_URL_CONFIG && typeof window !== 'undefined') { // Log chỉ khi ở client và không có config
    // console.warn("[SocketManager Init] NEXT_PUBLIC_BACKEND_URL is not configured. Socket connection will not be attempted.");
}


export function useChatSocketManager() {
    const { getToken, isLoggedIn, isInitializing: isAuthInitializing } = useAuth();
    const currentAuthToken = getToken();
    const { setSocketInstance, setCurrentAuthTokenForSocket } = useSocketStore(
        useShallow(state => ({
            setSocketInstance: state.setSocketInstance,
            setCurrentAuthTokenForSocket: state.setCurrentAuthTokenForSocket,
        }))
    );

    const updateCallbackForAnimation = useUpdateChatMessageCallbackForAnimation();
    const animationControls = useStreamingTextAnimation(updateCallbackForAnimation);

    const previousAuthTokenRef = useRef(currentAuthToken);
    const isMountedRef = useRef(true);
    const socketInstanceRef = useRef<Socket | null>(null); // Ref để giữ instance socket hiện tại

    //useEffect thứ nhất (của animation) cũng cần sửa
    useEffect(() => {
        if (isMountedRef.current) {
            // SỬA Ở ĐÂY
            useMessageStore.getState().setAnimationControls(animationControls);
        }
    }, [animationControls]); // Giờ đây chỉ cần dependency là animationControls



    useEffect(() => {
        isMountedRef.current = true;
        setCurrentAuthTokenForSocket(currentAuthToken);

        // console.log(`[SocketManager Connect Effect] Running. AuthToken from AuthContext: ${currentAuthToken ? 'exists' : 'null'}, isLoggedIn: ${isLoggedIn}, isAuthInitializing: ${isAuthInitializing}, Base URL: ${socketIoBaseUrl}`);

        // 1. Chờ AuthContext khởi tạo xong
        if (isAuthInitializing) {
            // console.log("[SocketManager Connect Effect] AuthContext is initializing. Skipping connection attempt.");
            if (socketInstanceRef.current && socketInstanceRef.current.connected) {
                // console.log("[SocketManager Connect Effect] Disconnecting existing socket while AuthContext initializes.");
                socketInstanceRef.current.disconnect();
                // Instance ref sẽ được set là null nếu ngắt kết nối ở đây để logic sau đó có thể tạo mới
                socketInstanceRef.current = null;
            }
            return;
        }

        // 2. Handle missing base URL
        if (!socketIoBaseUrl) {
            // console.warn("[SocketManager Connect Effect] Socket Base URL is not valid. Skipping connection.");
            if (socketInstanceRef.current) {
                socketInstanceRef.current.disconnect();
                socketInstanceRef.current = null;
            }
            previousAuthTokenRef.current = currentAuthToken;
            return;
        }

        // 3. Quyết định có cần ngắt kết nối socket cũ hoặc tạo socket mới
        const isSocketCurrentlyConnected = socketInstanceRef.current ? socketInstanceRef.current.connected : false;
        const tokenHasChanged = previousAuthTokenRef.current !== currentAuthToken;

        // Ngắt kết nối socket hiện tại NẾU:
        // - Nó tồn tại (socketInstanceRef.current không null) VÀ
        //   ( (Token đã thay đổi) HOẶC (không có token VÀ socket vẫn đang kết nối) )
        if (socketInstanceRef.current && (tokenHasChanged || (!currentAuthToken && isSocketCurrentlyConnected))) {
            // console.log(`[SocketManager Connect Effect] Disconnecting previous socket. Instance ID: ${socketInstanceRef.current.id}. Token changed: ${tokenHasChanged}, No token & connected: ${!currentAuthToken && isSocketCurrentlyConnected}`);
            socketInstanceRef.current.disconnect();
            socketInstanceRef.current = null; // Xóa ref sau khi disconnect để logic tạo mới có thể chạy
        }

        // Tạo kết nối MỚI NẾU:
        // - Chưa có socket instance nào (socketInstanceRef.current là null)
        //   (Điều này xảy ra ở lần chạy đầu tiên, hoặc sau khi socket cũ đã bị ngắt ở trên)
        if (!socketInstanceRef.current) {
            // console.log(`[SocketManager Connect Effect] Attempting to create socket instance. Token for auth: ${currentAuthToken ? 'VALID' : 'NULL'}`);



            const newSocket = io(socketIoBaseUrl, {
                // ... (options của socket giữ nguyên)
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                auth: { token: currentAuthToken },
                transports: ['websocket'],
                ...(socketIoPathOption && socketIoPathOption !== '/socket.io/' && { path: socketIoPathOption }),
            });


            socketInstanceRef.current = newSocket;
            if (isMountedRef.current) {
                setSocketInstance(newSocket);
            }

            const createMountedAwareHandler = <Args extends any[]>(handler: (...args: Args) => void) => {
                return (...args: Args) => {
                    if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                        handler(...args);
                    }
                };
            };

            // --- Register Event Handlers (ĐÃ SỬA HOÀN CHỈNH) ---

            // Basic events
            newSocket.on('connect', createMountedAwareHandler(() => {
                if (newSocket.id) useSocketStore.getState()._onSocketConnect(newSocket.id);
            }));
            newSocket.on('disconnect', createMountedAwareHandler(useSocketStore.getState()._onSocketDisconnect));
            newSocket.on('connect_error', createMountedAwareHandler(useSocketStore.getState()._onSocketConnectError));
            newSocket.on('auth_error', createMountedAwareHandler(useSocketStore.getState()._onSocketAuthError));
            newSocket.on('error', createMountedAwareHandler((error) => {
                // console.error(`[SocketManager] Generic Socket Error: ${error.message}`, error); 
            }));

            // Custom events
            newSocket.on('connection_ready', createMountedAwareHandler(useSocketStore.getState()._onSocketConnectionReady));

            // Conversation events
            newSocket.on('conversation_list', createMountedAwareHandler(useConversationStore.getState()._onSocketConversationList));
            newSocket.on('initial_history', createMountedAwareHandler(useConversationStore.getState()._onSocketInitialHistory));
            newSocket.on('new_conversation_started', createMountedAwareHandler(useConversationStore.getState()._onSocketNewConversationStarted));
            newSocket.on('conversation_deleted', createMountedAwareHandler(useConversationStore.getState()._onSocketConversationDeleted));
            newSocket.on('conversation_cleared', createMountedAwareHandler(useConversationStore.getState()._onSocketConversationCleared));
            newSocket.on('conversation_renamed', createMountedAwareHandler(useConversationStore.getState()._onSocketConversationRenamed));
            newSocket.on('conversation_pin_status_changed', createMountedAwareHandler(useConversationStore.getState()._onSocketConversationPinStatusChanged));

            // Message events
            newSocket.on('status_update', createMountedAwareHandler(useMessageStore.getState()._onSocketStatusUpdate));
            newSocket.on('chat_update', createMountedAwareHandler(useMessageStore.getState()._onSocketChatUpdate));
            newSocket.on('chat_result', createMountedAwareHandler(useMessageStore.getState()._onSocketChatResult));
            newSocket.on('chat_error', createMountedAwareHandler(useMessageStore.getState()._onSocketChatError));
            newSocket.on('email_confirmation_result', createMountedAwareHandler(useMessageStore.getState()._onSocketEmailConfirmationResult));
            newSocket.on('conversation_updated_after_edit', createMountedAwareHandler(useMessageStore.getState()._onSocketConversationUpdatedAfterEdit));

            // Manager (reconnect) events
            newSocket.io.on('reconnect_attempt', createMountedAwareHandler((attempt) => { }
                // console.log(`[SocketManager] Reconnect attempt ${attempt}`
            ));
            newSocket.io.on('reconnect_error', createMountedAwareHandler((error) => {
                // console.error(`[SocketManager] Reconnect error (Manager): ${error.message}`, error);
                useSocketStore.getState()._onSocketConnectError(error); // SỬA Ở ĐÂY
            }));
            newSocket.io.on('reconnect_failed', createMountedAwareHandler(() => {
                // console.error("[SocketManager] Reconnect failed (Manager).");
                useSocketStore.getState()._onSocketConnectError(new Error("Failed to reconnect to server after multiple attempts.")); // SỬA Ở ĐÂY
            }));
            newSocket.io.on('reconnect', createMountedAwareHandler((attemptNumber) => {
                // console.log(`[SocketManager] Reconnected successfully after ${attemptNumber} attempts.`);
            }));
        }

        previousAuthTokenRef.current = currentAuthToken;

        // Cleanup function for component unmount
        return () => {
            isMountedRef.current = false; // Đánh dấu component đã unmount
            // console.log(`[SocketManager Connect Effect Cleanup] Running cleanup for component unmount. Current Socket ID: ${socketInstanceRef.current?.id}`);
            if (socketInstanceRef.current) {
                // console.log("[SocketManager Connect Effect Cleanup] Disconnecting socket on component unmount.");
                socketInstanceRef.current.off(); // Gỡ bỏ tất cả listeners trên instance này
                socketInstanceRef.current.disconnect();
                socketInstanceRef.current = null;
            }
        };
    }, [
        currentAuthToken,
        isLoggedIn,
        isAuthInitializing,
        setSocketInstance,
        setCurrentAuthTokenForSocket,
    ]);

    return null;
}