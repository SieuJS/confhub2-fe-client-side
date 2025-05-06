// src/app/[locale]/chatbot/sidepanel/ConversationList.tsx
import React from 'react'
import { ConversationMetadata } from '../lib/regular-chat.types'
import { History, PlusCircle, Loader2, Trash2, Eraser } from 'lucide-react' // Added Trash2 and Eraser
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'

interface ConversationListProps {
  conversationList: ConversationMetadata[]
  activeConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onStartNewConversation: () => void
  isLoading: boolean
  // --- NEW PROPS ---
  onDeleteConversation: (conversationId: string) => void
  onClearConversation: (conversationId: string) => void
  // ---
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversationList,
  activeConversationId,
  onSelectConversation,
  onStartNewConversation,
  isLoading,
  // --- Destructure new props ---
  onDeleteConversation,
  onClearConversation
  // ---
}) => {
  const t = useTranslations()

  // --- Event Handlers for Buttons ---
  const handleDeleteClick = (
    e: React.MouseEvent,
    id: string,
    title: string
  ) => {
    e.stopPropagation() // Prevent triggering onSelectConversation
    // Add confirmation dialog
    if (
      window.confirm(
        `Are you sure you want to permanently delete the conversation "${title || 'Untitled'}"?`
      )
    ) {
      onDeleteConversation(id)
    }
  }

  const handleClearClick = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation() // Prevent triggering onSelectConversation
    // Optional: Add confirmation if desired
    if (
      window.confirm(
        `Are you sure you want to clear all messages from the conversation "${title || 'Untitled'}"? This cannot be undone.`
      )
    ) {
      onClearConversation(id)
    }
  }
  // ---

  return (
    <div className='flex flex-grow flex-col overflow-hidden p-5 pt-3'>
      {/* Header for Conversation History */}
      <div className='mb-3 flex items-center justify-between'>
        <div className='flex items-center space-x-2 text-sm font-medium text-gray-500'>
          <History size={16} />
          <span>{t('Chat_History')}</span>
        </div>
        <button
          onClick={onStartNewConversation}
          disabled={isLoading}
          className='flex items-center space-x-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50'
          title='Start a new chat session'
        >
          <PlusCircle size={14} />
          <span>{t('New_Chat')}</span>
        </button>
      </div>

      {/* Conversation List Area with Scrolling */}
      <div className='-mr-3 flex-grow space-y-1 overflow-y-auto pr-3'>
        {isLoading && (
          <div className='flex items-center justify-center py-4 text-gray-500'>
            <Loader2 size={18} className='mr-2 animate-spin' />
            <span>{t('Loading')}</span>
          </div>
        )}
        {!isLoading && conversationList.length === 0 && (
          <div className='px-2 py-4 text-center text-sm text-gray-400'>
            {t('No_Conversations_Found')}
          </div>
        )}
        {!isLoading &&
          conversationList.map(conv => {
            const title = conv.title || `Chat ${conv.id.substring(0, 6)}...` // Consistent title definition
            return (
              <div key={conv.id} className='group relative'>
                {' '}
                {/* Added relative and group */}
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  disabled={isLoading}
                  className={`w-full rounded-md py-2 pl-3 pr-16 text-left text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-70 ${
                    conv.id === activeConversationId
                      ? 'bg-blue-100 font-semibold text-blue-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-current={
                    conv.id === activeConversationId ? 'page' : undefined
                  }
                >
                  <div className='truncate font-medium'>{title}</div>
                  <div
                    className={`text-xs ${conv.id === activeConversationId ? 'text-blue-600' : 'text-gray-500'}`}
                  >
                    {formatDistanceToNow(new Date(conv.lastActivity), {
                      addSuffix: true
                    })}
                  </div>
                </button>
                {/* --- Action Buttons Container --- */}
                <div className='absolute right-0 top-0 flex h-full items-center space-x-1 pr-2 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100'>
                  {/* Clear Button */}
                  <button
                    onClick={e => handleClearClick(e, conv.id, title)}
                    disabled={isLoading}
                    title='Clear Messages'
                    className='rounded-md p-1.5 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600 focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50'
                    aria-label={`Clear messages in conversation: ${title}`}
                  >
                    <Eraser className='h-4 w-4' />
                  </button>
                  {/* Delete Button */}
                  <button
                    onClick={e => handleDeleteClick(e, conv.id, title)}
                    disabled={isLoading}
                    title='Delete Conversation'
                    className='rounded-md p-1.5 text-gray-500 hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50'
                    aria-label={`Delete conversation: ${title}`}
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
                {/* --- End Action Buttons --- */}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default ConversationList
