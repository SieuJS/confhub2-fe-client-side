// src/app/[locale]/chatbot/livechat/hooks/useMessageSendingManager.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  StreamingLog,
  isServerContentMessage,
  isModelTurn,
  isTurnComplete,
  isInterrupted,
  isServerAudioMessage,
  ServerContent,
  ModelTurn
} from '../multimodal-live-types';
// We don't need to import Part from @google/generative-ai directly here
// as its structure is implicitly handled by the type guards on serverContent.modelTurn.parts

interface UseMessageSendingManagerProps {
  logs: StreamingLog[];
}

export function useMessageSendingManager({ logs }: UseMessageSendingManagerProps) {
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const lastSentLogIndexRef = useRef<number | null>(null);

  const startSending = useCallback((sentLogIndex: number) => {
    console.log(`[useMessageSendingManager] startSending called. Index: ${sentLogIndex}`);
    setIsSendingMessage(true);
    lastSentLogIndexRef.current = sentLogIndex;
  }, []);

  const stopSending = useCallback((reason?: string) => {
    console.log(`[useMessageSendingManager] stopSending called. Reason: ${reason || 'direct error or manual stop'}`);
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
      if (!currentLog?.message) continue;

      let shouldStopLoading = false;
      let serverContentFromLog: ServerContent | undefined = undefined;

      if (isServerContentMessage(currentLog.message)) {
        serverContentFromLog = currentLog.message.serverContent;

        if (isModelTurn(serverContentFromLog)) {
          const modelTurnData = serverContentFromLog.modelTurn;
          // Check if any part has 'text' or 'functionCall'
          // Your 'Part' type is a union, so 'part.text' or 'part.functionCall' will exist
          // on the respective members of that union.
          if (modelTurnData?.parts?.some(part => {
            // Type casting or type guards might be needed if TypeScript can't infer narrow enough
            // For now, direct property access often works with union types if properties are distinct.
            return (part as any).text || (part as any).functionCall;
          })) {
             console.log(`[useMessageSendingManager] Model turn content (text or functionCall) received. Continuing loading. Parts:`, modelTurnData.parts);
             // Don't stop loading yet, wait for TurnComplete or Interrupted
          } else if (modelTurnData?.parts?.length > 0) {
            console.log(`[useMessageSendingManager] Model turn received with parts, but no immediate text/functionCall. Parts:`, modelTurnData.parts);
          }
        } else if (isTurnComplete(serverContentFromLog)) {
          console.log(`[useMessageSendingManager] TurnComplete received. Stopping loading.`);
          shouldStopLoading = true;
        } else if (isInterrupted(serverContentFromLog)) {
          console.log(`[useMessageSendingManager] Interrupted received. Stopping loading.`);
          shouldStopLoading = true;
        }
      } else if (isServerAudioMessage(currentLog.message)) {
        console.log(`[useMessageSendingManager] ServerAudio received. Stopping loading.`);
        shouldStopLoading = true;
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