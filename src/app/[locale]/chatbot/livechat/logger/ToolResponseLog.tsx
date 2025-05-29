// // src/app/[locale]/chatbot/livechat/logger/ToolResponseLog.tsx
// import React, { useState } from 'react';
// import { ToolResponsePayload,  } from '../../lib/live-chat.types';
// import cn from 'classnames';
// import { ChevronDown, ChevronRight } from 'lucide-react';
// import { FunctionResponse as SDKFunctionResponse } from '@google/genai';
// // Import Map component từ code gốc của bạn
// // QUAN TRỌNG: Đảm bảo đường dẫn này chính xác!
// import Map from "../../../conferences/detail/Map"; // Đảm bảo đường dẫn này đúng

// // Import SyntaxHighlighter
// import SyntaxHighlighter from 'react-syntax-highlighter';
// // Chọn một style, ví dụ: vs2015, atomOneDark, etc.
// import { vs2015 as syntaxHighlightStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// // Helper component cho từng FunctionResponse
// const FunctionResponseItem = ({ funcResponse }: { funcResponse: SDKFunctionResponse }) => {
//   const [isExpanded, setIsExpanded] = useState(false); // Mặc định narrow

//   const functionName = funcResponse.name;
//   const functionId = funcResponse.id;

//   // funcResponse.response là Record<string, any> từ SDK.
//   // Tool handler của bạn có thể trả về { content: { actual_data } } hoặc chỉ { actual_data }
//   // responseDataFromHandler sẽ là object chứa uiAction, messageForModel, hoặc string, hoặc object JSON khác.
//   const responseDataFromHandler = funcResponse.response?.content || funcResponse.response;

//   let customUI: React.ReactNode = null;
//   let messageForModelText: string | null = null;
//   let dataToHighlightAsJson: any = null;
//   let isMapDisplayAction = false;

//   if (responseDataFromHandler && typeof responseDataFromHandler === 'object') {
//     const contentObject = responseDataFromHandler as any; // Để truy cập uiAction, messageForModel

//     // 1. Kiểm tra uiAction cho display_map (dựa trên logic code gốc)
//     if (contentObject.uiAction?.type === 'display_map' && contentObject.uiAction.location) {
//       isMapDisplayAction = true;
//       customUI = (
//         <div className="my-2 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 h-[310px] min-h-[310px] max-w-[500px]">
//           <Map location={contentObject.uiAction.location} />
//         </div>
//       );
//       messageForModelText = contentObject.messageForModel || `Displayed map for: ${contentObject.uiAction.location}`;
//       // Không cần dataToHighlightAsJson cho map vì đã có customUI
//     } else {
//       // 2. Nếu không phải map, kiểm tra messageForModel và dữ liệu còn lại cho JSON
//       if (contentObject.messageForModel && typeof contentObject.messageForModel === 'string') {
//         messageForModelText = contentObject.messageForModel;
//       }
//       // Dữ liệu còn lại của contentObject (hoặc toàn bộ nếu không có messageForModel riêng) sẽ là JSON
//       dataToHighlightAsJson = contentObject;
//     }
//   } else if (typeof responseDataFromHandler === 'string') {
//     // Nếu responseDataFromHandler là một string đơn giản
//     messageForModelText = responseDataFromHandler;
//     // Không có dataToHighlightAsJson trong trường hợp này (hoặc có thể coi chính string đó là data)
//   } else {
//     // Trường hợp không xác định hoặc responseDataFromHandler là null/undefined
//     messageForModelText = "No displayable content in function response.";
//   }

//   // A. Nếu là action hiển thị Map (không expand/narrow, không bubble vàng đặc trưng)
//   if (isMapDisplayAction) {
//     return (
//       <div className="mb-2 p-0 text-sm"> {/* Container đơn giản, không bubble */}
//         {/* <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
//           Tool Executed: {functionName}
//           {functionId && <span className="text-xs ml-1 text-gray-500 dark:text-gray-400"> (ID: {functionId})</span>}
//         </h5> */}
//         {/* {messageForModelText && (
//           <p className="text-gray-800 dark:text-gray-200 mb-1">{messageForModelText}</p>
//         )} */}
//         {customUI}
//       </div>
//     );
//   }

//   // // B. Các function response khác (có expand/narrow, bubble màu vàng)
//   // const summaryText = messageForModelText || `Tool Info: ${functionName}`;

