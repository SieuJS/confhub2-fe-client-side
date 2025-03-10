import React from 'react';
import ChatBot from '../components/chatbot/ChatBot';
import { Altair } from "../components/chatbot/live-chat/components/altair/Altair";

// import "./page.css";
import { LiveAPIProvider } from "../components/chatbot/live-chat/contexts/LiveAPIContext";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

interface ChatBotPageProps {}

const ChatBotPage: React.FC<ChatBotPageProps> = () => {
  return (
    <div className="chatbot-page-container px-10 py-10 text-center text-2xl">
      <div className="py-14 bg-background w-full"></div>
      
      {/* Live API Provider Wrapper */}
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="chatbot-wrapper">
        <Altair />

          <ChatBot />
        </div>
      </LiveAPIProvider>
    </div>
  );
};

export default ChatBotPage;