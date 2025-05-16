// src/app/[locale]/chatbot/livechat/LiveChat.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLiveAPIContext } from './contexts/LiveAPIContext'
import { useLoggerStore } from './lib/store-logger'
import { LiveChatAPIConfig } from './LiveChatAPIConfig'

// Hooks
import useConnection from './hooks/useConnection'
import useTimer from './hooks/useTimer'
import useLoggerScroll from './hooks/useLoggerScroll'
import useLoggerEvents from './hooks/useLoggerEvents'
import useAudioRecorder from './hooks/useAudioRecorder'
import useModelAudioResponse from './hooks/useModelAudioResponse'
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

// Contexts and Stores
import { useLiveChatSettings } from './contexts/LiveChatSettingsContext'
import { useChatSettingsState } from '@/src/app/[locale]/chatbot/stores/storeHooks'

export default function LiveChatExperience() {
  const {
    currentModality,
    currentVoice,
    setLiveChatConnected
  } = useLiveChatSettings()

  const { currentLanguage: currentLanguageOptionFromStore } =
    useChatSettingsState()
  const currentLanguageCode = currentLanguageOptionFromStore.code

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

  const { client, volume: micVolume, on, off } = useLiveAPIContext() // Renamed 'volume' to 'micVolume' for clarity
  const { log, clearLogs, logs } = useLoggerStore()

  const loggerRef = useRef<HTMLDivElement>(null)
  const [inVolume, setInVolume] = useState(0) // For microphone input volume visualization
  const [audioRecorder] = useState(() => new AudioRecorder())
  const [muted, setMuted] = useState(false)

  const { hasInteracted, recordInteraction } = useInteractionState({
    connected,
    isConnecting,
    streamStartTime,
  });

  const { isSendingMessage, startSending, stopSending } =
    useMessageSendingManager({ logs });

  const hasClearedLogsOnConnectRef = useRef(false); // <-- Thêm ref này


  const { handleSendMessage, handleStartVoice } = useInteractionHandlers({
    connected,
    connectWithPermissions,
    setMuted,
    client,
    log,
    startLoading: (sentLogIndex: number) => { // Pass startSending from the new hook
      startSending(sentLogIndex);
    },
    stopLoading: () => { // Pass stopSending from the new hook
      stopSending('direct send error');
    }
  })

  useEffect(() => {
    setLiveChatConnected(connected)
  }, [connected, setLiveChatConnected])

   useEffect(() => {
    if (connected) {
      if (!hasClearedLogsOnConnectRef.current) { // <-- Chỉ clear nếu chưa clear
        clearLogs();
        hasClearedLogsOnConnectRef.current = true; // <-- Đánh dấu đã clear
      }
      // Reset sending state if connection is re-established or established
      if (isSendingMessage) {
        stopSending('connection established/re-established');
      }
    } else {
      // Khi ngắt kết nối, reset lại cờ để lần kết nối sau sẽ clear log
      hasClearedLogsOnConnectRef.current = false;
    }
  }, [connected, isSendingMessage, clearLogs, stopSending]); // Thêm clearLogs, stopSending vào deps vì chúng được gọi


  // Core Hooks
  useLoggerScroll(loggerRef)
  useLoggerEvents(on, off, log)
  useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume)
  useModelAudioResponse(on, off, log)
  useVolumeControl(inVolume) // This likely controls the display of input volume

  const systemInstructions = getSystemInstructions(currentLanguageCode)

  // Determine connection status for UI
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

  return (
    <div className='relative flex h-full flex-col rounded-xl border-2 bg-white-pure shadow-inner'>
      <LiveChatAPIConfig
        outputModality={currentModality}
        selectedVoice={currentVoice}
        language={currentLanguageCode}
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
        micVolume={micVolume} // Pass the renamed micVolume
        onSendMessage={handleSendMessage}
        isSendingMessage={isSendingMessage}
      />
    </div>
  )
}