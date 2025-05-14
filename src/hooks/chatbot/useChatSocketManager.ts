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
        console.log(`[SocketManager Init] Calculated socket base URL: ${socketIoBaseUrl}`);
        console.log(`[SocketManager Init] Calculated socket path option: ${socketIoPathOption}`);
    } catch (e) {
        console.error("[SocketManager Init] Failed to parse backend URL from config:", e);
        socketIoBaseUrl = ''; // Invalidate
    }
} else if (!BACKEND_URL_CONFIG && typeof window !== 'undefined') { // Log chỉ khi ở client và không có config
    console.warn("[SocketManager Init] NEXT_PUBLIC_BACKEND_URL is not configured. Socket connection will not be attempted.");
}


export function useChatSocketManager() {
    // <<<< THAY ĐỔI QUAN TRỌNG: Lấy token từ AuthContext >>>>
    const { getToken, isLoggedIn, isInitializing: isAuthInitializing } = useAuth();
    const currentAuthToken = getToken(); // Lấy token trực tiếp từ hàm của AuthContext

    const { setSocketInstance, setCurrentAuthTokenForSocket } = useSocketStore(
        useShallow(state => ({
            setSocketInstance: state.setSocketInstance,
            setCurrentAuthTokenForSocket: state.setCurrentAuthTokenForSocket,
        }))
    );

    const socketStoreActions = useSocketStore(useShallow(state => ({
        _onSocketConnect: state._onSocketConnect,
        _onSocketDisconnect: state._onSocketDisconnect,
        _onSocketConnectError: state._onSocketConnectError,
        _onSocketAuthError: state._onSocketAuthError,
        _onSocketConnectionReady: state._onSocketConnectionReady,
    })));

    const conversationStoreActions = useConversationStore(useShallow(state => ({
        _onSocketConversationList: state._onSocketConversationList,
        _onSocketInitialHistory: state._onSocketInitialHistory,
        _onSocketNewConversationStarted: state._onSocketNewConversationStarted,
        _onSocketConversationDeleted: state._onSocketConversationDeleted,
        _onSocketConversationCleared: state._onSocketConversationCleared,
        _onSocketConversationRenamed: state._onSocketConversationRenamed,
        _onSocketConversationPinStatusChanged: state._onSocketConversationPinStatusChanged,
    })));

    const messageStoreActions = useMessageStore(useShallow(state => ({
        _onSocketStatusUpdate: state._onSocketStatusUpdate,
        _onSocketChatUpdate: state._onSocketChatUpdate,
        _onSocketChatResult: state._onSocketChatResult,
        _onSocketChatError: state._onSocketChatError,
        _onSocketEmailConfirmationResult: state._onSocketEmailConfirmationResult,
        setAnimationControls: state.setAnimationControls,
    })));

    const updateCallbackForAnimation = useUpdateChatMessageCallbackForAnimation();
    const animationControls = useStreamingTextAnimation(updateCallbackForAnimation);

    const previousAuthTokenRef = useRef(currentAuthToken);
    const isMountedRef = useRef(true);
    const socketInstanceRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (isMountedRef.current) {
            messageStoreActions.setAnimationControls(animationControls);
        }
    }, [animationControls, messageStoreActions.setAnimationControls]);

    useEffect(() => {
        isMountedRef.current = true;

        // <<<< THAY ĐỔI QUAN TRỌNG: Cập nhật currentAuthTokenForSocket trong store >>>>
        // Điều này giúp các phần khác của store (nếu có) biết về token hiện tại,
        // mặc dù socket.io sử dụng token trực tiếp từ `auth` option.
        setCurrentAuthTokenForSocket(currentAuthToken);

        console.log(`[SocketManager Connect Effect] Running. AuthToken from AuthContext: ${currentAuthToken ? 'exists' : 'null'}, isLoggedIn: ${isLoggedIn}, isAuthInitializing: ${isAuthInitializing}, Base URL: ${socketIoBaseUrl}`);

        // 1. Chờ AuthContext khởi tạo xong
        if (isAuthInitializing) {
            console.log("[SocketManager Connect Effect] AuthContext is initializing. Skipping connection attempt.");
            // Nếu có socket cũ, có thể cân nhắc ngắt kết nối nếu logic yêu cầu
            if (socketInstanceRef.current && socketInstanceRef.current.connected) {
                console.log("[SocketManager Connect Effect] Disconnecting existing socket while AuthContext initializes.");
                socketInstanceRef.current.disconnect();
                // setSocketInstance(null) sẽ được gọi trong onDisconnect
            }
            return;
        }

        // 2. Handle missing base URL (invalid config)
        if (!socketIoBaseUrl) {
            console.warn("[SocketManager Connect Effect] Socket Base URL is not valid. Skipping connection.");
            if (socketInstanceRef.current) {
                socketInstanceRef.current.disconnect(); // Không cần removeAllListeners ở đây, disconnect là đủ
            }
            previousAuthTokenRef.current = currentAuthToken;
            return;
        }

        // 3. Logic kết nối/ngắt kết nối dựa trên currentAuthToken và trạng thái socket hiện tại
        const needsNewConnection = (
            currentAuthToken && // Chỉ kết nối nếu có token
            (!socketInstanceRef.current || !socketInstanceRef.current.connected || previousAuthTokenRef.current !== currentAuthToken)
        );

        const needsDisconnection = (
            !currentAuthToken && // Nếu không có token (logged out)
            socketInstanceRef.current && socketInstanceRef.current.connected
        );


        // --- Ngắt kết nối nếu cần ---
        if (needsDisconnection || (needsNewConnection && socketInstanceRef.current)) {
            console.log(`[SocketManager Connect Effect] Disconnecting previous socket. Needs Disconnect: ${needsDisconnection}, Needs New: ${needsNewConnection}`);
            socketInstanceRef.current?.disconnect(); // disconnect sẽ trigger _onSocketDisconnect
            // Các listeners sẽ được gỡ tự động khi socket disconnect và được garbage collected,
            // hoặc khi tạo socket mới, chúng ta sẽ không attach vào instance cũ nữa.
            // Việc gỡ listeners thủ công (`removeAllListeners`) cần cẩn thận hơn nếu dùng cùng instance socket cho nhiều lần connect.
            // Ở đây, chúng ta tạo instance mới mỗi khi token thay đổi đáng kể.
        }


        // --- Tạo kết nối mới nếu cần ---
        if (needsNewConnection && currentAuthToken) { // Double check currentAuthToken
            console.log(`[SocketManager Connect Effect] Creating new socket instance. Token: ${currentAuthToken ? 'VALID' : 'NULL'}`);

            const newSocket = io(socketIoBaseUrl, {
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
                auth: { token: currentAuthToken }, // <<<< SỬ DỤNG currentAuthToken TỪ AuthContext >>>>
                transports: ['websocket'],
                ...(socketIoPathOption && socketIoPathOption !== '/socket.io/' && { path: socketIoPathOption }),
            });

            socketInstanceRef.current = newSocket;
            if (isMountedRef.current) {
                setSocketInstance(newSocket);
            }

            // --- Register Event Handlers (Logic giữ nguyên) ---
            const createMountedAwareHandler = <Args extends any[]>(handler: (...args: Args) => void) => {
                return (...args: Args) => {
                    if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                        handler(...args);
                    }
                };
            };

            newSocket.on('connect', createMountedAwareHandler(() => {
                if (newSocket.id) socketStoreActions._onSocketConnect(newSocket.id);
            }));
            newSocket.on('disconnect', createMountedAwareHandler(socketStoreActions._onSocketDisconnect));
            newSocket.on('connect_error', createMountedAwareHandler(socketStoreActions._onSocketConnectError));
            newSocket.on('auth_error', createMountedAwareHandler(socketStoreActions._onSocketAuthError));
            newSocket.on('error', createMountedAwareHandler((error) => { console.error(`[SocketManager] Generic Socket Error: ${error.message}`, error); }));


            // Custom events
            newSocket.on('connection_ready', createMountedAwareHandler(socketStoreActions._onSocketConnectionReady));

            // Conversation events
            newSocket.on('conversation_list', createMountedAwareHandler(conversationStoreActions._onSocketConversationList));
            newSocket.on('initial_history', createMountedAwareHandler(conversationStoreActions._onSocketInitialHistory));
            newSocket.on('new_conversation_started', createMountedAwareHandler(conversationStoreActions._onSocketNewConversationStarted));
            newSocket.on('conversation_deleted', createMountedAwareHandler(conversationStoreActions._onSocketConversationDeleted));
            newSocket.on('conversation_cleared', createMountedAwareHandler(conversationStoreActions._onSocketConversationCleared));
            newSocket.on('conversation_renamed', createMountedAwareHandler(conversationStoreActions._onSocketConversationRenamed));
            newSocket.on('conversation_pin_status_changed', createMountedAwareHandler(conversationStoreActions._onSocketConversationPinStatusChanged));

            // Message events
            newSocket.on('status_update', createMountedAwareHandler(messageStoreActions._onSocketStatusUpdate));
            newSocket.on('chat_update', createMountedAwareHandler(messageStoreActions._onSocketChatUpdate));
            newSocket.on('chat_result', createMountedAwareHandler(messageStoreActions._onSocketChatResult));
            newSocket.on('chat_error', createMountedAwareHandler(messageStoreActions._onSocketChatError));
            newSocket.on('email_confirmation_result', createMountedAwareHandler(messageStoreActions._onSocketEmailConfirmationResult));


            // Listener cho các sự kiện của Manager (quản lý reconnect)
            newSocket.io.on('reconnect_attempt', createMountedAwareHandler((attempt) => console.log(`[SocketManager] Reconnect attempt ${attempt}`)));
            newSocket.io.on('reconnect_error', createMountedAwareHandler((error) => {
                console.error(`[SocketManager] Reconnect error (Manager): ${error.message}`, error);
                socketStoreActions._onSocketConnectError(error); // Có thể dùng lại handler lỗi kết nối
            }));
            newSocket.io.on('reconnect_failed', createMountedAwareHandler(() => {
                console.error("[SocketManager] Reconnect failed (Manager).");
                socketStoreActions._onSocketConnectError(new Error("Failed to reconnect to server after multiple attempts."));
            }));
            newSocket.io.on('reconnect', createMountedAwareHandler((attemptNumber) => {
                console.log(`[SocketManager] Reconnected successfully after ${attemptNumber} attempts.`);
            }));

        } else if (!currentAuthToken && socketInstanceRef.current) {
            // Trường hợp token trở thành null và socket vẫn còn, đảm bảo nó đã bị ngắt ở bước trên.
            console.log("[SocketManager Connect Effect] Token is null, ensuring no active socket connection.");
        }

        previousAuthTokenRef.current = currentAuthToken;

        // Cleanup function
        return () => {
            isMountedRef.current = false;
            console.log(`[SocketManager Connect Effect Cleanup] Running cleanup. Current Socket ID: ${socketInstanceRef.current?.id}`);
            // Không ngắt kết nối socket ở đây một cách vô điều kiện.
            // Việc ngắt kết nối nên được quản lý bởi logic thay đổi token hoặc unmount toàn bộ AppWideInitializers.
            // Nếu ngắt ở đây mỗi khi `currentAuthToken` thay đổi, sẽ gây ngắt kết nối không cần thiết.
            // `socketInstanceRef.current?.disconnect()` sẽ được gọi bởi logic ở trên nếu token thay đổi VÀ cần tạo socket mới, hoặc token thành null.
        };
    }, [
        currentAuthToken, // Phụ thuộc vào token từ AuthContext
        isLoggedIn,       // Phản ứng với trạng thái đăng nhập
        isAuthInitializing, // Chờ AuthContext khởi tạo
        socketIoBaseUrl,
        socketIoPathOption,
        setSocketInstance,
        setCurrentAuthTokenForSocket, // Thêm vào dependency
        socketStoreActions,
        conversationStoreActions, // Giữ nguyên
        messageStoreActions,    // Giữ nguyên
    ]);

    return null;
}
