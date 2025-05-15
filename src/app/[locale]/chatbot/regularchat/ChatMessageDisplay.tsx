// src/app/[locale]/chatbot/regularchat/ChatMessageDisplay.tsx
import React from 'react';
import {
  MessageType,
  ThoughtStep,
  FrontendAction
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { TriangleAlert } from 'lucide-react';
import ThoughtProcess from './ThoughtProcess';
import { useSettingsStore } from '../stores';
import { useShallow } from 'zustand/react/shallow';

// Import Hooks
import { useMessageEditing } from '@/src/hooks/chatbot/useMessageEditing'; // Adjust path
import { useMessageCopy } from '@/src/hooks/chatbot/useMessageCopy';     // Adjust path
import { useMessageBubbleLogic } from '@/src/hooks/chatbot/useMessageBubbleLogic'; // Adjust path

// Impor.
import EditMessageForm from './EditMessageForm';         // Adjust path
import MessageContentRenderer from './MessageContentRenderer'; // Adjust path
import MessageActionsBar from './MessageActionsBar';       // Adjust path

interface ChatMessageDisplayProps {
  id: string;
  message: string; // Renamed back to message, initialMessage was for internal state
  isUser: boolean;
  type: MessageType;
  thoughts?: ThoughtStep[];
  location?: string;
  action?: FrontendAction;
  isInsideSmallContainer?: boolean;
  isLatestUserMessage: boolean;
  onConfirmEdit: (messageId: string, newText: string) => void;
}

const ChatMessageDisplay: React.FC<ChatMessageDisplayProps> = ({
  id,
  message, // Use 'message' as the prop name for the current message content
  isUser,
  type = 'text',
  thoughts,
  location,
  action,
  isInsideSmallContainer = false,
  isLatestUserMessage,
  onConfirmEdit,
}) => {
  const { isThoughtProcessHiddenInFloatingChat } = useSettingsStore(
    useShallow(state => ({
      isThoughtProcessHiddenInFloatingChat: state.isThoughtProcessHiddenInFloatingChat,
    }))
  );

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
    initialMessage: message, // Pass current message as initialMessage to the hook
    isUser,
    isLatestUserMessage,
    onConfirmEdit,
  });

  const { isCopied, handleCopy } = useMessageCopy(message); // Use current message for copy

  const { bubbleRef, bubbleClasses } = useMessageBubbleLogic({
    id,
    initialMessage: message,
    isUser,
    type,
    isInsideSmallContainer,
  });

  const shouldShowThoughtProcess =
    !isUser &&
    thoughts &&
    thoughts.length > 0 &&
    (!isInsideSmallContainer || (isInsideSmallContainer && !isThoughtProcessHiddenInFloatingChat));

  // Event handlers for MessageActionsBar (need to be defined here or passed directly from hooks)
  // We can pass hook functions directly to MessageActionsBar if their signatures match.
  // For example, `startEdit` from `useMessageEditing` can be `onStartEdit`.

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
          message={message} // Pass current message
          type={type}
          location={location}
          action={action}
        />
      )}

      <MessageActionsBar
        isUser={isUser}
        isLatestUserMessage={isLatestUserMessage}
        messageType={type}
        isEditing={isEditing}
        isCopied={isCopied}
        onCopy={handleCopy}
        onStartEdit={handleEditButtonClick} // Pass the wrapper or directly `startEdit`
        onConfirmEdit={handleConfirmEditClick} // Pass the wrapper or directly `confirmEdit`
        onCancelEdit={handleCancelEditClick} // Pass the wrapper or directly `cancelEdit`
      />

      {shouldShowThoughtProcess && (
        <div className='mt-2 border-t border-black/10 pt-1.5 sm:mt-3 sm:pt-2 dark:border-white/20'>
          <ThoughtProcess thoughts={thoughts} />
        </div>
      )}
    </div>
  );
};

export default ChatMessageDisplay;