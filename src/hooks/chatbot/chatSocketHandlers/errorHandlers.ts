import { useCallback } from 'react';
import { ErrorUpdate, ThoughtStep, ChatMessageType, LoadingState } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path
import { generateMessageId } from '@/src/app/[locale]/chatbot/utils/chatUtils'; // Adjust path
import { StreamingTextAnimationControls } from '../useStreamingTextAnimation'; // Assuming type export from the hook

// Define dependencies needed by the error handler logic
export interface HandleErrorDependencies {
    isMountedRef: React.RefObject<boolean>;
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
    setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>;
    setHasFatalError: React.Dispatch<React.SetStateAction<boolean>>;
    animationControls: StreamingTextAnimationControls; // Pass the controls object
    onConnectionChange?: (isConnected: boolean) => void;
}

// Factory function to create the handleError callback
export function createHandleError(deps: HandleErrorDependencies) {
    const { isMountedRef, setChatMessages, setLoadingState, setHasFatalError, animationControls, onConnectionChange } = deps;

    // Use useCallback here to ensure stability if passed down further
    return useCallback((
        error: ErrorUpdate | { message: string; type?: 'error' | 'warning', thoughts?: ThoughtStep[] } | Error,
        stopLoading = true,
        isFatal = false
    ) => {
        if (!isMountedRef.current) return;
        console.error("Chat Error/Warning:", error);

        animationControls.stopStreaming(); // Use the passed controls

        let message = 'An unknown error occurred.';
        let type: 'error' | 'warning' = 'error';
        let thoughts: ThoughtStep[] | undefined = undefined;

        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'object' && error !== null) {
            message = error.message || message;
            type = error.type || type;
            thoughts = error.thoughts; // Assuming ErrorUpdate has thoughts
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
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && !lastMsg.isUser && lastMsg.message === message && lastMsg.type === type) {
                console.warn("Duplicate error/warning message suppressed:", message);
                return prev;
            }
            return [...prev, botMessage];
        });

        if (isFatal) {
            console.warn(`[Handler] Fatal error detected (${message}). Setting fatal error flag.`);
            setHasFatalError(true);
            onConnectionChange?.(false); // Ensure parent knows
        }

    // Pass dependencies that the callback relies on
    }, [isMountedRef, setChatMessages, setLoadingState, setHasFatalError, animationControls, onConnectionChange]);
}

// Type alias for the created function for easier use
export type HandleErrorFunction = ReturnType<typeof createHandleError>;

// --- Handler for 'chat_error' event ---
export interface HandleChatErrorEventDependencies {
     isMountedRef: React.RefObject<boolean>;
     handleError: HandleErrorFunction; // Use the type alias
}

export function createHandleChatErrorEvent(deps: HandleChatErrorEventDependencies) {
    const { isMountedRef, handleError } = deps;

    return useCallback((errorData: any) => {
        if (!isMountedRef.current) return;
        console.log("[Handler] Event: Chat Error", errorData);
        // Determine fatality based on backend signal (adjust as needed)
        const isFatal = errorData?.code === 'FATAL_SERVER_ERROR' || errorData?.fatal === true;
        handleError(errorData, true, isFatal);
    }, [isMountedRef, handleError]);
}