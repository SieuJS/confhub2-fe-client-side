// src/app/[locale]/hooks/chatbot/useChatState.ts
import { useState, useRef, useCallback } from 'react';
import {
    ChatMessageType, LoadingState, ConfirmSendEmailAction,
    ConversationMetadata
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path

export interface ChatState {
    chatMessages: ChatMessageType[];
    loadingState: LoadingState;
    hasFatalError: boolean;
    isHistoryLoaded: boolean;
    isLoadingHistory: boolean;
    showConfirmationDialog: boolean;
    confirmationData: ConfirmSendEmailAction | null;
    conversationList: ConversationMetadata[];
    activeConversationId: string | null;
    authToken: string | null;
    isMountedRef: React.MutableRefObject<boolean>;
}

export interface ChatStateSetters {
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
    setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>;
    setHasFatalError: React.Dispatch<React.SetStateAction<boolean>>;
    setIsHistoryLoaded: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoadingHistory: React.Dispatch<React.SetStateAction<boolean>>;
    setShowConfirmationDialog: React.Dispatch<React.SetStateAction<boolean>>;
    setConfirmationData: React.Dispatch<React.SetStateAction<ConfirmSendEmailAction | null>>;
    setConversationList: React.Dispatch<React.SetStateAction<ConversationMetadata[]>>;
    setActiveConversationId: React.Dispatch<React.SetStateAction<string | null>>;
    setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useChatState(): ChatState & ChatStateSetters {
    const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({ isLoading: false, step: '', message: '' });
    const [hasFatalError, setHasFatalError] = useState<boolean>(false);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState<boolean>(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [confirmationData, setConfirmationData] = useState<ConfirmSendEmailAction | null>(null);
    const [conversationList, setConversationList] = useState<ConversationMetadata[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [authToken, setAuthToken] = useState<string | null>(null);
    const isMountedRef = useRef(true); // Keep mounted ref logic if needed across modules

    // Optional: Add initialization logic for auth token here if desired
    // useEffect(() => { ... load token ... }, []);

    // Optional: Add cleanup for isMountedRef here
    // useEffect(() => {
    //     isMountedRef.current = true;
    //     return () => { isMountedRef.current = false; };
    // }, []);

    return {
        chatMessages,
        loadingState,
        hasFatalError,
        isHistoryLoaded,
        isLoadingHistory,
        showConfirmationDialog,
        confirmationData,
        conversationList,
        activeConversationId,
        authToken,
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
        setAuthToken,
    };
}