// src/components/chatbot/RegularChat.tsx (hoặc path tương ứng)
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
// --- IMPORT HOOKS TỪ STOREHOOKS ---
import {
    useChatSettingsState,
    useChatMessageState,
    useMessageActions,
    useSocketConnectionStatus,
    useUIState,
    useUIActions,
    useActiveConversationState,
    useConversationListState
} from '@/src/app/[locale]/chatbot/stores/storeHooks';
// useShallow không cần thiết ở đây vì các hook trong storeHooks đã sử dụng nó
interface RegularChatProps {
    isSmallContext?: boolean; // <-- THÊM PROP MỚI
}

function RegularChat({ isSmallContext = false }: RegularChatProps) { // <-- Nhận prop
  const t = useTranslations();

  // --- Lấy state và actions từ các store đã tách ---
  // Destructure currentLanguage with its correct type, which is Language
  const { currentLanguage, isStreamingEnabled } = useChatSettingsState();

  const { chatMessages, loadingState: messageLoadingState } = useChatMessageState();
  const { sendMessage } = useMessageActions();

  const { isConnected, socketId } = useSocketConnectionStatus();

  const { showConfirmationDialog, confirmationData } = useUIState();
  const { handleConfirmSend, handleCancelSend, setShowConfirmationDialog } = useUIActions();

  const { activeConversationId } = useActiveConversationState();
  // isLoadingHistory từ conversationListState là trạng thái loading chung của history
  // có thể khác với messageLoadingState.isLoading (là khi đang gửi/nhận tin nhắn)
  const { isLoadingHistory /*, conversationList */ } = useConversationListState();
  // Bỏ comment conversationList nếu ConversationToolbar hoặc component này thực sự cần

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
    // Sử dụng messageLoadingState.isLoading cho timer
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
        // Có thể hiển thị thông báo lỗi cho người dùng ở đây thông qua uiStore.handleError
        return;
      }
      if (!hasChatStarted) setHasChatStarted(true);
      startTimer();
      sendMessage(trimmedMessage); // Action từ messageStore
    },
    [
      isConnected,
      hasChatStarted,
      startTimer,
      sendMessage, // sendMessage từ messageStore
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

  // isLoadingHistory ở đây có thể là trạng thái đang load conversation ban đầu
  const showIntroduction =
    !activeConversationId && chatMessages.length === 0 && !isLoadingHistory;

  const handleDialogClose = useCallback(() => {
    setShowConfirmationDialog(false, null); // Action từ uiStore
  }, [setShowConfirmationDialog]);

  return (
    // - `rounded-xl` có thể giữ nguyên hoặc giảm bớt bo góc trên mobile nếu muốn.
    // - `shadow-xl` có thể giảm trên mobile nếu cần.
    <div className='bg-white-pure relative mx-auto flex h-full w-full flex-col overflow-hidden rounded-lg border border-gray-200 shadow-lg dark:bg-gray-850 dark:border-gray-700'>
      {/* --- Connection Status Bar --- */}
      {/* - `p-2` có thể là `p-1.5` hoặc `p-1` trên mobile nếu không gian chật hẹp. */}
      {/* - `text-xs` là tốt cho mobile. */}
      <div className='flex-shrink-0 border-b border-gray-200 p-1.5 text-center dark:border-gray-700 dark:bg-gray-800'>
        <div className='flex items-center justify-center space-x-1 text-xs text-gray-600 dark:text-gray-400'>
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? 'animate-pulse bg-green-500' : 'bg-red-500'}`}
          ></span>
          <span>
            {isConnected ? t('Connected') : t('Disconnected')}{' '}
            {/* Có thể ẩn socketId trên màn hình rất nhỏ nếu cần */}
            <span className="hidden sm:inline">
              {socketId ? `(ID: ${socketId.substring(0, 5)}...)` : ''}
            </span>
          </span>
        </div>
      </div>

      {/* --- Conversation Toolbar --- */}
      {/* ConversationToolbar sẽ tự xử lý responsive bên trong nó */}
      {activeConversationId && (
        <ConversationToolbar />
      )}

      {/* --- Chat History Area --- */}
      {/* - `p-4 md:p-6` -> `p-3 sm:p-4 md:p-6` để padding nhỏ hơn trên mobile. */}
      {/* - `space-y-4` có thể giảm thành `space-y-3` trên mobile. */}
      <div
        ref={chatHistoryRef}
        className='flex-grow space-y-3 overflow-y-auto  p-3 sm:p-4 md:p-6 dark:bg-gray-800'
      >
        {showIntroduction && (
          <ChatIntroductionDisplay
            onSuggestionClick={handleSuggestionClick}
            language={currentLanguage.code}
          />
        )}
<ChatHistory
            messages={chatMessages}
            isInsideSmallContainer={isSmallContext} // <-- TRUYỀN PROP XUỐNG
        />      </div>

      {/* --- Loading Indicator Area --- */}
      {/* - `px-4 py-2` -> `px-3 py-1.5 sm:px-4 sm:py-2` */}
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

      {/* --- Chat Input Area --- */}
      {/* - `p-3 pt-2 md:p-4` -> `p-2 sm:p-3 md:p-4` */}
      <div className='flex-shrink-0 border-t border-gray-200  p-2 sm:p-3 md:p-4 dark:border-gray-700 dark:bg-gray-800'>
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

      {/* EmailConfirmationDialog sẽ tự xử lý responsive bên trong nó */}
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