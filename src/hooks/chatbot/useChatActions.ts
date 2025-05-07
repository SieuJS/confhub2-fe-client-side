// src/app/[locale]/hooks/chatbot/useChatActions.ts
import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Language } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import {
    ChatMessageType, RenameConversationClientData, PinConversationClientData,
    // SearchConversationsClientData, // No longer needed for client-side search
    ConversationMetadata // Import ConversationMetadata
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { generateMessageId } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { StreamingTextAnimationControls } from './useStreamingTextAnimation';
import { ChatStateSetters } from './useChatState';

interface UseChatActionsProps extends Pick<
    ChatStateSetters,
    'setChatMessages' | 'setLoadingState' | 'setActiveConversationId' |
    'setIsLoadingHistory' | 'setIsHistoryLoaded' | 'setIsSearching' |
    'setSearchResults' // Add setSearchResults
> {
    socketRef: React.MutableRefObject<Socket | null>;
    isConnected: boolean;
    hasFatalError: boolean;
    handleError: (error: any, stopLoading?: boolean, isFatal?: boolean) => void;
    animationControls: StreamingTextAnimationControls;
    activeConversationId: string | null;
    resetAwaitFlag: () => void;
    conversationList: ConversationMetadata[]; // Add conversationList to props
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
    renameConversation: (conversationId: string, newTitle: string) => void;
    pinConversation: (conversationId: string, isPinned: boolean) => void;
    searchConversations: (searchTerm: string) => void; // Removed limit, as it's frontend now
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
    setIsSearching,
    setSearchResults, // Destructure setter
    conversationList, // Destructure conversationList
}: UseChatActionsProps): ChatActions {

    resetAwaitFlag();

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

    const closeConfirmationDialog = useCallback(() => {
        
        console.log("[useChatActions] closeConfirmationDialog called");
    }, []);

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
        socketRef.current.emit('delete_conversation', { conversationId });
    }, [isConnected, hasFatalError, socketRef, handleError]);

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
        socketRef.current.emit('clear_conversation', { conversationId });
    }, [isConnected, hasFatalError, socketRef, handleError]);

    const renameConversation = useCallback((conversationId: string, newTitle: string) => {
        
        if (!isConnected || hasFatalError || !socketRef.current) {
            handleError({ message: 'Cannot rename: Not connected or critical error.' }, false);
            return;
        }
        if (!conversationId || typeof newTitle !== 'string') {
            console.warn('Cannot rename: Invalid conversation ID or title.');
            return;
        }
        console.log(`[useChatActions] Requesting to rename conversation ${conversationId} to "${newTitle.substring(0,30)}..."`);
        const payload: RenameConversationClientData = { conversationId, newTitle };
        socketRef.current.emit('rename_conversation', payload);
    }, [isConnected, hasFatalError, socketRef, handleError]);

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

    // --- MODIFIED: Search Conversations Action (Frontend Search) ---
    const searchConversations = useCallback((searchTerm: string) => {
        console.log(`[useChatActions] Searching conversations locally with term: "${searchTerm.substring(0, 30)}..."`);
        setIsSearching(true);

        const trimmedSearchTerm = searchTerm.trim().toLowerCase();

        if (!trimmedSearchTerm) {
            // If search term is empty, show all conversations or an empty list,
            // depending on desired behavior. Here, we show all.
            // Or, you might want to set it to an empty array: setSearchResults([]);
            setSearchResults(conversationList);
            setIsSearching(false);
            return;
        }

        const filteredConversations = conversationList.filter(conv => {
            // Search in title. Add more fields if needed (e.g., a snippet of last message if available)
            return conv.title.toLowerCase().includes(trimmedSearchTerm);
        });

        setSearchResults(filteredConversations);
        setIsSearching(false);
    }, [conversationList, setSearchResults, setIsSearching]); // Dependencies: conversationList, setSearchResults, setIsSearching

    return {
        sendMessage,
        loadConversation,
        startNewConversation,
        handleConfirmSend,
        handleCancelSend,
        closeConfirmationDialog,
        deleteConversation,
        clearConversation,
        renameConversation,
        pinConversation,
        searchConversations,
    };
}