// SidePanel.tsx (Modified to focus on Voice only)
"use client";
import { useRef, useState, useEffect } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { useLoggerStore } from "../lib/store-logger";
import Logger from "../logger/Logger";
import { AudioRecorder } from "../lib/audio-recorder";
// Removed: import { useScreenCapture } from "../hooks/useScreenCapture";
// Removed: import { useWebcam } from "../hooks/useWebcam";
import ChatInput from "./ChatInput";
import useLoggerScroll from "../hooks/useLoggerScroll";
import useLoggerEvents from "../hooks/useLoggerEvents";
// Removed: import useVideoFrameSender from "../hooks/useVideoFrameSender";
import useAudioRecorder from "../hooks/useAudioRecorder";
import useModelAudioResponse from "../hooks/useModelAudioResponse";
import useVolumeControl from "../hooks/useVolumeControl";
import ConnectionButton from "./ConnectionButton";
import MicButton from "./MicButton";
// Removed: import MediaStreamButton from "./MediaStreamButton";
import ChatIntroduction from "./ChatIntroduction";
import RestartStreamButton from "./RestartStreamButton";
import ConnectionStatus from "./ConnectionStatus";
// Removed: import { VideoStreamPopup } from "./VideoStreamPopup";
import useConnection from "../hooks/useConnection";
// Removed: import useStreamSwitching from "../hooks/useStreamSwitching";
import useInteractionHandlers from "../hooks/useInteractionHandlers";
import useTimer from "../hooks/useTimer";
import { OutputModality, PrebuiltVoice } from '../page';

interface SidePanelProps {
    // Removed: videoRef: React.RefObject<HTMLVideoElement>;
    // Removed: supportsVideo: boolean; // No longer needed as video is removed
    // Removed: onVideoStreamChange: (stream: MediaStream | null) => void;
    currentModality: OutputModality;
    onModalityChange: (modality: OutputModality) => void;
    currentVoice: PrebuiltVoice;
    onVoiceChange: (voice: PrebuiltVoice) => void;
    availableVoices: PrebuiltVoice[];
}

