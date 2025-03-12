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
      <h2 className="mb-4 text-5xl font-bold text-gray-800"> {/* Reduced heading size */}
        Live Chat with Our Chatbot
      </h2>
      <p className="mb-12 text-xl text-center text-gray-600"> {/* Reduced text size and changed color */}
        Engage in a real-time conversation with our chatbot using voice, video, or screen sharing.
      </p>

      <div className="mx-auto w-full max-w-3xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Option 1: Voice Chat */}
          <button
            className="flex flex-col items-center rounded-lg bg-gray-200 p-6 shadow-md transition-colors duration-200 hover:bg-gray-300"
            onClick={onStartVoice}
            type="button"
          >
            <BsMic className="mb-4 text-3xl text-blue-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Voice Chat
            </h3>
            <p className="text-sm text-center text-gray-900">
              Have a real-time voice conversation with the chatbot.
            </p>
          </button>

          {/* Option 2: Video Chat */}
          <button
            className="flex flex-col items-center rounded-lg bg-gray-200 p-6 shadow-md transition-colors duration-200 hover:bg-gray-300"
            onClick={onStartWebcam}
            type="button"
          >
            <BsCameraVideo className="mb-4 text-3xl text-blue-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Video Chat
            </h3>
            <p className="text-sm text-center text-gray-900">
              Start a video call and interact with the chatbot face-to-face.
            </p>
          </button>

          {/* Option 3: Screen Share */}
          <button
            className="flex flex-col items-center rounded-lg bg-gray-200 p-6 shadow-md transition-colors duration-200 hover:bg-gray-300"
            onClick={onStartScreenShare}
            type="button"
          >
            <BsDisplay className="mb-4 text-3xl text-blue-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Screen Share
            </h3>
            <p className="text-sm text-center text-gray-900">
              Share your screen for interactive discussions and assistance.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatIntroduction;