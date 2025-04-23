import { Socket } from 'socket.io-client';
import {
    ChatMessageType,
    InitialHistoryPayload,
    ConversationMetadata,
    LoadingState
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path

// Define dependencies (Keep as is)
export interface HistoryHandlerDependencies {
    isMountedRef: React.RefObject<boolean>;
    setConversationList: React.Dispatch<React.SetStateAction<ConversationMetadata[]>>;
    setIsLoadingHistory: React.Dispatch<React.SetStateAction<boolean>>;
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
    setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
    setIsHistoryLoaded: React.Dispatch<React.SetStateAction<boolean>>;
    setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>;
    socketRef: React.RefObject<Socket | null>;
}

// Factory function - NO useCallback inside
export function createHistoryHandlers(deps: HistoryHandlerDependencies) {
    const {
        isMountedRef, setConversationList, setIsLoadingHistory, setChatMessages,
        setActiveConversationId, setIsHistoryLoaded, setLoadingState, socketRef
    } = deps;

    // Plain function definitions
    const handleConversationList = (list: ConversationMetadata[]) => {
        if (!isMountedRef.current) return;
        console.log(`[Handler] Event: Received conversation list (${list?.length ?? 0} items)`);
        setConversationList(list || []);
        // Optionally stop a dedicated list loading indicator here
    };

    const handleInitialHistory = (payload: InitialHistoryPayload) => {
        if (!isMountedRef.current) return;
        console.log(`[Handler] Event: Initial History Received for ConvID: ${payload.conversationId}, Messages: ${payload.messages?.length ?? 0}`);
        setIsLoadingHistory(false);
        setChatMessages(payload.messages || []);
        setActiveConversationId(payload.conversationId);
        setIsHistoryLoaded(true);
        setLoadingState(prev => ({ ...prev, step: 'history_loaded' }));
    };

    const handleNewConversationStarted = (payload: { conversationId: string }) => {
        if (!isMountedRef.current || !payload || !payload.conversationId) return;
        console.log(`[Handler] Event: New Conversation Started. ID: ${payload.conversationId}`);
        setIsLoadingHistory(false);
        setChatMessages([]);
        setActiveConversationId(payload.conversationId);
        setIsHistoryLoaded(false); // History is not loaded for the new chat yet
        setLoadingState({ isLoading: false, step: 'new_chat_ready', message: '' });

        // Access socketRef.current directly when the function is called
        if (socketRef.current) {
            console.log("[Handler] Requesting updated conversation list after new one started...");
            socketRef.current.emit('get_conversation_list');
        } else {
             console.warn("[Handler] Cannot request list update - socketRef is null.");
        }
    };

    // Return the object with plain functions
    return {
        handleConversationList,
        handleInitialHistory,
        handleNewConversationStarted,
    };
}