//   return (
//     <div
//       className={cn(
//         "mb-2 rounded-lg border shadow-sm",
//         "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-900/70 dark:text-amber-200 dark:border-amber-700"
//       )}
//     >
//       <details className="group" open={isExpanded} onToggle={(e) => setIsExpanded((e.target as HTMLDetailsElement).open)}>
//         <summary
//           className={cn(
//             "flex items-center justify-between list-none p-3 cursor-pointer font-medium text-sm",
//             "hover:bg-amber-100 dark:hover:bg-amber-800/50 rounded-t-lg",
//             { "rounded-b-lg": !isExpanded }
//           )}
//         >
//           {/* <span className="truncate pr-2" title={summaryText}>
//             {summaryText}
//             {functionId && !messageForModelText && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(ID: {functionId})</span>}
//           </span> */}
//           {isExpanded ? (
//             <ChevronDown size={20} className="text-amber-700 dark:text-amber-300 flex-shrink-0" />
//           ) : (
//             <ChevronRight size={20} className="text-amber-700 dark:text-amber-300 flex-shrink-0" />
//           )}
//         </summary>
//         {isExpanded && dataToHighlightAsJson && (
//           <div className="p-3 border-t border-amber-200 dark:border-amber-600 bg-white dark:bg-amber-900/30 rounded-b-lg">
//             <p className="text-xs text-amber-600 dark:text-amber-400 mb-1 font-semibold">Data provided to the model:</p>
//             <div className="text-xs rounded-md bg-gray-800 text-gray-100 p-0.5 overflow-x-auto max-h-96">
//                 <SyntaxHighlighter
//                     language="json"
//                     style={syntaxHighlightStyle}
//                     customStyle={{ margin: 0, padding: '0.25rem', background: 'transparent', fontSize: '0.75rem' }}
//                     wrapLongLines={true}
//                 >
//                     {JSON.stringify(dataToHighlightAsJson, null, 2)}
//                 </SyntaxHighlighter>
//             </div>
//           </div>
//         )}
//          {isExpanded && !dataToHighlightAsJson && !messageForModelText && (
//             <div className="p-3 border-t border-amber-200 dark:border-amber-600 bg-white dark:bg-amber-900/30 rounded-b-lg">
//                  <p className="text-xs text-gray-500 italic">No additional data to display.</p>
//             </div>
//         )}
//       </details>
//     </div>
//   );
// };

// // Component chính cho ToolResponsePayload
// const ToolResponseLog = ({ message }: { message: ToolResponsePayload }) => {
//   if (!message || !message.functionResponses || message.functionResponses.length === 0) {
//     return null;
//   }

//   return (
//     <div className="space-y-1 w-full">
//       {message.functionResponses.map((response, index) => (
//         <FunctionResponseItem
//           key={response.id || `fr-${index}-${new Date().getTime()}`}
//           funcResponse={response}
//         />
//       ))}
//     </div>
//   );
// };

// export default ToolResponseLog;



// src/app/[locale]/chatbot/livechat/logger/ToolResponseLog.tsx
import React from 'react'; // Bỏ useState, cn, ChevronDown, ChevronRight nếu không dùng
import { ToolResponsePayload } from '../../lib/live-chat.types';
import { FunctionResponse as SDKFunctionResponse } from '@google/genai';

// QUAN TRỌNG: Đảm bảo đường dẫn này chính xác!
import Map from "../../../conferences/detail/Map"; // Đảm bảo đường dẫn này đúng

// Bỏ import SyntaxHighlighter và style nếu không dùng nữa

// Helper component cho từng FunctionResponse
const FunctionResponseItem = ({ funcResponse }: { funcResponse: SDKFunctionResponse }) => {
  // const functionName = funcResponse.name; // Không cần nữa nếu chỉ hiển thị map
  // const functionId = funcResponse.id; // Không cần nữa

  const responseDataFromHandler = funcResponse.response?.content || funcResponse.response;

  let customUI: React.ReactNode = null;
  // let messageForModelText: string | null = null; // Không cần nữa nếu chỉ hiển thị map

  if (responseDataFromHandler && typeof responseDataFromHandler === 'object') {
    const contentObject = responseDataFromHandler as any;

    // Chỉ kiểm tra uiAction cho display_map
    if (contentObject.uiAction?.type === 'display_map' && contentObject.uiAction.location) {
      customUI = (
        <div className="my-2 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 h-[310px] min-h-[310px] max-w-[500px]">
          <Map location={contentObject.uiAction.location} />
        </div>
      );
      // messageForModelText = contentObject.messageForModel || `Displayed map for: ${contentObject.uiAction.location}`;
    }
  }

  // Chỉ render nếu customUI (tức là Map) được tạo
  if (customUI) {
    return (
      <div className="mb-2 p-0 text-sm"> {/* Container đơn giản, không bubble */}
        {/* Bạn có thể bỏ hoàn toàn tiêu đề và messageForModelText nếu muốn chỉ có bản đồ */}
        {/*
        <h5 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Tool Executed: {functionName}
        </h5>
        {messageForModelText && (
          <p className="text-gray-800 dark:text-gray-200 mb-1">{messageForModelText}</p>
        )}
        */}
        {customUI}
      </div>
    );
  }

  // Nếu không phải là action hiển thị map, không render gì cả
  return null;
};

// Component chính cho ToolResponsePayload
const ToolResponseLog = ({ message }: { message: ToolResponsePayload }) => {
  if (!message || !message.functionResponses || message.functionResponses.length === 0) {
    return null;
  }

  // Lọc ra chỉ những response có thể tạo ra UI (hiện tại là map)
  // và sau đó map qua chúng.
  // Hoặc đơn giản là để FunctionResponseItem tự quyết định trả về null.
  const displayableResponses = message.functionResponses.filter(response => {
    const responseData = response.response?.content || response.response;
    if (responseData && typeof responseData === 'object') {
      const content = responseData as any;
      return content.uiAction?.type === 'display_map' && content.uiAction.location;
    }
    return false;
  });

  // Nếu không có response nào có thể hiển thị (không có map nào), thì không render gì cả.
  if (displayableResponses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1 w-full">
      {displayableResponses.map((response, index) => (
        <FunctionResponseItem
          key={response.id || `fr-${index}-${new Date().getTime()}`}
          funcResponse={response}
        />
      ))}
    </div>
  );
};

export default ToolResponseLog;