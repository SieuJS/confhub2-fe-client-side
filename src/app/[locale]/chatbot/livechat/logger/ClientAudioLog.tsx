// src/app/[locale]/chatbot/livechat/logger/ClientAudioLog.tsx
import React from "react";
import { ClientAudioMessage } from "@/src/app/[locale]/chatbot/lib/live-chat.types"; // Updated import path
import AudioPlayer from "../AudioPlayer";

type ClientAudioLogProps = {
  message: ClientAudioMessage;
};

const ClientAudioLog: React.FC<ClientAudioLogProps> = ({ message }) => {
  const { audioData } = message.clientAudio;
  return (
    <div className="rich-log client-audio">
      {audioData ? <AudioPlayer audioData={audioData} sampleRate={16000} autoPlay={false} /> : <p className="text-sm text-inherit italic">Loading audio...</p>}
    </div>
  );
};

export default ClientAudioLog;