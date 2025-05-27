// src/app/[locale]/chatbot/livechat/lib/live-api-event-types.ts
import {
  LiveChatSessionConfig,
  StreamingLog,
  ToolCallPayload,
  ToolCallCancellationPayload,
  TranscriptionPayload,
  ServerContentPayload // Import type này từ live-chat.types.ts
} from '@/src/app/[locale]/chatbot/lib/live-chat.types';
// import { LiveServerMessage as SDKLiveServerMessage } from "@google/genai"; // Không cần nếu không dùng server_message


// This is the SINGLE SOURCE OF TRUTH for Live API events
export interface LiveAPIEvents {
  // Events from useLiveApi
  close: (event?: CloseEvent) => void;
  open: () => void;
  config: (config: LiveChatSessionConfig) => void;
  log: (logEntry: StreamingLog) => void;
  interrupted: () => void;
  audio: (audioData: ArrayBuffer) => void;
  audioResponse: (audioResponsePayload: { data: string }) => void;
  inputTranscription: (transcription: TranscriptionPayload) => void;
  outputTranscription: (transcription: TranscriptionPayload) => void;
  toolcall: (toolCallPayload: ToolCallPayload) => void;
  toolcallcancellation: (payload: ToolCallCancellationPayload) => void;
  text: (textPart: string) => void;
  serverError: (error: Error | string) => void;
  generate: (generateData: any) => void;
  reset: () => void;
  turncomplete: () => void;
  setupcomplete: () => void;
  content: (payload: ServerContentPayload) => void; // THÊM EVENT NÀY

  // server_message: (message: SDKLiveServerMessage) => void;
}

export type EventType = keyof LiveAPIEvents;