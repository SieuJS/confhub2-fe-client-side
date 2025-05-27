// src/app/[locale]/chatbot/livechat/logger/ToolCallLog.tsx
import React from "react";
// Import ToolCallPayload from your unified types
import { ToolCallPayload } from "@/src/app/[locale]/chatbot/lib/live-chat.types";
// SDK's FunctionCall type for clarity, though ToolCallPayload already implies it
import { FunctionCall as SDKFunctionCall } from "@google/genai";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 as dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import cn from "classnames";

type ToolCallLogProps = {
  message: ToolCallPayload; // Use the unified type (SDKLiveServerToolCall)
};

const ToolCallLog: React.FC<ToolCallLogProps> = ({ message }) => {
  // message is now directly SDKLiveServerToolCall, which has a functionCalls field
  const functionCalls = message.functionCalls;

  return (
    <div className={cn("rich-log tool-call text-sm text-inherit")}> {/* Added text styling */}
      {functionCalls && functionCalls.map((fc: SDKFunctionCall) => ( // fc is SDK's FunctionCall
        <div key={fc.id || fc.name} className="part part-functioncall my-1 rounded bg-gray-800 p-2 text-xs text-gray-50">
          <h5 className="mb-1 font-semibold">Function Call: {fc.name} (ID: {fc.id || 'N/A'})</h5>
          <SyntaxHighlighter
            language="json"
            style={dark}
            customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
          >
            {JSON.stringify(fc.args, null, "  ")}
          </SyntaxHighlighter>
        </div>
      ))}
    </div>
  );
};
export default ToolCallLog;