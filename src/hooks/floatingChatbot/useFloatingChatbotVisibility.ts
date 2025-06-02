// src/hooks/floatingchatbot/useFloatingChatbotVisibility.ts
import { usePathname, pathnames as appPathnames } from '@/src/navigation';
import { CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING } from '@/src/app/[locale]/floatingchatbot/floatingChatbot.constants';
import { useUiStore } from '@/src/app/[locale]/chatbot/stores';
import { useEffect } from 'react';

export const useFloatingChatbotVisibility = () => {
  const currentPathname = usePathname();
  const isChatOpen = useUiStore(state => state.isFloatingChatOpen);
  const setIsChatOpen = useUiStore(state => state.setIsFloatingChatOpen);

  const shouldRenderFloatingChatbot = !CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING.includes(
    currentPathname as keyof typeof appPathnames
  );

  useEffect(() => {
    if (!shouldRenderFloatingChatbot && isChatOpen) {
      setIsChatOpen(false);
    }
  }, [shouldRenderFloatingChatbot, isChatOpen, setIsChatOpen]);

  return {
    shouldRenderFloatingChatbot,
    currentPathname, // Pass currentPathname out as it's used elsewhere
  };
};