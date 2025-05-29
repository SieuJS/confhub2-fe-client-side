// src/app/[locale]/chatbot/livechat/LiveChat.tsx
'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react' // Added useCallback
import { useLiveAPIContext } from './contexts/LiveAPIContext'
import { useLoggerStore } from './lib/store-logger'
import { LiveChatAPIConfig } from './LiveChatAPIConfig'

// Hooks
import useConnection from './hooks/useConnection'
import useTimer from './hooks/useTimer'
import useLoggerScroll from './hooks/useLoggerScroll'
import useLoggerEvents from './hooks/useLoggerEvents';
import useAudioRecorder from './hooks/useAudioRecorder' // Ensure this path is correct
import useModelAudioResponse from './hooks/useModelAudioResponse';
import useVolumeControl from './hooks/useVolumeControl'
import useInteractionHandlers from './hooks/useInteractionHandlers'
import { useMessageSendingManager } from './hooks/useMessageSendingManager'
import { useInteractionState } from './hooks/useInteractionState'

// Layout Components
import ChatStatusDisplay from './layout/ChatStatusDisplay'
import ChatArea from './layout/ChatArea'
import ChatInputBar from './layout/ChatInputBar'

// Types and Constants
import { getSystemInstructions } from '../language/instructions'
import { AudioRecorder } from './lib/audio-recorder' // Ensure this path is correct
import { Language as AppLanguage, StreamingLog } from '../lib/live-chat.types'; // Added StreamingLog
import { concatenateUint8Arrays } from './utils/audioUtils'; // Import the new helper

// Contexts and Stores
import { useLiveChatSettings } from './contexts/LiveChatSettingsContext'
import { useChatSettingsState } from '@/src/app/[locale]/chatbot/stores/storeHooks';
import { Buffer } from 'buffer'; // Needed for base64 operations

