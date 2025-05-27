// src/app/[locale]/chatbot/livechat/logger/ModelTurnLog.tsx
import React, { memo } from 'react'
import { ServerContentPayload } from '@/src/app/[locale]/chatbot/lib/live-chat.types';
import { LiveServerMessage as SDKLiveServerMessage } from '@google/genai';

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'

type ModelTurnLogProps = {
  // The component receives the full SDKLiveServerMessage that has passed isServerContentMessage
  // and where serverContent has passed isModelTurn.
  message: SDKLiveServerMessage & { serverContent: ServerContentPayload & { modelTurn: NonNullable<ServerContentPayload['modelTurn']> } }
}

const ModelTurnLog: React.FC<ModelTurnLogProps> = ({
  message
}): JSX.Element => {
  // serverContent and modelTurn are guaranteed to exist due to the refined prop type
  const { modelTurn } = message.serverContent;
  // Fix: Provide an empty array as default if 'parts' is undefined
  const { parts = [] } = modelTurn; // parts is SDK Part[] | undefined -> now guaranteed to be Part[]

  const combinedText = parts
    .filter(
      part =>
        part.text !== undefined && part.text !== null && part.text !== '\n'
    )
    .map(part => part.text)
    .join('')

  return (
    <div className='text-sm text-inherit'>
      {combinedText && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ node, ...props }) => (
              <p className='part part-text mb-2 last:mb-0' {...props} />
            ),
            a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
              <a
                {...props}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:underline dark:text-blue-400'
              />
            ),
            pre: ({ node, ...props }) => (
              <pre
                className='my-2 overflow-x-auto rounded-md bg-gray-100 p-2 dark:bg-gray-800 dark:text-gray-50'
                {...props}
              />
            ),
            code: ({ node, ...props }) => (
              <code
                className='rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-800 dark:text-gray-50'
                {...props}
              />
            ),
            h1: ({ node, ...props }) => (
              <h1 className='my-4 text-2xl font-bold text-inherit' {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className='my-3 text-xl font-semibold text-inherit' {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className='my-2 text-lg font-medium text-inherit' {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className='my-2 list-inside list-disc pl-4 text-inherit' {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className='my-2 list-inside list-decimal pl-4 text-inherit' {...props} />
            ),
            li: ({ node, ...props }) => <li className='my-1 text-inherit' {...props} />
          }}
        >
          {combinedText}
        </ReactMarkdown>
      )}
    </div>
  )
}

export default memo(ModelTurnLog)