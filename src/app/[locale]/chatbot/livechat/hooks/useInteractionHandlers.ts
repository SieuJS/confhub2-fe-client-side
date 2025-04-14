// hooks/useInteractionHandlers.ts (Modified for Voice only)
import { ClientContentMessage } from "../multimodal-live-types";

interface InteractionHandlersProps {
    connected: boolean;
    // Adjust connectWithPermissions signature if needed (remove supportsVideo if always false)
    connectWithPermissions: (/* supportsVideo: boolean */) => Promise<void>;
    // Removed: changeStreams: (next?: any) => () => Promise<void>;
    setMuted: (muted: boolean) => void;
    // Removed: webcam: any;
    // Removed: screenCapture: any;
    // Removed: supportsVideo: boolean; // No longer needed
    client: any;
    log: (logEntry: any) => void;
}

const useInteractionHandlers = ({
    connected,
    connectWithPermissions,
    // Removed: changeStreams,
    setMuted,
    // Removed: webcam,
    // Removed: screenCapture,
    // Removed: supportsVideo,
    client,
    log
}: InteractionHandlersProps) => {

    const handleSendMessage = (textInput: string) => {
        if (!connected || textInput.trim() === "") {
            return;
        }
        const parts = [{ text: textInput }];
        client.send(parts);

        const clientContentMessage: ClientContentMessage = {
            clientContent: {
                turns: [{ role: "user", parts }],
                turnComplete: true,
            },
        };

        log({
            date: new Date(),
            type: "send.text",
            message: clientContentMessage,
        });
    };

    const handleStartVoice = async () => {
        if (!connected) {
            // Call connect without video support flag
            await connectWithPermissions(/* supportsVideo: false */);
        }
        setMuted(false);
    };

    // Removed handleStartWebcam and handleStartScreenShare functions
    /*
    const handleStartWebcam = async () => {
        // ... Removed logic ...
    };

    const handleStartScreenShare = async () => {
        // ... Removed logic ...
    };
    */

    // Return only relevant handlers
    return { handleSendMessage, handleStartVoice /* Removed: handleStartWebcam, handleStartScreenShare */ };
}

export default useInteractionHandlers;