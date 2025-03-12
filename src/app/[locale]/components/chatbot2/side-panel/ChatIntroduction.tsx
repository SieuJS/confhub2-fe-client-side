// ChatIntroduction.tsx
import React from 'react';
import { BsMic, BsCameraVideo, BsDisplay } from 'react-icons/bs';

interface ChatIntroductionProps {
  onStartVoice: () => void;
  onStartWebcam: () => void;
  onStartScreenShare: () => void;
}

const ChatIntroduction: React.FC<ChatIntroductionProps> = ({
  onStartVoice,
  onStartWebcam,
  onStartScreenShare,
}) => {
  return (
    <div
      id="ChatIntroduction"
      className="flex h-full flex-col items-center justify-center"
    >
      <h2 className="mb-4 text-7xl font-bold text-gray-800">
        Talk with Gemini live
      </h2>
      <p className="mb-20 text-center text-gray-400">
        Interact with Gemini using text, voice, video, or screen sharing.
      </p>

      <div className="mx-auto w-full max-w-3xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Option 1: Talk to Gemini */}
          <button
            className="flex flex-col items-center rounded-lg bg-gray-800 p-6 shadow-md transition-colors duration-200 hover:bg-gray-700"
            onClick={onStartVoice}
            type="button"
          >
            <BsMic className="mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-200">
              Talk to Gemini
            </h3>
            <p className="text-sm text-center text-gray-400">
              Start a real-time conversation using your microphone.
            </p>
          </button>

          {/* Option 2: Show Gemini */}
          <button
            className="flex flex-col items-center rounded-lg bg-gray-800 p-6 shadow-md transition-colors duration-200 hover:bg-gray-700"
            onClick={onStartWebcam}
            type="button"
          >
            <BsCameraVideo className="mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-200">
              Show Gemini
            </h3>
            <p className="text-sm text-center text-gray-400">
              Use your webcam to share what you're looking at and get
              real-time feedback.
            </p>
          </button>

          {/* Option 3: Share your screen */}
          <button
            className="flex flex-col items-center rounded-lg bg-gray-800 p-6 shadow-md transition-colors duration-200 hover:bg-gray-700"
            onClick={onStartScreenShare}
            type="button"
          >
            <BsDisplay className="mb-4 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-200">
              Share your screen
            </h3>
            <p className="text-sm text-center text-gray-400">
              Share your screen to show Gemini what you're working on.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatIntroduction;