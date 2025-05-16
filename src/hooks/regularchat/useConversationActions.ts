// src/hooks/chatbot/useConversationActions.ts
import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, AppPathname, useRouter } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';
import {
  useConversationStore,
  useSocketStore,
  useSettingsStore,
} from '@/src/app/[locale]/chatbot/stores'; // Adjust path
import { useShallow } from 'zustand/react/shallow';
import { urlSearchParamsToObject } from '@/src/hooks/regularchat/useUrlConversationSync'; // Assuming this is still relevant

export const CHATBOT_LIVECHAT_PATH: AppPathname = '/chatbot/livechat';
export const CHATBOT_REGULARCHAT_PATH: AppPathname = '/chatbot/regularchat';

interface UseConversationActionsProps {
  currentView: 'chat' | 'history'; // Pass currentView from useChatViewManager
  onDeletionStart?: () => void; // Callback when deletion process starts
  onDeletionEnd?: () => void;   // Callback when deletion process ends (success or fail)
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
    startNewConversation: storeStartNewConversation,
    deleteConversation: storeDeleteConversation,
    isLoadingHistory,
  } = useConversationStore(
    useShallow(state => ({
      loadConversation: state.loadConversation,
      startNewConversation: state.startNewConversation,
      deleteConversation: state.deleteConversation,
      isLoadingHistory: state.isLoadingHistory,
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

    const langCode = currentLanguage?.code || 'en';
    console.log(`[useConversationActions] Starting new conversation with language: ${langCode}`);
    storeStartNewConversation(langCode);

    const targetChatPath = chatMode === 'live' ? CHATBOT_LIVECHAT_PATH : CHATBOT_REGULARCHAT_PATH;
    const newParams = new URLSearchParams(searchParamsHook.toString());
    newParams.delete('id');
    const newQuery = urlSearchParamsToObject(newParams);
    const currentUrlId = searchParamsHook.get('id');

    if (currentPathname !== targetChatPath || currentUrlId) {
      router.push({ pathname: targetChatPath, query: newQuery });
    }
  }, [
    storeStartNewConversation,
    router,
    chatMode,
    isConnected,
    isServerReadyForCommands,
    currentPathname,
    isProcessingDeletion,
    searchParamsHook,
    currentLanguage,
  ]);

  const handleDeleteConversation = useCallback(
    async (conversationIdToDelete: string) => {
      if (!isConnected || isProcessingDeletion) return;
      console.log(`[useConversationActions handleDeleteConversation] Initiating deletion for ${conversationIdToDelete}.`);
      setIsProcessingDeletion(true);
      setIdBeingDeleted(conversationIdToDelete);
      onDeletionStart?.();
      try {
        await storeDeleteConversation(conversationIdToDelete);
        // Lifecycle manager will handle resetting UI if active convo was deleted
      } catch (error) {
        console.error(`[useConversationActions] Error emitting delete request for ${conversationIdToDelete}:`, error);
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
    handleStartNewConversation,
    handleDeleteConversation,
    isProcessingDeletion,
    idBeingDeleted,
    resetDeletionState, // Expose this for useConversationLifecycleManager
  };
}