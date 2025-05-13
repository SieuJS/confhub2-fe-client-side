// src/hooks/chatbot/useChatSocketManager.ts

import { useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import {
    useSocketStore,
    useConversationStore,
    useMessageStore,
} from '@/src/app/[locale]/chatbot/stores'; // Đảm bảo các import này đúng với cấu trúc thư mục của bạn
import { useStreamingTextAnimation } from './useStreamingTextAnimation';
import { appConfig } from '@/src/middleware'; // Đảm bảo đường dẫn này đúng
import { useUpdateChatMessageCallbackForAnimation } from '../../app/[locale]/chatbot/stores/storeHooks'; // Đảm bảo đường dẫn này đúng
import { useShallow } from 'zustand/react/shallow';

// Lấy URL backend từ appConfig.
// Khi có lỗi, nó là https://confhub.ddns.net/api
const BACKEND_URL_CONFIG = appConfig.NEXT_PUBLIC_BACKEND_URL || '';

// Khai báo biến để lưu base URL (origin) và custom path option cho Socket.IO
let socketIoBaseUrl: string = ''; // Ví dụ: 'https://confhub.ddns.net' hoặc 'ws://172.188.242.233:3001'
let socketIoPathOption: string | undefined = undefined; // Ví dụ: '/api/socket.io/' hoặc '/socket.io/' (mặc định)

// Logic tính toán base URL và path option (chạy 1 lần khi module được load/bundle)
// Phải kiểm tra `typeof window` vì code này chạy cả ở SSR (server) và CSR (client)
if (typeof window !== 'undefined' && BACKEND_URL_CONFIG) {
    try {
        const backendUrlParsed = new URL(BACKEND_URL_CONFIG);
        const backendProtocol = backendUrlParsed.protocol;
        const backendHost = backendUrlParsed.hostname;
        // URL object bao gồm cổng mặc định nếu nó không được chỉ định,
        // nên việc thêm `:port` sẽ không bị trùng nếu backendUrlParsed.port rỗng.
        const backendPort = backendUrlParsed.port ? `:${backendUrlParsed.port}` : '';
        const backendPath = backendUrlParsed.pathname; // Ví dụ: '/api' hoặc '/'

        // Đối với kết nối WebSocket, chuyển http -> ws và https -> wss cho base URL protocol
        const socketProtocol = backendProtocol === 'https:' ? 'wss:' : 'ws:';

        // Base URL cho socket connection là origin (giao thức ws/wss + host + port)
        socketIoBaseUrl = `${socketProtocol}//${backendHost}${backendPort}`;

        // Path option là phần path từ config URL + đường dẫn mặc định của Socket.IO '/socket.io/'
        // Cần chuẩn hóa backendPath để đảm bảo đúng định dạng '/path/'
        let normalizedBackendPath = backendPath.startsWith('/') ? backendPath : '/' + backendPath;
        // Thêm dấu '/' cuối cùng nếu chưa có, trừ trường hợp path rỗng hoặc chỉ là '/'
         if (normalizedBackendPath !== '/' && !normalizedBackendPath.endsWith('/')) {
             normalizedBackendPath += '/';
         }

        // Kết hợp normalized backend path với đường dẫn mặc định của Socket.IO server
        socketIoPathOption = normalizedBackendPath + 'socket.io/';

         // Log lại giá trị đã tính toán
         console.log(`[SocketManager Init] Calculated socket base URL: ${socketIoBaseUrl}`);
         console.log(`[SocketManager Init] Calculated socket path option: ${socketIoPathOption}`);

    } catch (e) {
        console.error("[SocketManager Init] Failed to parse backend URL from config:", e);
        // Fallback: Nếu parsing lỗi, không tạo socketIoBaseUrl, logic kết nối sẽ dừng
        socketIoBaseUrl = ''; // Đặt rỗng để báo hiệu lỗi cấu hình
        socketIoPathOption = undefined; // Không sử dụng path option tùy chỉnh
         console.warn(`[SocketManager Init] Invalid backend URL config. Socket connection disabled.`);
    }
} else if (typeof window === 'undefined' && BACKEND_URL_CONFIG) {
    // SSR: Tính toán tương tự để đảm bảo biến có giá trị (mặc dù không kết nối)
     try {
        const backendUrlParsed = new URL(BACKEND_URL_CONFIG);
        const backendProtocol = backendUrlParsed.protocol;
        const backendHost = backendUrlParsed.hostname;
        const backendPort = backendUrlParsed.port ? `:${backendUrlParsed.port}` : '';
        const backendPath = backendUrlParsed.pathname;

        const socketProtocol = backendProtocol === 'https:' ? 'wss:' : 'ws:';
        socketIoBaseUrl = `${socketProtocol}//${backendHost}${backendPort}`;

        let normalizedBackendPath = backendPath.startsWith('/') ? backendPath : '/' + backendPath;
         if (normalizedBackendPath !== '/' && !normalizedBackendPath.endsWith('/')) {
             normalizedBackendPath += '/';
         }
        socketIoPathOption = normalizedBackendPath + 'socket.io/';

        console.log(`[SocketManager Init] SSR: Calculated socket base URL: ${socketIoBaseUrl}`);
        console.log(`[SocketManager Init] SSR: Calculated socket path option: ${socketIoPathOption}`);

    } catch (e) {
        console.error("[SocketManager Init] SSR: Failed to parse backend URL from config:", e);
        socketIoBaseUrl = '';
        socketIoPathOption = undefined;
         console.warn(`[SocketManager Init] SSR: Invalid backend URL config.`);
    }
} else if (!BACKEND_URL_CONFIG) {
     console.warn("[SocketManager Init] NEXT_PUBLIC_BACKEND_URL is not configured. Socket connection will not be attempted.");
     socketIoBaseUrl = ''; // Đặt rỗng để báo hiệu không cấu hình
     socketIoPathOption = undefined;
}


export function useChatSocketManager() {
    const authToken = useSocketStore(state => state.authToken);
    const setSocketInstance = useSocketStore(state => state.setSocketInstance);

    // Chỉ lấy các actions có trong cấu trúc store gốc của bạn
    const socketStoreActions = useSocketStore(useShallow(state => ({
        _onSocketConnect: state._onSocketConnect,
        _onSocketDisconnect: state._onSocketDisconnect,
        _onSocketConnectError: state._onSocketConnectError,
        _onSocketAuthError: state._onSocketAuthError,
        _onSocketConnectionReady: state._onSocketConnectionReady,
        // KHÔNG bao gồm clearSocketError ở đây
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

    // Ref để theo dõi giá trị authToken trước đó
    const previousAuthTokenRef = useRef(authToken);
    // Ref để kiểm tra component còn mounted không
    const isMountedRef = useRef(true);
    // Ref để giữ instance socket hiện tại
    const socketInstanceRef = useRef<Socket | null>(null);


    // Effect để xử lý animation controls (không liên quan trực tiếp đến kết nối socket)
    useEffect(() => {
        if (isMountedRef.current) {
            messageStoreActions.setAnimationControls(animationControls);
        }
    }, [animationControls, messageStoreActions.setAnimationControls]);


    // Effect chính để quản lý kết nối socket
    useEffect(() => {
         console.log(`[SocketManager Connect Effect] Running connect effect. AuthToken: ${authToken}, Base URL: ${socketIoBaseUrl}, Path Option: ${socketIoPathOption}, Previous Token: ${previousAuthTokenRef.current}, Current Socket Connected: ${socketInstanceRef.current?.connected}`);

        // Setup isMountedRef cho cleanup
        isMountedRef.current = true; // Đảm bảo ref đúng khi effect chạy


        // 1. Handle missing base URL (invalid config)
        if (!socketIoBaseUrl) {
             console.warn("[SocketManager Connect Effect] Socket Base URL is not valid or configured. Skipping connection.");
             // Disconnect any existing socket if it somehow was created with a bad config before
             if (socketInstanceRef.current) {
                console.log("[SocketManager Connect Effect] Disconnecting existing socket due to invalid base URL config.");
                socketInstanceRef.current.removeAllListeners();
                socketInstanceRef.current.io.removeAllListeners();
                socketInstanceRef.current.disconnect();
                socketInstanceRef.current = null;
                setSocketInstance(null);
            }
            previousAuthTokenRef.current = authToken; // Cập nhật token cuối cùng đã thấy
            return; // Dừng ở đây nếu config không hợp lệ
        }

        // 2. Handle Auth Token undefined (e.g., during app initialization before auth state is known)
        // Nếu authToken là undefined, ta chờ cho đến khi nó có giá trị (string hoặc null).
        if (authToken === undefined) {
             console.log("[SocketManager Connect Effect] Auth token is undefined. Skipping connection.");
             // Disconnect any existing socket if it exists (e.g., if token became undefined after being set)
             if (socketInstanceRef.current) {
                console.log("[SocketManager Connect Effect] Disconnecting existing socket as auth token is undefined.");
                socketInstanceRef.current.removeAllListeners();
                socketInstanceRef.current.io.removeAllListeners();
                socketInstanceRef.current.disconnect();
                socketInstanceRef.current = null;
                setSocketInstance(null);
            }
            // Không cập nhật previousAuthTokenRef = undefined ở đây.
            // previousAuthTokenRef chỉ được cập nhật khi ta quyết định tạo socket MỚI
            // hoặc quyết định không tạo socket mới vì token = null.
            return; // Không tiếp tục kết nối nếu token undefined
        }

        // 3. Check if reconnection is needed
        // Cần reconnect nếu:
        // - Chưa có socket instance HOẶC
        // - Socket instance hiện tại đang disconnected HOẶC
        // - Auth token đã thay đổi (và token mới không phải là null)
        const needsReconnect = (
            !socketInstanceRef.current ||
            !socketInstanceRef.current.connected ||
            previousAuthTokenRef.current !== authToken
        );

        // 4. Nếu không cần reconnect VÀ token không phải là null (đã xử lý undefined ở bước 2), thì thoát
        // Tránh tạo lại socket không cần thiết nếu token không thay đổi và đã connected
        if (!needsReconnect && authToken !== null) {
            // console.log("[SocketManager Connect Effect] No need to connect/reconnect.");
            // Cập nhật previousTokenRef để phản ánh giá trị hiện tại, ngay cả khi không tạo socket mới
             previousAuthTokenRef.current = authToken;
            return; // Không làm gì thêm
        }

        // --- Từ đây trở đi là logic NGẮT KẾT NỐI cũ và TẠO KẾT NỐI mới (hoặc quyết định không tạo nếu token là null) ---

        // 5. Disconnect existing socket if it exists (vì cần reconnect hoặc token là null)
        if (socketInstanceRef.current) {
            console.log("[SocketManager Connect Effect] Disconnecting previous socket instance before creating a new one or stopping.");
            socketInstanceRef.current.removeAllListeners(); // Gỡ hết listeners của socket cũ
            socketInstanceRef.current.io.removeAllListeners(); // Gỡ hết listeners của Manager cũ
            socketInstanceRef.current.disconnect(); // Ngắt kết nối
            socketInstanceRef.current = null; // Xóa instance khỏi ref
            setSocketInstance(null); // Cập nhật store
             // KHÔNG CÓ clearSocketError ở đây
        }

        // 6. Handle Auth Token null (logged out) - Sau khi đã ngắt kết nối cũ
        if (authToken === null) {
            console.log("[SocketManager Connect Effect] Auth token is null (logged out). Will not connect.");
            previousAuthTokenRef.current = authToken; // Cập nhật token cuối cùng đã thấy (null)
            return; // Dừng ở đây, không tạo socket mới
        }

        // 7. Create new socket instance (Chỉ khi base URL hợp lệ và authToken là string)
        console.log(`[SocketManager Connect Effect] Creating new socket instance connecting to base URL ${socketIoBaseUrl} with path ${socketIoPathOption || 'default'} for token status: ${typeof authToken}.`);

        const newSocket = io(socketIoBaseUrl, { // <-- Sử dụng base URL (origin)
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000, // Tăng timeout nếu cần
            auth: { token: authToken }, // Truyền token qua auth option
            transports: ['websocket'], // Ưu tiên WebSocket
            // Sử dụng tùy chọn 'path' nếu custom path được tính toán và khác mặc định
            ...(socketIoPathOption && socketIoPathOption !== '/socket.io/' && { path: socketIoPathOption }),
        });

        // Update refs and store with new instance
        socketInstanceRef.current = newSocket;
        previousAuthTokenRef.current = authToken; // Cập nhật previousAuthTokenRef với token mới
        // Cập nhật store chỉ khi component còn mounted (xử lý race condition với cleanup)
        if (isMountedRef.current) {
            setSocketInstance(newSocket);
        }

        // --- Register Event Handlers ---
        // Wrapper để đảm bảo handler chỉ chạy nếu component còn mounted
        // VÀ instance socket hiện tại trong ref vẫn là `newSocket`
        const createMountedAwareHandler = <Args extends any[]>(handler: (...args: Args) => void) => {
            return (...args: Args) => {
                if (isMountedRef.current && socketInstanceRef.current === newSocket) {
                    handler(...args);
                } else {
                     // Log nếu handler bị bỏ qua
                     // console.log(`[SocketManager Handler] Skipping handler for event. Mounted: ${isMountedRef.current}, Socket Match: ${socketInstanceRef.current === newSocket}. Event args:`, args);
                }
            };
        };

        // Đăng ký các listeners chính
        newSocket.on('connect', createMountedAwareHandler(() => {
            if (newSocket.id) {
                console.log(`[SocketStore _onSocketConnect] Socket connected with ID ${newSocket.id}`);
                socketStoreActions._onSocketConnect(newSocket.id);
            }
        }));

        newSocket.on('disconnect', createMountedAwareHandler((reason) => {
            console.log(`[SocketStore _onSocketDisconnect] Socket disconnected. Reason: ${reason}`);
            socketStoreActions._onSocketDisconnect(reason);
        }));

        // Error handlers
        newSocket.on('connect_error', createMountedAwareHandler((error) => {
             console.error(`[SocketStore _onSocketConnectError] Connection error: ${error.message}`, error);
             socketStoreActions._onSocketConnectError(error);
         }));
         newSocket.on('auth_error', createMountedAwareHandler((error) => {
             console.error(`[SocketStore _onSocketAuthError] Auth error: ${error.message}`, error);
             socketStoreActions._onSocketAuthError(error);
         }));
        newSocket.on('error', createMountedAwareHandler((error) => {
            console.error(`[SocketManager] Generic Socket Error event: ${error.message}`, error);
            // Có thể gọi chung handler lỗi kết nối nếu muốn hiển thị lỗi này cho user
            // socketStoreActions._onSocketConnectError(error);
        }));


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
        newSocket.io.on('reconnect_attempt', createMountedAwareHandler((attemptNumber) => { console.log(`[SocketManager] Reconnect attempt ${attemptNumber}`); }));
        newSocket.io.on('reconnect_error', createMountedAwareHandler((error) => {
            console.error(`[SocketManager] Reconnect error (Manager): ${error.message}`, error);
            // Có thể hiển thị lỗi reconnect cho user nếu muốn
            // socketStoreActions._onSocketConnectError(error);
        }));
        newSocket.io.on('reconnect_failed', createMountedAwareHandler(() => {
             console.error("[SocketManager] Reconnect failed (Manager).");
            // Có thể thông báo lỗi cuối cùng cho user
            socketStoreActions._onSocketConnectError(new Error("Failed to reconnect to server."));
        }));
        newSocket.io.on('reconnect', createMountedAwareHandler((attemptNumber) => {
            console.log(`[SocketManager] Reconnected successfully after ${attemptNumber} attempts.`);
             // KHÔNG CÓ clearSocketError ở đây
        }));


        // Cleanup function for THIS effect (runs when dependencies change OR component unmounts)
        // This cleanup is crucial when dependencies change and a *new* socket is being created.
        // It ensures the OLD socket's listeners are removed and it's disconnected.
        return () => {
             console.log(`[SocketManager Connect Effect Cleanup] Dependencies changed or component unmounting. Disconnecting socket created in this effect.`);
             if (newSocket) { // Kiểm tra newSocket tồn tại
                 newSocket.removeAllListeners(); // Gỡ hết listeners của socket này
                 newSocket.io.removeAllListeners(); // Gỡ hết listeners của Manager này
                 if (newSocket.connected) { // Chỉ gọi disconnect nếu đang connected
                    newSocket.disconnect();
                 }
                 // console.log("[SocketManager Connect Effect Cleanup] Socket disconnected.");
             }
             // Note: socketInstanceRef.current và store sẽ được cập nhật bởi logic tạo socket mới
             // hoặc bởi cleanup của effect ban đầu khi unmount hoàn toàn.
        };

    }, [
        authToken, // Chạy lại khi authToken thay đổi (undefined -> string/null, string -> null, string -> string khác)
        socketIoBaseUrl, // Chạy lại khi base URL tính toán thay đổi
        socketIoPathOption, // Chạy lại khi path option tính toán thay đổi
        setSocketInstance, // Dependencies từ hooks Zustand
        socketStoreActions, // Dependencies từ hooks Zustand
        conversationStoreActions, // Dependencies từ hooks Zustand
        messageStoreActions, // Dependencies từ hooks Zustand
         // animationControls không cần ở đây
    ]);

    // Component này không render gì
    return null;
}