import React from 'react';
import Image from 'next/image';
import ChatBot from '../components/chatbot/ChatBot'; // Import ChatBot component

interface ChatBotPageProps {
  // Định nghĩa props cho component nếu cần
}

const ChatBotPage: React.FC<ChatBotPageProps> = () => {
  return (
    <div className="bg-black text-white h-screen flex flex-col justify-center items-center overflow-hidden relative">
      {/* Background Design */}
      <div className="absolute inset-0 z-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2000 1000"
          preserveAspectRatio="xMidYMid slice"
          className="w-full h-full"
        >
          <defs>
            <pattern
              id="grid-pattern"
              width="100"
              height="100"
              patternUnits="userSpaceOnUse"
            >
              <line x1="0" y1="0" x2="100" y2="0" stroke="#1e3a8a" strokeWidth="2" />
              <line x1="0" y1="0" x2="0" y2="100" stroke="#1e3a8a" strokeWidth="2" />
              <circle cx="50" cy="50" r="20" fill="none" stroke="#1e3a8a" strokeWidth="2" />
              <rect x="20" y="20" width="30" height="30" fill="#1e3a8a" opacity="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <h1 className="text-6xl md:text-8xl font-bold mb-4">The next era <br /> of Gemini</h1>
        <p className="text-lg mb-8">Gemini 2.0 is our most capable AI model yet, built for the agentic era</p>
        <div className="flex justify-center gap-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Learn more
          </button>

          <button className="border border-white hover:border-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center">
            Chat with Gemini <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;