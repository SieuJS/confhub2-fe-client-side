// src/app/[locale]/chatbot/MainLayout.tsx
'use client'

import React, { useState, useCallback } from 'react'
import LeftPanel from './LeftPanel'
import RightSettingsPanel from './RightSettingsPanel'
import useConnection from '../chatbot/livechat/hooks/useConnection'
import {
  LanguageOption,
  OutputModality,
  PrebuiltVoice,
  Language,
  ChatMode
} from './lib/live-chat.types'
import { AlignJustify, Settings } from 'lucide-react'
// --- IMPORT THE CONTEXT HOOK ---
import { useSharedChatSocket } from './context/ChatSocketContext'
// Removed appConfig import as it wasn't used here
import { useTranslations } from 'next-intl'

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

  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true) // Default to true? Or false? Assuming true based on code.

  const { connected: isLiveConnected } = useConnection()

  // --- Use the SHARED hook via context ---
  const {
    conversationList,
    activeConversationId,
    loadConversation,
    startNewConversation,
    isLoadingHistory,
    // --- Get NEW actions from context ---
    deleteConversation,
    clearConversation
    // ---
  } = useSharedChatSocket()
  // ------------------------------------

  // Handlers using context functions (no changes needed here)
  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      console.log('[MainLayout] Selecting conversation:', conversationId)
      loadConversation(conversationId)
    },
    [loadConversation]
  )

  const handleStartNewConversation = useCallback(() => {
    console.log('[MainLayout] Starting new conversation.')
    startNewConversation()
  }, [startNewConversation])

  const handleChatModeChange = (mode: ChatMode) => {
    if (isLiveConnected && mode !== 'live') {
      console.warn('Cannot switch from live chat while connected.')
      return
    }
    onChatModeChange(mode)
  }

  return (
    <div className='flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-800'>
      {/* Toggle Button for Left Panel */}
      {!isLeftPanelOpen && (
        <button
          onClick={() => setIsLeftPanelOpen(true)}
          className='fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-950 dark:hover:text-gray-600'
          title='Open chat mode & history' // Updated title
          aria-label='Open chat mode & history' // Updated label
          aria-expanded={isLeftPanelOpen}
          aria-controls='left-panel-title'
        >
          <AlignJustify className='h-5 w-5' />
          <span className='sr-only'>{t('Open_chat_mode_and_history')}</span>
        </button>
      )}

      {/* Left Panel - Pass down new props */}
      <LeftPanel
        isOpen={isLeftPanelOpen}
        onClose={() => setIsLeftPanelOpen(false)}
        currentChatMode={currentChatMode}
        onChatModeChange={handleChatModeChange}
        isLiveConnected={isLiveConnected}
        // --- Props from SHARED context ---
        conversationList={conversationList}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onStartNewConversation={handleStartNewConversation}
        isLoadingConversations={isLoadingHistory}
        // --- Pass down NEW props ---
        onDeleteConversation={deleteConversation}
        onClearConversation={clearConversation}
        // ---
      />

      {/* Main Content Area */}
      <main className='relative flex-1 overflow-hidden transition-all duration-300 ease-in-out'>
        <div className='h-full w-full'>{children}</div>
      </main>

      {/* Right Panel (Settings) */}
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

      {/* Toggle Button for Right Panel */}
      {!isRightPanelOpen && (
        <button
          onClick={() => setIsRightPanelOpen(true)}
          className='fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-gray-950 dark:hover:text-gray-600'
          title='Open settings'
          aria-label='Open settings'
          aria-expanded={isRightPanelOpen}
          aria-controls='right-panel-title' // Make sure RightSettingsPanel has an id="right-panel-title" on its main header/title element
        >
          <Settings className='h-5 w-5' />
          <span className='sr-only'>{t('Open_settings')}</span>
        </button>
      )}
    </div>
  )
}
