// src/components/chatbot/LiveChatExperience.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLiveAPIContext } from './livechat/contexts/LiveAPIContext'; // Adjusted path
import { useLoggerStore } from './livechat/lib/store-logger'; // Adjusted path
import Logger from './livechat/logger/Logger'; // Adjusted path
import ChatInput from './livechat/main-layout/ChatInput'; // Adjust path if needed
import ConnectionButton from './livechat/main-layout/ConnectionButton'; // Adjust path
import MicButton from './livechat/main-layout/MicButton';       // Adjust path
import ChatIntroduction from './livechat/main-layout/ChatIntroduction'; // Adjust path
import ConnectionStatus from './livechat/main-layout/ConnectionStatus'; // Adjust path
import RestartStreamButton from './livechat/main-layout/RestartStreamButton'; // Adjust path
import { LiveChatAPIConfig } from './LiveChatAPIConfig'; // Renamed LiveChatAPI/LiveChatComponent for clarity

// Hooks (adjust paths as needed)
import useConnection from './livechat/hooks/useConnection';
import useTimer from './livechat/hooks/useTimer';
import useLoggerScroll from './livechat/hooks/useLoggerScroll';
import useLoggerEvents from './livechat/hooks/useLoggerEvents';
import useAudioRecorder from './livechat/hooks/useAudioRecorder'; // Assuming you have this hook adapted
import useModelAudioResponse from './livechat/hooks/useModelAudioResponse'; // Assuming you have this hook adapted
import useVolumeControl from './livechat/hooks/useVolumeControl'; // Assuming you have this hook adapted
import useInteractionHandlers from './livechat/hooks/useInteractionHandlers'; // Option 1: Use the hook

// Types and Constants (adjust paths)
import { OutputModality, PrebuiltVoice, Language } from './lib/types';
import { getSystemInstructions } from './lib/instructions';
import { AudioRecorder } from './livechat/lib/audio-recorder'; // Assuming path

// --- Props Interface ---
interface LiveChatExperienceProps {
    currentModality: OutputModality;
    currentVoice: PrebuiltVoice;
    currentLanguage: Language;
}

export default function LiveChatExperience({
    currentModality,
    currentVoice,
    currentLanguage,
}: LiveChatExperienceProps) {

    // --- Context and Store Hooks ---
    const { client, volume, on, off, setConfig } = useLiveAPIContext(); // Get necessary context values
    const { log, clearLogs } = useLoggerStore();

    // --- Connection & Timer Hooks (from useConnection/useTimer) ---
    const {
        connected,
        isConnecting,
        streamStartTime,
        connectionStatusMessage,
        connectWithPermissions,
        handleDisconnect,
        handleReconnect,
        error: connectionError, // Get error state if useConnection provides it
    } = useConnection();

    const { elapsedTime, showTimer, handleCloseTimer } = useTimer(
        isConnecting,
        connected,
        streamStartTime
    );

    // --- State migrated from original MainLayout ---
    const loggerRef = useRef<HTMLDivElement>(null);
    const [inVolume, setInVolume] = useState(0);
    const [audioRecorder] = useState(() => new AudioRecorder());
    const [muted, setMuted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // --- Interaction Handlers Hook ---
    const { handleSendMessage, handleStartVoice } = useInteractionHandlers({
        connected,
        connectWithPermissions, // Pass connection trigger
        setMuted,
        client,
        log,
    });

    // --- Effects migrated from original MainLayout ---
    useEffect(() => { if (connected) { clearLogs(); } }, [connected, clearLogs]);
    useEffect(() => { if (connected || isConnecting || streamStartTime !== null) { setHasInteracted(true); } }, [connected, isConnecting, streamStartTime]);

    // --- Other Hooks migrated from original MainLayout ---
    useLoggerScroll(loggerRef); // Manages scrolling of the logger area
    useLoggerEvents(on, off, log); // Listens for API events and logs them
    useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume); // Handles mic input
    useModelAudioResponse(on, off, log); // Handles playing audio responses
    useVolumeControl(inVolume); // Visual feedback for input volume (optional)

    // --- Determine System Instructions ---
    const systemInstructions = getSystemInstructions(currentLanguage);

    // --- Connection Status Display Logic ---
    let connectionStatusType: 'connected' | 'error' | 'info' | 'connecting' = 'info';
    if (isConnecting) connectionStatusType = 'connecting';
    else if (connected) connectionStatusType = 'connected';
    else if (connectionStatusMessage || connectionError) connectionStatusType = streamStartTime !== null ? 'error' : 'info'; // Show error if attempt was made

    const effectiveStatusMessage = connectionStatusMessage || connectionError?.message || null;
    const shouldShowExternalStatus = showTimer || (effectiveStatusMessage && connectionStatusType !== 'connected');
    const shouldShowRestartButton = connectionStatusType === 'error';


    return (
        // Main container for the live chat experience
        <div className='relative flex h-full flex-col bg-white shadow-inner'> {/* Added bg/shadow */}

             {/* Non-UI Component for API Config / Tool Calls */}
            <LiveChatAPIConfig
                outputModality={currentModality}
                selectedVoice={currentVoice}
                language={currentLanguage}
                systemInstructions={systemInstructions}
            />

            {/* --- External Connection Status & Restart --- */}
            {/* Position these absolutely within the relative parent */}
            {shouldShowExternalStatus && (
                <div className='absolute top-4 left-1/2 z-10 -translate-x-1/2 transform px-4'>
                    <ConnectionStatus
                        status={connectionStatusType}
                        message={effectiveStatusMessage}
                        elapsedTime={connectionStatusType === 'connected' ? elapsedTime : undefined}
                        onClose={handleCloseTimer}
                    />
                </div>
            )}

            {shouldShowRestartButton && (
                // Position near the bottom, maybe above input? Adjust 'bottom-20' as needed
                <div className='absolute bottom-20 left-1/2 z-10 -translate-x-1/2 transform px-4'>
                    <RestartStreamButton onRestart={handleReconnect} />
                </div>
            )}
            {/* --- END External Status --- */}


            {/* --- Main Chat Display Area --- */}
            {/* Takes up remaining space, scrolls */}
            <div className="flex-grow overflow-y-auto p-4" ref={loggerRef}>
                {/* Show introduction only if not connected AND user hasn't interacted yet */}
                 {!connected && !hasInteracted ? (
                     <ChatIntroduction
                         // Use handleStartVoice from the hook, which also sets muted state
                         onStartVoice={() => { handleStartVoice(); setHasInteracted(true); }}
                         // Add a way to connect via text input interaction if needed
                         // onStartText={() => { connectWithPermissions(); setHasInteracted(true); }}
                     />
                 ) : (
                     // Show the logger once connected or interaction started
                     <Logger filter="none" /> // Use your logger component
                 )}
            </div>


            {/* --- Chat Input Area (Migrated from original MainLayout) --- */}
            {/* Fixed at the bottom */}
            <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 p-1.5 m-4"> {/* Added margin */}
                <ConnectionButton
                    connected={connected}
                    connect={connectWithPermissions} // Use the function from useConnection
                    disconnect={handleDisconnect}     // Use the function from useConnection
                    isConnecting={isConnecting}       // Pass connecting state for button visual feedback
                />
                <MicButton
                    muted={muted}
                    setMuted={setMuted} // Allow MicButton to toggle mute state
                    volume={volume}     // Pass volume for visual feedback
                    connected={connected} // Disable if not connected
                />
                <div className="flex-grow">
                     {/* Pass handleSendMessage from useInteractionHandlers */}
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        disabled={!connected} // Disable input if not connected
                    />
                </div>
            </div>

        </div>
    );
}