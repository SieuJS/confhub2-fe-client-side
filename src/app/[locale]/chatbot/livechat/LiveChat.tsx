// // src/components/chatbot/LiveChatExperience.tsx (Sử dụng phương tức A2A)
// 'use client';

// import React, { useState, useRef, useEffect } from 'react';

// // --- Import Namespace for LiveChat specific items ---
// import * as LiveChat from './livechat/index'; // Import từ index của livechat

// // --- Keep imports from outside ./livechat ---
// import { LiveChatAPIConfig } from './LiveChatAPIConfig'; // Component con
// import { OutputModality, PrebuiltVoice, Language } from './lib/live-chat.types'; // Các type chung

// // --- KHÔNG cần import getSystemInstructions nữa ---
// // import { getSystemInstructions } from './lib/instructions';

// // --- Props Interface ---
// interface LiveChatExperienceProps {
//     currentModality: OutputModality;
//     currentVoice: PrebuiltVoice;
//     currentLanguage: Language; // Vẫn cần ngôn ngữ hiện tại
// }

// export default function LiveChatExperience({
//     currentModality,
//     currentVoice,
//     currentLanguage, // Giữ lại prop này
// }: LiveChatExperienceProps) {

//     // --- Hooks (Connection, Timer, Context, Store) ---
//     const {
//         connected, isConnecting, streamStartTime, connectionStatusMessage,
//         connectWithPermissions, handleDisconnect, handleReconnect, error: connectionError,
//     } = LiveChat.useConnection();
//     const { elapsedTime, showTimer, handleCloseTimer } = LiveChat.useTimer(isConnecting, connected, streamStartTime);
//     const { client, volume, on, off, setConfig } = LiveChat.useLiveAPIContext();
//     const { log, clearLogs, logs } = LiveChat.useLoggerStore();

//     // --- State ---
//     const loggerRef = useRef<HTMLDivElement>(null);
//     const [isSendingMessage, setIsSendingMessage] = useState(false);
//     const lastSentLogIndexRef = useRef<number | null>(null);
//     const [inVolume, setInVolume] = useState(0);
//     const [audioRecorder] = useState(() => new LiveChat.AudioRecorder());
//     const [muted, setMuted] = useState(false);
//     const [hasInteracted, setHasInteracted] = useState(false);

//     // --- Hook Interaction Handlers ---
//     const { handleSendMessage, handleStartVoice } = LiveChat.useInteractionHandlers({
//         connected, connectWithPermissions, setMuted, client, log,
//         startLoading: (sentLogIndex: number) => { setIsSendingMessage(true); lastSentLogIndexRef.current = sentLogIndex; },
//         stopLoading: () => { setIsSendingMessage(false); lastSentLogIndexRef.current = null; },
//     });

//     // --- Effects ---
//     useEffect(() => {
//         if (connected) { clearLogs(); setIsSendingMessage(false); lastSentLogIndexRef.current = null; }
//     }, [connected, clearLogs]);
//     useEffect(() => { if (connected || isConnecting || streamStartTime !== null) { setHasInteracted(true); } }, [connected, isConnecting, streamStartTime]);
//     useEffect(() => { // Effect xử lý loading state (giữ nguyên)
//         if (!isSendingMessage || lastSentLogIndexRef.current === null) return;
//         const startIndexToCheck = lastSentLogIndexRef.current + 1;
//         for (let i = startIndexToCheck; i < logs.length; i++) {
//             const currentLog = logs[i];
//             if (!currentLog?.message) continue;
//             if (LiveChat.isServerContentMessage(currentLog.message)) {
//                 const { serverContent } = currentLog.message;
//                 if (LiveChat.isModelTurn(serverContent) || LiveChat.isTurnComplete(serverContent) || LiveChat.isInterrupted(serverContent)) {
//                     setIsSendingMessage(false); lastSentLogIndexRef.current = null; return;
//                 }
//             } else if (currentLog.type?.startsWith("receive.")) {
//                 setIsSendingMessage(false); lastSentLogIndexRef.current = null; return;
//             }
//         }
//     }, [logs, isSendingMessage, setIsSendingMessage]);

//     // --- Other Hooks ---
//     LiveChat.useLoggerScroll(loggerRef);
//     LiveChat.useLoggerEvents(on, off, log);
//     LiveChat.useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume);
//     LiveChat.useModelAudioResponse(on, off, log);
//     LiveChat.useVolumeControl(inVolume);

