// src/app/[locale]/chatbot/lib/unified-live-chat.types.ts

import type {
  Content,
  FunctionCall,
  FunctionResponse,
  GenerationConfig,
  Blob as SDKBlob,
  Part,
  Tool,
  Modality,
  LiveClientMessage as SDKLiveClientMessage,
  LiveServerMessage as SDKLiveServerMessage,
  LiveClientSetup as SDKLiveClientSetup, // This is the type for the setup *message payload*
  LiveServerContent as SDKLiveServerContent,
  LiveClientRealtimeInput as SDKLiveClientRealtimeInput,
  LiveClientToolResponse as SDKLiveClientToolResponse,
  LiveServerToolCall as SDKLiveServerToolCall,
  LiveServerSetupComplete as SDKLiveServerSetupComplete,
  LiveServerToolCallCancellation as SDKLiveServerToolCallCancellation,
  SpeechConfig as SDKSpeechConfig,
  RealtimeInputConfig as SDKRealtimeInputConfig, // This is in LiveClientSetup
  SessionResumptionConfig as SDKSessionResumptionConfig, // This is in LiveClientSetup
  ContextWindowCompressionConfig as SDKContextWindowCompressionConfig, // This is in LiveClientSetup
  AudioTranscriptionConfig as SDKAudioTranscriptionConfig, // This is in LiveClientSetup
  // LiveConnectConfig is the type for the parameters to the SDK's connect() method
  LiveConnectConfig as SDKLiveConnectConfig
} from '@google/genai'; // Adjust if SDK path is different

/**
 * This module contains unified type-definitions and Type-Guards for live chat functionality.
 */

// Type-definitions

/* outgoing types */

export type PrebuiltVoice = "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede" | "Orus" | "Zephyr";
export type OutputModality = Modality;

export type Language = 'en' | 'vi' | 'zh' | 'de' | 'fr' | 'es' | 'ru' | 'ja' | 'ko' | 'ar' | 'fa';
export type ChatMode = 'live' | 'regular';

export interface LanguageOption {
  code: Language;
  name: string;
  flagCode: string;
}

/**
 * Configuration for initiating a live chat session.
 * This is an application-level config that holds parameters for BOTH:
 * 1. The SDK's `live.connect(params: LiveConnectParameters)` method.
 * 2. The `SDKLiveClientSetup` payload sent as the first message.
 *
 * `LiveConnectParameters` includes `model` and `config?: LiveConnectConfig`.
 * `LiveConnectConfig` includes `responseModalities`, `speechConfig`, `generationConfig`, `tools`, etc.
 * `SDKLiveClientSetup` (the message payload) includes `model`, `generationConfig`, `tools`, `systemInstruction`, etc.
 * but NOT `responseModalities` or `speechConfig` directly.
 */
export type LiveChatSessionConfig = {
    // Fields primarily for SDK's live.connect() or overall session setup
    model: string; // Used in both connect params and setup message
    responseModalities?: OutputModality[]; // For LiveConnectConfig
    speechConfig?: SDKSpeechConfig;       // For LiveConnectConfig (includes languageCode)

    // Fields primarily for the SDKLiveClientSetup message payload
    systemInstruction?: Content;
    generationConfig?: Partial<GenerationConfig>; // Base SDK GenerationConfig for the setup message
    tools?: Tool[];

    // Other SDKLiveClientSetup fields (can also be in LiveConnectConfig if SDK merges them)
    realtimeInputConfig?: SDKRealtimeInputConfig;
    sessionResumption?: SDKSessionResumptionConfig;
    contextWindowCompression?: SDKContextWindowCompressionConfig;
    inputAudioTranscription?: SDKAudioTranscriptionConfig;
    outputAudioTranscription?: SDKAudioTranscriptionConfig;
};


// --- Outgoing Messages (Client to Server) ---
export type LiveOutgoingMessage = SDKLiveClientMessage;

/**
 * This is the type for the `setup` field within an SDKLiveClientMessage.
 * It should only contain properties defined in the SDK's `LiveClientSetup` interface.
 */
export type SetupPayload = SDKLiveClientSetup;

export type ClientContentPayload = NonNullable<SDKLiveClientMessage['clientContent']>;
export type RealtimeInputPayload = SDKLiveClientRealtimeInput;
export type ToolResponsePayload = NonNullable<SDKLiveClientToolResponse>;

// --- Incoming Messages (Server to Client) ---
export type LiveIncomingMessage = SDKLiveServerMessage;
export type SetupCompletePayload = NonNullable<SDKLiveServerMessage['setupComplete']>;
export type ServerContentPayload = NonNullable<SDKLiveServerMessage['serverContent']>;
export type ToolCallPayload = NonNullable<SDKLiveServerMessage['toolCall']>;
export type ToolCallCancellationPayload = NonNullable<SDKLiveServerMessage['toolCallCancellation']>;

