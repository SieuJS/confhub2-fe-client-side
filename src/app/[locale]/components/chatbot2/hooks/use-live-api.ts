
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MultimodalLiveAPIClientConnection,
  MultimodalLiveClient,
} from "../lib/multimodal-live-client";
import { LiveConfig, ServerAudioMessage } from "../multimodal-live-types";
import { AudioStreamer } from "../lib/audio-streamer"; // Keep
import { audioContext } from "../lib/utils";
import VolMeterWorket from "../lib/worklets/vol-meter";
import EventEmitter from "eventemitter3";
import { base64ToArrayBuffer } from "../lib/utils"; // Keep
import { debounce } from 'lodash';
import { Part } from "@google/generative-ai";

export type EventType =
  | "close"
  | "open"
  | "config"
  | "log"
  | "interrupted"
  | "audio"
  | "audioResponse"
  | "toolcall"
  | "text"
  | "serverError"
  | "generate"
  | "reset";


export type UseLiveAPIResults = {
  client: MultimodalLiveClient;
  setConfig: (config: LiveConfig) => void;
  config: LiveConfig;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
  on: (event: EventType, callback: (...args: any[]) => void) => void;
  off: (event: EventType, callback: (...args: any[]) => void) => void;
};

export function useLiveAPI({
  url,
  apiKey,
}: MultimodalLiveAPIClientConnection): UseLiveAPIResults {
  const client = useMemo(
    () => new MultimodalLiveClient({ url, apiKey }),
    [url, apiKey],
  );
  const audioStreamerRef = useRef<AudioStreamer | null>(null); // Keep

  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConfig>({
    model: "models/gemini-2.0-flash-exp",
  });
  const [volume, setVolume] = useState(0);
  const [accumulatedServerAudio, setAccumulatedServerAudio] = useState("");
  // useRef to hold the current audio data.  Refs persist across renders
  // without causing re-renders, and they don't form stale closures.
  const accumulatedServerAudioRef = useRef("");

  const emitter = useRef(new EventEmitter()).current;


  // Debounced log emission.  Crucially, this function now takes the
  // audio data as an argument.  This avoids the stale closure problem.
  const debouncedEmitServerAudioLog = useCallback(
    debounce((audioData: string) => {
      const serverAudioMessage: ServerAudioMessage = {
        serverAudio: { audioData },
      };
      emitter.emit("log", {
        date: new Date(),
        type: "receive.serverAudio",
        message: serverAudioMessage,
      });
    }, 500),
    [emitter] // Only depends on 'emitter'.
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
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onClose = () => {
      setConnected(false);
      emitter.emit("close");
      setAccumulatedServerAudio("");
      accumulatedServerAudioRef.current = ""; // Clear the ref
      debouncedEmitServerAudioLog.cancel();

    };

    const stopAudioStreamer = () => audioStreamerRef.current?.stop();

    const onAudio = (data: ArrayBuffer) => {
      audioStreamerRef.current?.addPCM16(new Uint8Array(data));

      const audioDataBase64 = btoa(String.fromCharCode(...new Uint8Array(data)));
      console.log("audioDataBase64 (first 50 chars):", audioDataBase64.substring(0, 50)); // Add this line

      // Update the ref *immediately*.
      accumulatedServerAudioRef.current += audioDataBase64;
      setAccumulatedServerAudio((prev) => prev + audioDataBase64); //keep state update

      // Call the debounced function with the *current* data from the ref.
      debouncedEmitServerAudioLog(accumulatedServerAudioRef.current);
    };


    const onGenerate = (data: any) => {
        if (data.responseModalities && data.responseModalities.includes("audio")) {
          if (
            data.multimodalResponse &&
            data.multimodalResponse.parts &&
            data.multimodalResponse.parts.length
          ) {
            data.multimodalResponse.parts.forEach((part: Part) => {
              if (part.inlineData) {
                  // Still emit audioResponse for complete audio
                emitter.emit("audioResponse", {
                  data: part.inlineData.data,
                });
              }
            });
          }
        }
      emitter.emit("generate", data);
    };

    const onInterrupted = () => {
      stopAudioStreamer();
      emitter.emit("interrupted");
      setAccumulatedServerAudio("");
      accumulatedServerAudioRef.current = ""; // Clear the ref.
      debouncedEmitServerAudioLog.cancel(); // Cancel debounced calls.

    };

      const onTurnComplete = () => {
          emitter.emit("turncomplete");
          // debouncedEmitServerAudioLog(accumulatedServerAudioRef.current); // Force emit on turn complete.
          // setAccumulatedServerAudio("");
          // accumulatedServerAudioRef.current = ""; // Clear the ref.
          // debouncedEmitServerAudioLog.cancel();
      }


    client.on("close", onClose);
    client.on("interrupted", onInterrupted);
    client.on("audio", onAudio);
    client.on("log", (logData) => {
      emitter.emit("log", logData);
    });
    client.on("toolcall", (toolCallData) => {
      emitter.emit("toolcall", toolCallData);
    });
    client.on("setupcomplete", () => {
      emitter.emit("setupcomplete");
    });
    client.on("turncomplete",onTurnComplete); //NEW: on turn complete
    client.on("open", () => emitter.emit("open"));

    emitter.on("generate", onGenerate);

    return () => {
      client.off("close", onClose);
      client.off("interrupted", onInterrupted);
      client.off("audio", onAudio);
      client.off("log", (logData) => {
        emitter.emit("log", logData);
      });
      client.off("toolcall", (toolCallData) => {
        emitter.emit("toolcall", toolCallData);
      });
      client.off("setupcomplete", () => {
        emitter.emit("setupcomplete");
      });
      client.off("turncomplete", onTurnComplete); // NEW: on turn complete.
      client.off("open", () => emitter.emit("open"));

      emitter.off("generate", onGenerate);
      debouncedEmitServerAudioLog.cancel(); // Cancel any pending debounced calls.
    };
  }, [client, audioStreamerRef, emitter, debouncedEmitServerAudioLog]); // No accumulatedServerAudio here

  const connect = useCallback(async () => {
    if (!config) {
      throw new Error("config has not been set");
    }
    client.disconnect();
    await client.connect(config);
    setConnected(true);
  }, [client, setConnected, config]);

  const disconnect = useCallback(async () => {
    client.disconnect();
    setConnected(false);
  }, [setConnected, client]);

  return {
    client,
    config,
    setConfig,
    connected,
    connect,
    disconnect,
    volume,
    on: (event: EventType, callback: (...args: any[]) => void) => {
      emitter.on(event, callback);
    },
    off: (event: EventType, callback: (...args: any[]) => void) => {
      emitter.off(event, callback);
    },
  };
}


