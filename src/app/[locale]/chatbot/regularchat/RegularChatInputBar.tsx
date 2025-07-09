// src/app/[locale]/chatbot/regularchat/RegularChatInputBar.tsx
import React from 'react';
import ChatInput, { ChatInputProps } from './ChatInput'; // Đảm bảo ChatInputProps bao gồm các props mới

/**
 * A container component that provides the "pill-shaped" styling for the chat input area.
 * This component is now responsible for the responsive layout.
 */
const RegularChatInputBar: React.FC<ChatInputProps> = (props) => {
  return (
    // Container này giờ sẽ chịu trách nhiệm hoàn toàn cho style "viên thuốc"
    // và các thuộc tính responsive của nó.
    <div className='mx-2 mb-2 flex items-center gap-2 rounded-full border border-gray-200 bg-gray-100 p-1.5 text-sm transition-shadow focus-within:ring-2 focus-within:ring-blue-500 dark:border-gray-600 dark:bg-gray-900/50 sm:mx-4 sm:p-2'>
      {/* Truyền tất cả props xuống ChatInput component. */}
      <ChatInput {...props} />
    </div>
  );
};

export default RegularChatInputBar;