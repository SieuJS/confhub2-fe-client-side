// src/hooks/chatbot/useChatInteractions.ts
import { useState, useCallback } from 'react';
import { useMessageActions, useSocketConnectionStatus } from '@/src/app/[locale]/chatbot/stores/storeHooks'; // Điều chỉnh path nếu cần

interface UseChatInteractionsProps {
  onChatStart?: () => void;
  startTimer?: () => void;
}

export function useChatInteractions({ onChatStart, startTimer }: UseChatInteractionsProps = {}) {
  const { sendMessage, submitEditedMessage } = useMessageActions();
  const { isConnected } = useSocketConnectionStatus();
  const [fillInputFunction, setFillInputFunction] = useState<((text: string) => void) | null>(null);

  const handleSendNewMessage = useCallback(
    async (userMessage: string) => {
      const trimmedMessage = userMessage.trim();
      if (!trimmedMessage) return;
      if (!isConnected) {
        console.warn('[useChatInteractions] Attempted to send message while disconnected.');
        // Cân nhắc hiển thị toast ở đây nếu muốn thông báo cho người dùng
        return;
      }
      onChatStart?.(); // Gọi callback nếu chat chưa bắt đầu
      startTimer?.();  // Gọi callback để bắt đầu timer
      sendMessage(trimmedMessage); // Gửi tin nhắn
    },
    [isConnected, sendMessage, onChatStart, startTimer]
  );

  const handleConfirmEdit = useCallback(
    (messageId: string, newText: string) => {
      if (!isConnected) {
        console.warn('[useChatInteractions] Attempted to submit edited message while disconnected.');
        // Cân nhắc hiển thị toast
        return;
      }
      console.log(`[useChatInteractions] Confirming edit for message ${messageId}. New text: "${newText}"`);
      submitEditedMessage(messageId, newText); // Gửi tin nhắn đã chỉnh sửa
    },
    [submitEditedMessage, isConnected]
  );

  const handleSetFillInput = useCallback((fillFunc: (text: string) => void) => {
    setFillInputFunction(() => fillFunc); // Lưu hàm để điền vào input
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (fillInputFunction) {
        fillInputFunction(suggestion); // Sử dụng hàm đã lưu để điền suggestion
      } else {
        console.warn('[useChatInteractions] fillInputFunction is not set. Cannot fill suggestion.');
        // Fallback: Có thể gửi trực tiếp nếu không có fillInputFunction
        // handleSendNewMessage(suggestion); // Nếu muốn behavior này
      }
    },
    [fillInputFunction] // Thêm handleSendNewMessage vào deps nếu có fallback
  );

  return {
    handleSendNewMessage,
    handleConfirmEdit,
    handleSetFillInput,
    handleSuggestionClick,
  };
}