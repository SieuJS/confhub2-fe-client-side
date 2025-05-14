// MessageRenderer.tsx
// import React from "react";
import {
  StreamingLog,
  isClientContentMessage,
  isToolCallMessage,
  isToolCallCancellationMessage,
  isToolResponseMessage,
  isServerContentMessage,
  isInterrupted,
  isTurnComplete,
  isModelTurn,
  isClientAudioMessage,
  isServerAudioMessage,
  ToolResponseMessage
} from "../multimodal-live-types";
import ClientContentLog from "./ClientContentLog";
import ToolCallLog from "./ToolCallLog";
import ToolCallCancellationLog from "./ToolCallCancellationLog";
import ToolResponseLog from "./ToolResponseLog";
import ModelTurnLog from "./ModelTurnLog";
import PlainTextMessage from "./PlainTextMessage";
import ClientAudioLog from "./ClientAudioLog";
import ServerAudioLog from "./ServerAudioLog";
import AnyMessage from "./AnyMessage";
import { ReactNode } from "react";


const CustomPlainTextLog = ({ msg }: { msg: string }): ReactNode => {
  return <PlainTextMessage message={msg} />;
};

// Define the props for MessageRenderer
interface MessageRendererProps {
  message: StreamingLog["message"];
  type?: string; // Make type optional here as well, or required if always passed
}

const MessageRenderer = ({ message, type }: MessageRendererProps) => { // Use the interface
  // --- LOGS FROM PREVIOUS STEP ---
  console.log(`[MessageRenderer] Received message with type: ${type}`, JSON.stringify(message, null, 2));
  if (type) { // Only log these if type is present
    console.log("[MessageRenderer] Is it ToolResponse (via type)?", type === "client.toolResponse");
  }
  console.log("[MessageRenderer] Is it ToolResponse (via isToolResponseMessage)?", isToolResponseMessage(message));
  // --- END LOGS ---

  if (isClientAudioMessage(message)) {
    return <ClientAudioLog message={message} />;
  }

  if (isServerAudioMessage(message)) {
    return <ServerAudioLog message={message} />;
  }

  if (isClientContentMessage(message)) {
    return <ClientContentLog message={message.clientContent} />;
  }
  if (isToolCallMessage(message)) {
    return <ToolCallLog message={message} />;
  }
  if (isToolCallCancellationMessage(message)) {
    return <ToolCallCancellationLog message={message} />;
  }

  // Updated logic to prioritize type, then structure
  if (type === "client.toolResponse") { // Check specific type first
    if (isToolResponseMessage(message)) { // Also ensure structure matches
      console.log("[MessageRenderer] Rendering ToolResponseLog for (type client.toolResponse):", JSON.stringify(message, null, 2));
      return <ToolResponseLog message={message as ToolResponseMessage} />;
    } else {
      console.warn("[MessageRenderer] Message type is 'client.toolResponse' but structure doesn't match isToolResponseMessage. Message:", message);
      // Fallback or render an error/default view
    }
  } else if (isToolResponseMessage(message)) { // Fallback to structure check if type isn't 'client.toolResponse'
     console.log("[MessageRenderer] Rendering ToolResponseLog for (isToolResponseMessage, type was not client.toolResponse):", JSON.stringify(message, null, 2));
    return <ToolResponseLog message={message} />;
  }

  if (isServerContentMessage(message)) {
    const { serverContent } = message;
    if (isInterrupted(serverContent)) {
      return <CustomPlainTextLog msg="interrupted" />;
    }
    if (isTurnComplete(serverContent)) {
      return <CustomPlainTextLog msg="turnComplete" />;
    }
    if (isModelTurn(serverContent)) {
      // console.log("isModelTurn", message); // Reduced verbosity
      return <ModelTurnLog message={message} />;
    }
  }
  if (typeof message === "string") {
    // console.log("PlainTextMessage", message); // Reduced verbosity
    return <PlainTextMessage message={message} />;
  }
  return <AnyMessage message={message} />;
};

export default MessageRenderer;