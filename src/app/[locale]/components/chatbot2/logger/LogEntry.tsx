// LogEntry.tsx
import React, { ReactNode } from "react";
import cn from "classnames";
import { StreamingLog } from "../multimodal-live-types";

const formatTime = (d: Date) =>
  `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

type LogEntryProps = {
  log: StreamingLog;
  MessageComponent: ({
    message,
  }: {
    message: StreamingLog["message"];
  }) => ReactNode;
};

const LogEntry: React.FC<LogEntryProps> = ({ log, MessageComponent }): JSX.Element => {
  // Determine if the message is from the user (send) or the system (receive)
  const isUserMessage = log.type.startsWith("send");

  return (
    <li
      className={cn(
        "mb-4", // Margin between messages
        isUserMessage ? "float-right clear-both" : "float-left clear-both" // Float right for user, left for system
      )}
    >
      <div
        className={cn(
          "p-3 rounded-lg max-w-[70%]", // Padding, rounded corners, max-width
          isUserMessage ? "bg-blue-500 text-white ml-auto" : "bg-gray-700 text-gray-200 mr-auto" // Styling based on sender
        )}
      >
        <div className="text-xs text-gray-400">
          {/* Display the time above the message */}
          {formatTime(log.date)} - {log.type}
        </div>
        <MessageComponent message={log.message} />
        {log.count && <span className="text-xs text-gray-400 ml-2">({log.count})</span>}
      </div>
    </li>
  );
};

export default LogEntry;