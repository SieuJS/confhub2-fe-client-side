'use client'

import React, { useState, useEffect } from 'react'
import { Pencil, Pin, PinOff, Trash2, Eraser } from 'lucide-react' // Giữ lại icons cần thiết
import { ConversationMetadata } from '../lib/regular-chat.types'
import { useSharedChatSocket } from '../context/ChatSocketContext'
import { useTranslations } from 'next-intl'

interface ConversationToolbarProps {
  activeConversationId: string | null
  conversationList: ConversationMetadata[] // Cần để lấy metadata của conv hiện tại
}

const ConversationToolbar: React.FC<ConversationToolbarProps> = ({
  activeConversationId,
  conversationList
}) => {
  const t = useTranslations()
  const {
    renameConversation,
    pinConversation,
    clearConversation,
    deleteConversation,
    // Không cần loadConversation và startNewConversation ở đây trực tiếp
  } = useSharedChatSocket()

  const [currentTitle, setCurrentTitle] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [newTitleInput, setNewTitleInput] = useState('')
  // Không cần state showMoreMenu nữa

  const activeConversation = activeConversationId
    ? conversationList.find(conv => conv.id === activeConversationId)
    : null

  useEffect(() => {
    if (activeConversation) {
      setCurrentTitle(activeConversation.title)
      setIsPinned(activeConversation.isPinned)
      setNewTitleInput(activeConversation.title) // Khởi tạo input với title hiện tại
    } else {
      setCurrentTitle(t('New_Chat')) // Hoặc một tiêu đề mặc định khác
      setIsPinned(false)
    }
    setIsEditingTitle(false) // Reset editing state khi conversation thay đổi
    // Không cần reset showMoreMenu
  }, [activeConversation, t])

  const handleRename = () => {
    if (!activeConversationId || newTitleInput.trim() === '') return
    renameConversation(activeConversationId, newTitleInput.trim())
    setIsEditingTitle(false)
    // Title sẽ được cập nhật qua event `onConversationRenamed` và `conversationList` prop
  }

  const handleTogglePin = () => {
    if (!activeConversationId) return
    pinConversation(activeConversationId, !isPinned)
    // isPinned sẽ được cập nhật qua event `onConversationPinStatusChanged`
  }

  const handleClear = () => {
    if (!activeConversationId || !activeConversation) return
    if (
      window.confirm(
        t('Confirm_Clear_Conversation', { title: activeConversation.title })
      )
    ) {
      clearConversation(activeConversationId)
      // Việc cập nhật UI sau khi clear thường được xử lý bởi socket event
    }
    // Không cần đóng menu
  }

  const handleDelete = () => {
    if (!activeConversationId || !activeConversation) return
    if (
      window.confirm(
        t('Confirm_Delete_Conversation', { title: activeConversation.title })
      )
    ) {
      deleteConversation(activeConversationId)
      // Sau khi xóa, activeConversationId sẽ bị clear, UI sẽ tự động về trạng thái intro
    }
    // Không cần đóng menu
  }

  if (!activeConversationId) {
    return null // Không hiển thị toolbar nếu không có conversation nào active
  }

  return (
    <div className='bg-white-pure flex h-14 flex-shrink-0 items-center justify-between border-b border-gray-200 px-4 py-2 shadow-sm dark:border-gray-700 '>
      <div className='flex min-w-0 items-center'>
        {isEditingTitle ? (
          <input
            type='text'
            value={newTitleInput}
            onChange={e => setNewTitleInput(e.target.value)}
            onBlur={handleRename} // Lưu khi mất focus
            onKeyDown={e => e.key === 'Enter' && handleRename()}
            className='mr-2 rounded-md border border-gray-300 px-2 py-1 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            autoFocus
          />
        ) : (
          <h2
            className='truncate text-base font-semibold '
            title={currentTitle}
          >
            {currentTitle}
          </h2>
        )}
      </div>

      <div className='flex items-center space-x-2'>
        {/* Rename Button */}
        <button
          onClick={() => setIsEditingTitle(true)}
          disabled={isEditingTitle}
          className='rounded-md p-1.5  hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500  dark:hover:bg-gray-700 dark:hover:text-gray-200'
          title={t('Rename_Conversation')}
        >
          <Pencil size={18} />
        </button>

        {/* Pin/Unpin Button */}
        <button
          onClick={handleTogglePin}
          className={`rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-700 ${
            isPinned
              ? 'text-blue-600 dark:text-blue-400 dark:hover:text-blue-300'
              : '  dark:hover:text-gray-200'
          }`}
          title={isPinned ? t('Unpin_Conversation') : t('Pin_Conversation')}
        >
          {isPinned ? <PinOff size={18} /> : <Pin size={18} />}
        </button>

        {/* Clear Button (Di chuyển ra ngoài menu) */}
        <button
          onClick={handleClear}
          className='rounded-md p-1.5  hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500  dark:hover:bg-gray-700 dark:hover:text-gray-200'
          title={t('Clear_Messages')}
        >
          <Eraser size={18} />
        </button>

        {/* Delete Button (Di chuyển ra ngoài menu) */}
        <button
          onClick={handleDelete}
          className='rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-700 dark:hover:text-red-300'
          title={t('Delete_Conversation')}
        >
          <Trash2 size={18} />
        </button>

      </div>
    </div>
  )
}

export default ConversationToolbar