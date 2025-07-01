// src/hooks/chatbot/useChatViewManager.ts
import { useState, useEffect, useRef } from 'react';
import { usePathname, AppPathname } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';
import { useConversationStore, useMessageStore } from '@/src/app/[locale]/chatbot/stores'; // Adjust path as needed
import { useShallow } from 'zustand/react/shallow';

export type MainContentView = 'chat' | 'history';
export const CHATBOT_HISTORY_PATH: AppPathname = '/chatbot/history';
export const CHATBOT_REGULARCHAT_PATH: AppPathname = '/chatbot/regularchat';

interface UseChatViewManagerProps {
  // Props if needed, for now it derives most from hooks
}

export function useChatViewManager() {
  const currentPathname = usePathname();
  const searchParamsHook = useSearchParams();

  const { activeConversationId, setActiveConversationId: storeSetActiveConversationId } =
    useConversationStore(
      useShallow(state => ({
        activeConversationId: state.activeConversationId,
        setActiveConversationId: state.setActiveConversationId,
      }))
    );

  const { resetChatUIForNewConversation } = useMessageStore(
    useShallow(state => ({
      resetChatUIForNewConversation: state.resetChatUIForNewConversation,
    }))
  );

  const [currentView, setCurrentView] = useState<MainContentView>(
    currentPathname === CHATBOT_HISTORY_PATH ? 'history' : 'chat'
  );

  const prevPathnameRef = useRef<string | null>(null);
  const prevSearchParamsStringRef = useRef<string>('');

  useEffect(() => {
    const newView = currentPathname === CHATBOT_HISTORY_PATH ? 'history' : 'chat';
    if (currentView !== newView) {
      setCurrentView(newView);
    }
  }, [currentPathname, currentView]);

  useEffect(() => {
    const currentUrlId = searchParamsHook.get('id');
    const currentSearchParamsString = searchParamsHook.toString();

    const justNavigatedToRegularChatBase =
      (prevPathnameRef.current !== CHATBOT_REGULARCHAT_PATH && currentPathname === CHATBOT_REGULARCHAT_PATH) ||
      (currentPathname === CHATBOT_REGULARCHAT_PATH && prevPathnameRef.current === CHATBOT_REGULARCHAT_PATH && prevSearchParamsStringRef.current !== '' && currentSearchParamsString === '');

    if (
      currentPathname === CHATBOT_REGULARCHAT_PATH &&
      !currentUrlId &&
      justNavigatedToRegularChatBase &&
      activeConversationId !== null
    ) {
      // console.log('[useChatViewManager] Blank Slate: Navigated to /chatbot/regularchat. Resetting.');
      storeSetActiveConversationId(null);
      resetChatUIForNewConversation(true);
    }

    prevPathnameRef.current = currentPathname;
    prevSearchParamsStringRef.current = currentSearchParamsString;
  }, [
    currentPathname,
    searchParamsHook,
    activeConversationId,
    storeSetActiveConversationId,
    resetChatUIForNewConversation,
  ]);

  return { currentView };
}