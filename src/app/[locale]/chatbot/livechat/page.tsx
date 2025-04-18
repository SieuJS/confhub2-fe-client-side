// page.tsx
"use client";

// Only import what's needed for this file: Provider, API Key config, and the new ChatUI component
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import ChatUI from "./side-panel/ChatUI"; // Import the new component


// --- BEGIN: Thêm định nghĩa kiểu dữ liệu (Giữ nguyên) ---
export type OutputModality = "text" | "audio";
export type PrebuiltVoice = "Puck" | "Charon" | "Kore" | "Fenrir";
// --- END: Thêm định nghĩa kiểu dữ liệu ---

// Lấy API Key - Cân nhắc sử dụng biến môi trường an toàn hơn trong thực tế
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
   console.error("Vui lòng đặt NEXT_PUBLIC_GEMINI_API_KEY trong .env.local");
   // You might want to render an error message or a fallback UI here
   // return <div>Error: API Key is not set.</div>; // Example fallback
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function ChatBot2() {
  // All state and rendering logic dependent on LiveAPIProvider is now inside ChatUI.
  // This component's only job is to provide the context and render the main UI component.

   if (typeof API_KEY !== "string") {
       return <div>Error: API Key for Gemini is not configured. Please check your environment variables.</div>;
   }

  return (
    <LiveAPIProvider url={uri} apiKey={API_KEY}>
      {/* Render the main UI component which now uses the hooks */}
      <ChatUI />
    </LiveAPIProvider>
  );
}

export default ChatBot2;