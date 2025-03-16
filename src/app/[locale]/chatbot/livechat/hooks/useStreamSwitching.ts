// hooks/useStreamSwitching.ts
import { useState } from "react";
import { useLoggerStore } from "../lib/store-logger";
import { useVideoStreamPopup } from "../side-panel/VideoStreamPopup";  // Path to your popup

interface StreamResource {
    start: () => Promise<MediaStream>;
    stop: () => void;
    isStreaming: boolean;
}

const useStreamSwitching = (videoStreams: StreamResource[], supportsVideo: boolean, onVideoStreamChange: (stream: MediaStream | null) => void ) => {
    const [activeVideoStream, setActiveVideoStream] = useState<MediaStream | null>(null);
    const { log } = useLoggerStore();
    const { openModal } = useVideoStreamPopup();

    const changeStreams = (next?: StreamResource) => async () => {
        let newStream: MediaStream | null = null;
        try {
            if (next) {
                newStream = await next.start();
                setActiveVideoStream(newStream);
                onVideoStreamChange(newStream);

                if (supportsVideo && newStream) {
                    openModal(newStream);
                }
            } else {
                setActiveVideoStream(null);
                onVideoStreamChange(null);
                if (activeVideoStream) {
                    activeVideoStream.getTracks().forEach(track => track.stop());
                }
            }

            videoStreams.filter(msr => msr !== next).forEach(msr => {
                if (msr.isStreaming) {
                    msr.stop();
                }
            });
        } catch (error) {
            console.error("Error getting media:", error);
            log({ date: new Date(), type: "error", message: "Connect failed: " + (error instanceof Error ? error.message : String(error))});
             if (newStream) {
                 newStream.getTracks().forEach((track) => track.stop());
            }
        }
    };

    return { activeVideoStream, changeStreams };
};

export default useStreamSwitching;