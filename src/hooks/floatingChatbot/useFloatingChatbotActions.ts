// src/hooks/floatingchatbot/useFloatingChatbotActions.ts
import { useCallback } from 'react';
import {
  useSettingsStore,
  useMessageStore,
  useConversationStore,
  useUiStore,
} from '@/src/app/[locale]/chatbot/stores';
import { usePageContextStore } from '@/src/app/[locale]/chatbot/stores/pageContextStore';
import {
  CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING,
} from '@/src/app/[locale]/floatingchatbot/floatingChatbot.constants';
import { pathnames as appPathnames } from '@/src/navigation';

interface UseFloatingChatbotActionsProps {
  currentPathname: string;
  shouldRenderFloatingChatbot: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  adjustPositionToFitScreen: () => void;
  setIsSettingsOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
  setRunOpenAnimation: (run: boolean) => void;
  isSettingsOpen: boolean;
  isInitialized: boolean; // <<< THÊM PROP NÀY
}

export const useFloatingChatbotActions = ({
  currentPathname,
  shouldRenderFloatingChatbot,
  position,
  size,
  adjustPositionToFitScreen,
  setIsSettingsOpen,
  setRunOpenAnimation,
  isSettingsOpen,
  isInitialized, // <<< NHẬN PROP NÀY
}: UseFloatingChatbotActionsProps) => {
  const setIsChatOpen = useUiStore(state => state.setIsFloatingChatOpen);
  const setChatMode = useSettingsStore(state => state.setChatMode);
  const currentStoreChatMode = useSettingsStore(state => state.chatMode);
  const resetChatUIForNewConversation = useMessageStore(
    state => state.resetChatUIForNewConversation
  );
  const setActiveConversationId = useConversationStore(
    state => state.setActiveConversationId
  );
  const activeConversationId = useConversationStore(
    state => state.activeConversationId
  );
  const { setPageContext, clearPageContext } = usePageContextStore();

  const openChatbot = useCallback(() => {
    if (!shouldRenderFloatingChatbot) return;

    // console.log('[Actions] openChatbot called. isInitialized:', isInitialized);

    setIsChatOpen(true); // This triggers `isEnabled` in useFloatingWindowControls

    // Animation will be triggered by the useEffect in FloatingChatbot.tsx
    // once isInitialized becomes true AND isChatOpen is true.
    // However, we can still set runOpenAnimation here if we know it's already initialized.
    // The useEffect in FloatingChatbot.tsx will handle the timing.
    if (isInitialized) {
      // console.log('[Actions] Chat is already initialized, setting runOpenAnimation true.');
      setRunOpenAnimation(true);
    } else {
      // console.log('[Actions] Chat NOT YET initialized. Animation will wait for isInitialized to be true.');
      // setRunOpenAnimation(false); // Ensure it's false if not initialized, though useEffect in parent should handle this
    }


    const isAnyChatbotFullPageImmediate =
      CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING.includes(currentPathname as keyof typeof appPathnames) ||
      currentPathname === appPathnames['/chatbot/landing'];

    if (!isAnyChatbotFullPageImmediate) {
      // Context fetching is handled by usePageContextFetcher
    } else {
      setPageContext(null, null, false);
    }

    if (activeConversationId === null) {
      if (currentStoreChatMode !== 'regular') {
        setChatMode('regular');
      }
      resetChatUIForNewConversation(true);
    }
    setIsSettingsOpen(false);

    // Adjust position after potential state updates from useFloatingWindowControls
    // and after isInitialized might have become true.
    // The requestAnimationFrame helps ensure this runs after the current render cycle.
    requestAnimationFrame(() => {
      if (isInitialized) { // Only adjust if initialized, otherwise position might be unstable
        // console.log('[Actions] Adjusting position in openChatbot (rAF)');
        adjustPositionToFitScreen();
      }
    });

  }, [
    shouldRenderFloatingChatbot,
    setIsChatOpen,
    activeConversationId,
    currentPathname,
    setPageContext,
    currentStoreChatMode,
    setChatMode,
    resetChatUIForNewConversation,
    adjustPositionToFitScreen,
    setRunOpenAnimation,
    setIsSettingsOpen,
    isInitialized, // <<< THÊM VÀO DEPENDENCIES
  ]);

  const handleMinimizeChat = useCallback(() => {
    // console.log('[Actions] handleMinimizeChat. Saving pos:', position, 'size:', size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbotPosition', JSON.stringify(position));
      localStorage.setItem('chatbotSize', JSON.stringify(size));
    }
    setIsChatOpen(false);
    setRunOpenAnimation(false); // Stop animation if it was running
    if (isSettingsOpen) setIsSettingsOpen(false);
  }, [position, size, isSettingsOpen, setIsChatOpen, setIsSettingsOpen, setRunOpenAnimation]);

  const handleCloseChat = useCallback(() => {
    // console.log('[Actions] handleCloseChat. Saving pos:', position, 'size:', size);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatbotPosition', JSON.stringify(position));
      localStorage.setItem('chatbotSize', JSON.stringify(size));
    }
    setIsChatOpen(false);
    setRunOpenAnimation(false); // Stop animation
    setIsSettingsOpen(false);
    clearPageContext();
    setActiveConversationId(null);
    resetChatUIForNewConversation(true);
  }, [
    position, size, clearPageContext, setActiveConversationId,
    resetChatUIForNewConversation, setIsChatOpen, setIsSettingsOpen, setRunOpenAnimation
  ]);

  const toggleSettingsPanel = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsSettingsOpen(prev => !prev);
  }, [setIsSettingsOpen]);

  return {
    openChatbot,
    handleMinimizeChat,
    handleCloseChat,
    toggleSettingsPanel,
  };
};