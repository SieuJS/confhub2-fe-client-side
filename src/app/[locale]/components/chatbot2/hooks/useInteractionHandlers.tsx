// hooks/useInteractionHandlers.ts

import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { useLoggerStore } from "../lib/store-logger";
import { AudioRecorder } from "../lib/audio-recorder"; // If needed within these handlers

interface InteractionHandlersProps {
    connected: boolean;
    connectWithPermissions: (supportsVideo: boolean) => Promise<void>; // Pass connect function
    changeStreams: (next?: any) => () => Promise<void>; // Pass changeStreams function
    setMuted: (muted: boolean) => void;
    webcam: any;          // Replace 'any' with the correct type
    screenCapture: any;   // Replace 'any' with the correct type
    supportsVideo: boolean;
    client: any;  // Replace 'any' with your client's type from LiveAPIContext
    log: (logEntry: any) => void; // Replace 'any' with your log entry type

}

const useInteractionHandlers = ({
    connected,
    connectWithPermissions,
    changeStreams,
    setMuted,
    webcam,
    screenCapture,
    supportsVideo,
    client,
    log
}: InteractionHandlersProps) => {

    const handleSendMessage = (textInput: string) => {
        if (!connected || textInput.trim() === "") {
            return;
        }
        client.send([{ text: textInput }]);
        log({ date: new Date(), type: "send.text", message: textInput });
    };

    const handleStartVoice = async () => {
        if (!connected) {
            await connectWithPermissions(supportsVideo);
        }
        setMuted(false);
    };

    const handleStartWebcam = async () => {
        if (!connected) {
            await connectWithPermissions(supportsVideo);
        }
        changeStreams(webcam)();
    };

    const handleStartScreenShare = async () => {
        if (!connected) {
            await connectWithPermissions(supportsVideo);
        }
        changeStreams(screenCapture)();
    };


    return { handleSendMessage, handleStartVoice, handleStartWebcam, handleStartScreenShare };
}

export default useInteractionHandlers;