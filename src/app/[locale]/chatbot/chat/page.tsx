// import React from 'react';
import ChatBot from './ChatBot'; // Import ChatBot component

interface ChatBotPageProps {
  // Định nghĩa props cho component nếu cần
}

const ChatBotPage: React.FC<ChatBotPageProps> = () => {
  return (
    <div className="py-6 text-center text-xl">
      <div className="bg-background w-full"></div>
      <ChatBot />
    </div>
  );
};

export default ChatBotPage;