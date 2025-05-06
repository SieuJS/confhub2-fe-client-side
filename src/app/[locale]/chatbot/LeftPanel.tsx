// src/app/[locale]/chatbot/LeftPanel.tsx
import React from 'react'
import { ChatMode, ConversationMetadata } from './lib/regular-chat.types'
import { X, MessageCircleMore } from 'lucide-react'
import ChatModeSelector from './sidepanel/ChatModeSelector'
import ConversationList from './sidepanel/ConversationList'
import { useTranslations } from 'next-intl'

interface LeftPanelProps {
  isOpen: boolean
  onClose: () => void
  currentChatMode: ChatMode
  onChatModeChange: (mode: ChatMode) => void
  isLiveConnected: boolean
  conversationList: ConversationMetadata[]
  activeConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onStartNewConversation: () => void
  isLoadingConversations: boolean
  // --- NEW PROPS ---
  onDeleteConversation: (conversationId: string) => void
  onClearConversation: (conversationId: string) => void
  // ---
}

const LeftPanel: React.FC<LeftPanelProps> = ({
  isOpen,
  onClose,
  currentChatMode,
  onChatModeChange,
  isLiveConnected,
  conversationList,
  activeConversationId,
  onSelectConversation,
  onStartNewConversation,
  isLoadingConversations,
  // --- Destructure new props ---
  onDeleteConversation,
  onClearConversation
  // ---
}) => {
  const disableChatModeSelection = isLiveConnected
  const t = useTranslations()

  return (
    <div
      className={`h-full flex-shrink-0 overflow-y-hidden bg-white shadow-xl transition-all duration-300 ease-in-out dark:bg-gray-900 ${
        isOpen ? 'w-72 opacity-100' : 'w-0 opacity-0' // Adjusted width for potential button space
      }`}
      aria-hidden={!isOpen}
    >
      <div className='flex h-full min-w-[18rem] flex-col overflow-hidden'>
        {/* Header */}
        <div className='flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-5 pb-4 dark:border-gray-600'>
          <div className='flex items-center space-x-2'>
            <MessageCircleMore size={20} className='' />
            <h2 id='left-panel-title' className='text-lg font-semibold '>
              {t('Chat_Mode_And_History')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className='flex h-8 w-8 items-center justify-center rounded-full  hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
            title='Close panel'
            aria-label='Close panel'
          >
            <X
              size={20}
              strokeWidth={1.5}
              stroke='currentColor'
              className='h-5 w-5'
              aria-hidden='true'
            />
            <span className='sr-only'>{t('Close_panel')}</span>
          </button>
        </div>

        {/* Chat Mode Selector */}
        <div className='flex-shrink-0 border-b border-gray-200 p-5 pb-3 dark:border-gray-600'>
          <ChatModeSelector
            currentChatMode={currentChatMode}
            onChatModeChange={onChatModeChange}
            disabled={disableChatModeSelection}
          />
        </div>

        {/* Conversation History Section - Pass down new props */}
        <ConversationList
          conversationList={conversationList}
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
          onStartNewConversation={onStartNewConversation}
          isLoading={isLoadingConversations}
          // --- Pass down new props ---
          onDeleteConversation={onDeleteConversation}
          onClearConversation={onClearConversation}
          // ---
        />
      </div>
    </div>
  )
}

export default LeftPanel
