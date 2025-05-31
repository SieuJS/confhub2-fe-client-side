// src/hooks/chatbot/useMessageEditing.ts
import { useState, useEffect, useRef } from 'react';
import { useMessageStore } from '@/src/app/[locale]/chatbot/stores/messageStore/messageStore'; // << IMPORT STORE

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
  const [isEditingThisInstance, setIsEditingThisInstance] = useState(false); // State cục bộ cho instance này
  const [editedText, setEditedText] = useState(initialMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Lấy action từ store
  const setGlobalEditingMessageId = useMessageStore(state => state.setEditingMessageId);
  const globalEditingMessageId = useMessageStore(state => state.editingMessageId);

  // Đồng bộ isEditingThisInstance với globalEditingMessageId
  // Nếu globalEditingMessageId là ID của message này, thì instance này đang edit.
  // Nếu globalEditingMessageId là khác hoặc null, instance này không edit.
  useEffect(() => {
    setIsEditingThisInstance(globalEditingMessageId === messageId);
  }, [globalEditingMessageId, messageId]);


  useEffect(() => {
    if (!isEditingThisInstance) {
      setEditedText(initialMessage);
    }
  }, [initialMessage, isEditingThisInstance]);

  useEffect(() => {
    if (isEditingThisInstance && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditingThisInstance]);

  const startEdit = () => {
    if (isUser && isLatestUserMessage) {
      // Chỉ cho phép edit nếu không có message nào khác đang được edit
      // hoặc message đang được edit chính là message này (trường hợp click lại nút edit)
      if (globalEditingMessageId === null || globalEditingMessageId === messageId) {
        setEditedText(initialMessage);
        setGlobalEditingMessageId(messageId); // Thông báo cho store là message này đang được edit
        // setIsEditingThisInstance(true); // Sẽ được cập nhật bởi useEffect ở trên
      } else {
        console.warn(`Cannot edit message ${messageId} because message ${globalEditingMessageId} is already being edited.`);
        // Có thể hiển thị toast cho người dùng
      }
    }
  };

  const confirmEdit = () => {
    const trimmedText = editedText.trim();
    if (trimmedText && trimmedText !== initialMessage) {
      onConfirmEdit(messageId, trimmedText);
    }
    setGlobalEditingMessageId(null); // Thông báo cho store là không có message nào đang được edit nữa
    // setIsEditingThisInstance(false); // Sẽ được cập nhật bởi useEffect ở trên
  };

  const cancelEdit = () => {
    setGlobalEditingMessageId(null); // Thông báo cho store là không có message nào đang được edit nữa
    setEditedText(initialMessage);
    // setIsEditingThisInstance(false); // Sẽ được cập nhật bởi useEffect ở trên
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
    isEditing: isEditingThisInstance, // Trả về state cục bộ đã được đồng bộ
    editedText,
    textareaRef,
    startEdit,
    confirmEdit,
    cancelEdit,
    handleInputChange,
    handleKeyDown,
  };
}