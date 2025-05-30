// src/app/[locale]/chatbot/livechat/layout/ChatInputBar.tsx
import React from 'react'
import ConnectionButton from './ConnectionButton'
import MicButton from './MicButton'
import ChatInput from './ChatInput'

interface ChatInputBarProps {
  connected: boolean
  isConnecting: boolean
  connect: () => void
  disconnect: () => void
  muted: boolean
  setMuted: (muted: boolean) => void
  micVolume: number // Đây là userMicVolume
  modelVolume: number // Thêm prop cho model volume
  onSendMessage: (message: string) => void
  isSendingMessage: boolean
}

export default function ChatInputBar({
  connected,
  isConnecting,
  connect,
  disconnect,
  muted,
  setMuted,
  micVolume,    // userMicVolume
  modelVolume,  // modelOutputVolume
  onSendMessage,
  isSendingMessage
}: ChatInputBarProps) {
  return (
    <div className='m-4 flex items-center gap-2 rounded-full border border-gray-20 bg-gray-10 p-1'>
      <ConnectionButton
        connected={connected}
        connect={connect}
        disconnect={disconnect}
        isConnecting={isConnecting}
      />
      <MicButton
        muted={muted}
        setMuted={setMuted}
        userMicVolume={micVolume}       // Truyền userMicVolume
        modelOutputVolume={modelVolume} // Truyền modelOutputVolume
        connected={connected}
      />
      <div className='flex-grow'>
        <ChatInput
          onSendMessage={onSendMessage}
          disabled={!connected || isSendingMessage}
          isLoading={isSendingMessage}
        />
      </div>
    </div>
  )
}