//     // --- KHÔNG cần lấy systemInstructions ở đây nữa ---
//     // const systemInstructions = getSystemInstructions(currentLanguage);

//     // --- Connection Status Display Logic (giữ nguyên) ---
//     let connectionStatusType: 'connected' | 'error' | 'info' | 'connecting' = 'info';
//     if (isConnecting) connectionStatusType = 'connecting';
//     else if (connected) connectionStatusType = 'connected';
//     else if (connectionStatusMessage || connectionError) connectionStatusType = streamStartTime !== null ? 'error' : 'info';
//     const effectiveStatusMessage = connectionStatusMessage || connectionError?.message || null;
//     const shouldShowExternalStatus = showTimer || (effectiveStatusMessage && connectionStatusType !== 'connected');
//     const shouldShowRestartButton = connectionStatusType === 'error';

//     return (
//         <div className='relative flex h-full flex-col bg-white shadow-inner rounded-xl border-2'>

//             {/* Truyền các props cần thiết, KHÔNG cần hostAgentSystemInstructions */}
//             <LiveChatAPIConfig
//                 outputModality={currentModality}
//                 selectedVoice={currentVoice}
//                 language={currentLanguage} // Chỉ cần truyền ngôn ngữ

//             />

//             {/* Phần còn lại của JSX giữ nguyên */}
//             {shouldShowExternalStatus && (
//                 <div className='z-10'>
//                     <LiveChat.ConnectionStatus
//                         status={connectionStatusType} message={effectiveStatusMessage}
//                         elapsedTime={connectionStatusType === 'connected' ? elapsedTime : undefined}
//                         onClose={handleCloseTimer} />
//                 </div>
//             )}
//             {shouldShowRestartButton && (
//                 <div className='absolute bottom-20 left-1/2 z-10 -translate-x-1/2 transform px-4'>
//                     <LiveChat.RestartStreamButton onRestart={handleReconnect} />
//                 </div>
//             )}
//             <div className="flex-grow overflow-y-auto p-4" ref={loggerRef}>
//                 {!connected && !hasInteracted ? (
//                     <LiveChat.ChatIntroduction onStartVoice={() => { handleStartVoice(); setHasInteracted(true); }} />
//                 ) : (
//                     <LiveChat.Logger filter="none" />
//                 )}
//             </div>
//             <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 p-1.5 m-4">
//                 <LiveChat.ConnectionButton connected={connected} connect={connectWithPermissions} disconnect={handleDisconnect} isConnecting={isConnecting} />
//                 <LiveChat.MicButton muted={muted} setMuted={setMuted} volume={volume} connected={connected} />
//                 <div className="flex-grow">
//                     <LiveChat.ChatInput onSendMessage={handleSendMessage} disabled={!connected} isLoading={isSendingMessage} />
//                 </div>
//             </div>
//         </div>
//     );
// }

// src/components/chatbot/LiveChatExperience.tsx (Sử dụng phương thức cũ , không dùng A2A)

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLiveAPIContext } from './contexts/LiveAPIContext'
// Import isServerContentMessage and related types from where they are defined
import {
  isServerContentMessage,
  isModelTurn,
  isTurnComplete,
  isInterrupted
} from './multimodal-live-types'
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
import { useChatSettings } from '../context/ChatSettingsContext'

