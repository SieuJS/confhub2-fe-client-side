// src/app/[locale]/chatbot/livechat/logger/ToolResponseLog.tsx
import React from "react";
import { ToolResponsePayload } from "@/src/app/[locale]/chatbot/lib/live-chat.types";
import { FunctionResponse as SDKFunctionResponse } from "@google/genai";
import SyntaxHighlighter from "react-syntax-highlighter";
import { vs2015 as syntaxHighlightStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";
import Map from "../../../conferences/detail/Map"; // Đảm bảo đường dẫn này đúng

type ToolResponseLogProps = {
  message: ToolResponsePayload;
};

const ToolResponseLog: React.FC<ToolResponseLogProps> = ({ message }) => {
  const functionResponses = message.functionResponses;

  return (
    <div className="text-sm text-inherit">
      {functionResponses && functionResponses.map(
        (sdkResponse: SDKFunctionResponse, index: number) => {
          const rawResponsePayload = sdkResponse.response; // Đây là Record<string, unknown>
          // Ví dụ: { content: { uiAction: ..., messageForModel: ... } }

          let customUI: React.ReactNode = null;
          let messageForModelText: string | null = null;

          // Kiểm tra xem rawResponsePayload có phải là object và có key 'content' không
          if (rawResponsePayload && typeof rawResponsePayload === 'object' && 'content' in rawResponsePayload) {
            const actualContent = rawResponsePayload.content as any; // actualContent là object bên trong key "content"

            if (actualContent && typeof actualContent === 'object') {
              // Bây giờ kiểm tra uiAction và messageForModel trên actualContent
              if (actualContent.uiAction?.type === 'display_map' && actualContent.uiAction.location) {
                customUI = (
                  // THÊM Chiều cao vào đây để đảm bảo Map có không gian hiển thị
                  // Ví dụ: h-[250px] hoặc min-h-[250px] (Tailwind CSS)
                  <div className="my-2 rounded-md overflow-hidden border border-amber-300 dark:border-amber-600 h-[300px]"> {/* HOẶC min-h-[300px] */}
                    <Map location={actualContent.uiAction.location} />
                  </div>
                );
                messageForModelText = actualContent.messageForModel || `Displayed map for: ${actualContent.uiAction.location}`;
              }
              // Bạn có thể thêm các điều kiện else if khác ở đây để xử lý các loại uiAction khác
              // hoặc các cấu trúc content khác từ các tool handler khác.
            }
          }

          // Nếu không có customUI và không có messageForModelText được trích xuất ở trên,
          // nhưng vẫn có rawResponsePayload, thì hiển thị JSON của nó.
          // Điều này hữu ích cho các tool response không có UI đặc biệt.
          if (!customUI && !messageForModelText && rawResponsePayload) {
            if (typeof rawResponsePayload === 'object' && rawResponsePayload !== null) {
              // Nếu rawResponsePayload.content là một string (ví dụ từ getConferences)
              if ('content' in rawResponsePayload && typeof rawResponsePayload.content === 'string') {
                messageForModelText = rawResponsePayload.content;
              } else {
                // Mặc định hiển thị toàn bộ JSON của rawResponsePayload
                messageForModelText = `Tool response data:`; // Để có context
                // customUI sẽ là SyntaxHighlighter hiển thị JSON
                // (để tránh lặp lại SyntaxHighlighter, có thể gán vào customUI)
              }
            } else if (typeof rawResponsePayload === 'string') {
              messageForModelText = rawResponsePayload;
            }
          }


          return (
            <div
              key={sdkResponse.id || `tool-response-${index}`}
              className="part mt-2 pt-2 border-t border-amber-300 dark:border-amber-600 first:mt-0 first:pt-0 first:border-t-0"
            >
              <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wide">
                Function Response: {sdkResponse.name} (ID: {sdkResponse.id})
              </h5>

              {messageForModelText && (
                <p className="text-inherit mb-1 whitespace-pre-wrap">{messageForModelText}</p>
              )}

              {customUI}

              {/* Hiển thị JSON nếu không có customUI và messageForModelText chưa được set từ logic trên,
                  NHƯNG rawResponsePayload lại là một object phức tạp cần hiển thị.
                  Điều chỉnh điều kiện này cho phù hợp.
              */}
              {!customUI && !messageForModelText && rawResponsePayload && typeof rawResponsePayload === 'object' &&
                !('content' in rawResponsePayload && typeof rawResponsePayload.content === 'string') && (
                  <div className="mt-1 text-xs rounded-md bg-gray-800 text-gray-100 p-2 overflow-x-auto">
                    <SyntaxHighlighter
                      language="json"
                      style={syntaxHighlightStyle}
                      customStyle={{ margin: 0, padding: 0, background: 'transparent' }}
                    >
                      {JSON.stringify(rawResponsePayload, null, 2)}
                    </SyntaxHighlighter>
                  </div>
                )}

              {!customUI && !rawResponsePayload && ( // Nếu không có customUI và cũng không có rawResponsePayload
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



// // src/app/[locale]/chatbot/livechat/logger/ToolResponseLog.tsx
// import React from "react";
// import { ToolResponsePayload } from "@/src/app/[locale]/chatbot/lib/live-chat.types";
// import { FunctionResponse as SDKFunctionResponse } from "@google/genai";
// import Map from "../../../conferences/detail/Map"; // Đảm bảo đường dẫn này đúng

// type ToolResponseLogProps = {
//   message: ToolResponsePayload;
// };

// const ToolResponseLog: React.FC<ToolResponseLogProps> = ({ message }) => {
//   const functionResponses = message.functionResponses;

//   // Nếu không có functionResponses hoặc mảng rỗng, không có gì để hiển thị
//   if (!functionResponses || functionResponses.length === 0) {
//     return null;
//   }

//   const renderedMaps = functionResponses
//     .map((sdkResponse: SDKFunctionResponse, index: number) => {
//       const rawResponsePayload = sdkResponse.response;
//       let customUI: React.ReactNode = null;

//       if (rawResponsePayload && typeof rawResponsePayload === 'object' && 'content' in rawResponsePayload) {
//         const actualContent = rawResponsePayload.content as any;
//         if (actualContent && typeof actualContent === 'object') {
//           if (actualContent.uiAction?.type === 'display_map' && actualContent.uiAction.location) {
//             customUI = (
//               <div className="my-2 rounded-md overflow-hidden border border-amber-300 dark:border-amber-600 h-[300px]">
//                 <Map location={actualContent.uiAction.location} />
//               </div>
//             );
//           }
//         }
//       }

//       // Trả về customUI (Map) nếu nó được tạo, nếu không thì null.
//       // Div bọc ngoài cùng với key sẽ được thêm nếu customUI tồn tại.
//       return customUI ? (
//         <div key={sdkResponse.id || `tool-response-${index}`}>
//           {customUI}
//         </div>
//       ) : null;
//     })
//     .filter(Boolean); // Lọc bỏ tất cả các giá trị null (những response không phải là map)

//   // Nếu sau khi lọc, không còn map nào để hiển thị, trả về null
//   if (renderedMaps.length === 0) {
//     return null;
//   }

//   // Chỉ khi có map để hiển thị, mới trả về div bọc chúng
//   return (
//     <div className="text-sm text-inherit">
//       {renderedMaps}
//     </div>
//   );
// };

// export default ToolResponseLog;