import React from 'react';
import { BsMic } from 'react-icons/bs';

interface ChatIntroductionProps {
  onStartVoice: () => void;
}

const ChatIntroduction: React.FC<ChatIntroductionProps> = ({
  onStartVoice,

}) => {
  return (
    <div
      id="ChatIntroduction"
      className="flex h-full flex-col items-center justify-center"
    >
      <h2 className="mb-4 text-4xl font-bold text-gray-800"> {/* Reduced heading size */}
        Live Chat with Our Chatbot
      </h2>
      <p className="mb-12 text-xl text-center text-gray-600"> {/* Reduced text size and changed color */}
        Engage in a real-time conversation with our chatbot using voice.
      </p>
    </div>
  );
};

export default ChatIntroduction;