import { useCallback } from 'react';
import {
    EmailConfirmationResult,
    ChatMessageType,
    LoadingState,
    ConfirmSendEmailAction
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path
import { generateMessageId } from '@/src/app/[locale]/chatbot/utils/chatUtils'; // Adjust path

// Define dependencies
export interface EmailConfirmationHandlerDependencies {
    isMountedRef: React.RefObject<boolean>;
    confirmationData: ConfirmSendEmailAction | null; // Need current data to compare ID
    setShowConfirmationDialog: React.Dispatch<React.SetStateAction<boolean>>;
    setConfirmationData: React.Dispatch<React.SetStateAction<ConfirmSendEmailAction | null>>;
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessageType[]>>;
    setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>;
}

// Factory function
export function createEmailConfirmationHandlers(deps: EmailConfirmationHandlerDependencies) {
    const {
        isMountedRef, confirmationData, setShowConfirmationDialog,
        setConfirmationData, setChatMessages, setLoadingState
    } = deps;

    const handleEmailConfirmationResult = useCallback((result: EmailConfirmationResult) => {
        if (!isMountedRef.current) return;
        console.log("[Handler] Event: Email Confirmation Result", result);

        // Close the dialog if it matches the current confirmation ID
        if (result.confirmationId === confirmationData?.confirmationId) {
            setShowConfirmationDialog(false);
            setConfirmationData(null);
        }

        const resultMessage: ChatMessageType = {
            id: generateMessageId(),
            message: result.message,
            isUser: false,
            type: result.status === 'success' ? 'text' : 'warning', // Or 'error'
            thoughts: undefined,
        };

        setChatMessages(prev => [...prev, resultMessage]);
        setLoadingState({ isLoading: false, step: `email_${result.status}`, message: '' });

    }, [isMountedRef, confirmationData, setShowConfirmationDialog, setConfirmationData, setChatMessages, setLoadingState]); // Depend on confirmationData

    return {
        handleEmailConfirmationResult,
    };
}