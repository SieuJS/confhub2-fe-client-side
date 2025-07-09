import React from 'react';
import { ItemFollowStatusUpdatePayload } from '@/src/app/[locale]/chatbot/lib/regular-chat.types';
import FollowUpdateDisplay from '../FollowUpdateDisplay';
import MarkdownRenderer from './MarkdownRenderer';

interface FollowUpdateMessageProps {
  text?: string;
  payload: ItemFollowStatusUpdatePayload;
}

/**
 * Renders a message indicating a follow status update, along with optional text.
 */
const FollowUpdateMessage: React.FC<FollowUpdateMessageProps> = ({ text, payload }) => {
  return (
    <div className='follow-update-outer-wrapper'>
      {text && (
        <div className='mb-1 text-sm text-gray-800 dark:text-gray-100'>
          <MarkdownRenderer content={text} className='[&_*]:text-inherit' />
        </div>
      )}
      <FollowUpdateDisplay payload={payload} />
    </div>
  );
};

export default FollowUpdateMessage;