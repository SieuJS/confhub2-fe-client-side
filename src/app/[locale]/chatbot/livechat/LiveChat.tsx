// src/app/[locale]/chatbot/livechat/LiveChat.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLiveAPIContext } from './contexts/LiveAPIContext'
import { useLoggerStore } from './lib/store-logger'
import { LiveChatAPIConfig } from './LiveChatAPIConfig' // Corrected path if needed

// Hooks
import useConnection from './hooks/useConnection'
import useTimer from './hooks/useTimer'
import useLoggerScroll from './hooks/useLoggerScroll'
import useLoggerEvents from './hooks/useLoggerEvents'; 
import useAudioRecorder from './hooks/useAudioRecorder'
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
import { getSystemInstructions } from '../lib/instructions'
import { AudioRecorder } from './lib/audio-recorder'
import { Language as AppLanguage } from '../lib/live-chat.types'; // Import your app's Language type

// Contexts and Stores
import { useLiveChatSettings } from './contexts/LiveChatSettingsContext'
import { useChatSettingsState } from '@/src/app/[locale]/chatbot/stores/storeHooks'

import FeatureComingSoonOverlay from './FeatureComingSoonOverlay';


export default function LiveChatExperience() {
  const {
    currentModality, // This should be OutputModalityString ("text" | "audio") from context
    currentVoice,    // This is PrebuiltVoice from context
    setLiveChatConnected
  } = useLiveChatSettings()

  const { currentLanguage: currentLanguageOptionFromStore } =
    useChatSettingsState()
  // currentLanguageOptionFromStore.code is your AppLanguage ('en', 'vi', etc.)
  const currentAppLanguageCode: AppLanguage = currentLanguageOptionFromStore.code

  const {
    connected,
    isConnecting,
    streamStartTime,
    connectionStatusMessage,
    connectWithPermissions,
    handleDisconnect,
    handleReconnect,
    error: connectionError
  } = useConnection()

  const { elapsedTime, showTimer, handleCloseTimer } = useTimer(
    isConnecting,
    connected,
    streamStartTime
  )

  const { client, volume: micVolume, on, off } = useLiveAPIContext();
  const { log, clearLogs, logs } = useLoggerStore(); // log here is (entry: any) => void


  const loggerRef = useRef<HTMLDivElement>(null)
  const [inVolume, setInVolume] = useState(0)
  const [audioRecorder] = useState(() => new AudioRecorder())
  const [muted, setMuted] = useState(false)

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
    client,
    log,
    startLoading: (sentLogIndex: number) => {
      startSending(sentLogIndex);
    },
    stopLoading: () => {
      stopSending('direct send error');
    }
  })

  useEffect(() => {
    setLiveChatConnected(connected)
  }, [connected, setLiveChatConnected])

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


  useLoggerScroll(loggerRef)
  useLoggerEvents(on, off, log);
  useModelAudioResponse(on, off, log); // Pass the general log function for this hook's internal logging
  useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume)
  useVolumeControl(inVolume)

  // getSystemInstructions expects your AppLanguage type
  const systemInstructions = getSystemInstructions(currentAppLanguageCode)

  let connectionStatusType: 'connected' | 'error' | 'info' | 'connecting' =
    'info'
  if (isConnecting) connectionStatusType = 'connecting'
  else if (connected) connectionStatusType = 'connected'
  else if (connectionStatusMessage || connectionError)
    connectionStatusType = streamStartTime !== null ? 'error' : 'info'

  const effectiveStatusMessage =
    connectionStatusMessage || connectionError?.message || null
  const shouldShowExternalStatus: boolean =
    showTimer ||
    !!(effectiveStatusMessage && connectionStatusType !== 'connected');
  const shouldShowRestartButton = connectionStatusType === 'error';

  const handleStartVoiceAndInteract = () => {
    handleStartVoice();
    recordInteraction();
  }

  const [showLiveChatOverlay, setShowLiveChatOverlay] = useState(true);

  return (
    <div className='relative flex h-full flex-col rounded-xl border-2 bg-white-pure shadow-inner'>
      <LiveChatAPIConfig
        outputModality={currentModality} // Pass OutputModalityString ("text" | "audio")
        selectedVoice={currentVoice}
        language={currentAppLanguageCode} // Pass your AppLanguage ('en', 'vi')
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
        onStartVoice={handleStartVoiceAndInteract}
        loggerRef={loggerRef}
      />

      <ChatInputBar
        connected={connected}
        isConnecting={isConnecting}
        connect={connectWithPermissions}
        disconnect={handleDisconnect}
        muted={muted}
        setMuted={setMuted}
        micVolume={micVolume}
        onSendMessage={handleSendMessage}
        isSendingMessage={isSendingMessage}
      />

      <FeatureComingSoonOverlay
        isVisible={showLiveChatOverlay}
        featureName="Live Chat"
      />
    </div>
  )
}