import { useEffect, useRef } from 'react';
import { useRouter, usePathname, AppPathname } from '@/src/navigation';
import { useConversationStore, useSocketStore } from '@/src/app/[locale]/chatbot/stores';
import { useShallow } from 'zustand/react/shallow';
import { useSearchParams } from 'next/navigation';
import { CHATBOT_LIVECHAT_PATH, CHATBOT_REGULARCHAT_PATH, CHATBOT_HISTORY_PATH } from '@/src/app/[locale]/chatbot/MainLayout';

interface UseUrlConversationSyncProps {
  currentView: 'chat' | 'history';
  isProcessingDeletion: boolean;
  idBeingDeleted: string | null;
}

export function urlSearchParamsToObject(params: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {};
  if (params) {
    for (const [key, value] of params.entries()) {
      obj[key] = value;
    }
  }
  return obj;
}

export function useUrlConversationSync({
  currentView,
  isProcessingDeletion,
  idBeingDeleted,
}: UseUrlConversationSyncProps) {
  const router = useRouter();
  const currentPathname = usePathname();
  const searchParamsHook = useSearchParams();

  const {
    activeConversationId,
    isLoadingHistory,
    loadConversation,
  } = useConversationStore(
    useShallow(state => ({
      activeConversationId: state.activeConversationId,
      isLoadingHistory: state.isLoadingHistory,
      loadConversation: state.loadConversation,
    }))
  );

  const { isConnected, isServerReadyForCommands } = useSocketStore(
    useShallow(state => ({
      isConnected: state.isConnected,
      isServerReadyForCommands: state.isServerReadyForCommands,
    }))
  );

  const internalUrlUpdateRef = useRef(false);
  const didAttemptLoadFromUrlRef = useRef(false);
  const prevUrlIdParamForEffect2ResetRef = useRef<string | null>(null);
  const prevActiveConversationIdForEffect1Ref = useRef<string | null | undefined>(undefined);

  const urlIdParam = searchParamsHook.get('id');
  const searchParamsString = searchParamsHook.toString();

  // Effect 1: Đồng bộ activeConversationId (từ store) ra URL (?id=...)
  useEffect(() => {
    if (isProcessingDeletion && idBeingDeleted === urlIdParam) {
      // console.log(`[useUrlConversationSync Effect1] Deletion in progress for ${urlIdParam}, skipping URL sync.`);
      return;
    }

    const newParams = new URLSearchParams(searchParamsString);
    let shouldUpdateURL = false;
    const isLiveChatCurrentPath = currentPathname === CHATBOT_LIVECHAT_PATH;
    const isRegularChatCurrentPath = currentPathname === CHATBOT_REGULARCHAT_PATH;

    if (isLiveChatCurrentPath) {
      if (newParams.has('id')) {
        // console.log(`[useUrlConversationSync Effect1] On live chat path (${currentPathname}) with URL ID ${newParams.get('id')}. Removing ID.`);
        newParams.delete('id');
        shouldUpdateURL = true;
      }
    } else if (currentView === 'chat') {
      if (activeConversationId) {
        if (urlIdParam !== activeConversationId) {
          // console.log(`[useUrlConversationSync Effect1] Chat View (${currentPathname}): ActiveId (${activeConversationId}) differs from URL ID (${urlIdParam}). Setting URL ID.`);
          newParams.set('id', activeConversationId);
          shouldUpdateURL = true;
        }
      } else { // activeConversationId is null
        if (urlIdParam) { // Only remove if URL actually has an ID
            // This covers cases like blank slate where activeId becomes null, or new chat.
            // The prevActiveConversationIdForEffect1Ref helps distinguish initial load vs. activeId becoming null.
            if ( (prevActiveConversationIdForEffect1Ref.current !== null &&
                 prevActiveConversationIdForEffect1Ref.current !== undefined && // It was previously non-null
                 activeConversationId === null) || // And now it's null
                 (isRegularChatCurrentPath && activeConversationId === null) // Or specifically for regular chat blank slate
            ) {
                // console.log(`[useUrlConversationSync Effect1] Chat View (${currentPathname}): ActiveId is null. URL ID (${urlIdParam}) exists. Removing ID from URL.`);
                newParams.delete('id');
                shouldUpdateURL = true;
            }
        }
      }
    } else { // currentView is 'history'
      if (urlIdParam) {
        // console.log(`[useUrlConversationSync Effect1] In history view with URL ID ${urlIdParam}. Removing ID from URL.`);
        newParams.delete('id');
        shouldUpdateURL = true;
      }
    }

    if (shouldUpdateURL) {
      const newQueryString = newParams.toString();
      if (newQueryString !== searchParamsString) {
        // console.log(`[useUrlConversationSync Effect1] Syncing URL. Path: ${currentPathname}, New query: ?${newQueryString}. Setting internalUrlUpdateRef.`);
        internalUrlUpdateRef.current = true;
        router.replace(
          { pathname: currentPathname as AppPathname, query: urlSearchParamsToObject(newParams) },
          { scroll: false }
        );
      }
    }
    prevActiveConversationIdForEffect1Ref.current = activeConversationId;
  }, [
    activeConversationId, currentView, currentPathname, router,
    urlIdParam, searchParamsString, isProcessingDeletion, idBeingDeleted,
  ]);


  // Effect 2: Load conversation from URL if conditions are met
  useEffect(() => {
    if (internalUrlUpdateRef.current) {
      // console.log("[useUrlConversationSync Effect2] URL update was internal (from Effect1). Resetting flag and skipping load.");
      internalUrlUpdateRef.current = false;
      return;
    }

    if ((urlIdParam !== prevUrlIdParamForEffect2ResetRef.current || currentView !== 'chat') && didAttemptLoadFromUrlRef.current) {
      // console.log(`[useUrlConversationSync Effect2] urlIdParam or currentView changed. Resetting didAttemptLoadFromUrlRef. Old urlId: ${prevUrlIdParamForEffect2ResetRef.current}, New urlId: ${urlIdParam}, currentView: ${currentView}`);
      didAttemptLoadFromUrlRef.current = false;
    }
    prevUrlIdParamForEffect2ResetRef.current = urlIdParam;

    if (isProcessingDeletion && idBeingDeleted === urlIdParam) {
      // console.log(`[useUrlConversationSync Effect2] Deletion in progress for ${urlIdParam}, skipping load from URL.`);
      return;
    }

    const isLiveChatCurrentPath = currentPathname === CHATBOT_LIVECHAT_PATH;
    const isRegularChatCurrentPath = currentPathname === CHATBOT_REGULARCHAT_PATH;

    if (isLiveChatCurrentPath) {
      if (urlIdParam && didAttemptLoadFromUrlRef.current) {
        // console.log(`[useUrlConversationSync Effect2] On live chat path with URL ID ${urlIdParam} and didAttemptLoad. Resetting didAttemptLoadFromUrlRef.`);
        didAttemptLoadFromUrlRef.current = false;
      }
      return;
    }

    if (isRegularChatCurrentPath && activeConversationId === null) {
      // console.log(`[useUrlConversationSync Effect2] On regular chat path and activeConversationId is null. Assuming blank slate. Skipping load from URL ID: ${urlIdParam}.`);
      if (urlIdParam && didAttemptLoadFromUrlRef.current) {
        didAttemptLoadFromUrlRef.current = false;
      }
      return;
    }

    if (
      currentView === 'chat' &&
      urlIdParam &&
      activeConversationId !== urlIdParam &&
      !isLoadingHistory &&
      isConnected &&
      isServerReadyForCommands &&
      !didAttemptLoadFromUrlRef.current
    ) {
      // console.log(`[useUrlConversationSync Effect2] Attempting to load conversation ${urlIdParam} from URL. Current activeId: ${activeConversationId || 'null'}.`);
      didAttemptLoadFromUrlRef.current = true;
      loadConversation(urlIdParam, { isFromUrl: true });
    } else if (currentView === 'chat' && urlIdParam && activeConversationId === urlIdParam && didAttemptLoadFromUrlRef.current) {
      // console.log(`[useUrlConversationSync Effect2] urlIdParam ${urlIdParam} matches activeId. didAttemptLoadFromUrlRef is true. No action needed, load was attempted/completed.`);
    } else if (currentView === 'chat' && urlIdParam && activeConversationId !== urlIdParam && !didAttemptLoadFromUrlRef.current) {
      // if (isLoadingHistory) {
        // console.log(`[useUrlConversationSync Effect2] Conditions met to load ${urlIdParam} from URL, but isLoadingHistory is true. Waiting.`);
      // } else if (!isConnected || !isServerReadyForCommands) {
        // console.log(`[useUrlConversationSync Effect2] Conditions met to load ${urlIdParam} from URL, but socket not ready. Waiting. Connected: ${isConnected}, ServerReady: ${isServerReadyForCommands}`);
      // }
    }
  }, [
    urlIdParam, currentView, currentPathname, activeConversationId, loadConversation,
    isLoadingHistory, isConnected, isServerReadyForCommands, isProcessingDeletion, idBeingDeleted,
  ]);

  return { didAttemptLoadFromUrlRef };
}