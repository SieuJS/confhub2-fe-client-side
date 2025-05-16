import React from "react";
import { ClientAudioMessage } from "../multimodal-live-types";
import AudioPlayer from "../AudioPlayer"; // Assuming AudioPlayer is styled or unstyled but fits well

type ClientAudioLogProps = {
  message: ClientAudioMessage;
};

const ClientAudioLog: React.FC<ClientAudioLogProps> = ({ message }) => {
  const { audioData } = message.clientAudio;
  // The "rich-log client-audio" classes are kept if they serve a non-visual purpose or specific fine-tuning.
  // Otherwise, they can be removed if LogEntry's bubble is sufficient.
  // We assume AudioPlayer is designed to fit within a padded container.
  return (
    <div className="rich-log client-audio"> {/* Consider if these classes are still needed */}
      {audioData ? <AudioPlayer audioData={audioData} sampleRate={16000} autoPlay={false} /> : <p className="text-sm text-inherit italic">Loading audio...</p>}
    </div>
  );
};

export default ClientAudioLog;