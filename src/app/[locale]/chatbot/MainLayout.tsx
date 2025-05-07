// src/components/chatbot/MainLayout.tsx
'use client'

import React, { useState, useCallback, useEffect } from 'react'
import LeftPanel from './LeftPanel'
import RightSettingsPanel from './RightPanel'
import useConnection from './livechat/hooks/useConnection'
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
      router.replace(`${pathname}${newQs ? `?${newQs}` : ''}`)
    }
  }, [activeConversationId, currentView, pathname, router, searchParams])

  // 3) Load từ URL -> state (chỉ khi activeConversationId chưa có)
  useEffect(() => {
    const urlId = searchParams.get('id')
    if (currentView === 'chat' && urlId && !activeConversationId) {
      loadConversation(urlId)
    }
  }, [searchParams, currentView, activeConversationId, loadConversation])

  // Khi click vào 1 conversation trong danh sách
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      loadConversation(conversationId)
      if (currentView === 'history') {
        router.push('/chatbot')
      }
    },
    [loadConversation, currentView, router]
  )

  // Tạo cuộc chat mới
  const handleStartNewConversation = useCallback(() => {
    startNewConversation()
    if (currentView === 'history') {
      router.push('/chatbot')
    }
  }, [startNewConversation, currentView, router])

  // Chuyển giữa live/regular
  const internalHandleChatModeChange = (mode: typeof chatMode) => {
    if (isLiveConnected && mode !== 'live') {
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
        isLiveConnected={isLiveConnected}
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
