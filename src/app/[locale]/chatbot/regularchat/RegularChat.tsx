// src/app/[locale]/chatbot/regularchat/RegularChat.tsx
'use client'

import React, { useState, useCallback, useEffect } from 'react';
import ChatInput from './ChatInput';
import LoadingIndicator from './LoadingIndicator';
import EmailConfirmationDialog from '../EmailConfirmationDialog';
import ConversationToolbar from './ConversationToolbar';
import ChatArea from './ChatArea'; // Component con mới
import { useTimer } from '@/src/hooks/regularchat/useTimer';
import { useChatInteractions } from '@/src/hooks/regularchat/useChatInteractions'; // Hook mới
import { useTranslations } from 'next-intl';
import {
  useChatSettingsState,
  useChatMessageState,
  useSocketConnectionStatus,
  useUIState,
  useUIActions,
  useActiveConversationState,
  useConversationListState,
} from '@/src/app/[locale]/chatbot/stores/storeHooks';
import { useSettingsStore } from '@/src/app/[locale]/chatbot/stores';
import { useMessageStore } from '@/src/app/[locale]/chatbot/stores/messageStore'; // << IMPORT TRỰC TIẾP useMessageStore

interface RegularChatProps {
  isSmallContext?: boolean;
}

function RegularChat({ isSmallContext = false }: RegularChatProps) {
  const t = useTranslations();

  // --- Lấy state từ các store ---
  const { currentLanguage } = useChatSettingsState();
  const isConversationToolbarHiddenInFloatingChat = useSettingsStore(
    state => state.isConversationToolbarHiddenInFloatingChat
  );

  // Lấy editingMessageId từ messageStore
  const editingMessageId = useMessageStore(state => state.editingMessageId);


  const { chatMessages, loadingState: messageLoadingState } = useChatMessageState();
  const { isConnected, socketId } = useSocketConnectionStatus();
  const { showConfirmationDialog, confirmationData } = useUIState();
  const { handleConfirmSend, handleCancelSend, setShowConfirmationDialog } = useUIActions();
  const { activeConversationId } = useActiveConversationState();
  const { isLoadingHistory } = useConversationListState();

  // --- State và Hooks cục bộ ---
  const { timeCounter, startTimer, stopTimer } = useTimer();
  const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);


  const {
    handleSendNewMessage,
    handleConfirmEdit,
    handleSetFillInput,
    handleSuggestionClick,
  } = useChatInteractions({
    onChatStart: () => { if (!hasChatStarted) setHasChatStarted(true); },
    startTimer: startTimer,
  });

  // --- useEffects ---
  useEffect(() => {
    // Dừng timer khi loading hoàn tất hoặc dialog xác nhận hiện ra
    if ((!messageLoadingState.isLoading || showConfirmationDialog) && timeCounter !== '0.0s') {
      stopTimer();
    }
  }, [messageLoadingState.isLoading, showConfirmationDialog, stopTimer, timeCounter]);

  // --- Logic tính toán điều kiện hiển thị ---
  const showIntroduction = !activeConversationId && chatMessages.length === 0 && !isLoadingHistory;
  const shouldShowToolbar = activeConversationId && (!isSmallContext || (isSmallContext && !isConversationToolbarHiddenInFloatingChat));
  const showLoadingIndicator = (messageLoadingState.isLoading || isLoadingHistory) && !showConfirmationDialog;

  const handleDialogClose = useCallback(() => {
    setShowConfirmationDialog(false, null);
  }, [setShowConfirmationDialog]);

  return (
    <div className='bg-white-pure relative mx-auto flex h-full w-full flex-col overflow-hidden border border-gray-200 shadow-lg dark:bg-gray-850 dark:border-gray-700'>
      {/* Header: Connection Status */}
      <div className='flex-shrink-0 border-b border-gray-200 p-1.5 text-center dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex items-center justify-center space-x-1 text-xs text-gray-600 dark:text-gray-400'>
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}></span>
          <span>
            {isConnected ? t('Connected') : t('Disconnected')}{' '}
            <span className="hidden sm:inline">
              {socketId ? `(ID: ${socketId.substring(0, 5)}...)` : ''}
            </span>
          </span>
        </div>
      </div>

      {/* Conversation Toolbar (nếu có active conversation và không bị ẩn) */}
      {shouldShowToolbar && <ConversationToolbar />}

      {/* Khu vực hiển thị chat chính */}
      <ChatArea
        messages={chatMessages}
        showIntroduction={showIntroduction}
        isSmallContext={isSmallContext}
        languageCode={currentLanguage.code}
        showConfirmationDialog={showConfirmationDialog}
        onSuggestionClick={handleSuggestionClick}
        onConfirmEdit={handleConfirmEdit}
      />

      {/* Footer Area: Loading Indicator and Chat Input */}
      {showLoadingIndicator && (
        <div className='flex-shrink-0 border-t border-gray-200 px-3 py-1.5 sm:px-4 sm:py-2 dark:border-gray-700 dark:bg-gray-800'>
          <LoadingIndicator
            step={isLoadingHistory ? 'loading_history' : messageLoadingState.step}
            message={isLoadingHistory ? t('Loading_Chat_History') : messageLoadingState.message}
            timeCounter={isLoadingHistory ? undefined : timeCounter}
          />
        </div>
      )}

      <div className='flex-shrink-0 border-t border-gray-200 p-1 sm:p-2 md:p-3 dark:border-gray-700 dark:bg-gray-800'>
        <ChatInput
          onSendMessage={handleSendNewMessage}
          disabled={
            messageLoadingState.isLoading ||
            isLoadingHistory ||
            !isConnected ||
            showConfirmationDialog ||
            !!editingMessageId // << THÊM ĐIỀU KIỆN NÀY: disable nếu có tin nhắn đang được edit
          }
          onRegisterFillFunction={handleSetFillInput}
        />
      </div>

      {/* Dialog xác nhận email (nếu cần) */}
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