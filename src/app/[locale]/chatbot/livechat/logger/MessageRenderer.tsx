// src/app/[locale]/chatbot/livechat/logger/MessageRenderer.tsx
import React, { ReactNode } from "react";
import {
  StreamingLog,
  isClientContentMessage,
  isServerContentMessage,
  isInterrupted,
  isTurnComplete,
  isModelTurn,
  isClientAudioMessage,
  isServerAudioMessage,
  ClientAudioMessage,
  ServerAudioMessage,
  ServerContentPayload,
  TranscriptionPayload,
  SDKMessageUnion,
  ToolResponsePayload, // <-- THÊM IMPORT NÀY
} from "../../lib/live-chat.types";
import { Content, LiveServerMessage as SDKLiveServerMessage } from "@google/genai";
import ClientContentLog from "./ClientContentLog";
import ModelTurnLog from "./ModelTurnLog";
import PlainTextMessage from "./PlainTextMessage";
import ClientAudioLog from "./ClientAudioLog";
import ServerAudioLog from "./ServerAudioLog";
import AnyMessage from "./AnyMessage";
import InputTranscriptionLog from "./InputTranscriptionLog";
import OutputTranscriptionLog from "./OutputTranscriptionLog";
import ToolResponseLog from "./ToolResponseLog"; // <-- THÊM IMPORT NÀY

const CustomPlainTextLog = ({ msg }: { msg: string }): ReactNode => {
  return <PlainTextMessage message={msg} />;
};

interface MessageRendererProps {
  logEntry: StreamingLog;
}

type ModelTurnLogMessagePropType = SDKLiveServerMessage & {
  serverContent: ServerContentPayload & {
    modelTurn: Content;
  };
};

const isSDKMessage = (msg: any): msg is SDKMessageUnion => {
  return (
    typeof msg === 'object' &&
    msg !== null &&
    ('setup' in msg || 'clientContent' in msg || 'realtimeInput' in msg || 'toolResponse' in msg ||
      'setupComplete' in msg || 'serverContent' in msg || 'toolCall' in msg || 'toolCallCancellation' in msg || 'usageMetadata' in msg)
  );
};

// Helper type guard cho ToolResponsePayload
const isToolResponsePayload = (payload: any): payload is ToolResponsePayload => {
  return payload && typeof payload === 'object' &&
    'functionResponses' in payload && Array.isArray(payload.functionResponses);
};

const MessageRenderer = ({ logEntry }: MessageRendererProps) => {
  const { message, type } = logEntry;

  // ƯU TIÊN XỬ LÝ TOOL RESPONSE LOG
  if (type === "client.toolResponseSent" && isToolResponsePayload(message)) {
    return <ToolResponseLog message={message} />;
  }

  // // 1. Xử lý các kiểu không phải SDKMessageUnion trước (ngoại trừ ToolResponsePayload đã xử lý ở trên)
  // if (typeof message === 'string') {
  //   // Nếu logEntry có summary (đã thêm ở bước 1 cho client.toolResponseSent),
  //   // và message không phải là ToolResponsePayload (đã được xử lý),
  //   // bạn có thể muốn hiển thị summary thay vì message object nếu nó lọt xuống đây.
  //   // Tuy nhiên, với type guard ở trên, điều này không nên xảy ra cho client.toolResponseSent.
  //   if (logEntry.summary && typeof logEntry.summary === 'string' && type === "client.toolResponseSent") {
  //       return <PlainTextMessage message={logEntry.summary} />;
  //   }
  //   return <PlainTextMessage message={message} />;
  // }

  if (
    (isClientAudioMessage(message) && type === "send.clientAudio.sessionComplete") ||
    (isClientAudioMessage(message) && type === "send.clientAudio.segmentComplete") || // THÊM TYPE NÀY
    (isClientAudioMessage(message) && type === "send.clientAudio.finalSegment")    // THÊM TYPE NÀY
  ) {
    return <ClientAudioLog message={message as ClientAudioMessage} />;
  }

  if (type === "receive.serverAudioDebounced" && isServerAudioMessage(message)) {
    return <ServerAudioLog message={message as ServerAudioMessage} />;
  }

  if (
    (type === "transcription.inputEvent.final" || type === "transcription.outputEvent.final") &&
    typeof message === 'object' && message !== null && 'text' in message && (message as TranscriptionPayload).finished === true
  ) {
    const transcription = message as TranscriptionPayload;
    if (type === "transcription.inputEvent.final") {
      return <InputTranscriptionLog transcription={transcription} />;
    }
    if (type === "transcription.outputEvent.final") {
      return <OutputTranscriptionLog transcription={transcription} />;
    }
  }

  // 2. Xử lý SDKMessageUnion
  if (isSDKMessage(message)) {
    if (isClientContentMessage(message)) {
      return <ClientContentLog message={message.clientContent} />;
    }

    if (isSDKMessage(message)) {
      if (isServerContentMessage(message)) {
        const serverContent = message.serverContent;
        if (isInterrupted(serverContent)) {
          return <CustomPlainTextLog msg="[Model Interrupted]" />;
        }
        if (isModelTurn(serverContent)) { // This will now be true for your emitted log
          // The `message` prop passed to ModelTurnLog should be `logEntry.message` itself
          // as it now has the correct structure: { serverContent: { modelTurn: ... } }
          return <ModelTurnLog message={message as ModelTurnLogMessagePropType} />;
        }
      }
    }
  }

  // Fallback:
  if (
    type.includes("transcription.inputEvent.partial") ||
    type.includes("transcription.outputEvent.partial") ||
    type === "receive.serverAudio"
  ) {
    return null;
  }

  // // Nếu có summary, hiển thị nó cho các log chưa được xử lý thay vì object message
  // if (logEntry.summary && typeof logEntry.summary === 'string') {
  //   console.warn("[MessageRenderer] Rendering summary for unhandled/debug log type:", type, "Summary:", logEntry.summary);
  //   return <PlainTextMessage message={logEntry.summary} />;
  // }

  console.warn("[MessageRenderer] Rendering with AnyMessage for unhandled/debug log type:", type, "Message:", message);
  return <AnyMessage message={message as any} />;
};

export default MessageRenderer;