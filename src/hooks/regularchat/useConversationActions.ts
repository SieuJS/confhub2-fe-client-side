// src/hooks/chatbot/useConversationActions.ts

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, AppPathname, useRouter } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';
import {
  useConversationStore,
  useSocketStore,
  useSettingsStore,
  useMessageStore // <<< THÊM DÒNG NÀY
} from '@/src/app/[locale]/chatbot/stores';
import { useShallow } from 'zustand/react/shallow';
import { urlSearchParamsToObject } from '@/src/hooks/regularchat/useUrlConversationSync';

export const CHATBOT_LIVECHAT_PATH: AppPathname = '/chatbot/livechat';
export const CHATBOT_REGULARCHAT_PATH: AppPathname = '/chatbot/regularchat';

interface UseConversationActionsProps {
  currentView: 'chat' | 'history';
  onDeletionStart?: () => void;
  onDeletionEnd?: () => void;
}

export function useConversationActions({
  currentView,
  onDeletionStart,
  onDeletionEnd,
}: UseConversationActionsProps) {
  const t = useTranslations();
  const router = useRouter();
  const currentPathname = usePathname();
  const searchParamsHook = useSearchParams();

  const {
    loadConversation,
    // BỎ DÒNG NÀY: startNewConversation: storeStartNewConversation,
    deleteConversation: storeDeleteConversation,
    isLoadingHistory,
    setActiveConversationId: storeSetActiveConversationId, // <<< THÊM DÒNG NÀY
  } = useConversationStore(
    useShallow(state => ({
      loadConversation: state.loadConversation,
      // BỎ DÒNG NÀY: startNewConversation: state.startNewConversation,
      deleteConversation: state.deleteConversation,
      isLoadingHistory: state.isLoadingHistory,
      setActiveConversationId: state.setActiveConversationId, // <<< THÊM DÒNG NÀY
    }))
  );

  const { resetChatUIForNewConversation } = useMessageStore( // <<< THÊM DÒNG NÀY
    useShallow(state => ({
      resetChatUIForNewConversation: state.resetChatUIForNewConversation,
    }))
  );

  const { isConnected, isServerReadyForCommands } = useSocketStore(
    useShallow(state => ({
      isConnected: state.isConnected,
      isServerReadyForCommands: state.isServerReadyForCommands,
    }))
  );

  const { chatMode, currentLanguage } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode,
      currentLanguage: state.currentLanguage,
    }))
  );

  const [isProcessingDeletion, setIsProcessingDeletion] = useState(false);
  const [idBeingDeleted, setIdBeingDeleted] = useState<string | null>(null);

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      if (!isConnected || isProcessingDeletion || isLoadingHistory) return;
      loadConversation(conversationId);
      const targetChatPath = chatMode === 'live' ? CHATBOT_LIVECHAT_PATH : CHATBOT_REGULARCHAT_PATH;
      const newParams = new URLSearchParams(searchParamsHook.toString());

      if (targetChatPath === CHATBOT_LIVECHAT_PATH) {
        newParams.delete('id');
      } else {
        newParams.set('id', conversationId);
      }
      const newQuery = urlSearchParamsToObject(newParams);
      const newQueryString = newParams.toString();
      const currentQueryString = searchParamsHook.toString();

      if (currentPathname !== targetChatPath || currentQueryString !== newQueryString) {
        if (currentView === 'history' || currentPathname !== targetChatPath) {
          router.push({ pathname: targetChatPath, query: newQuery });
        } else {
          router.replace({ pathname: currentPathname, query: newQuery });
        }
      }
    },
    [
      loadConversation,
      currentView,
      router,
      chatMode,
      isConnected,
      isProcessingDeletion,
      isLoadingHistory,
      currentPathname,
      searchParamsHook,
    ]
  );

  const handleStartNewConversation = useCallback(() => {
    if (!isConnected || !isServerReadyForCommands || isProcessingDeletion) return;

    // console.log(`[useConversationActions] Preparing for new conversation (client-side reset).`);

    // Reset UI state to show introduction
    storeSetActiveConversationId(null); // Set active conversation to null
    resetChatUIForNewConversation(true); // Clear messages and reset UI

    const targetChatPath = chatMode === 'live' ? CHATBOT_LIVECHAT_PATH : CHATBOT_REGULARCHAT_PATH;
    const newParams = new URLSearchParams(searchParamsHook.toString());
    newParams.delete('id'); // Ensure no ID in URL for new chat
    const newQuery = urlSearchParamsToObject(newParams);
    const currentUrlId = searchParamsHook.get('id');

    // Only navigate if we are not already on the base chat path without an ID
    if (currentPathname !== targetChatPath || currentUrlId) {
      router.push({ pathname: targetChatPath, query: newQuery });
    }
  }, [
    // BỎ DÒNG NÀY: storeStartNewConversation,
    router,
    chatMode,
    isConnected,
    isServerReadyForCommands,
    currentPathname,
    isProcessingDeletion,
    searchParamsHook,
    currentLanguage, // Vẫn giữ nếu bạn muốn dùng langCode cho mục đích khác, nhưng không dùng cho storeStartNewConversation
    storeSetActiveConversationId, // <<< THÊM DÒNG NÀY
    resetChatUIForNewConversation, // <<< THÊM DÒNG NÀY
  ]);

  const handleDeleteConversation = useCallback(
    async (conversationIdToDelete: string) => {
      if (!isConnected || isProcessingDeletion) return;
      // console.log(`[useConversationActions handleDeleteConversation] Initiating deletion for ${conversationIdToDelete}.`);
      setIsProcessingDeletion(true);
      setIdBeingDeleted(conversationIdToDelete);
      onDeletionStart?.();
      try {
        await storeDeleteConversation(conversationIdToDelete);
        // Lifecycle manager will handle resetting UI if active convo was deleted
      } catch (error) {
        // console.error(`[useConversationActions] Error emitting delete request for ${conversationIdToDelete}:`, error);
      } finally {
        // Note: setIsProcessingDeletion(false) and setIdBeingDeleted(null)
        // will be handled by onDeletionProcessed callback from useConversationLifecycleManager
        // to ensure sync with its own logic. If not using that, reset here.
        // For now, let's assume useConversationLifecycleManager will signal when it's truly done.
        onDeletionEnd?.(); // Signal that the *action* part is done.
      }
    },
    [storeDeleteConversation, isConnected, isProcessingDeletion, onDeletionStart, onDeletionEnd]
  );

  const resetDeletionState = useCallback(() => {
    setIsProcessingDeletion(false);
    setIdBeingDeleted(null);
  }, []);

  return {
    handleSelectConversation,
    handleStartNewConversation, // Vẫn expose hàm này
    handleDeleteConversation,
    isProcessingDeletion,
    idBeingDeleted,
    resetDeletionState,
  };
}