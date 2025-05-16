// src/app/[locale]/chatbot/MainLayout.tsx
'use client'

import React, { useEffect, useRef } from 'react';
import LeftPanel from './LeftPanel';
import RightSettingsPanel from './RightPanel';
import { useTranslations } from 'next-intl';
import { AppPathname } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';
import {
  useConversationStore,
} from './stores';
import { useShallow } from 'zustand/react/shallow';

// Import custom hooks
import { useAppInitialization } from '@/src/hooks/chatbot/useAppInitialization';
import { useUrlConversationSync } from '@/src/hooks/chatbot/useUrlConversationSync';
import { useConversationLifecycleManager } from '@/src/hooks/chatbot/useConversationLifecycleManager';
import { useChatViewManager } from '@/src/hooks/chatbot/useChatViewManager';
import { useConversationActions } from '@/src/hooks/chatbot/useConversationActions';

// Import child components
import DeletionOverlay from './regularchat/DeletionOverlay';
import SettingsToggleButton from './regularchat/SettingToggleButton';

interface MainLayoutComponentProps {
  children: React.ReactNode;
  isLiveChatContextActive?: boolean;
}

export const CHATBOT_HISTORY_PATH: AppPathname = '/chatbot/history';
export const CHATBOT_LIVECHAT_PATH: AppPathname = '/chatbot/livechat';
export const CHATBOT_REGULARCHAT_PATH: AppPathname = '/chatbot/regularchat';


export default function MainLayoutComponent({
  children,
  isLiveChatContextActive
}: MainLayoutComponentProps) {
  const t = useTranslations();
  const searchParamsHook = useSearchParams();

  // --- Store Hooks  ---
  const { activeConversationId } = useConversationStore(
    useShallow(state => ({
      activeConversationId: state.activeConversationId,
    }))
  );

  // --- Custom Hooks for Logic Management ---
  useAppInitialization();
  const { currentView } = useChatViewManager();
  const {
    handleSelectConversation,
    handleStartNewConversation,
    handleDeleteConversation,
    isProcessingDeletion,
    idBeingDeleted,
    resetDeletionState,
  } = useConversationActions({ currentView });


  const { didAttemptLoadFromUrlRef } = useUrlConversationSync({
    currentView,
    isProcessingDeletion,
    idBeingDeleted,
  });


  // --- Refs needed by hooks ---
  const prevActiveIdRef = useRef<string | null>(null);

  useEffect(() => {
    prevActiveIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useConversationLifecycleManager({
    currentView,
    isProcessingDeletion,
    idBeingDeleted,
    prevActiveIdRef,
    urlIdParam: searchParamsHook.get('id'),
    searchParamsString: searchParamsHook.toString(),
    onDeletionProcessed: () => {
      console.log("[MainLayout] onDeletionProcessed called from LifecycleManager. Resetting deletion state.");
      resetDeletionState();
    },
    didAttemptLoadFromUrlRef: didAttemptLoadFromUrlRef,
    onNotFoundProcessed: () => {
      console.log("[MainLayout] onNotFoundProcessed called from LifecycleManager.");
      if (didAttemptLoadFromUrlRef.current) {
        didAttemptLoadFromUrlRef.current = false;
        console.log("[MainLayout] Reset didAttemptLoadFromUrlRef to false.");
      }
    },
  });


  return (
    <div className='bg-gray-10 flex h-screen overflow-hidden' >
      <LeftPanel
        onSelectConversation={handleSelectConversation}
        onStartNewConversation={handleStartNewConversation}
        onDeleteConversation={handleDeleteConversation}
        currentView={currentView}
        deletingConversationId={isProcessingDeletion ? idBeingDeleted : null}
      />

      <main className='relative flex-1 overflow-hidden transition-all duration-300 ease-in-out' >
        <DeletionOverlay
          isVisible={isProcessingDeletion && idBeingDeleted !== null && currentView === 'chat' && activeConversationId === idBeingDeleted}
        />
        <div className='h-full w-full' > {children} </div>
      </main>

      <RightSettingsPanel
        isLiveChatContextActive={isLiveChatContextActive}
      />

      <SettingsToggleButton isProcessingDeletion={isProcessingDeletion} />
    </div>
  );
}