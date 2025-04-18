// SidePanel.tsx (Adjusted for Voice Only and external Connection Status)
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
// Removed: useVideoFrameSender hook
import useAudioRecorder from "../hooks/useAudioRecorder";
import useModelAudioResponse from "../hooks/useModelAudioResponse";
import useVolumeControl from "../hooks/useVolumeControl";
import ConnectionButton from "./ConnectionButton";
import MicButton from "./MicButton";
// Removed: MediaStreamButton
import ChatIntroduction from "./ChatIntroduction";
// Removed: RestartStreamButton (Its rendering logic is moved to parent)
// Removed: ConnectionStatus (Its rendering is moved to parent)
// Removed: VideoStreamPopup
// Removed: useConnection (Its state/handlers are now passed via props)
// Removed: useStreamSwitching (Video related)
import useInteractionHandlers from "../hooks/useInteractionHandlers";
// Removed: useTimer (Its state/handlers are now passed via props)

import { OutputModality, PrebuiltVoice } from '../page';

// --- Props now include connection state and handlers from parent ---
interface SidePanelProps {
    // Removed: videoRef, supportsVideo, onVideoStreamChange
    currentModality: OutputModality;
    onModalityChange: (modality: OutputModality) => void;
    currentVoice: PrebuiltVoice;
    onVoiceChange: (voice: PrebuiltVoice) => void;
    availableVoices: PrebuiltVoice[];

    // --- Connection State and Handlers (Passed from Parent) ---
    connected: boolean;
    isConnecting: boolean;
    streamStartTime: number | null; // Still useful for internal SidePanel logic like hasInteracted
    connectionStatusMessage: string | null; // Still useful for internal SidePanel logic if needed, though primary display is external
    connectWithPermissions: () => Promise<void>;
    handleDisconnect: () => void;
    // handleReconnect is likely used by the parent component now for the RestartButton,
    // but if any *internal* SidePanel logic needed it, it would also be a prop.
    // Based on the original code, it was primarily for the RestartStreamButton,
    // so we won't add it here unless needed otherwise.
    // handleReconnect: () => void;

    // --- Timer State and Handlers (Passed from Parent) ---
    // showTimer and elapsedTime are primarily for the *external* ConnectionStatus,
    // so they don't strictly need to be passed to SidePanel unless internal logic uses them.
    // Let's assume they are not needed internally for simplicity.
    // showTimer: boolean;
    // elapsedTime: number;
    // handleCloseTimer: () => void;
}
// --- END Props update ---


