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
  files?: ChatMessageType['files']; // User uploaded files for this message
  botFiles?: ChatMessageType['botFiles']; // Bot sent files for this message
  type: MessageType;
  location?: string;
  action?: FrontendAction;
  isUserMessage?: boolean; // <<< THÊM PROP NÀY
}

const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({
  text,
  parts,
  files,
  botFiles,
  type,
  location,
  action,
  isUserMessage,
}) => {

  // --- KIỂM TRA SỚM ĐỂ BỎ QUA CÁC PART KHÔNG HIỂN THỊ ---
  // Nếu không có text, không có files, và parts chỉ chứa functionCall/functionResponse
  // thì không render gì cả.
  const hasDisplayableContentInParts = parts && parts.some(p => p.text || p.fileData || p.inlineData);

  if (
    !text &&
    (!files || files.length === 0) &&
    (!botFiles || botFiles.length === 0) &&
    (!parts || parts.length === 0 || !hasDisplayableContentInParts) &&
    type !== 'map' && // map và follow_update có thể không có text/parts nhưng vẫn render
    type !== 'follow_update' &&
    action?.type !== 'displayConferenceSources'
  ) {
    // console.log("[MessageContentRenderer] No displayable content found, returning null. Type:", type, "Text:", text, "Parts:", parts);
    return null; // Không render gì cả cho các message chỉ chứa function call/response
  }

  const renderMarkdown = (content: string | undefined) => {
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

  // --- Multimodal and General Content Rendering ---
  // --- Multimodal and General Content Rendering ---
  const fileElements: React.ReactNode[] = [];
  const textElements: React.ReactNode[] = [];
  let hasRenderedTextFromParts = false; // Giữ nguyên biến này

  // 1. Render User Files (từ prop `files`)
  if (files && files.length > 0) {
    files.forEach((file, index) => {
      // FilePartDisplay sẽ tự xử lý việc render UserFileDisplayItem
      fileElements.push(
        <FilePartDisplay key={`user-file-${index}`} item={file} isUserMessage={isUserMessage} />
      );
    });
  }

  // 2. Render files từ `parts` và gom text từ `parts`
  let textFromPartsAccumulator = ""; // Đổi tên để tránh nhầm với prop `text`

  if (parts && parts.length > 0) {
    parts.forEach((part, index) => {
      if (part.text) {
        if (!text) { // Chỉ gom text từ parts nếu prop `text` không được cung cấp
          textFromPartsAccumulator += (textFromPartsAccumulator ? "\n" : "") + part.text;
        }
      } else if (part.fileData || part.inlineData) {
        // FilePartDisplay sẽ tự xử lý việc render GeminiPartSDK (fileData/inlineData)
        // và trả về null cho các part không phải file (text, functionCall, functionResponse)
        const fileDisplayElement = <FilePartDisplay key={`part-sdk-file-${index}`} item={part} isUserMessage={isUserMessage} />;
        // Chỉ thêm vào fileElements nếu FilePartDisplay thực sự render ra gì đó (không phải null)
        // Tuy nhiên, FilePartDisplay đã tự trả về null, nên ta cứ push, React sẽ bỏ qua null elements.
        fileElements.push(fileDisplayElement);
      }
      // Các part chỉ có functionCall hoặc functionResponse sẽ được FilePartDisplay xử lý trả về null
      // và không được thêm vào fileElements ở đây.
    });

    if (!text && textFromPartsAccumulator) {
      const markdownOutput = renderMarkdown(textFromPartsAccumulator);
      if (markdownOutput) {
        textElements.push(
          <div key="text-from-parts" className="message-content break-words">
            {markdownOutput}
          </div>
        );
        hasRenderedTextFromParts = true;
      }
    }
  }

  // 3. Render Bot Files (từ prop `botFiles`)
  if (botFiles && botFiles.length > 0 && !isUserMessage) {
    // Logic kiểm tra trùng lặp có thể cần xem xét lại nếu FilePartDisplay đã xử lý tốt
    // Hiện tại, FilePartDisplay được gọi cho cả `parts` và `botFiles`.
    // Nếu `botFiles` là một cách khác để truyền cùng một file đã có trong `parts`,
    // thì logic chống trùng lặp là cần thiết.
    // Nếu `botFiles` là nguồn file riêng biệt, thì không cần chống trùng lặp.
    // Giả sử `botFiles` có thể chứa file đã có trong `parts.fileData` hoặc `parts.inlineData`
    const renderedFileKeys = new Set<string>();
    fileElements.forEach(el => {
      if (React.isValidElement(el)) {
        const item = el.props.item;
        if (item?.fileData?.fileUri) renderedFileKeys.add(item.fileData.fileUri);
        else if (item?.inlineData?.data && item?.inlineData?.mimeType) {
          renderedFileKeys.add(`data:${item.inlineData.mimeType};base64,${item.inlineData.data}`);
        } else if (item?.uri) { // For BotFileDisplayItem
          renderedFileKeys.add(item.uri);
        }
      }
    });

    botFiles.forEach((botFile, index) => {
      const key = botFile.uri || (botFile.inlineData ? `data:${botFile.inlineData.mimeType};base64,${botFile.inlineData.data}` : `prop-bot-file-unique-${index}`);
      if (!renderedFileKeys.has(key)) {
        // FilePartDisplay sẽ tự xử lý việc render BotFileDisplayItem
        fileElements.push(
          <FilePartDisplay key={`prop-bot-file-${index}`} item={botFile} isUserMessage={isUserMessage} />
        );
      }
    });
  }

  // 4. Render primary `text` (prop `text`) nếu nó chưa được render từ `parts`
  if (text && !hasRenderedTextFromParts) {
    const markdownOutput = renderMarkdown(text);
    if (markdownOutput) {
      textElements.push(
        <div key="primary-text-prop" className="message-content break-words">
          {markdownOutput}
        </div>
      );
    }
  }

  // --- Xây dựng finalContent ---
  const finalContent: React.ReactNode[] = [];
  if (textElements.length > 0) { // Ưu tiên text lên trước file nếu cả hai đều có
    finalContent.push(
      <div key="texts-container" className={`${fileElements.length > 0 ? 'mb-2' : ''}`}> {/* Thêm margin bottom nếu có file */}
        {textElements}
      </div>
    );
  }
  if (fileElements.filter(el => el !== null).length > 0) { // Chỉ thêm container nếu có file thực sự
    finalContent.push(
      <div key="files-container" className={`space-y-2 ${isUserMessage ? 'flex flex-col items-end' : ''}`}>
        {fileElements}
      </div>
    );
  }


  // Nếu sau tất cả các bước, finalContent vẫn rỗng, thì mới trả về null hoặc fallback.
  // Điều này đã được xử lý bởi kiểm tra sớm ở đầu component.
  // Nếu kiểm tra sớm không bắt được, và finalContent vẫn rỗng, đó là một trường hợp cần xem xét.
  if (finalContent.length === 0) {
    // console.log(`[MessageContentRenderer] FINAL CONTENT IS EMPTY (after all processing). Type: ${type}, Text Prop: "${text}", Files Prop: ${files?.length}, BotFiles Prop: ${botFiles?.length}, Parts Prop: ${parts?.length}`);
    // Có thể trả về một div rỗng có kích thước tối thiểu để giữ bubble chat nếu cần
    // return <div className="message-content min-h-[1.2em]"></div>;
    return null; // Hoặc đơn giản là không render gì cả
  }

  return <>{finalContent}</>;
};

export default MessageContentRenderer;