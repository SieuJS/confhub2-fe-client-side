// src/app/[locale]/hooks/chatbt/useSocketConnection.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket, ManagerOptions, SocketOptions } from 'socket.io-client'; // Import ManagerOptions, SocketOptions if needed elsewhere
import { EmailConfirmationResult, StatusUpdate, ResultUpdate, ErrorUpdate, ChatUpdate, ConversationMetadata, InitialHistoryPayload } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Adjust path

// Keep Interfaces the same, ensure EmailConfirmationResult is defined correctly in the model
export interface SocketConnectionOptions {
    socketUrl: string;
    authToken: string | null;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    enabled?: boolean; // Control whether connection attempt should happen
}

// Add the onEmailConfirmationResult to the handlers interface

// Interface Handlers (Đảm bảo có đủ các handlers)
export interface SocketEventHandlers {
    onConnect: (socketId: string) => void;
    onDisconnect: (reason: Socket.DisconnectReason) => void;
    onConnectError: (error: Error) => void;
    onAuthError: (error: { message: string }) => void;
    onStatusUpdate: (data: StatusUpdate) => void;
    onChatUpdate: (data: ChatUpdate) => void;
    onChatResult: (data: ResultUpdate) => void;
    onChatError: (errorData: ErrorUpdate) => void;
    onEmailConfirmationResult?: (result: EmailConfirmationResult) => void;
    // --- Bổ sung các handlers còn thiếu ---
    onConversationList?: (list: ConversationMetadata[]) => void;
    onInitialHistory?: (payload: InitialHistoryPayload) => void;
    onNewConversationStarted?: (payload: { conversationId: string }) => void;
    // ----------------------------------
}


// SocketConnectionResult remains the same
export interface SocketConnectionResult {
    socketRef: React.MutableRefObject<Socket | null>;
    isConnected: boolean;
    socketId: string | null;
    // Removing manual connect/disconnect from return type as they weren't implemented
    // connect: () => void;
    // disconnect: () => void;
}

/**
 * Manages the Socket.IO connection lifecycle and event listeners robustly.
 * Decouples handler updates from connection recreation.
 */
