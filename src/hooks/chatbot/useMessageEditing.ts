// src/hooks/chatbot/useMessageEditing.ts
import { useState, useEffect, useRef } from 'react';

interface UseMessageEditingProps {
  messageId: string;
  initialMessage: string;
  isUser: boolean;
  isLatestUserMessage: boolean;
  onConfirmEdit: (messageId: string, newText: string) => void;
}

export function useMessageEditing({
  messageId,
  initialMessage,
  isUser,
  isLatestUserMessage,
  onConfirmEdit,
}: UseMessageEditingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(initialMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setEditedText(initialMessage);
    }
  }, [initialMessage, isEditing]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const startEdit = () => {
    if (isUser && isLatestUserMessage) {
      setEditedText(initialMessage); // Reset khi bắt đầu edit
      setIsEditing(true);
    }
  };

  const confirmEdit = () => {
    const trimmedText = editedText.trim();
    if (trimmedText && trimmedText !== initialMessage) {
      onConfirmEdit(messageId, trimmedText);
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedText(initialMessage); // Reset text về ban đầu
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      confirmEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  return {
    isEditing,
    editedText,
    textareaRef,
    startEdit,
    confirmEdit,
    cancelEdit,
    handleInputChange,
    handleKeyDown,
  };
}