// src/app/[locale]/chatbot/livechat/hooks/useMessageSendingManager.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  StreamingLog,
  isServerContentMessage,
  isModelTurn,
  isTurnComplete,
  isInterrupted,
  isServerAudioMessage,
  ServerContentPayload,
  // Import the actual SDK message types if needed for more specific checks
} from '../../lib/live-chat.types';
import { LiveServerMessage as SDKLiveServerMessage } from '@google/genai';

interface UseMessageSendingManagerProps {
  logs: StreamingLog[];
}

export function useMessageSendingManager({ logs }: UseMessageSendingManagerProps) {
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const lastSentLogIndexRef = useRef<number | null>(null);

  const startSending = useCallback((sentLogIndex: number) => {
    // console.log(`[useMessageSendingManager] startSending called. Index: ${sentLogIndex}`);
    setIsSendingMessage(true);
    lastSentLogIndexRef.current = sentLogIndex;
  }, []);

  const stopSending = useCallback((reason?: string) => {
    // console.log(`[useMessageSendingManager] stopSending called. Reason: ${reason || 'direct error or manual stop'}`);
    setIsSendingMessage(false);
    lastSentLogIndexRef.current = null;
  }, []);

   useEffect(() => {
    if (!isSendingMessage || lastSentLogIndexRef.current === null) {
      return;
    }

    const startIndexToCheck = lastSentLogIndexRef.current + 1;
    for (let i = startIndexToCheck; i < logs.length; i++) {
      const currentLog = logs[i];
      const message = currentLog?.message;

      if (!message || typeof message === 'string') continue;

      let shouldStopLoading = false;
      let serverContentFromLog: ServerContentPayload | undefined = undefined;

      if (isServerAudioMessage(message)) {
        // console.log(`[useMessageSendingManager] ServerAudio received. Stopping loading.`);
        shouldStopLoading = true;
      }
      else if (
        typeof message === 'object' && message !== null &&
        !('clientAudio' in message) &&
        !('setup' in message) &&
        !('clientContent' in message) &&
        !('realtimeInput' in message) &&
        !('toolResponse' in message)
      ) {
        const potentialServerMessage = message as SDKLiveServerMessage;

        if (isServerContentMessage(potentialServerMessage)) {
          serverContentFromLog = potentialServerMessage.serverContent;

          if (serverContentFromLog && isModelTurn(serverContentFromLog)) {
            const modelTurnData = serverContentFromLog.modelTurn; // modelTurnData is SDK Content

            // Check if modelTurnData and modelTurnData.parts are defined
            if (modelTurnData && modelTurnData.parts) { // <<<< FIX: Check modelTurnData.parts
              if (modelTurnData.parts.some(part => part.text !== undefined || part.functionCall !== undefined)) {
                // console.log(`[useMessageSendingManager] Model turn content (text or functionCall) received. Continuing loading. Parts:`, modelTurnData.parts);
              } else if (modelTurnData.parts.length > 0) { // Now safe to access .length
                // console.log(`[useMessageSendingManager] Model turn received with parts, but no immediate text/functionCall. Parts:`, modelTurnData.parts);
              }
              // else: modelTurnData.parts is an empty array, or all parts are empty/non-text/non-functionCall
            }
            // else: modelTurnData itself might be defined but modelTurnData.parts is undefined.
            // This case means a modelTurn was indicated, but it had no parts array.
            // Depending on requirements, you might log this or handle it.
            // For now, the existing logic doesn't stop loading on just any modelTurn, so this is fine.

          } else if (serverContentFromLog && isTurnComplete(serverContentFromLog)) {
            // console.log(`[useMessageSendingManager] TurnComplete received. Stopping loading.`);
            shouldStopLoading = true;
          } else if (serverContentFromLog && isInterrupted(serverContentFromLog)) {
            // console.log(`[useMessageSendingManager] Interrupted received. Stopping loading.`);
            shouldStopLoading = true;
          }
        }
      }

      if (shouldStopLoading) {
        stopSending('server response indicated end of turn');
        return;
      }
    }
  }, [logs, isSendingMessage, stopSending]);

  return {
    isSendingMessage,
    startSending,
    stopSending,
  };
}