export function useSocketConnection(
    options: SocketConnectionOptions,
    handlers: SocketEventHandlers // Passed-in handlers
): SocketConnectionResult { // Updated return type if connect/disconnect removed
    const {
        socketUrl,
        authToken,
        reconnectionAttempts = 5,
        reconnectionDelay = 1000,
        reconnectionDelayMax = 5000,
        enabled = true, // Default to enabled
    } = options;

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [socketId, setSocketId] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const latestHandlersRef = useRef(handlers);

    // Effect to update the ref whenever handlers change from the parent
    useEffect(() => {
        latestHandlersRef.current = handlers;
    }, [handlers]);

    // Effect for establishing and cleaning up the connection
    useEffect(() => {
        if (!enabled || !socketUrl) {
            if (socketRef.current) {
                console.log("[useSocketConnection] Connection disabled or URL missing. Disconnecting.");
                socketRef.current.disconnect();
                // State updates (isConnected, socketId) are handled by the disconnect listener
            }
            return; // Exit if not enabled or no URL
        }

        console.log("[useSocketConnection] Setting up connection...", { socketUrl, hasAuthToken: !!authToken });

        // Disconnect previous socket instance if dependencies change, before creating a new one
        // This ensures we don't have stale connections lingering.
        if (socketRef.current) {
            console.log("[useSocketConnection] Disconnecting previous socket instance before creating new one.");
            socketRef.current.disconnect();
             socketRef.current.removeAllListeners(); // Clean up listeners from old socket immediately
             socketRef.current = null; // Clear ref
        }


        const newSocket = io(socketUrl, {
            reconnectionAttempts,
            reconnectionDelay,
            reconnectionDelayMax,
            // Use auth object for cleaner passing of credentials
            auth: { token: authToken },
            // Consider forceNew: true if you absolutely need a fresh connection on dep change,
            // but usually io() handles this well if the URL/auth changes.
            // forceNew: true,
        });
        socketRef.current = newSocket; // Store the new socket instance immediately

        // --- Define Stable Event Handlers ---
        // These functions have stable identities and access the latest handlers via the ref.

        const handleConnect = () => {
            if (!socketRef.current || newSocket.id !== socketRef.current.id) {
                 console.log(`[useSocketConnection] Ignoring connect event for potentially old socket ${newSocket.id}`);
                 return; // Ignore events from sockets that are not the current one
            }
            const currentSocketId = newSocket.id;
            console.log('[useSocketConnection] Socket connected:', currentSocketId);
            setIsConnected(true);
            if (currentSocketId) { // Check if ID is truthy (should be a string)
                 setSocketId(currentSocketId);
                 latestHandlersRef.current.onConnect?.(currentSocketId); // Use optional chaining
            } else {
                 console.error("[useSocketConnection] Socket connected but id is missing!");
                 setSocketId(null);
                // Don't call onConnect if ID is missing, as it expects a string
            }
        };

        const handleDisconnect = (reason: Socket.DisconnectReason) => {
             if (!socketRef.current || newSocket.id !== socketRef.current.id) {
                 console.log(`[useSocketConnection] Ignoring disconnect event for potentially old socket ${newSocket.id}`);
                 return;
             }
            console.warn('[useSocketConnection] Socket disconnected:', reason);
            setIsConnected(false);
            setSocketId(null);
            latestHandlersRef.current.onDisconnect?.(reason); // Use optional chaining
        };

        const handleConnectError = (err: Error) => {
             if (!socketRef.current || newSocket.id !== socketRef.current.id) {
                 console.log(`[useSocketConnection] Ignoring connect_error event for potentially old socket ${newSocket.id}`);
                 return;
             }
            console.error('[useSocketConnection] Socket connection error:', err);
            setIsConnected(false); // Assume disconnected on error
            setSocketId(null);
            latestHandlersRef.current.onConnectError?.(err); // Use optional chaining
        };

        // --- Register Listeners using Stable Handlers ---
        newSocket.on('connect', handleConnect);
        newSocket.on('disconnect', handleDisconnect);
        newSocket.on('connect_error', handleConnectError);

        // Custom application events - Use wrappers that access the ref
        newSocket.on('status_update', (data) => latestHandlersRef.current.onStatusUpdate?.(data));
        newSocket.on('chat_update', (data) => latestHandlersRef.current.onChatUpdate?.(data));
        newSocket.on('chat_result', (data) => latestHandlersRef.current.onChatResult?.(data));
        newSocket.on('chat_error', (errorData) => latestHandlersRef.current.onChatError?.(errorData));
        newSocket.on('auth_error', (error) => latestHandlersRef.current.onAuthError?.(error));

        // --- Register the NEW event listener ---
        newSocket.on('email_confirmation_result', (result: EmailConfirmationResult) => {
            // Check if the handler exists before calling
            latestHandlersRef.current.onEmailConfirmationResult?.(result);
        });
        // --------------------------------------

        newSocket.on('conversation_list', (list) => latestHandlersRef.current.onConversationList?.(list)); // Assuming this exists from previous steps
        newSocket.on('initial_history', (payload) => latestHandlersRef.current.onInitialHistory?.(payload)); // Assuming this exists

        // --- REGISTER THE MISSING LISTENER ---
        newSocket.on('new_conversation_started', (payload) => {
            console.log("[useSocketConnection] Received 'new_conversation_started' event:", payload); // Add log for debugging
            latestHandlersRef.current.onNewConversationStarted?.(payload);
        });
        // ------------------------------------

        // --- Cleanup Function ---
        return () => {
            console.log(`[useSocketConnection] Cleaning up socket instance ${newSocket.id}...`);

            // Remove all listeners specifically for this instance
            newSocket.off('connect', handleConnect);
            newSocket.off('disconnect', handleDisconnect);
            newSocket.off('connect_error', handleConnectError);
            newSocket.off('status_update'); // Removing specific listeners is safer
            newSocket.off('chat_update');
            newSocket.off('chat_result');
            newSocket.off('chat_error');
            newSocket.off('auth_error');
            newSocket.off('email_confirmation_result'); // <-- Remove the new listener

            newSocket.off('conversation_list'); // Make sure to remove all added listeners
            newSocket.off('initial_history');

            // --- REMOVE THE NEW LISTENER ---
            newSocket.off('new_conversation_started');
            // -------------------------------
            
            // Only disconnect if this instance is still the one in the ref
            if (socketRef.current && socketRef.current.id === newSocket.id) {
                console.log(`[useSocketConnection] Disconnecting socket ${newSocket.id} in cleanup.`);
                newSocket.disconnect();
                socketRef.current = null; // Clear the ref only when cleaning up the *current* socket
                // State updates are handled by the disconnect event
            } else {
                 // If it's not the current socket, it might have been disconnected by a subsequent effect run.
                 // Ensure it's fully closed just in case.
                 if (newSocket.connected) {
                    console.log(`[useSocketConnection] Disconnecting potentially stale socket ${newSocket.id} in cleanup.`);
                    newSocket.disconnect();
                 }
            }
        };
    }, [
        // Dependencies that require a *new connection instance*
        socketUrl,
        authToken,
        reconnectionAttempts,
        reconnectionDelay,
        reconnectionDelayMax,
        enabled // Effect should re-run if 'enabled' status changes
    ]); // handlers object is intentionally omitted

    return { socketRef, isConnected, socketId };
}