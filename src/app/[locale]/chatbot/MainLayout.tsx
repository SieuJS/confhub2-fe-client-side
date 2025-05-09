
// src/app/[locale]/chatbot/MainLayout.tsx

'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react';
import LeftPanel from './LeftPanel';
import RightSettingsPanel from './RightPanel';
import { Settings, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, AppPathname, useRouter } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';
import {
  useConversationStore,
  useSocketStore,
  useSettingsStore,
  useUiStore,
} from './stores';
import { useShallow } from 'zustand/react/shallow';

// Import custom hooks
import { useAppInitialization } from '@/src/hooks/chatbot/useAppInitialization';
import { useUrlConversationSync } from '@/src/hooks/chatbot/useUrlConversationSync';
import { useConversationLifecycleManager } from '@/src/hooks/chatbot/useConversationLifecycleManager';

interface MainLayoutComponentProps {
  children: React.ReactNode;
  isLiveChatContextActive?: boolean;
}

type MainContentView = 'chat' | 'history';

const CHATBOT_HISTORY_PATH: AppPathname = '/chatbot/history';
const CHATBOT_LIVECHAT_PATH: AppPathname = '/chatbot/livechat';
const CHATBOT_REGULARCHAT_PATH: AppPathname = '/chatbot/regularchat';

// Helper function (nếu chưa có sẵn hoặc import từ hooks)
function urlSearchParamsToObject(params: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {};
  if (params) {
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
  }
  return obj;
}


