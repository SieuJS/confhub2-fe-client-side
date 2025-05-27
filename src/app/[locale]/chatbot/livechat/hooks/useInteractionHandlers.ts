// src/app/[locale]/chatbot/livechat/hooks/useInteractionHandlers.ts
import {
    StreamingLog,
    // ClientContentMessage, // This was a custom type, we'll construct SDKLiveClientMessage
    LiveOutgoingMessage, // This is SDKLiveClientMessage
} from "../../lib/live-chat.types"; // Adjusted path
import { useLoggerStore } from "../lib/store-logger";
import { MultimodalLiveClient } from "../lib/multimodal-live-client"; // Import your client class
import { Part, Content } from "@google/genai"; // SDK types

interface InteractionHandlersProps {
    connected: boolean;
    connectWithPermissions: () => Promise<void>;
    setMuted: (muted: boolean) => void;
    client: MultimodalLiveClient; // Type the client correctly
    log: (logEntry: StreamingLog) => void;
    startLoading: (sentLogIndex: number) => void;
    stopLoading: () => void;
}

const useInteractionHandlers = ({
    connected,
    connectWithPermissions,
    setMuted,
    client,
    log,
    startLoading,
    stopLoading
}: InteractionHandlersProps) => {

    const handleSendMessage = async (textInput: string) => {
        if (!connected) {
            // Optionally, attempt to connect if not connected
            // console.log("[handleSendMessage] Not connected. Attempting to connect...");
            // await connectWithPermissions(); // This might change the `connected` state asynchronously
            // if (!client.isConnected()) { // Re-check after attempting connection
            //     log({
            //         date: new Date(),
            //         type: "error",
            //         message: "Connection failed. Cannot send message.",
            //     });
            //     stopLoading(); // Ensure loading stops if connection fails
            //     return;
            // }
            // For now, let's stick to original logic: do nothing if not connected.
             log({
                 date: new Date(),
                 type: "info.sendAttempt",
                 message: "Send message attempt while not connected.",
             });
            return;
        }
        if (textInput.trim() === "") {
            log({
                 date: new Date(),
                 type: "info.sendAttempt",
                 message: "Attempted to send empty message.",
             });
            return;
        }

        const currentLogs = useLoggerStore.getState().logs;
        const nextLogIndex = currentLogs.length;

        console.log(`[handleSendMessage] Triggered. Next log index: ${nextLogIndex}. Setting loading TRUE.`);
        startLoading(nextLogIndex);

        try {
            const parts: Part[] = [{ text: textInput }];
            const userContent: Content = { role: "user", parts };

            // Construct the SDKLiveClientMessage for logging
            const messageToSendForLog: LiveOutgoingMessage = {
                clientContent: {
                    turns: [userContent],
                    turnComplete: true,
                },
            };

            const sendLogEntry: StreamingLog = {
                 date: new Date(),
                 type: "client.send.text", // More specific type for client sending text
                 message: messageToSendForLog, // Log the SDK-compatible message
                 count: 1,
            };
            log(sendLogEntry);

            // client.send will internally wrap this in the full LiveOutgoingMessage
            await client.send(parts, true); // true for turnComplete

            // Loading is stopped by useEffect in the component listening to server responses/errors

        } catch (error) {
            console.error("Failed to send message via client.send:", error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            log({
                date: new Date(),
                type: "error.send",
                message: `Failed to send message: ${errorMessage}`,
            });
            console.log("[handleSendMessage] Error during client.send. Setting loading FALSE.");
            stopLoading(); // Stop loading if the send operation itself throws an error
        }
    };

    const handleStartVoice = async () => {
        // Ensure client.isConnected() is a reliable way to check connection status
        // or rely on the `connected` prop which should be updated by the `useLiveApi` hook.
        if (!connected) { // Use the connected prop from useLiveApi
            try {
                await connectWithPermissions();
                // After successful connection, `connected` prop should become true via useLiveApi's events
            } catch (error) {
                console.error("Failed to connect with permissions for voice:", error);
                log({
                    date: new Date(),
                    type: "error.connectVoice",
                    message: `Failed to connect for voice: ${error instanceof Error ? error.message : String(error)}`,
                });
                return; // Don't proceed to setMuted if connection failed
            }
        }
        // At this point, connection should be established or was already established.
        // Re-check `connected` state if connectWithPermissions doesn't guarantee it before resolving
        // However, typically the `connected` prop itself would trigger UI changes.
        setMuted(false);
         log({
            date: new Date(),
            type: "client.voice.start",
            message: "Voice input started (unmuted).",
        });
    };

    return { handleSendMessage, handleStartVoice };
}

export default useInteractionHandlers;