// src/app/[locale]/chatbot/regularchat/ChatMessageDisplay.tsx
import React from 'react'
import {
  MessageType,
  ThoughtStep,
  FrontendAction,
  ChatMessageType,
  SourceItem
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'
import { TriangleAlert, Info } from 'lucide-react' // <<< MODIFIED: Thêm Info icon
import ThoughtProcess from './ThoughtProcess'
import { useSettingsStore } from '../stores'
import { useShallow } from 'zustand/react/shallow'

import { useMessageEditing } from '@/src/hooks/regularchat/useMessageEditing'
import { useMessageCopy } from '@/src/hooks/regularchat/useMessageCopy'
import { useMessageBubbleLogic } from '@/src/hooks/regularchat/useMessageBubbleLogic'

import EditMessageForm from './EditMessageForm'
import MessageContentRenderer from './MessageContentRenderer'
import MessageActionsBar from './MessageActionsBar'
import MessageSourcesDisplay from './MessageSourcesDisplay'
import { Part } from '@google/genai'

interface ChatMessageDisplayProps {
  id: string
  text?: string
  parts?: Part[]
  files?: ChatMessageType['files']
  botFiles?: ChatMessageType['botFiles']
  isUser: boolean
  type: MessageType
  thoughts?: ThoughtStep[]
  location?: string
  action?: FrontendAction
  timestamp?: string | Date
  sources?: SourceItem[]
  isInsideSmallContainer?: boolean
  isLatestUserMessage: boolean
  onConfirmEdit: (messageId: string, newText: string) => void
  // <<< NEW PROP
  onOpenFeedbackModal: (messageId: string, type: 'like' | 'dislike') => void;
}

const ChatMessageDisplay: React.FC<ChatMessageDisplayProps> = ({
  id,
  text,
  parts,
  files,
  botFiles,
  isUser,
  type = 'text',
  thoughts,
  location,
  action,
  timestamp,
  sources,
  isInsideSmallContainer = false,
  isLatestUserMessage,
  onConfirmEdit,
  // <<< NEW PROP
  onOpenFeedbackModal
}) => {
  const { isThoughtProcessHiddenInFloatingChat } = useSettingsStore(
    useShallow(state => ({
      isThoughtProcessHiddenInFloatingChat:
        state.isThoughtProcessHiddenInFloatingChat
    }))
  )

  const primaryTextContent = text || parts?.find(p => p.text)?.text || ''

  const {
    isEditing,
    editedText,
    textareaRef,
    startEdit,
    confirmEdit,
    cancelEdit,
    handleInputChange,
    handleKeyDown
  } = useMessageEditing({
    messageId: id,
    initialMessage: primaryTextContent,
    isUser,
    isLatestUserMessage,
    onConfirmEdit
  })

  const { isCopied, handleCopy } = useMessageCopy(primaryTextContent)

  const { bubbleRef, bubbleClasses } = useMessageBubbleLogic({
    id,
    initialMessage: primaryTextContent,
    isUser,
    type,
    isInsideSmallContainer
  })

  const shouldShowThoughtProcess =
    !isUser &&
    thoughts &&
    thoughts.length > 0 &&
    (!isInsideSmallContainer ||
      (isInsideSmallContainer && !isThoughtProcessHiddenInFloatingChat))

  const handleEditButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation()
    startEdit()
  }
  const handleConfirmEditClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation()
    confirmEdit()
  }
  const handleCancelEditClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation()
    cancelEdit()
  }

  // <<< NEW: Handler for feedback buttons
  const handleFeedback = (type: 'like' | 'dislike') => {
    onOpenFeedbackModal(id, type);
  };

  const canMessageBeEdited = type === 'text' || (type === 'multimodal' && !!text);

  return (
    <div ref={bubbleRef} className={bubbleClasses}>
      {/* ... (Error/Warning icons) ... */}
      {type === 'error' && (
        <TriangleAlert className='absolute -left-1.5 -top-1.5 mr-1.5 inline-block h-4 w-4 rounded-full bg-white p-0.5 text-red-600 shadow dark:bg-gray-800 dark:text-red-400' />
      )}
      {type === 'warning' && (
        <TriangleAlert className='absolute -left-1.5 -top-1.5 mr-1.5 inline-block h-4 w-4 rounded-full bg-white p-0.5 text-yellow-600 shadow dark:bg-gray-800 dark:text-yellow-400' />
      )}

      {isEditing ? (
        <EditMessageForm
          editedText={editedText}
          textareaRef={textareaRef}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <MessageContentRenderer
          text={text}
          parts={parts}
          files={files}
          botFiles={botFiles}
          type={type}
          location={location}
          action={action}
          isUserMessage={isUser}
        />
      )}

      {!isUser && sources && sources.length > 0 && (
        <MessageSourcesDisplay sources={sources} />
      )}

      <MessageActionsBar
        isUser={isUser}
        isLatestUserMessage={isLatestUserMessage}
        messageType={type}
        isEditing={isEditing}
        isCopied={isCopied}
        onCopy={handleCopy}
        onStartEdit={handleEditButtonClick}
        onConfirmEdit={handleConfirmEditClick}
        onCancelEdit={handleCancelEditClick}
        canEditText={canMessageBeEdited}
        onFeedback={handleFeedback} // <<< PASS HANDLER
      />

      {/* <<< NEW: Survey Notification Message (only for bot messages) >>> */}
      {!isUser && type !== 'error' && type !== 'warning' && (
        <div className="mt-2.5 border-t border-black/10 pt-1.5 dark:border-white/20">
          <p className="flex items-center text-xs text-green-500 dark:text-gray-400">
            <Info size={14} className="mr-1.5 flex-shrink-0" />
            <span>Vui lòng đánh giá phản hồi này để giúp nhóm chúng em cải thiện chất lượng!.</span>
          </p>
        </div>
      )}

      {shouldShowThoughtProcess && (
        <div className='mt-2 border-t border-black/10 pt-1.5 dark:border-white/20 sm:mt-3 sm:pt-2'>
          <ThoughtProcess thoughts={thoughts} />
        </div>
      )}
      {timestamp && (
        <div
          className={`mt-1 text-xs ${isUser ? 'text-white ' : 'text-gray-60 '} ${isUser ? 'text-right' : 'text-left'}`}
        >
          {new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}
        </div>
      )}
    </div>
  )
}

export default ChatMessageDisplay