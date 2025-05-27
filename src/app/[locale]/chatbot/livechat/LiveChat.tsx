// src/app/[locale]/chatbot/livechat/LiveChat.tsx
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useLiveAPIContext } from './contexts/LiveAPIContext'
import { useLoggerStore } from './lib/store-logger'
import { LiveChatAPIConfig } from './LiveChatAPIConfig'

// Hooks
import useConnection from './hooks/useConnection' // Hook này giờ không nhận props
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
import { Language as AppLanguage } from '../lib/live-chat.types';

// Contexts and Stores
import { useLiveChatSettings } from './contexts/LiveChatSettingsContext'
import { useChatSettingsState } from '@/src/app/[locale]/chatbot/stores/storeHooks';

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
    // session,
    // appConfig,
    // setConfig,
    // sdkConnected,
    // sdkIsConnecting,
    // sdkConnect,
    // sdkDisconnect,
    volume, // SỬA Ở ĐÂY: Sử dụng tên gốc 'volume'
    on,
    off,
    sendClientContent,
    sendRealtimeInput,
  } = useLiveAPIContext();

  // SỬA Ở ĐÂY: Gọi useConnection() không có đối số
  const {
    connected,
    isConnecting,
    streamStartTime,
    connectionStatusMessage,
    connectWithPermissions,
    handleDisconnect,
    handleReconnect,
    error: connectionError
  } = useConnection(); // Hook useConnection sẽ tự lấy các giá trị từ useLiveAPIContext

  const { elapsedTime, showTimer, handleCloseTimer } = useTimer(
    isConnecting,
    connected,
    streamStartTime
  );

  const { log, clearLogs, logs } = useLoggerStore();

  const loggerRef = useRef<HTMLDivElement>(null);
  const [inputMicVolume, setInputMicVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);

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
    sendClientContent, // Truyền hàm này vào
    log,
    startLoading: startSending,
    stopLoading: () => stopSending('direct send error'),
  });

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
  useLoggerEvents(on, off, log);
  useModelAudioResponse(on, off, log);
  useAudioRecorder(
    connected,
    muted,
    audioRecorder,
    sendRealtimeInput,
    log,
    setInputMicVolume
  );
  // Truyền 'volume' (là modelOutputVolume) vào useVolumeControl
  useVolumeControl(volume); // 'volume' ở đây chính là âm lượng đầu ra của model

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
    handleStartVoice();
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
        micVolume={inputMicVolume}
        onSendMessage={handleSendMessage}
        isSendingMessage={isSendingMessage}
      />
    </div>
  );
}