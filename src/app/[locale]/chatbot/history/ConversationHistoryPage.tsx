'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useSharedChatSocket } from '../context/ChatSocketContext'
import { ConversationMetadata } from '../lib/regular-chat.types'
import {
  Loader2,
  Trash2,
  Eraser,
  Pencil,
  Pin,
  PinOff,
  MessageSquarePlus
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/src/navigation'

const ConversationHistoryPage: React.FC = () => {
  const t = useTranslations()
  const router = useRouter()

  const {
    conversationList: initialList,
    loadConversation,
    startNewConversation,
    deleteConversation,
    clearConversation,
    renameConversation,
    pinConversation,
    searchConversations,
    searchResults,
    isSearching,
    isLoadingHistory
  } = useSharedChatSocket()

  const [searchTerm, setSearchTerm] = useState('')
  const [displayedConversations, setDisplayedConversations] = useState<
    ConversationMetadata[]
  >([])
  const [editingConvId, setEditingConvId] = useState<string | null>(null)
  const [newTitleInput, setNewTitleInput] = useState('')

  useEffect(() => {
    searchConversations(searchTerm)
  }, [searchTerm, searchConversations])

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      setDisplayedConversations(searchResults)
    } else {
      const sortedInitialList = [...initialList].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return (
          new Date(b.lastActivity).getTime() -
          new Date(a.lastActivity).getTime()
        )
      })
      setDisplayedConversations(sortedInitialList)
    }
  }, [searchTerm, searchResults, initialList])

  const handleSelectAndGoToChat = useCallback(
    (conversationId: string) => {
      loadConversation(conversationId)
      router.push('/chatbot/regularchat')
    },
    [loadConversation, router]
  )

  const handleStartNewAndGoToChat = useCallback(() => {
    startNewConversation()
    router.push('/chatbot/regularchat')
  }, [startNewConversation, router])

  const handleDeleteClick = (id: string, title: string) => {
    if (
      window.confirm(
        t('Confirm_Delete_Conversation', {
          title: title || t('Untitled_Conversation')
        })
      )
    ) {
      deleteConversation(id)
    }
  }

  const handleClearClick = (id: string, title: string) => {
    if (
      window.confirm(
        t('Confirm_Clear_Conversation', {
          title: title || t('Untitled_Conversation')
        })
      )
    ) {
      clearConversation(id)
    }
  }

  const handleRenameClick = (id: string, currentTitle: string) => {
    setEditingConvId(id)
    setNewTitleInput(currentTitle || '')
  }

  const handleSaveRename = (id: string) => {
    if (newTitleInput.trim() === '') {
      setEditingConvId(null)
      return
    }
    renameConversation(id, newTitleInput.trim())
    setEditingConvId(null)
  }

  const handleTogglePinClick = (id: string, currentPinStatus: boolean) => {
    pinConversation(id, !currentPinStatus)
  }

  return (
    <div className='bg-gray-5 flex h-full flex-col p-4  md:p-6'>
      <div className='mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row'>
        <h1 className='text-2xl font-semibold '>{t('Chat_History_Full')}</h1>
        <button
          onClick={handleStartNewAndGoToChat}
          className='flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900'
        >
          <MessageSquarePlus size={18} />
          <span>{t('Start_New_Chat_And_Open')}</span>
        </button>
      </div>

      <div className='mb-6 flex gap-2'>
        <input
          type='text'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={t('Search_Conversations_Placeholder')}
          className='flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400'
        />
        {isSearching && (
          <div className='flex items-center justify-center px-2'>
            <Loader2 size={18} className='animate-spin ' />
          </div>
        )}
      </div>

      {isLoadingHistory &&
        displayedConversations.length === 0 &&
        !isSearching &&
        searchTerm.trim() === '' && (
          <div className='flex flex-1 items-center justify-center '>
            <Loader2 size={24} className='mr-2 animate-spin' />
            <span>{t('Loading_Initial_History')}</span>
          </div>
        )}

      {(!isLoadingHistory || searchTerm.trim() !== '') &&
        displayedConversations.length === 0 && (
          <div className='flex flex-1 items-center justify-center text-center '>
            {searchTerm.trim() !== ''
              ? t('No_Search_Results_Found')
              : t('No_Conversations_Found_Yet')}
          </div>
        )}

      {displayedConversations.length > 0 && (
        <div className='overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-5 '>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider  '
                >
                  {t('Title')}
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider  '
                >
                  {t('Last_Activity')}
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
                >
                  {t('Actions')}
                </th>
              </tr>
            </thead>
            <tbody className='bg-white-pure divide-y divide-gray-200 dark:divide-gray-700 '>
              {displayedConversations.map(conv => (
                <tr key={conv.id} className='hover:bg-gray-5 transition-colors'>
                  <td className='whitespace-nowrap px-6 py-4'>
                    <div className='flex items-center'>
                      <div className='min-w-0 flex-1'>
                        {editingConvId === conv.id ? (
                          <div className='flex items-center gap-2'>
                            <input
                              type='text'
                              value={newTitleInput}
                              onChange={e => setNewTitleInput(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSaveRename(conv.id)
                                if (e.key === 'Escape') setEditingConvId(null)
                              }}
                              onBlur={() => {
                                if (newTitleInput.trim() !== '')
                                  handleSaveRename(conv.id)
                                else setEditingConvId(null)
                              }}
                              className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                              autoFocus
                            />
                            <button
                              onClick={() => setEditingConvId(null)}
                              className='flex-shrink-0 text-xs  '
                            >
                              {t('Cancel')}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSelectAndGoToChat(conv.id)}
                            className='block w-full truncate text-left text-sm font-medium text-blue-600 hover:underline dark:text-blue-400'
                            title={conv.title || t('Untitled_Conversation')}
                          >
                            {conv.isPinned && (
                              <Pin
                                size={14}
                                className='mr-1.5 inline-block align-text-bottom text-blue-500 dark:text-blue-400'
                              />
                            )}
                            {conv.title || t('Untitled_Conversation')}
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm '>
                    {formatDistanceToNow(new Date(conv.lastActivity), {
                      addSuffix: true
                    })}
                  </td>
                  <td className='whitespace-nowrap px-6 py-4 text-sm font-medium'>
                    <div className='flex items-center space-x-1.5'>
                      <button
                        onClick={() =>
                          handleRenameClick(conv.id, conv.title || '')
                        }
                        disabled={editingConvId === conv.id}
                        className='hover:bg-gray-10 rounded-md  p-1.5 hover:text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:opacity-50   dark:hover:text-gray-200'
                        title={t('Rename')}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleTogglePinClick(conv.id, conv.isPinned)
                        }
                        className={`rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:hover:bg-gray-700 ${
                          conv.isPinned
                            ? 'text-blue-600 dark:text-blue-400'
                            : ''
                        }`}
                        title={conv.isPinned ? t('Unpin') : t('Pin')}
                      >
                        {conv.isPinned ? (
                          <PinOff size={16} />
                        ) : (
                          <Pin size={16} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          handleClearClick(conv.id, conv.title || '')
                        }
                        className='rounded-md p-1.5 text-yellow-600 hover:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-yellow-500 dark:text-yellow-400 dark:hover:bg-yellow-700'
                        title={t('Clear_Messages')}
                      >
                        <Eraser size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteClick(conv.id, conv.title || '')
                        }
                        className='rounded-md p-1.5 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-700'
                        title={t('Delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ConversationHistoryPage
