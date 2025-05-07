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
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { SocketEventHandlers as BaseSocketEventHandlers } from './useSocketConnection';
import { StreamingTextAnimationControls } from './useStreamingTextAnimation';
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { ChatStateSetters } from './useChatState';



// --- Interface for Props passed TO useSocketEventHandlers hook ---
/**
 * Defines the properties required by the useSocketEventHandlers hook.
 */
export interface UseSocketEventHandlersProps extends Omit<ChatStateSetters, 'setAuthToken' | 'setSearchResults' | 'setIsSearching'> {
    /** Reference to check if the component is still mounted. */
    isMountedRef: React.MutableRefObject<boolean>;
    /** Controls for the streaming text animation. */
    animationControls: StreamingTextAnimationControls;
    /** Centralized error handling function. */
    handleError: (error: any, stopLoading?: boolean, isFatal?: boolean) => void;
    /** Optional callback for connection status changes. */
    onConnectionChange?: (isConnected: boolean) => void;
    /** Optional callback for initial connection errors. */
    onInitialConnectionError?: (error: Error) => void;
    /** Current data for email confirmation dialog, if any. */
    confirmationData: ConfirmSendEmailAction | null;
    /** Base URL of the frontend application. */
    BASE_WEB_URL: string;
    /** Current locale (e.g., 'en', 'vi'). */
    currentLocale: string;
    /** Reference to the Socket.IO client instance. */
    socketRef: React.MutableRefObject<Socket | null>;
    /** Reference indicating if the client is currently waiting for a final 'onChatResult'. */
    isAwaitingFinalResultRef: MutableRefObject<boolean>;
    /** The ID of the currently active conversation, or null. */
    activeConversationId: string | null;
    /** Function to manually reset the isAwaitingFinalResultRef flag. */
    resetAwaitFlag: () => void;

    setSearchResults: ChatStateSetters['setSearchResults']; // Truyền setter riêng
    setIsSearching: ChatStateSetters['setIsSearching'];     // Truyền setter riêng
}


// --- Interface for the Handlers OBJECT RETURNED BY useSocketEventHandlers ---
/**
 * Defines the structure of the event handlers object returned by useSocketEventHandlers.
 * This object is typically passed to the useSocketConnection hook.
 * It extends the base handlers expected by useSocketConnection.
 */
export interface SocketEventHandlers extends BaseSocketEventHandlers {
    /** Handler for successful connection. */
    onConnect: (socketId: string) => void;
    /** Handler for disconnection. */
    onDisconnect: (reason: Socket.DisconnectReason) => void;
    /** Handler for connection errors. */
    onConnectError: (err: Error) => void;
    /** Handler specifically for authentication errors during connection. */
    onAuthError: (error: { message: string }) => void;

    /** Handler for status updates during processing (e.g., 'thinking', 'searching'). */
    onStatusUpdate: (update: StatusUpdate) => void;
    /** Handler for partial chat message chunks during streaming. */
    onChatUpdate: (update: ChatUpdate) => void;
    /** Handler for the final chat result (message, thoughts, actions). */
    onChatResult: (result: ResultUpdate) => void;
    /** Handler for general errors occurring during chat processing. */
    onChatError: (errorData: ErrorUpdate | any) => void;

    /** Handler for the result of an email confirmation attempt. */
    onEmailConfirmationResult: (result: EmailConfirmationResult) => void;

    /** Handler for receiving the initial history of a loaded conversation. */
    onInitialHistory: (payload: InitialHistoryPayload) => void;
    /** Handler for receiving the list of user's conversations. */
    onConversationList: (list: ConversationMetadata[]) => void;
    /** Handler for when a new conversation is started (implicitly or explicitly). */
    onNewConversationStarted: (payload: { conversationId: string }) => void;

    /** Handler for when a conversation deletion is confirmed by the backend. */
    onConversationDeleted: (payload: ConversationDeletedPayload) => void;
    /** Handler for when a conversation clearing is confirmed by the backend. */
    onConversationCleared: (payload: ConversationClearedPayload) => void;

