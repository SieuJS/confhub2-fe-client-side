
// src/app/[locale]/chatbot/livechat/hooks/useModelAudioResponse.ts
import { useEffect } from "react";
import {
  LiveAPIEvents, // Import the centralized definition
  EventType,     // Import the centralized definition
} from '../../lib/live-api-event-types'; // Adjust path
import { StreamingLog } from "../../lib/live-chat.types"; // For your custom log structure

const useModelAudioResponse = (
  on: <K extends EventType>(event: K, callback: LiveAPIEvents[K]) => void, // Uses centralized EventType
  off: <K extends EventType>(event: K, callback: LiveAPIEvents[K]) => void, // Uses centralized EventType
  log: (entry: StreamingLog) => void, // Assuming log function takes StreamingLog
) => {
  useEffect(() => {
    const onAudioResponseCallback: LiveAPIEvents["audioResponse"] = (audioResponse) => {
      // log({
      //   date: new Date(),
      //   type: "receive.serverAudio",
      //   message: { serverAudio: { audioData: audioResponse.data } },
      // } as StreamingLog); // Cast to StreamingLog if necessary
    };

    on("audioResponse", onAudioResponseCallback); // "audioResponse" is known
    return () => {
      off("audioResponse", onAudioResponseCallback);
    };
  }, [on, off, log]);
};
export default useModelAudioResponse;