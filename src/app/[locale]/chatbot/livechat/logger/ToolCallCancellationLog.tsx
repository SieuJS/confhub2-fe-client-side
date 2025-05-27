// src/app/[locale]/chatbot/livechat/logger/ToolCallCancellationLog.tsx
import React from "react"; // Ensure React is imported
// Import ToolCallCancellationPayload from your unified types
import { ToolCallCancellationPayload } from "@/src/app/[locale]/chatbot/lib/live-chat.types";
import cn from "classnames";

type ToolCallCancellationLogProps = {
  message: ToolCallCancellationPayload; // Use the unified type
};

const ToolCallCancellationLog: React.FC<ToolCallCancellationLogProps> = ({ message }): JSX.Element => (
    // message is now directly SDKLiveServerToolCallCancellation, which has an 'ids' field
    <div className={cn("rich-log tool-call-cancellation text-sm text-inherit")}> {/* Added text styling */}
      <span>
        Tool Call Cancellation - IDs:
        {message.ids && message.ids.length > 0 ? (
            message.ids.map(
            (id) => (
                <span className="inline-code mx-1 rounded bg-gray-200 px-1 dark:bg-gray-700" key={`cancel-${id}`}>
                "{id}"
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