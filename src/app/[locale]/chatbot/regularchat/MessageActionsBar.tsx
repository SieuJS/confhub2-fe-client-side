// src/app/[locale]/chatbot/regularchat/MessageActionsBar.tsx
import React from 'react';
// <<< MODIFIED: Thêm ThumbsUp, ThumbsDown
import { Copy, Pencil, Check, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { MessageType } from '../lib/regular-chat.types';

interface MessageActionsBarProps {
  isUser: boolean;
  isLatestUserMessage: boolean;
  messageType: MessageType;
  isEditing: boolean;
  isCopied: boolean;
  onCopy: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onStartEdit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onConfirmEdit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onCancelEdit: (event: React.MouseEvent<HTMLButtonElement>) => void;
  canEditText?: boolean;
  // <<< NEW PROPS
  onFeedback: (type: 'like' | 'dislike') => void;
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
  canEditText = true,
  // <<< NEW PROP
  onFeedback,
}) => {
  const showCopyButton = !isEditing && (isUser || (messageType !== 'map' && messageType !== 'follow_update'));
  const showEditButton = isUser && isLatestUserMessage && !isEditing && canEditText;
  const showConfirmCancelButtons = isUser && isEditing;
  // <<< NEW: Điều kiện hiển thị nút feedback (chỉ cho bot và không đang chỉnh sửa)
  const showFeedbackButtons = !isUser && !isEditing;

  // <<< MODIFIED: Điều kiện kiểm tra để không render gì cả
  if (!showCopyButton && !showEditButton && !showConfirmCancelButtons && !showFeedbackButtons) {
    return null; // No actions to show
  }

  return (
    <div
      className={`
        absolute -bottom-2 flex items-center space-x-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100
        ${isUser ? '-right-2' : '-left-2'}
        ${isEditing ? 'opacity-100' : ''}
      `}
    >
      {/* ... (Các nút copy, edit, confirm, cancel giữ nguyên) ... */}
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

      {showEditButton && (
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

      {/* <<< NEW: Feedback Buttons >>> */}
      {showFeedbackButtons && (
        <>
          <button
            onClick={() => onFeedback('like')}
            className="rounded-full border border-gray-300 bg-white p-1.5 text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-green-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-green-400"
            aria-label="Like this response"
            title="Like"
          >
            <ThumbsUp size={14} />
          </button>
          <button
            onClick={() => onFeedback('dislike')}
            className="rounded-full border border-gray-300 bg-white p-1.5 text-gray-500 shadow-sm transition-colors hover:bg-gray-100 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-red-400"
            aria-label="Dislike this response"
            title="Dislike"
          >
            <ThumbsDown size={14} />
          </button>
        </>
      )}
    </div>
  );
};

export default MessageActionsBar;