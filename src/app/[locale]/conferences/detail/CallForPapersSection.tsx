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
  cfpLink?: string | undefined | null
  t: (key: string) => string
}

export const CallForPapersSection: React.FC<CallForPapersSectionProps> = ({
  callForPaper,
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
            title={t('Go_to_CFP_website')} // Tooltip cho người dùng
            className='text-gray-50 transition-colors hover:text-primary'
          >
            <ExternalLink size={20} />
          </a>
        )}
      </div>

      {callForPaper ? (
        // <div className='prose prose-sm max-w-none dark:prose-invert sm:prose-base'>
        <div className='prose prose-sm max-w-none dark:prose-invert sm:prose-base [&_*]:text-primary '>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
            components={{
              a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
                <a
                  {...props}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary'
                />
              )
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
