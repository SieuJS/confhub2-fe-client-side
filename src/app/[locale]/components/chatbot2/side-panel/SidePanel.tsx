
// SidePanel.tsx (Simplified useAudioRecorder)
"use client";
import { useEffect, useRef, useState, memo } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { useLoggerStore } from "../lib/store-logger";
import Logger from "../logger/Logger";
import "./side-panel.css";
import { AudioRecorder } from "../lib/audio-recorder";
import { useScreenCapture } from "../hooks/use-screen-capture";
import { useWebcam } from "../hooks/use-webcam";
import ConnectionButton from "./ConnectionButton";
import MicButton from "./MicButton";
import MediaStreamButton from "./MediaStreamButton";
import TextInputArea from "./TextInputArea";
import VideoRenderer from "./VideoRenderer";

export default function SidePanel({
  videoRef,
  supportsVideo,
  onVideoStreamChange = () => {},
}: {
  videoRef: any;
  supportsVideo: boolean;
  onVideoStreamChange: (stream: MediaStream | null) => void;
}) {
  const { connected, client, connect, disconnect, volume, on, off } =
    useLiveAPIContext();
  const loggerRef = useRef<HTMLDivElement>(null);
  const { log } = useLoggerStore();

  const videoStreams = [useWebcam(), useScreenCapture()];
  const [activeVideoStream, setActiveVideoStream] = useState<MediaStream | null>(
    null,
  );
  const [webcam, screenCapture] = videoStreams;
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);

    const changeStreams = (next?: {start: () => Promise<MediaStream>, stop: () => void}) => async () => {
    if (next) {
      const mediaStream = await next.start();
      setActiveVideoStream(mediaStream);
      onVideoStreamChange(mediaStream);
    } else {
      setActiveVideoStream(null);
      onVideoStreamChange(null);
    }
    videoStreams.filter((msr) => msr !== next).forEach((msr) => msr.stop());
  };

  // Effects
  useLoggerScroll(loggerRef);
  useLoggerEvents(on, off, log);
  useVideoFrameSender(connected, activeVideoStream, client, videoRef);
  useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume); // Simplified
  useModelAudioResponse(on, off, log);
  useVolumeControl(inVolume);

  const handleSubmit = (textInput: string) => {
    if (textInput.trim() === "") {
      return;
    }
    client.send([{ text: textInput }]);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 border-r border-gray-600 text-gray-200 font-sans text-sm leading-6">
      <VideoRenderer ref={videoRef} />
      <header className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <h2 className="font-googleSans text-xl font-medium leading-4">
          Console
        </h2>
      </header>

      <div className="flex-grow overflow-x-hidden overflow-y-auto w-1/4" ref={loggerRef}>
        <Logger filter="none" />
      </div>

      <div className="flex flex-col p-4 border-t border-gray-800 bg-gray-900">
        <div className="flex gap-2.5 mb-4">
          <ConnectionButton
            connected={connected}
            connect={connect}
            disconnect={disconnect}
          />
          <MicButton
            muted={muted}
            setMuted={setMuted}
            volume={volume}
            connected={connected}
          />
          {supportsVideo && (
            <>
              <MediaStreamButton
                isStreaming={screenCapture.isStreaming}
                start={changeStreams(screenCapture)}
                stop={changeStreams()}
                onIcon="cancel_presentation"
                offIcon="present_to_all"
              />
              <MediaStreamButton
                isStreaming={webcam.isStreaming}
                start={changeStreams(webcam)}
                stop={changeStreams()}
                onIcon="videocam_off"
                offIcon="videocam"
              />
            </>
          )}
        </div>

        <TextInputArea connected={connected} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}

// Custom Hooks
const useLoggerScroll = (loggerRef: React.RefObject<HTMLDivElement>) => {
  const loggerLastHeightRef = useRef<number>(-1);
  useEffect(() => {
    if (loggerRef.current) {
      const el = loggerRef.current;
      const scrollHeight = el.scrollHeight;
      if (scrollHeight !== loggerLastHeightRef.current) {
        el.scrollTop = scrollHeight;
        loggerLastHeightRef.current = scrollHeight;
      }
    }
  }, [loggerRef, loggerLastHeightRef]);
};

