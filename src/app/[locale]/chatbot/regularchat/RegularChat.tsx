// src/app/[locale]/chatbot/regularchat/RegularChat.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';
import LoadingIndicator from './LoadingIndicator';
import ChatIntroductionDisplay from './ChatIntroduction';
import EmailConfirmationDialog from '../EmailConfirmationDialog';
import ConversationToolbar from './ConversationToolbar';
import { useTimer } from '@/src/hooks/chatbot/useTimer';
import { useTranslations } from 'next-intl';
import {
  useChatSettingsState, // This already imports from useSettingsStore via storeHooks
  useChatMessageState,
  useMessageActions,
  useSocketConnectionStatus,
  useUIState,
  useUIActions,
  useActiveConversationState,
  useConversationListState
} from '@/src/app/[locale]/chatbot/stores/storeHooks';
// Trực tiếp import useSettingsStore để lấy state mới
import { useSettingsStore } from '@/src/app/[locale]/chatbot/stores';


interface RegularChatProps {
  isSmallContext?: boolean;
}

function RegularChat({ isSmallContext = false }: RegularChatProps) {
  const t = useTranslations();

  const { currentLanguage, isStreamingEnabled } = useChatSettingsState(); // Lấy từ storeHook
  // Lấy state isConversationToolbarHiddenInFloatingChat trực tiếp từ useSettingsStore
  const isConversationToolbarHiddenInFloatingChat = useSettingsStore(
    state => state.isConversationToolbarHiddenInFloatingChat
  );


  const { chatMessages, loadingState: messageLoadingState } = useChatMessageState();
  const { sendMessage } = useMessageActions();

  const { isConnected, socketId } = useSocketConnectionStatus();

  const { showConfirmationDialog, confirmationData } = useUIState();
  const { handleConfirmSend, handleCancelSend, setShowConfirmationDialog } = useUIActions();

  const { activeConversationId } = useActiveConversationState();
  const { isLoadingHistory } = useConversationListState();

  const { timeCounter, startTimer, stopTimer } = useTimer();
  const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
  const [fillInputFunction, setFillInputFunction] = useState<
    ((text: string) => void) | null
  >(null);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current && !showConfirmationDialog) {
      setTimeout(() => {
        if (chatHistoryRef.current) {
          chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [chatMessages, showConfirmationDialog]);

  useEffect(() => {
    if (
      (!messageLoadingState.isLoading || showConfirmationDialog) &&
      timeCounter !== '0.0s'
    ) {
      stopTimer();
    }
  }, [messageLoadingState.isLoading, showConfirmationDialog, stopTimer, timeCounter]);

  const sendChatMessage = useCallback(
    async (userMessage: string) => {
      const trimmedMessage = userMessage.trim();
      if (!trimmedMessage) return;
      if (!isConnected) {
        console.warn('Attempted to send message while disconnected.');
        return;
      }
      if (!hasChatStarted) setHasChatStarted(true);
      startTimer();
      sendMessage(trimmedMessage);
    },
    [
      isConnected,
      hasChatStarted,
      startTimer,
      sendMessage,
    ]
  );

  const handleSetFillInput = useCallback((fillFunc: (text: string) => void) => {
    setFillInputFunction(() => fillFunc);
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (fillInputFunction) {
        fillInputFunction(suggestion);
      }
    },
    [fillInputFunction]
  );

  const showIntroduction =
    !activeConversationId && chatMessages.length === 0 && !isLoadingHistory;

  const handleDialogClose = useCallback(() => {
    setShowConfirmationDialog(false, null);
  }, [setShowConfirmationDialog]);

  // Điều kiện hiển thị toolbar
  const shouldShowToolbar = activeConversationId && (
    !isSmallContext || // Luôn hiển thị nếu không phải là small context (ví dụ: chat toàn trang)
    (isSmallContext && !isConversationToolbarHiddenInFloatingChat) // Nếu là small context, chỉ hiển thị nếu setting cho phép (không bị ẩn)
  );

  return (
    <div className='bg-white-pure relative mx-auto flex h-full w-full flex-col overflow-hidden border border-gray-200 shadow-lg dark:bg-gray-850 dark:border-gray-700'>
      <div className='flex-shrink-0 border-b border-gray-200 p-1.5 text-center dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex items-center justify-center space-x-1 text-xs text-gray-600 dark:text-gray-400'>
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
          ></span>
          <span>
            {isConnected ? t('Connected') : t('Disconnected')}{' '}
            <span className="hidden sm:inline">
              {socketId ? `(ID: ${socketId.substring(0, 5)}...)` : ''}
            </span>
          </span>
        </div>
      </div>

      {/* --- Conversation Toolbar --- */}
      {shouldShowToolbar && ( // <-- SỬ DỤNG ĐIỀU KIỆN MỚI
        <ConversationToolbar />
      )}

      <div
        ref={chatHistoryRef}
        className='flex-grow space-y-3 overflow-y-auto p-2 dark:bg-gray-800'
      >
        {showIntroduction && (
          <ChatIntroductionDisplay
            onSuggestionClick={handleSuggestionClick}
            language={currentLanguage.code}
          />
        )}
        <ChatHistory
          messages={chatMessages}
          isInsideSmallContainer={isSmallContext}
        />
      </div>

      {(messageLoadingState.isLoading || isLoadingHistory) &&
        !showConfirmationDialog && (
          <div className='flex-shrink-0 border-t border-gray-200  px-3 py-1.5 sm:px-4 sm:py-2 dark:border-gray-700 dark:bg-gray-800'>
            <LoadingIndicator
              step={isLoadingHistory ? 'loading_history' : messageLoadingState.step}
              message={
                isLoadingHistory
                  ? t('Loading_Chat_History')
                  : messageLoadingState.message
              }
              timeCounter={isLoadingHistory ? undefined : timeCounter}
            />
          </div>
        )}

      <div className='flex-shrink-0 border-t border-gray-200 p-1 sm:p-2 md:p-3 dark:border-gray-700 dark:bg-gray-800'>
        <ChatInput
          onSendMessage={sendChatMessage}
          disabled={
            messageLoadingState.isLoading ||
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
        onClose={handleDialogClose}
      />
    </div>
  );
}

export default RegularChat;