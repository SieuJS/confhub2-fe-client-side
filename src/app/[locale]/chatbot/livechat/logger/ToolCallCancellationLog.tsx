// src/app/[locale]/chatbot/livechat/logger/ToolCallCancellationLog.tsx
import React from "react";
import { ToolCallCancellationPayload } from "@/src/app/[locale]/chatbot/lib/live-chat.types";
import cn from "classnames";

type ToolCallCancellationLogProps = {
  message: ToolCallCancellationPayload;
};

const ToolCallCancellationLog: React.FC<ToolCallCancellationLogProps> = ({ message }): JSX.Element => (
    <div className={cn("rich-log tool-call-cancellation text-sm text-inherit")}>
      <span>
        Tool Call Cancellation - IDs:
        {message.ids && message.ids.length > 0 ? (
            message.ids.map(
            (id) => (
                <span className="inline-code mx-1 rounded bg-gray-200 px-1 dark:bg-gray-700" key={`cancel-${id}`}>
                {/* ĐÃ SỬA LỖI Ở ĐÂY */}
                {`"${id}"`}
                </span>
            ),
            )
        ) : (
            <span className="italic"> (No IDs provided)</span>
        )}
      </span>
    </div>
  );

export default ToolCallCancellationLog;