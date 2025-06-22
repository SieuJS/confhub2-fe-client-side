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
import Modal from '@/src/app/[locale]/chatbot/Modal'
import Button from '../../utils/Button'

const ConversationHistoryPage: React.FC = () => {
  const t = useTranslations()
  const router = useRouter()
 // --- THÊM STATE ĐỂ THEO DÕI MOUNTING ---
  const [hasMounted, setHasMounted] = useState(false)
  const {
    conversationList: initialListFromStore,
    searchResults,
    isSearching,
    isLoadingHistory // Đây là state quan trọng nhất cho việc loading
  } = useConversationListState()

  // Xóa bỏ `loadHistory` vì nó không tồn tại trong actions của bạn
  const {
    loadConversation,
    deleteConversation,
    clearConversation,
    renameConversation,
    pinConversation,
    searchConversations
  } = useConversationActions()

  const { setActiveConversationId } = useConversationStore()
  const { resetChatUIForNewConversation } = useMessageStore()

  const { chatMode } = useChatSettingsState()

  const [searchTerm, setSearchTerm] = useState('')
  const [displayedConversations, setDisplayedConversations] =
    useState<ConversationMetadata[]>(initialListFromStore)

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmModalTitle, setConfirmModalTitle] = useState('')
  const [confirmModalMessage, setConfirmModalMessage] = useState('')
  const [modalCallbacks, setModalCallbacks] = useState<{
    onConfirm: (() => void) | null
    onCancel: (() => void) | null
  }>({ onConfirm: null, onCancel: null })

  // --- SỬ DỤNG USEEFFECT ĐỂ CẬP NHẬT STATE SAU KHI MOUNT ---
  useEffect(() => {
    setHasMounted(true)
  }, [])

  
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
      router.push({ pathname: targetPath, query: { id: conversationId } })
    },
    [loadConversation, router, chatMode]
  )

  const handleStartNewAndGoToChat = useCallback(() => {
    setActiveConversationId(null)
    resetChatUIForNewConversation(true)
    const targetPath =
      chatMode === 'live' ? '/chatbot/livechat' : '/chatbot/regularchat'
    router.push(targetPath)
  }, [router, chatMode, setActiveConversationId, resetChatUIForNewConversation])

  const showConfirmModal = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel: () => void
    ) => {
      setConfirmModalTitle(title)
      setConfirmModalMessage(message)
      setModalCallbacks({ onConfirm, onCancel })
      setIsConfirmModalOpen(true)
    },
    []
  )

  const handleConfirmAction = useCallback(() => {
    modalCallbacks.onConfirm?.()
    setIsConfirmModalOpen(false)
    setModalCallbacks({ onConfirm: null, onCancel: null })
  }, [modalCallbacks])

  const handleCancelConfirm = useCallback(() => {
    modalCallbacks.onCancel?.()
    setIsConfirmModalOpen(false)
    setModalCallbacks({ onConfirm: null, onCancel: null })
  }, [modalCallbacks])

  const handleDeleteWithConfirm = useCallback(
    (id: string, title: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const convTitle = title || t('Untitled_Conversation')
        showConfirmModal(
          t('Confirm_Delete_Conversation_Title'),
          t('Confirm_Delete_Conversation', { title: convTitle }),
          async () => {
            try {
              await deleteConversation(id)
              resolve()
            } catch (error) {
              reject(error)
            }
          },
          () => reject(new Error('Deletion cancelled by user'))
        )
      })
    },
    [deleteConversation, t, showConfirmModal]
  )

  const handleClearWithConfirm = useCallback(
    (id: string, title: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const convTitle = title || t('Untitled_Conversation')
        showConfirmModal(
          t('Confirm_Clear_Conversation_Title'),
          t('Confirm_Clear_Conversation', { title: convTitle }),
          () => {
            clearConversation(id)
            resolve()
          },
          () => reject(new Error('Clear cancelled by user'))
        )
      })
    },
    [clearConversation, t, showConfirmModal]
  )

  const renderLoading = () => (
    <div className='flex h-full flex-col items-center justify-center bg-gray-10 p-4 dark:bg-gray-900 md:p-6'>
      <Loader2 className='h-10 w-10 animate-spin text-blue-600' />
      <p className='mt-4 text-lg text-gray-700 dark:text-gray-300'>
        {t('History_Loading_Message')}
      </p>
    </div>
  )

  // --- SỬA LẠI ĐIỀU KIỆN LOADING ---
  // Hiển thị loading nếu:
  // 1. Component chưa mount (để tránh "flash" của nội dung không chính xác).
  // 2. Hoặc store đang trong quá trình tải lịch sử.
  if (!hasMounted || isLoadingHistory) {
    return renderLoading()
  }


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

      {displayedConversations.length === 0 ? (
        <div className='flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800/30'>
          <div>
            <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
              {searchTerm.trim() !== ''
                ? t('No_Search_Results_Found')
                : t('No_Conversations_Found_Yet')}
            </h3>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              {searchTerm.trim() !== ''
                ? t('Try_different_keywords')
                : t('Start_a_new_chat_to_see_it_here')}
            </p>
          </div>
        </div>
      ) : (
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

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelConfirm}
        title={confirmModalTitle}
        footer={
          <>
            <Button variant='secondary' onClick={handleCancelConfirm}>
              {t('Common_Cancel')}
            </Button>
            <Button variant='danger' onClick={handleConfirmAction}>
              {t('Common_Confirm')}
            </Button>
          </>
        }
      >
        <p>{confirmModalMessage}</p>
      </Modal>
    </div>
  )
}

export default ConversationHistoryPage