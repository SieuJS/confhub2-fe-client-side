// SidePanel.tsx
"use client";
import cn from "classnames";
import { useEffect, useRef, useState, memo } from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext"; // Use context
import { useLoggerStore } from "../../lib/store-logger";
import Logger from "../logger/Logger";
import "./side-panel.css"; //  Keep this for any CSS that can't be easily Tailwind-ified, if any.
import { AudioRecorder } from "../../lib/audio-recorder";
import AudioPulse from "../audio-pulse/AudioPulse";
import { UseMediaStreamResult } from "../../hooks/use-media-stream-mux";
import { useScreenCapture } from "../../hooks/use-screen-capture";
import { useWebcam } from "../../hooks/use-webcam";

type MediaStreamButtonProps = {
  isStreaming: boolean;
  onIcon: string;
  offIcon: string;
  start: () => Promise<any>;
  stop: () => any;
};

const MediaStreamButton = memo(
  ({ isStreaming, onIcon, offIcon, start, stop }: MediaStreamButtonProps) => (
    <button
      className="flex items-center justify-center w-12 h-12 rounded-2xl border border-transparent text-xl text-gray-400 bg-gray-800 hover:bg-gray-700 hover:text-gray-100 transition-all duration-200 ease-in-out focus:outline-2 focus:outline-gray-200 focus:outline-offset-2 select-none"
      onClick={isStreaming ? stop : start}
    >
      <span className="material-symbols-outlined">
        {isStreaming ? onIcon : offIcon}
      </span>
    </button>
  ),
);

const ConnectionButton: React.FC<{
  connected: boolean;
  connect: () => void;
  disconnect: () => void;
}> = ({ connected, connect, disconnect }) => (
  <button
    className={cn(
      "flex items-center justify-center w-12 h-12 rounded-2xl border border-transparent text-xl transition-all duration-200 ease-in-out focus:outline-2 focus:outline-offset-2 select-none",
      {
        "bg-blue-800 text-blue-500 hover:bg-blue-600 hover:border-blue-500": connected,
        "bg-blue-500 text-gray-900 hover:bg-blue-400 focus:outline-gray-200": !connected,
      },
    )}
    onClick={connected ? disconnect : connect}
  >
    <span className="material-symbols-outlined filled">
      {connected ? "pause" : "play_arrow"}
    </span>
  </button>
);

const MicButton: React.FC<{
  muted: boolean;
  setMuted: (muted: boolean) => void;
  volume: number;
  connected: boolean;
}> = ({ muted, setMuted, volume, connected }) => (
  <div className="flex items-center gap-2">
    <button
      className={cn(
        "flex items-center justify-center w-12 h-12 rounded-2xl text-xl transition-all duration-200 ease-in select-none relative z-10",
        {
          "bg-red-600 text-black hover:bg-red-400 focus:outline-2 focus:outline-red-500 focus:border-gray-800": !muted,
          "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-100 focus:outline-2 focus:outline-gray-200 focus:border-transparent": muted,
        },
      )}
      onClick={() => setMuted(!muted)}
    >
      <span className="material-symbols-outlined filled">
        {muted ? "mic_off" : "mic"}
      </span>
      {!muted && (
        <div
          className="absolute inset-0 rounded-2xl bg-red-500 opacity-35 z-0 pointer-events-none transition-all duration-200 ease-in-out"
          style={{
            top: `calc(var(--volume) * -1)`,
            left: `calc(var(--volume) * -1)`,
            width: `calc(100% + var(--volume) * 2)`,
            height: `calc(100% + var(--volume) * 2)`,
          }}
        />
      )}
    </button>
    <div className="w-12 h-12 flex items-center justify-center">
      <AudioPulse volume={volume} active={connected} hover={false} />
    </div>
  </div>
);

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
  const loggerLastHeightRef = useRef<number>(-1);
  const { log } = useLoggerStore();
  const [userAudioData, setUserAudioData] = useState<string | null>(null);
  const [modelAudioData, setModelAudioData] = useState<string | null>(null);

  const [textInput, setTextInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const videoStreams = [useWebcam(), useScreenCapture()];
  const [activeVideoStream, setActiveVideoStream] = useState<MediaStream | null>(
    null,
  );
  const [webcam, screenCapture] = videoStreams;
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);

  const changeStreams = (next?: UseMediaStreamResult) => async () => {
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

  useEffect(() => {
    on("log", log);
    return () => {
      off("log", log);
    };
  }, [on, off, log]);

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
      setUserAudioData(fullAudioData);
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

  useEffect(() => {
    const onAudioResponse = (audioResponse: any) => {
      setModelAudioData(audioResponse.data);
      log({
        date: new Date(),
        type: "receive.serverAudio",
        message: { serverAudio: { audioData: audioResponse.data } },
      });
    };

    on("audioResponse", onAudioResponse);
    return () => {
      off("audioResponse", onAudioResponse);
    };
  }, [on, off, log]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--volume",
      `${Math.max(5, Math.min(inVolume * 200, 8))}px`,
    );
  }, [inVolume]);

  const handleSubmit = () => {
    if (textInput.trim() === "") {
      return;
    }
    client.send([{ text: textInput }]);
    setTextInput("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 border-r border-gray-600 text-gray-200 font-sans text-sm leading-6">
      <canvas style={{ display: "none" }} ref={renderCanvasRef} />
      <header className="flex items-center justify-between px-5 py-3 border-b border-gray-800">
        <h2 className="font-googleSans text-xl font-medium leading-4">
          Console
        </h2>
      </header>

      <div
        className="flex-grow overflow-x-hidden overflow-y-auto w-1/4"
        ref={loggerRef}
      >
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

        <div
          className={cn("flex items-center p-2 border border-gray-800 rounded-lg", {
            "opacity-50 cursor-not-allowed": !connected,
          })}
        >
          <textarea
            className="flex-grow bg-transparent border-none text-gray-200 text-sm resize-none h-10 py-2 px-0 outline-none placeholder-gray-500 disabled:cursor-not-allowed"
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }
            }}
            onChange={(e) => setTextInput(e.target.value)}
            value={textInput}
            placeholder="Type something..."
            disabled={!connected}
          />
          <button
            className="material-symbols-outlined filled p-2 text-gray-500 rounded cursor-pointer disabled:cursor-not-allowed disabled:text-gray-700 hover:text-gray-200"
            onClick={handleSubmit}
            disabled={!connected}
          >
            send
          </button>
        </div>
      </div>
    </div>
  );
}
