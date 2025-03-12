"use client";
import { useEffect, useRef, useState } from "react";
import { useLiveAPIContext } from "../contexts/LiveAPIContext";
import { useLoggerStore } from "../lib/store-logger";
import Logger from "../logger/Logger";
import { AudioRecorder } from "../lib/audio-recorder";
import { useScreenCapture } from "../hooks/useScreenCapture";
import { useWebcam } from "../hooks/useWebcam";
import ChatInput from "./ChatInput";
import useLoggerScroll from "../hooks/useLoggerScroll";
import useLoggerEvents from "../hooks/useLoggerEvents";
import useVideoFrameSender from "../hooks/useVideoFrameSender";
import useAudioRecorder from "../hooks/useAudioRecorder";
import useModelAudioResponse from "../hooks/useModelAudioResponse";
import useVolumeControl from "../hooks/useVolumeControl";
import ConnectionButton from "./ConnectionButton";
import MicButton from "./MicButton";
import MediaStreamButton from "./MediaStreamButton";
import ReactModal from 'react-modal';
import ChatIntroduction from "./ChatIntroduction"; // Import the updated component


const useVideoStreamPopup = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [modalPosition, setModalPosition] = useState({ top: 'auto', right: '1rem', bottom: '1rem', left: 'auto' });

  const openModal = (stream: MediaStream) => {
    setStream(stream);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  return { modalIsOpen, openModal, closeModal, stream, modalPosition };
};

const VideoPopup: React.FC = () => {
  const { stream, closeModal, modalIsOpen, modalPosition } = useVideoStreamPopup();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <ReactModal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      contentLabel="Video Stream"
      className={{
        base: 'fixed bg-white/90 rounded-2xl shadow-xl',
        afterOpen: '',
        beforeClose: ''
      }}
      style={{
        overlay: { backgroundColor: 'rgba(0, 0, 0, 0.25)' },
        content: {
          ...modalPosition,
          border: 'none',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      }}
      shouldCloseOnOverlayClick={false}
      closeTimeoutMS={200}
    >
      <div className="relative">
        <video ref={videoRef} autoPlay playsInline className="w-full h-full rounded-xl" style={{ width: '320px', height: '240px' }} />
        <button
          onClick={closeModal}
          className="absolute top-1 right-1 p-1 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 focus:outline-none transition-all duration-200"
          title="Close">
          ×
        </button>
      </div>
    </ReactModal>
  );
};
export default function SidePanel({
  videoRef,
  supportsVideo,
  onVideoStreamChange = () => { },
}: {
  videoRef: any;
  supportsVideo: boolean;
  onVideoStreamChange: (stream: MediaStream | null) => void;
}) {
  const { connected, client, connect, disconnect, volume, on, off } = useLiveAPIContext();
  const loggerRef = useRef<HTMLDivElement>(null);
  const { log } = useLoggerStore();

  const videoStreams = [useWebcam(), useScreenCapture()];
  const [activeVideoStream, setActiveVideoStream] = useState<MediaStream | null>(null);
  const [webcam, screenCapture] = videoStreams;
  const [inVolume, setInVolume] = useState(0);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const { openModal } = useVideoStreamPopup();
  // const [hasLog, setHasLog] = useState(false); // No longer the primary control
  const [hasInteracted, setHasInteracted] = useState(false); // New state

  // Remove hasMounted and related logic

  useEffect(() => {
    ReactModal.setAppElement(':root');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const changeStreams = (next?: { start: () => Promise<MediaStream>, stop: () => void }) => async () => {
    let newStream: MediaStream | null = null;
    if (next) {
      newStream = await next.start();
      setActiveVideoStream(newStream);
      onVideoStreamChange(newStream);

      if (supportsVideo && newStream) { // Check newStream before opening
        openModal(newStream);
      }
    } else {
      setActiveVideoStream(null);
      onVideoStreamChange(null);
      if (activeVideoStream) {
        activeVideoStream.getTracks().forEach(track => track.stop());
      }

    }
    videoStreams.filter(msr => msr !== next).forEach(msr => {
      if (msr.isStreaming) {
        msr.stop()
      }
    });

  };



  useLoggerScroll(loggerRef);
  useLoggerEvents(on, off, log);
  useVideoFrameSender(connected, activeVideoStream, client, videoRef);
  useAudioRecorder(connected, muted, audioRecorder, client, log, setInVolume);
  useModelAudioResponse(on, off, log);
  useVolumeControl(inVolume);

  const handleSendMessage = (textInput: string) => {
    if (textInput.trim() === "") {
      return;
    }
    setHasInteracted(true); // User has interacted
    client.send([{ text: textInput }]);
    log({ date: new Date(), type: "send.text", message: textInput });
    // setHasLog(true);  // Still update hasLog for the Logger
  };

  // useEffect(() => { // Simplified useEffect
  //     if (!hasMounted.current) {
  //         // Initial render:  Check the *initial* log length.
  //         hasMounted.current = true;
  //         setHasLog(log.length > 0); // If there are initial logs, hide the intro.
  //     } else {
  //         // Subsequent renders: Update based on whether the log has entries.
  //         setHasLog(log.length > 0);
  //     }
  // }, [log]); // Depend on the log.  This useEffect runs whenever the log changes.



  const handleStartVoice = () => {
    if (!connected) {
      connect();
    }
    setHasInteracted(true); // User has interacted
    setMuted(false);
  };

  const handleStartWebcam = () => {
    if (!connected) {
      connect();
    }
    setHasInteracted(true); // User has interacted
    changeStreams(webcam)();
    if (webcam.stream) {
      openModal(webcam.stream)
    }
  };

  const handleStartScreenShare = () => {
    if (!connected) {
      connect();
    }

    setHasInteracted(true);  // User has interacted
    changeStreams(screenCapture)();
    if (screenCapture.stream) {
      openModal(screenCapture.stream);
    }
  };



  return (
    <>
      <VideoPopup />
      <div className="flex flex-col h-screen bg-white text-gray-700 rounded-2xl p-2 m-4 shadow-xl">
       

        {/* Logger Area */}
        <div className="flex-grow overflow-y-auto p-5" ref={loggerRef}>
          {/* Show introduction only if NOT connected AND NOT interacted */}
          {!connected && !hasInteracted ? (
            <ChatIntroduction
              onStartVoice={handleStartVoice}
              onStartWebcam={handleStartWebcam}
              onStartScreenShare={handleStartScreenShare}
            />
          ) : (
            <Logger filter="none" /> // Show the Logger once connected or interacted
          )}
        </div>

        {/* Combined Input Area */}
        <div className="flex gap-2 rounded-full border border-gray-300 p-2 bg-gray-100 items-center">
          <ConnectionButton connected={connected} connect={connect} disconnect={disconnect} />
          <MicButton muted={muted} setMuted={setMuted} volume={volume} connected={connected} />
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
          <ChatInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </>
  );
}