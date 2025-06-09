// src/hooks/floatingchatbot/usePageContextFetcher.ts
import { useEffect } from 'react';
import { usePageContextStore } from '@/src/app/[locale]/chatbot/stores/pageContextStore';
import { useUiStore } from '@/src/app/[locale]/chatbot/stores';
import { getCurrentPageTextContent, getCurrentPageUrl } from '@/src/app/[locale]/floatingchatbot/floatingChatbot.utils';
import {
  MIN_REASONABLE_TEXT_LENGTH,
  MAX_CONTEXT_FETCH_ATTEMPTS,
  CONTEXT_FETCH_RETRY_DELAY,
  CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING,
} from '@/src/app/[locale]/floatingchatbot/floatingChatbot.constants';
import { pathnames as appPathnames } from '@/src/navigation';


interface UsePageContextFetcherProps {
  isChatOpen: boolean;
  currentPathname: string; // Now passed as a prop
  shouldRender: boolean;
}

export const usePageContextFetcher = ({
  isChatOpen,
  currentPathname,
  shouldRender,
}: UsePageContextFetcherProps) => {
  const { setPageContext } = usePageContextStore();

  useEffect(() => {
    console.log(
      '[usePageContextFetcher] Effect triggered. Pathname:', currentPathname,
      'isChatOpen:', isChatOpen,
      'shouldRender:', shouldRender
    );

    let attemptCount = 0;
    let animationFrameId: number | null = null;
    let retryTimerId: NodeJS.Timeout | null = null;

    const fetchPageContextForPath = (path: string) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (retryTimerId) clearTimeout(retryTimerId);

      animationFrameId = requestAnimationFrame(() => {
        // Get the latest state from store inside rAF, though props should be up-to-date
        const currentFloatingChatOpenState = useUiStore.getState().isFloatingChatOpen;
        const currentShouldRenderState = !CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING.includes(
          path as keyof typeof appPathnames
        );

        if (currentFloatingChatOpenState && currentShouldRenderState) {
          const isAnyChatbotFullPage =
            CHATBOT_FULL_PAGE_PATHS_TO_HIDE_FLOATING.includes(path as keyof typeof appPathnames) ||
            path === appPathnames['/chatbot/landing'];

          if (!isAnyChatbotFullPage) {
            const pageText = getCurrentPageTextContent();
            const pageUrl = getCurrentPageUrl();

            if (pageText && !pageText.toLowerCase().includes("loading...") && pageText.length > MIN_REASONABLE_TEXT_LENGTH) {
              console.log(`[usePageContextFetcher] Updating page context (Attempt ${attemptCount + 1}) for: ${path}. Text length: ${pageText.length}`);
              setPageContext(pageText, pageUrl, true);
              attemptCount = 0;
            } else {
              attemptCount++;
              console.warn(`[usePageContextFetcher] Page content might be loading or too short (Attempt ${attemptCount}) for: ${path}. Text: "${pageText ? pageText.substring(0, 100) + '...' : 'null'}"`);
              if (attemptCount < MAX_CONTEXT_FETCH_ATTEMPTS) {
                retryTimerId = setTimeout(() => fetchPageContextForPath(path), CONTEXT_FETCH_RETRY_DELAY);
              } else {
                console.error(`[usePageContextFetcher] Max attempts reached for fetching context for: ${path}. Setting context to null.`);
                setPageContext(null, null, false);
                attemptCount = 0;
              }
            }
          } else {
            console.log(`[usePageContextFetcher] Clearing page context (rAF) for chatbot page: ${path}`);
            setPageContext(null, null, false);
            attemptCount = 0;
          }
        }
      });
    };

    if (isChatOpen && shouldRender) {
      fetchPageContextForPath(currentPathname);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        console.log('[usePageContextFetcher] Cleaning up page context rAF.');
      }
      if (retryTimerId) {
        clearTimeout(retryTimerId);
        console.log('[usePageContextFetcher] Cleaning up page context retry timer.');
      }
      attemptCount = 0; // Reset attempt count on cleanup
    };
  }, [isChatOpen, currentPathname, setPageContext, shouldRender]); // Dependencies are correct
};