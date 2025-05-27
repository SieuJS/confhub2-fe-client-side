// src/app/[locale]/chatbot/livechat/logger/LogEntry.tsx
import React, { ReactNode, memo } from "react";
import cn from "classnames";
import { StreamingLog } from "../../lib/live-chat.types";

const formatTime = (d: Date) =>
  `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;

type LogEntryProps = {
  log: StreamingLog;
  MessageComponent: ({ logEntry }: { logEntry: StreamingLog }) => ReactNode;
};

const LogEntry: React.FC<LogEntryProps> = ({ log, MessageComponent }): ReactNode => {
  const renderedMessage = <MessageComponent logEntry={log} />;

  if (renderedMessage === null || typeof renderedMessage === 'boolean' || typeof renderedMessage === 'undefined') {
    return null;
  }

  const isFromUserSide =
    log.type.startsWith("send") ||
    log.type.startsWith("client.") ||
    log.type.startsWith("transcription.inputEvent");

  const isFromServerSide =
    log.type.startsWith("server") ||
    log.type.startsWith("receive") ||
    log.type.startsWith("transcription.outputEvent");

  const isToolMessage = log.type.includes("tool");
  const isErrorMessage = log.type === "error";

  // Xác định liệu đây có phải là log phiên âm (input hoặc output)
  const isTranscriptionLog = log.type.startsWith("transcription.inputEvent") || log.type.startsWith("transcription.outputEvent");

  let alignmentClasses = "float-left clear-both";
  if (isFromUserSide) {
    alignmentClasses = "float-right clear-both ml-auto";
  }

  let bubbleClasses = "p-3 shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out";

  // Các lớp cho bong bóng chat dựa trên loại log
  if (isFromUserSide && !isTranscriptionLog) { // Áp dụng cho tin nhắn gửi đi (không phải input transcription)
    bubbleClasses += " bg-blue-500 text-white rounded-t-xl rounded-bl-xl dark:bg-blue-600";
  } else if (isFromServerSide && !isToolMessage && !isTranscriptionLog) { // Áp dụng cho tin nhắn nhận được (không phải tool hoặc output transcription)
    bubbleClasses += " bg-gray-200 text-gray-800 rounded-t-xl rounded-br-xl dark:bg-gray-700 dark:text-gray-200";
  } else if (isToolMessage) {
    bubbleClasses += " bg-amber-100 text-amber-800 border border-amber-300 rounded-t-xl rounded-br-xl dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700";
  } else if (isErrorMessage) {
    bubbleClasses += " bg-red-100 text-red-700 border border-red-300 rounded-t-xl rounded-br-xl dark:bg-red-900/60 dark:text-red-200 dark:border-red-700";
  } else if (isTranscriptionLog) {
    // Đối với transcription logs, chúng ta muốn chúng trông giống như tin nhắn thông thường
    // inputEvent (user) -> giống user message (màu xanh)
    // outputEvent (server) -> giống server message (màu xám)
    if (log.type.startsWith("transcription.inputEvent")) {
      bubbleClasses += " bg-blue-500 text-white rounded-t-xl rounded-bl-xl dark:bg-blue-600 opacity-80"; // Thêm opacity để phân biệt nhẹ
    } else { // transcription.outputEvent
      bubbleClasses += " bg-gray-200 text-gray-800 rounded-t-xl rounded-br-xl dark:bg-gray-700 dark:text-gray-200 opacity-80"; // Thêm opacity
    }
    // Giảm padding cho transcription nếu nội dung đã có padding riêng
    // Hoặc giữ nguyên p-3 nếu muốn padding nhất quán
    // Nếu OutputTranscriptionLog không có padding, giữ p-3 ở đây là tốt
  } else { // Fallback cho các loại log khác
    bubbleClasses += " bg-gray-100 text-gray-700 rounded-t-xl rounded-br-xl dark:bg-gray-600 dark:text-gray-200";
  }


  const bubbleWrapperAlignment = isFromUserSide ? "justify-end" : "justify-start";
  const timestampTextAlignment = isFromUserSide ? "text-right" : "text-left";

  return (
    <li
      className={cn(
        "max-w-[75%]",
        isTranscriptionLog ? "mb-1" : "mb-4", // Giảm khoảng cách cho transcription logs
        alignmentClasses
      )}
    >
      {/* Ẩn time stamp và log type nếu là transcription log */}
      {!isTranscriptionLog && (
        <div className={cn(
          "text-xs mb-1 px-1 text-gray-500 dark:text-gray-400",
          timestampTextAlignment
        )}>
          {formatTime(log.date)} {log.count && log.count > 1 ? `(x${log.count})` : ''}
        </div>
      )}
      <div className={cn("flex", bubbleWrapperAlignment)}>
        <div className={bubbleClasses}> {/* Luôn áp dụng bubbleClasses ở đây */}
          {renderedMessage}
        </div>
      </div>
    </li>
  );
};

export default memo(LogEntry);