// src/app/[locale]/chatbot/regularchat/ConversationList.tsx
import React, { useState, useCallback } from 'react' // Thêm useState, useCallback
import { ConversationMetadata } from '../lib/regular-chat.types'
import { PlusCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ConversationItem from './ConversationItem'

// Import Modal và Button
import Modal from '@/src/app/[locale]/chatbot/Modal' // Đảm bảo đường dẫn đúng
import Button from '../../utils/Button' // Đảm bảo đường dẫn đúng

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
  currentView: 'chat' | 'history'
  deletingConversationId: string | null
  disabled?: boolean
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
  currentView,
  deletingConversationId,
  disabled = false
}) => {
  const t = useTranslations()

  // --- State cho Modal xác nhận ---
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [confirmModalTitle, setConfirmModalTitle] = useState('')
  const [confirmModalMessage, setConfirmModalMessage] = useState('')
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null)
  // --- End State cho Modal xác nhận ---

  // Hàm hiển thị Modal xác nhận
  const showConfirmModal = useCallback(
    (title: string, message: string, onConfirm: () => void) => {
      setConfirmModalTitle(title)
      setConfirmModalMessage(message)
      setConfirmAction(() => onConfirm) // Lưu callback
      setIsConfirmModalOpen(true)
    },
    []
  )

  // Hàm xử lý khi người dùng xác nhận trong Modal
  const handleConfirmAction = useCallback(() => {
    if (confirmAction) {
      confirmAction() // Thực thi hành động đã lưu
    }
    setIsConfirmModalOpen(false) // Đóng modal
    setConfirmAction(null) // Xóa callback
  }, [confirmAction])

  // Hàm xử lý khi người dùng hủy trong Modal
  const handleCancelConfirm = useCallback(() => {
    setIsConfirmModalOpen(false) // Đóng modal
    setConfirmAction(null) // Xóa callback
  }, [])

  const handleDeleteWithConfirm = useCallback(
    (id: string, title: string) => {
      if (disabled) return
      const convTitle = title || t('Untitled_Conversation') // Sử dụng key dịch
      showConfirmModal(
        t('Confirm_Delete_Conversation_Title'),
        t('Confirm_Delete_Conversation', { title: convTitle }),
        () => {
          onDeleteConversation(id)
        }
      )
    },
    [disabled, onDeleteConversation, t, showConfirmModal]
  )

  const handleClearWithConfirm = useCallback(
    (id: string, title: string) => {
      if (disabled) return
      const convTitle = title || t('Untitled_Conversation') // Sử dụng key dịch
      showConfirmModal(
        t('Confirm_Clear_Conversation_Title'),
        t('Confirm_Clear_Conversation', { title: convTitle }),
        () => {
          onClearConversation(id)
        }
      )
    },
    [disabled, onClearConversation, t, showConfirmModal]
  )

  return (
    <div className='flex flex-grow flex-col overflow-hidden px-3 pb-3 pt-0'>
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-sm font-medium '>{t('Chat_History')}</span>
        <button
          onClick={onStartNewConversation}
          disabled={disabled || isLoading || !!deletingConversationId}
          className='flex items-center space-x-1 rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-900/50'
          title={t('Start_New_Chat')}
        >
          <PlusCircle size={14} />
          <span>{t('New_Chat')}</span>
        </button>
      </div>

      <div className='-mr-3 flex-grow space-y-1 overflow-y-auto pr-3'>
        {isLoading && conversationList.length === 0 && (
          <div className='flex items-center justify-center py-4 '>
            <Loader2 size={18} className='mr-2 animate-spin' />
            <span>{t('Loading')}</span>
          </div>
        )}
        {!isLoading && conversationList.length === 0 && (
          <div className='px-2 py-4 text-center text-sm '>
            {t('No_Conversations_Found')}
          </div>
        )}

        {conversationList.map(conv => (
          <ConversationItem
            key={conv.id}
            conv={conv}
            isActive={
              conv.id === activeConversationId &&
              currentView === 'chat' &&
              !disabled
            }
            isBeingDeleted={deletingConversationId === conv.id}
            isLoadingList={isLoading}
            onSelect={disabled ? () => {} : onSelectConversation}
            onDelete={handleDeleteWithConfirm}
            onClear={handleClearWithConfirm}
            onRename={disabled ? async () => {} : onRenameConversation}
            onTogglePin={disabled ? async () => {} : onPinConversation}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Modal xác nhận */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelConfirm} // Đóng modal khi hủy
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

export default ConversationList