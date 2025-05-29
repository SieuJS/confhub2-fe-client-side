// src/app/[locale]/chatbot/livechat/logger/LogEntry.tsx
import React, { ReactNode, memo } from "react";
import cn from "classnames";
import { StreamingLog } from "../../lib/live-chat.types";
import { Modality as SDKModality } from '@google/genai';

const formatTime = (d: Date) =>
  `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

type LogEntryProps = {
  log: StreamingLog;
  MessageComponent: ({ logEntry }: { logEntry: StreamingLog }) => ReactNode;
  outputFormat?: SDKModality;
};

const LogEntry: React.FC<LogEntryProps> = ({ log, MessageComponent, outputFormat }): ReactNode => {
  const renderedMessage = <MessageComponent logEntry={log} />;

  // Kiểm tra xem có phải là Tool Response Log không
  const isClientToolResponseLog = log.type === "client.toolResponseSent";

  // Nếu renderedMessage là null (ví dụ: ToolResponseLog quyết định không render gì),
  // thì LogEntry cũng không nên render gì cả.
  if (renderedMessage === null || typeof renderedMessage === 'boolean' || typeof renderedMessage === 'undefined') {
    return null;
  }

  const isFromUserSide =
    (log.type.startsWith("send") ||
     log.type.startsWith("client.") ||
     log.type.startsWith("transcription.inputEvent")) && !isClientToolResponseLog;

  const isFromServerSide =
    log.type.startsWith("server") ||
    log.type.startsWith("receive") ||
    log.type.startsWith("transcription.outputEvent") ||
    isClientToolResponseLog;

  const isToolCallMessage = log.type === "receive.toolCall";
  const isErrorMessage = log.type === "error";
  const isTranscriptionLog = log.type.startsWith("transcription.inputEvent") || log.type.startsWith("transcription.outputEvent");

  // CẬP NHẬT ĐIỀU KIỆN ĐỂ ẨN TIMESTAMP
  const shouldHideTimestamp =
    (outputFormat === SDKModality.AUDIO && log.type === "receive.modelTurn.final") ||
    isClientToolResponseLog; // <-- THÊM ĐIỀU KIỆN NÀY: Ẩn timestamp cho tất cả client tool responses

  let alignmentClasses = "float-left clear-both";
  if (isFromUserSide) {
    alignmentClasses = "float-right clear-both ml-auto";
  }

  let bubbleClasses = "p-3 shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out";
  let applyBubbleToWrapper = true;

  if (isClientToolResponseLog) {
    applyBubbleToWrapper = false;
    bubbleClasses = "";
  } else if (isFromUserSide && !isTranscriptionLog) {
    bubbleClasses += " bg-blue-500 text-white rounded-t-xl rounded-bl-xl dark:bg-blue-600";
  } else if (isFromServerSide && !isToolCallMessage && !isTranscriptionLog) {
    bubbleClasses += " bg-gray-200 text-gray-800 rounded-t-xl rounded-br-xl dark:bg-gray-700 dark:text-gray-200";
  } else if (isToolCallMessage) {
    bubbleClasses += " bg-purple-100 text-purple-800 border border-purple-300 rounded-t-xl rounded-br-xl dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-700";
  } else if (isErrorMessage) {
    bubbleClasses += " bg-red-100 text-red-700 border border-red-300 rounded-t-xl rounded-br-xl dark:bg-red-900/60 dark:text-red-200 dark:border-red-700";
  } else if (isTranscriptionLog) {
    if (log.type.startsWith("transcription.inputEvent")) {
      bubbleClasses += " bg-blue-500 text-white rounded-t-xl rounded-bl-xl dark:bg-blue-600 opacity-80";
    } else {
      bubbleClasses += " bg-gray-200 text-gray-800 rounded-t-xl rounded-br-xl dark:bg-gray-700 dark:text-gray-200 opacity-80";
    }
  } else {
    bubbleClasses += " bg-gray-100 text-gray-700 rounded-t-xl rounded-br-xl dark:bg-gray-600 dark:text-gray-200";
  }

  const bubbleWrapperAlignment = isFromUserSide ? "justify-end" : "justify-start";
  const timestampTextAlignment = isFromUserSide ? "text-right" : "text-left";

  return (
    <li
      className={cn(
        isClientToolResponseLog ? "w-full md:max-w-[85%]" : "max-w-[75%]",
        isTranscriptionLog ? "mb-1" : "mb-4",
        alignmentClasses
      )}
    >
      {!shouldHideTimestamp && ( // Điều kiện này giờ sẽ đúng cho isClientToolResponseLog
        <div className={cn(
          "text-xs mb-1 px-1 text-gray-500 dark:text-gray-400",
          timestampTextAlignment
        )}>
          {formatTime(log.date)} {log.count && log.count > 1 ? `(x${log.count})` : ''}
        </div>
      )}
      <div className={cn("flex w-full", bubbleWrapperAlignment)}>
        <div className={cn(
            { [bubbleClasses]: applyBubbleToWrapper },
            isClientToolResponseLog ? "w-full" : ""
        )}>
          {renderedMessage}
        </div>
      </div>
    </li>
  );
};

export default memo(LogEntry);