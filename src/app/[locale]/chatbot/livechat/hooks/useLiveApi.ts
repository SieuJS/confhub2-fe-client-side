// src/app/[locale]/chatbot/livechat/hooks/useLiveApi.ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MultimodalLiveAPIClientConnection,
  MultimodalLiveClient,
} from "../lib/multimodal-live-client"; // Your custom client

// Import from your unified types file
import {
  LiveChatSessionConfig, // Your primary config type for the session
  ServerAudioMessage,    // For logging
  ServerContentPayload,  // This is SDKLiveServerContent
  // ModelTurn, // Keep if specifically needed for logging, otherwise ServerContentPayload is better
  StreamingLog, // For logging
} from '@/src/app/[locale]/chatbot/lib/live-chat.types';

import {
  LiveAPIEvents, // Import the centralized definition
  EventType,     // Import the centralized definition
} from '../../lib/live-api-event-types'; // Adjust path

// Import from SDK
import { Part, Content } from "@google/genai"; // SDK's Part and Content

import { AudioStreamer } from "../lib/audio-streamer";
import { audioContext } from "../lib/utils";
import VolMeterWorket from "../lib/worklets/vol-meter";
import EventEmitter from "eventemitter3";
import { debounce } from 'lodash';
import { ToolCallPayload } from "@/src/app/[locale]/chatbot/lib/live-chat.types";


// UseLiveAPIResults should use the imported types
export type UseLiveAPIResults = {
  client: MultimodalLiveClient;
  setConfig: (config: LiveChatSessionConfig) => void;
  config?: LiveChatSessionConfig;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
  on: <K extends EventType>(event: K, callback: LiveAPIEvents[K]) => void; // Uses centralized EventType
  off: <K extends EventType>(event: K, callback: LiveAPIEvents[K]) => void; // Uses centralized EventType
};

