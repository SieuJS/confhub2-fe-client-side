import React, { useMemo } from 'react';
import { Part as GeminiPartFromSDK } from '@google/genai';
import { ChatMessageType } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import FilePartDisplay from '@/src/app/[locale]/chatbot/regularchat/FilePartDisplay';
import MarkdownRenderer from '@/src/app/[locale]/chatbot/regularchat/messageContent/MarkdownRenderer';

interface UseMessageContentProps {
  text?: string;
  parts?: GeminiPartFromSDK[];
  files?: ChatMessageType['files'];
  botFiles?: ChatMessageType['botFiles'];
  isUserMessage?: boolean;
}

/**
 * A custom hook to process complex message content from various sources (text, parts, files).
 * It encapsulates the logic for parsing multimodal messages, handling user/bot files,
 * and preparing renderable elements for text and files.
 *
 * @returns An object containing processed `textElements`, `fileElements`, and a flag `hasDisplayableContent`.
 */
export const useMessageContent = ({
  text,
  parts,
  files,
  botFiles,
  isUserMessage,
}: UseMessageContentProps) => {
  const hasDisplayableContent = useMemo(() => {
    const hasDisplayableContentInParts =
      parts && parts.some(p => p.text || p.fileData || p.inlineData);

    return !!(
      text ||
      (files && files.length > 0) ||
      (botFiles && botFiles.length > 0) ||
      (parts && parts.length > 0 && hasDisplayableContentInParts)
    );
  }, [text, files, botFiles, parts]);

  const { textElements, fileElements } = useMemo(() => {
    const fileElements: React.ReactNode[] = [];
    const textElements: React.ReactNode[] = [];
    let hasRenderedTextFromParts = false;

    // 1. Render User Files (from prop `files`) - ONLY if it's a user message
    if (isUserMessage && files && files.length > 0) {
      files.forEach((file, index) => {
        fileElements.push(
          <FilePartDisplay
            key={`user-file-${index}`}
            item={file}
            isUserMessage={isUserMessage}
          />
        );
      });
    }

    // 2. Process `parts`
    let textFromPartsAccumulator = '';
    if (parts && parts.length > 0) {
      parts.forEach((part, index) => {
        if (part.text) {
          if (!text) {
            textFromPartsAccumulator += (textFromPartsAccumulator ? '\n' : '') + part.text;
          }
        } else if (part.fileData || part.inlineData) {
          if (!isUserMessage) {
            const fileDisplayElement = (
              <FilePartDisplay
                key={`part-sdk-file-${index}`}
                item={part}
                isUserMessage={isUserMessage}
              />
            );
            fileElements.push(fileDisplayElement);
          }
        }
      });

      if (!text && textFromPartsAccumulator) {
        textElements.push(
          <div key='text-from-parts' className='message-content break-words'>
            <MarkdownRenderer content={textFromPartsAccumulator} className={isUserMessage ? '[&_*]:text-white' : ''} />
          </div>
        );
        hasRenderedTextFromParts = true;
      }
    }

    // 3. Render Bot Files (from prop `botFiles`) - with de-duplication
    if (!isUserMessage && botFiles && botFiles.length > 0) {
      const renderedFileKeys = new Set<string>();
      fileElements.forEach(el => {
        if (React.isValidElement(el) && el.props.item) {
          const item = el.props.item as GeminiPartFromSDK;
          if (item.fileData?.fileUri) renderedFileKeys.add(item.fileData.fileUri);
          else if (item.inlineData?.data && item.inlineData?.mimeType) {
            renderedFileKeys.add(`data:${item.inlineData.mimeType};base64,${item.inlineData.data}`);
          }
        }
      });

      botFiles.forEach((botFile, index) => {
        const key = botFile.uri || (botFile.inlineData ? `data:${botFile.inlineData.mimeType};base64,${botFile.inlineData.data}` : `prop-bot-file-unique-${index}`);
        if (!renderedFileKeys.has(key)) {
          fileElements.push(
            <FilePartDisplay
              key={`prop-bot-file-${index}`}
              item={botFile}
              isUserMessage={isUserMessage}
            />
          );
          renderedFileKeys.add(key);
        }
      });
    }

    // 4. Render primary `text` (prop `text`) if not already rendered from `parts`
    if (text && !hasRenderedTextFromParts) {
      textElements.push(
        <div key='primary-text-prop' className='message-content break-words'>
          <MarkdownRenderer content={text} className={isUserMessage ? '[&_*]:text-white' : ''} />
        </div>
      );
    }

    return { textElements, fileElements };
  }, [text, parts, files, botFiles, isUserMessage]);

  return { hasDisplayableContent, textElements, fileElements };
};