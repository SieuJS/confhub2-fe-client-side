// src/app/[locale]/chatbot/livechat/logger/MessageRenderer.tsx
import React, { ReactNode } from "react";
import {
  StreamingLog,
  // Type guards for SDK messages
  isClientContentMessage,
  isToolCallMessage,
  isToolCallCancellationMessage,
  isToolResponseMessage,
  isServerContentMessage,
  // Type guards for parts of ServerContentPayload
  isInterrupted,
  isTurnComplete,
  isModelTurn,
  // Application-specific types and guards
  isClientAudioMessage,
  isServerAudioMessage,
  ClientAudioMessage, // Import for casting if needed
  ServerAudioMessage, // Import for casting if needed
  // Payload types from unified types
  ClientContentPayload,
  ToolCallPayload,
  ToolCallCancellationPayload,
  ServerContentPayload,
  ToolResponsePayload, // This is SDKLiveClientToolResponse
} from "../../lib/live-chat.types"; // Updated import path

import ClientContentLog from "./ClientContentLog";
import ToolCallLog from "./ToolCallLog";
import ToolCallCancellationLog from "./ToolCallCancellationLog";
import ToolResponseLog from "./ToolResponseLog";
import ModelTurnLog from "./ModelTurnLog";
import PlainTextMessage from "./PlainTextMessage";
import ClientAudioLog from "./ClientAudioLog";
import ServerAudioLog from "./ServerAudioLog";
import AnyMessage from "./AnyMessage"; // Assuming this handles unknown/default cases

const CustomPlainTextLog = ({ msg }: { msg: string }): ReactNode => {
  return <PlainTextMessage message={msg} />;
};

interface MessageRendererProps {
  message: StreamingLog["message"]; // message is SDKLiveClientMessage | SDKLiveServerMessage | string | ClientAudioMessage | ServerAudioMessage
  type?: string;
}

const MessageRenderer = ({ message, type }: MessageRendererProps) => {
  if (typeof message === 'string') {
    return <PlainTextMessage message={message} />;
  }

  if (isClientAudioMessage(message)) {
    return <ClientAudioLog message={message as ClientAudioMessage} />;
  }

  if (isServerAudioMessage(message)) {
    return <ServerAudioLog message={message as ServerAudioMessage} />;
  }

  // At this point, message is SDKLiveClientMessage or SDKLiveServerMessage
  // The type guards will correctly narrow down based on the fields present.

  if (isClientContentMessage(message)) {
    // message.clientContent is ClientContentPayload
    return <ClientContentLog message={message.clientContent} />;
  }
  if (isToolCallMessage(message)) {
    // message.toolCall is ToolCallPayload
    return <ToolCallLog message={message.toolCall} />;
  }
  if (isToolCallCancellationMessage(message)) {
    // message.toolCallCancellation is ToolCallCancellationPayload
    return <ToolCallCancellationLog message={message.toolCallCancellation} />;
  }

  // For ToolResponse, the type guard isToolResponseMessage checks if message is an SDKLiveClientMessage
  // AND has the toolResponse field.
  if (isToolResponseMessage(message)) {
    // message.toolResponse is ToolResponsePayload
    return <ToolResponseLog message={message.toolResponse} />;
  }

  if (isServerContentMessage(message)) {
    // message.serverContent is ServerContentPayload (SDKLiveServerContent)
    const serverContent = message.serverContent;
    if (isInterrupted(serverContent)) { // isInterrupted now takes SDKLiveServerContent
      return <CustomPlainTextLog msg="interrupted" />;
    }
    if (isTurnComplete(serverContent)) { // isTurnComplete now takes SDKLiveServerContent
      return <CustomPlainTextLog msg="turnComplete" />;
    }
    if (isModelTurn(serverContent)) { // isModelTurn now takes SDKLiveServerContent
      // ModelTurnLog expects the full ServerContentMessage (SDKLiveServerMessage with serverContent field)
      return <ModelTurnLog message={message} />;
    }
    // Potentially render other aspects of serverContent if needed, e.g., transcriptions
  }

  // Fallback for any other structured message not caught above
  return <AnyMessage message={message} />;
};

export default MessageRenderer;