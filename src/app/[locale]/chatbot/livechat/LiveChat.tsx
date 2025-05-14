// src/app/[locale]/chatbot/livechat/LiveChat.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLiveAPIContext } from './contexts/LiveAPIContext'
import {
  isServerContentMessage,
  isModelTurn,
  isTurnComplete,
  isInterrupted,
  isServerAudioMessage // <--- IMPORT THIS
} from './multimodal-live-types' // <--- Ensure this path is correct
import { useLoggerStore } from './lib/store-logger'
import Logger from './logger/Logger'
import ChatInput from './main-layout/ChatInput'
import ConnectionButton from './main-layout/ConnectionButton'
import MicButton from './main-layout/MicButton'
import ChatIntroduction from './main-layout/ChatIntroduction'
import ConnectionStatus from './main-layout/ConnectionStatus'
import RestartStreamButton from './main-layout/RestartStreamButton'
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

// Types and Constants
import { getSystemInstructions } from '../lib/instructions'
import { AudioRecorder } from './lib/audio-recorder'
import { useTranslations } from 'next-intl'

// --- THAY ĐỔI QUAN TRỌNG ---
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

  const t = useTranslations()

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

  const { client, volume, on, off } = useLiveAPIContext()
  const { log, clearLogs, logs } = useLoggerStore()

  const loggerRef = useRef<HTMLDivElement>(null)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const lastSentLogIndexRef = useRef<number | null>(null)
  const [inVolume, setInVolume] = useState(0)
  const [audioRecorder] = useState(() => new AudioRecorder())
  const [muted, setMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  const { handleSendMessage, handleStartVoice } = useInteractionHandlers({
    connected,
    connectWithPermissions,
    setMuted,
    client,
    log,
    startLoading: (sentLogIndex: number) => {
      console.log(`[LiveChat] startLoading called. Index: ${sentLogIndex}`);
      setIsSendingMessage(true)
      lastSentLogIndexRef.current = sentLogIndex
    },
    stopLoading: () => { // This is for direct send errors
      console.log(`[LiveChat] stopLoading (direct error) called.`);
      setIsSendingMessage(false)
      lastSentLogIndexRef.current = null
    }
  })

  useEffect(() => {
    setLiveChatConnected(connected)
  }, [connected, setLiveChatConnected])

  useEffect(() => {
    if (connected) {
      clearLogs()
      setIsSendingMessage(false)
      lastSentLogIndexRef.current = null
    }
  }, [connected, clearLogs])

  useEffect(() => {
    if (connected || isConnecting || streamStartTime !== null) {
      setHasInteracted(true)
    }
  }, [connected, isConnecting, streamStartTime])

  // EFFECT TO STOP LOADING BASED ON SERVER RESPONSE
  useEffect(() => {
    if (!isSendingMessage || lastSentLogIndexRef.current === null) {
      // console.log("[useEffect-StopLoading] Not sending or no lastSentLogIndex. Bailing.");
      return
    }

    // console.log(`[useEffect-StopLoading] Checking logs. isSending: ${isSendingMessage}, lastSentIndex: ${lastSentLogIndexRef.current}, logs.length: ${logs.length}`);

    const startIndexToCheck = lastSentLogIndexRef.current + 1
    for (let i = startIndexToCheck; i < logs.length; i++) {
      const currentLog = logs[i]
      // console.log(`[useEffect-StopLoading] Checking log at index ${i}, type: ${currentLog?.type}`);

      if (!currentLog?.message) {
        // console.log(`[useEffect-StopLoading] Log at index ${i} has no message. Skipping.`);
        continue
      }

      let shouldStopLoading = false;

      if (isServerContentMessage(currentLog.message)) {
        const { serverContent } = currentLog.message
        // console.log(`[useEffect-StopLoading] Log at index ${i} is ServerContentMessage. Content:`, serverContent);
        if (
          isModelTurn(serverContent) ||
          isTurnComplete(serverContent) ||
          isInterrupted(serverContent)
        ) {
          console.log(`[useEffect-StopLoading] ServerContent (text/turn/interrupted) received. Log type: ${currentLog.type}. Stopping loading.`);
          shouldStopLoading = true;
        }
      } else if (isServerAudioMessage(currentLog.message)) { // <--- ADD THIS CHECK
        // console.log(`[useEffect-StopLoading] Log at index ${i} is ServerAudioMessage. Log type: ${currentLog.type}. Content:`, currentLog.message);
        console.log(`[useEffect-StopLoading] ServerAudio received. Log type: ${currentLog.type}. Stopping loading.`);
        shouldStopLoading = true;
      }
      // You could add more checks here for other message types if needed, e.g., ToolCallMessage, etc.
      // depending on whether those should also stop the input loading.

      if (shouldStopLoading) {
        setIsSendingMessage(false)
        lastSentLogIndexRef.current = null
        // console.log("[useEffect-StopLoading] Loading stopped.");
        return // Exit the loop and effect once loading is stopped
      }
    }
  }, [logs, isSendingMessage]) // Dependencies: logs and isSendingMessage

  useLoggerScroll(loggerRef)
  useLoggerEvents(on, off, log) // This logs various incoming messages, including ServerContent and potentially ServerAudio via other means
  useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume)
  useModelAudioResponse(on, off, log) // This hook specifically listens for and logs 'server.audio' (ServerAudioMessage)
  useVolumeControl(inVolume)

  const systemInstructions = getSystemInstructions(currentLanguageCode)

  let connectionStatusType: 'connected' | 'error' | 'info' | 'connecting' =
    'info'
  if (isConnecting) connectionStatusType = 'connecting'
  else if (connected) connectionStatusType = 'connected'
  else if (connectionStatusMessage || connectionError)
    connectionStatusType = streamStartTime !== null ? 'error' : 'info'

  const effectiveStatusMessage =
    connectionStatusMessage || connectionError?.message || null
  const shouldShowExternalStatus =
    showTimer ||
    (effectiveStatusMessage && connectionStatusType !== 'connected')
  const shouldShowRestartButton = connectionStatusType === 'error'

  return (
    <div className='relative flex h-full flex-col rounded-xl border-2 bg-white-pure shadow-inner '>
      <LiveChatAPIConfig
        outputModality={currentModality}
        selectedVoice={currentVoice}
        language={currentLanguageCode}
        systemInstructions={systemInstructions}
      />

      {shouldShowExternalStatus && (
        <div className='z-10'>
          <ConnectionStatus
            status={connectionStatusType}
            message={effectiveStatusMessage}
            elapsedTime={
              connectionStatusType === 'connected' ? elapsedTime : undefined
            }
            onClose={handleCloseTimer}
          />
        </div>
      )}

      {shouldShowRestartButton && (
        <div className='absolute bottom-20 left-1/2 z-10 -translate-x-1/2 transform px-4'>
          <RestartStreamButton onRestart={handleReconnect} />
        </div>
      )}

      <div className='flex-grow overflow-y-auto p-4' ref={loggerRef}>
        {!connected && !hasInteracted ? (
          <ChatIntroduction
            onStartVoice={() => {
              handleStartVoice()
              setHasInteracted(true)
            }}
          />
        ) : (
          <Logger filter='none' />
        )}
      </div>

      <div className='m-4 flex items-center gap-2 rounded-full border border-gray-20 bg-gray-10 p-1  '>
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
        <div className='flex-grow'>
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!connected || isSendingMessage}
            isLoading={isSendingMessage}
          />
        </div>
      </div>
    </div>
  )
}