export default function LiveChatExperience() {
  const {
    currentModality,
    currentVoice,
    currentLanguage
    // Có thể bạn cũng cần các setter nếu LiveChatExperience thay đổi chúng trực tiếp
    // setCurrentModality, setCurrentVoice, setCurrentLanguage
  } = useChatSettings()

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
  } = useConnection()

  const { elapsedTime, showTimer, handleCloseTimer } = useTimer(
    isConnecting,
    connected,
    streamStartTime
  )

  // --- Context and Store Hooks ---
  const { client, volume, on, off, setConfig } = useLiveAPIContext()
  const { log, clearLogs, logs } = useLoggerStore() // <-- Get logs array from store

  // --- State ---
  const loggerRef = useRef<HTMLDivElement>(null)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  // *** Ref to store the index of the log we are waiting for a response to ***
  const lastSentLogIndexRef = useRef<number | null>(null)
  const [inVolume, setInVolume] = useState(0) // Keep other state
  const [audioRecorder] = useState(() => new AudioRecorder())
  const [muted, setMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  // --- Interaction Handlers Hook ---
  const { handleSendMessage, handleStartVoice } = useInteractionHandlers({
    connected,
    connectWithPermissions,
    setMuted,
    client,
    log,
    // *** Pass specific functions for loading state ***
    startLoading: (sentLogIndex: number) => {
      setIsSendingMessage(true)
      lastSentLogIndexRef.current = sentLogIndex // Store the index
      console.log(
        `[startLoading Callback] Set isSending=true, lastSentLogIndex=${sentLogIndex}`
      )
    },
    stopLoading: () => {
      setIsSendingMessage(false)
      lastSentLogIndexRef.current = null // Reset index on explicit stop (e.g., error)
      console.log(
        '[stopLoading Callback] Set isSending=false, lastSentLogIndex=null'
      )
    }
  })

  // --- Effects ---
  useEffect(() => {
    if (connected) {
      clearLogs()
      setIsSendingMessage(false) // Reset loading on connect/clear
      lastSentLogIndexRef.current = null
    }
  }, [connected, clearLogs])
  useEffect(() => {
    if (connected || isConnecting || streamStartTime !== null) {
      setHasInteracted(true)
    }
  }, [connected, isConnecting, streamStartTime])

  // *** Modified Effect to watch logs based on index ***
  useEffect(() => {
    // Only run if we are loading AND have a valid index to check against
    if (!isSendingMessage || lastSentLogIndexRef.current === null) {
      // console.log(`[LogEffect] Skipping. isSending: ${isSendingMessage}, lastSentIndex: ${lastSentLogIndexRef.current}`);
      return
    }

    const startIndexToCheck = lastSentLogIndexRef.current + 1
    console.log(
      `[LogEffect] Running. isSending: ${isSendingMessage}, checking logs from index ${startIndexToCheck}`
    )

    // Check logs that appeared *after* the sent message log
    for (let i = startIndexToCheck; i < logs.length; i++) {
      const currentLog = logs[i]

      // console.log(`[LogEffect] Checking log at index ${i}:`, currentLog?.type);

      // Basic check: ensure log and message exist
      if (!currentLog?.message) {
        continue
      }

      // Check for relevant server response types
      if (isServerContentMessage(currentLog.message)) {
        const { serverContent } = currentLog.message
        if (
          isModelTurn(serverContent) ||
          isTurnComplete(serverContent) ||
          isInterrupted(serverContent)
        ) {
          console.log(
            `[LogEffect] Found relevant ServerContentMessage at index ${i}. Stopping loading.`
          )
          setIsSendingMessage(false)
          lastSentLogIndexRef.current = null // Reset ref as we found the response
          return // Exit effect processing once response is found
        }
      }
      // Add checks for other relevant server message types if needed (e.g., 'receive.audio')
      else if (currentLog.type?.startsWith('receive.')) {
        console.log(
          `[LogEffect] Found other server message type '${currentLog.type}' at index ${i}. Stopping loading.`
        )
        setIsSendingMessage(false)
        lastSentLogIndexRef.current = null // Reset ref
        return // Exit effect processing
      }
    }
    console.log(
      `[LogEffect] No relevant server response found yet after index ${lastSentLogIndexRef.current}. Still waiting.`
    )

    // Depend on logs and the loading state itself.
    // Do NOT depend on lastSentLogIndexRef.current directly as it's a ref.
  }, [logs, isSendingMessage, setIsSendingMessage]) // Keep setIsSendingMessage for linting if needed

  // --- Other Hooks ---
  useLoggerScroll(loggerRef)
  useLoggerEvents(on, off, log)
  useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume)
  useModelAudioResponse(on, off, log)
  useVolumeControl(inVolume)

  // --- Determine System Instructions ---
  const systemInstructions = getSystemInstructions(currentLanguage)

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
      <LiveChatAPIConfig
        outputModality={currentModality}
        selectedVoice={currentVoice}
        language={currentLanguage}
        systemInstructions={systemInstructions}
      />

      {shouldShowExternalStatus && (
        <div className='z-10'>
          {' '}
          {/* Giữ lại z-index nếu cần */}
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
          volume={volume}
          connected={connected}
        />
        <div className='flex-grow'>
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!connected}
            isLoading={isSendingMessage} // Truyền trạng thái loading
          />
        </div>
      </div>
    </div>
  )
}
