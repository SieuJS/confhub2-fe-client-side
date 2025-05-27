// src/app/[locale]/chatbot/livechat/hooks/useLiveApi.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react"; // Thêm useState
import {
  GoogleGenAI, // SDK: Main entry point
  Session as SDKSession, // SDK: Represents the live session
  LiveConnectConfig as SDKLiveConnectConfig, // SDK: Configuration for the connection
  LiveServerMessage as SDKLiveServerMessage, // SDK: Messages from the server
  Content as SDKContent, // SDK: Content type
  Part as SDKPart, // SDK: Part type
  FunctionResponse as SDKFunctionResponse, // SDK: FunctionResponse type
  FunctionCall as SDKFunctionCall, // SDK: FunctionCall type
  Blob as SDKBlob, // SDK: Blob type for media
  // Import other necessary types from SDK like Modality, SpeechConfig, etc.
  // For example:
  Modality as SDKModality,
  // SpeechConfig as SDKSpeechConfig,
  // GenerationConfig as SDKGenerationConfig,
  // Tool as SDKTool,
  // AudioTranscriptionConfig as SDKAudioTranscriptionConfig,
  // RealtimeInputConfig as SDKRealtimeInputConfig,
  // SessionResumptionConfig as SDKSessionResumptionConfig,
  // ContextWindowCompressionConfig as SDKContextWindowCompressionConfig,
} from "@google/genai";

// Your existing application-specific types
import {
  LiveChatSessionConfig, // Your application's combined config for a session
  ServerAudioMessage,
  TranscriptionPayload,
  StreamingLog,
  // ToolCallPayload, // This will likely be SDKFunctionCall[]
  // ToolResponsePayload, // This will likely be SDKFunctionResponse[]
} from '@/src/app/[locale]/chatbot/lib/live-chat.types';

import {
  LiveAPIEvents,
  EventType,
} from '../../lib/live-api-event-types'; // Your event types

import { AudioStreamer } from "../lib/audio-streamer";
import { audioContext } from "../lib/utils";
import VolMeterWorket from "../lib/worklets/vol-meter";
import EventEmitter from "eventemitter3";
import { debounce } from 'lodash';
import { Buffer } from 'buffer'; // Needed for base64 operations if not in global scope

const toSDKLiveConnectConfig = (appConfig: LiveChatSessionConfig): SDKLiveConnectConfig => {
  const sdkConfig: SDKLiveConnectConfig = {
    responseModalities: appConfig.responseModalities,
    speechConfig: appConfig.speechConfig,
    tools: appConfig.tools,
    systemInstruction: appConfig.systemInstruction,
    inputAudioTranscription: appConfig.inputAudioTranscription,
    outputAudioTranscription: appConfig.outputAudioTranscription,
    realtimeInputConfig: appConfig.realtimeInputConfig,
    sessionResumption: appConfig.sessionResumption,
    contextWindowCompression: appConfig.contextWindowCompression,
    temperature: appConfig.temperature,
    topP: appConfig.topP,
    topK: appConfig.topK,
    maxOutputTokens: appConfig.maxOutputTokens,
    // candidateCount: appConfig.candidateCount, // Đảm bảo có trong LiveChatSessionConfig nếu dùng
    // stopSequences: appConfig.stopSequences, // Đảm bảo có trong LiveChatSessionConfig nếu dùng
  };
  Object.keys(sdkConfig).forEach(key => {
    const K = key as keyof SDKLiveConnectConfig;
    if (sdkConfig[K] === undefined) {
      delete sdkConfig[K];
    }
  });
  return sdkConfig;
};

export type UseLiveAPIResults = {
  session: SDKSession | null;
  setConfig: (config: LiveChatSessionConfig) => void;
  appConfig: LiveChatSessionConfig | undefined;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
  on: <K extends EventType>(event: K, callback: LiveAPIEvents[K]) => void;
  off: <K extends EventType>(event: K, callback: LiveAPIEvents[K]) => void;
  isConnecting: boolean;
  sendClientContent: (params: { turns: SDKContent[] | SDKContent, turnComplete?: boolean }) => void;
  sendRealtimeInput: (params: { audio?: SDKBlob, audioStreamEnd?: boolean, video?: SDKBlob, text?: string }) => void;
  sendToolResponse: (params: { functionResponses: SDKFunctionResponse[] }) => void;
};