export default function MainLayoutComponent({
  children,
  isLiveChatContextActive
}: MainLayoutComponentProps) {
  const t = useTranslations();
  const router = useRouter(); // Keep router for handlers
  const currentPathname = usePathname();
  const searchParamsHook = useSearchParams();

  // --- Store Hooks ---
  const {
    activeConversationId,
    isLoadingHistory, // This is the global loading history from conversation store
    loadConversation,
    startNewConversation,
    deleteConversation,
  } = useConversationStore(
    useShallow(state => ({
      activeConversationId: state.activeConversationId,
      isLoadingHistory: state.isLoadingHistory,
      loadConversation: state.loadConversation,
      startNewConversation: state.startNewConversation,
      deleteConversation: state.deleteConversation,
    }))
  );

  const { isConnected, isServerReadyForCommands } = useSocketStore(
    useShallow(state => ({
      isConnected: state.isConnected,
      isServerReadyForCommands: state.isServerReadyForCommands,
    }))
  );

  const { chatMode } = useSettingsStore(
    useShallow(state => ({
      chatMode: state.chatMode,
    }))
  );

  const { isRightPanelOpen, setRightPanelOpen } = useUiStore(
    useShallow(state => ({
      isRightPanelOpen: state.isRightPanelOpen,
      setRightPanelOpen: state.setRightPanelOpen,
    }))
  );

  // --- Local State & Refs for MainLayout ---
  const [currentView, setCurrentView] = useState<MainContentView>(
    currentPathname === CHATBOT_HISTORY_PATH ? 'history' : 'chat'
  );
  const [isProcessingDeletion, setIsProcessingDeletion] = useState(false);
  const [idBeingDeleted, setIdBeingDeleted] = useState<string | null>(null);
  const prevActiveIdRef = useRef<string | null>(null); // For deletion logic

  // --- Custom Hooks for Logic Separation ---
  useAppInitialization();

  // didAttemptLoadFromUrlRef is managed by useUrlConversationSync
  const { didAttemptLoadFromUrlRef } = useUrlConversationSync({
    currentView,
    isProcessingDeletion,
    idBeingDeleted,
  });

  useConversationLifecycleManager({
    currentView,
    isProcessingDeletion,
    idBeingDeleted,
    prevActiveIdRef,
    urlIdParam: searchParamsHook.get('id'),
    searchParamsString: searchParamsHook.toString(),
    onDeletionProcessed: () => {
      setIsProcessingDeletion(false);
      setIdBeingDeleted(null);
      // No need to reset didAttemptLoadFromUrlRef here manually,
      // useUrlConversationSync will handle its state.
    },
    didAttemptLoadFromUrlRef: didAttemptLoadFromUrlRef, // Truyền ref vào
    onNotFoundProcessed: () => {
      console.log("[MainLayout] onNotFoundProcessed called from LifecycleManager.");
      // Nếu bạn muốn MainLayout reset cờ này:
      if (didAttemptLoadFromUrlRef.current) {
        didAttemptLoadFromUrlRef.current = false;
        console.log("[MainLayout] Reset didAttemptLoadFromUrlRef to false.");
      }
      // Có thể cần thêm logic reset khác ở đây nếu cần
    },
  });

  // --- Remaining useEffects in MainLayout ---
  useEffect(() => {
    prevActiveIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    const newView = currentPathname === CHATBOT_HISTORY_PATH ? 'history' : 'chat';
    if (currentView !== newView) {
      setCurrentView(newView);
    }
    // Logic for clearing URL 'id' when in history view is handled by useUrlConversationSync
  }, [currentPathname, currentView]);



  // --- Event Handlers ---
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      if (!isConnected || isProcessingDeletion || isLoadingHistory) return;

      // 1. Load the conversation (updates activeConversationId in store)
      loadConversation(conversationId);

      // 2. Determine target path and update URL to reflect the selection
      const targetChatPath = chatMode === 'live' ? CHATBOT_LIVECHAT_PATH : CHATBOT_REGULARCHAT_PATH;
      const newParams = new URLSearchParams(searchParamsHook.toString());
      newParams.set('id', conversationId);
      const newQuery = urlSearchParamsToObject(newParams);

      // If in history view, or on a different chat path, navigate fully
      if (currentView === 'history' || currentPathname !== targetChatPath) {
        router.push({ pathname: targetChatPath, query: newQuery });
      }
      // If already on the correct chat path, but 'id' param is different, replace URL
      else if (searchParamsHook.get('id') !== conversationId) {
        router.replace({ pathname: currentPathname, query: newQuery });
      }
      // If already on correct path with correct id, no navigation needed.
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
      searchParamsHook, // Add searchParamsHook as a dependency
    ]
  );

  const handleStartNewConversation = useCallback(() => {
    if (!isConnected || !isServerReadyForCommands || isProcessingDeletion) return;
    // Dòng này đã được xóa: if (didAttemptLoadFromUrlRef.current) didAttemptLoadFromUrlRef.current = false;
    startNewConversation();
    const targetChatPath = chatMode === 'live' ? CHATBOT_LIVECHAT_PATH : CHATBOT_REGULARCHAT_PATH;

    // Logic cập nhật URL khi start new conversation
    const newParams = new URLSearchParams(searchParamsHook.toString());
    const currentUrlId = newParams.get('id');
    newParams.delete('id');
    const newQuery = urlSearchParamsToObject(newParams);

    if (currentPathname !== targetChatPath || currentUrlId) {
      router.push({ pathname: targetChatPath, query: newQuery });
    }
  }, [
    startNewConversation, router, chatMode, isConnected, isServerReadyForCommands,
    currentPathname, isProcessingDeletion, searchParamsHook // Đảm bảo searchParamsHook ở đây
  ]);

  const handleDeleteConversation = useCallback(
    async (conversationIdToDelete: string) => {
      if (!isConnected || isProcessingDeletion) return;
      console.log(`[MainLayout handleDeleteConversation] Initiating deletion for ${conversationIdToDelete}.`);
      setIsProcessingDeletion(true);
      setIdBeingDeleted(conversationIdToDelete);
      try {
        await deleteConversation(conversationIdToDelete);
        // Lifecycle manager hook will handle redirection and state reset after store confirms
      } catch (error) {
        console.error(`[MainLayout] Error emitting delete request for ${conversationIdToDelete}:`, error);
        setIsProcessingDeletion(false);
        setIdBeingDeleted(null);
      }
    },
    [deleteConversation, isConnected, isProcessingDeletion]
  );

  return (
    <div className='bg-gray-10 flex h-screen overflow-hidden' >
      <LeftPanel
        onSelectConversation={handleSelectConversation}
        onStartNewConversation={handleStartNewConversation}
        onDeleteConversation={handleDeleteConversation}
        currentView={currentView}
        deletingConversationId={isProcessingDeletion ? idBeingDeleted : null}
      />

      <main className='relative flex-1 overflow-hidden transition-all duration-300 ease-in-out' >
        {isProcessingDeletion && idBeingDeleted && currentView === 'chat' && activeConversationId === idBeingDeleted && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white bg-opacity-75 dark:bg-black dark:bg-opacity-75">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-xl flex items-center text-gray-700 dark:text-gray-200">
              <Loader2 size={24} className="animate-spin mr-3" />
              <span>{t('Deleting_conversation_ellipsis')}</span>
            </div>
          </div>
        )}
        <div className='h-full w-full' > {children} </div>
      </main>

      <RightSettingsPanel
        isLiveChatContextActive={isLiveChatContextActive}
      />

      {!isRightPanelOpen && (
        <button
          onClick={() => {
            if (isProcessingDeletion) return;
            setRightPanelOpen(true)
          }}
          disabled={isProcessingDeletion}
          className='bg-white-pure hover:bg-gray-5 fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
          title={t('Open_settings')}
          aria-label={t('Open_settings')}
        >
          <Settings className='h-5 w-5' />
        </button>
      )}
    </div>
  );
}