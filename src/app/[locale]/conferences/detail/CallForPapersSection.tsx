// src/app/[locale]/conferences/detail/CallForPapersSection.tsx
'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'
import { ExternalLink } from 'lucide-react'

interface CallForPapersSectionProps {
  callForPaper: string | undefined | null
  mainLink: string | undefined | null // Đây là link gốc của hội nghị
  cfpLink?: string | undefined | null
  t: (key: string) => string
}

export const CallForPapersSection: React.FC<CallForPapersSectionProps> = ({
  callForPaper,
  mainLink,
  cfpLink,
  t
}) => {
  return (
    <section
      id='call-for-papers'
      className='mt-6 rounded-lg bg-white-pure px-2 py-4 shadow-md  md:px-4'
    >
      <div className='mb-4 flex items-center gap-2'>
        <h2 className='text-xl font-semibold md:text-2xl '>
          {t('Call_for_paper')}
        </h2>
        {cfpLink && (
          <a
            href={cfpLink}
            target='_blank'
            rel='noopener noreferrer'
            title={t('Go_to_CFP_website')}
            className='text-gray-50 transition-colors hover:text-primary'
          >
            <ExternalLink size={20} />
          </a>
        )}
      </div>

      {callForPaper ? (
        <div className='prose prose-sm max-w-none dark:prose-invert sm:prose-base [&_*]:text-primary '>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
            components={{
              // --- BẮT ĐẦU PHẦN CẬP NHẬT ---
              a: ({ node, ...props }) => {
                // Lấy href từ props của thẻ <a>
                const { href } = props

                let resolvedHref = href // Mặc định giữ nguyên href gốc

                // Chỉ xử lý khi có href và mainLink (link gốc của hội nghị)
                if (href && mainLink) {
                  try {
                    // Sử dụng URL constructor để gộp link một cách chuẩn xác.
                    // - Nếu href là link tương đối ('/path'), nó sẽ được ghép với mainLink.
                    // - Nếu href đã là link tuyệt đối ('https://...'), nó sẽ được giữ nguyên.
                    resolvedHref = new URL(href, mainLink).toString()
                  } catch (error) {
                    // Nếu có lỗi (ví dụ: mainLink không hợp lệ), giữ nguyên href gốc
                    console.error('Failed to resolve URL:', error)
                    resolvedHref = href
                  }
                }

                return (
                  <a
                    {...props}
                    href={resolvedHref} // Sử dụng link đã được xử lý
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-primary'
                  />
                )
              }
              // --- KẾT THÚC PHẦN CẬP NHẬT ---
            }}
          >
            {callForPaper}
          </ReactMarkdown>
        </div>
      ) : (
        <p className=''>{t('No_Call_for_paper_available')}</p>
      )}
    </section>
  )
}