    // --- NEW EVENT HANDLERS ---
    onConversationRenamed: (payload: ConversationRenamedPayload) => void;
    onConversationPinStatusChanged: (payload: ConversationPinStatusChangedPayload) => void;
    onConversationSearchResults: (results: ConversationMetadata[]) => void; // Backend trả về mảng metadata
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
    handleError, // Receive error handler
    onConnectionChange,
    onInitialConnectionError,
    confirmationData,
    BASE_WEB_URL,
    currentLocale,
    isAwaitingFinalResultRef, // Destructure the ref
    activeConversationId, // <-- Destructure new prop
    resetAwaitFlag, // <--- ADD THIS LINE
    setSearchResults,
    setIsSearching,

}: UseSocketEventHandlersProps): SocketEventHandlers { // <-- Return extended type

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
        // Ensure list is always an array, even if backend sends null/undefined
        setConversationList(Array.isArray(list) ? list : []);
    }, [isMountedRef, setConversationList]);

    const handleInitialHistory = useCallback((payload: InitialHistoryPayload) => {
        if (!isMountedRef.current) return;
        console.log(`[useSocketEventHandlers] Event: Initial History Received for ConvID: ${payload.conversationId}, Messages: ${payload.messages?.length ?? 0}`);
        setIsLoadingHistory(false);
        // Ensure messages is always an array
        setChatMessages(Array.isArray(payload.messages) ? payload.messages : []);
        setActiveConversationId(payload.conversationId);
        setIsHistoryLoaded(true); // Mark history as loaded for this conversation
        setLoadingState({ isLoading: false, step: 'history_loaded', message: '' });
    }, [isMountedRef, setIsLoadingHistory, setChatMessages, setActiveConversationId, setIsHistoryLoaded, setLoadingState]);

    const handleNewConversationStarted = useCallback((payload: { conversationId: string }) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;
        console.log(`[useSocketEventHandlers] Event: New Conversation Started. ID: ${payload.conversationId}`);
        setIsLoadingHistory(false);
        setChatMessages([]); // Clear messages for the new chat
        setActiveConversationId(payload.conversationId);
        setIsHistoryLoaded(false); // New chat, history not loaded yet (it's empty)
        setLoadingState({ isLoading: false, step: 'new_chat_ready', message: '' });
        // Backend now sends updated list separately, no need to request here
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
                // Attempt to add as a new message if placeholder is missing, though this indicates a problem
                return [...prevMessages, { id: finalMessageId, isUser: false, type: 'text', ...finalMessageData, message: finalMessageData.message ?? '' }];
                // return prevMessages;
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
        console.log("[useSocketEventHandlers] Event: Chat Error", errorData);
        isAwaitingFinalResultRef.current = false;
        const isFatal = errorData?.code === 'FATAL_SERVER_ERROR';
        handleError(errorData, true, isFatal);
    }, [isMountedRef, handleError, isAwaitingFinalResultRef]);

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


    // --- NEW: Handler for Conversation Deleted Event ---
    const handleConversationDeleted = useCallback((payload: ConversationDeletedPayload) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;
        const deletedId = payload.conversationId;
        console.log(`[useSocketEventHandlers] Event: Conversation Deleted. ID: ${deletedId}`);

        // Check if the deleted conversation was the active one
        if (activeConversationId === deletedId) {
            console.log(`[useSocketEventHandlers] Active conversation (${deletedId}) was deleted. Resetting chat view.`);
            setActiveConversationId(null);
            setChatMessages([]);
            setIsHistoryLoaded(false);
            setIsLoadingHistory(false);
            setLoadingState({ isLoading: false, step: 'idle', message: '' });
            animationControls.stopStreaming();
            resetAwaitFlag(); // Now this function is accessible
        }

    }, [
        isMountedRef,
        activeConversationId,
        setActiveConversationId,
        setChatMessages,
        setIsHistoryLoaded,
        setIsLoadingHistory,
        setLoadingState,
        animationControls,
        resetAwaitFlag // Dependency is correct
        /* setConversationList */
    ]);

    // --- NEW: Handler for Conversation Cleared Event ---
    const handleConversationCleared = useCallback((payload: ConversationClearedPayload) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;
        const clearedId = payload.conversationId;
        console.log(`[useSocketEventHandlers] Event: Conversation Cleared. ID: ${clearedId}`);

        // Check if the cleared conversation is the active one
        // The backend already sends 'initial_history' with empty messages if it was active.
        // So, no specific state update is strictly needed here *if* handleInitialHistory
        // correctly clears messages when receiving an empty array.
        // However, we might want to reset the loading state if it was stuck.
        if (activeConversationId === clearedId) {
            console.log(`[useSocketEventHandlers] Active conversation (${clearedId}) was cleared. State updated via initial_history.`);
            // Ensure loading state is reset if it was somehow active
            setLoadingState(prev => ({ ...prev, isLoading: false }));
        }

        // Note: We rely on the 'conversation_list' event triggered by the backend
        // after clearing to get the updated list (for lastActivity).

    }, [isMountedRef, activeConversationId, setLoadingState]);


     // --- NEW: Handler for Conversation Renamed Event ---
     const handleConversationRenamed = useCallback((payload: ConversationRenamedPayload) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;
        const { conversationId, newTitle } = payload;
        console.log(`[useSocketEventHandlers] Event: Conversation Renamed. ID: ${conversationId}, New Title: ${newTitle}`);

        setConversationList(prevList =>
            prevList.map(conv =>
                conv.id === conversationId ? { ...conv, title: newTitle } : conv
            )
        );
        // Nếu conversation đang active, cập nhật title của nó trong UI (nếu có hiển thị)
        // Điều này thường được xử lý bởi component hiển thị danh sách conversation.
    }, [isMountedRef, setConversationList]);

    // --- NEW: Handler for Conversation Pin Status Changed Event ---
    const handleConversationPinStatusChanged = useCallback((payload: ConversationPinStatusChangedPayload) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;
        const { conversationId, isPinned } = payload;
        console.log(`[useSocketEventHandlers] Event: Pin Status Changed. ID: ${conversationId}, IsPinned: ${isPinned}`);

        setConversationList(prevList =>
            prevList.map(conv =>
                conv.id === conversationId ? { ...conv, isPinned: isPinned } : conv
            )
            // Sắp xếp lại danh sách nếu cần (ghim lên đầu)
            // Hoặc để component hiển thị danh sách tự sắp xếp dựa trên isPinned và lastActivity
            .sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
            })
        );
    }, [isMountedRef, setConversationList]);

    // --- NEW: Handler for Conversation Search Results Event ---
    const handleConversationSearchResults = useCallback((results: ConversationMetadata[]) => {
        if (!isMountedRef.current) return;
        console.log(`[useSocketEventHandlers] Event: Conversation Search Results Received (${results?.length ?? 0} items)`);
        setSearchResults(Array.isArray(results) ? results : []);
        setIsSearching(false); // Kết thúc trạng thái tìm kiếm
    }, [isMountedRef, setSearchResults, setIsSearching]);


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
        onInitialHistory: handleInitialHistory,
        onConversationList: handleConversationList,
        onNewConversationStarted: handleNewConversationStarted,
        onConversationDeleted: handleConversationDeleted,
        onConversationCleared: handleConversationCleared,
        // --- NEW ---
        onConversationRenamed: handleConversationRenamed,
        onConversationPinStatusChanged: handleConversationPinStatusChanged,
        onConversationSearchResults: handleConversationSearchResults,
    }), [
        handleConnect, handleDisconnect, handleConnectError, handleAuthError,
        handleStatusUpdate, handlePartialResult, handleResult, handleChatErrorEvent,
        handleEmailConfirmationResult, handleInitialHistory,
        handleConversationList, handleNewConversationStarted,
        handleConversationDeleted, handleConversationCleared,
        // --- NEW ---
        handleConversationRenamed, handleConversationPinStatusChanged, handleConversationSearchResults,
    ]);

    return socketEventHandlers;
}