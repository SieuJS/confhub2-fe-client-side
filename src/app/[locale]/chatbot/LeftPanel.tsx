// src/app/[locale]/chatbot/LeftPanel.tsx
import React from 'react';
import ConversationList from './regularchat/ConversationList';
import {
  useUiStore,
  useConversationStore,
} from './stores';
import { useShallow } from 'zustand/react/shallow';
// Import custom hook and child components
import { useLeftPanelNavigation, NavItem } from '@/src/hooks/chatbot/useLeftPanelNavigation'; 
import NavigationMenu from './NavigationMenu'; 
import PanelToggleButton from './PanelToggleButton'; 

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
  deletingConversationId,
}) => {
  // --- From UiStore ---
  const { isLeftPanelOpen, toggleLeftPanel } = useUiStore(
    useShallow(state => ({
      isLeftPanelOpen: state.isLeftPanelOpen,
      toggleLeftPanel: state.toggleLeftPanel,
    }))
  );

  // --- From ConversationStore (for ConversationList) ---
  const {
    conversationList,
    activeConversationId,
    isLoadingHistory,
    clearConversation,
    renameConversation,
    pinConversation,
  } = useConversationStore(
    useShallow(state => ({
      conversationList: state.conversationList,
      activeConversationId: state.activeConversationId,
      isLoadingHistory: state.isLoadingHistory,
      clearConversation: state.clearConversation,
      renameConversation: state.renameConversation,
      pinConversation: state.pinConversation,
    }))
  );

  // --- Custom Hook for Navigation Logic ---
  const { navItems } = useLeftPanelNavigation({
    currentView,
    isLiveServiceConnected,
  });

  return (
    <div
      className={`bg-white-pure h-full flex-shrink-0 shadow-xl transition-all duration-300 ease-in-out  ${
        isLeftPanelOpen ? 'w-72' : 'w-16'
      }`}
      aria-hidden={!isLeftPanelOpen || undefined}
    >
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div
          className={`flex flex-shrink-0 flex-col ${isLeftPanelOpen ? 'p-3' : 'space-y-1 p-2'}`}
        >
          <PanelToggleButton
            isPanelOpen={isLeftPanelOpen}
            onTogglePanel={toggleLeftPanel}
          />
          <NavigationMenu navItems={navItems} isLeftPanelOpen={isLeftPanelOpen} />
        </div>

        {isLeftPanelOpen && <div className='border-gray-20 mx-3 my-2 border-t '></div>}

        {isLeftPanelOpen &&
          currentView === 'chat' && (
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
            />
          )}
      </div>
    </div>
  );
};

export default LeftPanel;