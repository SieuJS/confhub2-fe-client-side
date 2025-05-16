// src/app/[locale]/chatbot/livechat/layout/ChatStatusDisplay.tsx
import React from 'react';
import ConnectionStatus, { ConnectionStatusProps } from './ConnectionStatus'; // ConnectionStatusProps now correctly defines elapsedTime as number
import RestartStreamButton from './RestartStreamButton';

interface ChatStatusDisplayProps {
  statusType: ConnectionStatusProps['status'];
  statusMessage: string | null;
  elapsedTime?: number; // <-- CORRECTED: Changed from string to number
  onCloseTimer: () => void;
  showRestartButton: boolean;
  onRestartStream: () => void;
  showExternalStatus: boolean;
}

export default function ChatStatusDisplay({
  statusType,
  statusMessage,
  elapsedTime, // This is now number | undefined
  onCloseTimer,
  showRestartButton,
  onRestartStream,
  showExternalStatus,
}: ChatStatusDisplayProps) {
  if (!showExternalStatus && !showRestartButton) {
    return null;
  }

  return (
    <>
      {showExternalStatus && (
        <div className='z-10'>
          <ConnectionStatus
            status={statusType}
            message={statusMessage}
            // elapsedTime is now correctly passed as number | undefined
            elapsedTime={statusType === 'connected' ? elapsedTime : undefined}
            onClose={onCloseTimer}
          />
        </div>
      )}
      {showRestartButton && (
        <div className='absolute bottom-20 left-1/2 z-10 -translate-x-1/2 transform px-4'>
          <RestartStreamButton onRestart={onRestartStream} />
        </div>
      )}
    </>
  );
}