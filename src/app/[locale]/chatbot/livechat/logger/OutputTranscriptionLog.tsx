// src/app/[locale]/chatbot/livechat/logger/OutputTranscriptionLog.tsx
import React from 'react';
import { TranscriptionPayload } from '../../lib/live-chat.types';

interface OutputTranscriptionLogProps {
  transcription: TranscriptionPayload;
}

const OutputTranscriptionLog: React.FC<OutputTranscriptionLogProps> = ({ transcription }) => {
  return (
    // Loại bỏ tất cả các lớp Tailwind CSS liên quan đến nền, border, padding, margin, rounded
    // Chỉ giữ lại các lớp style text nếu cần (ví dụ: whitespace-pre-wrap)
    <div className="text-sm"> {/* Có thể thêm text-sm để thống nhất với các tin nhắn khác nếu cần */}
      {/* Không cần strong tag nữa vì nó là một phần của nội dung chính */}
      <p className="whitespace-pre-wrap">{transcription.text}</p>
    </div>
  );
};

export default OutputTranscriptionLog;