// ========= Audio Player Types (Application-specific, keep as is) ============
export type ClientAudioMessage = {
  clientAudio: {
    audioData: string;
  };
};
export type ServerAudioMessage = {
  serverAudio: {
    audioData: string;
  }
}
export function isClientAudioMessage(msg: any): msg is ClientAudioMessage {
  return msg && typeof msg === "object" && msg.clientAudio && typeof msg.clientAudio.audioData === 'string';
}
export function isServerAudioMessage(msg: any): msg is ServerAudioMessage {
  return msg && typeof msg === "object" && msg.serverAudio && typeof msg.serverAudio.audioData === 'string';
}
// =========================================

/** log types */
export type StreamingLog = {
  date: Date;
  type: string;
  count?: number;
  message: string | SDKLiveClientMessage | SDKLiveServerMessage | ClientAudioMessage | ServerAudioMessage;
};

// Type alias for the message union after basic filtering
export type SDKMessageUnion = SDKLiveClientMessage | SDKLiveServerMessage;


// Type-Guards
// Helper for checking properties
const hasProperty = <T extends object, K extends PropertyKey>(obj: T, prop: K): obj is T & Record<K, unknown> => {
    return typeof obj === 'object' && obj !== null && prop in obj;
};

// Outgoing messages (checking fields within SDKLiveClientMessage)
export const isSetupMessage = (msg: SDKMessageUnion): msg is SDKLiveClientMessage & { setup: SDKLiveClientSetup } =>
  hasProperty(msg, 'setup') && typeof msg.setup === 'object' && msg.setup !== null;

export const isClientContentMessage = (msg: SDKMessageUnion): msg is SDKLiveClientMessage & { clientContent: NonNullable<SDKLiveClientMessage['clientContent']> } =>
  hasProperty(msg, 'clientContent') && typeof msg.clientContent === 'object' && msg.clientContent !== null;

export const isRealtimeInputMessage = (msg: SDKMessageUnion): msg is SDKLiveClientMessage & { realtimeInput: NonNullable<SDKLiveClientMessage['realtimeInput']> } =>
  hasProperty(msg, 'realtimeInput') && typeof msg.realtimeInput === 'object' && msg.realtimeInput !== null;

export const isToolResponseMessage = (msg: SDKMessageUnion): msg is SDKLiveClientMessage & { toolResponse: NonNullable<SDKLiveClientMessage['toolResponse']> } =>
  hasProperty(msg, 'toolResponse') && typeof msg.toolResponse === 'object' && msg.toolResponse !== null;


// Incoming messages (checking fields within SDKLiveServerMessage)
export const isSetupCompleteMessage = (msg: SDKMessageUnion): msg is SDKLiveServerMessage & { setupComplete: NonNullable<SDKLiveServerMessage['setupComplete']> } =>
  hasProperty(msg, 'setupComplete') && typeof msg.setupComplete === 'object' && msg.setupComplete !== null;

export const isServerContentMessage = (msg: SDKMessageUnion): msg is SDKLiveServerMessage & { serverContent: NonNullable<SDKLiveServerMessage['serverContent']> } =>
  hasProperty(msg, 'serverContent') && typeof msg.serverContent === 'object' && msg.serverContent !== null;

export const isToolCallMessage = (msg: SDKMessageUnion): msg is SDKLiveServerMessage & { toolCall: NonNullable<SDKLiveServerMessage['toolCall']> } =>
  hasProperty(msg, 'toolCall') && typeof msg.toolCall === 'object' && msg.toolCall !== null;

export const isToolCallCancellationMessage = (msg: SDKMessageUnion): msg is SDKLiveServerMessage & { toolCallCancellation: NonNullable<SDKLiveServerMessage['toolCallCancellation']> } =>
  hasProperty(msg, 'toolCallCancellation') && typeof msg.toolCallCancellation === 'object' && msg.toolCallCancellation !== null;

export const isModelTurn = (content: SDKLiveServerContent | undefined): content is SDKLiveServerContent & { modelTurn: Content } =>
  !!content && hasProperty(content, 'modelTurn') && typeof content.modelTurn === 'object' && content.modelTurn !== null;
export const isTurnComplete = (content: SDKLiveServerContent | undefined): content is SDKLiveServerContent & { turnComplete: true } =>
  !!content && hasProperty(content, 'turnComplete') && content.turnComplete === true;
export const isInterrupted = (content: SDKLiveServerContent | undefined): content is SDKLiveServerContent & { interrupted: true } =>
  !!content && hasProperty(content, 'interrupted') && content.interrupted === true;

export function isSDKFunctionCall(value: unknown): value is FunctionCall {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    (candidate.id === undefined || typeof candidate.id === "string") &&
    candidate.args !== undefined && typeof candidate.args === "object"
  );
}
export function isSDKFunctionResponse(value: unknown): value is FunctionResponse {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.name === 'string' &&
    typeof candidate.id === 'string' &&
    candidate.response !== undefined && typeof candidate.response === 'object'
  );
}
export function isToolCallPayload(value: unknown): value is SDKLiveServerToolCall {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.functionCalls) &&
    candidate.functionCalls.every((call) => isSDKFunctionCall(call))
  );
}
export function isToolResponsePayload(value: unknown): value is SDKLiveClientToolResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    Array.isArray(candidate.functionResponses) &&
    candidate.functionResponses.every((resp) => isSDKFunctionResponse(resp))
  );
}