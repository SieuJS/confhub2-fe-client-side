// src/app/[locale]/chatbot/stores/messageStore/messageState.ts
import {
    ChatMessageType,
    LoadingState,
    ThoughtStep,
    ErrorUpdate,
    ChatUpdate,
    ResultUpdate,
    EmailConfirmationResult,
    ConfirmSendEmailAction,
    StatusUpdate,
    FrontendAction,
    EditUserMessagePayload,
    BackendConversationUpdatedAfterEditPayload,
    ItemFollowStatusUpdatePayload,
    PersonalizationPayload,
    HistoryItem,
    UserFile,
    OriginalUserFileInfo,
    SendMessageData,
    LanguageCode
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { StreamingTextAnimationControls } from '@/src/hooks/regularchat/useStreamingTextAnimation';
import { Part } from "@google/genai";

export interface EditingMessageState {
    id: string;
    originalText: string;
}

export interface MessageStoreState {
    chatMessages: ChatMessageType[];
    loadingState: LoadingState;
    animationControls: StreamingTextAnimationControls | null;
    isAwaitingFinalResultRef: React.MutableRefObject<boolean>;
    pendingBotMessageId: string | null;
    editingMessageId: string | null; // ID của tin nhắn đang được edit (của user)
}

export interface MessageStoreActions {
    setChatMessages: (newMessagesOrUpdater: ChatMessageType[] | ((prev: ChatMessageType[]) => ChatMessageType[])) => void;
    addChatMessage: (message: ChatMessageType) => void;
    updateMessageById: (messageId: string, updates: Partial<ChatMessageType> | ((prev: ChatMessageType) => Partial<ChatMessageType>)) => void;
    setLoadingState: (loadingState: LoadingState) => void;
    setAnimationControls: (controls: StreamingTextAnimationControls | null) => void;
    resetAwaitFlag: () => void;
    setPendingBotMessageId: (id: string | null) => void;
    sendMessage: (
        partsForBackend: Part[], // Parts để gửi lên backend (có thể chứa context)
        partsForDisplay: Part[], // Parts chỉ để hiển thị trên UI (chỉ query user)
        userFilesForDisplayOptimistic?: UserFile[],
        originalUserFilesInfo?: OriginalUserFileInfo[]
    ) => void;

    resetChatUIForNewConversation: (clearActiveIdInOtherStores?: boolean) => void;
    submitEditedMessage: (messageIdToEdit: string, newText: string) => void;
    setEditingMessageId: (messageId: string | null) => void;
    clearAuthErrorMessages: () => void;
    _onSocketStatusUpdate: (data: StatusUpdate) => void;
    _onSocketChatUpdate: (data: ChatUpdate) => void;
    _onSocketChatResult: (data: ResultUpdate) => void;
    _onSocketChatError: (errorData: ErrorUpdate) => void;
    _onSocketEmailConfirmationResult: (result: EmailConfirmationResult) => void;
    _onSocketConversationUpdatedAfterEdit: (payload: BackendConversationUpdatedAfterEditPayload) => void;
    loadHistoryMessages: (historyItems: HistoryItem[]) => void;
}

export const initialMessageStoreState: MessageStoreState = {
    chatMessages: [],
    loadingState: { isLoading: false, step: 'idle', message: '', agentId: undefined },
    animationControls: null,
    isAwaitingFinalResultRef: { current: false },
    pendingBotMessageId: null,
    editingMessageId: null,
};

// Re-export types that might be needed by handlers/mappers directly from here
// or ensure they import from the original source. For now, we assume direct import from original source.
export type {
    ChatMessageType,
    LoadingState,
    ThoughtStep,
    ErrorUpdate,
    ChatUpdate,
    ResultUpdate,
    EmailConfirmationResult,
    ConfirmSendEmailAction,
    StatusUpdate,
    FrontendAction,
    EditUserMessagePayload,
    BackendConversationUpdatedAfterEditPayload,
    ItemFollowStatusUpdatePayload,
    PersonalizationPayload,
    HistoryItem,
    UserFile,
    OriginalUserFileInfo,
    SendMessageData,
    LanguageCode,
    Part
};
export type { StreamingTextAnimationControls };