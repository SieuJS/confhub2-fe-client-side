// src/hooks/useSocketConnection.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Keep Interfaces the same
export interface SocketConnectionOptions {
    socketUrl: string;
    authToken: string | null;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    reconnectionDelayMax?: number;
    // Add: Control whether connection attempt should happen
    enabled?: boolean; // Defaults to true
}

export interface SocketEventHandlers {
    onConnect: (socketId: string) => void; // Pass socketId on connect
    onDisconnect: (reason: Socket.DisconnectReason) => void;
    onConnectError: (error: Error) => void;
    onStatusUpdate: (data: any) => void;
    onChatUpdate: (data: any) => void;
    onChatResult: (data: any) => void;
    onChatError: (errorData: any) => void;
    onAuthError: (error: { message: string }) => void;
}

/**
 * Manages the Socket.IO connection lifecycle and event listeners robustly.
 * Decouples handler updates from connection recreation.
 */
export function useSocketConnection(
    options: SocketConnectionOptions,
    handlers: SocketEventHandlers // Passed-in handlers
) {
    const {
        socketUrl,
        authToken,
        reconnectionAttempts = 5,
        reconnectionDelay = 1000,
        reconnectionDelayMax = 5000,
        enabled = true, // Default to enabled
    } = options;

    const [isConnected, setIsConnected] = useState<boolean>(false);
    // Initialize socketId with null
    const [socketId, setSocketId] = useState<string | null>(null);
    const socketRef = useRef<Socket | null>(null);
    // *** Store handlers in a ref to keep them up-to-date without triggering effect ***
    const latestHandlersRef = useRef(handlers);

    // Effect to update the ref whenever handlers change from the parent
    useEffect(() => {
        latestHandlersRef.current = handlers;
    }, [handlers]);

    // Effect for establishing and cleaning up the connection
    // *** CRITICAL: Dependencies ONLY include parameters that REQUIRE a new connection ***
    useEffect(() => {
        // Only attempt connection if enabled and we have a URL
        if (!enabled || !socketUrl) {
            // If disabled ensure we cleanup any existing socket
            if (socketRef.current) {
                console.log("[useSocketConnection] Connection disabled or URL missing. Disconnecting.");
                socketRef.current.disconnect();
                // State update handled by 'disconnect' event listener below
            }
            return; // Do nothing further
        }

        // Prevent connection if fatal error occurred previously (managed by parent)
        // or if token is explicitly null when required by backend
        // (Add specific logic here if needed, e.g., checking if authToken is null)

        console.log("[useSocketConnection] Attempting connection...", { socketUrl, hasAuthToken: !!authToken });

        const newSocket = io(socketUrl, {
            reconnectionAttempts,
            reconnectionDelay,
            reconnectionDelayMax,
            // Ensure auth object exists even if token is null,
            // server side should handle null token appropriately.
            auth: { token: authToken },
            // Important: Prevent autoConnect if we manage state manually based on 'enabled'
            // autoConnect: false, // Consider this if you want more control, but requires manual socket.connect() call
        });
        socketRef.current = newSocket;

        const handleConnect = () => {
            if (!socketRef.current) return;
            const currentSocketId = socketRef.current.id; // currentSocketId is string | undefined
            console.log('Socket connected:', currentSocketId);
            setIsConnected(true);
            // Use the correct type: string | null for setSocketId
            // We need to explicitly handle the 'undefined' case
            if (currentSocketId !== undefined) {
                setSocketId(currentSocketId); // Now we know currentSocketId is string
                // Call the latest handler from the ref
                latestHandlersRef.current.onConnect(currentSocketId);
            } else {
                // This case should ideally not happen if the socket is connected,
                // but it's good practice to handle the undefined possibility from socket.id
                console.error("Socket connected but id is undefined!");
                setSocketId(null); // Set to null if for some reason id is undefined
                // Decide how to handle the onConnect event in this edge case.
                // Maybe call it with null or skip it. Calling with the expected type (string) is safer.
                // Since the handler expects a string, we might skip the handler or throw an error.
                // Skipping is safer than passing null if the handler strictly expects string.
                // latestHandlersRef.current.onConnect(null as any); // Avoid this if possible
            }
        };

        const handleDisconnect = (reason: Socket.DisconnectReason) => {
            // Check if the disconnect is for the socket we are currently managing
            if (socketRef.current && newSocket.id !== socketRef.current.id) {
                console.log(`[useSocketConnection] Ignoring disconnect event for old socket ${newSocket.id}`);
                return;
            }
            console.warn('Socket disconnected:', reason);
            setIsConnected(false);
            // Setting socketId to null on disconnect
            setSocketId(null);
            // Call the latest handler from the ref
            latestHandlersRef.current.onDisconnect(reason);
        };

        const handleConnectError = (err: Error) => {
            console.error('Socket connection error:', err);
            // Check if the error is for the socket we are currently managing
            if (socketRef.current && newSocket.id !== socketRef.current.id) {
                console.log(`[useSocketConnection] Ignoring connect_error event for old socket ${newSocket.id}`);
                return;
            }
            setIsConnected(false);
            // Setting socketId to null on connect error
            setSocketId(null);
            // Call the latest handler from the ref
            latestHandlersRef.current.onConnectError(err);
        };

        // Register listeners using these stable wrappers
        newSocket.on('connect', handleConnect);
        newSocket.on('disconnect', handleDisconnect);
        newSocket.on('connect_error', handleConnectError);

        // Use wrappers for custom events too
        newSocket.on('status_update', (data) => latestHandlersRef.current.onStatusUpdate(data));
        newSocket.on('chat_update', (data) => latestHandlersRef.current.onChatUpdate(data));
        newSocket.on('chat_result', (data) => latestHandlersRef.current.onChatResult(data));
        newSocket.on('chat_error', (errorData) => latestHandlersRef.current.onChatError(errorData));
        newSocket.on('auth_error', (error) => latestHandlersRef.current.onAuthError(error));

        // --- Cleanup Function ---
        return () => {
            console.log(`[useSocketConnection] Cleaning up connection effect for socket ${newSocket.id}...`);
            // --- Remove listeners ---
            // It's crucial to remove the *specific wrapper functions* we added
            newSocket.off('connect', handleConnect);
            newSocket.off('disconnect', handleDisconnect);
            newSocket.off('connect_error', handleConnectError);
            newSocket.off('status_update'); // Simple removal if wrapper isn't stored
            newSocket.off('chat_update');
            newSocket.off('chat_result');
            newSocket.off('chat_error');
            newSocket.off('auth_error');

            // --- Disconnect ---
            // Only disconnect if this socket is still the "current" one
            if (socketRef.current && socketRef.current.id === newSocket.id) {
                console.log(`[useSocketConnection] Disconnecting socket ${newSocket.id} during cleanup.`);
                newSocket.disconnect();
                socketRef.current = null; // Clear the ref after disconnecting the managed socket
            } else {
                console.log(`[useSocketConnection] Socket ${newSocket.id} already replaced or disconnected, skipping disconnect in cleanup.`);
                // If newSocket is not the current socket, it might have been disconnected
                // already by a subsequent run of this effect (e.g., authToken changed).
                // Ensure it's fully disconnected if it wasn't the current one.
                if (newSocket.connected) {
                    newSocket.disconnect();
                }
            }
            // DO NOT reset isConnected/socketId state here, the 'disconnect' event handles that naturally.

            console.log(`[useSocketConnection] Cleanup complete for socket ${newSocket.id}.`);
        };
    }, [
        // *** DEPENDENCIES THAT REQUIRE RECONNECTION ***
        socketUrl,
        authToken,
        reconnectionAttempts,
        reconnectionDelay,
        reconnectionDelayMax,
        enabled // Re-run effect if connection is enabled/disabled
    ]); // Note: handlers object is NOT here!

    return { socketRef, isConnected, socketId };
}