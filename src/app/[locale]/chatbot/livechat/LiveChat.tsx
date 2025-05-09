// src/components/chatbot/LiveChatExperience.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLiveAPIContext } from './contexts/LiveAPIContext' // Giả sử path này đúng
import {
  isServerContentMessage,
  isModelTurn,
  isTurnComplete,
  isInterrupted
} from './multimodal-live-types' // Giả sử path này đúng
import { useLoggerStore } from './lib/store-logger' // Giả sử path này đúng
import Logger from './logger/Logger' // Giả sử path này đúng
import ChatInput from './main-layout/ChatInput' // Giả sử path này đúng
import ConnectionButton from './main-layout/ConnectionButton' // Giả sử path này đúng
import MicButton from './main-layout/MicButton' // Giả sử path này đúng
import ChatIntroduction from './main-layout/ChatIntroduction' // Giả sử path này đúng
import ConnectionStatus from './main-layout/ConnectionStatus' // Giả sử path này đúng
import RestartStreamButton from './main-layout/RestartStreamButton' // Giả sử path này đúng
import { LiveChatAPIConfig } from './LiveChatAPIConfig' // Giả sử path này đúng

// Hooks
import useConnection from './hooks/useConnection' // Giả sử path này đúng
import useTimer from './hooks/useTimer' // Giả sử path này đúng
import useLoggerScroll from './hooks/useLoggerScroll' // Giả sử path này đúng
import useLoggerEvents from './hooks/useLoggerEvents' // Giả sử path này đúng
import useAudioRecorder from './hooks/useAudioRecorder' // Giả sử path này đúng
import useModelAudioResponse from './hooks/useModelAudioResponse' // Giả sử path này đúng
import useVolumeControl from './hooks/useVolumeControl' // Giả sử path này đúng
import useInteractionHandlers from './hooks/useInteractionHandlers' // Giả sử path này đúng

// Types and Constants
import { getSystemInstructions } from '../lib/instructions' // Đảm bảo path đúng
import { AudioRecorder } from './lib/audio-recorder' // Giả sử path này đúng
import { useTranslations } from 'next-intl'

// --- THAY ĐỔI QUAN TRỌNG ---
import { useLiveChatSettings } from '../context/LiveChatSettingsContext' // Context này cho modality, voice
// --- IMPORT STORE MỚI ---
import { useChatSettingsState } from '@/src/app/[locale]/chatbot/stores/storeHooks'; // Hoặc import trực tiếp từ settingsStore

export default function LiveChatExperience() {
  // Lấy modality và voice từ LiveChatSettingsContext
  const {
    currentModality,
    currentVoice,
  } = useLiveChatSettings()

  // --- LẤY currentLanguage TỪ SettingsStore ---
  const { currentLanguage: currentLanguageOptionFromStore } = useChatSettingsState();
  // Trích xuất language code ('en', 'vi', 'zh')
  const currentLanguageCode = currentLanguageOptionFromStore.code;

  const t = useTranslations()

  // --- Connection & Timer Hooks ---
  const {
    connected,
    isConnecting,
    streamStartTime,
    connectionStatusMessage,
    connectWithPermissions,
    handleDisconnect,
    handleReconnect,
    error: connectionError
  } = useConnection() // Hook này có thể cần xem xét nếu nó phụ thuộc vào ngôn ngữ hoặc các cài đặt toàn cục

  const { elapsedTime, showTimer, handleCloseTimer } = useTimer(
    isConnecting,
    connected,
    streamStartTime
  )

  // --- Context and Store Hooks ---
  const { client, volume, on, off /*, setConfig */ } = useLiveAPIContext() // setConfig có thể không dùng nữa nếu config qua LiveChatAPIConfig
  const { log, clearLogs, logs } = useLoggerStore()

  // --- State ---
  const loggerRef = useRef<HTMLDivElement>(null)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const lastSentLogIndexRef = useRef<number | null>(null)
  const [inVolume, setInVolume] = useState(0)
  const [audioRecorder] = useState(() => new AudioRecorder()) // Khởi tạo AudioRecorder
  const [muted, setMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // --- Interaction Handlers Hook ---
  const { handleSendMessage, handleStartVoice } = useInteractionHandlers({
    connected,
    connectWithPermissions,
    setMuted,
    client,
    log,
    startLoading: (sentLogIndex: number) => {
      setIsSendingMessage(true)
      lastSentLogIndexRef.current = sentLogIndex
    },
    stopLoading: () => {
      setIsSendingMessage(false)
      lastSentLogIndexRef.current = null
    }
  })

  // --- Effects ---
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

  useEffect(() => {
    if (!isSendingMessage || lastSentLogIndexRef.current === null) {
      return
    }
    const startIndexToCheck = lastSentLogIndexRef.current + 1
    for (let i = startIndexToCheck; i < logs.length; i++) {
      const currentLog = logs[i]
      if (!currentLog?.message) {
        continue
      }
      if (isServerContentMessage(currentLog.message)) {
        const { serverContent } = currentLog.message
        if (
          isModelTurn(serverContent) ||
          isTurnComplete(serverContent) ||
          isInterrupted(serverContent)
        ) {
          setIsSendingMessage(false)
          lastSentLogIndexRef.current = null
          return
        }
      }
      // Dòng này có thể quá chung chung, cần xem xét lại logic `isSendingMessage`
      // else if (currentLog.type?.startsWith('receive.')) {
      //   setIsSendingMessage(false)
      //   lastSentLogIndexRef.current = null
      //   return
      // }
    }
  }, [logs, isSendingMessage /*, setIsSendingMessage */]) // Bỏ setIsSendingMessage nếu không cần thiết

  // --- Other Hooks ---
  useLoggerScroll(loggerRef)
  useLoggerEvents(on, off, log)
  useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume) // audioRecorder đã được khởi tạo
  useModelAudioResponse(on, off, log)
  useVolumeControl(inVolume)

  // --- Determine System Instructions ---
  // Sử dụng currentLanguageCode ('en', 'vi', 'zh')
  const systemInstructions = getSystemInstructions(currentLanguageCode)

  // --- Connection Status Display Logic ---
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
    <div className='bg-white-pure relative flex h-full flex-col rounded-xl border-2 shadow-inner '>
      {/* LiveChatAPIConfig sẽ được client API đọc để cấu hình stream */}
      <LiveChatAPIConfig
        outputModality={currentModality}
        selectedVoice={currentVoice}
        language={currentLanguageCode} // <--- TRUYỀN LANGUAGE CODE TỪ SettingsStore
        systemInstructions={systemInstructions} // systemInstructions dựa trên language code
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
          <ChatIntroduction // Component này có thể cần currentLanguageCode nếu có logic hiển thị dựa trên ngôn ngữ
            onStartVoice={() => {
              handleStartVoice()
              setHasInteracted(true)
            }}
          />
        ) : (
          <Logger filter='none' />
        )}
      </div>

      <div className='border-gray-20 bg-gray-10 m-4 flex items-center gap-2 rounded-full border p-1.5  '>
        <ConnectionButton
          connected={connected}
          connect={connectWithPermissions}
          disconnect={handleDisconnect}
          isConnecting={isConnecting}
        />
        <MicButton
          muted={muted}
          setMuted={setMuted}
          volume={volume} // volume từ useLiveAPIContext
          connected={connected}
        />
        <div className='flex-grow'>
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!connected || isSendingMessage} // Cập nhật logic disabled
            isLoading={isSendingMessage}
          />
        </div>
      </div>
    </div>
  )
}