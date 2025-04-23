// src/components/chatbot/LiveChatExperience.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLiveAPIContext } from './livechat/contexts/LiveAPIContext';
// Import isServerContentMessage and related types from where they are defined
import { isServerContentMessage, isModelTurn, isTurnComplete, isInterrupted } from './livechat/multimodal-live-types';
import { useLoggerStore } from './livechat/lib/store-logger';
import Logger from './livechat/logger/Logger';
import ChatInput from './livechat/main-layout/ChatInput';
import ConnectionButton from './livechat/main-layout/ConnectionButton';
import MicButton from './livechat/main-layout/MicButton';
import ChatIntroduction from './livechat/main-layout/ChatIntroduction';
import ConnectionStatus from './livechat/main-layout/ConnectionStatus';
import RestartStreamButton from './livechat/main-layout/RestartStreamButton';
import { LiveChatAPIConfig } from './LiveChatAPIConfig';

// Hooks
import useConnection from './livechat/hooks/useConnection';
import useTimer from './livechat/hooks/useTimer';
import useLoggerScroll from './livechat/hooks/useLoggerScroll';
import useLoggerEvents from './livechat/hooks/useLoggerEvents';
import useAudioRecorder from './livechat/hooks/useAudioRecorder';
import useModelAudioResponse from './livechat/hooks/useModelAudioResponse';
import useVolumeControl from './livechat/hooks/useVolumeControl';
import useInteractionHandlers from './livechat/hooks/useInteractionHandlers';

