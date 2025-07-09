// src/app/[locale]/chatbot/regularchat/RegularChat.tsx
'use client'
import Button from '../../utils/Button';
import React, { useState, useCallback, useEffect } from 'react';
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
import RegularChatInputBar from './RegularChatInputBar';
import FeedbackModal, { FeedbackFormData, FeedbackType } from './feedback/FeedbackModal';
import { submitChatFeedback } from '@/src/app/apis/chatbot/feedback';
import { notification } from '@/src/utils/toast/notification';
import ContextBanners from './chatInput/ContextBanners';
import { usePageContextStore } from '../stores/pageContextStore';
// THÊM CÁC IMPORTS MỚI
import { useAlertDialog } from '@/src/hooks/regularchat/chatInput/useAlertDialog';
import { useFileHandling } from '@/src/hooks/regularchat/chatInput/useFileHandling';
import FilePreview from './chatInput/FilePreview';
import Modal from '@/src/app/[locale]/chatbot/Modal'; // Re-import Modal ở đây

interface RegularChatProps {
  isSmallContext?: boolean;
}

function RegularChat({ isSmallContext = false }: RegularChatProps) {
  const t = useTranslations();

  // ... (các hooks và state hiện có giữ nguyên) ...
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
  const [contextMessage, setContextMessage] = useState<string | null>(null);

  // MỚI: Di chuyển useAlertDialog và useFileHandling lên đây
  const { isModalOpen, modalTitle, modalMessage, showAlertDialog, closeModal } = useAlertDialog();
  const { selectedFiles, setSelectedFiles, handleFileChange, handleRemoveFile } = useFileHandling({ showAlertDialog });


  // <<< THAY ĐỔI: Lấy thêm hàm reset từ store >>>
  const { 
    isCurrentPageFeatureEnabled, 
    isContextAttachedNextSend,
    resetContextAttachedNextSend // Lấy hàm reset
  } = usePageContextStore();

  const {
    handleSendNewFilesAndMessage,
    handleConfirmEdit,
    handleSetFillInput,
    handleSuggestionClick,
  } = useChatInteractions({
    onChatStart: () => { if (!hasChatStarted) setHasChatStarted(true); },
    startTimer: startTimer,
  });

  // ... (các state và handler của feedback modal giữ nguyên) ...
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
    if (isSubmittingFeedback) return;
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

  // <<< THAY ĐỔI: Thêm useEffect để dọn dẹp state >>>
  useEffect(() => {
    // Nếu component không ở trong "small context" (tức là trang chatbot chính),
    // chúng ta phải đảm bảo rằng trạng thái sử dụng context được reset.
    if (!isSmallContext) {
      resetContextAttachedNextSend();
    }
  }, [isSmallContext, resetContextAttachedNextSend]); // Chạy lại khi isSmallContext thay đổi


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
    <div className='relative mx-auto bg-white rounded-xl flex h-full w-full flex-col overflow-hidden shadow-lg dark:bg-gray-800'>
      {/* Header (giữ nguyên) */}
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

      {/* Chat Area (giữ nguyên) */}
      <ChatArea
        messages={chatMessages}
        showIntroduction={showIntroduction}
        isSmallContext={isSmallContext}
        languageCode={currentLanguage.code}
        showConfirmationDialog={showConfirmationDialog}
        onSuggestionClick={handleSuggestionClick}
        onConfirmEdit={handleConfirmEdit}
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

      {/* Context Banners (giữ nguyên) */}
      <div className="px-2">
        <ContextBanners
          contextSuggestionMessage={contextMessage}
          isContextAttachedNextSend={isContextAttachedNextSend}
          isCurrentPageFeatureEnabled={isCurrentPageFeatureEnabled}
        />
      </div>

      {/* MỚI: File Preview nằm ngoài input bar */}
      {/* Thêm padding và margin-bottom để căn chỉnh với input bar */}
      <div className="px-2 mb-2"> 
        <FilePreview files={selectedFiles} onRemoveFile={handleRemoveFile} />
      </div>

      {/* Chat Input Area (giữ nguyên) */}
      <RegularChatInputBar
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
        isSmallContext={isSmallContext}
        onSetContextMessage={setContextMessage}
        // THÊM CÁC PROPS MỚI CHO VIỆC XỬ LÝ FILE
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        handleFileChange={handleFileChange}
        handleRemoveFile={handleRemoveFile}
        showAlertDialog={showAlertDialog}
      />

      {/* Email Confirmation Dialog (giữ nguyên) */}
      <EmailConfirmationDialog
        isOpen={showConfirmationDialog}
        data={confirmationData}
        onConfirm={handleConfirmSend}
        onCancel={handleCancelSend}
        onClose={handleDialogClose}
      />

      {/* Feedback Modal (giữ nguyên) */}
      <FeedbackModal
        isOpen={feedbackState.isOpen}
        feedbackType={feedbackState.type}
        onClose={handleCloseFeedbackModal}
        onSubmit={handleSubmitFeedback}
        isSubmitting={isSubmittingFeedback}
      />

      {/* MỚI: Modal cho AlertDialog, đã di chuyển từ ChatInput */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        footer={
          <Button variant='primary' onClick={closeModal}>
            {t('Common_OK')}
          </Button>
        }
      >
        <p>{modalMessage}</p>
      </Modal>
    </div>
  );
}

export default RegularChat;