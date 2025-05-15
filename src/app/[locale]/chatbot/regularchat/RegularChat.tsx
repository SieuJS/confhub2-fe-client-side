// src/app/[locale]/chatbot/regularchat/RegularChat.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput'; // Đây là ChatInput đã được cập nhật ở bước trước (chỉ gửi tin nhắn mới)
import LoadingIndicator from './LoadingIndicator';
import ChatIntroductionDisplay from './ChatIntroduction';
import EmailConfirmationDialog from '../EmailConfirmationDialog';
import ConversationToolbar from './ConversationToolbar';
import { useTimer } from '@/src/hooks/chatbot/useTimer';
import { useTranslations } from 'next-intl';
import {
  useChatSettingsState,
  useChatMessageState, // Vẫn cần để lấy chatMessages, loadingState
  useMessageActions,   // Vẫn cần để lấy sendMessage (cho tin nhắn mới) và submitEditedMessage (cho tin nhắn đã sửa)
  useSocketConnectionStatus,
  useUIState,
  useUIActions,
  useActiveConversationState,
  useConversationListState,
} from '@/src/app/[locale]/chatbot/stores/storeHooks';
// Trực tiếp import useSettingsStore để lấy state mới
import { useSettingsStore } from '@/src/app/[locale]/chatbot/stores';


interface RegularChatProps {
  isSmallContext?: boolean;
}

function RegularChat({ isSmallContext = false }: RegularChatProps) {
  const t = useTranslations();

  const { currentLanguage } = useChatSettingsState(); // isStreamingEnabled không còn dùng trực tiếp ở đây cho logic edit
  const isConversationToolbarHiddenInFloatingChat = useSettingsStore(
    state => state.isConversationToolbarHiddenInFloatingChat
  );

  // editingMessage từ store không còn được RegularChat sử dụng trực tiếp để điều khiển UI edit
  const { chatMessages, loadingState: messageLoadingState } = useChatMessageState();
  // sendMessage giờ là để gửi tin nhắn mới, submitEditedMessage để gửi tin nhắn đã sửa
  const { sendMessage, submitEditedMessage } = useMessageActions();

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

  // chatInputRef không còn cần thiết cho logic edit nữa
  // const chatInputRef = useRef<{ setText: (text: string) => void, focus: () => void } | null>(null);

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

  // Đổi tên hàm này để rõ ràng là gửi tin nhắn MỚI từ ChatInput
  const handleSendNewMessage = useCallback(
    async (userMessage: string) => {
      const trimmedMessage = userMessage.trim();
      if (!trimmedMessage) return;
      if (!isConnected) {
        console.warn('Attempted to send message while disconnected.');
        return;
      }
      if (!hasChatStarted) setHasChatStarted(true);
      startTimer();
      sendMessage(trimmedMessage); // Gọi action sendMessage từ store
    },
    [
      isConnected,
      hasChatStarted,
      startTimer,
      sendMessage,
    ]
  );

  // Hàm mới để xử lý việc xác nhận chỉnh sửa từ ChatMessageDisplay
  const handleConfirmEdit = useCallback(
    (messageId: string, newText: string) => {
      // submitEditedMessage action trong messageStore đã được cập nhật
      // để nhận messageId và newText
      if (!isConnected) {
        console.warn('Attempted to submit edited message while disconnected.');
        // Có thể hiển thị toast/warning cho người dùng
        return;
      }
      console.log(`[RegularChat] Confirming edit for message ${messageId}. New text: "${newText}"`);
      submitEditedMessage(messageId, newText); // Gọi action submitEditedMessage từ store
    },
    [submitEditedMessage, isConnected] // Thêm isConnected vào dependency
  );

  const handleSetFillInput = useCallback((fillFunc: (text: string) => void) => {
    setFillInputFunction(() => fillFunc);
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      // Khi bấm suggestion, nó sẽ luôn điền vào ChatInput chính để gửi tin nhắn mới
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

  const shouldShowToolbar = activeConversationId && (
    !isSmallContext ||
    (isSmallContext && !isConversationToolbarHiddenInFloatingChat)
  );

  // Bỏ các hàm handleSendMessageOrUpdate, handleStartEdit, handleCancelEdit
  // vì logic edit giờ nằm trong ChatMessageDisplay và được xử lý qua handleConfirmEdit.

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

      {shouldShowToolbar && (
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
          onConfirmEdit={handleConfirmEdit} // <<< Chỉ truyền callback này
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
          onSendMessage={handleSendNewMessage} // <<< Luôn gọi hàm gửi tin nhắn MỚI
          disabled={
            messageLoadingState.isLoading || // Vẫn disable ChatInput khi đang loading
            !isConnected ||
            showConfirmationDialog ||
            isLoadingHistory
            // Cân nhắc: Có nên disable ChatInput khi một message nào đó đang được edit in-place không?
            // Hiện tại, ChatMessageDisplay tự quản lý việc edit, nên ChatInput có thể vẫn hoạt động song song.
            // Nếu muốn disable, bạn cần một state global (ví dụ trong messageStore) để biết có message nào đang được edit không.
            // Ví dụ: || !!messageStore.isAnyMessageBeingEdited
          }
          onRegisterFillFunction={handleSetFillInput}
          // Không cần truyền isEditing và initialEditText nữa
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