// Types and Constants
import { OutputModality, PrebuiltVoice, Language } from './lib/live-chat.types';
import { getSystemInstructions } from './lib/instructions';
import { AudioRecorder } from './livechat/lib/audio-recorder';

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


    // --- Connection & Timer Hooks ---
    const {
        connected,
        isConnecting,
        streamStartTime,
        connectionStatusMessage,
        connectWithPermissions,
        handleDisconnect,
        handleReconnect,
        error: connectionError,
    } = useConnection();

    const { elapsedTime, showTimer, handleCloseTimer } = useTimer(
        isConnecting,
        connected,
        streamStartTime
    );

    // --- Context and Store Hooks ---
    const { client, volume, on, off, setConfig } = useLiveAPIContext();
    const { log, clearLogs, logs } // <-- Get logs array from store
        = useLoggerStore();


    // --- State ---
    const loggerRef = useRef<HTMLDivElement>(null);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    // *** Ref to store the index of the log we are waiting for a response to ***
    const lastSentLogIndexRef = useRef<number | null>(null);
    const [inVolume, setInVolume] = useState(0); // Keep other state
    const [audioRecorder] = useState(() => new AudioRecorder());
    const [muted, setMuted] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // --- Interaction Handlers Hook ---
    const { handleSendMessage, handleStartVoice } = useInteractionHandlers({
        connected,
        connectWithPermissions,
        setMuted,
        client,
        log,
        // *** Pass specific functions for loading state ***
        startLoading: (sentLogIndex: number) => {
            setIsSendingMessage(true);
            lastSentLogIndexRef.current = sentLogIndex; // Store the index
            console.log(`[startLoading Callback] Set isSending=true, lastSentLogIndex=${sentLogIndex}`);
        },
        stopLoading: () => {
            setIsSendingMessage(false);
            lastSentLogIndexRef.current = null; // Reset index on explicit stop (e.g., error)
            console.log("[stopLoading Callback] Set isSending=false, lastSentLogIndex=null");
        },
    });

    // --- Effects ---
    useEffect(() => {
        if (connected) {
            clearLogs();
            setIsSendingMessage(false); // Reset loading on connect/clear
            lastSentLogIndexRef.current = null;
        }
    }, [connected, clearLogs]);
    useEffect(() => { if (connected || isConnecting || streamStartTime !== null) { setHasInteracted(true); } }, [connected, isConnecting, streamStartTime]);

    // *** Modified Effect to watch logs based on index ***
    useEffect(() => {
        // Only run if we are loading AND have a valid index to check against
        if (!isSendingMessage || lastSentLogIndexRef.current === null) {
            // console.log(`[LogEffect] Skipping. isSending: ${isSendingMessage}, lastSentIndex: ${lastSentLogIndexRef.current}`);
            return;
        }

        const startIndexToCheck = lastSentLogIndexRef.current + 1;
        console.log(`[LogEffect] Running. isSending: ${isSendingMessage}, checking logs from index ${startIndexToCheck}`);

        // Check logs that appeared *after* the sent message log
        for (let i = startIndexToCheck; i < logs.length; i++) {
            const currentLog = logs[i];

            // console.log(`[LogEffect] Checking log at index ${i}:`, currentLog?.type);

            // Basic check: ensure log and message exist
            if (!currentLog?.message) {
                continue;
            }

            // Check for relevant server response types
            if (isServerContentMessage(currentLog.message)) {
                const { serverContent } = currentLog.message;
                if (isModelTurn(serverContent) || isTurnComplete(serverContent) || isInterrupted(serverContent)) {
                    console.log(`[LogEffect] Found relevant ServerContentMessage at index ${i}. Stopping loading.`);
                    setIsSendingMessage(false);
                    lastSentLogIndexRef.current = null; // Reset ref as we found the response
                    return; // Exit effect processing once response is found
                }
            }
            // Add checks for other relevant server message types if needed (e.g., 'receive.audio')
            else if (currentLog.type?.startsWith("receive.")) {
                console.log(`[LogEffect] Found other server message type '${currentLog.type}' at index ${i}. Stopping loading.`);
                setIsSendingMessage(false);
                lastSentLogIndexRef.current = null; // Reset ref
                return; // Exit effect processing
            }
        }
        console.log(`[LogEffect] No relevant server response found yet after index ${lastSentLogIndexRef.current}. Still waiting.`);

        // Depend on logs and the loading state itself.
        // Do NOT depend on lastSentLogIndexRef.current directly as it's a ref.
    }, [logs, isSendingMessage, setIsSendingMessage]); // Keep setIsSendingMessage for linting if needed


    // --- Other Hooks ---
    useLoggerScroll(loggerRef);
    useLoggerEvents(on, off, log);
    useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume);
    useModelAudioResponse(on, off, log);
    useVolumeControl(inVolume);

    // --- Determine System Instructions ---
    const systemInstructions = getSystemInstructions(currentLanguage);

    // --- Connection Status Display Logic ---
    let connectionStatusType: 'connected' | 'error' | 'info' | 'connecting' = 'info';
    if (isConnecting) connectionStatusType = 'connecting';
    else if (connected) connectionStatusType = 'connected';
    else if (connectionStatusMessage || connectionError) connectionStatusType = streamStartTime !== null ? 'error' : 'info';

    const effectiveStatusMessage = connectionStatusMessage || connectionError?.message || null;
    const shouldShowExternalStatus = showTimer || (effectiveStatusMessage && connectionStatusType !== 'connected');
    const shouldShowRestartButton = connectionStatusType === 'error';


    return (
        <div className='relative flex h-full flex-col bg-white shadow-inner rounded-xl border-2'>

            <LiveChatAPIConfig
                outputModality={currentModality}
                selectedVoice={currentVoice}
                language={currentLanguage}
                systemInstructions={systemInstructions}
            />

            {shouldShowExternalStatus && (
                <div className='z-10'> {/* Giữ lại z-index nếu cần */}
                    <ConnectionStatus
                        status={connectionStatusType}
                        message={effectiveStatusMessage}
                        elapsedTime={connectionStatusType === 'connected' ? elapsedTime : undefined}
                        onClose={handleCloseTimer}
                    />
                </div>
            )}

            {shouldShowRestartButton && (
                <div className='absolute bottom-20 left-1/2 z-10 -translate-x-1/2 transform px-4'>
                    <RestartStreamButton onRestart={handleReconnect} />
                </div>
            )}

            <div className="flex-grow overflow-y-auto p-4" ref={loggerRef}>
                {!connected && !hasInteracted ? (
                    <ChatIntroduction
                        onStartVoice={() => { handleStartVoice(); setHasInteracted(true); }}
                    />
                ) : (
                    <Logger filter="none" />
                )}
            </div>

            <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 p-1.5 m-4">
                <ConnectionButton
                    connected={connected}
                    connect={connectWithPermissions}
                    disconnect={handleDisconnect}
                    isConnecting={isConnecting}
                />
                <MicButton
                    muted={muted}
                    setMuted={setMuted}
                    volume={volume}
                    connected={connected}
                />
                <div className="flex-grow">
                    <ChatInput
                        onSendMessage={handleSendMessage}
                        disabled={!connected}
                        isLoading={isSendingMessage} // Truyền trạng thái loading
                    />
                </div>
            </div>

        </div>
    );
}