// src/app/[locale]/chatbot/history/ConversationHistoryPage.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  useConversationListState,
  useConversationActions,
  useChatSettingsState
} from '@/src/app/[locale]/chatbot/stores/storeHooks'
import { useConversationStore } from '../stores'
import { useMessageStore } from '../stores'
import { ConversationMetadata } from '../lib/regular-chat.types'
import { Loader2, MessageSquarePlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/src/navigation'
import HistoryTableRow from './HistoryTableRow'

const ConversationHistoryPage: React.FC = () => {
  const t = useTranslations()
  const router = useRouter()

  const {
    conversationList: initialListFromStore,
    searchResults,
    isSearching,
    isLoadingHistory
  } = useConversationListState()

  const {
    // BỎ DÒNG NÀY: startNewConversation, // KHÔNG CẦN GỌI HÀM NÀY NỮA
    loadConversation,
    deleteConversation,
    clearConversation,
    renameConversation,
    pinConversation,
    searchConversations
  } = useConversationActions()

  // Lấy các actions cần thiết để reset UI
  const { setActiveConversationId } = useConversationStore() // <<< THÊM DÒNG NÀY
  const { resetChatUIForNewConversation } = useMessageStore() // <<< THÊM DÒNG NÀY

  const { chatMode, currentLanguage } = useChatSettingsState()

  const [searchTerm, setSearchTerm] = useState('')
  const [displayedConversations, setDisplayedConversations] =
    useState<ConversationMetadata[]>(initialListFromStore)

  useEffect(() => {
    searchConversations(searchTerm)
  }, [searchTerm, searchConversations])

  useEffect(() => {
    if (searchTerm.trim() !== '') {
      setDisplayedConversations(searchResults)
    } else {
      setDisplayedConversations(initialListFromStore)
    }
  }, [searchTerm, searchResults, initialListFromStore])

  const handleSelectAndGoToChat = useCallback(
    (conversationId: string) => {
      loadConversation(conversationId)
      const targetPath =
        chatMode === 'live' ? '/chatbot/livechat' : '/chatbot/regularchat'
      router.push({ pathname: targetPath, query: { id: conversationId } }) // <<< QUAN TRỌNG: THÊM ID VÀO QUERY
    },
    [loadConversation, router, chatMode]
  )

  const handleStartNewAndGoToChat = useCallback(() => {
    // KHÔNG GỌI startNewConversation(currentLanguage.code) NỮA
    // Thay vào đó, reset UI client-side và điều hướng
    setActiveConversationId(null); // Đảm bảo activeConversationId là null
    resetChatUIForNewConversation(true); // Xóa tin nhắn và reset UI

    const targetPath =
      chatMode === 'live' ? '/chatbot/livechat' : '/chatbot/regularchat'
    router.push(targetPath) // Điều hướng đến trang chat cơ bản (không có ID)
  }, [router, chatMode, setActiveConversationId, resetChatUIForNewConversation]) // Thêm dependencies

  const handleDeleteWithConfirm = useCallback(
    async (id: string, title: string) => {
      if (
        window.confirm(
          t('Confirm_Delete_Conversation', {
            title: title || t('Untitled_Conversation')
          })
        )
      ) {
        try {
          await deleteConversation(id)
        } catch (error) {
          console.error('Error deleting conversation from history page:', error)
          throw error
        }
      } else {
        throw new Error('Deletion cancelled by user')
      }
    },
    [deleteConversation, t]
  )

  const handleClearWithConfirm = useCallback(
    (id: string, title: string) => {
      if (
        window.confirm(
          t('Confirm_Clear_Conversation', {
            title: title || t('Untitled_Conversation')
          })
        )
      ) {
        clearConversation(id)
      }
    },
    [clearConversation, t]
  )

  const showInitialLoading =
    isLoadingHistory &&
    displayedConversations.length === 0 &&
    searchTerm.trim() === ''

  return (
    <div className='flex h-full flex-col bg-gray-10 p-4 dark:bg-gray-900 md:p-6'>
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
          className='flex-grow rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-primary focus:border-blue-500 focus:ring-blue-500  dark:border-gray-600 dark:placeholder-gray-400'
        />
        {isSearching && (
          <div className='flex items-center justify-center px-2'>
            <Loader2 size={18} className='animate-spin ' />
          </div>
        )}
      </div>

      {showInitialLoading && (
        <div className='flex flex-1 items-center justify-center '>
          <Loader2 size={24} className='mr-2 animate-spin' />
          <span>{t('Loading_Initial_History')}</span>
        </div>
      )}

      {!showInitialLoading && displayedConversations.length === 0 && (
        <div className='flex flex-1 items-center justify-center text-center '>
          {searchTerm.trim() !== ''
            ? t('No_Search_Results_Found')
            : t('No_Conversations_Found_Yet')}
        </div>
      )}

      {displayedConversations.length > 0 && (
        <div className='overflow-x-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-700'>
          <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
            <thead className='bg-gray-100 dark:bg-gray-800'>
              <tr>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
                >
                  {t('Title')}
                </th>
                <th
                  scope='col'
                  className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider '
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
            <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800/30'>
              {displayedConversations.map(conv => (
                <HistoryTableRow
                  key={conv.id}
                  conv={conv}
                  onSelectAndGoToChat={handleSelectAndGoToChat}
                  onDelete={handleDeleteWithConfirm}
                  onClear={handleClearWithConfirm}
                  onRename={renameConversation}
                  onTogglePin={pinConversation}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ConversationHistoryPage