// SidePanel.tsx (Main Component)
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
  useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume);
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

const useAudioRecorder = (
  connected: boolean,
  muted: boolean,
  audioRecorder: AudioRecorder,
  client: any,
  log: (entry: any) => void,
  setInVolume: (volume: number) => void,
  // Removed: setUserAudioData: (data: string | null) => void,  // No longer passed
) => {
  // Hàm gửi realtime audio từ recorder
  const onData = (base64: string) => {
    client.sendRealtimeInput([
      {
        mimeType: "audio/pcm;rate=16000",
        data: base64,
      },
    ]);
  };

  // Khi recorder phát hiện hết im lặng, tổng hợp audio từ các chunk đã nhận được
  const onStopRecording = (recorder: AudioRecorder) => {
    let fullAudioData = "";
    const combineAudioChunks = (chunkBase64: string) => {
      fullAudioData += chunkBase64;
    };

    // Tạm thời tắt realtime gửi dữ liệu
    recorder.off("data", onData);
    // Đăng ký nhận lại dữ liệu để cộng dồn
    recorder.on("data", combineAudioChunks);

    setTimeout(() => {
      recorder.off("data", combineAudioChunks);
      // Khôi phục gửi realtime cho lần thu tiếp theo
      recorder.on("data", onData);
      // setUserAudioData(fullAudioData); // Removed the call
      log({
        date: new Date(),
        type: "send.clientAudio",
        message: { clientAudio: { audioData: fullAudioData } },
      });
    }, 500);
  };

  useEffect(() => {
    if (connected && !muted && audioRecorder) {
      audioRecorder.on("data", onData).on("volume", setInVolume);
      // Start recording có tích hợp VAD để phát hiện khi người dùng ngừng nói
      audioRecorder.start();
      audioRecorder.on("stop", (recorder) => onStopRecording(recorder));
    } else {
      audioRecorder.stop();
      audioRecorder.off("stop", (recorder) => onStopRecording(recorder));
    }
    return () => {
      audioRecorder.off("data", onData).off("volume", setInVolume);
      audioRecorder.off("stop", (recorder) => onStopRecording(recorder));
    };
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