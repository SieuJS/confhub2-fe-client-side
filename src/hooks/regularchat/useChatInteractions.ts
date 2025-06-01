// src/hooks/regularchat/useChatInteractions.ts
import { useState, useCallback } from 'react';
import {
  useMessageActions,
  useSocketConnectionStatus,
} from '@/src/app/[locale]/chatbot/stores/storeHooks';
import { useMessageStore } from '@/src/app/[locale]/chatbot/stores/messageStore/messageStore';
import { usePageContextStore } from '@/src/app/[locale]/chatbot/stores/pageContextStore';
import { Part } from "@google/genai";
import { OriginalUserFileInfo, UserFile } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Thêm UserFile

interface UseChatInteractionsProps {
  onChatStart?: () => void;
  startTimer?: () => void;
}

interface BackendUploadedFile {
  name: string;
  uri: string;
  mimeType: string;
  size: number;
}

export function useChatInteractions({ onChatStart, startTimer }: UseChatInteractionsProps = {}) {
  const { sendMessage, submitEditedMessage } = useMessageActions(); // sendMessage signature sẽ thay đổi
  const { setLoadingState } = useMessageStore.getState();
  const { isConnected } = useSocketConnectionStatus();
  const [fillInputFunction, setFillInputFunction] = useState<((text: string) => void) | null>(null);

  const handleSendNewFilesAndMessage = useCallback(
    async (userMessage: string, filesFromInput: File[], shouldUsePageContext: boolean) => {
      const trimmedMessage = userMessage.trim();

      if (!trimmedMessage && filesFromInput.length === 0 && !shouldUsePageContext) return;

      if (!isConnected) {
        console.warn('[useChatInteractions] Attempted to send message while disconnected.');
        setLoadingState({ isLoading: false, step: 'error', message: 'Cannot send: Not connected.' });
        return;
      }

      onChatStart?.();
      startTimer?.();
      setLoadingState({ isLoading: true, step: 'preparing_message', message: 'Preparing message...' });

      const partsForBackend: Part[] = [];
      const partsForDisplay: Part[] = []; // Parts chỉ chứa query của user
      let pageContextUrlForBackend: string | undefined = undefined; // <<< BIẾN MỚI

      const freshPageContextState = usePageContextStore.getState();
      console.log('[useChatInteractions] Fresh page context state:', freshPageContextState);

      if (shouldUsePageContext && freshPageContextState.isCurrentPageFeatureEnabled && freshPageContextState.currentPageText) {
        const contextText = freshPageContextState.currentPageText.length > 50000
          ? freshPageContextState.currentPageText.substring(0, 50000) + "\n[...content truncated]"
          : freshPageContextState.currentPageText;

        const contextPartForBackend: Part = {
          text: `[START CURRENT PAGE CONTEXT]\n${contextText}\n[END CURRENT PAGE CONTEXT]\n\nUser query:`
        };
        partsForBackend.push(contextPartForBackend);
        if (freshPageContextState.currentPageUrl) {
          pageContextUrlForBackend = freshPageContextState.currentPageUrl;
          console.log('[useChatInteractions] Page context URL for backend:', pageContextUrlForBackend);
        } else {
          console.warn('[useChatInteractions] Page context is being used, but currentPageUrl is null/undefined in store. URL will not be sent.');
        }
      }

      const userFilesForDisplayOptimistic: UserFile[] = filesFromInput.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: URL.createObjectURL(file),
      }));

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
            userFilesForDisplayOptimistic.forEach(f => { if (f.dataUrl) URL.revokeObjectURL(f.dataUrl); });
            return;
          }

          const responseData: { files: BackendUploadedFile[] } = await uploadResponse.json();

          if (!responseData.files) {
            console.error("Backend returned no file data or malformed response after upload.");
            setLoadingState({ isLoading: false, step: 'error', message: 'File upload processing failed on server (no file data).' });
            userFilesForDisplayOptimistic.forEach(f => { if (f.dataUrl) URL.revokeObjectURL(f.dataUrl); });
            return;
          }

          responseData.files.forEach(uploadedFile => {
            if (uploadedFile.uri) {
              const fileDataPart: Part = {
                fileData: {
                  mimeType: uploadedFile.mimeType,
                  fileUri: uploadedFile.uri,
                }
              };
              partsForBackend.push(fileDataPart);
              // partsForDisplay sẽ không chứa fileDataPart trực tiếp,
              // mà thông tin file sẽ được hiển thị qua userFilesForDisplayOptimistic
              // và ChatMessageType.files
              originalUserFilesInfoForBackend.push({
                name: uploadedFile.name,
                size: uploadedFile.size,
                type: uploadedFile.mimeType,
                googleFileUri: uploadedFile.uri,
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

      // Thêm text của user (nếu có) vào CẢ HAI BỘ parts
      if (trimmedMessage) {
        const userTextPart: Part = { text: trimmedMessage };
        partsForBackend.push(userTextPart);
        partsForDisplay.push(userTextPart); // Chỉ query của user cho hiển thị
      }

      // Kiểm tra lại nếu không có gì để gửi cho backend
      if (partsForBackend.length === 0) {
        console.warn("No message content (text, files, or context) to send to backend.");
        setLoadingState({ isLoading: false, step: 'idle', message: '' });
        if (userFilesForDisplayOptimistic.length > 0 && filesFromInput.length > 0) {
          userFilesForDisplayOptimistic.forEach(f => { if (f.dataUrl) URL.revokeObjectURL(f.dataUrl); });
        }
        return;
      }

      console.log('[useChatInteractions] Calling sendMessage with pageContextUrlForBackend:', pageContextUrlForBackend);

      // Cần cập nhật signature của sendMessage trong messageStore và messageActionHandlers
      sendMessage(
        partsForBackend,
        partsForDisplay,
        userFilesForDisplayOptimistic,
        originalUserFilesInfoForBackend.length > 0 ? originalUserFilesInfoForBackend : undefined,
        pageContextUrlForBackend // <<< TRUYỀN URL
      );

    },
    [isConnected, sendMessage, onChatStart, startTimer, setLoadingState]
  );

  // ... (handleConfirmEdit, handleSetFillInput, handleSuggestionClick giữ nguyên) ...
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
        handleSendNewFilesAndMessage(suggestion, [], false);
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