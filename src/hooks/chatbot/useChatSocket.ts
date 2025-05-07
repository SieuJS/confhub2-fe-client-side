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
import { useChatActions, ChatActions } from './useChatActions';

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
    isConnected: boolean;
    socketId: string | null;
    closeConfirmationDialog: () => void;
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
    } = useChatState();

    // ... (sections 2-5 remain the same)
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
                if (prev.length > 0 && prev[prev.length - 1].id === lastMsg.id) {
                    console.warn("Duplicate error/warning message suppressed:", message);
                    return prev;
                }
            }
            return [...prev, botMessage];
        });


        if (isFatal) {
            console.warn(`[useChatSocket] Fatal error detected (${message}). Setting fatal error flag.`);
            setHasFatalError(true);
            onConnectionChange?.(false);
        }

    }, [isMountedRef, animationControls, setLoadingState, setChatMessages, setHasFatalError, onConnectionChange]);


    // 6. Prepare Socket Connection Options
    const socketOptions: SocketConnectionOptions = useMemo(() => ({
        socketUrl,
        authToken,
        enabled: !!socketUrl && authToken !== undefined,
    }), [socketUrl, authToken]);

    // 7. Initialize Socket Event Handlers
    const socketRefFromConnection = useRef<Socket | null>(null);

    // Pass necessary setters to useSocketEventHandlers
    // setSearchResults and setIsSearching are NOT needed here for search event handling anymore
    const socketEventHandlersProps: UseSocketEventHandlersProps = {
        isMountedRef,
        setChatMessages, setLoadingState, setHasFatalError, setIsHistoryLoaded,
        setIsLoadingHistory, setShowConfirmationDialog, setConfirmationData,
        setConversationList, setActiveConversationId,
        animationControls, handleError, onConnectionChange, onInitialConnectionError,
        confirmationData, BASE_WEB_URL, currentLocale, socketRef: socketRefFromConnection,
        isAwaitingFinalResultRef, activeConversationId, resetAwaitFlag,
        // setSearchResults and setIsSearching are removed as props for event handlers
        // because the search result event is being removed.
    };
    const socketEventHandlers: SocketEventHandlers = useSocketEventHandlers(socketEventHandlersProps);


    // 8. Initialize Socket Connection
    const connection = useSocketConnection(socketOptions, socketEventHandlers);
    const { isConnected: rawIsConnected, socketId, socketRef } = connection;

    useEffect(() => {
        socketRefFromConnection.current = socketRef.current;
    }, [socketRef]);

    const isEffectivelyConnected = rawIsConnected && !hasFatalError;

    useEffect(() => {
        onConnectionChange?.(isEffectivelyConnected);
    }, [isEffectivelyConnected, onConnectionChange]);


    // 9. Initialize Chat Actions (Pass conversationList and setSearchResults)
    const chatActions = useChatActions({
        socketRef,
        isConnected: isEffectivelyConnected,
        hasFatalError,
        handleError,
        setChatMessages, setLoadingState, setActiveConversationId,
        setIsLoadingHistory, setIsHistoryLoaded,
        animationControls,
        activeConversationId,
        resetAwaitFlag,
        // --- MODIFIED ---
        setIsSearching,    // Pass setIsSearching
        setSearchResults,  // Pass setSearchResults
        conversationList,  // Pass conversationList
    });

    // ... (sections 10-12 remain the same)
    // 10. Specific Action Implementations
    const closeConfirmationDialog = useCallback(() => {
        setShowConfirmationDialog(false);
    }, [setShowConfirmationDialog]);

    // 11. Mount/Unmount Logic
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            console.log("[useChatSocket] Unmounted.");
        };
    }, [isMountedRef]);

    // 12. Return Combined Controls
    return {
        // State
        chatMessages, loadingState, hasFatalError, isHistoryLoaded, isLoadingHistory,
        showConfirmationDialog, confirmationData, conversationList, activeConversationId,
        searchResults, isSearching,

        // Connection Info
        isConnected: isEffectivelyConnected,
        socketId,

        // Actions
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

        // Specific Methods
        closeConfirmationDialog,
    };
}