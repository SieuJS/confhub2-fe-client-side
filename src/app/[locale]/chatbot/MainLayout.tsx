// src/app/[locale]/chatbot/MainLayout.tsx
'use client'

import React, { useEffect, useRef } from 'react';
import LeftPanel from './LeftPanel';
import RightSettingsPanel from './RightPanel';
import { useTranslations } from 'next-intl'; // Keep for any remaining direct t() calls
import { usePathname, useRouter, AppPathname } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';
import {
  useConversationStore,
  // useSocketStore, // No longer directly used here if actions handle it
  // useSettingsStore, // No longer directly used here
  // useUiStore, // Handled by SettingsToggleButton
  // useMessageStore, // Handled by useChatViewManager
} from './stores';
import { useShallow } from 'zustand/react/shallow';

// Import custom hooks
import { useAppInitialization } from '@/src/hooks/chatbot/useAppInitialization';
import { useUrlConversationSync } from '@/src/hooks/chatbot/useUrlConversationSync';
import { useConversationLifecycleManager } from '@/src/hooks/chatbot/useConversationLifecycleManager';
import { useChatViewManager } from '@/src/hooks/chatbot/useChatViewManager'; // NEW
import { useConversationActions } from '@/src/hooks/chatbot/useConversationActions'; // NEW

// Import child components
import DeletionOverlay from './regularchat/DeletionOverlay'; // NEW
import SettingsToggleButton from './regularchat/SettingToggleButton'; // NEW

interface MainLayoutComponentProps {
  children: React.ReactNode;
  isLiveChatContextActive?: boolean;
}

// Paths can be moved to a constants file or kept here if specific to this layout context
export const CHATBOT_HISTORY_PATH: AppPathname = '/chatbot/history';
export const CHATBOT_LIVECHAT_PATH: AppPathname = '/chatbot/livechat';
export const CHATBOT_REGULARCHAT_PATH: AppPathname = '/chatbot/regularchat';


export default function MainLayoutComponent({
  children,
  isLiveChatContextActive
}: MainLayoutComponentProps) {
  const t = useTranslations(); // For any remaining direct usages
  const searchParamsHook = useSearchParams(); // For useUrlConversationSync & LifecycleManager

  // --- Store Hooks (only what's directly needed by MainLayout or its direct effects) ---
  const { activeConversationId } = useConversationStore( // Make sure this is present
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
    resetDeletionState, // Important for lifecycle manager
  } = useConversationActions({ currentView });


  const { didAttemptLoadFromUrlRef } = useUrlConversationSync({
    currentView,
    isProcessingDeletion, // Pass these down
    idBeingDeleted,       // Pass these down
  });


  // --- Refs needed by hooks ---
  const prevActiveIdRef = useRef<string | null>(null); // << ENSURE THIS IS UNCOMMENTED/PRESENT

  useEffect(() => { // << ENSURE THIS IS UNCOMMENTED/PRESENT
    prevActiveIdRef.current = activeConversationId;
  }, [activeConversationId]);

  useConversationLifecycleManager({
    currentView,
    isProcessingDeletion,
    idBeingDeleted,
    prevActiveIdRef, // << Pass the ref here
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