// LogEntry.tsx
import React, { ReactNode } from "react";
import cn from "classnames";
import { StreamingLog } from "../multimodal-live-types";

const formatTime = (d: Date) => d.toLocaleTimeString().slice(0, -3);

type LogEntryProps = {
  log: StreamingLog;
  MessageComponent: ({
    message,
  }: {
    message: StreamingLog["message"];
  }) => ReactNode;
};

const LogEntry: React.FC<LogEntryProps> = ({ log, MessageComponent }): JSX.Element => (
  <li
    className={cn(
      `plain-log`,
      `source-${log.type.slice(0, log.type.indexOf("."))}`,
      {
        receive: log.type.includes("receive"),
        send: log.type.includes("send"),
      },
    )}
  >
    <span className="timestamp">{formatTime(log.date)}</span>
    <span className="source">{log.type}</span>
    <span className="message">
      <MessageComponent message={log.message} />
    </span>
    {log.count && <span className="count">{log.count}</span>}
  </li>
);

export default LogEntry;