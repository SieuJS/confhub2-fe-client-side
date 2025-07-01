// src/app/[locale]/chatbot/livechat/hooks/useLiveApi.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react"; // Đảm bảo useRef được import
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


// Thêm các dòng này ở đầu hook useLiveApi
const INPUT_TRANSCRIPTION_SILENCE_DURATION = 500;


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

  const inputTranscriptionSilenceTimerRef = useRef<NodeJS.Timeout | null>(null);


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
  const appConfigRef = useRef<LiveChatSessionConfig | undefined>();


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
            // console.log("Audio output VUmeter worklet added.");
          });
      });
    }
    return () => {
      audioStreamerRef.current?.stop();
    }
  }, []); // setVolume là stable từ useState

  useEffect(() => {
    appConfigRef.current = appConfig;
  }, [appConfig]);

  // Listener mới trong useLiveApi để xử lý việc finalize input transcription
  useEffect(() => {
    const handleFinalizeInputTranscription = () => {
      if (accumulatedInputTranscriptionRef.current.trim()) {
        // console.log(`[useLiveAPI] Finalizing input transcription via clientSpeechSegmentEnd event: "${accumulatedInputTranscriptionRef.current}"`);
        emitter.emit("log", {
          date: new Date(),
          type: "transcription.inputEvent.final",
          message: { text: accumulatedInputTranscriptionRef.current, finished: true }
        });
      }
      accumulatedInputTranscriptionRef.current = ""; // Reset sau khi đã log
    };

    emitter.on("clientSpeechSegmentEnd", handleFinalizeInputTranscription);
    return () => {
      emitter.off("clientSpeechSegmentEnd", handleFinalizeInputTranscription);
    };
  }, [emitter]); // emitter là stable

  const handleServerMessage = useCallback((message: SDKLiveServerMessage) => {
    // console.log("RAW SERVER MESSAGE:", JSON.stringify(message, null, 2)); // Bỏ comment nếu cần debug sâu

    // Xử lý các message không thuộc serverContent trước
    if (message.setupComplete) {
      emitter.emit("setupcomplete");
      return; // Thoát sớm nếu là message đơn giản
    }
    if (message.toolCall) {
      emitter.emit("toolcall", message.toolCall);
      return;
    }
    if (message.toolCallCancellation) {
      emitter.emit("toolcallcancellation", message.toolCallCancellation);
      return;
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

    // Chỉ xử lý serverContent nếu message chứa nó
    if (message.serverContent) {
      const serverContent = message.serverContent;
      emitter.emit("content", serverContent);
      const currentOutputModality = appConfig?.responseModalities?.[0]; // Sử dụng appConfig trực tiếp nếu nó là dependency của useCallback
      // Hoặc appConfigRef.current nếu không muốn rebind useCallback thường xuyên
      let serverIndicatedInputFinishedThisCycle = false;

      // --- 1. Xử lý Input Transcription (ƯU TIÊN CAO NHẤT) ---
      if (serverContent.inputTranscription) {
        const currentChunkText = serverContent.inputTranscription.text || "";
        const isFinishedByServer = serverContent.inputTranscription.finished || false;

        if (inputTranscriptionSilenceTimerRef.current) {
          clearTimeout(inputTranscriptionSilenceTimerRef.current);
          inputTranscriptionSilenceTimerRef.current = null;
        }

        // SỬA LỖI CẬP NHẬT: Nối chuỗi thay vì ghi đè
        if (currentChunkText) { // Chỉ nối nếu chunk có nội dung (kể cả chỉ là dấu cách)
          // Xử lý khoảng trắng đơn giản: nếu accumulated rỗng hoặc chunk bắt đầu bằng dấu cách thì nối trực tiếp.
          // Nếu không, thêm một dấu cách trước khi nối chunk (nếu chunk không bắt đầu bằng dấu cách).
          // Server thường gửi các chunk đã có khoảng trắng phù hợp nếu chúng là các từ riêng biệt.
          // Cách đơn giản nhất là chỉ += và để trim() ở cuối xử lý.
          accumulatedInputTranscriptionRef.current += currentChunkText;
        }

        if (isFinishedByServer) {
          // accumulatedInputTranscriptionRef.current giờ đã chứa toàn bộ text từ các chunk
          // console.log(`[useLiveAPI] Server indicated input finished. Emitting clientSpeechSegmentEnd. Accumulated: "${accumulatedInputTranscriptionRef.current.trim()}"`);
          emitter.emit("clientSpeechSegmentEnd");
          serverIndicatedInputFinishedThisCycle = true; // Đánh dấu server đã chốt hạ input
          // Listener của clientSpeechSegmentEnd sẽ log và reset accumulatedInputTranscriptionRef
        } else if (accumulatedInputTranscriptionRef.current.trim()) {
          // Nếu CHƯA finished bởi server, và CÓ nội dung tích lũy -> đặt/đặt lại timer VAD.
          inputTranscriptionSilenceTimerRef.current = setTimeout(() => {
            // Timer hết hạn, chỉ phát clientSpeechSegmentEnd. Listener sẽ lo phần còn lại.
            // console.log(`[useLiveAPI] Input SILENCE timer expired. Emitting clientSpeechSegmentEnd. Accumulated: "${accumulatedInputTranscriptionRef.current.trim()}"`);
            emitter.emit("clientSpeechSegmentEnd");
            inputTranscriptionSilenceTimerRef.current = null;
          }, INPUT_TRANSCRIPTION_SILENCE_DURATION);
        }
        emitter.emit("inputTranscription", { text: currentChunkText, finished: isFinishedByServer });
      }

      // --- 2. Logic khi Model bắt đầu gửi Text Output (trước đây là "Finalize Early") ---
      // Chỉ xem xét nếu server CHƯA chốt hạ input trong message này.
      if (!serverIndicatedInputFinishedThisCycle &&
        serverContent.modelTurn?.parts?.some(part => part.text) &&
        currentOutputModality === SDKModality.TEXT &&
        accumulatedInputTranscriptionRef.current.trim() &&
        inputTranscriptionSilenceTimerRef.current // Quan trọng: chỉ can thiệp nếu VAD client (timer) đang chạy
      ) {
        // Model bắt đầu trả lời text, VAD client đang hoạt động.
        // Dấu hiệu lượt nói user có thể đã kết thúc. Dừng VAD client.
        // console.log(`[useLiveAPI] Model sent TEXT & client VAD active. Clearing VAD timer. Input: "${accumulatedInputTranscriptionRef.current.trim()}"`);
        clearTimeout(inputTranscriptionSilenceTimerRef.current);
        inputTranscriptionSilenceTimerRef.current = null;
        // KHÔNG phát clientSpeechSegmentEnd ở đây.
        // Việc finalize sẽ do turnComplete (nếu không có input nào nữa) hoặc inputTranscription tiếp theo (nếu user vẫn nói) đảm nhận.
        // Mục đích là không cắt ngang nếu user vẫn đang nói và model chỉ mới bắt đầu xử lý/trả lời sớm.
      }


      // --- 3. Xử lý Output Transcription ---
      if (serverContent.outputTranscription) {
        const transcriptionChunk: TranscriptionPayload = {
          text: serverContent.outputTranscription.text || "",
          finished: serverContent.outputTranscription.finished || false,
        };
        if (currentOutputModality !== SDKModality.TEXT) {
          if (transcriptionChunk.text) {
            accumulatedOutputTranscriptionRef.current += transcriptionChunk.text;
          }
          if (transcriptionChunk.finished) {
            if (accumulatedOutputTranscriptionRef.current.trim()) {
              emitter.emit("log", {
                date: new Date(),
                type: "transcription.outputEvent.final",
                message: { text: accumulatedOutputTranscriptionRef.current, finished: true }
              });
            }
            accumulatedOutputTranscriptionRef.current = "";
          }
        }
        emitter.emit("outputTranscription", transcriptionChunk);
      }

      // --- 4. Xử lý ModelTurn parts (text/audio output từ model) ---
      if (serverContent.modelTurn?.parts) {
        const newTextParts = serverContent.modelTurn.parts.filter(part => part.text);
        if (newTextParts.length > 0) {
          accumulatedTextPartsRef.current = accumulatedTextPartsRef.current.concat(newTextParts);
        }
        serverContent.modelTurn.parts.forEach(part => {
          if (part.text) {
            emitter.emit("text", part.text);
          }
          if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/')) {
            if (currentOutputModality === SDKModality.AUDIO) {
              try {
                const nodeBuffer = Buffer.from(part.inlineData.data, 'base64');
                const audioArrayBuffer = nodeBuffer.buffer.slice(nodeBuffer.byteOffset, nodeBuffer.byteOffset + nodeBuffer.byteLength) as ArrayBuffer;
                audioStreamerRef.current?.addPCM16(new Uint8Array(audioArrayBuffer));
                accumulatedServerAudioRef.current += part.inlineData.data; // Tích lũy để log khi turnComplete
                emitter.emit("audio", audioArrayBuffer); // Phát audio data để play real-time
                emitter.emit("audioResponse", { data: part.inlineData.data }); // Event này có thể trùng với "audio"
              } catch (e) {
                // console.error("Error processing server audio data:", e);
              }
            }
          }
        });
      }

      // --- Xử lý GenerationComplete (thường cho output của model) ---
      if (serverContent.generationComplete) {
        // Đây là thời điểm tốt để finalize output transcription nếu còn và output không phải TEXT
        if (currentOutputModality !== SDKModality.TEXT && accumulatedOutputTranscriptionRef.current.trim()) {
          // console.warn("[useLiveAPI] GenerationComplete with pending output transcription:", accumulatedOutputTranscriptionRef.current);
          emitter.emit("log", {
            date: new Date(),
            type: "transcription.outputEvent.final",
            message: { text: accumulatedOutputTranscriptionRef.current, finished: true }
          });
          accumulatedOutputTranscriptionRef.current = ""; // Reset
        }
      }

      // --- 5. Xử lý Interrupted ---
      if (serverContent.interrupted) {
        audioStreamerRef.current?.stop();
        emitter.emit("interrupted");
        // Dọn dẹp accumulators và timer
        accumulatedServerAudioRef.current = "";
        debouncedEmitServerAudioLog.cancel();
        accumulatedTextPartsRef.current = [];

        if (inputTranscriptionSilenceTimerRef.current) {
          clearTimeout(inputTranscriptionSilenceTimerRef.current);
          inputTranscriptionSilenceTimerRef.current = null;
        }
        // Nếu còn input chưa được finalize (ví dụ, server chưa bao giờ gửi finished:true cho nó)
        if (accumulatedInputTranscriptionRef.current.trim()) {
          // console.log(`[useLiveAPI] INTERRUPTED. Emitting clientSpeechSegmentEnd for input: "${accumulatedInputTranscriptionRef.current.trim()}"`);
          emitter.emit("clientSpeechSegmentEnd"); // Listener sẽ log và reset
        }
        // Không reset accumulatedInputTranscriptionRef ở đây, listener sẽ làm
      }

      // --- 6. Xử lý TurnComplete ---
      if (serverContent.turnComplete) {
        // Dọn dẹp và finalize mọi thứ còn lại
        if (accumulatedServerAudioRef.current) {
          debouncedEmitServerAudioLog(accumulatedServerAudioRef.current);
          debouncedEmitServerAudioLog.flush();
          accumulatedServerAudioRef.current = "";
        }
        if (accumulatedTextPartsRef.current.length > 0) {
          const completeModelTurnContent: SDKContent = { role: "model", parts: accumulatedTextPartsRef.current };
          const modelTurnLogPayload: Pick<SDKLiveServerMessage, 'serverContent'> = {
            serverContent: { modelTurn: completeModelTurnContent }
          };
          emitter.emit("log", {
            date: new Date(),
            type: "receive.modelTurn.final",
            message: modelTurnLogPayload as SDKLiveServerMessage
          });
          accumulatedTextPartsRef.current = [];
        }

        // Finalize output transcription nếu còn (và không phải TEXT mode)
        // (Có thể đã được finalize bởi generationComplete)
        if (currentOutputModality !== SDKModality.TEXT && accumulatedOutputTranscriptionRef.current.trim()) {
          emitter.emit("log", {
            date: new Date(),
            type: "transcription.outputEvent.final",
            message: { text: accumulatedOutputTranscriptionRef.current, finished: true }
          });
          accumulatedOutputTranscriptionRef.current = "";
        }


        if (inputTranscriptionSilenceTimerRef.current) {
          clearTimeout(inputTranscriptionSilenceTimerRef.current);
          inputTranscriptionSilenceTimerRef.current = null;
        }
        // Nếu còn input chưa được finalize (ví dụ, server không gửi finished, timer không hết hạn kịp)
        if (accumulatedInputTranscriptionRef.current.trim()) {
          // console.log(`[useLiveAPI] TURN COMPLETE. Emitting clientSpeechSegmentEnd for input: "${accumulatedInputTranscriptionRef.current.trim()}"`);
          emitter.emit("clientSpeechSegmentEnd"); // Listener sẽ log và reset
        }
        emitter.emit("turncomplete");

      }
    }
  }, [emitter, debouncedEmitServerAudioLog, appConfig, INPUT_TRANSCRIPTION_SILENCE_DURATION]); // Đảm bảo appConfig là dependency nếu dùng trực tiếp

  const connect = useCallback(async () => {
    if (!appConfig) {
      // console.error("useLiveApi: Configuration (appConfig) is not set before connecting.");
      emitter.emit("serverError", new Error("Configuration (appConfig) is not set."));
      return;
    }
    if (session || isConnecting) {
      // console.log("useLiveApi: Already connected or connecting.");
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
            // console.error("useLiveApi: SDK WebSocket error:", e);
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
            // emitter.emit("log", { date: new Date(), type: "connection.close", message: `WebSocket closed. Code: ${e.code}, Reason: ${e.reason}` });
            audioStreamerRef.current?.stop();
            accumulatedServerAudioRef.current = "";
            debouncedEmitServerAudioLog.cancel();
            accumulatedTextPartsRef.current = [];
            if (inputTranscriptionSilenceTimerRef.current) { // Xóa timer
              clearTimeout(inputTranscriptionSilenceTimerRef.current);
              inputTranscriptionSilenceTimerRef.current = null;
            }
            accumulatedInputTranscriptionRef.current = ""; // Reset accumulator
            accumulatedOutputTranscriptionRef.current = "";
          },
        },
      });
      setSession(newSession);
    } catch (error) {
      // console.error("useLiveApi: Connection failed", error);
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
        // console.error("Error sending client content:", e);
        emitter.emit("log", { date: new Date(), type: "client.send.clientContent.error", message: (e as Error).message });
        emitter.emit("serverError", e as Error);
      }
    } else {
      // console.warn(`Cannot send clientContent: Session is ${session ? 'defined' : 'null'}, Connected is ${connected}`);
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
        // emitter.emit("log", { date: new Date(), type: "client.send.realtimeInput", message: logMsg });
      } catch (e) {
        // console.error("Error sending realtime input:", e);
        emitter.emit("log", { date: new Date(), type: "client.send.realtimeInput.error", message: (e as Error).message });
        emitter.emit("serverError", e as Error);
      }
    } else {
      // console.warn(`Cannot send realtimeInput: Session is ${session ? 'defined' : 'null'}, Connected is ${connected}`);
      emitter.emit("log", { date: new Date(), type: "client.send.realtimeInput.noconnection", message: `Not connected (session: ${!!session}, connected: ${connected})` });
    }
  }, [session, connected, emitter]); // ĐÃ THÊM session VÀO ĐÂY

  const sendToolResponse = useCallback((params: { functionResponses: SDKFunctionResponse[] }) => {
    if (session && connected) {
      try {
        session.sendToolResponse(params);
        // emitter.emit("log", { date: new Date(), type: "client.send.toolResponse", message: JSON.stringify(params.functionResponses), count: params.functionResponses.length });
      } catch (e) {
        // console.error("Error sending tool response:", e);
        emitter.emit("log", { date: new Date(), type: "client.send.toolResponse.error", message: (e as Error).message });
        emitter.emit("serverError", e as Error);
      }
    } else {
      // console.warn(`Cannot send toolResponse: Session is ${session ? 'defined' : 'null'}, Connected is ${connected}`);
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
        // emitter.emit("log", { date: new Date(), type: "client.unmountDisconnect", message: "Component unmounting, closing session." });
        session.close();
        setSession(null);
      }
      debouncedEmitServerAudioLog.cancel();
      if (inputTranscriptionSilenceTimerRef.current) { // Xóa timer
        clearTimeout(inputTranscriptionSilenceTimerRef.current);
        inputTranscriptionSilenceTimerRef.current = null;
      }
    };
  }, [session, emitter, debouncedEmitServerAudioLog]); // Thêm dependencies nếu cần

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