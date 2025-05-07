// src/app/[locale]/hooks/chatbot/useChatState.ts
import { useState, useRef } from 'react';
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
    authToken: string | null | undefined; // undefined là trạng thái ban đầu chưa load
    isMountedRef: React.MutableRefObject<boolean>;
    searchResults: ConversationMetadata[]; // Lưu kết quả tìm kiếm
    isSearching: boolean;                  // Cờ báo đang tìm kiếm
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
    setAuthToken: React.Dispatch<React.SetStateAction<string | null | undefined>>;
    setSearchResults: React.Dispatch<React.SetStateAction<ConversationMetadata[]>>;
    setIsSearching: React.Dispatch<React.SetStateAction<boolean>>;
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
    const [authToken, setAuthToken] = useState<string | null | undefined>(undefined); // Initial undefined state
    const isMountedRef = useRef(true); // Keep mounted ref logic if needed across modules
    const [searchResults, setSearchResults] = useState<ConversationMetadata[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Optional: Add initialization logic for auth token here if desired
    // useEffect(() => { ... load token ... }, []);

    // Optional: Add cleanup for isMountedRef here
    // useEffect(() => {
    //     isMountedRef.current = true;
    //     return () => { isMountedRef.current = false; };
    // }, []);

    return {
        chatMessages, setChatMessages,
        loadingState, setLoadingState,
        hasFatalError, setHasFatalError,
        isHistoryLoaded, setIsHistoryLoaded,
        isLoadingHistory, setIsLoadingHistory,
        showConfirmationDialog, setShowConfirmationDialog,
        confirmationData, setConfirmationData,
        conversationList, setConversationList,
        activeConversationId, setActiveConversationId,
        authToken, setAuthToken,
        isMountedRef,
        searchResults, setSearchResults,
        isSearching, setIsSearching,
    };
}