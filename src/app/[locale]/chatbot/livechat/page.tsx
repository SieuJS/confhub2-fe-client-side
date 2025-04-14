// page.tsx
"use client";

import { useRef, useState } from "react";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import SidePanel from "./side-panel/SidePanel"; // Giả sử bạn có component này
import cn from "classnames";
import { Altair } from "./altair/Altair";

// --- BEGIN: Thêm định nghĩa kiểu dữ liệu ---
export type OutputModality = "text" | "audio";
export type PrebuiltVoice = "Puck" | "Charon" | "Kore" | "Fenrir";
// --- END: Thêm định nghĩa kiểu dữ liệu ---

const API_KEY = "AIzaSyAV319MCiDorKNeNykl68MAzlIJk6YRz3g" as string; // Thay thế bằng API Key của bạn hoặc lấy từ .env
if (typeof API_KEY !== "string") {
  throw new Error("Vui lòng đặt REACT_APP_GEMINI_API_KEY trong .env hoặc trực tiếp trong code");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function ChatBot2() {

  // --- BEGIN: Thêm State cho lựa chọn output ---
  const [outputModality, setOutputModality] = useState<OutputModality>("text");
  const [selectedVoice, setSelectedVoice] = useState<PrebuiltVoice>("Puck"); // Giọng mặc định
  // --- END: Thêm State cho lựa chọn output ---

  return (
    <div className="px-10 max-h-3/4 flex flex-col h-screen"> {/* Điều chỉnh layout nếu cần */}
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        {/* Side Panel - Truyền state và setters xuống */}
        <SidePanel
          // --- BEGIN: Truyền props cho SidePanel ---
          currentModality={outputModality}
          onModalityChange={setOutputModality}
          currentVoice={selectedVoice}
          onVoiceChange={setSelectedVoice}
          availableVoices={["Puck", "Charon", "Kore", "Fenrir"]} // Danh sách giọng nói
        // --- END: Truyền props cho SidePanel ---
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-grow overflow-y-auto ml-64"> {/* Giả sử SidePanel có width cố định */}
          {/* Truyền state lựa chọn xuống Altair */}
          <Altair outputModality={outputModality} selectedVoice={selectedVoice} />

          {/* Khu vực hiển thị chat hoặc nội dung khác có thể đặt ở đây */}
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default ChatBot2;