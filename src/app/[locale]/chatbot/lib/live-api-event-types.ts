// src/app/[locale]/chatbot/livechat/lib/live-api-event-types.ts
import {
  LiveChatSessionConfig,
  StreamingLog,
  ToolCallPayload,
  ServerContentPayload, // This is SDKLiveServerContent
} from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import { LiveServerMessage as SDKLiveServerMessage } from "@google/genai";


// This is the SINGLE SOURCE OF TRUTH for Live API events
export interface LiveAPIEvents {
  // Events from useLiveApi
  close: () => void;
  open: () => void;
  config: (config: LiveChatSessionConfig) => void;
  log: (logEntry: StreamingLog) => void; // Callback for the "log" event
  interrupted: () => void;
  audio: (audioData: ArrayBuffer) => void;
  audioResponse: (audioResponsePayload: { data: string }) => void; // Callback for "audioResponse"
  toolcall: (toolCallPayload: ToolCallPayload) => void;
  text: (textPart: string) => void;
  serverError: (error: Error | string) => void;
  generate: (generateData: any) => void;
  reset: () => void;
  turncomplete: () => void;
  setupcomplete: () => void;

  // Potentially other events your MultimodalLiveClient might emit directly
  // that are aligned with SDK server messages, if not already covered by 'content', 'toolcall' etc.
  // For example, if your client directly emits the full SDKLiveServerMessage:
  server_message: (message: SDKLiveServerMessage) => void;
}

export type EventType = keyof LiveAPIEvents;