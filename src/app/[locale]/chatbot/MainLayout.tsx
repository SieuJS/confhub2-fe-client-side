// src/components/chatbot/MainLayout.tsx
'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react' // Thêm useRef
import LeftPanel from './LeftPanel'
import RightSettingsPanel from './RightPanel'
import useConnection from './livechat/hooks/useConnection' // This is for live chat specific connection, not the main socket
import { Settings } from 'lucide-react'
import { useSharedChatSocket } from './context/ChatSocketContext'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useChatSettings } from './context/ChatSettingsContext'

interface MainLayoutComponentProps {
  children: React.ReactNode
}

type MainContentView = 'chat' | 'history'

export default function MainLayoutComponent({ children }: MainLayoutComponentProps) {
  const t = useTranslations()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const {
    chatMode,
    handleChatModeNavigation
  } = useChatSettings()

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  // const { connected: isLiveConnected } = useConnection() // This is for live chat, not the general socket

  const {
    conversationList,
    activeConversationId,
    loadConversation,
    startNewConversation,
    isLoadingHistory,
    isConnected, // <--- Lấy trạng thái kết nối từ context
    // Các actions khác
    deleteConversation,
    clearConversation,
    renameConversation,
    pinConversation,
    isServerReadyForCommands, // THÊM MỚI: Lấy từ useSharedChatSocket

  } = useSharedChatSocket()

  const { connected: isLiveChatServiceConnected } = useConnection(); // Đổi tên để tránh nhầm lẫn

  const [currentView, setCurrentView] = useState<MainContentView>('chat')

  // Cờ để báo hiệu rằng chúng ta vừa cố gắng load từ URL
  const didAttemptLoadFromUrlRef = useRef(false);
  const previousIsLoadingHistoryRef = useRef(isLoadingHistory);


  // 1) Xác định currentView theo URL (giữ nguyên)
  useEffect(() => {
    setCurrentView(pathname.endsWith('/history') ? 'history' : 'chat')
  }, [pathname]);



  // 2) Sync activeConversationId <-> URL (?id=...)
  useEffect(() => {
    const urlId = searchParams.get('id');
    const params = new URLSearchParams(searchParams.toString());
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
      } else { // Không có activeConversationId
        if (urlId) { // Có ID trên URL
          // CHỈ XÓA urlId NẾU:
          // 1. Server đã sẵn sàng (isServerReadyForCommands = true)
          // 2. KHÔNG đang loading history (isLoadingHistory = false)
          // 3. KHÔNG vừa mới cố gắng load từ URL (didAttemptLoadFromUrlRef.current = false)
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
      const newQueryString = params.toString();
      console.log(`[MainLayout Effect 2 COMMIT] Updating URL to: ${pathname}${newQueryString ? `?${newQueryString}` : ''}`);
      router.replace(`${pathname}${newQueryString ? `?${newQueryString}` : ''}`, { scroll: false });
    }
    // Thêm isServerReadyForCommands vào dependencies của Effect 2
  }, [activeConversationId, currentView, pathname, router, searchParams, isLoadingHistory, isConnected, isServerReadyForCommands, conversationList]);


  // 3) Load từ URL -> state
  useEffect(() => {
    const urlId = searchParams.get('id');
    // Log state isServerReadyForCommands ở đây để chắc chắn nó được cập nhật
    console.log(`[MainLayout Effect 3 Check] urlId: ${urlId}, currentView: ${currentView}, activeId: ${activeConversationId}, isLoadingHistory: ${isLoadingHistory}, isConnected: ${isConnected}, isServerReady: ${isServerReadyForCommands}, didAttemptLoad: ${didAttemptLoadFromUrlRef.current}`);

    if (
      currentView === 'chat' &&
      urlId &&
      !activeConversationId &&
      !isLoadingHistory &&
      isConnected &&
      isServerReadyForCommands && // Điều kiện quan trọng
      !didAttemptLoadFromUrlRef.current
    ) {
      console.log(`[MainLayout Effect 3 ACTION] Attempting to load conversation ${urlId} from URL. Setting didAttemptLoadFromUrlRef.`);
      didAttemptLoadFromUrlRef.current = true;
      loadConversation(urlId);
    } else if (currentView === 'chat' && urlId && !activeConversationId && !isLoadingHistory && (!isConnected || !isServerReadyForCommands)) {
      console.log(`[MainLayout Effect 3 INFO] Holding off load for ${urlId}: Socket not connected OR server not ready yet. (isConnected: ${isConnected}, isServerReady: ${isServerReadyForCommands})`);
    }
    // Thêm isServerReadyForCommands vào dependencies của Effect 3
  }, [searchParams, currentView, activeConversationId, loadConversation, isLoadingHistory, pathname, isConnected, isServerReadyForCommands]);

  // Khi click vào 1 conversation trong danh sách
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      if (!isConnected) {
        console.warn("[MainLayout] Cannot select conversation: Socket not connected.");
        // TODO: Hiển thị thông báo cho người dùng
        return;
      }
      // loadConversation sẽ set activeConversationId (sau khi server phản hồi) và isLoadingHistory=true
      didAttemptLoadFromUrlRef.current = false; // Reset cờ vì đây là hành động chọn trực tiếp

      loadConversation(conversationId);
      if (currentView === 'history') {
        const targetChatPath = chatMode === 'live' ? '/chatbot/livechat' : '/chatbot/regularchat';
        router.push(targetChatPath); // ID sẽ được useEffect (2) thêm vào
      }
    },
    [loadConversation, currentView, router, chatMode, isConnected]
  );

  // Tạo cuộc chat mới
  const handleStartNewConversation = useCallback(() => {
    if (!isConnected) {
      console.warn("[MainLayout] Cannot start new conversation: Socket not connected.");
      // TODO: Hiển thị thông báo cho người dùng
      return;
    }
    // startNewConversation sẽ set activeConversationId=null, isLoadingHistory=true
    didAttemptLoadFromUrlRef.current = false; // Reset cờ

    startNewConversation();

    const targetChatPath = chatMode === 'live' ? '/chatbot/livechat' : '/chatbot/regularchat';

    if (currentView === 'history' || pathname !== targetChatPath || searchParams.has('id')) {
      router.push(targetChatPath);
    }
  }, [startNewConversation, router, chatMode, currentView, pathname, searchParams, isConnected]);

  const internalHandleChatModeChange = (mode: typeof chatMode) => {
    if (isLiveChatServiceConnected && mode !== 'live') {
      console.warn('Cannot switch from live chat while connected.')
      return
    }
    handleChatModeNavigation(mode)
  }


  return (
    <div className='flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-800'>
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
        onDeleteConversation={deleteConversation}
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
          className='fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500'
          title={t('Open_settings')}
          aria-label={t('Open_settings')}
        >
          <Settings className='h-5 w-5' />
        </button>
      )}
    </div>
  )
}