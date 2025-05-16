import React from "react"; // Added React import
import { ServerAudioMessage } from "../multimodal-live-types";
import AudioPlayer from "../AudioPlayer"; // Assuming AudioPlayer is styled or unstyled but fits well

type ServerAudioLogProps = {
  message: ServerAudioMessage;
};

const ServerAudioLog: React.FC<ServerAudioLogProps> = ({ message }) => {
  const { audioData } = message.serverAudio;
  // Similar to ClientAudioLog, "rich-log server-audio" can be kept or removed.
  return (
    <div className="rich-log server-audio"> {/* Consider if these classes are still needed */}
      {audioData ? (
        <AudioPlayer
          key={audioData} // Using audioData as key might cause re-renders if it's a new object each time. Consider a more stable key if issues arise.
          audioData={audioData}
          sampleRate={24000}
          autoPlay={false} // Gán false tường minh
        />
      ) : (
        <p className="text-sm text-inherit italic">Loading audio...</p>
      )}
    </div>
  );
};

export default ServerAudioLog;