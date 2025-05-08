// src/app/[locale]/hooks/chatbot/useChatSocket.ts
import { useMemo, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Socket } from 'socket.io-client';

// State and Types
import { useChatState, ChatState } from './useChatState';
import {
    ChatMessageType, ErrorUpdate, ThoughtStep
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { appConfig } from '@/src/middleware';

// Connection and Handlers/Actions
import { useSocketConnection, SocketConnectionOptions } from './useSocketConnection';
import { useSocketEventHandlers, SocketEventHandlers, UseSocketEventHandlersProps } from './useSocketEventHandlers';
import { useChatActions, ChatActions } from './useChatActions'; // Đảm bảo ChatActions và UseChatActionsProps trong useChatActions.ts đã được cập nhật

// Other Hooks and Utils
import { useStreamingTextAnimation } from './useStreamingTextAnimation';
import { generateMessageId } from '@/src/app/[locale]/chatbot/utils/chatUtils';

// --- Interfaces ---
export interface UseChatSocketProps {
    socketUrl: string;
    onConnectionChange?: (isConnected: boolean) => void;
    onInitialConnectionError?: (error: Error) => void;
}

export interface ChatSocketControls extends Omit<ChatState, 'isMountedRef' | 'authToken'>, ChatActions {
    isConnected: boolean; // isEffectivelyConnected sẽ được trả về như là isConnected
    socketId: string | null;
    closeConfirmationDialog: () => void;
    isServerReadyForCommands: boolean; // THÊM MỚI

}


export function useChatSocket({
    socketUrl,
    onConnectionChange,
    onInitialConnectionError,
}: UseChatSocketProps): ChatSocketControls {

    // 1. Initialize Core State
    const {
        chatMessages, loadingState, hasFatalError, isHistoryLoaded, isLoadingHistory,
        showConfirmationDialog, confirmationData, conversationList, activeConversationId,
        authToken, isMountedRef,
        searchResults, isSearching,
        setChatMessages, setLoadingState, setHasFatalError,
        setIsHistoryLoaded, setIsLoadingHistory, setShowConfirmationDialog,
        setConfirmationData, setConversationList, setActiveConversationId, setAuthToken,
        setSearchResults, setIsSearching,
        isServerReadyForCommands,
        setIsServerReadyForCommands,
    } = useChatState();


    const handleServerReady = useCallback((payload: { userId: string, email: string }) => { // Payload từ onConnectionReady
        if (!isMountedRef.current) {
            console.log("[useChatSocket] handleServerReady called but component not mounted.");
            return;
        }
        console.log("[useChatSocket] Server is ready for commands. Payload:", payload);
        setIsServerReadyForCommands(true);
    }, [isMountedRef, setIsServerReadyForCommands]); // Dependencies chính xác


    // 2. Initialize UI-specific Hooks
    const handleContentUpdate = useCallback((messageId: string, newContent: string) => {
        if (!isMountedRef.current) return;
        setChatMessages(prev =>
            prev.map(msg =>
                msg.id === messageId ? { ...msg, message: newContent } : msg
            )
        );
    }, [isMountedRef, setChatMessages]);

    const isAwaitingFinalResultRef = useRef(false);
    const resetAwaitFlag = useCallback(() => {
        isAwaitingFinalResultRef.current = false;
    }, []);

    const animationControls = useStreamingTextAnimation(handleContentUpdate);

    // 3. Environment and Config
    const BASE_WEB_URL = appConfig.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:8386";
    const pathname = usePathname();
    const currentLocale = pathname.split('/')[1] || 'en';

    // 4. Auth Token Loading
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
    }, [setAuthToken, setHasFatalError]);

    // 5. Core Error Handling Logic
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
            id: generateMessageId(), message: message, isUser: false, type: type, thoughts: thoughts
        };

        setChatMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && !lastMsg.isUser && lastMsg.message === message && lastMsg.type === type) {
                // Simple duplicate suppression for consecutive identical error/warning messages from bot
                if (prev.length > 0 && prev[prev.length - 1].id === lastMsg.id) { // Check if it's literally the same message object
                    console.warn("Duplicate error/warning message object suppressed:", message); // This check might be too strict
                    return prev;
                }
            }
            return [...prev, botMessage];
        });


        if (isFatal) {
            console.warn(`[useChatSocket] Fatal error detected (${message}). Setting fatal error flag.`);
            setHasFatalError(true);
            onConnectionChange?.(false); // Reflect fatal error in connection status
        }

    }, [isMountedRef, animationControls, setLoadingState, setChatMessages, setHasFatalError, onConnectionChange]);


    // 6. Prepare Socket Connection Options
    const socketOptions: SocketConnectionOptions = useMemo(() => ({
        socketUrl,
        authToken,
        enabled: !!socketUrl && authToken !== undefined, // Socket only enabled if URL and token (even if null) are determined
    }), [socketUrl, authToken]);

    // 7. Initialize Socket Event Handlers
    const socketRefFromConnection = useRef<Socket | null>(null);

    const socketEventHandlersProps: UseSocketEventHandlersProps = {
        isMountedRef, loadingState, // Pass loadingState
        setChatMessages, setLoadingState, setHasFatalError, setIsHistoryLoaded,
        setIsLoadingHistory, setShowConfirmationDialog, setConfirmationData,
        setConversationList, setActiveConversationId,
        animationControls, handleError, onConnectionChange, onInitialConnectionError,
        confirmationData, BASE_WEB_URL, currentLocale, socketRef: socketRefFromConnection,
        isAwaitingFinalResultRef, activeConversationId, resetAwaitFlag,
        onConnectionReady: handleServerReady,
        // setIsServerReadyForCommands is handled by onConnectionReady (handleServerReady)
    };
    const socketEventHandlers: SocketEventHandlers = useSocketEventHandlers(socketEventHandlersProps);


    // 8. Initialize Socket Connection
    const connection = useSocketConnection(socketOptions, socketEventHandlers);
    const { isConnected: rawIsConnected, socketId, socketRef } = connection;

    // Sync the socketRef to be used by event handlers if needed (though event handlers get it directly now)
    useEffect(() => {
        socketRefFromConnection.current = socketRef.current;
    }, [socketRef]);

    // Effective connection status considers both raw socket connection and fatal errors
    const isEffectivelyConnected = rawIsConnected && !hasFatalError;

    // Propagate effective connection changes
    useEffect(() => {
        onConnectionChange?.(isEffectivelyConnected);
    }, [isEffectivelyConnected, onConnectionChange]);


    // 9. Initialize Chat Actions
    const chatActions = useChatActions({
        socketRef, // Pass the socketRef from useSocketConnection
        isConnected: isEffectivelyConnected,
        hasFatalError,
        handleError,
        setChatMessages,
        setLoadingState,
        setActiveConversationId, isServerReadyForCommands, // Pass isServerReadyForCommands
        setIsLoadingHistory,
        setIsHistoryLoaded, // Setter
        isHistoryLoaded,
        animationControls,
        activeConversationId,
        resetAwaitFlag,
        setIsSearching,
        setSearchResults,
        conversationList,
        setConversationList
    });

    // 10. Specific Action Implementations (like closeConfirmationDialog)
    const closeConfirmationDialog = useCallback(() => {
        setShowConfirmationDialog(false);
        // Optionally, if there's a pending action tied to the confirmation,
        // you might want to emit a cancellation event to the server here.
        // For now, it just closes the dialog.
    }, [setShowConfirmationDialog]);

    // 11. Mount/Unmount Logic
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            console.log("[useChatSocket] Unmounted.");
            // Consider if socketRef.current?.disconnect() is needed here,
            // though useSocketConnection should handle its own cleanup.
        };
    }, [isMountedRef]); // Chỉ phụ thuộc vào isMountedRef


    // Log khi isServerReadyForCommands thay đổi
    useEffect(() => {
        console.log(`[useChatSocket] isServerReadyForCommands changed to: ${isServerReadyForCommands}`);
    }, [isServerReadyForCommands]);


    // 12. Return Combined Controls
    return {
        // State
        chatMessages,
        loadingState,
        hasFatalError,
        isHistoryLoaded,
        isLoadingHistory,
        showConfirmationDialog,
        confirmationData,
        conversationList,
        activeConversationId,
        searchResults,
        isSearching,
        isServerReadyForCommands,

        // Connection Info
        isConnected: isEffectivelyConnected, // Trả về trạng thái kết nối hiệu quả
        socketId,

        // Actions from useChatActions
        sendMessage: chatActions.sendMessage,
        loadConversation: chatActions.loadConversation,
        startNewConversation: chatActions.startNewConversation,
        handleConfirmSend: chatActions.handleConfirmSend,
        handleCancelSend: chatActions.handleCancelSend,
        deleteConversation: chatActions.deleteConversation,
        clearConversation: chatActions.clearConversation,
        renameConversation: chatActions.renameConversation,
        pinConversation: chatActions.pinConversation,
        searchConversations: chatActions.searchConversations,

        // Specific Methods from this hook
        closeConfirmationDialog,
    };
}