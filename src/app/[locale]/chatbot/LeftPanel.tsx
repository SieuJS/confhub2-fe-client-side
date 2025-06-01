// src/app/[locale]/chatbot/LeftPanel.tsx
import React, { useState, useEffect } from 'react'
import ConversationList from './regularchat/ConversationList'
import { useUiStore, useConversationStore, useSettingsStore } from './stores'
import { useShallow } from 'zustand/react/shallow'
import { useLeftPanelNavigation } from '@/src/hooks/regularchat/useLeftPanelNavigation'
import NavigationMenu from './NavigationMenu'
import PanelToggleButton from './PanelToggleButton'
import AuthFooter from './regularchat/AuthFooter'
import { useLeftPanelAuthControls } from '@/src/hooks/regularchat/useLeftPanelAuthControls'

interface LeftPanelProps {
  onSelectConversation: (conversationId: string) => void
  onStartNewConversation: () => void
  onDeleteConversation: (conversationId: string) => void
  currentView: 'chat' | 'history'
  isLiveServiceConnected?: boolean
  deletingConversationId: string | null
  // Thêm props cho trạng thái panel
  isLeftPanelOpen: boolean
  setLeftPanelOpen: (isOpen: boolean) => void
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  onSelectConversation,
  onStartNewConversation,
  onDeleteConversation,
  currentView,
  isLiveServiceConnected,
  deletingConversationId,
  // Nhận các props mới
  isLeftPanelOpen,
  setLeftPanelOpen
}) => {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Loại bỏ việc lấy isLeftPanelOpen và toggleLeftPanel từ store ở đây
  // Vì chúng ta đã truyền từ MainLayout để xử lý đồng bộ.
  // const { isLeftPanelOpen, toggleLeftPanel } = useUiStore(
  //   useShallow(state => ({
  //     isLeftPanelOpen: state.isLeftPanelOpen,
  //     toggleLeftPanel: state.toggleLeftPanel
  //   }))
  // )

  const {
    isGenericChatFunctionalityDisabled,
    isCurrentFatalErrorAuthRelated,
    uiHasFatalError,
    isAuthInitializing
  } = useLeftPanelAuthControls()

  const {
    conversationList,
    activeConversationId,
    isLoadingHistory,
    clearConversation,
    renameConversation,
    pinConversation
  } = useConversationStore(
    useShallow(state => ({
      conversationList: state.conversationList,
      activeConversationId: state.activeConversationId,
      isLoadingHistory: state.isLoadingHistory,
      clearConversation: state.clearConversation,
      renameConversation: state.renameConversation,
      pinConversation: state.pinConversation
    }))
  )

  const { chatMode } = useSettingsStore(
    useShallow(state => ({ chatMode: state.chatMode }))
  )
  const { navItems } = useLeftPanelNavigation({
    currentView,
    isLiveServiceConnected
  })
  const showConversationList =
    isLeftPanelOpen && currentView === 'chat' && chatMode !== 'live'

  // Handle keyboard escape for closing the panel on mobile
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isLeftPanelOpen) {
        // Chỉ đóng panel nếu nó đang mở và không có modal nào khác đang mở
        // (logic này có thể phức tạp hơn nếu có nhiều modal)
        setLeftPanelOpen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isLeftPanelOpen, setLeftPanelOpen])

  // Spinner hiển thị trong panel thay vì thay thế panel
  const loadingSpinner = (
    <div className='flex h-full w-full items-center justify-center'>
      <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900'></div>
    </div>
  )

  return (
    // Thay đổi class ở đây để xử lý responsive
    <div
      className={`
        
        fixed inset-y-0 left-0 z-50 flex h-full flex-col overflow-hidden bg-white-pure
        shadow-xl transition-transform duration-300 ease-in-out
        ${isLeftPanelOpen ? 'translate-x-0' : '-translate-x-full'}
         w-72
         transform  md:relative md:h-auto md:flex-shrink-0 md:translate-x-0 md:transition-all md:duration-300 md:ease-in-out
        ${isLeftPanelOpen ? 'md:w-72' : 'md:w-16'} 
      `}
      aria-modal={isLeftPanelOpen ? 'true' : undefined} // Chỉ khi panel mở trên mobile
      role={isLeftPanelOpen ? 'dialog' : undefined}
      aria-labelledby='left-panel-title'
      aria-hidden={
        !isLeftPanelOpen && window.innerWidth < 768 ? 'true' : undefined
      } // Ẩn hoàn toàn với screen reader trên mobile khi đóng
    >
      {isAuthInitializing && !isClient ? (
        loadingSpinner
      ) : (
        <div className='flex h-full w-full flex-col overflow-hidden'>
          <div
            className={`flex flex-shrink-0 flex-col ${isLeftPanelOpen ? 'p-0 lg:p-3' : 'space-y-1 p-2'}`}
          >
            <PanelToggleButton
              isPanelOpen={isLeftPanelOpen}
              onTogglePanel={() => setLeftPanelOpen(!isLeftPanelOpen)} // Sử dụng setLeftPanelOpen từ props
              disabled={
                uiHasFatalError &&
                !isCurrentFatalErrorAuthRelated &&
                !isLeftPanelOpen
              }
            />
            <NavigationMenu
              navItems={navItems}
              isLeftPanelOpen={isLeftPanelOpen}
              disabled={isGenericChatFunctionalityDisabled}
            />
          </div>

          {isLeftPanelOpen && (
            <div className='mx-3 my-2 border-t border-gray-200'></div>
          )}

          {showConversationList && (
            <ConversationList
              conversationList={conversationList}
              activeConversationId={activeConversationId}
              onSelectConversation={onSelectConversation}
              onStartNewConversation={onStartNewConversation}
              isLoading={isLoadingHistory}
              onDeleteConversation={onDeleteConversation}
              onClearConversation={clearConversation}
              onRenameConversation={renameConversation}
              onPinConversation={pinConversation}
              currentView={currentView}
              deletingConversationId={deletingConversationId}
              disabled={isGenericChatFunctionalityDisabled}
            />
          )}
          {isClient && <AuthFooter isLeftPanelOpen={isLeftPanelOpen} />}
        </div>
      )}
    </div>
  )
}

export default LeftPanel
