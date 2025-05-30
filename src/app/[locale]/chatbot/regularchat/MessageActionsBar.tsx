// src/app/[locale]/chatbot/regularchat/MessageActionsBar.tsx
import React from 'react';
import { Copy, Pencil, Check, X } from 'lucide-react';
import { MessageType } from '../lib/regular-chat.types';

interface MessageActionsBarProps {
  isUser: boolean;
  isLatestUserMessage: boolean;
  messageType: MessageType;
  isEditing: boolean;
  isCopied: boolean;
  onCopy: (event: React.MouseEvent<HTMLButtonElement>) => void; // Corrected event type
  onStartEdit: (event: React.MouseEvent<HTMLButtonElement>) => void; // Corrected event type
  onConfirmEdit: (event: React.MouseEvent<HTMLButtonElement>) => void; // Corrected event type
  onCancelEdit: (event: React.MouseEvent<HTMLButtonElement>) => void; // Corrected event type
  canEditText?: boolean; // <<< ADD THIS PROP (make it optional if it's not always provided)
}

const MessageActionsBar: React.FC<MessageActionsBarProps> = ({
  isUser,
  isLatestUserMessage,
  messageType,
  isEditing,
  isCopied,
  onCopy,
  onStartEdit,
  onConfirmEdit,
  onCancelEdit,
  canEditText = true, // <<< PROVIDE A DEFAULT VALUE or handle undefined
}) => {
  const showCopyButton = !isEditing && (isUser || (messageType !== 'map' && messageType !== 'follow_update'));
  // Use canEditText to determine if the edit button should be shown
  const showEditButton = isUser && isLatestUserMessage && !isEditing && canEditText;
  const showConfirmCancelButtons = isUser && isEditing; // This implies editing is possible

  if (!showCopyButton && !showEditButton && !showConfirmCancelButtons) {
    return null; // No actions to show
  }

  return (
    <div
      className={`
        absolute -bottom-2 flex space-x-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100
        ${isUser ? '-right-2' : '-left-2'}
        ${isEditing ? 'opacity-100' : ''}
      `}
    >
      {showCopyButton && (
        <button
          onClick={onCopy}
          className={`rounded-full border border-gray-300 bg-white p-1.5 text-gray-500 shadow-sm transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200 ${isCopied ? 'text-green-500 dark:text-green-400' : ''}`}
          aria-label={isCopied ? 'Copied' : 'Copy message'}
          title={isCopied ? 'Copied!' : 'Copy message'}
          disabled={isCopied}
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      )}

      {showEditButton && ( // This button's visibility is now controlled by canEditText
        <button
          onClick={onStartEdit}
          className="rounded-full border border-gray-300 bg-white p-1.5 text-gray-500 shadow-sm hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
          aria-label="Edit message"
          title="Edit message"
        >
          <Pencil size={14} />
        </button>
      )}

      {showConfirmCancelButtons && (
        <>
          <button
            onClick={onConfirmEdit}
            className="rounded-full border border-green-500 bg-green-500 p-1.5 text-white shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 dark:border-green-600 dark:bg-green-600 dark:hover:bg-green-700"
            aria-label="Confirm edit"
            title="Confirm edit"
          >
            <Check size={14} />
          </button>
          <button
            onClick={onCancelEdit}
            className="rounded-full border border-gray-300 bg-white p-1.5 text-gray-500 shadow-sm hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200"
            aria-label="Cancel edit"
            title="Cancel edit"
          >
            <X size={14} />
          </button>
        </>
      )}
    </div>
  );
};

export default MessageActionsBar;