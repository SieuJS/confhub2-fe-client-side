// src/app/[locale]/chatbot/livechat/logger/ServerAudioLog.tsx
import React from "react";
import { ServerAudioMessage } from "@/src/app/[locale]/chatbot/lib/live-chat.types"; // Updated import path
import AudioPlayer from "../AudioPlayer";

type ServerAudioLogProps = {
  message: ServerAudioMessage;
};

const ServerAudioLog: React.FC<ServerAudioLogProps> = ({ message }) => {
  const { audioData } = message.serverAudio;
  return (
    <div className="rich-log server-audio">
      {audioData ? (
        <AudioPlayer
          key={audioData}
          audioData={audioData}
          sampleRate={24000}
          autoPlay={false}
        />
      ) : (
        <p className="text-sm text-inherit italic">Loading audio...</p>
      )}
    </div>
  );
};

export default ServerAudioLog;