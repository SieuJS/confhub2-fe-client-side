// src/app/[locale]/chatbot/livechat/logger/Logger.tsx
import React from "react";
import { useLoggerStore } from "../lib/store-logger";
import LogEntry from "./LogEntry";
import MessageRenderer from "./MessageRenderer";
import { filters, LoggerFilterType } from "./LogFilters";
import { useLiveAPIContext } from "../contexts/LiveAPIContext"; // Điều chỉnh đường dẫn nếu cần

export type LoggerProps = {
  filter: LoggerFilterType;
};

export default function Logger({ filter = "none" }: LoggerProps) {
  const { logs } = useLoggerStore();
  const { appConfig } = useLiveAPIContext();

  // Xác định outputFormat hiện tại từ appConfig
  // appConfig.responseModalities là một mảng, thường chỉ có một phần tử cho live chat
  const currentOutputFormat = appConfig?.responseModalities?.[0];

  const filterFn = filters[filter];

  return (
    <div className="logger">
      <ul className="logger-list">
        {logs.filter(filterFn).map((log, index) => ( // Đổi 'key' thành 'index' để tránh warning nếu bạn dùng index làm key
          <LogEntry
            MessageComponent={MessageRenderer}
            log={log}
            key={`${log.type}-${log.date.toISOString()}-${index}`} // Đảm bảo key là duy nhất và ổn định
            outputFormat={currentOutputFormat} // <-- TRUYỀN PROP NÀY VÀO ĐÂY
          />
        ))}
      </ul>
    </div>
  );
}