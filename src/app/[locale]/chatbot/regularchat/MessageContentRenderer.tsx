// src/app/[locale]/chatbot/regularchat/MessageContentRenderer.tsx
import React from 'react';
import type { ReactHTML, PropsWithChildren } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import { MessageType, FrontendAction, ItemFollowStatusUpdatePayload, DisplayConferenceSourcesPayload } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // <<< Thêm DisplayConferenceSourcesPayload
import Map from '../../conferences/detail/Map';
import FollowUpdateDisplay from './FollowUpdateDisplay';
import ConferenceSourceDisplay from './ConferenceSourceDisplay'; // <<< IMPORT COMPONENT MỚI

type MarkdownComponentProps<T extends keyof ReactHTML> = PropsWithChildren<
  JSX.IntrinsicElements[T] & { node?: unknown; }
>;

interface MessageContentRendererProps {
  message: string;
  type: MessageType;
  location?: string;
  action?: FrontendAction;
}

const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({
  message,
  type,
  location,
  action,
}) => {
  if (type === 'map' && location) {
    return (
      <div className='map-content-wrapper py-1'>
        {message && message.toLowerCase() !== `showing map for: ${location.toLowerCase()}` && (
          <p className='mb-1.5 text-sm font-medium text-gray-700 sm:mb-2 dark:text-gray-300'>{message}</p>
        )}
        <Map location={location} />
      </div>
    );
  }

  if (type === 'follow_update' && action?.type === 'itemFollowStatusUpdated') {
    return (
      <div className="follow-update-outer-wrapper">
        {message && (
          <p className='mb-1 text-sm text-gray-800 dark:text-gray-100'>{message}</p>
        )}
        <FollowUpdateDisplay payload={action.payload as ItemFollowStatusUpdatePayload} />
      </div>
    );
  }

  // <<< THÊM CASE MỚI CHO displayConferenceSources >>>
  if (action?.type === 'displayConferenceSources') {
    return (
      <div className="conference-sources-container">
        {/* Vẫn hiển thị message gốc từ bot nếu có */}
        {message && (
          <div className={`message-content break-words mb-1`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeRaw]}
              components={{
                p: ({ node: _, ...props }: MarkdownComponentProps<'p'>) => <p {...props} />,
                a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
                  <a {...props} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline dark:text-blue-400' />
                ),
                pre: ({ node, ...props }) => <pre className='my-2 overflow-x-auto rounded-md bg-gray-200 p-1.5 text-xs sm:p-2 sm:text-sm dark:bg-gray-800 dark:text-gray-300' {...props} />,
                code: ({ node, ...props }) => <code className='rounded bg-gray-200 px-0.5 py-0.5 text-xs font-mono text-red-600 sm:px-1 dark:bg-gray-600 dark:text-red-400' {...props} />,
                h1: ({ node, ...props }) => <h1 className='my-3 text-xl font-bold sm:my-4 sm:text-2xl dark:text-white' {...props} />,
                h2: ({ node, ...props }) => <h2 className='my-2 text-lg font-semibold sm:my-3 sm:text-xl dark:text-gray-100' {...props} />,
                h3: ({ node, ...props }) => <h3 className='my-1.5 text-base font-medium sm:my-2 sm:text-lg dark:text-gray-200' {...props} />,
                ul: ({ node, ...props }) => <ul className='my-1.5 list-inside list-disc pl-0.5 sm:my-2 sm:pl-1 dark:text-gray-300' {...props} />,
                ol: ({ node, ...props }) => <ol className='my-1.5 list-inside list-decimal pl-0.5 sm:my-2 sm:pl-1 dark:text-gray-300' {...props} />,
                li: ({ node, ...props }) => <li className='my-0.5 sm:my-1 dark:text-gray-300' {...props} />,
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        )}
        <ConferenceSourceDisplay payload={action.payload as DisplayConferenceSourcesPayload} />
      </div>
    );
  }

  // Default to text/markdown
  return (
    <div className={`message-content break-words`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ node: _, ...props }: MarkdownComponentProps<'p'>) => <p {...props} />,
          a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
            <a {...props} target='_blank' rel='noopener noreferrer' className='text-blue-600 hover:underline dark:text-blue-400' />
          ),
          pre: ({ node, ...props }) => <pre className='my-2 overflow-x-auto rounded-md bg-gray-200 p-1.5 text-xs sm:p-2 sm:text-sm dark:bg-gray-800 dark:text-gray-300' {...props} />,
          code: ({ node, ...props }) => <code className='rounded bg-gray-200 px-0.5 py-0.5 text-xs font-mono text-red-600 sm:px-1 dark:bg-gray-600 dark:text-red-400' {...props} />,
          h1: ({ node, ...props }) => <h1 className='my-3 text-xl font-bold sm:my-4 sm:text-2xl dark:text-white' {...props} />,
          h2: ({ node, ...props }) => <h2 className='my-2 text-lg font-semibold sm:my-3 sm:text-xl dark:text-gray-100' {...props} />,
          h3: ({ node, ...props }) => <h3 className='my-1.5 text-base font-medium sm:my-2 sm:text-lg dark:text-gray-200' {...props} />,
          ul: ({ node, ...props }) => <ul className='my-1.5 list-inside list-disc pl-0.5 sm:my-2 sm:pl-1 dark:text-gray-300' {...props} />,
          ol: ({ node, ...props }) => <ol className='my-1.5 list-inside list-decimal pl-0.5 sm:my-2 sm:pl-1 dark:text-gray-300' {...props} />,
          li: ({ node, ...props }) => <li className='my-0.5 sm:my-1 dark:text-gray-300' {...props} />,
        }}
      >
        {message}
      </ReactMarkdown>
    </div>
  );
};

export default MessageContentRenderer;