import React from 'react';
import {
  MessageType,
  FrontendAction,
  ItemFollowStatusUpdatePayload,
  DisplayConferenceSourcesPayload,
  ChatMessageType
} from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import { Part as GeminiPartFromSDK } from '@google/genai';
import MapMessage from './messageContent/MapMessage';
import FollowUpdateMessage from './messageContent/FollowUpdateMessage';
import ConferenceSourcesMessage from './messageContent/ConferenceSourcesMessage';
import { useMessageContent } from '@/src/hooks/regularchat/messageContent/useMessageContent';

interface MessageContentRendererProps {
  text?: string;
  parts?: GeminiPartFromSDK[];
  files?: ChatMessageType['files'];
  botFiles?: ChatMessageType['botFiles'];
  type: MessageType;
  location?: string;
  action?: FrontendAction;
  isUserMessage?: boolean;
}

/**
 * The main component for rendering message content.
 * It acts as a dispatcher, delegating rendering to specialized components for specific
 * message types (map, follow_update, etc.) or using the `useMessageContent` hook
 * for handling general and multimodal text/file content.
 */
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
  // --- 1. Call React Hooks Unconditionally at the Top ---
  // This ensures useMessageContent is always called, satisfying the Rules of Hooks.
  const { hasDisplayableContent, textElements, fileElements } = useMessageContent({
    text,
    parts,
    files,
    botFiles,
    isUserMessage,
  });

  // --- 2. Handle Specialized Message Types First (Early Returns) ---
  // These conditions check for specific message types that override the general content rendering.

  if (type === 'map' && location) {
    return <MapMessage text={text} location={location} />;
  }

  if (type === 'follow_update' && action?.type === 'itemFollowStatusUpdated') {
    return <FollowUpdateMessage text={text} payload={action.payload as ItemFollowStatusUpdatePayload} />;
  }

  if (action?.type === 'displayConferenceSources') {
    return <ConferenceSourcesMessage text={text} payload={action.payload as DisplayConferenceSourcesPayload} />;
  }

  // --- 3. Handle General and Multimodal Content (if no specialized type matched) ---
  // Now, we use the results from the hook to render general text and file content.

  // Early exit if there's nothing to display after processing by the hook
  if (!hasDisplayableContent) {
    return null;
  }

  // --- 4. Assemble Final Content ---

  const finalContent: React.ReactNode[] = [];

  if (textElements.length > 0) {
    finalContent.push(
      <div
        key='texts-container'
        className={`${fileElements.filter(el => el !== null).length > 0 ? 'mb-2' : ''}`}
      >
        {textElements}
      </div>
    );
  }

  if (fileElements.filter(el => el !== null).length > 0) {
    finalContent.push(
      <div
        key='files-container'
        className={`space-y-2 ${isUserMessage ? 'flex flex-col items-end' : ''}`}
      >
        {fileElements}
      </div>
    );
  }

  if (finalContent.length === 0) {
    return null;
  }

  return <>{finalContent}</>;
};

export default MessageContentRenderer;