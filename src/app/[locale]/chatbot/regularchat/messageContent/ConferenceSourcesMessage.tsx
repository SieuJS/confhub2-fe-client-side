import React from 'react';
import { DisplayConferenceSourcesPayload } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import ConferenceSourceDisplay from '../ConferenceSourceDisplay';
import MarkdownRenderer from './MarkdownRenderer';

interface ConferenceSourcesMessageProps {
  text?: string;
  payload: DisplayConferenceSourcesPayload;
}

/**
 * Renders a message displaying conference sources, along with optional text.
 */
const ConferenceSourcesMessage: React.FC<ConferenceSourcesMessageProps> = ({ text, payload }) => {
  return (
    <div className='conference-sources-container'>
      {text && (
        <div className='message-content mb-1 break-words'>
          <MarkdownRenderer content={text} />
        </div>
      )}
      <ConferenceSourceDisplay payload={payload} />
    </div>
  );
};

export default ConferenceSourcesMessage;