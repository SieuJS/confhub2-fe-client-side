// src/app/[locale]/chatbot/chat/RegularChat.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import ChatHistory from './regularchat/ChatHistory'
import ChatInput from './regularchat/ChatInput'
import LoadingIndicator from './regularchat/LoadingIndicator'
import ChatIntroductionDisplay from './regularchat/ChatIntroduction'
import EmailConfirmationDialog from './EmailConfirmationDialog'
import ConversationToolbar from './regularchat/ConversationToolbar' // <-- IMPORT TOOLBAR
import { useTimer } from '@/src/hooks/chatbot/useTimer'
import { useSharedChatSocket } from './context/ChatSocketContext'
import { Language } from './lib/live-chat.types'
import { useTranslations } from 'next-intl'

interface RegularChatProps {
  currentLanguage: Language
}

function RegularChat({ currentLanguage }: RegularChatProps) {
  const t = useTranslations()
  const { timeCounter, startTimer, stopTimer } = useTimer()
  const {
    chatMessages,
    loadingState,
    isConnected,
    sendMessage, // Đã có sendMessage từ context
    socketId,
    showConfirmationDialog,
    confirmationData,
    handleConfirmSend,
    handleCancelSend,
    closeConfirmationDialog,
    activeConversationId,
    isLoadingHistory,
    conversationList, // <-- LẤY conversationList TỪ CONTEXT
  } = useSharedChatSocket()

  const [hasChatStarted, setHasChatStarted] = useState<boolean>(false)
  const [fillInputFunction, setFillInputFunction] = useState<
    ((text: string) => void) | null
  >(null)
  const chatHistoryRef = useRef<HTMLDivElement>(null)
  const [isStreamingEnabled, setIsStreamingEnabled] = useState<boolean>(true)

  useEffect(() => {
    if (chatHistoryRef.current && !showConfirmationDialog) {
      setTimeout(() => {
        if (chatHistoryRef.current) {
          chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight
        }
      }, 100)
    }
  }, [chatMessages, showConfirmationDialog])

  useEffect(() => {
    if (
      (!loadingState.isLoading || showConfirmationDialog) &&
      timeCounter !== '0.0s'
    ) {
      stopTimer()
    }
  }, [loadingState.isLoading, showConfirmationDialog, stopTimer, timeCounter])

  const sendChatMessage = useCallback(
    async (userMessage: string) => {
      const trimmedMessage = userMessage.trim()
      if (!trimmedMessage) return
      if (!isConnected) {
        console.warn('Attempted to send message while disconnected.')
        return
      }
      if (!hasChatStarted) setHasChatStarted(true) // Không cần check activeConversationId ở đây nữa
      startTimer()
      sendMessage(trimmedMessage, isStreamingEnabled, currentLanguage)
    },
    [isConnected, hasChatStarted, startTimer, sendMessage, isStreamingEnabled, currentLanguage]
  )

  const handleSetFillInput = useCallback((fillFunc: (text: string) => void) => {
    setFillInputFunction(() => fillFunc)
  }, [])

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (fillInputFunction) {
        fillInputFunction(suggestion)
      }
    },
    [fillInputFunction]
  )

  const handleStreamingToggle = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIsStreamingEnabled(event.target.checked)
  }

  const showIntroduction =
    !activeConversationId && chatMessages.length === 0 && !isLoadingHistory

  return (
    <div className='relative mx-auto flex h-full w-full flex-col rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-black'>
      {/* Connection Status Header */}
      <div className='flex-shrink-0 border-b border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-900'>
        <div className='flex items-center justify-center space-x-1 text-center text-xs '>
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
          ></span>
          <span>
            {isConnected ? t('Connected') : t('Disconnected')}{' '}
            {socketId ? `(ID: ${socketId.substring(0, 5)}...)` : ''}
          </span>
        </div>
      </div>

      {/* --- CONVERSATION TOOLBAR --- */}
      {activeConversationId && ( // Chỉ hiển thị khi có conversation active
        <ConversationToolbar
          activeConversationId={activeConversationId}
          conversationList={conversationList}
        />
      )}
      {/* --------------------------- */}

      <div
        ref={chatHistoryRef}
        className='flex-grow space-y-4 overflow-y-auto bg-gray-50  p-4 dark:bg-gray-900 md:p-6'
      >
        {showIntroduction && (
          <ChatIntroductionDisplay
            onSuggestionClick={handleSuggestionClick}
            language={currentLanguage}
          />
        )}
        <ChatHistory messages={chatMessages} />
      </div>

      {(loadingState.isLoading || isLoadingHistory) &&
        !showConfirmationDialog && (
          <div className='flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-2   dark:border-gray-600 dark:bg-gray-900'>
            <LoadingIndicator
              step={isLoadingHistory ? 'loading_history' : loadingState.step}
              message={
                isLoadingHistory ? t('Loading_Chat_History') : loadingState.message
              }
              timeCounter={isLoadingHistory ? undefined : timeCounter}
            />
          </div>
        )}

      <div className='flex flex-shrink-0 items-center justify-end space-x-2 border-t border-gray-200 bg-gray-50 px-4 pb-1  pt-2 dark:border-gray-600 dark:bg-gray-900'>
        <label
          htmlFor='streaming-toggle'
          className={`text-sm  ${loadingState.isLoading || showConfirmationDialog ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          {t('Stream_Response')}:
        </label>
        <input
          type='checkbox'
          id='streaming-toggle'
          checked={isStreamingEnabled}
          onChange={handleStreamingToggle}
          className={`form-checkbox h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${loadingState.isLoading || showConfirmationDialog ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={
            loadingState.isLoading || showConfirmationDialog || isLoadingHistory
          }
        />
      </div>

      <div className='flex-shrink-0 border-t border-gray-200 bg-gray-50  p-3 pt-2  dark:border-gray-600 dark:bg-gray-900 md:p-4'>
        <ChatInput
          onSendMessage={sendChatMessage}
          disabled={
            loadingState.isLoading ||
            !isConnected ||
            showConfirmationDialog ||
            isLoadingHistory
          }
          onRegisterFillFunction={handleSetFillInput}
        />
      </div>

      <EmailConfirmationDialog
        isOpen={showConfirmationDialog}
        data={confirmationData}
        onConfirm={handleConfirmSend}
        onCancel={handleCancelSend}
        onClose={closeConfirmationDialog}
      />
    </div>
  )
}

export default RegularChat