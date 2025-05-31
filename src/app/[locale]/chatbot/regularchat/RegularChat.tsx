// src/app/[locale]/chatbot/regularchat/RegularChat.tsx
'use client'

import React, { useState, useCallback, useEffect } from 'react';
import ChatInput from './ChatInput'; // Sẽ không dùng cho edit nữa
import LoadingIndicator from './LoadingIndicator';
import EmailConfirmationDialog from '../EmailConfirmationDialog';
import ConversationToolbar from './ConversationToolbar';
import ChatArea from './ChatArea';
import { useTimer } from '@/src/hooks/regularchat/useTimer';
import { useChatInteractions } from '@/src/hooks/regularchat/useChatInteractions';
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
import { useMessageStore } from '@/src/app/[locale]/chatbot/stores/messageStore/messageStore'; // Import trực tiếp để lấy editingMessageId

interface RegularChatProps {
  isSmallContext?: boolean;
}

function RegularChat({ isSmallContext = false }: RegularChatProps) {
  const t = useTranslations();

  const { currentLanguage } = useChatSettingsState();
  const isConversationToolbarHiddenInFloatingChat = useSettingsStore(
    state => state.isConversationToolbarHiddenInFloatingChat
  );
  // Lấy editingMessageId trực tiếp từ store
  const editingMessageId = useMessageStore(state => state.editingMessageId);
  const { chatMessages, loadingState: messageLoadingState } = useChatMessageState();
  const { isConnected, socketId } = useSocketConnectionStatus();
  const { showConfirmationDialog, confirmationData } = useUIState();
  const { handleConfirmSend, handleCancelSend, setShowConfirmationDialog } = useUIActions();
  const { activeConversationId } = useActiveConversationState();
  const { isLoadingHistory } = useConversationListState();
  const { timeCounter, startTimer, stopTimer } = useTimer();
  const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);

  // State để quản lý giá trị của ChatInput, tách biệt khỏi logic edit
  const [chatInputValue, setChatInputValue] = useState('');

  const {
    handleSendNewFilesAndMessage,
    handleConfirmEdit, // Vẫn dùng hàm này, nhưng nó sẽ được gọi từ ChatMessageDisplay/EditMessageForm
    handleSetFillInput,
    handleSuggestionClick,
  } = useChatInteractions({
    onChatStart: () => { if (!hasChatStarted) setHasChatStarted(true); },
    startTimer: startTimer,
  });

  useEffect(() => {
    if ((!messageLoadingState.isLoading || showConfirmationDialog) && timeCounter !== '0.0s') {
      stopTimer();
    }
  }, [messageLoadingState.isLoading, showConfirmationDialog, stopTimer, timeCounter]);

  const showIntroduction = !activeConversationId && chatMessages.length === 0 && !isLoadingHistory;
  const shouldShowToolbar = activeConversationId && (!isSmallContext || (isSmallContext && !isConversationToolbarHiddenInFloatingChat));
  const showLoadingIndicator = (messageLoadingState.isLoading || isLoadingHistory) && !showConfirmationDialog;

  const handleDialogClose = useCallback(() => {
    setShowConfirmationDialog(false, null);
  }, [setShowConfirmationDialog]);

  // Hàm xử lý khi ChatInput gửi tin nhắn (chỉ cho tin nhắn mới)
  const handleSendFromChatInput = (message: string, files: File[]) => {
    handleSendNewFilesAndMessage(message, files);
    setChatInputValue(''); // Xóa input sau khi gửi
  };

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

      {/* Conversation Toolbar */}
      {shouldShowToolbar && <ConversationToolbar />}

      {/* Chat Area */}
      <ChatArea
        messages={chatMessages}
        showIntroduction={showIntroduction}
        isSmallContext={isSmallContext}
        languageCode={currentLanguage.code}
        showConfirmationDialog={showConfirmationDialog}
        onSuggestionClick={handleSuggestionClick}
        // onConfirmEdit được truyền xuống đây, và ChatArea sẽ truyền nó cho ChatMessageDisplay
        onConfirmEdit={handleConfirmEdit}
      />

      {/* Loading Indicator */}
      {showLoadingIndicator && (
        <div className='flex-shrink-0 border-t border-gray-200 px-3 py-1.5 sm:px-4 sm:py-2 dark:border-gray-700 dark:bg-gray-800'>
          <LoadingIndicator
            step={isLoadingHistory ? 'loading_history' : messageLoadingState.step}
            message={isLoadingHistory ? t('Loading_Chat_History') : messageLoadingState.message}
            timeCounter={isLoadingHistory ? undefined : timeCounter}
          />
        </div>
      )}

      {/* Chat Input Area */}
      <div className='flex-shrink-0 border-t border-gray-200 p-1 sm:p-2 md:p-3 dark:border-gray-700 dark:bg-gray-800'>
        <ChatInput
          // Truyền giá trị và hàm cập nhật cho ChatInput
          inputValue={chatInputValue} // Đổi tên prop để rõ ràng hơn
          onInputChange={setChatInputValue} // Hàm để ChatInput cập nhật state này

          // ChatInput chỉ dùng để gửi tin nhắn mới
          onSendFilesAndMessage={handleSendFromChatInput}
          disabled={
            !!editingMessageId || // <<<< KHÓA CHAT INPUT KHI ĐANG EDIT
            messageLoadingState.isLoading ||
            isLoadingHistory ||
            !isConnected ||
            showConfirmationDialog
          }
          onRegisterFillFunction={handleSetFillInput}
        // Các prop isEditing và initialEditText không cần thiết cho ChatInput nữa
        />
      </div>

      {/* Email Confirmation Dialog */}
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