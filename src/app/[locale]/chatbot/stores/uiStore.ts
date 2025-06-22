// src/app/[locale]/chatbot/stores/uiStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage, devtools } from 'zustand/middleware';
import { ConfirmSendEmailAction, ErrorUpdate, ThoughtStep } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path
import { generateMessageId } from '@/src/app/[locale]/chatbot/utils/chatUtils';
import { useMessageStore } from './messageStore/messageStore'; // Ensure this path is correct
import { useSocketStore } from './socketStore'; // Ensure this path is correct
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
// import { Part } from '@google/genai'; // Part is not directly used here, ChatMessageType.parts handles it

// --- Types for UI Store State ---
export interface UiStoreState {
    hasFatalError: boolean;
    fatalErrorCode: string | null;
    showConfirmationDialog: boolean;
    confirmationData: ConfirmSendEmailAction | null;
    isLeftPanelOpen: boolean;
    isRightPanelOpen: boolean;
    // currentView: 'chat' | 'history'; // Commented out as per original
    isFloatingChatOpen: boolean; // <<< NEW: For floating chatbot visibility
}

// --- Types for UI Store Actions ---
export interface UiStoreActions {
    setHasFatalError: (hasError: boolean, errorCode?: string | null) => void;
    setShowConfirmationDialog: (show: boolean, data?: ConfirmSendEmailAction | null) => void;
    toggleLeftPanel: () => void;
    setLeftPanelOpen: (isOpen: boolean) => void;
    setRightPanelOpen: (isOpen: boolean) => void;
    // setCurrentView: (view: 'chat' | 'history') => void; // Commented out as per original
    clearFatalError: () => void;
    setIsFloatingChatOpen: (isOpen: boolean) => void; // <<< NEW: Setter for floating chat

    // Complex Actions
    handleError: (
        error: ErrorUpdate | { message: string; type?: 'error' | 'warning'; thoughts?: ThoughtStep[]; code?: string; step?: string; details?: any } | Error,
        stopLoadingInMessageStore?: boolean,
        isFatal?: boolean
    ) => void;
    handleConfirmSend: (confirmationId: string) => void;
    handleCancelSend: (confirmationId: string) => void;
}

const initialUiStoreState: UiStoreState = {
    hasFatalError: false,
    fatalErrorCode: null,
    showConfirmationDialog: false,
    confirmationData: null,
    isLeftPanelOpen: false, // Default for main chatbot page
    isRightPanelOpen: false, // Default for main chatbot page
    // currentView: 'chat', // Commented out
    isFloatingChatOpen: false, // <<< NEW: Initial state for floating chat (closed by default)
};