export default function LiveChatExperience() {
  const {
    currentModality,
    currentVoice,
    setLiveChatConnected
  } = useLiveChatSettings();

  const { currentLanguage: currentLanguageOptionFromStore } =
    useChatSettingsState();
  const currentAppLanguageCode: AppLanguage = currentLanguageOptionFromStore.code;

  const {
    volume: modelOutputVolume, // Đây là modelOutputVolume từ useLiveAPIContext
    on,
    off,
    sendClientContent,
    sendRealtimeInput,
  } = useLiveAPIContext();

  const {
    connected,
    isConnecting,
    streamStartTime,
    connectionStatusMessage,
    connectWithPermissions,
    handleDisconnect,
    handleReconnect,
    error: connectionError
  } = useConnection();

  const { elapsedTime, showTimer, handleCloseTimer } = useTimer(
    isConnecting,
    connected,
    streamStartTime
  );

  const { log, clearLogs, logs } = useLoggerStore();

  const loggerRef = useRef<HTMLDivElement>(null);
  const [inputMicVolume, setInputMicVolume] = useState(0);
  const audioRecorderRef = useRef<AudioRecorder | null>(null); // Use ref for AudioRecorder instance
  const [muted, setMuted] = useState(true);

  // Ref to store audio chunks for the client's audio player display
  const audioChunksForClientPlayerRef = useRef<Uint8Array[]>([]);

  const { hasInteracted, recordInteraction } = useInteractionState({
    connected,
    isConnecting,
    streamStartTime,
  });

  const { isSendingMessage, startSending, stopSending } =
    useMessageSendingManager({ logs });

  const hasClearedLogsOnConnectRef = useRef(false);

  const { handleSendMessage, handleStartVoice } = useInteractionHandlers({
    connected,
    connectWithPermissions,
    setMuted,
    sendClientContent,
    log,
    startLoading: startSending,
    stopLoading: () => stopSending('direct send error'),
  });

  // Initialize AudioRecorder instance once
  useEffect(() => {
    audioRecorderRef.current = new AudioRecorder();
    return () => {
      if (audioRecorderRef.current?.recording) {
        audioRecorderRef.current.stop();
      }
      audioRecorderRef.current = null;
    };
  }, []);


  useEffect(() => {
    setLiveChatConnected(connected);
  }, [connected, setLiveChatConnected]);

  useEffect(() => {
    if (connected) {
      if (!hasClearedLogsOnConnectRef.current) {
        clearLogs();
        hasClearedLogsOnConnectRef.current = true;
      }
      if (isSendingMessage) {
        stopSending('connection established/re-established');
      }
    } else {
      hasClearedLogsOnConnectRef.current = false;
    }
  }, [connected, isSendingMessage, clearLogs, stopSending]);

  useLoggerScroll(loggerRef);
  useLoggerEvents(on, off, log); // This will log SDK events, including transcriptions
  useModelAudioResponse(on, off, log); // This handles server audio playback and logging

  // Callback to get and clear accumulated audio chunks for the client player
  const getAndClearAudioChunksForClientPlayer = useCallback((): Uint8Array[] => {
    const chunks = [...audioChunksForClientPlayerRef.current];
    audioChunksForClientPlayerRef.current = [];
    return chunks;
  }, []);

  // Callback to handle when Google VAD determines a client speech segment has ended
  // Callback to handle when Google VAD (or client timeout) determines a client speech segment has ended
  const handleClientSpeechSegmentEnd = useCallback(() => {
    const chunks = getAndClearAudioChunksForClientPlayer();
    if (chunks.length > 0) {
      try {
        const combinedBinary = concatenateUint8Arrays(chunks);
        const combinedBase64 = Buffer.from(combinedBinary).toString('base64');
        if (combinedBase64.length > 0) {
          const logEntry: StreamingLog = {
            date: new Date(),
            // Sử dụng một type log nhất quán cho audio client, ví dụ:
            type: "send.clientAudio.segmentComplete",
            message: { clientAudio: { audioData: combinedBase64 } },
          };
          log(logEntry);
        }
      } catch (error) {
        console.error("Error encoding base64 for client audio segment:", error);
        const errorLogEntry: StreamingLog = {
          date: new Date(),
          type: "error.clientAudioSegment",
          message: (error instanceof Error ? error.message : String(error)),
        };
        log(errorLogEntry);
      }
    }
  }, [log, getAndClearAudioChunksForClientPlayer]);

  // Subscribe to the clientSpeechSegmentEnd event from useLiveAPI
  useEffect(() => {
    on("clientSpeechSegmentEnd", handleClientSpeechSegmentEnd);
    return () => {
      off("clientSpeechSegmentEnd", handleClientSpeechSegmentEnd);
    };
  }, [on, off, handleClientSpeechSegmentEnd]);


  // useAudioRecorder hook - manages the AudioRecorder lifecycle and sends data
  // It no longer manages the VAD-based segmentation for client player logging.
  useAudioRecorder({
    connected,
    muted,
    // Pass the AudioRecorder instance from the ref
    audioRecorder: audioRecorderRef.current!,
    sendRealtimeInput,
    log, // For logging errors within useAudioRecorder
    setInVolume: setInputMicVolume,
    // These are for handling the final segment when recording stops completely
    // onClientSpeechSegmentEnd: handleClientSpeechSegmentEnd, // REMOVE THIS LINE
    getAndClearAudioChunks: getAndClearAudioChunksForClientPlayer,
    // Add a way for useAudioRecorder to push chunks to audioChunksForClientPlayerRef
    accumulateAudioChunk: useCallback((chunk: Uint8Array) => {
      audioChunksForClientPlayerRef.current.push(chunk);
    }, [])
  });

  useVolumeControl(modelOutputVolume); // 'volume' here is modelOutputVolume

  const systemInstructions = getSystemInstructions(currentAppLanguageCode);

  let connectionStatusType: 'connected' | 'error' | 'info' | 'connecting' = 'info';
  if (isConnecting) connectionStatusType = 'connecting';
  else if (connected) connectionStatusType = 'connected';
  else if (connectionStatusMessage || connectionError)
    connectionStatusType = streamStartTime !== null ? 'error' : 'info';

  const effectiveStatusMessage =
    connectionStatusMessage || connectionError?.message || null;
  const shouldShowExternalStatus: boolean =
    showTimer ||
    !!(effectiveStatusMessage && connectionStatusType !== 'connected');
  const shouldShowRestartButton = connectionStatusType === 'error';

  const handleStartVoiceAndInteract = () => {
    if (!audioRecorderRef.current) {
      console.error("AudioRecorder not initialized yet.");
      return;
    }
    // When user starts voice, clear any pending chunks from a previous segment
    // that might not have been finalized by 'clientSpeechSegmentEnd' if user stopped mic early.
    // This ensures each new voice interaction starts with a fresh audio log for the client player.
    getAndClearAudioChunksForClientPlayer();

    handleStartVoice(); // This will setMuted(false) etc.
    recordInteraction();
  };

  return (
    <div className='relative flex h-full flex-col rounded-xl border-2 bg-white-pure shadow-inner'>
      <LiveChatAPIConfig
        outputModality={currentModality}
        selectedVoice={currentVoice}
        language={currentAppLanguageCode}
        systemInstructions={systemInstructions}
      />

      <ChatStatusDisplay
        statusType={connectionStatusType}
        statusMessage={effectiveStatusMessage}
        elapsedTime={elapsedTime}
        onCloseTimer={handleCloseTimer}
        showRestartButton={shouldShowRestartButton}
        onRestartStream={handleReconnect}
        showExternalStatus={shouldShowExternalStatus}
      />

      <ChatArea
        connected={connected}
        hasInteracted={hasInteracted}
        onStartVoice={handleStartVoiceAndInteract} // Use the wrapped handler
        loggerRef={loggerRef}
      />

      <ChatInputBar
        connected={connected}
        isConnecting={isConnecting}
        connect={connectWithPermissions}
        disconnect={handleDisconnect}
        muted={muted}
        setMuted={setMuted}
        micVolume={inputMicVolume}      // Âm lượng micro người dùng
        modelVolume={modelOutputVolume} // Âm lượng model
        onSendMessage={handleSendMessage}
        isSendingMessage={isSendingMessage}
      />
    </div>
  );
}