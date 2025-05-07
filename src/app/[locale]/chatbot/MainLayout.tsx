'use client'

import React, { useState, useCallback, useEffect } from 'react'
import LeftPanel from './LeftPanel'
import RightSettingsPanel from './RightSettingsPanel'
import ConversationHistoryPage from './ConversationHistoryPage'
import useConnection from '../chatbot/livechat/hooks/useConnection'
import {
  LanguageOption, OutputModality, PrebuiltVoice, Language, ChatMode
} from './lib/live-chat.types'
import { Settings } from 'lucide-react'
import { useSharedChatSocket } from './context/ChatSocketContext'
import { useTranslations } from 'next-intl'
import { useRouter, usePathname, useSearchParams } from 'next/navigation' // <-- IMPORT THESE

interface MainLayoutProps {
  children: React.ReactNode
  currentChatMode: ChatMode
  onChatModeChange: (mode: ChatMode) => void
  currentModality: OutputModality
  onModalityChange: (modality: OutputModality) => void
  currentVoice: PrebuiltVoice
  onVoiceChange: (voice: PrebuiltVoice) => void
  availableVoices: PrebuiltVoice[]
  currentLanguage: Language
  onLanguageChange: (lang: Language) => void
  availableLanguages: LanguageOption[]
}

type MainContentView = 'chat' | 'history';

