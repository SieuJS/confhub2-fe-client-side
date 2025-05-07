// src/app/[locale]/chatbot/ConversationHistoryPage.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useSharedChatSocket } from './context/ChatSocketContext'
import { ConversationMetadata } from './lib/regular-chat.types'
import { Loader2, Search, Trash2, Eraser, Pencil, Pin, PinOff, MessageSquarePlus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'
// Không cần useRouter nữa

const ConversationHistoryPage: React.FC = () => {
  const t = useTranslations()
  // const router = useRouter() // Không cần nữa
  const {
    conversationList: initialList,
    loadConversation, // Gọi hàm này sẽ tự chuyển view trong MainLayout
    startNewConversation, // Gọi hàm này sẽ tự chuyển view trong MainLayout
    deleteConversation,
    clearConversation,
    renameConversation,
    pinConversation,
    searchConversations,
    searchResults,
    isSearching,
    isLoadingHistory,
    activeConversationId // Lấy activeConversationId để biết có nên disable nút "Start New Chat" không
  } = useSharedChatSocket()

  const [searchTerm, setSearchTerm] = useState('')
  const [displayedConversations, setDisplayedConversations] = useState<ConversationMetadata[]>([])
  const [editingConvId, setEditingConvId] = useState<string | null>(null)
  const [newTitleInput, setNewTitleInput] = useState('')

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      setDisplayedConversations(searchResults)
    } else {
      const sortedInitialList = [...initialList].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      });
      setDisplayedConversations(sortedInitialList)
    }
  }, [searchTerm, searchResults, initialList])

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()
    searchConversations(searchTerm)
  }

  // Hàm này giờ chỉ cần gọi loadConversation
  const handleSelectAndGoToChat = (conversationId: string) => {
    loadConversation(conversationId)
    // MainLayout sẽ tự động chuyển currentView = 'chat'
  }

  // Hàm này giờ chỉ cần gọi startNewConversation
  const handleStartNewAndGoToChat = () => {
    startNewConversation()
    // MainLayout sẽ tự động chuyển currentView = 'chat'
  }

  const handleDeleteClick = (id: string, title: string) => {
    if (window.confirm(t('Confirm_Delete_Conversation', { title: title || 'Untitled' }))) {
      deleteConversation(id)
    }
  }

  const handleClearClick = (id: string, title: string) => {
    if (window.confirm(t('Confirm_Clear_Conversation', { title: title || 'Untitled' }))) {
      clearConversation(id)
    }
  }

  const handleRenameClick = (id: string, currentTitle: string) => {
    setEditingConvId(id)
    setNewTitleInput(currentTitle)
  }

  const handleSaveRename = (id: string) => {
    if (newTitleInput.trim() === '') return
    renameConversation(id, newTitleInput.trim())
    setEditingConvId(null)
  }

  const handleTogglePinClick = (id: string, currentPinStatus: boolean) => {
    pinConversation(id, !currentPinStatus)
  }

  return (
    <div className='flex h-full flex-col bg-gray-50 p-4 dark:bg-gray-900 md:p-6'>
      <div className='mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row'>
        <h1 className='text-2xl font-semibold text-gray-800 dark:text-gray-100'>
          {t('Chat_History_Full')}
        </h1>
        <button
            onClick={handleStartNewAndGoToChat}
            className='flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
        >
            <MessageSquarePlus size={18} />
            <span>{t('Start_New_Chat_And_Open')}</span>
        </button>
      </div>

      <form onSubmit={handleSearch} className='mb-6 flex gap-2'>
        <input
          type='text'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t('Search_Conversations_Placeholder')}
          className='flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400'
        />
        <button
          type='submit'
          disabled={isSearching}
          className='flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-900'
        >
          {isSearching ? (
            <Loader2 size={18} className='animate-spin' />
          ) : (
            <Search size={18} />
          )}
          <span className='ml-2 hidden sm:inline'>{t('Search')}</span>
        </button>
      </form>

      {/* Phần hiển thị danh sách giữ nguyên */}
      {isLoadingHistory && displayedConversations.length === 0 && !isSearching && (
         <div className='flex flex-1 items-center justify-center'>
            <Loader2 size={24} className='mr-2 animate-spin' />
            <span>{t('Loading_Initial_History')}</span>
        </div>
      )}

      {!isLoadingHistory && displayedConversations.length === 0 && !isSearching && (
        <div className='flex flex-1 items-center justify-center text-center text-gray-500 dark:text-gray-400'>
          {searchTerm.trim() !== '' ? t('No_Search_Results_Found') : t('No_Conversations_Found_Yet')}
        </div>
      )}

      {displayedConversations.length > 0 && (
        <div className='flex-grow space-y-3 overflow-y-auto pb-4 pr-1'> {/* Added pb-4 pr-1 for scrollbar */}
          {displayedConversations.map(conv => (
            <div
              key={conv.id}
              className='rounded-lg border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800'
            >
              <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'> {/* items-start */}
                <div className='min-w-0 flex-1'>
                  {editingConvId === conv.id ? (
                    <div className='flex items-center gap-2'>
                      <input
                        type='text'
                        value={newTitleInput}
                        onChange={e => setNewTitleInput(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') handleSaveRename(conv.id);
                            if (e.key === 'Escape') setEditingConvId(null);
                        }}
                        onBlur={() => {
                            // Chỉ lưu nếu input không rỗng, nếu không thì cancel
                            if (newTitleInput.trim() !== '') handleSaveRename(conv.id);
                            else setEditingConvId(null);
                        }}
                        className='flex-grow rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                        autoFocus
                      />
                       <button onClick={() => setEditingConvId(null)} className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">{t('Cancel')}</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSelectAndGoToChat(conv.id)}
                      className='block w-full truncate text-left text-lg font-semibold text-blue-600 hover:underline dark:text-blue-400'
                      title={conv.title}
                    >
                      {conv.isPinned && <Pin size={16} className='mr-1.5 inline-block text-blue-500 dark:text-blue-400' />}
                      {conv.title}
                    </button>
                  )}
                  <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                    {t('Last_Activity')}: {formatDistanceToNow(new Date(conv.lastActivity), { addSuffix: true })}
                  </p>
                </div>

                <div className='mt-2 flex flex-shrink-0 flex-wrap items-center gap-1.5 sm:mt-0 sm:items-start'> {/* gap-1.5 */}
                  <button
                    onClick={() => handleRenameClick(conv.id, conv.title)}
                    disabled={editingConvId === conv.id}
                    className='rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
                    title={t('Rename')}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleTogglePinClick(conv.id, conv.isPinned)}
                    className={`rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:hover:bg-gray-700 ${
                      conv.isPinned ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    }`}
                    title={conv.isPinned ? t('Unpin') : t('Pin')}
                  >
                    {conv.isPinned ? <PinOff size={16} /> : <Pin size={16} />}
                  </button>
                  <button
                    onClick={() => handleClearClick(conv.id, conv.title)}
                    className='rounded-md p-1.5 text-yellow-600 hover:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-700'
                    title={t('Clear_Messages')}
                  >
                    <Eraser size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(conv.id, conv.title)}
                    className='rounded-md p-1.5 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-700'
                    title={t('Delete')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ConversationHistoryPage