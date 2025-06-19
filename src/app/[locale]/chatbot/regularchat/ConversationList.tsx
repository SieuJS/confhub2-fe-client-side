// src/app/[locale]/chatbot/regularchat/ConversationList.tsx
import React from 'react'
import { ConversationMetadata } from '../lib/regular-chat.types'
import { PlusCircle, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import ConversationItem from './ConversationItem'

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
  disabled?: boolean // <<<< THÊM PROP DISABLED >>>>
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
  disabled = false // <<<< GIÁ TRỊ MẶC ĐỊNH >>>>
}) => {
  const t = useTranslations()

  const handleDeleteWithConfirm = (id: string, title: string) => {
    if (disabled) return // Không làm gì nếu bị disabled
    if (
      window.confirm(
        t('Confirm_Delete_Conversation', { title: title || 'Untitled' })
      )
    ) {
      onDeleteConversation(id)
    }
  }

  const handleClearWithConfirm = (id: string, title: string) => {
    if (disabled) return // Không làm gì nếu bị disabled
    if (
      window.confirm(
        t('Confirm_Clear_Conversation', { title: title || 'Untitled' })
      )
    ) {
      onClearConversation(id)
    }
  }

  return (
    <div className='flex flex-grow flex-col overflow-hidden px-3 pb-3 pt-0'>
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-sm font-medium '>{t('Chat_History')}</span>
        <button
          onClick={onStartNewConversation}
          disabled={disabled || isLoading || !!deletingConversationId} // <<<< SỬ DỤNG PROP DISABLED >>>>
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
            } // Không active nếu disabled
            isBeingDeleted={deletingConversationId === conv.id}
            isLoadingList={isLoading}
            onSelect={disabled ? () => {} : onSelectConversation} // Vô hiệu hóa onSelect
            onDelete={handleDeleteWithConfirm} // handleDeleteWithConfirm đã kiểm tra disabled
            onClear={handleClearWithConfirm} // handleClearWithConfirm đã kiểm tra disabled
            onRename={disabled ? async () => {} : onRenameConversation} // Vô hiệu hóa onRename
            onTogglePin={disabled ? async () => {} : onPinConversation} // Vô hiệu hóa onTogglePin
            disabled={disabled} // <<<< TRUYỀN PROP DISABLED XUỐNG ConversationItem >>>>
          />
        ))}
      </div>
    </div>
  )
}

export default ConversationList
