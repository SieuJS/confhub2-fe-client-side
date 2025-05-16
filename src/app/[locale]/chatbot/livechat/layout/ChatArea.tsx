// src/app/[locale]/chatbot/livechat/layout/ChatArea.tsx
import React from 'react';
import ChatIntroduction from './ChatIntroduction';
import Logger from '../logger/Logger';

interface ChatAreaProps {
  connected: boolean;
  hasInteracted: boolean;
  onStartVoice: () => void;
  loggerRef: React.RefObject<HTMLDivElement>;
}

export default function ChatArea({
  connected,
  hasInteracted,
  onStartVoice,
  loggerRef,
}: ChatAreaProps) {
  return (
    <div className='flex-grow overflow-y-auto p-4' ref={loggerRef}>
      {!connected && !hasInteracted ? (
        <ChatIntroduction onStartVoice={onStartVoice} />
      ) : (
        <Logger filter='none' />
      )}
    </div>
  );
}