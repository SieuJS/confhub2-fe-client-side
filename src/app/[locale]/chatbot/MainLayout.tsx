// src/components/chatbot/MainLayout.tsx
'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import LeftPanel from './LeftPanel'
import RightSettingsPanel from './RightPanel'
import useConnection from './livechat/hooks/useConnection'
import { Settings } from 'lucide-react'
import { useSharedChatSocket } from './context/ChatSocketContext'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useRouter, usePathname, AppPathname } from '@/src/navigation' // Đảm bảo đường dẫn đúng
import { useChatSettings } from './context/ChatSettingsContext'

interface MainLayoutComponentProps {
  children: React.ReactNode
}

type MainContentView = 'chat' | 'history'

const CHATBOT_HISTORY_PATH: AppPathname = '/chatbot/history';
const CHATBOT_LIVECHAT_PATH: AppPathname = '/chatbot/livechat';
const CHATBOT_REGULARCHAT_PATH: AppPathname = '/chatbot/regularchat';

function urlSearchParamsToObject(params: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    obj[key] = value;
  }
  return obj;
}

export default function MainLayoutComponent({
  children
}: MainLayoutComponentProps) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const searchParamsHook = useSearchParams()

  const { chatMode, handleChatModeNavigation } = useChatSettings()

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [isProcessingDeletion, setIsProcessingDeletion] = useState(false); // <-- NEW STATE

  const {
    conversationList,
    activeConversationId,
    loadConversation,
    startNewConversation,
    isLoadingHistory,
    isConnected,
    deleteConversation, // Lấy hàm gốc từ context
    clearConversation,
    renameConversation,
    pinConversation,
    isServerReadyForCommands,
  } = useSharedChatSocket()

  const { connected: isLiveChatServiceConnected } = useConnection();

  const [currentView, setCurrentView] = useState<MainContentView>('chat')
  const didAttemptLoadFromUrlRef = useRef(false);

  // 1) Xác định currentView theo URL
  useEffect(() => {
    setCurrentView(pathname === CHATBOT_HISTORY_PATH ? 'history' : 'chat')
  }, [pathname]);

  // 2) Sync activeConversationId <-> URL (?id=...)
  useEffect(() => {
    const urlId = searchParamsHook.get('id');
    console.log(`[MainLayout Effect 2 ENTER] Path: ${pathname}, urlId: ${urlId}, activeId: ${activeConversationId}, isProcessingDeletion: ${isProcessingDeletion}`);

    if (isProcessingDeletion) {
      console.log(`[MainLayout Effect 2] Paused due to isProcessingDeletion.`);
      return; // Pause URL sync if a deletion is in progress
    }

    const params = new URLSearchParams(searchParamsHook.toString());
    let shouldUpdateURL = false;

    console.log(`[MainLayout Effect 2 Check] urlId: ${urlId}, activeId: ${activeConversationId}, currentView: ${currentView}, isLoadingHistory: ${isLoadingHistory}, isConnected: ${isConnected}, isServerReady: ${isServerReadyForCommands}, didAttemptLoadFromUrl: ${didAttemptLoadFromUrlRef.current}`);

    if (currentView === 'chat') {
      if (activeConversationId) {
        if (urlId !== activeConversationId) {
          console.log(`[MainLayout Effect 2 ACTION] Syncing URL: Setting id to activeConversationId (${activeConversationId})`);
          params.set('id', activeConversationId);
          shouldUpdateURL = true;
        }
        if (didAttemptLoadFromUrlRef.current && activeConversationId === urlId) {
          console.log(`[MainLayout Effect 2] ActiveId matches urlId after attempt. Resetting didAttemptLoadFromUrlRef.`);
          didAttemptLoadFromUrlRef.current = false;
        }
      } else {
        if (urlId) {
          if (isConnected && isServerReadyForCommands && !isLoadingHistory && !didAttemptLoadFromUrlRef.current) {
            console.log(`[MainLayout Effect 2 ACTION] Syncing URL: No activeId, IS connected, SERVER IS READY, NOT loading, did NOT just attempt load. Removing stale urlId (${urlId}).`);
            params.delete('id');
            shouldUpdateURL = true;
          } else {
            console.log(`[MainLayout Effect 2 INFO] Syncing URL: No activeId. Holding off on removing urlId (${urlId}) because: isConnected=${isConnected}, isServerReady=${isServerReadyForCommands}, isLoadingHistory=${isLoadingHistory}, didAttemptLoadFromUrl=${didAttemptLoadFromUrlRef.current}.`);
          }
        }
      }
    } else { // currentView is 'history'
      if (urlId) {
        console.log(`[MainLayout Effect 2 ACTION] Syncing URL: In history view, removing id (${urlId}) from URL.`);
        params.delete('id');
        shouldUpdateURL = true;
        if (didAttemptLoadFromUrlRef.current) {
          didAttemptLoadFromUrlRef.current = false;
        }
      }
    }

    if (shouldUpdateURL) {
      const queryAsObject = urlSearchParamsToObject(params);
      console.log(`[MainLayout Effect 2 COMMIT] Updating URL. Pathname: ${pathname}, Query: ${JSON.stringify(queryAsObject)}`);
      router.replace(
        { pathname: pathname, query: queryAsObject },
        { scroll: false }
      );
    }
  }, [
    activeConversationId,
    currentView,
    pathname,
    router,
    searchParamsHook,
    isLoadingHistory,
    isConnected,
    isServerReadyForCommands,
    conversationList,
    isProcessingDeletion // <-- ADD DEPENDENCY
  ]);

  // 3) Load từ URL -> state
  useEffect(() => {
    const urlId = searchParamsHook.get('id');
    console.log(`[MainLayout Effect 3 ENTER] Path: ${pathname}, urlId: ${urlId}, activeId: ${activeConversationId}, isLoadingHistory: ${isLoadingHistory}, isConnected: ${isConnected}, isServerReady: ${isServerReadyForCommands}, isProcessingDeletion: ${isProcessingDeletion}`);

    if (isProcessingDeletion) {
      console.log(`[MainLayout Effect 3] Paused due to isProcessingDeletion.`);
      return; // Pause load from URL if a deletion is in progress
    }

    console.log(`[MainLayout Effect 3 Check] urlId: ${urlId}, currentView: ${currentView}, activeId: ${activeConversationId}, isLoadingHistory: ${isLoadingHistory}, isConnected: ${isConnected}, isServerReady: ${isServerReadyForCommands}, didAttemptLoad: ${didAttemptLoadFromUrlRef.current}`);

    if (
      currentView === 'chat' &&
      urlId &&
      !activeConversationId && // If no active one is set yet
      !isLoadingHistory &&
      isConnected &&
      isServerReadyForCommands &&
      !didAttemptLoadFromUrlRef.current
    ) {
      console.log(`[MainLayout Effect 3 ACTION] Attempting to load conversation ${urlId} from URL. Setting didAttemptLoadFromUrlRef.`);
      didAttemptLoadFromUrlRef.current = true;
      loadConversation(urlId);
    } else if (currentView === 'chat' && urlId && !activeConversationId && !isLoadingHistory && (!isConnected || !isServerReadyForCommands)) {
      console.log(`[MainLayout Effect 3 INFO] Holding off load for ${urlId}: Socket/Server not ready. (isConnected: ${isConnected}, isServerReady: ${isServerReadyForCommands})`);
    }
  }, [
    searchParamsHook,
    currentView,
    activeConversationId,
    loadConversation,
    isLoadingHistory,
    pathname,
    isConnected,
    isServerReadyForCommands,
    isProcessingDeletion // <-- ADD DEPENDENCY
  ]);

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      if (!isConnected) {
        console.warn("[MainLayout] Cannot select conversation: Socket not connected.");
        return;
      }
      didAttemptLoadFromUrlRef.current = false;
      loadConversation(conversationId);
      if (currentView === 'history') {
        const targetChatPath = chatMode === 'live' ? CHATBOT_LIVECHAT_PATH : CHATBOT_REGULARCHAT_PATH;
        router.push(targetChatPath);
      }
    },
    [loadConversation, currentView, router, chatMode, isConnected]
  );

  const handleStartNewConversation = useCallback(() => {
    if (!isConnected) {
      console.warn("[MainLayout] Cannot start new conversation: Socket not connected.");
      return;
    }
    didAttemptLoadFromUrlRef.current = false;
    startNewConversation();

    const targetChatPath = chatMode === 'live' ? CHATBOT_LIVECHAT_PATH : CHATBOT_REGULARCHAT_PATH;
    const isAlreadyOnTargetChatPageWithoutId = pathname === targetChatPath && !searchParamsHook.has('id');

    if (currentView === 'history' || !isAlreadyOnTargetChatPageWithoutId) {
      console.log(`[MainLayout] Navigating to new chat. Target base path: ${targetChatPath}`);
      router.push(targetChatPath);
    }
  }, [startNewConversation, router, chatMode, currentView, pathname, searchParamsHook, isConnected]);

  const internalHandleChatModeChange = (mode: typeof chatMode) => {
    if (isLiveChatServiceConnected && mode !== 'live') {
      console.warn('Cannot switch from live chat while connected.')
      return
    }
    handleChatModeNavigation(mode);
  }

   // MODIFIED: Hàm xử lý xóa conversation và sau đó điều hướng
   const handleDeleteConversationAndRedirect = useCallback(
    async (conversationIdToDelete: string) => {
      if (!isConnected) {
        console.warn("[MainLayout] Cannot delete conversation: Socket not connected.");
        return;
      }

      console.log(`[MainLayout] Starting deletion for ${conversationIdToDelete}. Setting isProcessingDeletion=true.`);
      setIsProcessingDeletion(true); // Set flag before any async operations or context state changes

      try {
        const wasActive = activeConversationId === conversationIdToDelete;
        const currentUrlId = searchParamsHook.get('id');

        // Perform the actual deletion logic. This will update activeConversationId in context.
        // Effects 2 & 3 are currently paused by isProcessingDeletion=true.
        await deleteConversation(conversationIdToDelete);

        console.log(`[MainLayout] Conversation ${conversationIdToDelete} deleted by action. Current Path: ${pathname}, URL ID: ${currentUrlId}`);

        // If the deleted conversation was the active one and matched the ID in the URL,
        // clean the URL by replacing the current history entry.
        // This ensures the "back" button from the history page won't land on a URL with the deleted ID.
        if (wasActive && currentUrlId === conversationIdToDelete && 
            (pathname === CHATBOT_REGULARCHAT_PATH || pathname === CHATBOT_LIVECHAT_PATH)
        ) {
          console.log(`[MainLayout] Deletion: Actively deleted conv ${conversationIdToDelete} was on URL. Replacing URL before history push.`);
          const params = new URLSearchParams(searchParamsHook.toString());
          params.delete('id');
          router.replace(
            { pathname: pathname, query: urlSearchParamsToObject(params) },
            { scroll: false }
          );
          // The URL is now clean for the current history entry.
        }
        
        console.log(`[MainLayout] Redirecting to history view: ${CHATBOT_HISTORY_PATH}`);
        // Navigating to history. The isProcessingDeletion flag will be reset by the effect below
        // once navigation is complete (pathname changes).
        router.push(CHATBOT_HISTORY_PATH);

      } catch (error) {
        console.error(`[MainLayout] Error deleting conversation ${conversationIdToDelete} and redirecting:`, error);
        // If an error occurs *before* navigation, reset the flag.
        // If navigation is attempted, let the effect handle reset.
        const currentPathAfterError = pathname; // Capture current path
        if (currentPathAfterError !== CHATBOT_HISTORY_PATH) {
            setIsProcessingDeletion(false);
        }
      }
      // No finally block to reset setIsProcessingDeletion(false) here;
      // rely on the effect below for robust reset upon successful navigation or view change.
    },
    [
      deleteConversation,
      router,
      isConnected,
      activeConversationId,
      pathname,
      searchParamsHook,
      // setIsProcessingDeletion is implicitly available
    ]
  );

  // Effect to reset isProcessingDeletion flag robustly after navigation or state stabilization
  useEffect(() => {
    if (isProcessingDeletion) {
      // Check if navigation to history is complete
      if (pathname === CHATBOT_HISTORY_PATH && currentView === 'history') {
        console.log("[MainLayout Cleanup] Navigated to history, resetting isProcessingDeletion.");
        setIsProcessingDeletion(false);
      }
      // Or, if we are on a chat page and it has stabilized (e.g., a new chat is loaded, or an existing one)
      else if (currentView === 'chat') {
        const urlId = searchParamsHook.get('id');
        if (activeConversationId && urlId === activeConversationId) { // Valid chat loaded
          console.log("[MainLayout Cleanup] Chat page with active ID loaded, resetting isProcessingDeletion.");
          setIsProcessingDeletion(false);
        } else if (!activeConversationId && !urlId) { // New chat page, no ID yet
          console.log("[MainLayout Cleanup] New chat page (no IDs), resetting isProcessingDeletion.");
          setIsProcessingDeletion(false);
        }
      }
    }
  }, [isProcessingDeletion, pathname, currentView, activeConversationId, searchParamsHook]);


  return (
    <div className='bg-gray-10 flex h-screen overflow-hidden'>
      <LeftPanel
        isOpen={isLeftPanelOpen}
        onToggleOpen={() => setIsLeftPanelOpen(v => !v)}
        currentChatMode={chatMode}
        onChatModeChange={internalHandleChatModeChange}
        isLiveConnected={isLiveChatServiceConnected}
        conversationList={conversationList}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onStartNewConversation={handleStartNewConversation}
        isLoadingConversations={isLoadingHistory}
        onDeleteConversation={handleDeleteConversationAndRedirect} // Truyền hàm mới
        onClearConversation={clearConversation}
        onRenameConversation={renameConversation}
        onPinConversation={pinConversation}
        currentView={currentView}
      />

      <main className='relative flex-1 overflow-hidden transition-all duration-300 ease-in-out'>
        <div className='h-full w-full'>{children}</div>
      </main>

      <RightSettingsPanel
        isOpen={isRightPanelOpen}
        onClose={() => setIsRightPanelOpen(false)}
        isLiveConnected={isLiveChatServiceConnected}
      />

      {!isRightPanelOpen && (
        <button
          onClick={() => setIsRightPanelOpen(true)}
          className='bg-white-pure hover:bg-gray-5 fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          title={t('Open_settings')}
          aria-label={t('Open_settings')}
        >
          <Settings className='h-5 w-5' />
        </button>
      )}
    </div>
  )
}