export default function SidePanel({
    // Removed: videoRef,
    // Removed: supportsVideo, // No longer needed
    // Removed: onVideoStreamChange = () => { },
    currentModality,
    onModalityChange,
    currentVoice,
    onVoiceChange,
    availableVoices,
}: SidePanelProps) {
    const { client, volume, on, off } = useLiveAPIContext();
    const loggerRef = useRef<HTMLDivElement>(null);
    const { log, clearLogs } = useLoggerStore();

    // Removed video stream hooks and state
    // const videoStreams = [useWebcam(), useScreenCapture()];
    // const [webcam, screenCapture] = videoStreams;

    const [inVolume, setInVolume] = useState(0);
    const [audioRecorder] = useState(() => new AudioRecorder());
    const [muted, setMuted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // supportsVideo is now always false (or irrelevant) for useConnection
    const {
        connected,
        isConnecting,
        streamStartTime,
        connectionStatusMessage,
        // Removed: setConnectionStatusMessage, // If not used elsewhere
        connectWithPermissions,
        handleDisconnect,
        handleReconnect
    } = useConnection(); // Removed supportsVideo dependency if possible in hook definition

    // Removed: const { activeVideoStream, changeStreams } = useStreamSwitching(videoStreams, supportsVideo, onVideoStreamChange);
    const { elapsedTime, showTimer, handleCloseTimer } = useTimer(isConnecting, connected, streamStartTime);

    // Pass only relevant functions and state to useInteractionHandlers
    const { handleSendMessage, handleStartVoice /* Removed: handleStartWebcam, handleStartScreenShare */ } = useInteractionHandlers({
        connected,
        connectWithPermissions,
        // Removed: changeStreams,
        setMuted,
        // Removed: webcam,
        // Removed: screenCapture,
        // Removed: supportsVideo, // Pass false or remove dependency in hook
        client,
        log
    });

    useEffect(() => {
        if (connected) {
            clearLogs();
        }
    }, [connected, clearLogs]);

    // Update hasInteracted dependencies if needed (activeVideoStream removed)
    useEffect(() => {
        // Removed activeVideoStream from dependency
        if (connected || isConnecting) {
            setHasInteracted(true);
        }
    }, [connected, isConnecting]);

    useLoggerScroll(loggerRef);
    useLoggerEvents(on, off, log);
    // Removed: useVideoFrameSender(connected, activeVideoStream, client, videoRef); // No video frames to send
    useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume);
    useModelAudioResponse(on, off, log);
    useVolumeControl(inVolume);

    const handleModalityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!connected) {
            onModalityChange(event.target.value as OutputModality);
        }
    };

    const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (!connected) {
            onVoiceChange(event.target.value as PrebuiltVoice);
        }
    };

    // Determine if connection should be allowed (always true now for voice)
    const canConnect = true; // Placeholder, always allow connection for voice

    return (
        <>
            {/* Removed: <VideoStreamPopup /> */}
            <div className="flex flex-col h-screen bg-white text-gray-700 rounded-2xl p-4 space-y-4">
                {/* Logger Area */}
                <div className="flex-grow overflow-y-auto" ref={loggerRef}>
                    {!connected && !hasInteracted ? (
                        <ChatIntroduction
                            onStartVoice={() => { handleStartVoice(); setHasInteracted(true); }}
                            // Removed webcam/screenshare handlers
                            // onStartWebcam={() => { handleStartWebcam(); setHasInteracted(true); }}
                            // onStartScreenShare={() => { handleStartScreenShare(); setHasInteracted(true); }}
                        />
                    ) : (
                        <Logger filter="none" />
                    )}
                </div>

                 {/* Container for Timer and Restart Button */}
                 <div className="relative py-2 min-w-[100px]">
                    {(showTimer) && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-40">
                            <ConnectionStatus
                                message={connectionStatusMessage}
                                elapsedTime={elapsedTime}
                                onClose={handleCloseTimer}
                            />
                        </div>
                    )}
                    {!connected && streamStartTime && (
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-40">
                            {/* Pass false or remove supportsVideo dependency in handleReconnect */}
                            <RestartStreamButton onRestart={() => { handleReconnect(/* supportsVideo: false */); clearLogs(); }} />
                        </div>
                    )}
                </div>

                {/* Khu vực cài đặt Output (Giữ nguyên) */}
                <fieldset
                    disabled={connected}
                    className="border-t border-gray-200 pt-4 space-y-3 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                     <legend className="text-sm font-medium text-gray-600 mb-2 px-1">
                        Cài đặt Output
                        {connected && <span className="text-xs text-red-500 ml-2">(Ngắt kết nối để thay đổi)</span>}
                    </legend>

                     <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Loại phản hồi</label>
                        <div className="flex space-x-4">
                            <label className={`flex items-center text-sm ${!connected ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                <input
                                    type="radio"
                                    name="outputModality"
                                    value="text"
                                    checked={currentModality === 'text'}
                                    onChange={handleModalityChange}
                                    className="mr-1 form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                Text
                            </label>
                            <label className={`flex items-center text-sm ${!connected ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                                <input
                                    type="radio"
                                    name="outputModality"
                                    value="audio"
                                    checked={currentModality === 'audio'}
                                    onChange={handleModalityChange}
                                    className="mr-1 form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                Audio
                            </label>
                        </div>
                     </div>

                     {currentModality === 'audio' && (
                        <div>
                            <label htmlFor="voiceSelect" className="block text-xs font-medium text-gray-500 mb-1">Giọng nói</label>
                            <select
                                id="voiceSelect"
                                value={currentVoice}
                                onChange={handleVoiceChange}
                                className={`w-full p-1.5 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${!connected ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                            >
                                {availableVoices.map((voice) => (
                                <option key={voice} value={voice}>
                                    {voice}
                                </option>
                                ))}
                            </select>
                        </div>
                     )}
                </fieldset>
                {/* --- END: Khu vực cài đặt Output --- */}

                {/* Combined Input Area */}
                <div className="flex gap-2 rounded-full border border-gray-300 p-1.5 bg-gray-100 items-center">
                    {/* Truyền false hoặc bỏ qua supportsVideo trong connectWithPermissions */}
                    <ConnectionButton connected={connected} connect={() => connectWithPermissions(/* supportsVideo: false */)} disconnect={handleDisconnect} />
                    <MicButton muted={muted} setMuted={setMuted} volume={volume} connected={connected} />
                    {/* Removed MediaStreamButtons for Webcam and ScreenShare */}
                    {/* {supportsVideo && (
                        <>
                            <MediaStreamButton ... /> // ScreenShare button removed
                            <MediaStreamButton ... /> // Webcam button removed
                        </>
                    )} */}
                    <div className="flex-grow">
                       <ChatInput onSendMessage={handleSendMessage} disabled={!connected} />
                    </div>
                </div>
            </div>
        </>
    );
}