// --- Generic Event Hook ---
const useLoggerEvents = <E extends string>(
  on: (event: E, callback: (...args: any[]) => void) => void,
  off: (event: E, callback: (...args: any[]) => void) => void,
  log: (entry: any) => void,
) => {
  useEffect(() => {
    on("log" as E, log); // Cast to E
    return () => {
      off("log" as E, log); // Cast to E
    };
  }, [on, off, log]);
};

const useVideoFrameSender = (
  connected: boolean,
  activeVideoStream: MediaStream | null,
  client: any,
  videoRef: any,
) => {
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = activeVideoStream;
    }

    let timeoutId = -1;

    function sendVideoFrame() {
      const video = videoRef.current;
      const canvas = renderCanvasRef.current;
      if (!video || !canvas) {
        return;
      }
      const ctx = canvas.getContext("2d")!;
      canvas.width = video.videoWidth * 0.25;
      canvas.height = video.videoHeight * 0.25;
      if (canvas.width + canvas.height > 0) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 1.0);
        const data = base64.slice(base64.indexOf(",") + 1, Infinity);
        client.sendRealtimeInput([{ mimeType: "image/jpeg", data }]);
      }
      if (connected) {
        timeoutId = window.setTimeout(sendVideoFrame, 1000 / 0.5);
      }
    }
    if (connected && activeVideoStream !== null) {
      requestAnimationFrame(sendVideoFrame);
    }
    return () => {
      clearTimeout(timeoutId);
    };
  }, [connected, activeVideoStream, client, videoRef, renderCanvasRef]);
};

// Helper function to concatenate Uint8Arrays
function concatenateUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  if (arrays.length === 1) {
    return arrays[0];
  }
  const totalLength = arrays.reduce((acc, val) => acc + val.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

const useAudioRecorder = (
  connected: boolean,
  muted: boolean,
  audioRecorder: AudioRecorder,
  client: any,
  log: (entry: any) => void,
  setInVolume: (volume: number) => void,
) => {
  useEffect(() => {
    if (connected && !muted && audioRecorder) {
      let audioChunks: Uint8Array[] = []; // Store binary chunks

      const onData = (base64: string) => {
        // console.log("onData called!", base64.substring(0, 20)); // Keep for debugging
        try {
            // Decode the base64 string to a Uint8Array
            const binaryString = atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            audioChunks.push(bytes);
        } catch (error) {
            console.error("Error decoding base64 chunk in onData", error)
        }

        client.sendRealtimeInput([
          {
            mimeType: "audio/pcm;rate=16000",
            data: base64,
          },
        ]);
      };

      const onStop = () => {
          try{
            // Concatenate the binary chunks
            const combinedBinary = concatenateUint8Arrays(audioChunks);

            // Re-encode the combined binary data to base64
            let binary = "";
            const len = combinedBinary.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(combinedBinary[i]);
            }
            const combinedBase64 = window.btoa(binary);

            // Log the correctly padded base64 data
            if (combinedBase64.length > 0) {
              log({
                date: new Date(),
                type: "send.clientAudio",
                message: { clientAudio: { audioData: combinedBase64 } },
              });
            }

          } catch (error){
            console.error("Error encoding base64 in onStop", error)
          }
        audioChunks = []; // Reset for the next recording
      };

      audioRecorder.on("data", onData).on("volume", setInVolume);
      audioRecorder.on("stop", onStop);
      audioRecorder.start().catch(console.error);

      return () => {
        audioRecorder.stop();
        audioRecorder.off("data", onData).off("volume", setInVolume);
        audioRecorder.off("stop", onStop);
      };
    }
  }, [connected, client, muted, audioRecorder, log, setInVolume]);
};


// --- Generic Event Hook ---
const useModelAudioResponse = <E extends string>(
  on: (event: E, callback: (...args: any[]) => void) => void,
  off: (event: E, callback: (...args: any[]) => void) => void,
  log: (entry: any) => void,
) => {
  useEffect(() => {
    const onAudioResponse = (audioResponse: any) => {
      log({
        date: new Date(),
        type: "receive.serverAudio",
        message: { serverAudio: { audioData: audioResponse.data } },
      });
    };

    on("audioResponse" as E, onAudioResponse);  // Cast to E
    return () => {
      off("audioResponse" as E, onAudioResponse); // Cast to E
    };
  }, [on, off, log]);
};

const useVolumeControl = (inVolume: number) => {
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--volume",
      `${Math.max(5, Math.min(inVolume * 200, 8))}px`,
    );
  }, [inVolume]);
};