export function useLiveAPI({
  url,
  apiKey,
}: MultimodalLiveAPIClientConnection): UseLiveAPIResults {
  const client = useMemo(
    () => new MultimodalLiveClient({ url, apiKey }),
    [url, apiKey],
  );
  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const [connected, setConnected] = useState(false);
  // Initialize config as potentially undefined or with minimal defaults
  const [config, setConfigInternal] = useState<LiveChatSessionConfig | undefined>(undefined);

  const [volume, setVolume] = useState(0);
  // accumulatedServerAudio is for logging raw audio data if needed
  const [accumulatedServerAudio, setAccumulatedServerAudio] = useState(""); // Keep if used for logging
  const accumulatedServerAudioRef = useRef(""); // Keep if used for logging

  const accumulatedTextPartsRef = useRef<Part[]>([]);

  const emitter = useRef(new EventEmitter<LiveAPIEvents>()).current; // Emitter is typed with centralized LiveAPIEvents

  const setConfig = useCallback((newConfig: LiveChatSessionConfig) => {
    setConfigInternal(newConfig);
    emitter.emit("config", newConfig);
  }, [emitter]);


  const debouncedEmitServerAudioLog = useCallback(
    debounce((audioData: string) => {
      const serverAudioMessage: ServerAudioMessage = {
        serverAudio: { audioData },
      };
      const logEntry: StreamingLog = {
        date: new Date(),
        type: "receive.serverAudioDebounced", // Differentiate if needed
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
  }, []); // Removed audioStreamerRef from deps as it's a ref

  useEffect(() => {
    const onClose = () => {
      setConnected(false);
      emitter.emit("close");
      setAccumulatedServerAudio("");
      accumulatedServerAudioRef.current = "";
      debouncedEmitServerAudioLog.cancel();
      accumulatedTextPartsRef.current = [];
    };

    const stopAudioStreamer = () => audioStreamerRef.current?.stop();

    // This 'audio' event is likely from your custom client, emitting raw audio data
    const onAudio = (data: ArrayBuffer) => {
      audioStreamerRef.current?.addPCM16(new Uint8Array(data));
      const audioDataBase64 = btoa(String.fromCharCode(...new Uint8Array(data)));
      accumulatedServerAudioRef.current += audioDataBase64; // For debounced logging
      // setAccumulatedServerAudio((prev) => prev + audioDataBase64); // State update if needed elsewhere
      emitter.emit("audio", data); // Emit raw ArrayBuffer for other listeners
    };

    // This 'generate' event is custom from your client
    const onGenerate = (data: any) => {
      accumulatedServerAudioRef.current = "";
      setAccumulatedServerAudio("");
      accumulatedTextPartsRef.current = [];

      // Logic for handling 'generate' event (e.g., extracting audio from inlineData)
      // This part depends on how your MultimodalLiveClient structures the 'generate' event data.
      // Assuming it might contain parts similar to a modelTurn:
      if (data && data.parts && Array.isArray(data.parts)) {
        data.parts.forEach((part: Part) => {
          if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/')) {
            emitter.emit("audioResponse", { // Emitting for playback
              data: part.inlineData.data, // Base64 encoded audio data
            });
          }
        });
      }
      emitter.emit("generate", data); // Re-emit the original event
    };

    const onInterrupted = () => {
      stopAudioStreamer();
      emitter.emit("interrupted");
      setAccumulatedServerAudio("");
      accumulatedServerAudioRef.current = "";
      debouncedEmitServerAudioLog.cancel();
      accumulatedTextPartsRef.current = [];
    };

    // This 'content' event from your client should emit ServerContentPayload (SDKLiveServerContent)
    const onContent = (serverContent: ServerContentPayload) => {
      if (serverContent.modelTurn?.parts) {
        accumulatedTextPartsRef.current = accumulatedTextPartsRef.current.concat(serverContent.modelTurn.parts);
        // Optionally emit individual text parts if needed by UI
        serverContent.modelTurn.parts.forEach(part => {
          if (part.text) {
            emitter.emit("text", part.text);
          }
        });
      }
      // Log the raw serverContent if needed, or wait for turnComplete for aggregated log
      const logEntry: StreamingLog = {
        date: new Date(),
        type: "receive.serverContentChunk",
        message: { serverContent } as any, // Cast if StreamingLog expects SDKLiveServerMessage
      };
      emitter.emit("log", logEntry);

      if (serverContent.interrupted) {
        // Handle interruption if not already handled by 'interrupted' event
        onInterrupted();
      }
      if (serverContent.turnComplete) {
        // If turnComplete is part of serverContent, trigger onTurnComplete logic
        onTurnComplete();
      }
    };

    const onTurnComplete = () => {
      // Log accumulated raw audio if any
      const rawAudioDataToLog = accumulatedServerAudioRef.current;
      if (rawAudioDataToLog) {
        debouncedEmitServerAudioLog(rawAudioDataToLog); // Let debounce handle it
        debouncedEmitServerAudioLog.flush(); // Ensure it logs if this is the final event
      }
      accumulatedServerAudioRef.current = "";
      setAccumulatedServerAudio("");


      // Log accumulated text parts as a single model turn
      if (accumulatedTextPartsRef.current.length > 0) {
        const completeModelTurnContent: Content = { // SDK Content
          role: "model", // Assuming model role for accumulated parts
          parts: accumulatedTextPartsRef.current,
        };
        // For logging, we might wrap this in a structure that StreamingLog expects
        // e.g., if it expects an SDKLiveServerMessage
        const logMessagePayload = { serverContent: { modelTurn: completeModelTurnContent } };
        const logEntry: StreamingLog = {
          date: new Date(),
          type: "receive.turnComplete.content",
          message: logMessagePayload as any, // Cast if StreamingLog expects SDKLiveServerMessage
        };
        emitter.emit("log", logEntry);
      }
      accumulatedTextPartsRef.current = []; // Clear for the next turn
      emitter.emit("turncomplete");
    };


    // Standard client events
    client.on("open", () => {
      setConnected(true);
      emitter.emit("open");
    });
    client.on("close", onClose); // onClose handles setConnected(false)
    client.on("error", (error) => emitter.emit("serverError", error)); // Assuming client emits 'error'

    // SDK-aligned events (your client should map SDK messages to these)
    client.on("setupcomplete", () => emitter.emit("setupcomplete"));
    client.on("content", onContent); // Expects ServerContentPayload
    client.on("toolcall", (toolCallData) => emitter.emit("toolcall", toolCallData)); // Expects ToolCallPayload
    client.on("interrupted", onInterrupted); // Expects SDK's interrupted signal
    client.on("turncomplete", onTurnComplete); // Expects SDK's turnComplete signal

    // Your custom client events
    client.on("audio", onAudio); // For raw audio data from server for playback
    client.on("log", (logData) => emitter.emit("log", logData as StreamingLog)); // For general logging

    // Emitter for your custom 'generate' event
    emitter.on("generate", onGenerate);


    return () => {
      // Clean up client event listeners
      client.off("open");
      client.off("close", onClose);
      client.off("error");
      client.off("setupcomplete");
      client.off("content", onContent);
      client.off("toolcall");
      client.off("interrupted", onInterrupted);
      client.off("turncomplete", onTurnComplete);
      client.off("audio", onAudio);
      client.off("log");

      // Clean up emitter listeners
      emitter.off("generate", onGenerate);
      // emitter.removeAllListeners(); // Or remove specific listeners if preferred

      debouncedEmitServerAudioLog.cancel();
      accumulatedTextPartsRef.current = [];
    };
  }, [client, emitter, debouncedEmitServerAudioLog]); // audioStreamerRef removed

  const connect = useCallback(async () => {
    if (!config) {
      console.error("useLiveApi: Configuration is not set before connecting.");
      emitter.emit("serverError", new Error("Configuration is not set."));
      return;
    }
    if (client.isConnected()) { // Assuming your client has an isConnected method
      console.log("useLiveApi: Already connected or connecting.");
      return;
    }
    try {
      await client.connect(config); // client.connect now takes LiveChatSessionConfig
      // setConnected(true) will be handled by the 'open' event from the client
    } catch (error) {
      console.error("useLiveApi: Connection failed", error);
      let errorMessage: Error | string;
      if (error instanceof Error) {
        errorMessage = error;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        // Fallback for other unknown types
        errorMessage = new Error(`An unknown connection error occurred: ${String(error)}`);
      }
      emitter.emit("serverError", errorMessage);
      setConnected(false); // Ensure connected is false on error
    }
  }, [client, config, emitter]);

  const disconnect = useCallback(async () => {
    client.disconnect();
    // setConnected(false) will be handled by the 'close' event
  }, [client]);


  // The on/off methods returned by the hook
  const onCallback = useCallback(<K extends EventType>(event: K, callback: LiveAPIEvents[K]) => {
    emitter.on(event, callback as (...args: any[]) => void); // Cast for EventEmitter3 if needed
  }, [emitter]);

  const offCallback = useCallback(<K extends EventType>(event: K, callback: LiveAPIEvents[K]) => {
    emitter.off(event, callback as (...args: any[]) => void); // Cast for EventEmitter3 if needed
  }, [emitter]);


  return {
    client,
    config,
    setConfig,
    connected,
    connect,
    disconnect,
    volume,
    on: onCallback,
    off: offCallback,
  };
}