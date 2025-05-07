// src/components/chatbot/MainLayout.tsx
'use client'

import React, { useState, useCallback, useEffect } from 'react'
import LeftPanel from './LeftPanel'
import RightSettingsPanel from './RightPanel'
import useConnection from './livechat/hooks/useConnection'
import { Settings } from 'lucide-react'
import { useSharedChatSocket } from './context/ChatSocketContext'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname, useSearchParams } from 'next/navigation' // Corrected import for next/navigation
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
  const { connected: isLiveConnected } = useConnection()
  const [currentView, setCurrentView] = useState<MainContentView>('chat')

  const {
    conversationList,
    activeConversationId,
    loadConversation,
    startNewConversation,
    isLoadingHistory,
    deleteConversation,
    clearConversation,
    renameConversation,
    pinConversation,
  } = useSharedChatSocket()

  // 1) Xác định currentView theo URL
  useEffect(() => {
    setCurrentView(pathname.endsWith('/history') ? 'history' : 'chat')
  }, [pathname])

  // 2) Sync activeConversationId -> URL (?id=...)
  useEffect(() => {
    const urlId = searchParams.get('id')
    const params = new URLSearchParams(searchParams.toString())
    let shouldUpdate = false

    if (currentView === 'chat') {
      if (activeConversationId) {
        if (urlId !== activeConversationId) {
          params.set('id', activeConversationId)
          shouldUpdate = true
        }
      } else if (urlId) {
        params.delete('id')
        shouldUpdate = true
      }
    } else { // history view
      if (urlId) {
        params.delete('id')
        shouldUpdate = true
      }
    }

    if (shouldUpdate) {
      const newQs = params.toString()
      // Use replace to avoid adding to browser history for URL param changes
      router.replace(`${pathname}${newQs ? `?${newQs}` : ''}`, { scroll: false })
    }
  }, [activeConversationId, currentView, pathname, router, searchParams])

  // 3) Load từ URL -> state (chỉ khi activeConversationId chưa có VÀ urlId hợp lệ)
  useEffect(() => {
    const urlId = searchParams.get('id')
    // Chỉ load từ URL nếu đang ở view chat, có urlId, và activeConversationId chưa được set (tránh ghi đè).
    // Và quan trọng là urlId này phải có trong conversationList (hoặc có cơ chế kiểm tra hợp lệ khác)
    // để tránh load một ID không tồn tại hoặc không thuộc về user.
    // Tuy nhiên, việc kiểm tra conversationList ở đây có thể phức tạp nếu list chưa load xong.
    // Logic `loadConversation` bên trong context nên xử lý việc ID không hợp lệ.
    if (currentView === 'chat' && urlId && !activeConversationId) {
      // Check if this urlId is a known conversation to prevent trying to load invalid IDs from stale URLs
      const isValidInList = conversationList.some(conv => conv.id === urlId);
      if (isValidInList) { // Or simply let loadConversation handle invalid IDs
          loadConversation(urlId)
      } else if (conversationList.length > 0 && !isLoadingHistory) {
        // If list is loaded and ID is not in it, maybe clear the invalid ID from URL
        console.warn(`URL ID ${urlId} not found in conversation list. Consider clearing it.`);
        // const params = new URLSearchParams(searchParams.toString());
        // params.delete('id');
        // router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`, { scroll: false });
      }
    }
  }, [searchParams, currentView, activeConversationId, loadConversation, conversationList, isLoadingHistory, pathname, router]) // Added dependencies

  // Khi click vào 1 conversation trong danh sách
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      loadConversation(conversationId)
      // Nếu đang ở trang history, chuyển về trang chat tương ứng
      if (currentView === 'history') {
        const targetChatPath = chatMode === 'live' ? '/chatbot/livechat' : '/chatbot/regularchat';
        router.push(targetChatPath); // ID sẽ được thêm vào URL bởi useEffect (2)
      }
    },
    [loadConversation, currentView, router, chatMode]
  )

  // Tạo cuộc chat mới
  const handleStartNewConversation = useCallback(() => {
    // 1. Gọi hàm startNewConversation từ context.
    // Hàm này sẽ:
    //    - Client-side: Đặt activeConversationId = null, xóa messages hiện tại.
    //    - Emits event lên server để tạo conversation mới.
    //    - Server sẽ trả về event onNewConversationStarted với ID mới, lúc đó activeConversationId mới được set.
    startNewConversation();

    const targetChatPath = chatMode === 'live' ? '/chatbot/livechat' : '/chatbot/regularchat';

    // 2. Điều hướng để "làm sạch" URL và component chat.
    // Điều này quan trọng để tránh component chat cố gắng load dựa trên ID cũ từ URL.
    // - Nếu đang ở trang history, luôn điều hướng.
    // - Nếu đang ở trang chat (currentView === 'chat'):
    //    - Nếu path hiện tại không phải là targetChatPath (ví dụ, từ live sang regular hoặc ngược lại do lỗi state), điều hướng.
    //    - Nếu path hiện tại là targetChatPath NHƯNG CÓ `id` trong URL (đang xem chat cũ), điều hướng để xóa `id` đó.
    if (currentView === 'history' || pathname !== targetChatPath || searchParams.has('id')) {
      router.push(targetChatPath);
    }
    // Nếu đã ở targetChatPath và không có 'id' (ví dụ /chatbot/regularchat),
    // thì startNewConversation() đã reset state client.
    // Component chat sẽ chờ activeConversationId mới từ server.
    // useEffect (2) sẽ cập nhật URL với ID mới khi nó có.
    // Không cần router.push dư thừa trong trường hợp này.

  }, [startNewConversation, router, chatMode, currentView, pathname, searchParams]);


  // Chuyển giữa live/regular
  const internalHandleChatModeChange = (mode: typeof chatMode) => {
    if (isLiveConnected && mode !== 'live') {
      console.warn('Cannot switch from live chat while connected.')
      return
    }
    handleChatModeNavigation(mode) // This function in ChatSettingsContext should handle navigation
  }

  return (
    <div className='flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-800'>
      <LeftPanel
        isOpen={isLeftPanelOpen}
        onToggleOpen={() => setIsLeftPanelOpen(v => !v)}
        currentChatMode={chatMode}
        onChatModeChange={internalHandleChatModeChange}
        isLiveConnected={isLiveConnected}
        conversationList={conversationList}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onStartNewConversation={handleStartNewConversation} // Truyền hàm đã cập nhật
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
        isLiveConnected={isLiveConnected}
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