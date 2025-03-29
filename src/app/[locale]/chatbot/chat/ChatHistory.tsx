 // Trong ChatHistory.tsx
 import React, { useRef, useEffect } from 'react';
 import ChatMessage from './ChatMessage';
 import ChartDisplay from './ChartDisplay';
 import { ChatMessageType } from './ChatBot'; // Giả sử bạn export type này

 interface ChatHistoryProps {
     messages: ChatMessageType[];
 }

 const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
     const chatHistoryRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
         // console.log("ChatHistory received messages prop:", messages); // Bỏ comment nếu cần debug
         const chatHistoryElement = chatHistoryRef.current;
         if (chatHistoryElement) {
             // Cuộn xuống dưới cùng một cách mượt mà hơn khi có tin nhắn mới
             chatHistoryElement.scrollTo({
                 top: chatHistoryElement.scrollHeight,
                 behavior: 'smooth' // Thêm hiệu ứng cuộn mượt
             });
         }
     }, [messages]); // Chỉ chạy khi messages thay đổi

     return (
         // THAY ĐỔI Ở ĐÂY: Thêm class `flex-1`
         <div
             id="chat-history"
             className="flex-1 p-2 border border-gray-200 rounded-lg mb-2 relative overflow-y-auto" // Giữ mb-4 hoặc mb-5 tùy ý
             ref={chatHistoryRef}
         >
             {messages.map((msg, index) => {
                 // max-w-full là ổn để tin nhắn không bị giới hạn chiều rộng không cần thiết
                 const containerClasses = `message-container p-3 rounded-xl clear-both max-w-full ${msg.isUser ? 'float-right text-right' : 'float-left text-left'}`;
                 // Sử dụng flex justify-end/start thay cho float để căn chỉnh tốt hơn
                 return (
                     <div key={index} className={containerClasses}>
                         {/* Bọc nội dung trong một div con để áp dụng background và padding */}
                         <div className={`inline-block`}> {/* Giới hạn chiều rộng của bong bóng chat */}
                             {msg.isUser ? (
                                 <ChatMessage message={msg.message} isUser={msg.isUser} />
                             ) : msg.type === 'chart' ? (
                                 <ChartDisplay echartsConfig={msg.echartsConfig} sqlResult={msg.sqlResult} description={msg.description} />
                             ) : (
                                 <ChatMessage message={msg.message} isUser={msg.isUser} />
                             )}
                         </div>
                     </div>
                 );
             })}
         </div>
     );
 };

 export default ChatHistory;