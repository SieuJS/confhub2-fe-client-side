import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { LoadingState } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path
import { StreamingTextAnimationControls } from '../useStreamingTextAnimation'; // Assuming type export
import { HandleErrorFunction } from './errorHandlers'; // Import the type

// Define dependencies
export interface ConnectionHandlerDependencies {
    isMountedRef: React.RefObject<boolean>;
    setHasFatalError: React.Dispatch<React.SetStateAction<boolean>>;
    onConnectionChange?: (isConnected: boolean) => void;
    setLoadingState: React.Dispatch<React.SetStateAction<LoadingState>>;
    setHasRequestedList: React.Dispatch<React.SetStateAction<boolean>>;
    animationControls: StreamingTextAnimationControls;
    hasFatalError: boolean; // Need current state value
    handleError: HandleErrorFunction;
    onInitialConnectionError?: (error: Error) => void;
}

// Factory function
export function createConnectionHandlers(deps: ConnectionHandlerDependencies) {
    const {
        isMountedRef, setHasFatalError, onConnectionChange, setLoadingState,
        setHasRequestedList, animationControls, hasFatalError, handleError,
        onInitialConnectionError
    } = deps;

    const handleConnect = useCallback((socketId: string) => {
        if (!isMountedRef.current) return;
        console.log(`[Handler] Event: Connected with ID ${socketId}`);
        setHasFatalError(false);
        onConnectionChange?.(true);
        setLoadingState({ isLoading: false, step: 'connected', message: 'Connected' });
        setHasRequestedList(false); // Reset flag on new connection
    }, [isMountedRef, setHasFatalError, onConnectionChange, setLoadingState, setHasRequestedList]);

    const handleDisconnect = useCallback((reason: Socket.DisconnectReason) => {
         if (!isMountedRef.current) return;
         console.log(`[Handler] Event: Disconnected. Reason: ${reason}`);
         onConnectionChange?.(false);
         animationControls.stopStreaming();

         // Only show error if not intentional and not already fatal
         if (reason !== 'io client disconnect' && !hasFatalError) { // Use state value from deps
             setLoadingState({ isLoading: false, step: 'disconnected', message: `Disconnected: ${reason}` });
         } else if (hasFatalError) {
             setLoadingState({ isLoading: false, step: 'fatal_error', message: 'Disconnected (Fatal Error)' });
         } else {
             setLoadingState({ isLoading: false, step: 'disconnected', message: 'Disconnected' });
         }
    }, [isMountedRef, onConnectionChange, animationControls, hasFatalError, setLoadingState]); // Use deps directly

    const handleConnectError = useCallback((err: Error) => {
        if (!isMountedRef.current) return;
        console.log("[Handler] Event: Connect Error", err);

        const isAuthError = err.message.toLowerCase().includes('auth') ||
                            err.message.toLowerCase().includes('token') ||
                            err.message.toLowerCase().includes('unauthorized');

        handleError(err, true, isAuthError); // Use handleError from deps
        onInitialConnectionError?.(err);

        if (isAuthError) {
            setLoadingState({ isLoading: false, step: 'auth_error', message: 'Auth Failed' });
        } else {
            setLoadingState({ isLoading: false, step: 'connection_error', message: 'Connection Failed' });
        }
    }, [isMountedRef, handleError, onInitialConnectionError, setLoadingState]); // Use deps

    const handleAuthError = useCallback((error: { message: string }) => {
         if (!isMountedRef.current) return;
         console.log("[Handler] Event: Auth Error", error);
         handleError({ ...error, type: 'error' }, true, true); // isFatal = true
         setLoadingState({ isLoading: false, step: 'auth_error', message: 'Auth Failed' });
    }, [isMountedRef, handleError, setLoadingState]); // Use deps

    return {
        handleConnect,
        handleDisconnect,
        handleConnectError,
        handleAuthError,
    };
}