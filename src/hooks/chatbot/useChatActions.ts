// src/app/[locale]/hooks/chatbot/useChatActions.ts
import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Language } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import { ChatMessageType, RenameConversationClientData, PinConversationClientData, SearchConversationsClientData } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { generateMessageId } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { StreamingTextAnimationControls } from './useStreamingTextAnimation';
import { ChatStateSetters } from './useChatState';

interface UseChatActionsProps extends Pick<
    ChatStateSetters,
    'setChatMessages' | 'setLoadingState' | 'setActiveConversationId' |
    'setIsLoadingHistory' | 'setIsHistoryLoaded' | 'setIsSearching' // Thêm setIsSearching
> {
    socketRef: React.MutableRefObject<Socket | null>;
    isConnected: boolean;
    hasFatalError: boolean;
    handleError: (error: any, stopLoading?: boolean, isFatal?: boolean) => void;
    animationControls: StreamingTextAnimationControls;
    activeConversationId: string | null;
    resetAwaitFlag: () => void;
}

export interface ChatActions {
    sendMessage: (userInput: string, isStreaming: boolean, language: Language) => void;
    loadConversation: (conversationId: string) => void;
    startNewConversation: () => void;
    handleConfirmSend: (confirmationId: string) => void;
    handleCancelSend: (confirmationId: string) => void;
    closeConfirmationDialog: () => void;
    deleteConversation: (conversationId: string) => void;
    clearConversation: (conversationId: string) => void;
    // --- NEW ACTIONS ---
    renameConversation: (conversationId: string, newTitle: string) => void;
    pinConversation: (conversationId: string, isPinned: boolean) => void;
    searchConversations: (searchTerm: string, limit?: number) => void;
}

