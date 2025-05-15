// src/app/[locale]/chatbot/chat/ChatMessageDisplay.tsx
import React, { useState, useEffect, useRef } from 'react';
import type { ReactHTML, PropsWithChildren } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import {
  MessageType,
  ThoughtStep
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Đảm bảo đường dẫn đúng
import { TriangleAlert, Copy, Pencil, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import Map from '../../conferences/detail/Map'; // Đảm bảo component Map responsive
import ThoughtProcess from './ThoughtProcess'; // Đảm bảo component ThoughtProcess responsive
import { useSettingsStore } from '../stores';
import { useShallow } from 'zustand/react/shallow';
import { FrontendAction, ItemFollowStatusUpdatePayload } from '@/src/app/[locale]/chatbot/lib/regular-chat.types'; // Direct import for clarity
import FollowUpdateDisplay from './FollowUpdateDisplay'; // <<< IMPORT NEW COMPONENT

type MarkdownComponentProps<T extends keyof ReactHTML> = PropsWithChildren<
  JSX.IntrinsicElements[T] & {
    node?: unknown;
  }
>;
interface ChatMessageDisplayProps {
  id: string;
  message: string;
  isUser: boolean;
  type: MessageType;
  thoughts?: ThoughtStep[];
  location?: string;
  action?: FrontendAction; // <<< ADDED ACTION PROP
  isInsideSmallContainer?: boolean;
}

const ChatMessageDisplay: React.FC<ChatMessageDisplayProps> = ({
  id,
  message,
  isUser,
  type = 'text',
  thoughts,
  location,
  action, // <<< DESTRUCTURE ACTION PROP
  isInsideSmallContainer = false
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { isThoughtProcessHiddenInFloatingChat } = useSettingsStore(
    useShallow(state => ({
      isThoughtProcessHiddenInFloatingChat: state.isThoughtProcessHiddenInFloatingChat,
    }))
  );
  const bubbleRef = useRef<HTMLDivElement>(null);
  const [modelMessageShouldBeFullWidth, setModelMessageShouldBeFullWidth] = useState(false);

  useEffect(() => {
    if (!isUser && isInsideSmallContainer && bubbleRef.current) {
      const bubbleElement = bubbleRef.current;
      const parentElement = bubbleElement.parentElement;
      if (parentElement) {
        const initialBubbleWidth = bubbleElement.offsetWidth;
        const parentWidth = parentElement.offsetWidth;
        const thresholdWidth = parentWidth * 0.95;
        setModelMessageShouldBeFullWidth(initialBubbleWidth > thresholdWidth);
      }
    } else {
      setModelMessageShouldBeFullWidth(false);
    }
  }, [message, isUser, isInsideSmallContainer, id, type]); // Added type, as different types might affect initial width


  const handleCopyClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (isCopied) return;
    navigator.clipboard
      .writeText(message)
      .then(() => {
        toast.success('Copied to clipboard!');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy message: ', err);
        toast.error('Copy failed. Please try again.');
      });
  };

  const handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    // console.log('Edit button clicked for message:', message);
  };

  const getWidthAndMaxWidthClasses = () => {
    if (isInsideSmallContainer) {
      if (!isUser) {
        // For map and follow_update, consider them full-width in small container
        if (type === 'map' || type === 'follow_update') return 'w-full max-w-full';
        return modelMessageShouldBeFullWidth
          ? 'w-full max-w-full'
          : 'w-auto max-w-full';
      }
      return 'w-auto max-w-full sm:max-w-[90%] md:max-w-[80%]';
    }
    // For map and follow_update, give them more space on larger screens if needed,
    // but still respect overall content width constraints for chat.
    if (type === 'map' || type === 'follow_update') return 'w-auto max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[70%]';

    return 'w-auto max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[75%] xl:max-w-[70%]';
  };


  const bubbleClasses = `
    group relative
    ${getWidthAndMaxWidthClasses()}
    p-2.5 sm:p-3 rounded-lg shadow-sm flex flex-col text-sm
    ${isUser
      ? 'bg-blue-500 text-white rounded-br-none dark:bg-blue-600'
      : type === 'error'
        ? 'bg-red-100 text-red-700 border border-red-200 rounded-bl-none dark:bg-red-900/30 dark:text-red-300 dark:border-red-700/50'
        : type === 'warning'
          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 rounded-bl-none dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50'
          // For follow_update, use the default bot message style. The inner component will have its own distinctive styling.
          : 'bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
    }
    // Specific width handling for map was in getWidthAndMaxWidthClasses, keeping it there.
  `;

  const shouldShowThoughtProcess =
    !isUser &&
    thoughts &&
    thoughts.length > 0 &&
    (!isInsideSmallContainer || (isInsideSmallContainer && !isThoughtProcessHiddenInFloatingChat));

  return (
    <div ref={bubbleRef} className={bubbleClasses}>
      {type === 'error' && (
        <TriangleAlert className='absolute -left-1.5 -top-1.5 mr-1.5 inline-block h-4 w-4 rounded-full bg-white p-0.5 text-red-600 shadow dark:bg-gray-800 dark:text-red-400' />
      )}
      {type === 'warning' && (
        <TriangleAlert className='absolute -left-1.5 -top-1.5 mr-1.5 inline-block h-4 w-4 rounded-full bg-white p-0.5 text-yellow-600 shadow dark:bg-gray-800 dark:text-yellow-400' />
      )}

      {type === 'map' && location ? (
        <div className='map-content-wrapper py-1'>
          {/* Display the main 'message' if it contains relevant text for the map */}
          {message && message.toLowerCase() !== `showing map for: ${location.toLowerCase()}` && (
            <p className='mb-1.5 text-sm font-medium text-gray-700 sm:mb-2 dark:text-gray-300'>{message}</p>
          )}
          <Map location={location} />
        </div>
      ) : type === 'follow_update' && action?.type === 'itemFollowStatusUpdated' ? ( // <<< NEW RENDERING LOGIC
        <div className="follow-update-outer-wrapper"> {/* No extra py-1, FollowUpdateDisplay has padding */}
          {/* The main 'message' (e.g., "Successfully followed X") can act as a header */}
          {message && (
            <p className='mb-1 text-sm text-gray-800 dark:text-gray-100'>{message}</p>
          )}
          <FollowUpdateDisplay payload={action.payload as ItemFollowStatusUpdatePayload} />
        </div>
      ) : (
        <div className={`message-content break-words`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ node: _, ...props }: MarkdownComponentProps<'p'>) => <p {...props} />,
              a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
                <a
                  {...props}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-600 hover:underline dark:text-blue-400'
                />
              ),
              pre: ({ node, ...props }) => (
                <pre
                  className='my-2 overflow-x-auto rounded-md bg-gray-200 p-1.5 text-xs sm:p-2 sm:text-sm dark:bg-gray-800 dark:text-gray-300'
                  {...props}
                />
              ),
              code: ({ node, ...props }) => (
                <code
                  className='rounded bg-gray-200 px-0.5 py-0.5 text-xs font-mono text-red-600 sm:px-1 dark:bg-gray-600 dark:text-red-400'
                  {...props}
                />
              ),
              h1: ({ node, ...props }) => (
                <h1 className='my-3 text-xl font-bold sm:my-4 sm:text-2xl dark:text-white' {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className='my-2 text-lg font-semibold sm:my-3 sm:text-xl dark:text-gray-100' {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className='my-1.5 text-base font-medium sm:my-2 sm:text-lg dark:text-gray-200' {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className='my-1.5 list-inside list-disc pl-0.5 sm:my-2 sm:pl-1 dark:text-gray-300' {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className='my-1.5 list-inside list-decimal pl-0.5 sm:my-2 sm:pl-1 dark:text-gray-300' {...props} />
              ),
              li: ({ node, ...props }) => <li className='my-0.5 sm:my-1 dark:text-gray-300' {...props} />
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
      )}

      {/* Action buttons: Do not show for follow_update or map type if they occupy the whole space */}
      {(isUser || (type !== 'map' && type !== 'follow_update' && !isUser)) && (
        <div
          className={`absolute -bottom-2 flex space-x-1 opacity-0 transition-opacity duration-150 focus-within:opacity-100 group-hover:opacity-100
                            ${isUser ? '-right-2' : '-left-2'}`}
        >
          {/* Copy button should still work for the main text message */}
          <button
            onClick={handleCopyClick}
            className={`rounded-full border border-gray-300 bg-white p-1.5 text-gray-500 shadow-sm transition-colors duration-150 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200 ${isCopied ? 'text-green-500 dark:text-green-400' : ''}`}
            aria-label={isCopied ? 'Copied' : 'Copy message'}
            title={isCopied ? 'Copied!' : 'Copy message'}
            disabled={isCopied}
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          {isUser && (
            <button
              onClick={handleEditClick}
              className={`rounded-full border border-gray-300 bg-white p-1.5 text-gray-500 shadow-sm hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-200`}
              aria-label='Edit message'
              title='Edit message'
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
      )}

      {shouldShowThoughtProcess && (
        <div className='mt-2 border-t border-black/10 pt-1.5 sm:mt-3 sm:pt-2 dark:border-white/20'>
          <ThoughtProcess thoughts={thoughts} />
        </div>
      )}
    </div>
  );
};

export default ChatMessageDisplay;