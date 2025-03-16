// hooks/useConnection.ts
import { useState } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { useLoggerStore } from "../lib/store-logger";

const useConnection = () => {
    const { connected, connect: liveAPIConnect, disconnect } = useLiveAPIContext();
    const { log } = useLoggerStore();
    const [isConnecting, setIsConnecting] = useState(false);
    const [streamStartTime, setStreamStartTime] = useState<number | null>(null);
    const [connectionStatusMessage, setConnectionStatusMessage] = useState<string | null>(null);

    const connectWithPermissions = async (supportsVideo: boolean) => {
        setIsConnecting(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: supportsVideo,
            });
            liveAPIConnect();
            setStreamStartTime(Date.now());
            stream.getTracks().forEach(track => track.stop()); // Stop local stream immediately
        } catch (error) {
            console.error("Error getting media or connecting:", error);
            log({ date: new Date(), type: "error", message: "Connect failed: " + (error instanceof Error ? error.message : String(error)) });
            setStreamStartTime(null); // Reset on failure
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        disconnect();
        setIsConnecting(false);
        setStreamStartTime(null);
        setConnectionStatusMessage(null);
    };

    const handleReconnect = async (supportsVideo:boolean) => {
        await connectWithPermissions(supportsVideo);
        // No need to clear logs here; keep it in the calling component if needed
    };

    return {
        connected,
        isConnecting,
        streamStartTime,
        connectionStatusMessage,
        setConnectionStatusMessage,
        connectWithPermissions,
        handleDisconnect,
        handleReconnect
    };
};

export default useConnection;