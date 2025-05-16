import React, { memo } from 'react'
import { ServerContentMessage, ModelTurn } from '../multimodal-live-types'
import RenderPart from './RenderPart'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import rehypeRaw from 'rehype-raw'

type ModelTurnLogProps = {
  message: ServerContentMessage
}

const ModelTurnLog: React.FC<ModelTurnLogProps> = ({
  message
}): JSX.Element => {
  const serverContent = message.serverContent
  const { modelTurn } = serverContent as ModelTurn
  const { parts } = modelTurn

  const combinedText = parts
    .filter(
      part =>
        part.text !== undefined && part.text !== null && part.text !== '\n'
    )
    .map(part => part.text)
    .join('')

  // Removed outer div styling (m-4, rounded-lg, bg-green-100, p-4, shadow-md, dark:bg-gray-900)
  // LogEntry now handles the bubble styling.
  // The styling for ReactMarkdown components is kept as it formats the content *within* the bubble.
  return (
    <div className='text-sm text-inherit'> {/* Ensure consistent text size and color inheritance */}
      {combinedText && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={{
            p: ({ node, ...props }) => (
              <p className='part part-text mb-2 last:mb-0' {...props} /> // Added mb-2 for spacing between paragraphs
            ),
            a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
              <a
                {...props}
                target='_blank'
                rel='noopener noreferrer'
                className='text-blue-500 hover:underline dark:text-blue-400' // Added dark mode for links
              />
            ),
            pre: ({ node, ...props }) => (
              <pre
                className='my-2 overflow-x-auto rounded-md bg-gray-100 p-2 dark:bg-gray-800 dark:text-gray-50' // Adjusted dark mode for pre
                {...props}
              />
            ),
            code: ({ node, ...props }) => (
              <code
                className='rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-800 dark:text-gray-50' // Adjusted dark mode for code, added py
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
              <ul className='my-2 list-inside list-disc pl-4 text-inherit' {...props} /> // Added pl-4
            ),
            ol: ({ node, ...props }) => (
              <ol className='my-2 list-inside list-decimal pl-4 text-inherit' {...props} /> // Added pl-4
            ),
            li: ({ node, ...props }) => <li className='my-1 text-inherit' {...props} />
          }}
        >
          {combinedText}
        </ReactMarkdown>
      )}
      {/* {parts
        .filter((part) => !part.text || part.text === "\n")
        .map((part, j) => (
          <RenderPart part={part} key={`model-turn-part-${j}`} />
        ))} */}
    </div>
  )
}

export default memo(ModelTurnLog)