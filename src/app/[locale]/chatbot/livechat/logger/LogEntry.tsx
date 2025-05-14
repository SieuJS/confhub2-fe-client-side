// LogEntry.tsx
import React, { ReactNode, memo } from "react";
import cn from "classnames";
import { StreamingLog } from "../multimodal-live-types"; // Ensure this path is correct

const formatTime = (d: Date) =>
  `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

type LogEntryProps = {
  log: StreamingLog;
  MessageComponent: ({ // Update this definition
    message,
    type, // Add type here
  }: {
    message: StreamingLog["message"];
    type?: string; // Make type optional as not all original calls might pass it
  }) => ReactNode;
};

const LogEntry: React.FC<LogEntryProps> = ({ log, MessageComponent }): JSX.Element => {
  const isUserMessage = log.type.startsWith("send"); // Example: "send.text", "send.audio"
  const isServerMessage = log.type.startsWith("server") || log.type.startsWith("receive"); // Example: "server.content", "receive.content"
  const isToolMessage = log.type.includes("tool"); // Example: "client.toolResponse", "server.toolCall"
  const isErrorMessage = log.type === "error";

  // Determine alignment based on the message type more granularly
  let alignmentClasses = "float-left clear-both"; // Default to server/tool/error messages
  if (isUserMessage) {
    alignmentClasses = "float-right clear-both ml-auto"; // User messages on the right
  }

  // Determine background and text color based on message type
  let bubbleClasses = "p-3 rounded-lg shadow"; // Base bubble style
  if (isUserMessage) {
    bubbleClasses += " bg-blue-500 text-white"; // User message bubble
  } else if (isServerMessage && !isToolMessage) { // Model's text/audio response
    bubbleClasses += " bg-gray-200 text-gray-800"; // Server message bubble
  } else if (isToolMessage) {
    bubbleClasses += " bg-yellow-100 text-yellow-800 border border-yellow-300"; // Tool related messages
  } else if (isErrorMessage) {
    bubbleClasses += " bg-red-100 text-red-700 border border-red-300"; // Error messages
  } else {
    bubbleClasses += " bg-gray-100 text-gray-700"; // Default for other types
  }


  return (
    <li
      className={cn(
        "max-w-[85%] mb-4", // Max width to prevent full screen width bubbles
        alignmentClasses
      )}
    >
      <div className={cn("text-xs mb-1", isUserMessage ? "text-right text-gray-500" : "text-left text-gray-500")}>
        {formatTime(log.date)} - {log.type} {log.count && log.count > 1 ? `(x${log.count})` : ''}
      </div>
      <div className={bubbleClasses}>
        <MessageComponent message={log.message} type={log.type} /> {/* Pass log.type here */}
      </div>
    </li>
  );
};

export default memo(LogEntry);