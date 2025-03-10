"use client";
import cn from "classnames";
import { useEffect, useRef, useState, memo, ReactNode } from "react";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { useLoggerStore } from "../../lib/store-logger";
import Logger, { LoggerFilterType } from "../logger/Logger";
import "./side-panel.css";
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
    <button className="action-button" onClick={isStreaming ? stop : start}>
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
    className={cn("action-button", "connect-toggle", { connected })}
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
  <div className="mic-controls">
    <button
      className={cn("action-button", "mic-button")}
      onClick={() => setMuted(!muted)}
    >
      <span className="material-symbols-outlined filled">
        {muted ? "mic_off" : "mic"}
      </span>
    </button>
    <div className="audio-pulse-container">
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
  const { connected, client, connect, disconnect, volume } = useLiveAPIContext();
  const loggerRef = useRef<HTMLDivElement>(null);
  const loggerLastHeightRef = useRef<number>(-1);
  const { log, logs } = useLoggerStore();

  const [textInput, setTextInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const videoStreams = [useWebcam(), useScreenCapture()];
  const [activeVideoStream, setActiveVideoStream] = useState<MediaStream | null>(null);
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
  }, [logs]);

  useEffect(() => {
    client.on("log", log);
    return () => {
      client.off("log", log);
    };
  }, [client, log]);

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
  }, [connected, activeVideoStream, client, videoRef]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: "audio/pcm;rate=16000",
          data: base64,
        },
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on("data", onData).on("volume", setInVolume).start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off("data", onData).off("volume", setInVolume);
    };
  }, [connected, client, muted, audioRecorder]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--volume",
      `${Math.max(5, Math.min(inVolume * 200, 8))}px`,
    );
  }, [inVolume]);

  const handleSubmit = () => {
    if (textInput.trim() === "") {
      // Prevent sending empty messages
      return;
    }
    client.send([{ text: textInput }]);
    setTextInput("");
    if (inputRef.current) {
      inputRef.current.value = ""; // Use .value for textarea
    }
  };

  return (
    <div className="side-panel">
      <canvas style={{ display: "none" }} ref={renderCanvasRef} />
      <header className="side-panel-header">
        <h2>Console</h2>
      </header>

      <div className="side-panel-container" ref={loggerRef}>
        <Logger filter="none" />
      </div>

      <div className="controls-container">
        <div className="media-controls">
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

        <div className={cn("input-container", { disabled: !connected })}>
          <textarea
            className="input-area"
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
            className="send-button material-symbols-outlined filled"
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
