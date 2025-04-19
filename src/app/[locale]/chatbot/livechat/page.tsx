// page.tsx
"use client";

// Only import what's needed for this file: Provider, API Key config, and the new ChatUI component
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import ChatUI from "./main-layout/ChatUI"; // Import the new component

// Get API Key - Consider safer methods in production
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent`;

function ChatBotPage() { // Renamed for clarity if this is the page component
  if (typeof API_KEY !== "string") {
    console.error("NEXT_PUBLIC_GEMINI_API_KEY is not set in .env.local");
    return <div className="flex h-screen items-center justify-center text-red-600">Error: API Key for Gemini is not configured. Please check your environment variables.</div>;
  }

  return (
    <LiveAPIProvider url={uri} apiKey={API_KEY}>
      {/* ChatUI now manages the interactive state */}
      <ChatUI />
    </LiveAPIProvider>
  );
}

export default ChatBotPage;