export const useUiStore = create<UiStoreState & UiStoreActions>()(
    devtools(
        persist(
            (set, get) => ({
                ...initialUiStoreState,

                // --- Setters ---
                setHasFatalError: (hasError, errorCode = null) => {
                    set({
                        hasFatalError: hasError,
                        fatalErrorCode: hasError ? (errorCode || get().fatalErrorCode || 'UNKNOWN_FATAL_ERROR') : null
                    }, false, 'setHasFatalError');
                },
                clearFatalError: () => set({ hasFatalError: false, fatalErrorCode: null }, false, 'clearFatalError'),
                setShowConfirmationDialog: (show, data = null) => set({ showConfirmationDialog: show, confirmationData: data }, false, 'setShowConfirmationDialog'),
                toggleLeftPanel: () => set(state => ({ isLeftPanelOpen: !state.isLeftPanelOpen }), false, 'toggleLeftPanel'),
                setLeftPanelOpen: (isOpen) => set({ isLeftPanelOpen: isOpen }, false, 'setLeftPanelOpen'),
                setRightPanelOpen: (isOpen) => set({ isRightPanelOpen: isOpen }, false, 'setRightPanelOpen'),
                // setCurrentView: (view) => set({ currentView: view }, false, `setCurrentView/${view}`),

                setIsFloatingChatOpen: (isOpen) => set({ isFloatingChatOpen: isOpen }, false, 'setIsFloatingChatOpen'), // <<< NEW: Setter implementation

                // --- Complex Actions ---
                handleError: (errorInput, stopLoadingInMessageStore = true, isFatal = false) => {
                    console.error("Chat Error/Warning (UI Store):", errorInput);
                    // It's generally better to avoid calling getState() from other stores directly inside a store action
                    // if it can be avoided or passed as a parameter. However, for existing logic, we'll keep it.
                    const messageStore = useMessageStore.getState();
                    const socketStore = useSocketStore.getState();

                    messageStore.animationControls?.stopStreaming();
                    messageStore.resetAwaitFlag();

                    let finalError: Pick<ErrorUpdate, 'message' | 'thoughts' | 'step' | 'code' | 'details'> & { errorType: 'error' | 'warning' } = {
                        message: 'An unknown error occurred.',
                        errorType: 'error',
                    };

                    if (errorInput instanceof Error) {
                        finalError.message = errorInput.message;
                        if ('code' in errorInput && typeof (errorInput as any).code === 'string') {
                            finalError.code = (errorInput as any).code;
                        }
                    } else if (typeof errorInput === 'object' && errorInput !== null) {
                        if ('type' in errorInput && (errorInput.type === 'error' || errorInput.type === 'warning')) {
                            const errUpdate = errorInput as ErrorUpdate;
                            finalError.message = errUpdate.message;
                            finalError.thoughts = errUpdate.thoughts;
                            finalError.step = errUpdate.step;
                            finalError.code = errUpdate.code;
                            finalError.details = errUpdate.details;
                            finalError.errorType = errorInput.type === 'warning' ? 'warning' : 'error';
                        } else if ('message' in errorInput) {
                            const customErr = errorInput as { message: string; type?: 'error' | 'warning'; thoughts?: ThoughtStep[]; code?: string; step?: string; details?: any };
                            finalError.message = customErr.message;
                            finalError.errorType = customErr.type || 'error';
                            finalError.thoughts = customErr.thoughts;
                            finalError.step = customErr.step;
                            finalError.code = customErr.code;
                            finalError.details = customErr.details;
                        }
                    }

                    if (stopLoadingInMessageStore) {
                        messageStore.setLoadingState({ isLoading: false, step: 'error', message: finalError.errorType === 'error' ? 'Error' : 'Warning' });
                    }

                    const botMessage: ChatMessageType = {
                        id: generateMessageId(),
                        role: 'model',
                        parts: [{ text: finalError.message }],
                        text: finalError.message,
                        isUser: false,
                        type: finalError.errorType,
                        thoughts: finalError.thoughts,
                        timestamp: new Date().toISOString(),
                        errorCode: finalError.code,
                    };
                    messageStore.addChatMessage(botMessage);

                    const isAuthError = finalError.code === 'AUTH_REQUIRED' || finalError.code === 'ACCESS_DENIED' || finalError.code === 'TOKEN_EXPIRED';
                    const isGenericFatal = finalError.code === 'FATAL_SERVER_ERROR';

                    if (isFatal || isAuthError || isGenericFatal) {
                        const errorCodeToSet = finalError.code || 'UNKNOWN_FATAL_ERROR';
                        console.warn(`[UiStore] Fatal error detected (${finalError.message}, code: ${errorCodeToSet}). Setting fatal error flag.`);
                        get().setHasFatalError(true, errorCodeToSet); // Use get() for self-reference

                        if (isAuthError) {
                            socketStore.setHasFatalConnectionError(true);
                            socketStore.setIsConnected(false, null);
                            socketStore.setIsServerReadyForCommands(false);
                        }
                    }
                },
                handleConfirmSend: (confirmationId) => {
                    const socketStore = useSocketStore.getState();
                    const messageStore = useMessageStore.getState();
                    // const { setShowConfirmationDialog } = get(); // No, use set() directly or call other actions

                    if (socketStore.isConnected) {
                        socketStore.emitUserConfirmEmail(confirmationId);
                        messageStore.setLoadingState({ isLoading: true, step: 'confirming_email', message: 'Sending email...' });
                        // Dialog should be closed by the component initiating this, or after success/failure
                        // set({ showConfirmationDialog: false, confirmationData: null }); // Optionally close here
                    } else {
                        get().handleError({ message: 'Cannot confirm: Not connected.', type: 'error' }, false, false);
                        set({ showConfirmationDialog: false, confirmationData: null }); // Ensure dialog closes on error
                    }
                },
                handleCancelSend: (confirmationId) => {
                    const socketStore = useSocketStore.getState();
                    // const { setShowConfirmationDialog } = get(); // No, use set()

                    if (socketStore.isConnected) {
                        socketStore.emitUserCancelEmail(confirmationId);
                    } else {
                        console.warn('[UiStore] Cannot cancel: Not connected.');
                    }
                    set({ showConfirmationDialog: false, confirmationData: null }); // Always close dialog on cancel
                },
            }),
            {
                name: 'chatbot-ui-storage-v2', // Consider versioning if schema changes significantly
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    // Persist only what's necessary and safe to persist
                    isLeftPanelOpen: state.isLeftPanelOpen,
                    isRightPanelOpen: state.isRightPanelOpen,
                    isFloatingChatOpen: state.isFloatingChatOpen, // <<< NEW: Persist floating chat open state
                    // hasFatalError, fatalErrorCode, showConfirmationDialog, confirmationData are typically transient
                    // and should not be persisted, or reset on rehydration if they are.
                }),
                onRehydrateStorage: () => (state, error) => {
                    if (error) {
                        console.error('[UiStore] Failed to rehydrate from storage:', error);
                    }
                    if (state) {
                        console.log('[UiStore] Rehydrated from storage.');
                        // Optionally reset transient states that might have been persisted by mistake or due to older versions
                        // state.hasFatalError = false;
                        // state.fatalErrorCode = null;
                        // state.showConfirmationDialog = false;
                        // state.confirmationData = null;
                    }
                }
            }
        ),
        { name: "UiStore" }
    )
);