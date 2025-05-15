// src/app/[locale]/chatbot/LeftPanel.tsx
import React, { useState, useEffect } from 'react';
import ConversationList from './regularchat/ConversationList';
import { useUiStore, useConversationStore, useSettingsStore } from './stores';
import { useShallow } from 'zustand/react/shallow';
import { useLeftPanelNavigation } from '@/src/hooks/chatbot/useLeftPanelNavigation';
import NavigationMenu from './NavigationMenu';
import PanelToggleButton from './PanelToggleButton';
import AuthFooter from './regularchat/AuthFooter';
import { useLeftPanelAuthControls } from '@/src/hooks/chatbot/useLeftPanelAuthControls';

interface LeftPanelProps {
  onSelectConversation: (conversationId: string) => void;
  onStartNewConversation: () => void;
  onDeleteConversation: (conversationId: string) => void;
  currentView: 'chat' | 'history';
  isLiveServiceConnected?: boolean;
  deletingConversationId: string | null;
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  onSelectConversation,
  onStartNewConversation,
  onDeleteConversation,
  currentView,
  isLiveServiceConnected,
  deletingConversationId
}) => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  const {
    isLeftPanelOpen,
    toggleLeftPanel,
  } = useUiStore(
    useShallow(state => ({
      isLeftPanelOpen: state.isLeftPanelOpen,
      toggleLeftPanel: state.toggleLeftPanel,
    }))
  );

  // Gọi hook MỘT LẦN ở top level
  const {
    isGenericChatFunctionalityDisabled,
    isCurrentFatalErrorAuthRelated,
    uiHasFatalError,
    isAuthInitializing // Lấy isAuthInitializing từ đây
  } = useLeftPanelAuthControls();


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
  );

  const { chatMode } = useSettingsStore(useShallow(state => ({ chatMode: state.chatMode })));
  const { navItems } = useLeftPanelNavigation({ currentView, isLiveServiceConnected });
  const showConversationList = isLeftPanelOpen && currentView === 'chat' && chatMode !== 'live';

  // Sử dụng giá trị isAuthInitializing đã lấy từ hook ở trên
  if (!isClient && isAuthInitializing) { // <--- SỬA Ở ĐÂY
    return (
      <div
        className={`h-full flex-shrink-0 bg-white-pure shadow-xl transition-all duration-300 ease-in-out ${isLeftPanelOpen ? 'w-72' : 'w-16'} flex items-center justify-center`}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex-shrink-0 bg-white-pure shadow-xl transition-all duration-300 ease-in-out ${isLeftPanelOpen ? 'w-72' : 'w-16'}`}
      aria-hidden={!isLeftPanelOpen || undefined}
    >
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div className={`flex flex-shrink-0 flex-col ${isLeftPanelOpen ? 'p-3' : 'space-y-1 p-2'}`}>
          <PanelToggleButton
            isPanelOpen={isLeftPanelOpen}
            onTogglePanel={toggleLeftPanel}
            disabled={(uiHasFatalError && !isCurrentFatalErrorAuthRelated) && !isLeftPanelOpen}
          />
          <NavigationMenu
            navItems={navItems}
            isLeftPanelOpen={isLeftPanelOpen}
            disabled={isGenericChatFunctionalityDisabled}
          />
        </div>

        {isLeftPanelOpen && <div className='mx-3 my-2 border-t border-gray-200'></div>}

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

        {/*
          Không cần kiểm tra isClient ở đây nữa nếu AuthFooter tự xử lý việc render
          hoặc nếu logic loading spinner ở trên đã đủ.
          Nếu AuthFooter CẦN `isClient` để hoạt động đúng, bạn có thể truyền nó vào.
          Tuy nhiên, thông thường, component con nên tự quản lý trạng thái client-side của nó nếu cần.
        */}
        {isClient && <AuthFooter isLeftPanelOpen={isLeftPanelOpen} />}
        {/* Hoặc đơn giản là: <AuthFooter isLeftPanelOpen={isLeftPanelOpen} />
            nếu AuthFooter không cần isClient hoặc đã có logic isClient riêng.
            Dựa vào code AuthFooter bạn cung cấp, nó không trực tiếp dùng isClient prop.
            Nó chỉ dùng isAuthInitializing, mà isAuthInitializing đã được xử lý ở spinner phía trên.
        */}
      </div>
    </div>
  );
};

export default LeftPanel;