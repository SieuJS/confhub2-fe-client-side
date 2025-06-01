// src/app/[locale]/chatbot/MainLayout.tsx
'use client'

import React, { useEffect, useRef } from 'react'
import LeftPanel from './LeftPanel'
import RightSettingsPanel from './RightPanel'
import { useTranslations } from 'next-intl'
import { AppPathname } from '@/src/navigation'
import { useSearchParams } from 'next/navigation'
import {
  useConversationStore,
  useUiStore // <<< IMPORT useUiStore
} from './stores'
import { useShallow } from 'zustand/react/shallow'

// Import custom hooks
import { useAppInitialization } from '@/src/hooks/regularchat/useAppInitialization'
import { useUrlConversationSync } from '@/src/hooks/regularchat/useUrlConversationSync'
import { useConversationLifecycleManager } from '@/src/hooks/regularchat/useConversationLifecycleManager'
import { useChatViewManager } from '@/src/hooks/regularchat/useChatViewManager'
import { useConversationActions } from '@/src/hooks/regularchat/useConversationActions'

// Import child components
import DeletionOverlay from './regularchat/DeletionOverlay'
import SettingsToggleButton from './regularchat/SettingToggleButton'
import LeftPanelExternalToggleButton from './LeftPanelExternalToggleButton' // <<< IMPORT NÚT MỚI

interface MainLayoutComponentProps {
  children: React.ReactNode
  isLiveChatContextActive?: boolean
}

export const CHATBOT_HISTORY_PATH: AppPathname = '/chatbot/history'
export const CHATBOT_LIVECHAT_PATH: AppPathname = '/chatbot/livechat'
export const CHATBOT_REGULARCHAT_PATH: AppPathname = '/chatbot/regularchat'

export default function MainLayoutComponent({
  children,
  isLiveChatContextActive
}: MainLayoutComponentProps) {
  const t = useTranslations()
  const searchParamsHook = useSearchParams()

  // --- Store Hooks  ---
  const { activeConversationId } = useConversationStore(
    useShallow(state => ({
      activeConversationId: state.activeConversationId
    }))
  )

  // Lấy trạng thái isLeftPanelOpen từ store
  const { isLeftPanelOpen, setLeftPanelOpen } = useUiStore(
    useShallow(state => ({
      isLeftPanelOpen: state.isLeftPanelOpen,
      setLeftPanelOpen: state.setLeftPanelOpen
    }))
  )

  // --- Custom Hooks for Logic Management ---
  useAppInitialization()
  const { currentView } = useChatViewManager()
  const {
    handleSelectConversation,
    handleStartNewConversation,
    handleDeleteConversation,
    isProcessingDeletion,
    idBeingDeleted,
    resetDeletionState
  } = useConversationActions({ currentView })

  const { didAttemptLoadFromUrlRef } = useUrlConversationSync({
    currentView,
    isProcessingDeletion,
    idBeingDeleted
  })

  // --- Refs needed by hooks ---
  const prevActiveIdRef = useRef<string | null>(null)

  useEffect(() => {
    prevActiveIdRef.current = activeConversationId
  }, [activeConversationId])

  useConversationLifecycleManager({
    currentView,
    isProcessingDeletion,
    idBeingDeleted,
    prevActiveIdRef,
    urlIdParam: searchParamsHook.get('id'),
    searchParamsString: searchParamsHook.toString(),
    onDeletionProcessed: () => {
      console.log(
        '[MainLayout] onDeletionProcessed called from LifecycleManager. Resetting deletion state.'
      )
      resetDeletionState()
    },
    didAttemptLoadFromUrlRef: didAttemptLoadFromUrlRef,
    onNotFoundProcessed: () => {
      console.log(
        '[MainLayout] onNotFoundProcessed called from LifecycleManager.'
      )
      if (didAttemptLoadFromUrlRef.current) {
        didAttemptLoadFromUrlRef.current = false
        console.log('[MainLayout] Reset didAttemptLoadFromUrlRef to false.')
      }
    }
  })

  // Đóng LeftPanel khi màn hình lớn hơn MD và panel đang mở (chuyển từ mobile sang desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isLeftPanelOpen) {
        // MD breakpoint is typically 768px in Tailwind
        setLeftPanelOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isLeftPanelOpen, setLeftPanelOpen])

  return (
    <div className='flex h-screen overflow-hidden bg-gray-10'>
      {/* Backdrop cho LeftPanel (chỉ hiển thị trên mobile) */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out md:hidden
          ${isLeftPanelOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setLeftPanelOpen(false)}
        aria-hidden={!isLeftPanelOpen}
        aria-label={t('Close_navigation')}
      />
      {/* Nút mở LeftPanel bên ngoài (chỉ hiển thị trên mobile khi panel đóng) */}
      <LeftPanelExternalToggleButton /> {/* <<< THÊM NÚT MỚI VÀO ĐÂY */}
      <LeftPanel
        onSelectConversation={handleSelectConversation}
        onStartNewConversation={handleStartNewConversation}
        onDeleteConversation={handleDeleteConversation}
        currentView={currentView}
        deletingConversationId={isProcessingDeletion ? idBeingDeleted : null}
        isLeftPanelOpen={isLeftPanelOpen}
        setLeftPanelOpen={setLeftPanelOpen}
      />
      <main className='relative flex-1 overflow-hidden transition-all duration-300 ease-in-out'>
        <DeletionOverlay
          isVisible={
            isProcessingDeletion &&
            idBeingDeleted !== null &&
            currentView === 'chat' &&
            activeConversationId === idBeingDeleted
          }
        />
        <div className='h-full w-full'> {children} </div>
      </main>
      <RightSettingsPanel isLiveChatContextActive={isLiveChatContextActive} />
      <SettingsToggleButton isProcessingDeletion={isProcessingDeletion} />
    </div>
  )
}