export default function MainLayout({
  children,
  currentChatMode,
  onChatModeChange,
  currentModality,
  onModalityChange,
  currentVoice,
  onVoiceChange,
  availableVoices,
  currentLanguage,
  onLanguageChange,
  availableLanguages
}: MainLayoutProps) {
  const t = useTranslations()
  const router = useRouter() // <-- INITIALIZE ROUTER
  const pathname = usePathname() // <-- GET CURRENT PATHNAME
  const searchParams = useSearchParams() // <-- GET CURRENT SEARCH PARAMS

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const { connected: isLiveConnected } = useConnection()
  const [currentView, setCurrentView] = useState<MainContentView>('chat');

  const {
    conversationList,
    activeConversationId,
    loadConversation,
    startNewConversation,
    isLoadingHistory,
    deleteConversation,
    clearConversation,
    renameConversation,
    pinConversation,
  } = useSharedChatSocket()

  // Effect 1: Initialize state from URL (URL -> State)
  // Runs when URL search params change (e.g. direct navigation, back/forward buttons)
  useEffect(() => {
    const conversationIdFromUrl = searchParams.get('id');
    // console.log("Effect 1 (URL->State): URL ID:", conversationIdFromUrl, "Current Active ID:", activeConversationId, "Current View:", currentView);

    if (conversationIdFromUrl) {
      // If URL has an ID, this ID should be the active one.
      if (conversationIdFromUrl !== activeConversationId) { // Only load if it's different from current active
        // console.log("Effect 1: Loading conversation from URL:", conversationIdFromUrl);
        loadConversation(conversationIdFromUrl);
      }
      // And view should be 'chat'.
      if (currentView !== 'chat') {
        // console.log("Effect 1: Setting view to 'chat' due to ID in URL.");
        setCurrentView('chat');
      }
    }
    // If no ID in URL:
    // - If currentView is 'chat' and activeConversationId is set, Effect 2 will add it to URL.
    // - If currentView is 'chat' and activeConversationId is null, Effect 2 ensures URL has no ID.
    // - If currentView is not 'chat', Effect 2 ensures URL has no ID.
    // So, this effect doesn't need an 'else' for clearing state if no ID in URL,
    // as Effect 2 handles keeping the URL consistent with the state.

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // IMPORTANT: This effect should ONLY re-run if the searchParams object itself changes.
                      // loadConversation, activeConversationId, currentView, setCurrentView are used from closure.
                      // Assumes loadConversation and setCurrentView are stable (e.g., from useCallback or useState).

  // Effect 2: Synchronize URL with activeConversationId and currentView (State -> URL)
  // Runs when relevant state (activeConversationId, currentView) changes.
  useEffect(() => {
    const conversationIdFromUrl = searchParams.get('id');
    // console.log("Effect 2 (State->URL): Active ID:", activeConversationId, "Current View:", currentView, "URL ID:", conversationIdFromUrl);

    let targetUrl = pathname; // Base URL without query params by default
    let performUpdate = false;

    if (currentView === 'chat') {
      if (activeConversationId) {
        // Chat view with an active conversation: URL should have this ID.
        targetUrl = `${pathname}?id=${activeConversationId}`;
        // Check if the current URL (pathname + search params) matches the target.
        // This comparison is a bit naive if other query params exist, but fine for just 'id'.
        if (`${pathname}?id=${conversationIdFromUrl}` !== targetUrl) {
          performUpdate = true;
          // console.log("Effect 2: Syncing URL to active chat:", targetUrl);
        }
      } else {
        // Chat view, NO active conversation: URL should NOT have an ID.
        if (conversationIdFromUrl) { // Only update if URL currently has an ID
          targetUrl = pathname; // Pathname itself is the target (no query params)
          performUpdate = true;
          // console.log("Effect 2: Clearing ID from URL (no active chat).");
        }
      }
    } else {
      // NOT in chat view (e.g., 'history'): URL should NOT have an ID.
      if (conversationIdFromUrl) { // Only update if URL currently has an ID
        targetUrl = pathname; // Pathname itself is the target
        performUpdate = true;
        // console.log("Effect 2: Clearing ID from URL (not in chat view).");
      }
    }

    if (performUpdate) {
      // Using router.replace to avoid adding a new entry to the browser's history
      // for these state synchronization-driven URL changes.
      router.replace(targetUrl, { scroll: false });
    }
  }, [activeConversationId, currentView, pathname, router, searchParams]); // searchParams is a dep to get current URL state for comparison.


  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      // console.log("Handler: SelectConversation", conversationId);
      loadConversation(conversationId); // This will update activeConversationId
      setCurrentView('chat');         // This will update currentView
      // The URL will be updated by Effect 2 based on the new state.
    },
    [loadConversation] // setCurrentView is stable from useState
  );

  const handleStartNewConversation = useCallback(() => {
    // console.log("Handler: StartNewConversation");
    startNewConversation(); // This should eventually update activeConversationId
    setCurrentView('chat');
    // The URL will be updated by Effect 2.
    // activeConversationId might be null briefly then set to new ID, Effect 2 handles both states.
  }, [startNewConversation]); // setCurrentView is stable

  const handleChatModeChange = (mode: ChatMode) => {
    // console.log("Handler: ChatModeChange", mode);
    if (isLiveConnected && mode !== 'live') {
      console.warn('Cannot switch from live chat while connected.');
      return;
    }
    onChatModeChange(mode); // Prop
    setCurrentView('chat'); // Assume changing mode goes to chat view
    // The URL will be updated by Effect 2.
    // If changing mode means no conversation is active, ID will be removed from URL.
  }; // No useCallback needed if it only uses props and stable setters like setCurrentView

  const handleShowHistoryView = useCallback(() => {
    // console.log("Handler: ShowHistoryView");
    setCurrentView('history');
    // The URL will be updated by Effect 2 to remove the 'id' parameter.
  }, []); // setCurrentView is stable

  const handleToggleLeftPanel = () => {
    setIsLeftPanelOpen(prev => !prev);
  };

  return (
    <div className='flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-800'>
      <LeftPanel
        isOpen={isLeftPanelOpen}
        onToggleOpen={handleToggleLeftPanel}
        currentChatMode={currentChatMode}
        onChatModeChange={handleChatModeChange}
        isLiveConnected={isLiveConnected}
        conversationList={conversationList}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onStartNewConversation={handleStartNewConversation}
        isLoadingConversations={isLoadingHistory}
        onDeleteConversation={deleteConversation}
        onClearConversation={clearConversation}
        onRenameConversation={renameConversation}
        onPinConversation={pinConversation}
        onShowHistoryView={handleShowHistoryView}
        currentView={currentView}
      />

      <main className='relative flex-1 overflow-hidden transition-all duration-300 ease-in-out'>
        <div className='h-full w-full'>
          {currentView === 'chat' && children}
          {currentView === 'history' && <ConversationHistoryPage />}
        </div>
      </main>

      <RightSettingsPanel
        isOpen={isRightPanelOpen}
        onClose={() => setIsRightPanelOpen(false)}
        currentChatMode={currentChatMode}
        currentModality={currentModality}
        onModalityChange={onModalityChange}
        currentVoice={currentVoice}
        onVoiceChange={onVoiceChange}
        availableVoices={availableVoices}
        currentLanguage={currentLanguage}
        onLanguageChange={onLanguageChange}
        availableLanguages={availableLanguages}
        isLiveConnected={isLiveConnected}
      />

      {!isRightPanelOpen && (
        <button
          onClick={() => setIsRightPanelOpen(true)}
          className='fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-950 dark:hover:bg-gray-700 dark:text-gray-200'
          title={t('Open_settings')}
          aria-label={t('Open_settings')}
        >
          <Settings className='h-5 w-5' />
        </button>
      )}
    </div>
  )
}