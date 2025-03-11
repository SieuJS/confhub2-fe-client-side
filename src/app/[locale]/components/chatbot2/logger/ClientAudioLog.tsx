// ClientAudioLog.tsx
import React from "react";
import { ClientAudioMessage } from "../multimodal-live-types"; // Correct import
import AudioPlayer from "../audio-player/AudioPlayer";

type ClientAudioLogProps = {
  message: ClientAudioMessage;
};

const ClientAudioLog: React.FC<ClientAudioLogProps> = ({ message }) => {
  const { audioData } = message.clientAudio;
  return (
    <div className="rich-log client-audio">
      {audioData ? <AudioPlayer audioData={audioData} /> : <p>Loading audio...</p>}
    </div>
  );
};

export default ClientAudioLog;