export function useLiveAPI({ apiKey }: { apiKey: string }): UseLiveAPIResults {
  const genAI = useMemo(() => new GoogleGenAI({ apiKey }), [apiKey]);
  const [session, setSession] = useState<SDKSession | null>(null);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const [connected, setConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [appConfig, setAppConfigInternal] = useState<LiveChatSessionConfig | undefined>(undefined);
  const [volume, setVolume] = useState(0);
  const accumulatedServerAudioRef = useRef<string>("");
  const accumulatedTextPartsRef = useRef<SDKPart[]>([]);
  const accumulatedInputTranscriptionRef = useRef<string>("");
  const accumulatedOutputTranscriptionRef = useRef<string>("");
  const emitter = useRef(new EventEmitter<LiveAPIEvents>()).current;

  const setConfig = useCallback((newConfig: LiveChatSessionConfig) => {
    setAppConfigInternal(newConfig);
    // const logEntry: StreamingLog = {
    //   date: new Date(),
    //   type: "client.setConfig",
    //   message: `App config set: ${JSON.stringify({ model: newConfig.model, modalities: newConfig.responseModalities?.map(m => SDKModality[m]) })}`,
    // };
    // emitter.emit("log", logEntry);
  }, [emitter]);

  const debouncedEmitServerAudioLog = useCallback(
    debounce((audioData: string) => {
      const serverAudioMessage: ServerAudioMessage = { serverAudio: { audioData } };
      const logEntry: StreamingLog = {
        date: new Date(),
        type: "receive.serverAudioDebounced",
        message: serverAudioMessage,
      };
      emitter.emit("log", logEntry);
    }, 500),
    [emitter]
  );

  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: "audio-out" }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet<any>("vumeter-out", VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            console.log("Audio output VUmeter worklet added.");
          });
      });
    }
    return () => {
      audioStreamerRef.current?.stop();
    }
  }, []); // setVolume là stable từ useState

  const handleServerMessage = useCallback((message: SDKLiveServerMessage) => {
    if (message.setupComplete) {
      emitter.emit("setupcomplete");
      // emitter.emit("log", { date: new Date(), type: "receive.setupComplete", message: "Setup complete received" });
    }
    if (message.toolCall) { // SDKLiveServerToolCall (có thể có functionCalls là undefined)
      emitter.emit("toolcall", message.toolCall); // Gửi toàn bộ object SDKLiveServerToolCall
      // emitter.emit("log", { date: new Date(), type: "receive.toolCall", message: JSON.stringify(message.toolCall), count: message.toolCall.functionCalls?.length });
    }
    if (message.toolCallCancellation) {
      emitter.emit("toolcallcancellation", message.toolCallCancellation);
      // emitter.emit("log", { date: new Date(), type: "receive.toolCallCancellation", message: JSON.stringify(message.toolCallCancellation) });
    }
    if (message.usageMetadata) {
      // emitter.emit("log", { date: new Date(), type: "receive.usageMetadata", message: JSON.stringify(message.usageMetadata) });
    }
    if (message.goAway) {
      // emitter.emit("log", { date: new Date(), type: "receive.goAway", message: JSON.stringify(message.goAway) });
    }
    if (message.sessionResumptionUpdate) {
      // emitter.emit("log", { date: new Date(), type: "receive.sessionResumptionUpdate", message: JSON.stringify(message.sessionResumptionUpdate) });
    }
    if (message.serverContent) {
      const serverContent = message.serverContent;
      emitter.emit("content", serverContent);

      // Xử lý Input Transcription (giữ nguyên logic log của bạn nếu đang hoạt động tốt)
      if (serverContent.inputTranscription) {
        const transcription: TranscriptionPayload = {
          text: serverContent.inputTranscription.text || "",
          finished: serverContent.inputTranscription.finished || false,
        };
        if (transcription.text) {
          accumulatedInputTranscriptionRef.current += transcription.text;
        }
        // Log cho input transcription (ví dụ: chỉ log final hoặc cả partial tùy nhu cầu debug)
        if (transcription.finished) {
          emitter.emit("log", {
            date: new Date(),
            type: "transcription.inputEvent.final", // Log final input
            message: { text: accumulatedInputTranscriptionRef.current, finished: true }
          });
          accumulatedInputTranscriptionRef.current = ""; // Reset khi final
        } else if (transcription.text) { // Chỉ log partial nếu có text
          // emitter.emit("log", { date: new Date(), type: "transcription.inputEvent.partial", message: transcription });
        }
        emitter.emit("inputTranscription", transcription);
      }

      // Xử lý Output Transcription
      if (serverContent.outputTranscription) {
        const transcriptionChunk: TranscriptionPayload = { // Đổi tên để rõ ràng là chunk
          text: serverContent.outputTranscription.text || "",
          finished: serverContent.outputTranscription.finished || false,
        };

        if (transcriptionChunk.text) {
          accumulatedOutputTranscriptionRef.current += transcriptionChunk.text;
        }

        // SỬA LOGIC LOG Ở ĐÂY:
        if (transcriptionChunk.finished) {
          // Khi server báo finished, log toàn bộ accumulated text là "final"
          // và đây là bản ghi duy nhất MessageRenderer nên hiển thị cho output transcription.
          emitter.emit("log", {
            date: new Date(),
            type: "transcription.outputEvent.final", // Type này sẽ được MessageRenderer bắt
            message: { text: accumulatedOutputTranscriptionRef.current, finished: true }
          });
          accumulatedOutputTranscriptionRef.current = ""; // Reset ngay sau khi log final
        } else if (transcriptionChunk.text) {
          // Nếu là partial và có text, bạn có thể chọn không log nó vào store logger
          // để tránh làm nhiễu MessageRenderer, hoặc log với type "partial"
          // mà MessageRenderer sẽ bỏ qua.
          // emitter.emit("log", {
          //   date: new Date(),
          //   type: "transcription.outputEvent.partial", // Type này sẽ bị MessageRenderer bỏ qua
          //   message: transcriptionChunk
          // });
        }
        // Vẫn emit event "outputTranscription" cho các listener khác nếu cần xử lý từng chunk
        emitter.emit("outputTranscription", transcriptionChunk);
      }



      if (serverContent.modelTurn?.parts) {
        accumulatedTextPartsRef.current = accumulatedTextPartsRef.current.concat(serverContent.modelTurn.parts);
        serverContent.modelTurn.parts.forEach(part => {
          if (part.text) {
            emitter.emit("text", part.text);
            // emitter.emit("log", { date: new Date(), type: "receive.textChunk", message: part.text });
          }
          if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/')) {
            try {
              const nodeBuffer = Buffer.from(part.inlineData.data, 'base64');
              const audioArrayBuffer = nodeBuffer.buffer.slice(nodeBuffer.byteOffset, nodeBuffer.byteOffset + nodeBuffer.byteLength) as ArrayBuffer;
              audioStreamerRef.current?.addPCM16(new Uint8Array(audioArrayBuffer));
              accumulatedServerAudioRef.current += part.inlineData.data;
              emitter.emit("audio", audioArrayBuffer);
              emitter.emit("audioResponse", { data: part.inlineData.data });
            } catch (e) {
              console.error("Error processing audio data:", e);
              // emitter.emit("log", { date: new Date(), type: "error.audioProcessing", message: (e as Error).message });
            }
          }
        });
      }
      if (serverContent.interrupted) {
        audioStreamerRef.current?.stop();
        emitter.emit("interrupted");
        // emitter.emit("log", { date: new Date(), type: "receive.interrupted", message: "Model turn interrupted" });
        accumulatedServerAudioRef.current = "";
        debouncedEmitServerAudioLog.cancel();
        accumulatedTextPartsRef.current = [];

        // Khi bị interrupt, có thể không có 'finished' transcription.
        // Reset accumulatedOutputTranscriptionRef nếu logic yêu cầu.
        // accumulatedOutputTranscriptionRef.current = ""; // Cân nhắc

      }
      if (serverContent.turnComplete) {
        if (accumulatedServerAudioRef.current) {
          debouncedEmitServerAudioLog(accumulatedServerAudioRef.current);
          debouncedEmitServerAudioLog.flush();
        }
        accumulatedServerAudioRef.current = "";
        if (accumulatedTextPartsRef.current.length > 0) {
          const completeModelTurnContent: SDKContent = { role: "model", parts: accumulatedTextPartsRef.current };
          // emitter.emit("log", { date: new Date(), type: "receive.turnComplete.content", message: JSON.stringify(completeModelTurnContent) });
        }
        // KHI TURN COMPLETE:
        // Nếu vẫn còn output transcription chưa được đánh dấu là finished (do server không gửi finished:true cho chunk cuối)
        // thì coi phần tích lũy còn lại là final.
        if (accumulatedOutputTranscriptionRef.current) {
          console.warn("[useLiveAPI] Turn complete with pending accumulated output transcription:", accumulatedOutputTranscriptionRef.current);
          emitter.emit("log", {
            date: new Date(),
            type: "transcription.outputEvent.final", // Dùng cùng type để MessageRenderer bắt được
            message: { text: accumulatedOutputTranscriptionRef.current, finished: true } // Đánh dấu là finished
          });
          accumulatedOutputTranscriptionRef.current = ""; // Reset
        }
        // Tương tự cho input nếu cần
        if (accumulatedInputTranscriptionRef.current) {
          console.warn("[useLiveAPI] Turn complete with pending accumulated input transcription:", accumulatedInputTranscriptionRef.current);
          emitter.emit("log", {
            date: new Date(),
            type: "transcription.inputEvent.final",
            message: { text: accumulatedInputTranscriptionRef.current, finished: true }
          });
          accumulatedInputTranscriptionRef.current = "";
        }

        emitter.emit("turncomplete");
        // emitter.emit("log", { date: new Date(), type: "receive.turnComplete", message: "Model turn complete" });
      }
    }
  }, [emitter, debouncedEmitServerAudioLog]);

  const connect = useCallback(async () => {
    if (!appConfig) {
      console.error("useLiveApi: Configuration (appConfig) is not set before connecting.");
      emitter.emit("serverError", new Error("Configuration (appConfig) is not set."));
      return;
    }
    if (session || isConnecting) {
      console.log("useLiveApi: Already connected or connecting.");
      return;
    }
    setIsConnecting(true);
    emitter.emit("log", { date: new Date(), type: "client.connect.attempt", message: `Attempting to connect with model: ${appConfig.model}` });
    try {
      const sdkConfig = toSDKLiveConnectConfig(appConfig);
      emitter.emit("log", { date: new Date(), type: "client.connect.sdkConfig", message: JSON.stringify(sdkConfig) });
      const newSession = await genAI.live.connect({
        model: appConfig.model,
        config: sdkConfig,
        callbacks: {
          onopen: () => {
            setConnected(true);
            setIsConnecting(false);
            emitter.emit("open");
            emitter.emit("log", { date: new Date(), type: "connection.open", message: "WebSocket connected and session opened." });
          },
          onmessage: handleServerMessage,
          onerror: (e: ErrorEvent) => {
            console.error("useLiveApi: SDK WebSocket error:", e);
            emitter.emit("serverError", new Error(e.message || "SDK WebSocket error"));
            setSession(null);
            setConnected(false);
            setIsConnecting(false);
          },
          onclose: (e: CloseEvent) => {
            setConnected(false);
            setIsConnecting(false);
            setSession(null);
            emitter.emit("close", e);
            emitter.emit("log", { date: new Date(), type: "connection.close", message: `WebSocket closed. Code: ${e.code}, Reason: ${e.reason}` });
            audioStreamerRef.current?.stop();
            accumulatedServerAudioRef.current = "";
            debouncedEmitServerAudioLog.cancel();
            accumulatedTextPartsRef.current = [];
            accumulatedInputTranscriptionRef.current = "";
            accumulatedOutputTranscriptionRef.current = "";
          },
        },
      });
      setSession(newSession);
    } catch (error) {
      console.error("useLiveApi: Connection failed", error);
      const errorMessage = error instanceof Error ? error : new Error(String(error));
      emitter.emit("serverError", errorMessage);
      setSession(null);
      setConnected(false);
      setIsConnecting(false);
      emitter.emit("log", { date: new Date(), type: "client.connect.failure", message: errorMessage.message });
    }
  }, [genAI, appConfig, emitter, handleServerMessage, isConnecting, session, debouncedEmitServerAudioLog]);

  const disconnect = useCallback(async () => {
    emitter.emit("log", { date: new Date(), type: "client.disconnect.attempt", message: "Attempting to disconnect session." });
    if (session) {
      session.close();
    } else {
      emitter.emit("log", { date: new Date(), type: "client.disconnect.noop", message: "No active session to disconnect." });
    }
  }, [session, emitter]);

  const sendClientContent = useCallback((params: { turns: SDKContent[] | SDKContent, turnComplete?: boolean }) => {
    if (session && connected) {
      try {
        const turnsArray = Array.isArray(params.turns) ? params.turns : [params.turns];
        session.sendClientContent({
          turns: turnsArray,
          turnComplete: params.turnComplete !== undefined ? params.turnComplete : true,
        });
        // emitter.emit("log", { date: new Date(), type: "client.send.clientContent", message: JSON.stringify(params.turns).substring(0, 100) + "..." });
      } catch (e) {
        console.error("Error sending client content:", e);
        emitter.emit("log", { date: new Date(), type: "client.send.clientContent.error", message: (e as Error).message });
        emitter.emit("serverError", e as Error);
      }
    } else {
      console.warn(`Cannot send clientContent: Session is ${session ? 'defined' : 'null'}, Connected is ${connected}`);
      emitter.emit("log", { date: new Date(), type: "client.send.clientContent.noconnection", message: `Not connected (session: ${!!session}, connected: ${connected})` });
    }
  }, [session, connected, emitter]); // ĐÃ THÊM session VÀO ĐÂY

  const sendRealtimeInput = useCallback((params: { audio?: SDKBlob, audioStreamEnd?: boolean, video?: SDKBlob, text?: string }) => {
    if (session && connected) {
      try {
        session.sendRealtimeInput(params);
        let logMsg = "Sending realtime input: ";
        if (params.audio && typeof params.audio.data === 'string') logMsg += `audio chunk (${params.audio.data.length}b64), `;
        else if (params.audio) logMsg += `audio chunk (data not string), `;
        if (params.video && typeof params.video.data === 'string') logMsg += `video chunk (${params.video.data.length}b64), `;
        else if (params.video) logMsg += `video chunk (data not string), `;
        if (params.text) logMsg += `text (${params.text}), `;
        if (params.audioStreamEnd) logMsg += `audioStreamEnd, `;
        emitter.emit("log", { date: new Date(), type: "client.send.realtimeInput", message: logMsg });
      } catch (e) {
        console.error("Error sending realtime input:", e);
        emitter.emit("log", { date: new Date(), type: "client.send.realtimeInput.error", message: (e as Error).message });
        emitter.emit("serverError", e as Error);
      }
    } else {
      console.warn(`Cannot send realtimeInput: Session is ${session ? 'defined' : 'null'}, Connected is ${connected}`);
      emitter.emit("log", { date: new Date(), type: "client.send.realtimeInput.noconnection", message: `Not connected (session: ${!!session}, connected: ${connected})` });
    }
  }, [session, connected, emitter]); // ĐÃ THÊM session VÀO ĐÂY

  const sendToolResponse = useCallback((params: { functionResponses: SDKFunctionResponse[] }) => {
    if (session && connected) {
      try {
        session.sendToolResponse(params);
        // emitter.emit("log", { date: new Date(), type: "client.send.toolResponse", message: JSON.stringify(params.functionResponses), count: params.functionResponses.length });
      } catch (e) {
        console.error("Error sending tool response:", e);
        emitter.emit("log", { date: new Date(), type: "client.send.toolResponse.error", message: (e as Error).message });
        emitter.emit("serverError", e as Error);
      }
    } else {
      console.warn(`Cannot send toolResponse: Session is ${session ? 'defined' : 'null'}, Connected is ${connected}`);
      emitter.emit("log", { date: new Date(), type: "client.send.toolResponse.noconnection", message: `Not connected (session: ${!!session}, connected: ${connected})` });
    }
  }, [session, connected, emitter]); // ĐÃ THÊM session VÀO ĐÂY

  const onCallback = useCallback(<K extends EventType>(event: K, callback: LiveAPIEvents[K]) => {
    emitter.on(event, callback as (...args: any[]) => void);
  }, [emitter]);

  const offCallback = useCallback(<K extends EventType>(event: K, callback: LiveAPIEvents[K]) => {
    emitter.off(event, callback as (...args: any[]) => void);
  }, [emitter]);

  useEffect(() => {
    return () => {
      if (session) {
        emitter.emit("log", { date: new Date(), type: "client.unmountDisconnect", message: "Component unmounting, closing session." });
        session.close();
        setSession(null);
      }
      debouncedEmitServerAudioLog.cancel();
    };
  }, [session, emitter, debouncedEmitServerAudioLog]);

  return {
    session: session,
    appConfig,
    setConfig,
    connected,
    isConnecting,
    connect,
    disconnect,
    volume,
    on: onCallback,
    off: offCallback,
    sendClientContent,
    sendRealtimeInput,
    sendToolResponse,
  };
}