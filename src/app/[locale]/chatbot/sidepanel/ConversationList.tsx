// src/app/[locale]/chatbot/sidepanel/ConversationList.tsx
import React, { useState, useRef, useEffect } from 'react'
import { ConversationMetadata } from '../lib/regular-chat.types'
// HistoryIcon is removed from here as it's now in LeftPanel
import { PlusCircle, Loader2, Trash2, Eraser, Pencil, Pin, PinOff, Check, X as CancelIcon } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'

interface ConversationListProps {
  conversationList: ConversationMetadata[]
  activeConversationId: string | null
  onSelectConversation: (conversationId: string) => void
  onStartNewConversation: () => void
  isLoading: boolean
  onDeleteConversation: (conversationId: string) => void
  onClearConversation: (conversationId: string) => void
  onRenameConversation: (conversationId: string, newTitle: string) => void
  onPinConversation: (conversationId: string, isPinned: boolean) => void
  currentView: 'chat' | 'history'; // Still used to determine if a conversation item should be "active"
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversationList,
  activeConversationId,
  onSelectConversation,
  onStartNewConversation,
  isLoading,
  onDeleteConversation,
  onClearConversation,
  onRenameConversation,
  onPinConversation,
  currentView, // Destructure
}) => {
  const t = useTranslations()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])


  const handleEditStart = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation()
    setEditingId(id)
    setEditText(currentTitle)
  }

  const handleEditCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingId(null)
    setEditText('')
  }

  const handleEditSave = (e?: React.MouseEvent | React.FormEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    if (editingId && editText.trim() !== '') {
      onRenameConversation(editingId, editText.trim())
    }
    setEditingId(null)
    setEditText('')
  }

  const handleDeleteClick = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    if (window.confirm(t('Confirm_Delete_Conversation', { title: title || 'Untitled' }))) {
      onDeleteConversation(id)
    }
  }

  const handleClearClick = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    if (window.confirm(t('Confirm_Clear_Conversation', { title: title || 'Untitled' }))) {
      onClearConversation(id)
    }
  }

  const handleTogglePinClick = (e: React.MouseEvent, id: string, currentPinStatus: boolean) => {
    e.stopPropagation()
    onPinConversation(id, !currentPinStatus)
  }

  return (
    // Adjusted padding, pt-0 as p-5 is on LeftPanel for expanded view
    <div className='flex flex-grow flex-col overflow-hidden px-3 pb-3 pt-0'>
      <div className='mb-3 flex items-center justify-between'>
        {/* --- "CHAT HISTORY" TITLE BUTTON REMOVED --- */}
        {/* Kept the "Chat History" text for context, but it's not a button here anymore */}
        <span className='text-sm font-medium text-gray-700 dark:text-gray-200'>
            {t('Chat_History')}
        </span>
        {/* ------------------------------------ */}

        <button
        
          onClick={onStartNewConversation}
          disabled={isLoading}
          className='flex items-center space-x-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900/50'
          title={t('Start_New_Chat')}
        >
          <PlusCircle size={14} />
          <span>{t('New_Chat')}</span>
        </button>
      </div>

      <div className='-mr-3 flex-grow space-y-1 overflow-y-auto pr-3'>
        {isLoading && (
          <div className='flex items-center justify-center py-4 '>
            <Loader2 size={18} className='mr-2 animate-spin' />
            <span>{t('Loading')}</span>
          </div>
        )}
        {!isLoading && conversationList.length === 0 && (
          <div className='px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400'>
            {t('No_Conversations_Found')}
          </div>
        )}
        {!isLoading &&
          conversationList.map(conv => {
            const title = conv.title || `Chat ${conv.id.substring(0, 6)}...`
            const isEditingThis = editingId === conv.id
            // A conversation item is only "active" if we are in 'chat' view.
            // If currentView is 'history', no conversation item in this list should be visually "active"
            // because the "Chat History" nav button itself would be active.
            const isLogicallyActive = conv.id === activeConversationId && currentView === 'chat';


            return (
              <div
                key={conv.id}
                className={`group relative rounded-md transition-colors duration-150 ${
                  isLogicallyActive
                    ? 'bg-blue-100 dark:bg-blue-900/50'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {isEditingThis ? (
                   <form onSubmit={handleEditSave} className='flex items-center p-2 space-x-1'>
                    <input
                      ref={inputRef}
                      type='text'
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') handleEditCancel();
                      }}
                      className='mr-1 flex-grow rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                    />
                    <button
                      type='submit'
                      title={t('Save_Title')}
                      className='rounded-md p-1.5 text-green-600 hover:bg-green-100 focus:outline-none focus:ring-1 focus:ring-green-500 dark:hover:bg-green-800'
                    >
                      <Check size={16} />
                    </button>
                    <button
                      type='button'
                      onClick={handleEditCancel}
                      title={t('Cancel_Edit')}
                      className='rounded-md p-1.5 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:hover:bg-gray-600'
                    >
                      <CancelIcon size={16} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    disabled={isLoading}
                    className={`w-full py-2 pl-3 pr-24 text-left text-sm focus:outline-none disabled:opacity-70 ${
                      isLogicallyActive
                        ? 'font-semibold text-blue-800 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-200'
                    }`}
                    aria-current={isLogicallyActive ? 'page' : undefined}
                  >
                    <div className='flex items-center'>
                      {conv.isPinned && (
                        <Pin size={14} className='mr-1.5 flex-shrink-0 text-blue-500 dark:text-blue-400' />
                      )}
                      <span className='truncate font-medium' title={title}>{title}</span>
                    </div>
                    <div
                      className={`text-xs ${
                        isLogicallyActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatDistanceToNow(new Date(conv.lastActivity), { addSuffix: true })}
                    </div>
                  </button>
                )}

                {!isEditingThis && (
                  <div className='absolute right-0 top-0 flex h-full items-center space-x-0.5 pr-1 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100'>
                    <button
                      onClick={e => handleTogglePinClick(e, conv.id, conv.isPinned)}
                      disabled={isLoading}
                      title={conv.isPinned ? t('Unpin') : t('Pin')}
                      className={`rounded-md p-1.5 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 ${
                        conv.isPinned ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {conv.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <button
                      onClick={e => handleEditStart(e, conv.id, title)}
                      disabled={isLoading}
                      title={t('Rename')}
                      className='rounded-md p-1.5 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700'
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={e => handleClearClick(e, conv.id, title)}
                      disabled={isLoading}
                      title={t('Clear_Messages')}
                      className='rounded-md p-1.5 text-yellow-600 hover:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-yellow-400 dark:hover:bg-yellow-700'
                    >
                      <Eraser size={14} />
                    </button>
                    <button
                      onClick={e => handleDeleteClick(e, conv.id, title)}
                      disabled={isLoading}
                      title={t('Delete_Conversation')}
                      className='rounded-md p-1.5 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-700'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default ConversationList