// src/app/[locale]/hooks/chatbot/useChatSocket.ts
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Socket } from 'socket.io-client';

// Import Models and Types (ensure ConfirmEmailSendPayload and EmailConfirmationResult are included)
import {
    StatusUpdate, ResultUpdate, NavigationAction, OpenMapAction,
    ErrorUpdate, ThoughtStep, ChatMessageType, LoadingState, ChatUpdate,
    ConfirmSendEmailAction, // <-- Add
    EmailConfirmationResult, // <-- Add
    FrontendAction,
    InitialHistoryPayload,
    ConversationMetadata        // <-- Make sure this includes the confirm type
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path
import { Language } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import { appConfig } from '@/src/middleware';

import { useSocketConnection, SocketConnectionOptions, SocketEventHandlers } from './useSocketConnection';
import { useStreamingTextAnimation } from './useStreamingTextAnimation';
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils'; // Adjust path

// --- Interfaces (Keep definitions clear) ---
export interface UseChatSocketProps {
    socketUrl: string;
    onConnectionChange?: (isConnected: boolean) => void;
    onInitialConnectionError?: (error: Error) => void;
    onHistoryLoaded?: () => void; // <<< Callback mới
}


// --- CẬP NHẬT INTERFACE NÀY ---

// Interface cho controls trả về (THÊM state và hàm mới)


export interface ChatSocketControls {
    chatMessages: ChatMessageType[];
    loadingState: LoadingState;
    isConnected: boolean;
    sendMessage: (userInput: string, isStreaming: boolean, language: Language) => void;
    socketId: string | null;
    showConfirmationDialog: boolean;
    confirmationData: ConfirmSendEmailAction | null;
    handleConfirmSend: (confirmationId: string) => void;
    handleCancelSend: (confirmationId: string) => void;
    closeConfirmationDialog: () => void;
    // --- Dữ liệu và hàm mới ---
    conversationList: ConversationMetadata[];
    activeConversationId: string | null;
    loadConversation: (conversationId: string) => void;
    startNewConversation: () => void;
    isLoadingHistory: boolean; // <<< Thêm state loading cho history
    // -------------------------
}
// -------------------------------

/**
 * Orchestrates chat functionality using Socket.IO, managing messages,
 * connection state, loading indicators, and streaming text animation.
 */

export function useChatSocket({
    socketUrl,
    onConnectionChange,
    onInitialConnectionError,
    // onHistoryLoaded // <<< Callback này có thể không cần nữa nếu dùng isLoadingHistory
}: UseChatSocketProps): ChatSocketControls { // <<< Cập nhật kiểu trả về


    const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, step: '', message: '' });
    const [hasFatalError, setHasFatalError] = useState<boolean>(false);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState<boolean>(false); // <<< State mới
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false); // <<< State loading mới

    const isMountedRef = useRef(true);
    const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";
    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1] || 'en';
    const [authToken, setAuthToken] = useState<string | null>(null);

    // --- NEW: State for Confirmation Dialog ---
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [confirmationData, setConfirmationData] = useState<ConfirmSendEmailAction | null>(null);
    // ----------------------------------------

    // --- State mới cho danh sách và ID active ---
    const [conversationList, setConversationList] = useState<ConversationMetadata[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    // -------------------------------------------

    useEffect(() => {
        setHasFatalError(false);
        let storedToken: string | null = null;
        if (typeof window !== 'undefined') {
            storedToken = localStorage.getItem('token');
            setAuthToken(storedToken);
            console.log(`[useChatSocket] Auth token loaded: ${storedToken ? 'found' : 'not found'}`);
        } else {
            console.log("[useChatSocket] Cannot load token, not in browser environment.");
            setAuthToken(null);
        }
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const handleContentUpdate = useCallback((messageId: string, newContent: string) => {
        if (!isMountedRef.current) return;
        setChatMessages(prev =>
            prev.map(msg =>
                msg.id === messageId
                    ? { ...msg, message: newContent }
                    : msg
            )
        );
    }, []);
    const animationControls = useStreamingTextAnimation(handleContentUpdate);


    // --- Error Handling (Refined - Keep previous logic) ---
    const handleError = useCallback((
        error: ErrorUpdate | { message: string; type?: 'error' | 'warning', thoughts?: ThoughtStep[] } | Error,
        stopLoading = true,
        isFatal = false
    ) => {
        if (!isMountedRef.current) return;
        console.error("Chat Error/Warning:", error);

        animationControls.stopStreaming();

        let message = 'An unknown error occurred.';
        let type: 'error' | 'warning' = 'error';
        let thoughts: ThoughtStep[] | undefined = undefined;

        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'object' && error !== null) {
            message = error.message || message;
            type = error.type || type;
            thoughts = error.thoughts;
        }

        if (stopLoading) {
            setLoadingState({ isLoading: false, step: 'error', message: type === 'error' ? 'Error' : 'Warning' });
        }

        const botMessage: ChatMessageType = {
            id: generateMessageId(),
            message: message,
            isUser: false,
            type: type,
            thoughts: thoughts
        };

        setChatMessages(prev => {
            // Avoid adding duplicate fatal/connection messages rapidly
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && !lastMsg.isUser && lastMsg.message === message && lastMsg.type === type) {
                console.warn("Duplicate error/warning message suppressed:", message);
                return prev;
            }
            return [...prev, botMessage];
        });

        if (isFatal) {
            console.warn(`[useChatSocket] Fatal error detected (${message}). Setting fatal error flag. Connection managed by useSocketConnection.`);
            // Set fatal error flag. useSocketConnection might disconnect based on connect_error.
            // We prevent sending new messages using this flag.
            setHasFatalError(true);
            onConnectionChange?.(false); // Ensure parent knows connection is effectively down due to fatal error

        }

    }, [animationControls, onConnectionChange]); // Ensure deps are stable

    // --- Socket Event Handlers (Callbacks for useSocketConnection - Minor Adjustments) ---
    // These are now passed to useSocketConnection and stored in its ref.
    // They need to be stable (useCallback) so the ref update isn't triggered unnecessarily.

    // --- SIMPLIFY handleConnect ---
    const handleConnect = useCallback((socketId: string) => {
        if (!isMountedRef.current) return;
        console.log(`[useChatSocket] Event: Connected with ID ${socketId}`);
        setHasFatalError(false);
        onConnectionChange?.(true);
        setLoadingState({ isLoading: false, step: 'connected', message: 'Connected' });
        // No need to request list here anymore
    }, [onConnectionChange]);
    // ---------------------------

    const handleDisconnect = useCallback((reason: Socket.DisconnectReason) => {
        if (!isMountedRef.current) return;
        console.log(`[useChatSocket] Event: Disconnected. Reason: ${reason}`);
        onConnectionChange?.(false);
        animationControls.stopStreaming();

        // Only show error if not intentional and not already fatal
        if (reason !== 'io client disconnect' && !hasFatalError) {
            // Use a more specific error type if needed, maybe just update loading state
            setLoadingState({ isLoading: false, step: 'disconnected', message: `Disconnected: ${reason}` });
            // Avoid flooding with "reconnecting" messages if the hook handles it internally
            // handleError({ message: `Connection lost: ${reason}.`, type: 'warning' }, false, false);
        } else if (hasFatalError) {
            setLoadingState({ isLoading: false, step: 'fatal_error', message: 'Disconnected (Fatal Error)' });
        } else {
            setLoadingState({ isLoading: false, step: 'disconnected', message: 'Disconnected' });
        }
    }, [onConnectionChange, animationControls, hasFatalError]); // Removed handleError dependency if not adding message

    const handleConnectError = useCallback((err: Error) => {
        if (!isMountedRef.current) return;
        console.log("[useChatSocket] Event: Connect Error", err);

        // Determine if fatal (e.g., Auth error)
        const isAuthError = err.message.toLowerCase().includes('auth') ||
            err.message.toLowerCase().includes('token') ||
            err.message.toLowerCase().includes('unauthorized'); // Adjust as needed

        // Always report the error via the handler
        handleError(err, true, isAuthError); // Mark as fatal if auth error detected

        onInitialConnectionError?.(err); // Report initial error if callback provided

        // Update loading state based on error type
        if (isAuthError) {
            setLoadingState({ isLoading: false, step: 'auth_error', message: 'Auth Failed' });
        } else {
            setLoadingState({ isLoading: false, step: 'connection_error', message: 'Connection Failed' });
        }
        // isConnected state is handled by useSocketConnection via its internal state + disconnect event

    }, [onInitialConnectionError, handleError]); // Keep dependencies


    const handleAuthError = useCallback((error: { message: string }) => {
        if (!isMountedRef.current) return;
        console.log("[useChatSocket] Event: Auth Error", error);
        // This is explicitly an authentication error from the server, treat as fatal
        handleError({ ...error, type: 'error' }, true, true); // isFatal = true
        setLoadingState({ isLoading: false, step: 'auth_error', message: 'Auth Failed' });
    }, [handleError]);

    // --- HANDLER MỚI: Nhận danh sách conversations ---
    const handleConversationList = useCallback((list: ConversationMetadata[]) => {
        if (!isMountedRef.current) return;
        console.log(`[useChatSocket] Event: Received conversation list (${list?.length ?? 0} items)`);
        setConversationList(list || []);
        // Có thể dừng loading state cho danh sách ở đây
    }, []);
    // -----------------------------------------------


    const handleInitialHistory = useCallback((payload: InitialHistoryPayload) => {
        if (!isMountedRef.current) return;

        console.log(`[useChatSocket] Event: Initial History Received for ConvID: ${payload.conversationId}, Messages: ${payload.messages?.length ?? 0}`);
        setIsLoadingHistory(false);
        setChatMessages(payload.messages || []);
        setActiveConversationId(payload.conversationId);
        setIsHistoryLoaded(true);

        // --- Đảm bảo reset message trong loadingState ---
        setLoadingState({
            isLoading: false, // Không còn loading nữa
            step: 'history_loaded',
            message: '' // <<< SET MESSAGE VỀ RỖNG
        });
        // ---------------------------------------------

    }, []); // Dependencies không đổi

    // --- HANDLER MỚI: Nhận thông báo đã tạo conversation mới ---
    const handleNewConversationStarted = useCallback((payload: { conversationId: string }) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;

        console.log(`[useChatSocket] Event: New Conversation Started. ID: ${payload.conversationId}`);
        setIsLoadingHistory(false); // Dừng loading nếu có

        // Xóa messages cũ, đặt active ID mới
        setChatMessages([]);
        setActiveConversationId(payload.conversationId);
        setIsHistoryLoaded(false); // Chưa có history nào được load cho conv mới này

        // Reset loading state chung
        setLoadingState({ isLoading: false, step: 'new_chat_ready', message: '' });

        // Có thể cần fetch lại danh sách để hiển thị conv mới nhất lên đầu
        if (socketRef.current) {
            socketRef.current.emit('get_conversation_list');
        }

    }, []); // Không có deps đặc biệt

    const handleStatusUpdate = useCallback((update: StatusUpdate) => {
        if (!isMountedRef.current) return;
        // console.log("[useChatSocket] Event: Status Update", update);
        setLoadingState({ isLoading: true, step: update.step, message: update.message });
    }, []); // Stable



    const handlePartialResult = useCallback((update: ChatUpdate) => {
        if (!isMountedRef.current) return;

        // If this is the first chunk of a new response
        if (!animationControls.isStreaming) {
            const newStreamingId = `streaming-${generateMessageId()}`;
            console.log(`[handlePartialResult] Starting new stream. Placeholder ID: ${newStreamingId}`); // <<< LOG ID PLACEHOLDER

            const newStreamingMessage: ChatMessageType = {
                id: newStreamingId,
                message: '', // Start empty, animation hook will update via callback
                isUser: false,
                type: 'text', // Assume text initially
                thoughts: [], // Placeholder
            };
            setChatMessages(prev => [...prev, newStreamingMessage]);
            setLoadingState(prev => ({ ...prev, isLoading: true, step: 'streaming_response', message: 'Receiving...' }));
            animationControls.startStreaming(newStreamingId); // Tell animation hook to prepare
        }

        // Pass the text chunk to the animation hook
        animationControls.processChunk(update.textChunk);

    }, [animationControls]); // Dependency: animationControls

    // --- MODIFIED: handleResult to check for confirmEmailSend action ---
    
    const handleResult = useCallback((result: ResultUpdate) => {
        if (!isMountedRef.current) return;
        console.log("Socket Result Received:", result);

        animationControls.completeStream();
        setLoadingState({ isLoading: false, step: 'result_received', message: '' });

        const finalMessageId = generateMessageId();
        const streamingId = animationControls.currentStreamingId; // <<< Lấy ID placeholder
    
        // --- DEBUG LOGGING ---
        console.log(`[handleResult] Trying to finalize stream. Streaming ID from controls: ${streamingId}`);
        // --- END DEBUG LOGGING ---
    
        // Check for specific actions BEFORE updating chat messages with final text
        // Check for specific actions BEFORE updating chat messages with final text
        const action = result.action; // Gán vào biến để dễ xử lý
        const isNavigationAction = action?.type === 'navigate';
        const isMapAction = action?.type === 'openMap';
        const isConfirmEmailAction = action?.type === 'confirmEmailSend'; // <-- Check for new action

        const mapLocation = isMapAction ? action.location : undefined; // An toàn vì đã check isMapAction
        const navigationUrl = isNavigationAction ? action.url : undefined; // An toàn vì đã check isNavigationAction

        // --- THAY ĐỔI Ở ĐÂY ---
        let confirmPayload: ConfirmSendEmailAction | undefined = undefined;
        if (isConfirmEmailAction && action) { // Kiểm tra action tồn tại và đúng type
            // Bên trong khối if này, TypeScript biết action.type === 'confirmEmailSend'
            // Do đó, việc truy cập action.payload là an toàn
            confirmPayload = action.payload;
        }
        // ---------------------
        let finalMessageData: Partial<ChatMessageType> = {
            message: result.message || '', // Default message
            thoughts: result.thoughts,
            isUser: false,
        };

        // Determine message type based on action
        if (isMapAction && mapLocation) {
            finalMessageData.type = 'map';
            finalMessageData.location = mapLocation;
            finalMessageData.message = result.message || `Showing map for: ${mapLocation}`;
        } else if (isConfirmEmailAction) {
            // Message type remains 'text', the dialog is a separate UI element
            finalMessageData.type = 'text';
            finalMessageData.message = result.message || 'Please confirm the action.'; // Ensure there's text
        } else {
            finalMessageData.type = 'text';
            if (isNavigationAction && !result.message) {
                finalMessageData.message = `Okay, navigating...`;
            }
        }

        setChatMessages(prevMessages => {
            const streamingId = animationControls.currentStreamingId;
            const messageExistsIndex = streamingId ? prevMessages.findIndex(msg => msg.id === streamingId) : -1;
        
            console.log(`[handleResult setChatMessages] Found placeholder at index: ${messageExistsIndex}`);
        
            if (messageExistsIndex !== -1) {
                // *** THÊM KIỂM TRA NÀY ***
                // Nếu message với ID cuối cùng ĐÃ tồn tại (do lần chạy StrictMode trước đó),
                // thì không làm gì cả ở lần chạy thứ hai này.
                if (prevMessages.some(msg => msg.id === finalMessageId)) {
                     console.warn(`[handleResult setChatMessages] StrictMode double run? Final ID ${finalMessageId} already exists. Skipping replacement.`);
                     return prevMessages; // Trả về state hiện tại, không thay đổi
                }
                // ***********************
        
                console.log(`[handleResult setChatMessages] Replacing placeholder ${streamingId} with final message ${finalMessageId}`);
                const updatedMessages = [...prevMessages];
                updatedMessages[messageExistsIndex] = {
                    ...prevMessages[messageExistsIndex],
                    ...finalMessageData,
                    id: finalMessageId, // ID mới
                    message: finalMessageData.message ?? '',
                };
                return updatedMessages;
            } else {
                // --- ĐÂY LÀ NƠI GÂY LẶP ---
                console.warn(`[handleResult setChatMessages] *** PLACEHOLDER NOT FOUND *** for ID: ${streamingId}. Adding final message ${finalMessageId} as new.`);
                const newMessage: ChatMessageType = {
                    id: finalMessageId,
                    isUser: false,
                    type: 'text',
                    ...finalMessageData,
                    message: finalMessageData.message ?? '',
                };
                if (!prevMessages.some(msg => msg.id === finalMessageId)) {
                    return [...prevMessages, newMessage];
                } else {
                    console.warn(`[handleResult setChatMessages] Final message ${finalMessageId} already exists? Skipping add.`);

                    return prevMessages;
                }
            }
        });

        // --- Execute Frontend Action ---
        if (isNavigationAction && navigationUrl) {
            const finalUrl = constructNavigationUrl(BASE_WEB_URL, currentLocale, navigationUrl);
            openUrlInNewTab(finalUrl);
        } else if (isMapAction) {
            console.log(`[useChatSocket] Map action received for location: ${mapLocation}.`);
            // Potentially trigger map display if needed differently
        } else if (isConfirmEmailAction && confirmPayload) {
            console.log(`[useChatSocket] ConfirmEmailSend action received. ID: ${confirmPayload.confirmationId}`);
            // --- Trigger the confirmation dialog ---
            setConfirmationData(confirmPayload);
            setShowConfirmationDialog(true);
            // -------------------------------------
        }

    }, [animationControls, BASE_WEB_URL, currentLocale]); // Dependencies

    const handleChatErrorEvent = useCallback((errorData: any) => {
        if (!isMountedRef.current) return;
        console.log("[useChatSocket] Event: Chat Error", errorData);
        const isFatal = errorData?.code === 'FATAL_SERVER_ERROR'; // Example check
        handleError(errorData, true, isFatal);
    }, [handleError]); // Keep dependency




    // --- NEW: Handler for Email Confirmation Result Event ---
    const handleEmailConfirmationResult = useCallback((result: EmailConfirmationResult) => {
        if (!isMountedRef.current) return;
        console.log("[useChatSocket] Event: Email Confirmation Result", result);

        // Close the dialog if it's somehow still open (e.g., backend timed out first)
        if (result.confirmationId === confirmationData?.confirmationId) {
            setShowConfirmationDialog(false);
            setConfirmationData(null);
        }

        // Display the result message from the backend in the chat
        const resultMessage: ChatMessageType = {
            id: generateMessageId(),
            message: result.message, // Use the message from the backend
            isUser: false,
            type: result.status === 'success' ? 'text' : 'warning', // Or 'error' based on status
            thoughts: undefined, // No thoughts usually with this event
        };

        setChatMessages(prev => [...prev, resultMessage]);

        // Optionally update loading state or show a toast notification
        setLoadingState({ isLoading: false, step: `email_${result.status}`, message: '' });

    }, [confirmationData]); // Dependency on confirmationData to check ID
    // -------------------------------------------------------


    // --- Socket Connection Hook Initialization ---
    // Memoize options
    const socketOptions: SocketConnectionOptions = useMemo(() => ({
        socketUrl,
        authToken,
        // Only enable connection if URL and token status are valid
        enabled: !!socketUrl && authToken !== undefined, // Connect only if URL is present and token check has finished (even if token is null)
        // Add reconnection options if needed
        // reconnectionDelay: 2000,
        // reconnectionDelayMax: 10000,
    }), [socketUrl, authToken]); // Re-evaluate only if URL or token changes

    const closeConfirmationDialog = useCallback(() => {
        setShowConfirmationDialog(false);
        // Optionally clear data too if desired on manual close
        // setConfirmationData(null);
    }, []); // Thêm useCallback nếu cần sự ổn định



    // --- Cập nhật Socket Event Handlers ---
    const socketEventHandlers: SocketEventHandlers = useMemo(() => ({
        onConnect: handleConnect,
        onDisconnect: handleDisconnect,
        onConnectError: handleConnectError,
        onAuthError: handleAuthError,
        onStatusUpdate: handleStatusUpdate,
        onChatUpdate: handlePartialResult,
        onChatResult: handleResult,
        onChatError: handleChatErrorEvent,
        onEmailConfirmationResult: handleEmailConfirmationResult,
        onInitialHistory: handleInitialHistory, // <<< Vẫn dùng để load history cụ thể
        onConversationList: handleConversationList, // <<< Handler mới cho danh sách
        onNewConversationStarted: handleNewConversationStarted, // <<< Handler mới cho new chat
    }), [
        handleConnect, handleDisconnect, handleConnectError, handleAuthError,
        handleStatusUpdate, handlePartialResult, handleResult, handleChatErrorEvent,
        handleEmailConfirmationResult, handleInitialHistory,
        handleConversationList, handleNewConversationStarted // <<< Thêm các handler mới
    ]);
    // ------------------------------------


    const connection = useSocketConnection(socketOptions, socketEventHandlers);
    const { isConnected, socketId, socketRef } = connection; // <<< Get socketRef here



    // -----------------------------------------



    // --- SỬA ĐỔI: Send Message Function ---
    const sendMessage = useCallback((userInput: string, isStreaming: boolean, language: Language) => {
        const trimmedMessage = userInput.trim();
        if (!trimmedMessage) return;

        // Check for fatal error first
        if (hasFatalError) {
            handleError({ message: "Cannot send message: A critical connection error occurred. Please refresh or log in again.", type: 'error' }, false, false);
            return;
        }

        // Use the isConnected state derived from useSocketConnection
        if (!socketRef.current || !isConnected) {
            handleError({ message: "Cannot send message: Not connected.", type: 'error' }, false, false);
            // Maybe attempt reconnect explicitly here if desired, but useSocketConnection should handle it
            // Example: connection.connect(); // If manual connection is implemented
            return;
        }

        animationControls.stopStreaming();
        setLoadingState({ isLoading: true, step: 'sending', message: 'Sending...' });

        const newUserMessage: ChatMessageType = {
            id: generateMessageId(), message: trimmedMessage, isUser: true, type: 'text'
        };
        // Thêm tin nhắn user vào state ngay lập tức
        setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

        // --- GỬI MESSAGE ---
        // Backend sẽ tự xác định conversation ID dựa trên socket.data.currentConversationId
        // Hoặc tạo mới nếu chưa có active ID nào được set trên socket data phía backend
        console.log(`Emitting 'send_message' (Streaming: ${isStreaming}, Lang: ${language}). ActiveConvID on Frontend (for info): ${activeConversationId}. Socket ID: ${socketRef.current?.id}`);
        socketRef.current.emit('send_message', {
            userInput: trimmedMessage,
            isStreaming: isStreaming,
            language: language
            // KHÔNG cần gửi conversationId từ đây nữa, backend tự quản lý active ID
        });
        // -----------------

    }, [isConnected, hasFatalError, handleError, animationControls, socketRef, activeConversationId]); // Thêm activeConversationId vào deps để log cho đúng
    // -----------------------------


    // --- HÀM MỚI: Load conversation cụ thể ---
    const loadConversation = useCallback((conversationId: string) => {
        if (!socketRef.current || !isConnected) {
            handleError({ message: 'Cannot load conversation: Not connected.', type: 'error' }, false, false);
            return;
        }
        if (!conversationId) {
            console.warn("[useChatSocket] Attempted to load conversation with invalid ID.");
            return;
        }
        // Chỉ load nếu ID khác với ID đang active (tránh load lại vô ích)
        if (conversationId === activeConversationId) {
            console.log(`[useChatSocket] Conversation ${conversationId} is already active.`);
            return;
        }

        console.log(`[useChatSocket] Requesting to load conversation ID: ${conversationId}`);
        setIsLoadingHistory(true); // <<< Bắt đầu loading history
        setChatMessages([]); // Xóa messages cũ trước khi load mới
        setIsHistoryLoaded(false); // Reset trạng thái history loaded
        setLoadingState({ isLoading: true, step: 'loading_history', message: 'Loading history...' }); // Cập nhật loading chung
        socketRef.current.emit('load_conversation', { conversationId });

    }, [socketRef, isConnected, handleError, activeConversationId]); // Thêm activeConversationId vào deps
    // ----------------------------------------

    // --- HÀM MỚI: Bắt đầu conversation mới ---
    const startNewConversation = useCallback(() => {
        if (!socketRef.current || !isConnected) {
            handleError({ message: 'Cannot start new chat: Not connected.', type: 'error' }, false, false);
            return;
        }

        console.log(`[useChatSocket] Requesting to start a new conversation...`);
        setIsLoadingHistory(true); // Có thể coi như đang load trạng thái mới
        // Xóa messages cũ, reset active ID và trạng thái load
        setChatMessages([]);
        setActiveConversationId(null);
        setIsHistoryLoaded(false);
        setLoadingState({ isLoading: true, step: 'starting_new_chat', message: 'Starting new chat...' }); // Loading state mới

        socketRef.current.emit('start_new_conversation');

    }, [socketRef, isConnected, handleError]);
    // ---------------------------------------

    // --- NEW: Callbacks for Dialog Actions ---
    const handleConfirmSend = useCallback((confirmationId: string) => {
        if (socketRef.current && isConnected) {
            console.log(`[useChatSocket] Emitting 'user_confirm_email' for ID: ${confirmationId}`);
            socketRef.current.emit('user_confirm_email', { confirmationId });
            // Optional: Show visual feedback immediately
            setLoadingState({ isLoading: true, step: 'confirming_email', message: 'Sending email...' })
        } else {
            handleError({ message: 'Cannot confirm: Not connected.', type: 'error' }, false, false);
        }
        // Dialog closes itself via its internal state/onClose prop
    }, [socketRef, isConnected, handleError]);

    const handleCancelSend = useCallback((confirmationId: string) => {
        if (socketRef.current && isConnected) {
            console.log(`[useChatSocket] Emitting 'user_cancel_email' for ID: ${confirmationId}`);
            socketRef.current.emit('user_cancel_email', { confirmationId });
        } else {
            // Less critical if cancelling fails, maybe just log?
            console.warn('[useChatSocket] Cannot cancel: Not connected.');
        }
        // Dialog closes itself via its internal state/onClose prop
    }, [socketRef, isConnected]);
    // ----------------------------------------

    // --- Return Hook Controls (THÊM state và hàm mới) ---
    return {
        chatMessages,
        loadingState,
        isConnected: isConnected && !hasFatalError,
        sendMessage,
        socketId,
        showConfirmationDialog,
        confirmationData,
        handleConfirmSend,
        handleCancelSend,
        closeConfirmationDialog,
        // --- Trả về state và hàm mới ---
        conversationList,
        activeConversationId,
        loadConversation,
        startNewConversation,
        isLoadingHistory, // <<< Trả về state loading
        // -----------------------------
    };
}

