// src/app/[locale]/chatbot/livechat/logger/LogFilters.tsx
import {
  StreamingLog,
  isClientContentMessage,
  isToolCallMessage,
  isToolCallCancellationMessage,
  isToolResponseMessage,
  isServerContentMessage,
  isClientAudioMessage,
  isServerAudioMessage
} from "../../lib/live-chat.types"; // Ensure this path is correct

export type LoggerFilterType = "conversations" | "tools" | "none";

export const filters: Record<LoggerFilterType, (log: StreamingLog) => boolean> = {
  tools: (log: StreamingLog) => {
    // log.message is string | SDKLiveClientMessage | SDKLiveServerMessage | ClientAudioMessage | ServerAudioMessage
    if (typeof log.message === 'string' || isClientAudioMessage(log.message) || isServerAudioMessage(log.message)) {
        return false;
    }
    // At this point, log.message is SDKLiveClientMessage | SDKLiveServerMessage (or SDKMessageUnion)
    return isToolCallMessage(log.message) ||         // Expects SDKMessageUnion, returns true if it's a ServerMessage with toolCall
           isToolResponseMessage(log.message) ||      // Expects SDKMessageUnion, returns true if it's a ClientMessage with toolResponse
           isToolCallCancellationMessage(log.message); // Expects SDKMessageUnion, returns true if it's a ServerMessage with toolCallCancellation
  },
  conversations: (log: StreamingLog) => {
    if (typeof log.message === 'string' || isClientAudioMessage(log.message) || isServerAudioMessage(log.message)) {
        return false;
    }
    // At this point, log.message is SDKLiveClientMessage | SDKLiveServerMessage
    return isClientContentMessage(log.message) ||   // Expects SDKMessageUnion, returns true if it's a ClientMessage with clientContent
           isServerContentMessage(log.message) ||   // Expects SDKMessageUnion, returns true if it's a ServerMessage with serverContent
           isClientAudioMessage(log.message) ||     // This check is redundant here due to the above if, but harmless
           isServerAudioMessage(log.message);      // This check is redundant here due to the above if, but harmless
  },
  none: () => true,
};