// --- Main Component ---
export default function SidePanel({
    // Removed: videoRef, supportsVideo, onVideoStreamChange
    currentModality,
    onModalityChange,
    currentVoice,
    onVoiceChange,
    availableVoices,

    // --- Destructure Connection/Timer Props ---
    connected,
    isConnecting,
    streamStartTime,
    connectionStatusMessage, // Keep if SidePanel might display it internally sometimes
    connectWithPermissions,
    handleDisconnect,
    // handleReconnect, // Not needed internally based on analysis
    // showTimer, // Not needed internally
    // elapsedTime, // Not needed internally
    // handleCloseTimer, // Not needed internally
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
    // hasInteracted state remains useful for showing initial intro vs logger
    const [hasInteracted, setHasInteracted] = useState(false);


    // Removed: useConnection hook call - state comes from props
    // Removed: useTimer hook call - state/handlers come from props (or parent handles)
    // Removed: useStreamSwitching hook call

    // Pass only relevant functions and state to useInteractionHandlers
    // useInteractionHandlers now receives connection actions/state from SidePanel's props
    const { handleSendMessage, handleStartVoice /* Removed: handleStartWebcam, handleStartScreenShare */ } = useInteractionHandlers({
        connected, // From props
        connectWithPermissions, // From props
        // Removed: changeStreams,
        setMuted,
        // Removed: webcam, screenCapture, supportsVideo
        client,
        log
    });

    // Clear logs when connected (dependency now uses prop)
    useEffect(() => {
        if (connected) {
            clearLogs();
            // Reset hasInteracted when successfully connected? Depends on desired flow.
            // setHasInteracted(true); // This might be redundant with the other useEffect
        }
    }, [connected, clearLogs]);

    // Update hasInteracted based on connection attempt status (dependencies now use props)
    useEffect(() => {
        // Removed activeVideoStream from dependency
        if (connected || isConnecting || streamStartTime !== null) { // Check streamStartTime if it indicates an attempt was made
            setHasInteracted(true);
        }
    }, [connected, isConnecting, streamStartTime]);


    // Hooks remain, using state/props as needed
    useLoggerScroll(loggerRef);
    useLoggerEvents(on, off, log);
    // Removed: useVideoFrameSender hook call
    useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume); // 'connected' from props
    useModelAudioResponse(on, off, log);
    useVolumeControl(inVolume);

    const handleModalityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!connected) { // 'connected' from props
            onModalityChange(event.target.value as OutputModality);
        }
    };

    const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if (!connected) { // 'connected' from props
            onVoiceChange(event.target.value as PrebuiltVoice);
        }
    };

    // UI now purely inside the SidePanel div
    return (
        // Removed: VideoStreamPopup and the container div for external status/restart button
        <div className="flex flex-col h-screen bg-white text-gray-700 rounded-2xl p-4 space-y-4">
            {/* Logger Area */}
            <div className="flex-grow overflow-y-auto" ref={loggerRef}>
                {/* Show intro if not connected and no interaction yet */}
                {!connected && !hasInteracted ? ( // 'connected' from props
                    <ChatIntroduction
                        onStartVoice={() => { handleStartVoice(); setHasInteracted(true); }}
                        // Removed webcam/screenshare handlers
                    />
                ) : (
                    // Show logger otherwise
                    <Logger filter="none" />
                )}
                 {/* Optionally display connectionStatusMessage here if not handled by external component,
                     or if you want it in the log/panel area too for certain messages.
                     For this adjustment, we assume the external component is the primary display.
                 */}
                 {/* {connectionStatusMessage && !showTimer && ( // Example: show message if no external timer active
                     <div className="mt-2 text-sm text-gray-600">{connectionStatusMessage}</div>
                 )} */}
            </div>

            {/* --- Container for Timer and Restart Button REMOVED ---
                 This UI is now controlled and rendered by the parent component.
            */}


            {/* Khu vực cài đặt Output */}
            <fieldset
                disabled={connected} // 'connected' from props
                className="border-t border-gray-200 pt-4 space-y-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                 <legend className="text-sm font-medium text-gray-600 mb-2 px-1">
                    Cài đặt Output
                    {connected && <span className="text-xs text-red-500 ml-2">(Ngắt kết nối để thay đổi)</span>} {/* 'connected' from props */}
                </legend>

                 <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Loại phản hồi</label>
                    <div className="flex space-x-4">
                        <label className={`flex items-center text-sm ${!connected ? 'cursor-pointer' : 'cursor-not-allowed'}`}> {/* 'connected' from props */}
                            <input
                                type="radio"
                                name="outputModality"
                                value="text"
                                checked={currentModality === 'text'}
                                onChange={handleModalityChange} // This handler uses 'connected' prop internally
                                className="mr-1 form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                                disabled={connected} // Redundant with fieldset, but explicit is fine
                            />
                            Text
                        </label>
                        <label className={`flex items-center text-sm ${!connected ? 'cursor-pointer' : 'cursor-not-allowed'}`}> {/* 'connected' from props */}
                            <input
                                type="radio"
                                name="outputModality"
                                value="audio"
                                checked={currentModality === 'audio'}
                                onChange={handleModalityChange} // This handler uses 'connected' prop internally
                                className="mr-1 form-radio h-4 w-4 text-blue-600 focus:ring-blue-500"
                                disabled={connected} // Redundant with fieldset
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
                            onChange={handleVoiceChange} // This handler uses 'connected' prop internally
                            className={`w-full p-1.5 border border-gray-300 rounded bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${!connected ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                            disabled={connected} // Redundant with fieldset
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
                {/* ConnectionButton now uses props */}
                <ConnectionButton
                    connected={connected} // From props
                    connect={connectWithPermissions} // From props
                    disconnect={handleDisconnect} // From props
                />
                {/* MicButton now uses props */}
                <MicButton muted={muted} setMuted={setMuted} volume={volume} connected={connected} /> {/* 'connected' from props */}
                {/* Removed MediaStreamButtons */}
                <div className="flex-grow">
                   <ChatInput onSendMessage={handleSendMessage} disabled={!connected} /> {/* 'connected' from props */}
                </div>
            </div>
        </div>
    );
}