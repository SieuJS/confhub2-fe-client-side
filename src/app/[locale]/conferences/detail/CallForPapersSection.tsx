// src/app/[locale]/conferences/detail/CallForPapersSection.tsx
'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'

interface CallForPapersSectionProps {
  callForPaper: string | undefined | null
  t: (key: string) => string
}

export const CallForPapersSection: React.FC<CallForPapersSectionProps> = ({
  callForPaper,
  t
}) => {
  return (
    <section
      id='call-for-papers'
      className='mt-6 rounded-lg bg-white-pure px-2 py-4 shadow-md  md:px-4'
    >
      <h2 className='mb-4 text-xl font-semibold md:text-2xl '>
        {t('Call_for_paper')}
      </h2>
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
