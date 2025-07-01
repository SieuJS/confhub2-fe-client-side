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
    return <ToolResponseLog message={message} />; // <-- SỬ DỤNG COMPONENT MỚI
  }

   if (
    (isClientAudioMessage(message) && type === "send.clientAudio.sessionComplete") ||
    (isClientAudioMessage(message) && type === "send.clientAudio.segmentComplete") ||
    (isClientAudioMessage(message) && type === "send.clientAudio.finalSegment")
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

  if (isSDKMessage(message)) {
    if (isClientContentMessage(message)) {
      return <ClientContentLog message={message.clientContent} />;
    }

    // Bỏ if (isSDKMessage(message)) lồng nhau không cần thiết
    if (isServerContentMessage(message)) {
      const serverContent = message.serverContent;
      if (isInterrupted(serverContent)) {
        return <CustomPlainTextLog msg="[Model Interrupted]" />;
      }
      if (isModelTurn(serverContent)) {
        return <ModelTurnLog message={message as ModelTurnLogMessagePropType} />;
      }
      // Bạn có thể muốn thêm logic cho toolCall từ server ở đây nếu cần hiển thị khác
      // Ví dụ: if (serverContent.toolCall) { return <SomeToolCallDisplayComponent ... />; }
    }
  }

  if (
    type.includes("transcription.inputEvent.partial") ||
    type.includes("transcription.outputEvent.partial") ||
    type === "receive.serverAudio"
  ) {
    return null;
  }

  // console.warn("[MessageRenderer] Rendering with AnyMessage for unhandled/debug log type:", type, "Message:", message);
  return <AnyMessage message={message as any} />;
};

export default MessageRenderer;