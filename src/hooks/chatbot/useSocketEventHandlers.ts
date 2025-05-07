// src/app/[locale]/hooks/chatbot/useSocketEventHandlers.ts
import { useCallback, useMemo, MutableRefObject } from 'react';
import { Socket } from 'socket.io-client';
import {
    StatusUpdate, ResultUpdate,
    ErrorUpdate, ChatMessageType, ChatUpdate,
    ConfirmSendEmailAction, EmailConfirmationResult,
    InitialHistoryPayload, ConversationMetadata,
    ConversationDeletedPayload,
    ConversationClearedPayload,
    ConversationRenamedPayload,
    ConversationPinStatusChangedPayload,
    // No longer need ConversationSearchResultsPayload if it was defined
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { SocketEventHandlers as BaseSocketEventHandlers } from './useSocketConnection';
import { StreamingTextAnimationControls } from './useStreamingTextAnimation';
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { ChatStateSetters } from './useChatState';


// --- Interface for Props passed TO useSocketEventHandlers hook ---
/**
 * Defines the properties required by the useSocketEventHandlers hook.
 */
// Remove setSearchResults and setIsSearching from props if they were only for search results event
export interface UseSocketEventHandlersProps extends Omit<ChatStateSetters,
    'setAuthToken' | 'setSearchResults' | 'setIsSearching'
> {
    isMountedRef: React.MutableRefObject<boolean>;
    animationControls: StreamingTextAnimationControls;
    handleError: (error: any, stopLoading?: boolean, isFatal?: boolean) => void;
    onConnectionChange?: (isConnected: boolean) => void;
    onInitialConnectionError?: (error: Error) => void;
    confirmationData: ConfirmSendEmailAction | null;
    BASE_WEB_URL: string;
    currentLocale: string;
    socketRef: React.MutableRefObject<Socket | null>;
    isAwaitingFinalResultRef: MutableRefObject<boolean>;
    activeConversationId: string | null;
    resetAwaitFlag: () => void;
    onConnectionReady?: (payload: { userId: string, email: string }) => void; // THÊM MỚI

}


// --- Interface for the Handlers OBJECT RETURNED BY useSocketEventHandlers ---
export interface SocketEventHandlers extends BaseSocketEventHandlers {
    onConnect: (socketId: string) => void;
    onDisconnect: (reason: Socket.DisconnectReason) => void;
    onConnectError: (err: Error) => void;
    onAuthError: (error: { message: string }) => void;
    onStatusUpdate: (update: StatusUpdate) => void;
    onChatUpdate: (update: ChatUpdate) => void;
    onChatResult: (result: ResultUpdate) => void;
    onChatError: (errorData: ErrorUpdate | any) => void;
    onEmailConfirmationResult: (result: EmailConfirmationResult) => void;
    onInitialHistory: (payload: InitialHistoryPayload) => void;
    onConversationList: (list: ConversationMetadata[]) => void;
    onNewConversationStarted: (payload: { conversationId: string }) => void;
    onConversationDeleted: (payload: ConversationDeletedPayload) => void;
    onConversationCleared: (payload: ConversationClearedPayload) => void;
    onConversationRenamed: (payload: ConversationRenamedPayload) => void;
    onConversationPinStatusChanged: (payload: ConversationPinStatusChangedPayload) => void;
    onConnectionReady?: (payload: { userId: string, email: string }) => void; // THÊM MỚI

}


export function useSocketEventHandlers({
    isMountedRef,
    setChatMessages,
    setLoadingState,
    setHasFatalError,
    setIsHistoryLoaded,
    setIsLoadingHistory,
    setShowConfirmationDialog,
    setConfirmationData,
    setConversationList,
    setActiveConversationId,
    animationControls,
    handleError,
    onConnectionChange,
    onInitialConnectionError,
    confirmationData,
    BASE_WEB_URL,
    currentLocale,
    isAwaitingFinalResultRef,
    activeConversationId,
    resetAwaitFlag,
    onConnectionReady, // THÊM MỚI

}: UseSocketEventHandlersProps): SocketEventHandlers {

    const handleConnectionReady = useCallback((payload: { userId: string, email: string }) => { // THÊM MỚI
        if (!isMountedRef.current) return;
        console.log(`[useSocketEventHandlers] Event: Connection Ready. UserID: ${payload.userId}`);
        onConnectionReady?.(payload);
    }, [isMountedRef, onConnectionReady]);

    const handleConnect = useCallback((socketId: string) => {
        if (!isMountedRef.current) return;
        console.log(`[useSocketEventHandlers] Event: Connected with ID ${socketId}`);
        setHasFatalError(false);
        onConnectionChange?.(true);
        setLoadingState({ isLoading: false, step: 'connected', message: 'Connected' });
    }, [isMountedRef, setHasFatalError, onConnectionChange, setLoadingState]);

    const handleDisconnect = useCallback((reason: Socket.DisconnectReason) => {
        if (!isMountedRef.current) return;
        console.log(`[useSocketEventHandlers] Event: Disconnected. Reason: ${reason}`);
        onConnectionChange?.(false);
        animationControls.stopStreaming();
        if (reason !== 'io client disconnect') {
            setLoadingState(prev => ({ ...prev, isLoading: false, step: 'disconnected', message: `Disconnected: ${reason}` }));
        } else {
            setLoadingState(prev => ({ ...prev, isLoading: false, step: 'disconnected', message: 'Disconnected' }));
        }
    }, [isMountedRef, onConnectionChange, animationControls, setLoadingState]);

    const handleConnectError = useCallback((err: Error) => {
        if (!isMountedRef.current) return;
        console.log("[useSocketEventHandlers] Event: Connect Error", err);
        const isAuthError = err.message.toLowerCase().includes('auth') || err.message.toLowerCase().includes('token') || err.message.toLowerCase().includes('unauthorized');
        handleError(err, true, isAuthError);
        onInitialConnectionError?.(err);
        setLoadingState({ isLoading: false, step: isAuthError ? 'auth_error' : 'connection_error', message: isAuthError ? 'Auth Failed' : 'Connection Failed' });
    }, [isMountedRef, handleError, onInitialConnectionError, setLoadingState]);

    const handleAuthError = useCallback((error: { message: string }) => {
        if (!isMountedRef.current) return;
        console.log("[useSocketEventHandlers] Event: Auth Error", error);
        handleError({ ...error, type: 'error' }, true, true);
        setLoadingState({ isLoading: false, step: 'auth_error', message: 'Auth Failed' });
    }, [isMountedRef, handleError, setLoadingState]);

    const handleConversationList = useCallback((list: ConversationMetadata[]) => {
        if (!isMountedRef.current) return;
        console.log(`[useSocketEventHandlers] Event: Received conversation list (${list?.length ?? 0} items)`);
        setConversationList(Array.isArray(list) ? list : []);
    }, [isMountedRef, setConversationList]);

    const handleInitialHistory = useCallback((payload: InitialHistoryPayload) => {
        if (!isMountedRef.current) return; // isMountedRef.current không thay đổi thường xuyên
        console.log(`[useSocketEventHandlers] Event: Initial History Received for ConvID: ${payload.conversationId}, Messages: ${payload.messages?.length ?? 0}`);
        // Các hàm setXXX từ useState thường có tham chiếu ổn định
        setIsLoadingHistory(false);
        setChatMessages(Array.isArray(payload.messages) ? payload.messages : []);
        setActiveConversationId(payload.conversationId);
        setIsHistoryLoaded(true);
        setLoadingState({ isLoading: false, step: 'history_loaded', message: '' });
    }, [isMountedRef, setIsLoadingHistory, setChatMessages, setActiveConversationId, setIsHistoryLoaded, setLoadingState]);

    const handleNewConversationStarted = useCallback((payload: { conversationId: string }) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;
        console.log(`[useSocketEventHandlers] Event: New Conversation Started. ID: ${payload.conversationId}`);
        setIsLoadingHistory(false);
        setChatMessages([]);
        setActiveConversationId(payload.conversationId);
        setIsHistoryLoaded(false);
        setLoadingState({ isLoading: false, step: 'new_chat_ready', message: '' });
    }, [isMountedRef, setIsLoadingHistory, setChatMessages, setActiveConversationId, setIsHistoryLoaded, setLoadingState]);

    const handleStatusUpdate = useCallback((update: StatusUpdate) => {
        if (!isMountedRef.current) return;
        setLoadingState({ isLoading: true, step: update.step, message: update.message });
    }, [isMountedRef, setLoadingState]);

    const handlePartialResult = useCallback((update: ChatUpdate) => {
        if (!isMountedRef.current) return;
        const currentAnimationId = animationControls.currentStreamingId;
        const isAlreadyStreaming = isAwaitingFinalResultRef.current || !!currentAnimationId;

        if (isAlreadyStreaming) {
            if (!isAwaitingFinalResultRef.current && currentAnimationId) {
                console.warn("[handlePartialResult] Consistency Warning: Flag was false, but animation hook is active. Ensuring flag is true.");
                isAwaitingFinalResultRef.current = true;
            }
            animationControls.processChunk(update.textChunk);
        } else {
            isAwaitingFinalResultRef.current = true;
            const newStreamingId = `streaming-${generateMessageId()}`;
            const newStreamingMessage: ChatMessageType = { id: newStreamingId, message: '', isUser: false, type: 'text', thoughts: [] };
            setChatMessages(prev => [...prev, newStreamingMessage]);
            setLoadingState(prev => ({ ...prev, isLoading: true, step: 'streaming_response', message: 'Receiving...' }));
            animationControls.startStreaming(newStreamingId);
            animationControls.processChunk(update.textChunk);
        }
    }, [isMountedRef, animationControls, setChatMessages, setLoadingState, isAwaitingFinalResultRef]);

    const handleResult = useCallback((result: ResultUpdate) => {
        if (!isMountedRef.current) return;
        console.log("[useSocketEventHandlers] Socket Result Received:", result);
        if (!isAwaitingFinalResultRef.current) {
            console.warn("[handleResult] Received result but wasn't expecting one (flag was false).");
        }
        isAwaitingFinalResultRef.current = false;
        animationControls.completeStream();
        setLoadingState({ isLoading: false, step: 'result_received', message: '' });

        const finalMessageId = generateMessageId();
        const streamingId = animationControls.currentStreamingId;
        console.log(`[handleResult] Trying to finalize stream. Streaming ID from controls: ${streamingId}`);

        const action = result.action;
        const isNavigationAction = action?.type === 'navigate';
        const isMapAction = action?.type === 'openMap';
        const isConfirmEmailAction = action?.type === 'confirmEmailSend';
        const mapLocation = isMapAction ? action.location : undefined;
        const navigationUrl = isNavigationAction ? action.url : undefined;
        let confirmPayload: ConfirmSendEmailAction | undefined = isConfirmEmailAction ? action.payload : undefined;

        let finalMessageData: Partial<ChatMessageType> = { message: result.message || '', thoughts: result.thoughts, isUser: false };
        if (isMapAction && mapLocation) {
            finalMessageData.type = 'map'; finalMessageData.location = mapLocation; finalMessageData.message = result.message || `Showing map for: ${mapLocation}`;
        } else if (isConfirmEmailAction) {
            finalMessageData.type = 'text'; finalMessageData.message = result.message || 'Please confirm the action.';
        } else {
            finalMessageData.type = 'text'; if (isNavigationAction && !result.message) finalMessageData.message = `Okay, navigating...`;
        }

        setChatMessages(prevMessages => {
            const messageExistsIndex = streamingId ? prevMessages.findIndex(msg => msg.id === streamingId) : -1;
            console.log(`[handleResult setChatMessages] Placeholder search ID: ${streamingId}, Found at index: ${messageExistsIndex}`);
            if (messageExistsIndex !== -1) {
                if (prevMessages.some(msg => msg.id === finalMessageId)) {
                    console.warn(`[handleResult setChatMessages] StrictMode double run? Final ID ${finalMessageId} already exists. Skipping replacement.`);
                    return prevMessages;
                }
                console.log(`[handleResult setChatMessages] Replacing placeholder ${streamingId} with final message ${finalMessageId}`);
                const updatedMessages = [...prevMessages];
                updatedMessages[messageExistsIndex] = { ...prevMessages[messageExistsIndex], ...finalMessageData, id: finalMessageId, message: finalMessageData.message ?? '' };
                return updatedMessages;
            } else {
                console.error(`[handleResult setChatMessages] *** CRITICAL: PLACEHOLDER NOT FOUND *** for ID: ${streamingId}. Cannot replace with final message ${finalMessageId}.`);
                return [...prevMessages, { id: finalMessageId, isUser: false, type: 'text', ...finalMessageData, message: finalMessageData.message ?? '' }];
            }
        });

        if (isNavigationAction && navigationUrl) {
            const finalUrl = constructNavigationUrl(BASE_WEB_URL, currentLocale, navigationUrl);
            openUrlInNewTab(finalUrl);
        } else if (isMapAction) {
            console.log(`[useSocketEventHandlers] Map action received for location: ${mapLocation}.`);
        } else if (isConfirmEmailAction && confirmPayload) {
            console.log(`[useSocketEventHandlers] ConfirmEmailSend action received. ID: ${confirmPayload.confirmationId}`);
            setConfirmationData(confirmPayload);
            setShowConfirmationDialog(true);
        }
    }, [isMountedRef, animationControls, setLoadingState, setChatMessages, setConfirmationData, setShowConfirmationDialog, BASE_WEB_URL, currentLocale, isAwaitingFinalResultRef]);

    const handleChatErrorEvent = useCallback((errorData: any) => {
        if (!isMountedRef.current) return;
        console.log("[useSocketEventHandlers] Event: Chat Error received from server:", errorData);
        isAwaitingFinalResultRef.current = false;
        animationControls.stopStreaming(); // Thêm dòng này để đảm bảo dừng streaming khi có lỗi

        const errorStep = errorData?.step;
        const errorMessage = errorData?.message || "Unknown error";

        const historyLoadErrorSteps = [
            'history_not_found_load',
            'history_load_fail_server',
            'auth_required_load', // Giả sử có step này nếu lỗi auth khi load
            'invalid_request_load',
            // Thêm các error codes/steps mà server trả về khi không load được conversation
            // Ví dụ: 'CONVERSATION_NOT_FOUND', 'ACCESS_DENIED'
        ];

        // Nếu lỗi là do không tìm thấy conversation (thường activeConversationId sẽ là ID không hợp lệ)
        // hoặc lỗi tải chung
        if (historyLoadErrorSteps.includes(errorStep) ||
            (errorData?.code === 'CONVERSATION_NOT_FOUND' && errorData?.details?.conversationId === activeConversationId) || // Server báo rõ ID không tìm thấy
            (errorData?.code === 'ACCESS_DENIED' && errorData?.details?.conversationId === activeConversationId)
        ) {
            console.log(`[useSocketEventHandlers] Chat error (${errorStep || errorData?.code}: "${errorMessage}") is related to current active conversation or history loading. Resetting active state.`);
            setActiveConversationId(null);  // Quan trọng: ID này không còn hợp lệ
            setChatMessages([]);
            setIsHistoryLoaded(false);
            setIsLoadingHistory(false);     // Tắt cờ loading của danh sách/panel
            // setLoadingState có thể được handleError xử lý, nhưng đảm bảo isLoadingHistory là false
        }
        // else if (errorData?.code === 'SOME_OTHER_CRITICAL_HISTORY_ERROR') {
        //    // Xử lý tương tự
        // }

        const isFatal = errorData?.code === 'FATAL_SERVER_ERROR' || errorStep === 'auth_required'; // Lỗi auth cũng nên coi là fatal cho session này
        handleError(errorData, true, isFatal); // handleError sẽ set loadingState và thêm message lỗi
    }, [
        isMountedRef,
        handleError,
        isAwaitingFinalResultRef,
        animationControls, // Thêm
        activeConversationId, // Thêm
        setActiveConversationId,
        setChatMessages,
        setIsHistoryLoaded,
        setIsLoadingHistory
    ]);

    const handleEmailConfirmationResult = useCallback((result: EmailConfirmationResult) => {
        if (!isMountedRef.current) return;
        console.log("[useSocketEventHandlers] Event: Email Confirmation Result", result);
        if (result.confirmationId === confirmationData?.confirmationId) {
            setShowConfirmationDialog(false);
            setConfirmationData(null);
        }
        const resultMessage: ChatMessageType = { id: generateMessageId(), message: result.message, isUser: false, type: result.status === 'success' ? 'text' : 'warning', thoughts: undefined };
        setChatMessages(prev => [...prev, resultMessage]);
        setLoadingState({ isLoading: false, step: `email_${result.status}`, message: '' });
    }, [isMountedRef, confirmationData, setShowConfirmationDialog, setConfirmationData, setChatMessages, setLoadingState]);

    const handleConversationDeleted = useCallback((payload: ConversationDeletedPayload) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;
        const deletedId = payload.conversationId;
        console.log(`[useSocketEventHandlers] Event: Conversation Deleted. ID: ${deletedId}`);

        // Cập nhật danh sách conversationList TRƯỚC KHI kiểm tra activeId
        // Điều này đảm bảo danh sách là mới nhất
        setConversationList(prevList => prevList.filter(conv => conv.id !== deletedId));

        if (activeConversationId === deletedId) {
            console.log(`[useSocketEventHandlers] Active conversation (${deletedId}) was deleted. Resetting chat view.`);
            setActiveConversationId(null);
            setChatMessages([]);
            setIsHistoryLoaded(false); // Đánh dấu chưa tải
            setIsLoadingHistory(false); // Không còn đang tải nữa
            setLoadingState({ isLoading: false, step: 'idle', message: '' }); // Trạng thái chung của chat
            animationControls.stopStreaming(); // Dừng streaming nếu có
            resetAwaitFlag(); // Reset cờ chờ kết quả
        }
    }, [
        isMountedRef,
        activeConversationId, // State
        setActiveConversationId, // Setter
        setChatMessages,       // Setter
        setIsHistoryLoaded,    // Setter
        setIsLoadingHistory,   // Setter
        setLoadingState,       // Setter
        animationControls,     // Object
        resetAwaitFlag,        // Function
        setConversationList    // Setter
    ]);

    const handleConversationCleared = useCallback((payload: ConversationClearedPayload) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;
        const clearedId = payload.conversationId;
        console.log(`[useSocketEventHandlers] Event: Conversation Cleared. ID: ${clearedId}`);
        if (activeConversationId === clearedId) {
            console.log(`[useSocketEventHandlers] Active conversation (${clearedId}) was cleared.`);
            // Nếu server KHÔNG tự động gửi 'initial_history' sau khi clear:
            // setChatMessages([]);
            // setIsHistoryLoaded(true); // Vẫn là loaded, nhưng messages trống
            // setLoadingState({ isLoading: false, step: 'history_loaded', message: '' }); // Hoặc 'cleared'
            // Ngược lại, nếu server GỬI 'initial_history', thì handler đó sẽ cập nhật state.
            // Chỉ cần đảm bảo setLoadingState ở đây để tắt spinner nếu có.
            setLoadingState(prev => ({ ...prev, isLoading: false, step: 'idle' }));
        }
    }, [isMountedRef, activeConversationId, setLoadingState /*, setChatMessages, setIsHistoryLoaded */]);


    const handleConversationRenamed = useCallback((payload: ConversationRenamedPayload) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;
        const { conversationId, newTitle } = payload;
        console.log(`[useSocketEventHandlers] Event: Conversation Renamed. ID: ${conversationId}, New Title: ${newTitle}`);
        setConversationList(prevList =>
            prevList.map(conv =>
                conv.id === conversationId ? { ...conv, title: newTitle } : conv
            )
        );
    }, [isMountedRef, setConversationList]);

    const handleConversationPinStatusChanged = useCallback((payload: ConversationPinStatusChangedPayload) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;
        const { conversationId, isPinned } = payload;
        console.log(`[useSocketEventHandlers] Event: Pin Status Changed. ID: ${conversationId}, IsPinned: ${isPinned}`);
        setConversationList(prevList =>
            prevList.map(conv =>
                conv.id === conversationId ? { ...conv, isPinned: isPinned } : conv
            )
                .sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
                })
        );
    }, [isMountedRef, setConversationList]);

    // --- REMOVE: Handler for Conversation Search Results Event ---
    // const handleConversationSearchResults = useCallback((results: ConversationMetadata[]) => {
    //     if (!isMountedRef.current) return;
    //     console.log(`[useSocketEventHandlers] Event: Conversation Search Results Received (${results?.length ?? 0} items)`);
    //     setSearchResults(Array.isArray(results) ? results : []);
    //     setIsSearching(false);
    // }, [isMountedRef, setSearchResults, setIsSearching]);


    const socketEventHandlers: SocketEventHandlers = useMemo(() => {
        // THÊM LOG Ở ĐÂY
        console.log('[useSocketEventHandlers DEBUG] Creating socketEventHandlers object. typeof handleInitialHistory:', typeof handleInitialHistory);
        return {
            onConnect: handleConnect,
            onDisconnect: handleDisconnect,
            onConnectError: handleConnectError,
            onAuthError: handleAuthError,
            onStatusUpdate: handleStatusUpdate,
            onChatUpdate: handlePartialResult,
            onChatResult: handleResult,
            onChatError: handleChatErrorEvent,
            onEmailConfirmationResult: handleEmailConfirmationResult,
            onInitialHistory: handleInitialHistory,
            onConversationList: handleConversationList,
            onNewConversationStarted: handleNewConversationStarted,
            onConversationDeleted: handleConversationDeleted,
            onConversationCleared: handleConversationCleared,
            onConversationRenamed: handleConversationRenamed,
            onConversationPinStatusChanged: handleConversationPinStatusChanged,
            onConnectionReady: handleConnectionReady, // THÊM MỚI
        };
    }, [
        handleConnect, handleDisconnect, handleConnectError, handleAuthError,
        handleStatusUpdate, handlePartialResult, handleResult, handleChatErrorEvent,
        handleEmailConfirmationResult, handleInitialHistory,
        handleConversationList, handleNewConversationStarted,
        handleConversationDeleted, handleConversationCleared,
        handleConversationRenamed, handleConversationPinStatusChanged,
        handleConnectionReady, // THÊM MỚI
    ]);

    return socketEventHandlers;
}