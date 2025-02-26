import React from 'react';
import Image from 'next/image';
import ChatBot from '../components/ChatBot'; // Import ChatBot component

interface ChatBotPageProps {
  // Định nghĩa props cho component nếu cần
}

const ChatBotPage: React.FC<ChatBotPageProps> = () => {
  return (
    <div className="px-10 py-10 text-center text-2xl">
      <div className="py-14 bg-background w-full"></div>
      <ChatBot />
    </div>
  );
};

export default ChatBotPage;