"use client";



// //No change is needed
import { useRef, useState } from "react";
import "./chatbot2.css"; // Remove this line
import { LiveAPIProvider } from "../components/chatbot2/contexts/LiveAPIContext";
import SidePanel from "../components/chatbot2/components/side-panel/SidePanel";
import cn from "classnames";
import { Altair } from "../components/chatbot2/components/altair/Altair";

const API_KEY = "AIzaSyAV319MCiDorKNeNykl68MAzlIJk6YRz3g" as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

function ChatBot2() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  return (
    
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <div className="streaming-console">
          <SidePanel
            videoRef={videoRef}
            supportsVideo={true}
            onVideoStreamChange={setVideoStream}
          />
          <main>
            <div className="main-app-area">
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
          </main>
        </div>
      </LiveAPIProvider>
    </div>
  );
}

export default ChatBot2;