export function useChatActions({
    socketRef,
    isConnected,
    hasFatalError,
    handleError,
    setChatMessages,
    setLoadingState,
    setActiveConversationId,
    setIsLoadingHistory,
    setIsHistoryLoaded,
    animationControls,
    activeConversationId,
    resetAwaitFlag,
    setIsSearching, // Destructure setter mới
}: UseChatActionsProps): ChatActions {

    resetAwaitFlag(); // <<< Call the reset function before emitting

    const sendMessage = useCallback((userInput: string, isStreaming: boolean, language: Language) => {
        const trimmedMessage = userInput.trim();
        if (!trimmedMessage) return;

        if (hasFatalError) {
            handleError({ message: "Cannot send message: A critical connection error occurred. Please refresh or log in again.", type: 'error' }, false, false);
            return;
        }
        if (!socketRef.current || !isConnected) { // Check effective connection state
            handleError({ message: "Cannot send message: Not connected.", type: 'error' }, false, false);
            return;
        }

        animationControls.stopStreaming();
        setLoadingState({ isLoading: true, step: 'sending', message: 'Sending...' });

        const newUserMessage: ChatMessageType = {
            id: generateMessageId(), message: trimmedMessage, isUser: true, type: 'text'
        };
        setChatMessages(prevMessages => [...prevMessages, newUserMessage]);

        console.log(`Emitting 'send_message' (Streaming: ${isStreaming}, Lang: ${language}). ActiveConvID on Frontend (for info): ${activeConversationId}. Socket ID: ${socketRef.current?.id}`);
        socketRef.current.emit('send_message', {
            userInput: trimmedMessage,
            isStreaming: isStreaming,
            language: language
        });
    }, [isConnected, hasFatalError, handleError, animationControls, socketRef, setChatMessages, setLoadingState, activeConversationId]);

    const loadConversation = useCallback((conversationId: string) => {
        if (!socketRef.current || !isConnected) {
            handleError({ message: 'Cannot load conversation: Not connected.', type: 'error' }, false, false);
            return;
        }
        if (!conversationId) {
            console.warn("[useChatActions] Attempted to load conversation with invalid ID.");
            return;
        }
        if (conversationId === activeConversationId) {
            console.log(`[useChatActions] Conversation ${conversationId} is already active.`);
            return;
        }

        console.log(`[useChatActions] Requesting to load conversation ID: ${conversationId}`);
        setIsLoadingHistory(true);
        setChatMessages([]);
        setIsHistoryLoaded(false);
        setLoadingState({ isLoading: true, step: 'loading_history', message: 'Loading history...' });
        socketRef.current.emit('load_conversation', { conversationId });

    }, [socketRef, isConnected, handleError, activeConversationId, setIsLoadingHistory, setChatMessages, setIsHistoryLoaded, setLoadingState]);

    const startNewConversation = useCallback(() => {
        if (!socketRef.current || !isConnected) {
            handleError({ message: 'Cannot start new chat: Not connected.', type: 'error' }, false, false);
            return;
        }

        console.log(`[useChatActions] Requesting to start a new conversation...`);
        setIsLoadingHistory(true);
        setChatMessages([]);
        setActiveConversationId(null); // Reset active ID immediately on frontend
        setIsHistoryLoaded(false);
        setLoadingState({ isLoading: true, step: 'starting_new_chat', message: 'Starting new chat...' });
        socketRef.current.emit('start_new_conversation');

    }, [socketRef, isConnected, handleError, setIsLoadingHistory, setChatMessages, setActiveConversationId, setIsHistoryLoaded, setLoadingState]);

    const handleConfirmSend = useCallback((confirmationId: string) => {
        if (socketRef.current && isConnected) {
            console.log(`[useChatActions] Emitting 'user_confirm_email' for ID: ${confirmationId}`);
            socketRef.current.emit('user_confirm_email', { confirmationId });
            setLoadingState({ isLoading: true, step: 'confirming_email', message: 'Sending email...' })
        } else {
            handleError({ message: 'Cannot confirm: Not connected.', type: 'error' }, false, false);
        }
    }, [socketRef, isConnected, handleError, setLoadingState]);

    const handleCancelSend = useCallback((confirmationId: string) => {
        if (socketRef.current && isConnected) {
            console.log(`[useChatActions] Emitting 'user_cancel_email' for ID: ${confirmationId}`);
            socketRef.current.emit('user_cancel_email', { confirmationId });
        } else {
            console.warn('[useChatActions] Cannot cancel: Not connected.');
        }
    }, [socketRef, isConnected]);

    // This action doesn't involve the socket, but fits with UI interaction control
    // It might be better placed directly in useChatSocket or even the component,
    // but keeping it with other actions for now.
    const closeConfirmationDialog = useCallback(() => {
        // The state update happens in useChatSocket via the setter from useChatState
        // This function is primarily for providing the action interface.
        // The actual state setting (`setShowConfirmationDialog(false)`) will be called
        // within useChatSocket when this returned function is invoked.
        console.log("[useChatActions] closeConfirmationDialog called");
         // No direct state update here, it's handled by the caller using the setter
    }, []);

     // --- NEW: Delete Conversation Action ---
     const deleteConversation = useCallback((conversationId: string) => {
        if (!isConnected || hasFatalError || !socketRef.current) {
            console.warn('Cannot delete conversation: Socket not connected or in fatal error state.');
            handleError({ message: 'Cannot delete conversation: Not connected.' }, false);
            return;
        }
        if (!conversationId) {
            console.warn('Cannot delete conversation: Invalid conversation ID.');
            return;
        }

        console.log(`[useChatActions] Requesting to delete conversation: ${conversationId}`);
        // Optionally show a loading indicator specific to this action if needed
        // setLoadingState({ isLoading: true, step: 'deleting', message: 'Deleting...' });

        socketRef.current.emit('delete_conversation', { conversationId });

    }, [isConnected, hasFatalError, socketRef, handleError, setLoadingState]); // Add setLoadingState if used


     // --- NEW: Clear Conversation Action ---
     const clearConversation = useCallback((conversationId: string) => {
        if (!isConnected || hasFatalError || !socketRef.current) {
            console.warn('Cannot clear conversation: Socket not connected or in fatal error state.');
            handleError({ message: 'Cannot clear conversation: Not connected.' }, false);
            return;
        }
        if (!conversationId) {
            console.warn('Cannot clear conversation: Invalid conversation ID.');
            return;
        }

        console.log(`[useChatActions] Requesting to clear conversation: ${conversationId}`);
        // Optionally show a loading indicator
        // setLoadingState({ isLoading: true, step: 'clearing', message: 'Clearing...' });

        socketRef.current.emit('clear_conversation', { conversationId });

    }, [isConnected, hasFatalError, socketRef, handleError, setLoadingState]); // Add setLoadingState if used

     // --- NEW: Rename Conversation Action ---
     const renameConversation = useCallback((conversationId: string, newTitle: string) => {
        if (!isConnected || hasFatalError || !socketRef.current) {
            handleError({ message: 'Cannot rename: Not connected or critical error.' }, false);
            return;
        }
        if (!conversationId || typeof newTitle !== 'string') { // newTitle có thể rỗng nếu backend cho phép reset
            console.warn('Cannot rename: Invalid conversation ID or title.');
            return;
        }
        console.log(`[useChatActions] Requesting to rename conversation ${conversationId} to "${newTitle.substring(0,30)}..."`);
        const payload: RenameConversationClientData = { conversationId, newTitle };
        socketRef.current.emit('rename_conversation', payload);
        // Optional: Set a specific loading state for renaming if UI needs it
    }, [isConnected, hasFatalError, socketRef, handleError]);

    // --- NEW: Pin Conversation Action ---
    const pinConversation = useCallback((conversationId: string, isPinned: boolean) => {
        if (!isConnected || hasFatalError || !socketRef.current) {
            handleError({ message: 'Cannot pin/unpin: Not connected or critical error.' }, false);
            return;
        }
        if (!conversationId || typeof isPinned !== 'boolean') {
            console.warn('Cannot pin/unpin: Invalid conversation ID or pin status.');
            return;
        }
        console.log(`[useChatActions] Requesting to set pin status for ${conversationId} to ${isPinned}`);
        const payload: PinConversationClientData = { conversationId, isPinned };
        socketRef.current.emit('pin_conversation', payload);
    }, [isConnected, hasFatalError, socketRef, handleError]);

    // --- NEW: Search Conversations Action ---
    const searchConversations = useCallback((searchTerm: string, limit?: number) => {
        if (!isConnected || hasFatalError || !socketRef.current) {
            handleError({ message: 'Cannot search: Not connected or critical error.' }, false);
            return;
        }
        // Cho phép searchTerm rỗng, backend sẽ xử lý (trả về danh sách trống hoặc toàn bộ)
        console.log(`[useChatActions] Requesting to search conversations with term: "${searchTerm.substring(0,30)}..."`);
        setIsSearching(true); // Đặt cờ đang tìm kiếm
        const payload: SearchConversationsClientData = { searchTerm: searchTerm.trim(), limit };
        socketRef.current.emit('search_conversations', payload);
    }, [isConnected, hasFatalError, socketRef, handleError, setIsSearching]);


    return {
        sendMessage,
        loadConversation,
        startNewConversation,
        handleConfirmSend,
        handleCancelSend,
        closeConfirmationDialog,
        deleteConversation,
        clearConversation,
        // --- NEW ---
        renameConversation,
        pinConversation,
        searchConversations,
    };
}