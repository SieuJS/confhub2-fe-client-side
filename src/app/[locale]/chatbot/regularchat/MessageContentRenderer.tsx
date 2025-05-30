// src/app/[locale]/chatbot/regularchat/MessageContentRenderer.tsx
import React from 'react';
import type { ReactHTML, PropsWithChildren } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkBreaks from 'remark-breaks';
import {
  MessageType,
  FrontendAction,
  ItemFollowStatusUpdatePayload,
  DisplayConferenceSourcesPayload,
  ChatMessageType
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import Map from '../../conferences/detail/Map';
import FollowUpdateDisplay from './FollowUpdateDisplay';
import ConferenceSourceDisplay from './ConferenceSourceDisplay';
import { Part as GeminiPartFromSDK } from '@google/genai';
import FilePartDisplay from './FilePartDisplay';

type MarkdownComponentProps<T extends keyof ReactHTML> = PropsWithChildren<
  JSX.IntrinsicElements[T] & { node?: unknown; }
>;

interface MessageContentRendererProps {
  text?: string;
  parts?: GeminiPartFromSDK[];
  files?: ChatMessageType['files'];
  botFiles?: ChatMessageType['botFiles'];
  type: MessageType;
  location?: string;
  action?: FrontendAction;
}


const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({
  text,
  parts,
  files,
  botFiles,
  type,
  location,
  action,
}) => {
  const renderMarkdown = (content: string | undefined) => {
    // (Giữ nguyên hàm renderMarkdown của bạn)
    if (!content) return null;
    return (
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
        {content}
      </ReactMarkdown>
    );
  };

  // --- Specific Type Rendering ---
  if (type === 'map' && location) {
    return (
      <div className='map-content-wrapper py-1'>
        {text && text.toLowerCase() !== `showing map for: ${location.toLowerCase()}` && (
          <div className='mb-1.5 text-sm font-medium text-gray-700 sm:mb-2 dark:text-gray-300'>{renderMarkdown(text)}</div>
        )}
        <Map location={location} />
      </div>
    );
  }

  if (type === 'follow_update' && action?.type === 'itemFollowStatusUpdated') {
    return (
      <div className="follow-update-outer-wrapper">
        {text && (
          <div className='mb-1 text-sm text-gray-800 dark:text-gray-100'>{renderMarkdown(text)}</div>
        )}
        <FollowUpdateDisplay payload={action.payload as ItemFollowStatusUpdatePayload} />
      </div>
    );
  }

  if (action?.type === 'displayConferenceSources') {
    return (
      <div className="conference-sources-container">
        {text && (
          <div className={`message-content break-words mb-1`}>
            {renderMarkdown(text)}
          </div>
        )}
        <ConferenceSourceDisplay payload={action.payload as DisplayConferenceSourcesPayload} />
      </div>
    );
  }

  // --- Multimodal and General Text Rendering ---

  const isPurelySystemPartMessage = parts && parts.length > 0 &&
                                 parts.every(p => p.functionCall || p.functionResponse) &&
                                 !parts.some(p => p.text || p.inlineData || p.fileData) &&
                                 !text && (!files || files.length === 0) && (!botFiles || botFiles.length === 0);

  if (isPurelySystemPartMessage) {
    return null;
  }

  const contentToRender: React.ReactNode[] = [];

  if (text) {
    const markdownOutput = renderMarkdown(text);
    if (markdownOutput) {
      contentToRender.push(
        <div key="primary-text" className={`message-content break-words`}>
          {markdownOutput}
        </div>
      );
    }
  }

  if (parts && parts.length > 0) {
    parts.forEach((part, index) => {
      if (part.text) {
        const primaryTextAlreadyRendered = contentToRender.some(el => (el as JSX.Element)?.key === "primary-text");
        if (!text || (part.text !== text && !primaryTextAlreadyRendered)) {
          const markdownOutput = renderMarkdown(part.text);
          if (markdownOutput) {
            contentToRender.push(
              <div key={`part-sdk-text-${index}`} className={`message-content break-words ${primaryTextAlreadyRendered || text ? 'mt-1' : ''}`}>
                {markdownOutput}
              </div>
            );
          }
        }
      } else if (part.inlineData || part.fileData) {
        contentToRender.push(
          <FilePartDisplay key={`part-sdk-file-${index}`} item={part} />
        );
      }
    });
  }

  if (files && files.length > 0) {
    contentToRender.push(
      <div key="user-files-container" className="mt-2 space-y-2">
        {files.map((file, index) => (
          <FilePartDisplay key={`user-file-${index}`} item={file} />
        ))}
      </div>
    );
  }

  if (botFiles && botFiles.length > 0) {
    const partFileKeys = new Set(
        (parts || [])
        .filter(p => p.fileData || p.inlineData)
        .map(p => {
            if (p.fileData?.fileUri) return p.fileData.fileUri;
            // Sửa lỗi ở đây:
            if (p.inlineData?.data) return p.inlineData.data.substring(0,50);
            return Math.random().toString();
        })
    );

    const uniqueBotFilesToRender = botFiles.filter(bf => {
        let key: string;
        if (bf.uri) {
            key = bf.uri;
        } else if (bf.inlineData?.data) { // Sửa lỗi ở đây
            key = bf.inlineData.data.substring(0,50);
        } else {
            key = Math.random().toString();
        }
        return !partFileKeys.has(key);
    });

    if (uniqueBotFilesToRender.length > 0) {
        contentToRender.push(
          <div key="bot-files-container" className="mt-2 space-y-2">
            {uniqueBotFilesToRender.map((botFile, index) => (
              <FilePartDisplay key={`bot-file-${index}`} item={botFile} />
            ))}
          </div>
        );
    }
  }

  if (contentToRender.length === 0) {
    if ((type === 'text' && text === "") ||
        (type === 'multimodal' && !text && (!parts || parts.length === 0) && (!files || files.length === 0) && (!botFiles || botFiles.length === 0))) {
      return <div className="message-content min-h-[1.2em]"></div>;
    }
    return <div className="message-content break-words italic text-gray-500">No displayable content.</div>;
  }

  return <>{contentToRender}</>;
};

export default MessageContentRenderer;