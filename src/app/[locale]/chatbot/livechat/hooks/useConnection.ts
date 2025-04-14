// hooks/useConnection.ts (Adjusted for Voice-Only)
import { useState, useCallback } from "react"; // Added useCallback for consistency if needed
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { useLoggerStore } from "../lib/store-logger";

const useConnection = () => {
    // Get connection state and functions from the context
    const { connected, connect: liveAPIConnect, disconnect: liveAPIDisconnect } = useLiveAPIContext();
    const { log } = useLoggerStore(); // Logger function

    // State variables for managing connection flow
    const [isConnecting, setIsConnecting] = useState(false); // Tracks if connection attempt is in progress
    const [streamStartTime, setStreamStartTime] = useState<number | null>(null); // Timestamp when connection started
    const [connectionStatusMessage, setConnectionStatusMessage] = useState<string | null>(null); // User-facing status message

    /**
     * Requests audio permissions and initiates the connection via LiveAPIContext.
     * Video permission is explicitly NOT requested.
     */
    const connectWithPermissions = useCallback(async () => {
        // Prevent multiple simultaneous connection attempts
        if (isConnecting || connected) return;

        setIsConnecting(true);
        setConnectionStatusMessage("Requesting mic permission..."); // Inform user
        log({ date: new Date(), type: "system", message: "Attempting to connect (audio only)..." });

        try {
            // Request ONLY audio permissions.
            // The obtained stream is only used to confirm permission was granted.
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false, // Explicitly set video to false
            });

            log({ date: new Date(), type: "system", message: "Microphone permission granted." });
            setConnectionStatusMessage("Connecting..."); // Update status

            // Initiate the actual connection using the context's connect function.
            // This likely handles setting up WebSockets, etc.
            // We assume liveAPIConnect doesn't need the media stream itself here.
            await liveAPIConnect(); // Assuming liveAPIConnect is potentially async

            // If liveAPIConnect() is synchronous and 'connected' state updates immediately,
            // the 'connected' value from the context might not be updated yet in this render cycle.
            // Relying on the connect call succeeding is usually sufficient.
            // We set the start time *after* successful connection attempt.
            // Note: The 'connected' state update might trigger effects elsewhere.
            setStreamStartTime(Date.now());
            setConnectionStatusMessage("Connected"); // Final status for this flow

            // Stop the tracks from the permission stream immediately,
            // as it's not used for sending data (that's handled by AudioRecorder).
            stream.getTracks().forEach(track => track.stop());

        } catch (error) {
            console.error("Error getting media permissions or connecting:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            log({ date: new Date(), type: "error", message: `Connection failed: ${errorMessage}` });

            // Set appropriate error message for the user
            if (errorMessage.toLowerCase().includes('permission denied') || errorMessage.toLowerCase().includes('not allowed')) {
                setConnectionStatusMessage("Mic permission denied.");
            } else {
                setConnectionStatusMessage("Connection failed.");
            }
            setStreamStartTime(null); // Reset start time on failure
        } finally {
            // Ensure isConnecting is reset regardless of success or failure
            setIsConnecting(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnecting, connected, liveAPIConnect, log]); // Dependencies for useCallback


    /**
     * Disconnects using the LiveAPIContext function and resets local state.
     */
    const handleDisconnect = useCallback(() => {
        liveAPIDisconnect(); // Call the disconnect function from the context
        setIsConnecting(false); // Ensure connecting state is false
        setStreamStartTime(null); // Clear the start time
        setConnectionStatusMessage(null); // Clear any status message
        // log({ date: new Date(), type: "system", message: "Disconnected." });
    }, [liveAPIDisconnect, log]); // Dependencies for useCallback

    /**
     * Attempts to reconnect by calling connectWithPermissions again.
     * Assumes only audio is needed.
     */
    const handleReconnect = useCallback(async () => {
        log({ date: new Date(), type: "system", message: "Attempting to reconnect..." });
        // Simply call the updated connect function which only handles audio
        await connectWithPermissions();
        // Logging/clearing logs related to reconnect success/failure should happen
        // based on the outcome of connectWithPermissions (state changes, logs within it).
    }, [connectWithPermissions, log]); // Dependency on the connect function

    // Return the state and handler functions for use in components
    return {
        connected, // The connection state from context
        isConnecting, // Whether a connection attempt is active
        streamStartTime, // When the stream started (for timer)
        connectionStatusMessage, // User-facing message
        setConnectionStatusMessage, // Function to update the message (e.g., from other events)
        connectWithPermissions, // Function to initiate connection (audio only)
        handleDisconnect, // Function to disconnect
        handleReconnect // Function to attempt reconnection (audio only)
    };
};

export default useConnection;