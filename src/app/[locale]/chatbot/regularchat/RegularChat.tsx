// src/app/[locale]/chatbot/regularchat/RegularChat.tsx
'use client'

import React, { useState, useCallback, useEffect } from 'react';
import ChatInput from './ChatInput';
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
import { useMessageStore } from '@/src/app/[locale]/chatbot/stores/messageStore/messageStore';

// <<< NEW IMPORTS
import FeedbackModal, { FeedbackFormData, FeedbackType } from './feedback/FeedbackModal';
import { submitChatFeedback } from '@/src/app/apis/chatbot/feedback';
import { notification } from '@/src/utils/toast/notification';

interface RegularChatProps {
  isSmallContext?: boolean;
}

function RegularChat({ isSmallContext = false }: RegularChatProps) {
  const t = useTranslations();

  // ... (toàn bộ hooks và state hiện có của bạn giữ nguyên) ...
  const { currentLanguage } = useChatSettingsState();
  const isConversationToolbarHiddenInFloatingChat = useSettingsStore(
    state => state.isConversationToolbarHiddenInFloatingChat
  );
  const editingMessageId = useMessageStore(state => state.editingMessageId);
  const { chatMessages, loadingState: messageLoadingState } = useChatMessageState();
  const { isConnected, socketId } = useSocketConnectionStatus();
  const { showConfirmationDialog, confirmationData } = useUIState();
  const { handleConfirmSend, handleCancelSend, setShowConfirmationDialog } = useUIActions();
  const { activeConversationId } = useActiveConversationState();
  const { isLoadingHistory } = useConversationListState();
  const { timeCounter, startTimer, stopTimer } = useTimer();
  const [hasChatStarted, setHasChatStarted] = useState<boolean>(false);
  const [chatInputValue, setChatInputValue] = useState('');

  const {
    handleSendNewFilesAndMessage,
    handleConfirmEdit,
    handleSetFillInput,
    handleSuggestionClick,
  } = useChatInteractions({
    onChatStart: () => { if (!hasChatStarted) setHasChatStarted(true); },
    startTimer: startTimer,
  });

  // <<< NEW: State and handlers for Feedback Modal >>>
  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    messageId: string | null;
    type: FeedbackType | null;
  }>({ isOpen: false, messageId: null, type: null });

  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const handleOpenFeedbackModal = (messageId: string, type: FeedbackType) => {
    setFeedbackState({ isOpen: true, messageId, type });
  };

  const handleCloseFeedbackModal = () => {
    if (isSubmittingFeedback) return; // Prevent closing while submitting
    setFeedbackState({ isOpen: false, messageId: null, type: null });
  };

  const handleSubmitFeedback = async (formData: FeedbackFormData) => {
    if (!feedbackState.messageId) return;
    setIsSubmittingFeedback(true);

    const messageIndex = chatMessages.findIndex(msg => msg.id === feedbackState.messageId);
    if (messageIndex === -1) {
      console.error("Could not find the message to submit feedback for.");
      notification.error(t('Feedback_Error_MessageNotFound'));
      setIsSubmittingFeedback(false);
      handleCloseFeedbackModal();
      return;
    }

    const conversationContext = chatMessages.slice(0, messageIndex + 1);

    try {
      await submitChatFeedback({
        feedback: formData,
        conversationContext: conversationContext,
      });
      notification.success(t('Feedback_Success_Message'));
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      notification.error(t('Feedback_Error_SubmitFailed'));
    } finally {
      setIsSubmittingFeedback(false);
      handleCloseFeedbackModal();
    }
  };
  // <<< END: New state and handlers >>>


  useEffect(() => {
    if ((!messageLoadingState.isLoading || showConfirmationDialog) && timeCounter !== '0.0s') {
      stopTimer();
    }
  }, [messageLoadingState.isLoading, showConfirmationDialog, stopTimer, timeCounter]);

  const showIntroduction = chatMessages.length === 0 && !isLoadingHistory;
  const shouldShowToolbar = activeConversationId && (!isSmallContext || (isSmallContext && !isConversationToolbarHiddenInFloatingChat));
  const showLoadingIndicator = (messageLoadingState.isLoading || isLoadingHistory) && !showConfirmationDialog;

  const handleDialogClose = useCallback(() => {
    setShowConfirmationDialog(false, null);
  }, [setShowConfirmationDialog]);

  const handleSendFromChatInput = (message: string, files: File[], shouldUsePageContext: boolean) => {
    handleSendNewFilesAndMessage(message, files, shouldUsePageContext);
  };

  return (
    <div className='bg-white-pure relative mx-auto flex h-full w-full flex-col overflow-hidden border border-gray-200 shadow-lg dark:bg-gray-850 dark:border-gray-700'>
      {/* Header: Connection Status (giữ nguyên) */}
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

      {/* Conversation Toolbar (giữ nguyên) */}
      {shouldShowToolbar && <ConversationToolbar />}

      {/* Chat Area */}
      <ChatArea
        messages={chatMessages}
        showIntroduction={showIntroduction}
        isSmallContext={isSmallContext}
        languageCode={currentLanguage.code}
        showConfirmationDialog={showConfirmationDialog}
        onSuggestionClick={handleSuggestionClick}
        onConfirmEdit={handleConfirmEdit}
        // <<< PASS THE NEW HANDLER DOWN
        onOpenFeedbackModal={handleOpenFeedbackModal}
      />

      {/* Loading Indicator (giữ nguyên) */}
      {showLoadingIndicator && (
        <div className='flex-shrink-0 border-t border-gray-200 px-3 py-1.5 sm:px-4 sm:py-2 dark:border-gray-700 dark:bg-gray-800'>
          <LoadingIndicator
            step={isLoadingHistory ? 'loading_history' : messageLoadingState.step}
            message={isLoadingHistory ? t('Loading_Chat_History') : messageLoadingState.message}
            timeCounter={isLoadingHistory ? undefined : timeCounter}
          />
        </div>
      )}

      {/* Chat Input Area (giữ nguyên) */}
      <div className='flex-shrink-0 border-t border-gray-200 p-1 sm:p-2 md:p-3 dark:border-gray-700 dark:bg-gray-800'>
        <ChatInput
          inputValue={chatInputValue}
          onInputChange={setChatInputValue}
          onSendFilesAndMessage={handleSendFromChatInput}
          disabled={
            !!editingMessageId ||
            messageLoadingState.isLoading ||
            isLoadingHistory ||
            !isConnected ||
            showConfirmationDialog
          }
          onRegisterFillFunction={handleSetFillInput}
        />
      </div>

      {/* Email Confirmation Dialog (giữ nguyên) */}
      <EmailConfirmationDialog
        isOpen={showConfirmationDialog}
        data={confirmationData}
        onConfirm={handleConfirmSend}
        onCancel={handleCancelSend}
        onClose={handleDialogClose}
      />

      {/* <<< NEW: Render the Feedback Modal >>> */}
      <FeedbackModal
        isOpen={feedbackState.isOpen}
        feedbackType={feedbackState.type}
        onClose={handleCloseFeedbackModal}
        onSubmit={handleSubmitFeedback}
        isSubmitting={isSubmittingFeedback}
      />
    </div>
  );
}

export default RegularChat;