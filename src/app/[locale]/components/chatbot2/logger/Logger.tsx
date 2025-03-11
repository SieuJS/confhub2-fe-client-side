// Logger.tsx (Corrected - No unused imports)
import React from "react";
import "./logger.css";
import { useLoggerStore } from "../lib/store-logger";
import LogEntry from "./LogEntry";
import MessageRenderer from "./MessageRenderer";
import { filters, LoggerFilterType } from "./LogFilters"; // LoggerFilterType is used in the type definition

export type LoggerProps = {
  filter: LoggerFilterType;
};

export default function Logger({ filter = "none" }: LoggerProps) {
  const { logs } = useLoggerStore();
  const filterFn = filters[filter];

  return (
    <div className="logger">
      <ul className="logger-list">
        {logs.filter(filterFn).map((log, key) => (
          <LogEntry MessageComponent={MessageRenderer} log={log} key={key} />
        ))}
      </ul>
    </div>
  );
}