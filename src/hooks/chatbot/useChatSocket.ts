// src/hooks/useChatSocket.ts
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Socket } from 'socket.io-client';

// Import Models and Types (ensure ConfirmEmailSendPayload and EmailConfirmationResult are included)
import {
    StatusUpdate, ResultUpdate, NavigationAction, OpenMapAction,
    ErrorUpdate, ThoughtStep, ChatMessageType, LoadingState, ChatUpdate,
    ConfirmSendEmailAction, // <-- Add
    EmailConfirmationResult, // <-- Add
    FrontendAction         // <-- Make sure this includes the confirm type
} from '@/src/models/chatbot/chatbot'; // Adjust path
import { Language } from '@/src/app/[locale]/chatbot/lib/types';
import { appConfig } from '@/src/middleware';

import { useSocketConnection, SocketConnectionOptions, SocketEventHandlers } from './useSocketConnection';
import { useStreamingTextAnimation } from './useStreamingTextAnimation';
import { generateMessageId, constructNavigationUrl, openUrlInNewTab } from '@/src/app/[locale]/chatbot/utils/chatUtils'; // Adjust path

// --- Interfaces (Keep definitions clear) ---
export interface UseChatSocketProps {
    socketUrl: string;
    // Optional callbacks for parent component interaction
    onConnectionChange?: (isConnected: boolean) => void;
    onInitialConnectionError?: (error: Error) => void;
}


// --- CẬP NHẬT INTERFACE NÀY ---
export interface ChatSocketControls {
    chatMessages: ChatMessageType[];
    loadingState: LoadingState;
    isConnected: boolean;
    sendMessage: (userInput: string, isStreaming: boolean, language: Language) => void;
    socketId: string | null;
    // Thêm các thuộc tính còn thiếu vào interface
    showConfirmationDialog: boolean;
    confirmationData: ConfirmSendEmailAction | null; // Sử dụng type nhất quán (ví dụ: ConfirmEmailSendPayload)
    handleConfirmSend: (confirmationId: string) => void; // Thêm định nghĩa hàm
    handleCancelSend: (confirmationId: string) => void;  // Thêm định nghĩa hàm
    closeConfirmationDialog: () => void;               // Thêm định nghĩa hàm
}
// -------------------------------

/**
 * Orchestrates chat functionality using Socket.IO, managing messages,
 * connection state, loading indicators, and streaming text animation.
 */

export function useChatSocket({
    socketUrl,
    onConnectionChange,
    onInitialConnectionError
}: UseChatSocketProps): ChatSocketControls {

    const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, step: '', message: '' });
    const [hasFatalError, setHasFatalError] = useState<boolean>(false);
    const isMountedRef = useRef(true);
    const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";
    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1] || 'en';
    const [authToken, setAuthToken] = useState<string | null>(null);

    // --- NEW: State for Confirmation Dialog ---
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [confirmationData, setConfirmationData] = useState<ConfirmSendEmailAction | null>(null);
    // ----------------------------------------

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

    const handleConnect = useCallback((socketId: string) => {
        if (!isMountedRef.current) return;
        console.log(`[useChatSocket] Event: Connected with ID ${socketId}`);
        setHasFatalError(false); // Reset fatal error on successful connect
        onConnectionChange?.(true);
        // Reset loading state on successful connect
        setLoadingState({ isLoading: false, step: 'connected', message: 'Connected' });
    }, [onConnectionChange]);

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
        const streamingId = animationControls.currentStreamingId;

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

        // Update Chat History State (replace streaming placeholder or add new)
        setChatMessages(prevMessages => {
            const messageExistsIndex = streamingId
                ? prevMessages.findIndex(msg => msg.id === streamingId)
                : -1;

            if (messageExistsIndex !== -1) {
                const updatedMessages = [...prevMessages];
                updatedMessages[messageExistsIndex] = {
                    ...prevMessages[messageExistsIndex],
                    ...finalMessageData,
                    id: finalMessageId,
                    message: finalMessageData.message ?? '',
                };
                return updatedMessages;
            } else {
                console.warn("No streaming placeholder found for ID:", streamingId, "Adding as new message.");
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


    // Add the new handler to the list
    const socketEventHandlers: SocketEventHandlers = useMemo(() => ({
        onConnect: handleConnect,
        onDisconnect: handleDisconnect,
        onConnectError: handleConnectError,
        onAuthError: handleAuthError,
        onStatusUpdate: handleStatusUpdate,
        onChatUpdate: handlePartialResult,
        onChatResult: handleResult,
        onChatError: handleChatErrorEvent,
        // --- Add the new event handler ---
        onEmailConfirmationResult: handleEmailConfirmationResult,
        // -------------------------------
    }), [ // Ensure all handler functions are stable
        handleConnect, handleDisconnect, handleConnectError, handleAuthError,
        handleStatusUpdate, handlePartialResult, handleResult, handleChatErrorEvent,
        handleEmailConfirmationResult // <-- Add new handler here
    ]);

    const connection = useSocketConnection(socketOptions, socketEventHandlers);
    const { isConnected, socketId } = connection;
    const socketRef = connection.socketRef;



    // --- Send Message Function (Adjusted) ---
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
        setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

        console.log(`Emitting 'send_message' (Streaming: ${isStreaming}, Lang: ${language}). Socket ID: ${socketRef.current?.id}`);
        socketRef.current.emit('send_message', {
            userInput: trimmedMessage,
            isStreaming: isStreaming,
            language: language
        });
    }, [isConnected, hasFatalError, handleError, animationControls, socketRef]); // Added socketRef dependency


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

    // --- Return Hook Controls ---
    // --- Return Hook Controls ---
    return {
        chatMessages,
        loadingState,
        isConnected: isConnected && !hasFatalError,
        sendMessage,
        socketId,
        showConfirmationDialog,
        confirmationData,
        // Các hàm này giờ đã được khai báo trong interface ChatSocketControls
        handleConfirmSend,
        handleCancelSend,
        closeConfirmationDialog
    };
}