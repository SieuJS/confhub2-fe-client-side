// src/app/[locale]/chatbot/livechat/logger/OutputTranscriptionLog.tsx
import React from 'react';
import { TranscriptionPayload } from '../../lib/live-chat.types';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'

interface OutputTranscriptionLogProps {
  transcription: TranscriptionPayload;
}

const OutputTranscriptionLog: React.FC<OutputTranscriptionLogProps> = ({ transcription }) => {
  return (
    // Class `text-sm text-inherit` ở đây có thể vẫn hữu ích nếu component này
    // được đặt trong một context có font-size hoặc color khác.
    // `prose` sẽ override màu chữ và một số thuộc tính font bên trong nó.
    <div className='text-sm text-inherit'>
      {/*
            Áp dụng Tailwind Typography:
            - prose: class chính
            - prose-sm: kích thước nhỏ, phù hợp với log/chat. Bạn có thể dùng prose-base nếu muốn to hơn.
            - dark:prose-invert: cho dark mode
            - max-w-none: để nội dung markdown chiếm hết chiều rộng của container cha,
                          quan trọng trong layout hẹp như log.
          */}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // BỎ HẦU HẾT CÁC CUSTOM STYLES.
            // Chỉ giữ lại những gì thực sự cần, ví dụ: target, rel cho <a>
            a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
              <a
                {...props}
                target='_blank'
                rel='noopener noreferrer'
              // className của plugin typography sẽ tự xử lý màu sắc và gạch chân
              />
            ),
            // Các thẻ p, pre, code, h1-h3, ul, ol, li sẽ được `prose` tự động style.
            // Ví dụ, class `part part-text mb-2 last:mb-0` trên <p> không còn cần thiết
            // vì `prose` sẽ quản lý margin giữa các đoạn văn.
            // Nếu `part` và `part-text` có ý nghĩa đặc biệt khác (ví dụ, cho testing selectors),
            // bạn có thể xem xét giữ lại, nhưng thường là không cần cho styling.
          }}
        >
          {transcription.text}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default OutputTranscriptionLog;