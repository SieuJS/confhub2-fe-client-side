// src/hooks/regularchat/useChatInteractions.ts
import { useState, useCallback } from 'react';
import {
  useMessageActions, // Giả sử hook này trả về sendMessage đã được cập nhật
  useSocketConnectionStatus,
} from '@/src/app/[locale]/chatbot/stores/storeHooks';
import { useMessageStore } from '@/src/app/[locale]/chatbot/stores/messageStore/messageStore';
import { Part } from "@google/genai";
import { OriginalUserFileInfo } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // <<< IMPORT TYPE MỚI

interface UseChatInteractionsProps {
  onChatStart?: () => void;
  startTimer?: () => void;
}

// Interface này định nghĩa cấu trúc file mà backend trả về sau khi upload lên Google
interface BackendUploadedFile {
  name: string;       // Tên file gốc từ client (file.originalname)
  uri: string;        // URI từ Google File API
  mimeType: string;   // MimeType (ưu tiên từ Google, fallback từ client)
  size: number;       // Kích thước file gốc từ client (file.size)
}

export function useChatInteractions({ onChatStart, startTimer }: UseChatInteractionsProps = {}) {
  // sendMessage từ useMessageActions giờ đã được cập nhật để nhận originalUserFilesInfo
  const { sendMessage, submitEditedMessage } = useMessageActions();
  const { setLoadingState } = useMessageStore.getState(); // Lấy trực tiếp từ store
  const { isConnected } = useSocketConnectionStatus();
  const [fillInputFunction, setFillInputFunction] = useState<((text: string) => void) | null>(null);

  const handleSendNewFilesAndMessage = useCallback(
    async (userMessage: string, filesFromInput: File[]) => {
      const trimmedMessage = userMessage.trim();
      if (!trimmedMessage && filesFromInput.length === 0) return;

      if (!isConnected) {
        console.warn('[useChatInteractions] Attempted to send message while disconnected.');
        setLoadingState({ isLoading: false, step: 'error', message: 'Cannot send: Not connected.' });
        return;
      }

      onChatStart?.();
      startTimer?.();
      setLoadingState({ isLoading: true, step: 'preparing_message', message: 'Preparing message...' });

      const messagePartsToSend: Part[] = [];
      const userFilesForDisplayOptimistic = filesFromInput.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: URL.createObjectURL(file),
      }));

      // Mảng để lưu thông tin file gốc sẽ được gửi đến backend
      let originalUserFilesInfoForBackend: OriginalUserFileInfo[] = [];

      if (filesFromInput.length > 0) {
        setLoadingState({ isLoading: true, step: 'uploading_files', message: `Uploading ${filesFromInput.length} file(s)...` });
        const formData = new FormData();
        filesFromInput.forEach(file => {
          formData.append('files', file);
        });

        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
          const uploadResponse = await fetch(`${backendUrl}/api/v1/chatbot/upload-files`, {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json().catch(() => ({ message: 'Failed to upload files. Server error.' }));
            console.error("Error uploading files to backend:", uploadResponse.status, errorData);
            setLoadingState({ isLoading: false, step: 'error', message: errorData.message || `Failed to upload files (status: ${uploadResponse.status})` });
            // Nếu upload lỗi, giải phóng các Object URL đã tạo
            userFilesForDisplayOptimistic.forEach(f => { if (f.dataUrl) URL.revokeObjectURL(f.dataUrl); });
            return;
          }

          // responseData.files là BackendUploadedFile[]
          const responseData: { files: BackendUploadedFile[] } = await uploadResponse.json();
          
          if (!responseData.files) { // Kiểm tra cả trường hợp responseData.files là undefined
            console.error("Backend returned no file data or malformed response after upload.");
            setLoadingState({ isLoading: false, step: 'error', message: 'File upload processing failed on server (no file data).' });
            userFilesForDisplayOptimistic.forEach(f => { if (f.dataUrl) URL.revokeObjectURL(f.dataUrl); });
            return;
          }
          if (responseData.files.length === 0 && filesFromInput.length > 0) {
             console.warn("Backend processed uploads but returned an empty list of files. All uploads might have failed server-side.");
             // Không set lỗi ở đây ngay, để cho logic kiểm tra messagePartsToSend.length === 0 xử lý
          }


          responseData.files.forEach(uploadedFile => {
            if (uploadedFile.uri) {
              messagePartsToSend.push({
                fileData: {
                  mimeType: uploadedFile.mimeType,
                  fileUri: uploadedFile.uri,
                }
              });
              // Thêm vào mảng thông tin file gốc để gửi cho backend
              originalUserFilesInfoForBackend.push({
                name: uploadedFile.name, // Tên gốc
                size: uploadedFile.size,   // Size gốc
                type: uploadedFile.mimeType, // MimeType (có thể lấy từ uploadedFile.type nếu backend trả về type gốc)
                googleFileUri: uploadedFile.uri, // URI từ Google để map ở backend nếu cần
              });
            } else {
              const indexToRemove = userFilesForDisplayOptimistic.findIndex(f => f.name === uploadedFile.name);
              if (indexToRemove > -1) {
                if (userFilesForDisplayOptimistic[indexToRemove].dataUrl) {
                    URL.revokeObjectURL(userFilesForDisplayOptimistic[indexToRemove].dataUrl!);
                }
                userFilesForDisplayOptimistic.splice(indexToRemove, 1);
              }
              console.warn(`File ${uploadedFile.name} processed by backend but no URI returned. Skipping this file.`);
            }
          });
          setLoadingState({ isLoading: true, step: 'processing_files', message: 'Processing files with message...' });

        } catch (error) {
          console.error("Error calling backend file upload API:", error);
          const errorMessage = error instanceof Error ? error.message : 'Network error or failed to reach upload server.';
          setLoadingState({ isLoading: false, step: 'error', message: `Upload error: ${errorMessage}` });
          userFilesForDisplayOptimistic.forEach(f => { if (f.dataUrl) URL.revokeObjectURL(f.dataUrl); });
          return;
        }
      }

      if (trimmedMessage) {
        messagePartsToSend.push({ text: trimmedMessage });
      }

      if (messagePartsToSend.length === 0) {
        console.warn("No message content (text or successfully uploaded files) to send.");
        setLoadingState({ isLoading: false, step: 'idle', message: '' });
        // Giải phóng Object URLs nếu không có gì để gửi và có file đã được tạo preview
        if (userFilesForDisplayOptimistic.length > 0 && filesFromInput.length > 0) {
             userFilesForDisplayOptimistic.forEach(f => { if (f.dataUrl) URL.revokeObjectURL(f.dataUrl); });
        }
        return;
      }
      
      // Gọi sendMessage với cả messagePartsToSend và originalUserFilesInfoForBackend
      sendMessage(
        messagePartsToSend,
        userFilesForDisplayOptimistic,
        originalUserFilesInfoForBackend.length > 0 ? originalUserFilesInfoForBackend : undefined
      );

      // Không revoke Object URLs ở đây nữa, vì userFilesForDisplayOptimistic đã được truyền cho messageStore
      // và có thể đang được dùng để render. Việc revoke cần được quản lý cẩn thận hơn,
      // ví dụ: khi tin nhắn bị xóa, hoặc khi component chứa ảnh unmount.

    },
    [isConnected, sendMessage, onChatStart, startTimer, setLoadingState]
  );

  const handleConfirmEdit = useCallback(
    (messageId: string, newText: string) => {
      if (!isConnected) {
        console.warn('[useChatInteractions] Attempted to submit edited message while disconnected.');
        setLoadingState({ isLoading: false, step: 'error', message: 'Cannot edit: Not connected.' });
        return;
      }
      startTimer?.();
      submitEditedMessage(messageId, newText);
    },
    [submitEditedMessage, isConnected, startTimer, setLoadingState]
  );

  const handleSetFillInput = useCallback((fillFunc: (text: string) => void) => {
    setFillInputFunction(() => fillFunc);
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (fillInputFunction) {
        fillInputFunction(suggestion);
      } else {
        // Khi click suggestion, không có file nào được đính kèm
        handleSendNewFilesAndMessage(suggestion, []);
      }
    },
    [fillInputFunction, handleSendNewFilesAndMessage]
  );

  return {
    handleSendNewFilesAndMessage,
    handleConfirmEdit,
    handleSetFillInput,
    handleSuggestionClick,
  };
}