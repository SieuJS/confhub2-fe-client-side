// src/app/[locale]/chatbot/livechat/hooks/useLoggerEvents.ts
import { useEffect } from "react";
import {
  LiveAPIEvents, // Import the centralized definition
  EventType,     // Import the centralized definition
} from '../../lib/live-api-event-types'; // Adjust path

const useLoggerEvents = (
  on: <K extends EventType>(event: K, callback: LiveAPIEvents[K]) => void, // Uses centralized EventType
  off: <K extends EventType>(event: K, callback: LiveAPIEvents[K]) => void, // Uses centralized EventType
  logCallback: LiveAPIEvents["log"], // Specific callback type from centralized definition
) => {
  useEffect(() => {
    on("log", logCallback); // "log" is now known to be a keyof the centralized LiveAPIEvents
    return () => {
      off("log", logCallback);
    };
  }, [on, off, logCallback]);
};

export default useLoggerEvents;
