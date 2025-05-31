// src/app/[locale]/chatbot/livechat/logger/ModelTurnLog.tsx
import React, { memo } from 'react'
import { ServerContentPayload } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import { LiveServerMessage as SDKLiveServerMessage } from '@google/genai';

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
// Không cần type MarkdownComponentProps<'p'> ở đây vì ta sẽ bỏ custom components

type ModelTurnLogProps = {
  message: SDKLiveServerMessage & { serverContent: ServerContentPayload & { modelTurn: NonNullable<ServerContentPayload['modelTurn']> } }
}

const ModelTurnLog: React.FC<ModelTurnLogProps> = ({
  message
}): JSX.Element => {
  const { modelTurn } = message.serverContent;
  const { parts = [] } = modelTurn;

  const combinedText = parts
    .filter(
      part =>
        part.text !== undefined && part.text !== null && part.text !== '\n' // Giữ nguyên logic lọc này
    )
    .map(part => part.text)
    .join(''); // Nối các phần text lại, có thể thêm "\n\n" nếu muốn các part cách nhau bằng đoạn mới

  // Nếu combinedText rỗng, không render gì cả để tránh div rỗng
  if (!combinedText.trim()) {
    return <></>; // Hoặc null
  }

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
          {combinedText}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default memo(ModelTurnLog)