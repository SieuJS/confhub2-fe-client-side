// src/app/[locale]/chatbot/regularchat/ConversationItem.tsx
import React, { useState, useRef, useEffect } from 'react'
import { ConversationMetadata } from '../lib/regular-chat.types'
import {
  Loader2,
  Trash2,
  Eraser,
  Pencil,
  Pin,
  PinOff,
  Check,
  X as CancelIcon
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns' // Cân nhắc dùng date-fns/locale nếu cần đa ngôn ngữ cho format này
import { useTranslations } from 'next-intl'

interface ConversationItemProps {
  conv: ConversationMetadata
  isActive: boolean
  isBeingDeleted: boolean
  isLoadingList: boolean
  onSelect: (id: string) => void
  onDelete: (id: string, title: string) => void
  onClear: (id: string, title: string) => void
  onRename: (id: string, newTitle: string) => void
  onTogglePin: (id: string, currentPinStatus: boolean) => void
  disabled?: boolean // <<<< NHẬN PROP DISABLED TỪ CHA >>>>
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conv,
  isActive,
  isBeingDeleted,
  isLoadingList,
  onSelect,
  onDelete,
  onClear,
  onRename,
  onTogglePin,
  disabled = false // <<<< GIÁ TRỊ MẶC ĐỊNH VÀ SỬ DỤNG >>>>
}) => {
  const t = useTranslations()

  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(conv.title || '')
  const inputRef = useRef<HTMLInputElement>(null)

  const title = conv.title || `Chat ${conv.id.substring(0, 6)}...`

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    if (!isEditing) {
      setEditText(conv.title || '')
    }
  }, [conv.title, isEditing])

  // Kết hợp tất cả các điều kiện khiến item bị vô hiệu hóa
  const itemIsEffectivelyDisabled = disabled || isLoadingList || isBeingDeleted

  const handleEditStart = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (itemIsEffectivelyDisabled) return // Kiểm tra điều kiện disable tổng hợp
    setIsEditing(true)
    setEditText(conv.title || '')
  }

  const handleEditCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsEditing(false)
  }

  const handleEditSave = (e?: React.MouseEvent | React.FormEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    if (itemIsEffectivelyDisabled) return // Kiểm tra trước khi lưu
    if (editText.trim() !== '') {
      onRename(conv.id, editText.trim())
    }
    setIsEditing(false)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (itemIsEffectivelyDisabled) return // Kiểm tra
    onDelete(conv.id, title)
  }

  const handleClearClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (itemIsEffectivelyDisabled) return // Kiểm tra
    onClear(conv.id, title)
  }

  const handleTogglePinClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (itemIsEffectivelyDisabled) return // Kiểm tra
    // TRUYỀN TRẠNG THÁI PIN MỚI (NGƯỢC LẠI VỚI HIỆN TẠI)
    onTogglePin(conv.id, !conv.isPinned) // <<<< THAY ĐỔI Ở ĐÂY
  }

  const handleSelectConvClick = () => {
    // Ngăn chọn nếu item bị disabled, hoặc đang xóa, hoặc đang sửa
    if (itemIsEffectivelyDisabled || isEditing) return
    onSelect(conv.id)
  }

  return (
    <div
      className={`group relative rounded-md transition-colors duration-150
        ${isActive && !itemIsEffectivelyDisabled ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
        ${isBeingDeleted ? 'animate-pulse cursor-default opacity-70' : ''}
        ${itemIsEffectivelyDisabled && !isBeingDeleted ? 'cursor-not-allowed opacity-60' : ''}
      `}
      // Không cần aria-disabled ở đây vì button bên trong sẽ xử lý
    >
      {isEditing ? (
        <form
          onSubmit={handleEditSave}
          className='flex items-center space-x-1 p-2'
        >
          <input
            ref={inputRef}
            type='text'
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Escape') handleEditCancel()
            }}
            disabled={itemIsEffectivelyDisabled} // Vô hiệu hóa input nếu cần
            className='mr-1 flex-grow rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
          />
          <button
            type='submit'
            title={t('Save_Title')}
            className='rounded-md p-1.5 text-green-600 hover:bg-green-100 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-green-800'
            disabled={itemIsEffectivelyDisabled || editText.trim() === ''}
          >
            {' '}
            {/* Vô hiệu hóa nút save */}
            <Check size={16} />
          </button>
          <button
            type='button'
            onClick={handleEditCancel}
            title={t('Cancel_Edit')}
            className='rounded-md p-1.5  hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-600'
            disabled={itemIsEffectivelyDisabled}
          >
            {' '}
            {/* Vô hiệu hóa nút cancel edit */}
            <CancelIcon size={16} />
          </button>
        </form>
      ) : (
        <button
          onClick={handleSelectConvClick}
          disabled={itemIsEffectivelyDisabled} // <<<< SỬ DỤNG itemIsEffectivelyDisabled >>>>
          className={`w-full py-2 pl-3 pr-24 text-left text-sm focus:outline-none
            ${isActive && !itemIsEffectivelyDisabled ? 'font-semibold text-blue-800 dark:text-blue-300' : ' '}
            ${isBeingDeleted ? 'cursor-not-allowed' : ''} // isBeingDeleted đã được bao gồm trong itemIsEffectivelyDisabled
            // Class chung cho disabled disabled:cursor-not-allowed disabled:opacity-70
          `}
          aria-current={
            isActive && !itemIsEffectivelyDisabled ? 'page' : undefined
          }
        >
          <div className='flex items-center'>
            {conv.isPinned && (
              <Pin
                size={14}
                className={`mr-1.5 flex-shrink-0 text-blue-500 dark:text-blue-400 ${itemIsEffectivelyDisabled ? 'opacity-50' : ''}`}
              />
            )}
            <span className='truncate font-medium' title={title}>
              {title}
            </span>
          </div>
          <div
            className={`text-xs ${isActive && !itemIsEffectivelyDisabled ? 'text-blue-600 dark:text-blue-400' : ''}`}
          >
            {/* Cân nhắc thêm date-fns locale nếu cần */}
            {formatDistanceToNow(new Date(conv.lastActivity), {
              addSuffix: true
            })}
          </div>
        </button>
      )}

      {/* Các nút hành động chỉ hiển thị khi không chỉnh sửa VÀ item không bị disable hoàn toàn cho actions */}
      {!isEditing && (
        <div
          className={`absolute right-0 top-0 flex h-full items-center space-x-0.5 pr-1 transition-opacity duration-150
          ${isBeingDeleted ? 'opacity-100' : 'opacity-0 focus-within:opacity-100 group-hover:opacity-100'}
          ${itemIsEffectivelyDisabled ? 'cursor-not-allowed !opacity-50' : ''} /* Thêm !important nếu cần override group-hover */
        `}
        >
          <button
            onClick={handleTogglePinClick}
            disabled={itemIsEffectivelyDisabled} // <<<< SỬ DỤNG itemIsEffectivelyDisabled >>>>
            title={conv.isPinned ? t('Unpin') : t('Pin')}
            className={`rounded-md p-1.5 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-700 ${conv.isPinned ? 'text-blue-600 dark:text-blue-400' : ''}`}
          >
            {conv.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
          </button>
          <button
            onClick={handleEditStart}
            disabled={itemIsEffectivelyDisabled} // <<<< SỬ DỤNG itemIsEffectivelyDisabled >>>>
            title={t('Rename')}
            className='rounded-md p-1.5  hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50  dark:hover:bg-gray-700'
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleClearClick}
            disabled={itemIsEffectivelyDisabled} // <<<< SỬ DỤNG itemIsEffectivelyDisabled >>>>
            title={t('Clear_Messages')}
            className='rounded-md p-1.5 text-yellow-600 hover:bg-yellow-100 focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-yellow-400 dark:hover:bg-yellow-700'
          >
            <Eraser size={14} />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={itemIsEffectivelyDisabled && !isBeingDeleted} // Chỉ disable thêm nếu không phải do isBeingDeleted
            title={t('Delete_Conversation')}
            className='rounded-md p-1.5 text-red-600 hover:bg-red-100 focus:outline-none focus:ring-1 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-700'
          >
            {isBeingDeleted ? (
              <Loader2 size={14} className='animate-spin' />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default ConversationItem
