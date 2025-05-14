// ToolResponseLog.tsx
import React from "react";
import { ToolResponseMessage } from "../multimodal-live-types";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 as dark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import cn from "classnames";
import Map from "../../../conferences/detail/Map";

interface FunctionCallResponsePayload {
  content: any;
}

type ToolResponseLogProps = {
  message: ToolResponseMessage;
};

const ToolResponseLog: React.FC<ToolResponseLogProps> = ({ message }) => {
  return (
    <div className={cn("rich-log tool-response p-2 my-1 rounded bg-blue-100 border border-blue-300")}>
      {message.toolResponse.functionResponses.map(
        (fc, index) => {
          const functionCallResponse = fc.response as FunctionCallResponsePayload;
          const responseContent = functionCallResponse?.content;

          let customUI: React.ReactNode = null;
          let messageForModelText: string | null = null;

          // --- DEBUGGING POINT 1 ---
          console.log("[ToolResponseLog] Processing fc.id:", fc.id, "Response Content:", responseContent);

          if (responseContent && typeof responseContent === 'object') {
            const contentObj = responseContent as any;

            // --- DEBUGGING POINT 2 ---
            console.log("[ToolResponseLog] contentObj:", contentObj, "uiAction:", contentObj.uiAction);

            if (contentObj.uiAction?.type === 'display_map' && contentObj.uiAction.location) {
              // --- DEBUGGING POINT 3 ---
              console.log("[ToolResponseLog] Display_map action detected. Location:", contentObj.uiAction.location);
              customUI = <Map location={contentObj.uiAction.location} />;
              messageForModelText = contentObj.messageForModel || `Displaying map for: ${contentObj.uiAction.location}`;
            } else if (contentObj.messageForModel) {
              messageForModelText = contentObj.messageForModel;
            }
          } else if (typeof responseContent === 'string') {
            messageForModelText = responseContent;
          }

          // --- DEBUGGING POINT 4 ---
          console.log("[ToolResponseLog] customUI:", customUI, "messageForModelText:", messageForModelText);

          return (
            <div key={`tool-response-${fc.id || index}`} className="part mt-1 p-1 border-t border-blue-200 first:mt-0 first:border-t-0">
              <h5 className="text-sm font-medium text-blue-600">
                Function Response ({fc.id || `index-${index}`})
              </h5>
              
              {messageForModelText && (
                <p className="text-sm text-gray-800 mb-1">{messageForModelText}</p>
              )}

              {customUI /* This is where the map should be rendered */}

              {!customUI && (
                <SyntaxHighlighter language="json" style={dark} customStyle={{ fontSize: '0.8em', margin: '0' }}>
                  {JSON.stringify(fc.response, null, "  ")}
                </SyntaxHighlighter>
              )}
            </div>
          );
        },
      )}
    </div>
  );
};

export default ToolResponseLog;