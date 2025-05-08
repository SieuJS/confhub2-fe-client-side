

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

  useEffect(() => {
    console.log(
      `[MainLayout DEBUG isLoadingHistory] isLoadingHistory: ${isLoadingHistory}, activeId: ${activeConversationId}, urlId: ${searchParamsHook.get('id')}, isServerReady: ${isServerReadyForCommands}, isConnected: ${isConnected}`
    );
  }, [isLoadingHistory, activeConversationId, searchParamsHook, isServerReadyForCommands, isConnected]); // Add all relevant states


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

    // If activeConversationId is null AND we are on a chat page,
    // it usually means a "new chat" was started or we are landing on /regularchat.
    // In the "new chat" case, we don't want to immediately try loading a urlId
    // that might be stale from the *previous* page state.
    // The didAttemptLoadFromUrlRef helps, but let's be more explicit.
    const isStartingNewChatOptimistically = activeConversationId === null && currentView === 'chat';

    if (
      currentView === 'chat' &&
      urlId &&
      !activeConversationId && // No active one set YET by an explicit load or new chat server response
      !isLoadingHistory &&    // Not already loading something
      isConnected &&
      isServerReadyForCommands &&
      !didAttemptLoadFromUrlRef.current // Haven't tried loading this urlId yet
      // !isStartingNewChatOptimistically // Add this? If activeId is null, maybe don't load from URL immediately
      // This might be too restrictive if user directly lands with an ID and no activeId yet.
      // The didAttemptLoadFromUrlRef is probably the better guard here.
    ) {
      // If activeConversationId is null (e.g. after clicking "New Chat")
      // but urlId still exists from a previous state before router.push fully updates searchParamsHook,
      // we might re-load the old chat.
      // The check `!activeConversationId` is meant to prevent loading if one is already active.
      // The `handleStartNewConversation` in MainLayout now does `didAttemptLoadFromUrlRef.current = false;`
      // which is good.

      console.log(`[MainLayout Effect 3 ACTION] Attempting to load conversation ${urlId} from URL. Setting didAttemptLoadFromUrlRef.`);
      didAttemptLoadFromUrlRef.current = true;
      loadConversation(urlId);
    } else if (currentView === 'chat' && urlId && !activeConversationId && !isLoadingHistory && (!isConnected || !isServerReadyForCommands)) {
      console.log(`[MainLayout Effect 3 INFO] Holding off load for ${urlId}: Socket/Server not ready.`);
    } else if (isStartingNewChatOptimistically && urlId) {
      console.log(`[MainLayout Effect 3 INFO] New chat started (activeId is null), ignoring potentially stale urlId ${urlId} for now.`);
    }
  }, [
    searchParamsHook, currentView, activeConversationId, loadConversation,
    isLoadingHistory, pathname, isConnected, isServerReadyForCommands, isProcessingDeletion
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
    // Check full readiness before starting
    if (!isConnected || !isServerReadyForCommands) { // <--- ADD isServerReadyForCommands CHECK
      console.warn("[MainLayout] Cannot start new conversation: Socket not connected or server not ready.");
      return;
    }
    didAttemptLoadFromUrlRef.current = false; // Reset this flag

    console.log("[MainLayout] handleStartNewConversation called. Calling startNewConversation action."); // Add log
    startNewConversation(); // This is the action from useSharedChatSocket

    const targetChatPath = chatMode === 'live' ? CHATBOT_LIVECHAT_PATH : CHATBOT_REGULARCHAT_PATH;
    // We always want to navigate to the base path for a new chat, ensuring no 'id' param.
    // The existing logic for isAlreadyOnTargetChatPageWithoutId seems fine, but the key is the push.
    console.log(`[MainLayout] Navigating to new chat. Target base path: ${targetChatPath}`);
    router.push(targetChatPath); // This will clear the 'id' from URL

  }, [
    startNewConversation,
    router,
    chatMode,
    // currentView, // Not strictly needed for the core logic of starting, but for navigation decision
    // pathname, // Not strictly needed
    // searchParamsHook, // Not strictly needed
    isConnected,
    isServerReadyForCommands // <--- ADD DEPENDENCY
  ]);

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
    <div className='bg-gray-10 flex h-screen overflow-hidden' >
      <LeftPanel
        isOpen={isLeftPanelOpen}
        onToggleOpen={() => setIsLeftPanelOpen(v => !v)
        }
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

      <main className='relative flex-1 overflow-hidden transition-all duration-300 ease-in-out' >
        <div className='h-full w-full' > {children} </div>
      </main>

      < RightSettingsPanel
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
      )
      }
    </div >
  )
}
