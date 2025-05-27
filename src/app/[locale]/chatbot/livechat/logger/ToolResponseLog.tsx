// src/app/[locale]/chatbot/livechat/logger/ToolResponseLog.tsx
import React from "react";
// Import ToolResponsePayload from your unified types
import { ToolResponsePayload } from "@/src/app/[locale]/chatbot/lib/live-chat.types";
// SDK's FunctionResponse class for clarity
import { FunctionResponse as SDKFunctionResponse } from "@google/genai";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 as syntaxHighlightStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Map from "../../../conferences/detail/Map"; // Ensure this path is correct

// This interface might not be needed if fc.response is directly the content
// interface FunctionCallResponsePayload {
//   content: any;
// }

type ToolResponseLogProps = {
  message: ToolResponsePayload; // Use the unified type (SDKLiveClientToolResponse)
};

const ToolResponseLog: React.FC<ToolResponseLogProps> = ({ message }) => {
  // message is now directly SDKLiveClientToolResponse, which has a functionResponses field
  const functionResponses = message.functionResponses;

  return (
    <div className="text-sm text-inherit">
      {functionResponses && functionResponses.map(
        (sdkResponse: SDKFunctionResponse, index: number) => { // sdkResponse is an instance of SDK's FunctionResponse
          // The actual response data from the function execution is in sdkResponse.response
          const responseContent = sdkResponse.response; // This is Record<string, unknown>

          let customUI: React.ReactNode = null;
          let messageForModelText: string | null = null;

          if (responseContent && typeof responseContent === 'object') {
            const contentObj = responseContent as any; // Cast for easier access, be mindful

            if (contentObj.uiAction?.type === 'display_map' && contentObj.uiAction.location) {
              customUI = (
                <div className="my-2 rounded-md overflow-hidden border border-amber-300 dark:border-amber-600">
                  <Map location={contentObj.uiAction.location} />
                </div>
              );
              messageForModelText = contentObj.messageForModel || `Displayed map for: ${contentObj.uiAction.location}`;
            } else if (contentObj.messageForModel) {
              messageForModelText = contentObj.messageForModel;
            } else if (contentObj.error) { // Handle error responses from functions
                messageForModelText = `Error in ${sdkResponse.name}: ${JSON.stringify(contentObj.error)}`;
            } else if (contentObj.content) { // Handle generic content responses
                messageForModelText = typeof contentObj.content === 'string' ? contentObj.content : JSON.stringify(contentObj.content);
            }
          } else if (typeof responseContent === 'string') { // Should ideally be an object
            messageForModelText = responseContent;
          }


          return (
            <div
              key={sdkResponse.id || `tool-response-${index}`} // Use sdkResponse.id
              className="part mt-2 pt-2 border-t border-amber-300 dark:border-amber-600 first:mt-0 first:pt-0 first:border-t-0"
            >
              <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wide">
                Function Response: {sdkResponse.name} (ID: {sdkResponse.id})
              </h5>
              
              {messageForModelText && (
                <p className="text-inherit mb-1 whitespace-pre-wrap">{messageForModelText}</p>
              )}

              {customUI}

              {!customUI && responseContent && !messageForModelText && ( // Show raw JSON if no custom UI and no specific messageForModelText
                <div className="mt-1 text-xs rounded-md bg-gray-800 text-gray-100 p-2 overflow-x-auto">
                  <SyntaxHighlighter
                    language="json"
                    style={syntaxHighlightStyle}
                    customStyle={{
                      margin: 0,
                      padding: 0,
                      background: 'transparent'
                    }}
                  >
                    {typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent, null, 2)}
                  </SyntaxHighlighter>
                </div>
              )}
              {!customUI && !responseContent && (
                 <p className="text-inherit italic text-xs mt-1">No content in function response.</p>
              )}
            </div>
          );
        },
      )}
    </div>
  );
};

export default ToolResponseLog;