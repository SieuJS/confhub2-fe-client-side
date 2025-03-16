// SidePanel.tsx (Modified)
"use client";
import { useRef, useState, useEffect } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { useLoggerStore } from "../lib/store-logger";
import Logger from "../logger/Logger";
import { AudioRecorder } from "../lib/audio-recorder";
import { useScreenCapture } from "../hooks/useScreenCapture";
import { useWebcam } from "../hooks/useWebcam";
import ChatInput from "./ChatInput";
import useLoggerScroll from "../hooks/useLoggerScroll";
import useLoggerEvents from "../hooks/useLoggerEvents";
import useVideoFrameSender from "../hooks/useVideoFrameSender";
import useAudioRecorder from "../hooks/useAudioRecorder";
import useModelAudioResponse from "../hooks/useModelAudioResponse";
import useVolumeControl from "../hooks/useVolumeControl";
import ConnectionButton from "./ConnectionButton";
import MicButton from "./MicButton";
import MediaStreamButton from "./MediaStreamButton";
import ChatIntroduction from "./ChatIntroduction";
import RestartStreamButton from "./RestartStreamButton";
import ConnectionStatus from "./ConnectionStatus";
import { VideoStreamPopup } from "./VideoStreamPopup";
import useConnection from "../hooks/useConnection";
import useStreamSwitching from "../hooks/useStreamSwitching";
import useInteractionHandlers from "../hooks/useInteractionHandlers";
import useTimer from "../hooks/useTimer";


export default function SidePanel({
    videoRef,
    supportsVideo,
    onVideoStreamChange = () => { },
}: {
    videoRef: any;
    supportsVideo: boolean;
    onVideoStreamChange: (stream: MediaStream | null) => void;
}) {
    const {  client, volume, on, off } = useLiveAPIContext();
    const loggerRef = useRef<HTMLDivElement>(null);
    const { log, clearLogs } = useLoggerStore(); // Get clearLogs

    const videoStreams = [useWebcam(), useScreenCapture()];
    const [webcam, screenCapture] = videoStreams;
    const [inVolume, setInVolume] = useState(0);
    const [audioRecorder] = useState(() => new AudioRecorder());
    const [muted, setMuted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);


    // Custom Hooks
    const {
        connected,
        isConnecting,
        streamStartTime,
        connectionStatusMessage,
        setConnectionStatusMessage,
        connectWithPermissions,
        handleDisconnect,
        handleReconnect
    } = useConnection();

    const { activeVideoStream, changeStreams } = useStreamSwitching(videoStreams, supportsVideo, onVideoStreamChange);
    const { elapsedTime, showTimer, handleCloseTimer } = useTimer(isConnecting, connected, streamStartTime);

    const { handleSendMessage, handleStartVoice, handleStartWebcam, handleStartScreenShare } = useInteractionHandlers({
        connected,
        connectWithPermissions,
        changeStreams,
        setMuted,
        webcam,
        screenCapture,
        supportsVideo,
        client,
        log
    });

    // Clear logs whenever 'connected' changes to true (new connection)
    useEffect(() => {
        if (connected) {
            clearLogs();
        }
    }, [connected, clearLogs]); // Add clearLogs to the dependency array


     useEffect(() => {
        // Set hasInteracted to true on any interaction
        if (connected || isConnecting || activeVideoStream) {
            setHasInteracted(true);
        }
    }, [connected, isConnecting, activeVideoStream]);

    useLoggerScroll(loggerRef);
    useLoggerEvents(on, off, log);
    useVideoFrameSender(connected, activeVideoStream, client, videoRef);
    useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume);
    useModelAudioResponse(on, off, log);
    useVolumeControl(inVolume);
    return (
        <>
            <VideoStreamPopup />

            <div className="flex flex-col h-screen bg-white text-gray-700 rounded-2xl p-4">
                {/* Logger Area */}
                <div className="flex-grow overflow-y-auto" ref={loggerRef}>
                    {!connected && !hasInteracted ? (
                        <ChatIntroduction
                            onStartVoice={() => { handleStartVoice(); setHasInteracted(true); }}
                            onStartWebcam={() => { handleStartWebcam(); setHasInteracted(true); }}
                            onStartScreenShare={() => { handleStartScreenShare(); setHasInteracted(true); }}
                        />
                    ) : (
                        <Logger filter="none" />
                    )}
                </div>

                {/* Container for Timer and Restart Button */}
                <div className="relative py-2 min-w-[100px]">
                    {(showTimer) && (
                        <div className="absolute mb-20 left-1/2 transform -translate-x-1/2 z-40">
                            <ConnectionStatus
                                message={connectionStatusMessage}
                                elapsedTime={elapsedTime}
                                onClose={handleCloseTimer}
                            />
                        </div>
                    )}
                    {!connected && streamStartTime && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 z-40">
                            <RestartStreamButton onRestart={() => { handleReconnect(supportsVideo); clearLogs(); }} />
                        </div>
                    )}
                </div>

                {/* Combined Input Area */}
                <div className="flex gap-3 rounded-full border border-gray-300 p-2 bg-gray-100 items-center">
                    <ConnectionButton connected={connected} connect={() => connectWithPermissions(supportsVideo)} disconnect={handleDisconnect} />
                    <MicButton muted={muted} setMuted={setMuted} volume={volume} connected={connected} />
                    {supportsVideo && (
                        <>
                            <MediaStreamButton
                                isStreaming={screenCapture.isStreaming}
                                start={changeStreams(screenCapture)}
                                stop={changeStreams()}
                                onIcon="cancel_presentation"
                                offIcon="present_to_all"
                            />
                            <MediaStreamButton
                                isStreaming={webcam.isStreaming}
                                start={changeStreams(webcam)}
                                stop={changeStreams()}
                                onIcon="videocam_off"
                                offIcon="videocam"
                            />
                        </>
                    )}
                    <ChatInput onSendMessage={handleSendMessage} disabled={!connected} />
                </div>
            </div>
        </>
    );
}