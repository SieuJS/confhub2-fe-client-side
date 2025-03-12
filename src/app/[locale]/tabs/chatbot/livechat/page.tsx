// page.tsx
"use client";

import { useRef, useState } from "react";
import { LiveAPIProvider } from "../../../components/chatbot2/contexts/LiveAPIContext";
import SidePanel from "../../../components/chatbot2/side-panel/SidePanel";
import cn from "classnames";
import { Altair } from "../../../components/chatbot2/altair/Altair";

const API_KEY = "AIzaSyAV319MCiDorKNeNykl68MAzlIJk6YRz3g" as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function ChatBot2() {
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <SidePanel
          videoRef={videoRef}
          supportsVideo={true}
          onVideoStreamChange={setVideoStream}
        />
        {/* Main Content Area */}
        <div className="flex flex-col flex-grow overflow-y-auto">
          <Altair />
          <video
            className={cn("stream", {
              hidden: !videoRef.current || !videoStream,
            })}
            ref={videoRef}
            autoPlay
            playsInline
          />
        </div>
      </LiveAPIProvider>
  );
}

export default ChatBot2;