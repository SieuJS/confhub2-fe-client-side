// src/hooks/chatbot/useChatSocketManager.ts
import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSocketStore } from '@/src/app/[locale]/chatbot/stores/socketStore';
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< SỬ DỤNG AuthContext
import { appConfig } from '@/src/middleware'; // Giả sử bạn có file này

// URL của Socket.IO server
const SOCKET_URL = appConfig.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'; // Thay thế bằng URL thực tế

export function useChatSocketManager() {
    const {
        setSocketInstance,
        _onSocketConnect,
        _onSocketDisconnect,
        _onSocketConnectError,
        _onSocketAuthError,
        _onSocketConnectionReady,
        disconnectSocket: storeDisconnectSocket, // Lấy hàm disconnect từ store
        setAuthToken: setSocketAuthToken, // Lấy hàm setAuthToken từ store
        authToken: currentSocketAuthToken, // Lấy authToken hiện tại của socket store
        socketRef, // Lấy socketRef từ store
    } = useSocketStore();

    const { isLoggedIn, getToken, isInitializing: isAuthInitializing } = useAuth(); // <<<< Lấy state từ AuthContext

    const hasAttemptedConnectionRef = useRef(false);

    const connectSocket = useCallback(() => {
        // Chỉ kết nối nếu có token và chưa có socket hoặc socket hiện tại chưa kết nối
        const token = getToken(); // Lấy token mới nhất từ AuthContext
        if (!token) {
            console.log('[ChatSocketManager] No auth token available. Cannot connect socket.');
            // Nếu socket đang kết nối thì ngắt nó đi
            if (socketRef.current && socketRef.current.connected) {
                console.log('[ChatSocketManager] Disconnecting existing socket due to missing auth token.');
                storeDisconnectSocket();
            }
            setSocketAuthToken(null); // Đảm bảo token trong socket store cũng là null
            return;
        }

        if (socketRef.current && socketRef.current.connected) {
            // Nếu token đã thay đổi so với token đang dùng để kết nối, ngắt kết nối cũ
            if (currentSocketAuthToken !== token) {
                console.log('[ChatSocketManager] Auth token changed. Reconnecting socket...');
                socketRef.current.disconnect();
                // socketRef.current sẽ được tạo mới bên dưới
            } else {
                console.log('[ChatSocketManager] Socket already connected and token unchanged.');
                return; // Đã kết nối và token không đổi
            }
        }

        setSocketAuthToken(token); // Set token cho socket store TRƯỚC KHI KẾT NỐI
        console.log(`[ChatSocketManager] Attempting to connect socket with token: ${token ? '******' : 'null'}`);
        hasAttemptedConnectionRef.current = true;


        const newSocket = io(SOCKET_URL, {
            auth: { token }, // Gửi token khi kết nối
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 3, // Giới hạn số lần thử kết nối lại
            reconnectionDelay: 2000, // Thời gian chờ giữa các lần thử
        });

        setSocketInstance(newSocket); // Lưu instance mới vào store

        // --- Đăng ký các listeners ---
        newSocket.on('connect', () => {
            // <<<< SỬA Ở ĐÂY >>>>
            if (newSocket.id) { // Kiểm tra xem newSocket.id có giá trị không (không phải undefined/null)
                _onSocketConnect(newSocket.id);
            } else {
                // Trường hợp này rất hiếm, nhưng cần xử lý nếu xảy ra
                console.error('[ChatSocketManager] Socket connected but ID is undefined. This should not happen often.');
                // Bạn có thể quyết định ngắt kết nối và thử lại, hoặc log lỗi và chờ đợi
                // Hoặc, nếu server của bạn luôn trả về ID, bạn có thể không cần nhánh else này
                // và chỉ dựa vào type assertion (Cách 2) nếu bạn chắc chắn.
                // Ví dụ: Tạm thời không làm gì và chờ id được cập nhật, hoặc
                // _onSocketConnectError(new Error("Socket connected without an ID")); // Coi như lỗi kết nối
            }
        });


        newSocket.on('disconnect', (reason: Socket.DisconnectReason) => {
            _onSocketDisconnect(reason);
            // Nếu disconnect do 'io server disconnect' (thường do auth fail ở server),
            // có thể cần xử lý đặc biệt, ví dụ: không tự động kết nối lại nếu token vẫn vậy.
            if (reason === 'io server disconnect') {
                console.warn('[ChatSocketManager] Disconnected by server, possibly auth error during connection.');
                // hasFatalConnectionError sẽ được set bởi _onSocketAuthError nếu có
            }
        });

        newSocket.on('connect_error', (error: Error) => {
            _onSocketConnectError(error); // Store sẽ set hasFatalConnectionError
        });

        newSocket.on('auth_error', (error: { message: string }) => {
            _onSocketAuthError(error); // Store sẽ set hasFatalConnectionError
        });

        newSocket.on('connection_ready', (payload: { userId: string; email: string }) => {
            _onSocketConnectionReady(payload);
        });

        // Listener cho các message từ server (ví dụ: new_message, conversation_updated, etc.)
        // nên được đăng ký trong các store tương ứng (messageStore, conversationStore)
        // bằng cách lắng nghe socketRef.current từ socketStore.

    }, [
        getToken,
        socketRef,
        currentSocketAuthToken,
        setSocketAuthToken,
        setSocketInstance,
        _onSocketConnect,
        _onSocketDisconnect,
        _onSocketConnectError,
        _onSocketAuthError,
        _onSocketConnectionReady,
        storeDisconnectSocket,
    ]);

    // Effect để quản lý kết nối socket dựa trên trạng thái đăng nhập
    useEffect(() => {
        if (isAuthInitializing) {
            console.log('[ChatSocketManager] Auth is initializing, waiting...');
            return; // Chờ AuthContext khởi tạo xong
        }

        if (isLoggedIn) {
            console.log('[ChatSocketManager] User is logged in. Ensuring socket connection.');
            const token = getToken();
            // Nếu token hiện tại của socketStore khác với token từ AuthContext,
            // hoặc nếu socket chưa kết nối, thì thực hiện kết nối.
            if (currentSocketAuthToken !== token || !socketRef.current?.connected) {
                connectSocket();
            }
        } else {
            console.log('[ChatSocketManager] User is not logged in. Ensuring socket is disconnected.');
            if (socketRef.current && socketRef.current.connected) {
                storeDisconnectSocket(); // Ngắt kết nối socket
            }
            setSocketAuthToken(null); // Đảm bảo token trong socket store là null
            hasAttemptedConnectionRef.current = false; // Reset lại để có thể thử kết nối khi login lại
        }

        // Hàm cleanup: ngắt kết nối socket khi component unmount (nếu cần)
        // Tuy nhiên, vì đây là "AppWideInitializer", nó có thể không bao giờ unmount.
        // Việc ngắt kết nối khi logout đã được xử lý ở trên.
        return () => {
            // console.log('[ChatSocketManager] Cleaning up effect.');
            // Không tự động ngắt ở đây trừ khi có logic cụ thể
        };
    }, [
        isLoggedIn,
        isAuthInitializing,
        getToken,
        connectSocket,
        storeDisconnectSocket,
        setSocketAuthToken,
        currentSocketAuthToken, // Thêm để useEffect chạy lại khi token của socket store thay đổi
        socketRef           // Thêm để useEffect chạy lại khi ref của socket store thay đổi
    ]);

    // (Không cần trả về gì vì đây là hook quản lý side-effect)
}