// src/app/[locale]/chatbot/regularchat/MessageContentRenderer.tsx
import React from 'react'
import type { ReactHTML, PropsWithChildren } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import {
  MessageType,
  FrontendAction,
  ItemFollowStatusUpdatePayload,
  DisplayConferenceSourcesPayload,
  ChatMessageType
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types'
import Map from '../../conferences/detail/Map'
import FollowUpdateDisplay from './FollowUpdateDisplay'
import ConferenceSourceDisplay from './ConferenceSourceDisplay'
import { Part as GeminiPartFromSDK } from '@google/genai'
import FilePartDisplay from './FilePartDisplay'

type MarkdownComponentProps<T extends keyof ReactHTML> = PropsWithChildren<
  JSX.IntrinsicElements[T] & { node?: unknown }
>

interface MessageContentRendererProps {
  text?: string
  parts?: GeminiPartFromSDK[]
  files?: ChatMessageType['files'] // User uploaded files for this message
  botFiles?: ChatMessageType['botFiles'] // Bot sent files for this message
  type: MessageType
  location?: string
  action?: FrontendAction
  isUserMessage?: boolean // <<< THÊM PROP NÀY
}

const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({
  text,
  parts,
  files,
  botFiles,
  type,
  location,
  action,
  isUserMessage
}) => {
  // --- KIỂM TRA SỚM ĐỂ BỎ QUA CÁC PART KHÔNG HIỂN THỊ ---
  // Nếu không có text, không có files, và parts chỉ chứa functionCall/functionResponse
  // thì không render gì cả.
  const hasDisplayableContentInParts =
    parts && parts.some(p => p.text || p.fileData || p.inlineData)

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
    return null // Không render gì cả cho các message chỉ chứa function call/response
  }
  const renderMarkdown = (content: string | undefined) => {
    if (!content) return null
    return (
      // ÁP DỤNG TAILWIND TYPOGRAPHY TẠI ĐÂY

      <div
        className={`prose-xs prose max-w-none dark:prose-invert sm:prose-sm  ${isUserMessage ? '[&_*]:text-white' : ''}`}
      >
        {/*
          prose: class chính của plugin
          prose-sm sm:prose-base: Điều chỉnh kích thước font chữ (tùy chọn, có thể bỏ nếu mặc định đã ổn)
          dark:prose-invert: Tự động đổi màu cho dark mode (nếu bạn dùng class 'dark' ở thẻ html/body)
          max-w-none: Mặc định `prose` sẽ giới hạn chiều rộng của nội dung.
                      Trong chat bubble, ta thường muốn nó chiếm hết chiều rộng có thể, nên dùng `max-w-none`.
        */}
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // GIỜ BẠN CÓ THỂ BỎ HẦU HẾT CÁC CUSTOM STYLES Ở ĐÂY
            // @tailwindcss/typography sẽ lo việc này
            // Chỉ giữ lại những gì thực sự cần override hoặc những thuộc tính không liên quan đến style trực tiếp
            // Ví dụ: target, rel cho thẻ <a>
            a: ({ ...props }: React.HTMLAttributes<HTMLAnchorElement>) => (
              <a {...props} target='_blank' rel='noopener noreferrer' />
              // Plugin typography sẽ tự style màu sắc, gạch chân cho link
              // Nếu muốn màu cụ thể, bạn vẫn có thể thêm class: className='text-blue-600 hover:underline dark:text-blue-400'
              // nhưng thường thì màu mặc định của prose đã khá ổn.
            )
            // Các thẻ h1, h2, h3, p, ul, ol, li, pre, code sẽ được `prose` style.
            // Bạn có thể xóa các class tùy chỉnh ở đây để xem `prose` hoạt động ra sao.
            // Nếu cần tinh chỉnh nhỏ, bạn có thể thêm lại class, nhưng nên hạn chế.
            // Ví dụ, nếu bạn muốn code block có nền khác biệt một chút so với prose mặc định:
            // pre: ({ node, ...props }) => <pre className='bg-gray-100 dark:bg-gray-800 rounded-md' {...props} />,
            // code: ({ node, ...props }) => <code className='text-red-600 dark:text-red-400 px-1 rounded' {...props} />,
            // Nhưng hãy thử bỏ trống trước!
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  // --- Specific Type Rendering ---
  if (type === 'map' && location) {
    return (
      <div className='map-content-wrapper py-1'>
        {text &&
          text.toLowerCase() !==
            `showing map for: ${location.toLowerCase()}` && (
            <div className='mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 sm:mb-2'>
              {renderMarkdown(text)}
            </div>
          )}
        <Map location={location} />
      </div>
    )
  }

  if (type === 'follow_update' && action?.type === 'itemFollowStatusUpdated') {
    return (
      <div className='follow-update-outer-wrapper'>
        {text && (
          <div className='mb-1 text-sm text-gray-800 dark:text-gray-100'>
            {renderMarkdown(text)}
          </div>
        )}
        <FollowUpdateDisplay
          payload={action.payload as ItemFollowStatusUpdatePayload}
        />
      </div>
    )
  }

  if (action?.type === 'displayConferenceSources') {
    return (
      <div className='conference-sources-container'>
        {text && (
          <div className={`message-content mb-1 break-words`}>
            {renderMarkdown(text)}
          </div>
        )}
        <ConferenceSourceDisplay
          payload={action.payload as DisplayConferenceSourcesPayload}
        />
      </div>
    )
  }
  // --- Multimodal and General Content Rendering ---
  const fileElements: React.ReactNode[] = []
  const textElements: React.ReactNode[] = []
  let hasRenderedTextFromParts = false

  // 1. Render User Files (from prop `files`) - ONLY if it's a user message
  if (isUserMessage && files && files.length > 0) {
    files.forEach((file, index) => {
      fileElements.push(
        <FilePartDisplay
          key={`user-file-${index}`}
          item={file}
          isUserMessage={isUserMessage}
        />
      )
    })
  }

  // 2. Process `parts`
  let textFromPartsAccumulator = ''

  if (parts && parts.length > 0) {
    parts.forEach((part, index) => {
      if (part.text) {
        if (!text) {
          textFromPartsAccumulator +=
            (textFromPartsAccumulator ? '\n' : '') + part.text
        }
      } else if (part.fileData || part.inlineData) {
        // For BOT messages, render files from parts.
        // For USER messages, files from parts (like GCS URIs) should NOT be rendered here,
        // as they are already handled by the `files` prop (UserFileDisplayItem).
        if (!isUserMessage) {
          // <<< KEY CHANGE HERE
          const fileDisplayElement = (
            <FilePartDisplay
              key={`part-sdk-file-${index}`}
              item={part}
              isUserMessage={isUserMessage}
            />
          )
          fileElements.push(fileDisplayElement)
        }
        // If it IS a user message, we still want to acknowledge that the part had fileData/inlineData
        // for the `hasDisplayableContentInParts` check, but we don't render it again.
        // The `hasDisplayableContentInParts` check at the top already uses `parts.some(...)`
        // so no extra logic needed here for that.
      }
      // functionCall/functionResponse parts are handled by FilePartDisplay returning null
    })

    if (!text && textFromPartsAccumulator) {
      const markdownOutput = renderMarkdown(textFromPartsAccumulator)
      if (markdownOutput) {
        textElements.push(
          <div key='text-from-parts' className='message-content break-words'>
            {markdownOutput}
          </div>
        )
        hasRenderedTextFromParts = true
      }
    }
  }

  // 3. Render Bot Files (from prop `botFiles`) - ONLY if it's a bot message
  //    And ensure no duplicates if bot files might also appear in `parts`
  if (!isUserMessage && botFiles && botFiles.length > 0) {
    const renderedFileKeys = new Set<string>()
    // Populate renderedFileKeys from files already added from `parts` (for bot messages)
    fileElements.forEach(el => {
      if (React.isValidElement(el) && el.props.item) {
        const item = el.props.item as GeminiPartFromSDK // Assume items from parts are GeminiPartSDK
        if (item.fileData?.fileUri) renderedFileKeys.add(item.fileData.fileUri)
        else if (item.inlineData?.data && item.inlineData?.mimeType) {
          renderedFileKeys.add(
            `data:${item.inlineData.mimeType};base64,${item.inlineData.data}`
          )
        }
      }
    })

    botFiles.forEach((botFile, index) => {
      const key =
        botFile.uri ||
        (botFile.inlineData
          ? `data:${botFile.inlineData.mimeType};base64,${botFile.inlineData.data}`
          : `prop-bot-file-unique-${index}`)
      if (!renderedFileKeys.has(key)) {
        fileElements.push(
          <FilePartDisplay
            key={`prop-bot-file-${index}`}
            item={botFile}
            isUserMessage={isUserMessage}
          />
        )
        renderedFileKeys.add(key) // Add to set after pushing
      }
    })
  }

  // 4. Render primary `text` (prop `text`) if it wasn't already rendered from `parts`
  if (text && !hasRenderedTextFromParts) {
    const markdownOutput = renderMarkdown(text)
    if (markdownOutput) {
      textElements.push(
        // Không cần class "message-content break-words" ở đây nữa nếu `prose` đã đủ
        // Hoặc nếu "message-content" có mục đích khác (ví dụ: padding/margin tổng thể cho khối text) thì giữ lại
        <div key='primary-text-prop' className='message-content break-words'>
          {markdownOutput}
        </div>
      )
    }
  }

  // --- Xây dựng finalContent ---
  const finalContent: React.ReactNode[] = []
  if (textElements.length > 0) {
    // Ưu tiên text lên trước file nếu cả hai đều có
    finalContent.push(
      <div
        key='texts-container'
        className={`${fileElements.length > 0 ? 'mb-2' : ''}`}
      >
        {' '}
        {/* Thêm margin bottom nếu có file */}
        {textElements}
      </div>
    )
  }
  if (fileElements.filter(el => el !== null).length > 0) {
    // Chỉ thêm container nếu có file thực sự
    finalContent.push(
      <div
        key='files-container'
        className={`space-y-2 ${isUserMessage ? 'flex flex-col items-end' : ''}`}
      >
        {fileElements}
      </div>
    )
  }

  // Nếu sau tất cả các bước, finalContent vẫn rỗng, thì mới trả về null hoặc fallback.
  // Điều này đã được xử lý bởi kiểm tra sớm ở đầu component.
  // Nếu kiểm tra sớm không bắt được, và finalContent vẫn rỗng, đó là một trường hợp cần xem xét.
  if (finalContent.length === 0) {
    // console.log(`[MessageContentRenderer] FINAL CONTENT IS EMPTY (after all processing). Type: ${type}, Text Prop: "${text}", Files Prop: ${files?.length}, BotFiles Prop: ${botFiles?.length}, Parts Prop: ${parts?.length}`);
    // Có thể trả về một div rỗng có kích thước tối thiểu để giữ bubble chat nếu cần
    // return <div className="message-content min-h-[1.2em]"></div>;
    return null // Hoặc đơn giản là không render gì cả
  }

  return <>{finalContent}</>
}

export default MessageContentRenderer
