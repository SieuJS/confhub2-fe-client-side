// src/hooks/regularchat/useChatInteractions.ts
import { useState, useCallback } from 'react';
import {
  useMessageActions,
  useSocketConnectionStatus,
} from '@/src/app/[locale]/chatbot/stores/storeHooks';
import { useMessageStore } from '@/src/app/[locale]/chatbot/stores/messageStore';
import { GoogleGenAI, Part } from "@google/genai"; // Using @google/generative-ai as per your import

interface UseChatInteractionsProps {
  onChatStart?: () => void;
  startTimer?: () => void;
}

let genAI: GoogleGenAI | null = null;
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
if (GEMINI_API_KEY) {
   genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY});
} else {
  console.error("Gemini API Key is missing. File uploads will not work.");
}

async function fileToGenerativePart(file: File): Promise<Part> {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}

export function useChatInteractions({ onChatStart, startTimer }: UseChatInteractionsProps = {}) {
  const { sendMessage, submitEditedMessage } = useMessageActions(); // sendMessage now expects Part[]
  const { setLoadingState } = useMessageStore.getState();
  const { isConnected } = useSocketConnectionStatus();
  const [fillInputFunction, setFillInputFunction] = useState<((text: string) => void) | null>(null);

  const handleSendNewFilesAndMessage = useCallback(
    async (userMessage: string, files: File[]) => {
      const trimmedMessage = userMessage.trim();
      if (!trimmedMessage && files.length === 0) return;
      if (!isConnected) {
        console.warn('[useChatInteractions] Attempted to send message while disconnected.');
        return;
      }

      onChatStart?.();
      startTimer?.();
      setLoadingState({ isLoading: true, step: 'preparing_message', message: 'Preparing message...' });

      const messageParts: Part[] = [];

      if (trimmedMessage) {
        messageParts.push({ text: trimmedMessage });
      }

      // Prepare file info for optimistic UI update in messageStore
      const userFilesForDisplay = files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        // dataUrl: can be generated here if needed for immediate preview, but often handled by browser's object URL
      }));


      if (files.length > 0) {
        if (!genAI) {
          console.error("Gemini AI SDK not initialized. Cannot upload files.");
          setLoadingState({ isLoading: false, step: 'error', message: 'File upload service not available.' });
          return;
        }
        setLoadingState({ isLoading: true, step: 'uploading_files', message: `Uploading ${files.length} file(s)...` });
        try {
          for (const file of files) {
            if (file.size > 4 * 1024 * 1024) {
                console.warn(`File ${file.name} is too large for inline data, skipping. Consider File API.`);
                // Remove from userFilesForDisplay if skipped
                const indexToRemove = userFilesForDisplay.findIndex(f => f.name === file.name);
                if (indexToRemove > -1) userFilesForDisplay.splice(indexToRemove, 1);
                continue;
            }
            const filePart = await fileToGenerativePart(file);
            messageParts.push(filePart);
          }
          setLoadingState({ isLoading: true, step: 'processing_files', message: 'Processing files with message...' });
        } catch (error) {
          console.error("Error uploading files or preparing parts:", error);
          setLoadingState({ isLoading: false, step: 'error', message: 'Failed to upload files.' });
          return;
        }
      }

      if (messageParts.length === 0) {
        console.warn("No message content (text or files) to send.");
        setLoadingState({ isLoading: false, step: 'idle', message: '' });
        return;
      }
      
      console.log("[useChatInteractions] Sending message parts:", messageParts);
      // Pass messageParts directly, and also userFilesForDisplay for the store
      sendMessage(messageParts, userFilesForDisplay); // <<< CORRECTED: Pass Part[] and file info

    },
    [isConnected, sendMessage, onChatStart, startTimer, setLoadingState] // Added sendMessage to dependency array
  );

  const handleConfirmEdit = useCallback(
    (messageId: string, newText: string) => {
      if (!isConnected) {
        console.warn('[useChatInteractions] Attempted to submit edited message while disconnected.');
        return;
      }
      startTimer?.();
      submitEditedMessage(messageId, newText);
    },
    [submitEditedMessage, isConnected, startTimer] // Added submitEditedMessage and startTimer
  );

  const handleSetFillInput = useCallback((fillFunc: (text: string) => void) => {
    setFillInputFunction(() => fillFunc);
  }, []);

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      if (fillInputFunction) {
        fillInputFunction(suggestion);
      } else {
         handleSendNewFilesAndMessage(suggestion, []);
      }
    },
    [fillInputFunction, handleSendNewFilesAndMessage] // Added handleSendNewFilesAndMessage
  );

  return {
    handleSendNewFilesAndMessage,
    handleConfirmEdit,
    handleSetFillInput,
    handleSuggestionClick,
  };
}