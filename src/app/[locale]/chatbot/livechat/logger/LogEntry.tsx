import React, { ReactNode, memo } from "react";
import cn from "classnames";
import { StreamingLog } from "../multimodal-live-types";

const formatTime = (d: Date) =>
  `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

type LogEntryProps = {
  log: StreamingLog;
  MessageComponent: ({
    message,
    type,
  }: {
    message: StreamingLog["message"];
    type?: string;
  }) => ReactNode;
};

const LogEntry: React.FC<LogEntryProps> = ({ log, MessageComponent }): JSX.Element => {
  const isUserMessage = log.type.startsWith("send");
  const isServerMessage = log.type.startsWith("server") || log.type.startsWith("receive");
  const isToolMessage = log.type.includes("tool");
  const isErrorMessage = log.type === "error";

  let alignmentClasses = "float-left clear-both"; // For the <li> element
  if (isUserMessage) {
    alignmentClasses = "float-right clear-both ml-auto"; // For the <li> element
  }

  // Base bubble style
  let bubbleClasses = "p-3 shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out";

  if (isUserMessage) {
    bubbleClasses += " bg-blue-500 text-white rounded-t-xl rounded-bl-xl dark:bg-blue-600";
  } else if (isServerMessage && !isToolMessage) {
    bubbleClasses += " bg-gray-200 text-gray-800 rounded-t-xl rounded-br-xl dark:bg-gray-700 dark:text-gray-200";
  } else if (isToolMessage) {
    bubbleClasses += " bg-amber-100 text-amber-800 border border-amber-300 rounded-t-xl rounded-br-xl dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700";
  } else if (isErrorMessage) {
    bubbleClasses += " bg-red-100 text-red-700 border border-red-300 rounded-t-xl rounded-br-xl dark:bg-red-900/60 dark:text-red-200 dark:border-red-700";
  } else {
    bubbleClasses += " bg-gray-100 text-gray-700 rounded-t-xl rounded-br-xl dark:bg-gray-600 dark:text-gray-200";
  }

  // Determine alignment for the bubble wrapper
  const bubbleWrapperAlignment = isUserMessage ? "justify-end" : "justify-start";
  const timestampTextAlignment = isUserMessage ? "text-right" : "text-left";


  return (
    <li
      className={cn(
        "max-w-[75%] mb-4", // max-width and margin for the entire log entry
        alignmentClasses      // float and clear for the li
      )}
    >
      {/* Timestamp and Log Type */}
      <div className={cn(
        "text-xs mb-1 px-1 text-gray-500 dark:text-gray-400",
        timestampTextAlignment // Align text within the timestamp div
      )}>
        {formatTime(log.date)} - {log.type} {log.count && log.count > 1 ? `(x${log.count})` : ''}
      </div>

      {/* Wrapper for the bubble to control its alignment and allow shrinking */}
      {/* This div will take the full width available in the floated li */}
      <div className={cn("flex", bubbleWrapperAlignment)}>
        {/* The actual bubble. As a flex item, it will shrink to fit its content.
            The background color is applied here, so it will be tight around the text.
        */}
        <div className={bubbleClasses}>
          <MessageComponent message={log.message} type={log.type} />
        </div>
      </div>
    </li>
  );
};

export default memo(LogEntry);