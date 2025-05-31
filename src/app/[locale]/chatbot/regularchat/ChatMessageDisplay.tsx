// src/app/[locale]/chatbot/regularchat/ChatMessageDisplay.tsx
import React from 'react';
import {
  MessageType, // This should be ChatMessageType['type']
  ThoughtStep,
  FrontendAction,
  ChatMessageType // <<< IMPORT ChatMessageType for files/botFiles
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { TriangleAlert } from 'lucide-react';
import ThoughtProcess from './ThoughtProcess';
import { useSettingsStore } from '../stores';
import { useShallow } from 'zustand/react/shallow';

import { useMessageEditing } from '@/src/hooks/regularchat/useMessageEditing';
import { useMessageCopy } from '@/src/hooks/regularchat/useMessageCopy';
import { useMessageBubbleLogic } from '@/src/hooks/regularchat/useMessageBubbleLogic';

import EditMessageForm from './EditMessageForm';
import MessageContentRenderer from './MessageContentRenderer'; // This will need significant updates
import MessageActionsBar from './MessageActionsBar';
import { Part } from '@google/genai';
interface ChatMessageDisplayProps {
  id: string;
  // message: string; // <<< OLD: Remove this
  text?: string; // <<< NEW: Primary textual content
  parts?: Part[]; // <<< NEW: For multimodal content
  files?: ChatMessageType['files']; // <<< NEW: User uploaded files
  botFiles?: ChatMessageType['botFiles']; // <<< NEW: Bot sent files
  isUser: boolean;
  type: MessageType; // This is ChatMessageType['type']
  thoughts?: ThoughtStep[];
  location?: string;
  action?: FrontendAction;
  timestamp?: string | Date; // <<< NEW: Add timestamp
  isInsideSmallContainer?: boolean;
  isLatestUserMessage: boolean;
  onConfirmEdit: (messageId: string, newText: string) => void;
}

const ChatMessageDisplay: React.FC<ChatMessageDisplayProps> = ({
  id,
  text, // <<< USE text
  parts, // <<< USE parts
  files, // <<< USE files
  botFiles, // <<< USE botFiles
  isUser,
  type = 'text', // Default type
  thoughts,
  location,
  action,
  timestamp, // <<< USE timestamp
  isInsideSmallContainer = false,
  isLatestUserMessage,
  onConfirmEdit,
}) => {
  const { isThoughtProcessHiddenInFloatingChat } = useSettingsStore(
    useShallow(state => ({
      isThoughtProcessHiddenInFloatingChat: state.isThoughtProcessHiddenInFloatingChat,
    }))
  );

  // The primary text content for editing and copying should come from `text` prop.
  // If `text` is undefined (e.g., a message with only an image), provide a fallback.
  const primaryTextContent = text || (parts?.find(p => p.text)?.text) || "";

  const {
    isEditing,
    editedText,
    textareaRef,
    startEdit,
    confirmEdit,
    cancelEdit,
    handleInputChange,
    handleKeyDown,
  } = useMessageEditing({
    messageId: id,
    initialMessage: primaryTextContent, // <<< USE primaryTextContent
    isUser,
    isLatestUserMessage,
    onConfirmEdit,
  });

  const { isCopied, handleCopy } = useMessageCopy(primaryTextContent); // <<< USE primaryTextContent

  const { bubbleRef, bubbleClasses } = useMessageBubbleLogic({
    id,
    initialMessage: primaryTextContent, // <<< USE primaryTextContent (or consider full parts for logic if needed)
    isUser,
    type,
    isInsideSmallContainer,
  });

  const shouldShowThoughtProcess =
    !isUser &&
    thoughts &&
    thoughts.length > 0 &&
    (!isInsideSmallContainer || (isInsideSmallContainer && !isThoughtProcessHiddenInFloatingChat));

  const handleEditButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    startEdit();
  };
  const handleConfirmEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    confirmEdit();
  };
  const handleCancelEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    cancelEdit();
  };

  // TODO: Add rendering for timestamp, e.g., below the message content or on hover

  return (
    <div ref={bubbleRef} className={bubbleClasses}>
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
          isUserMessage={isUser} // <<< TRUYỀN isUser XUỐNG
        />
      )}

      <MessageActionsBar
        isUser={isUser}
        isLatestUserMessage={isLatestUserMessage}
        messageType={type} // Pass the message type
        isEditing={isEditing}
        isCopied={isCopied}
        onCopy={handleCopy}
        onStartEdit={handleEditButtonClick}
        onConfirmEdit={handleConfirmEditClick}
        onCancelEdit={handleCancelEditClick}
        // Disable editing for non-text messages or messages with files for now
        // Or allow editing only the text part if `text` is present.
        canEditText={type === 'text' || (type === 'multimodal' && !!text)}
      />

      {shouldShowThoughtProcess && (
        <div className='mt-2 border-t border-black/10 pt-1.5 sm:mt-3 sm:pt-2 dark:border-white/20'>
          <ThoughtProcess thoughts={thoughts} />
        </div>
      )}
       {/* Optional: Display timestamp */}
       {timestamp && (
        <div className={`text-xs mt-1 ${isUser ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'} ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
        </div>
      )}
    </div>
  );
};

export default ChatMessageDisplay;