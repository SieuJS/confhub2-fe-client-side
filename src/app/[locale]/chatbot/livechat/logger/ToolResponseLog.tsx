// ToolResponseLog.tsx
import React from "react";
import { ToolResponseMessage } from "../multimodal-live-types";
import SyntaxHighlighter from "react-syntax-highlighter";
// Giữ style tối cho syntax highlighter, nó thường tạo độ tương phản tốt cho code/JSON
import { vs2015 as syntaxHighlightStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Map from "../../../conferences/detail/Map"; // Đảm bảo đường dẫn này đúng

interface FunctionCallResponsePayload {
  content: any;
}

type ToolResponseLogProps = {
  message: ToolResponseMessage;
};

const ToolResponseLog: React.FC<ToolResponseLogProps> = ({ message }) => {
  // Removed outer div styling (rich-log, p-2, my-1, rounded, bg-blue-100, border-blue-300)
  // LogEntry now handles the bubble styling.
  // Text color will be inherited from LogEntry's tool message style (amber-800 or dark:amber-200)
  return (
    <div className="text-sm"> {/* Base text size */}
      {message.toolResponse.functionResponses.map(
        (fc, index) => {
          const functionCallResponse = fc.response as FunctionCallResponsePayload;
          const responseContent = functionCallResponse?.content;

          let customUI: React.ReactNode = null;
          let messageForModelText: string | null = null;

          // console.log("[ToolResponseLog] Processing fc.id:", fc.id, "Response Content:", responseContent);

          if (responseContent && typeof responseContent === 'object') {
            const contentObj = responseContent as any;
            // console.log("[ToolResponseLog] contentObj:", contentObj, "uiAction:", contentObj.uiAction);

            if (contentObj.uiAction?.type === 'display_map' && contentObj.uiAction.location) {
              // console.log("[ToolResponseLog] Display_map action detected. Location:", contentObj.uiAction.location);
              customUI = (
                <div className="my-2 rounded-md overflow-hidden border border-amber-300 dark:border-amber-600">
                  <Map location={contentObj.uiAction.location} />
                </div>
              );
              messageForModelText = contentObj.messageForModel || `Displaying map for: ${contentObj.uiAction.location}`;
            } else if (contentObj.messageForModel) {
              messageForModelText = contentObj.messageForModel;
            }
          } else if (typeof responseContent === 'string') {
            messageForModelText = responseContent;
          }

          // console.log("[ToolResponseLog] customUI:", customUI, "messageForModelText:", messageForModelText);

          return (
            <div
              // key={`tool-response-${fc.id || index}`}
              // // Adjusted padding, margin, and border color to fit amber theme
              // className="part mt-2 pt-2 border-t border-amber-300 dark:border-amber-600 first:mt-0 first:pt-0 first:border-t-0"
            >
              {/* <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wide">
                Function Response ({fc.id || `index-${index}`})
              </h5> */}
              
              {/* {messageForModelText && (
                // text-inherit will take color from LogEntry (amber-800 / dark:amber-200)
                <p className="text-inherit mb-1 whitespace-pre-wrap">{messageForModelText}</p>
              )} */}

              {customUI /* This is where the map should be rendered */}

              {/* {!customUI && responseContent && ( // Only show syntax highlighter if there's content and no custom UI
                <div className="mt-1 text-xs rounded-md bg-gray-800 text-gray-100 p-2 overflow-x-auto">
                  <SyntaxHighlighter
                    language="json"
                    style={syntaxHighlightStyle}
                    customStyle={{
                      margin: 0, // Remove default margin from highlighter
                      padding: 0, // Padding is handled by the wrapper div
                      background: 'transparent' // Make highlighter background transparent, wrapper div handles it
                    }}
                    // Using "as string" for the content prop, assuming it's an object to be stringified.
                    // If responseContent itself can be a pre-formatted string, this is fine.
                  >
                    {typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent, null, 2)}
                  </SyntaxHighlighter>
                </div>
              )}
              {!customUI && !responseContent && ( // Case where responseContent is null/undefined
                 <p className="text-inherit italic text-xs mt-1">No content in function response.</p>
              )} */}
            </div>
          );
        },
      )}
    </div>
  );
};

export default ToolResponseLog;