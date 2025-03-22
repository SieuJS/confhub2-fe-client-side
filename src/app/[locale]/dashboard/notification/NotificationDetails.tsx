
// components/NotificationDetail.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Notification } from '../../../../models/response/user.response';
import { formatDateFull } from '../timeFormat';
import { useSearchParams } from 'next/navigation';

interface NotificationDetailProps {
  notification: Notification;
  onBack: () => void;
  onDelete: (id: string) => void;
  onToggleImportant: (id: string) => void;
}

const NotificationDetail: React.FC<NotificationDetailProps> = ({
  notification,
  onBack,
  onDelete,
  onToggleImportant,
}) => {
  const [isStarred, setIsStarred] = useState(false);
  const searchParams = useSearchParams();
  const notificationId = searchParams.get('id');
  // Keep seenAt as state, and initialize it with notification.seenAt.  No need for useState.
  const seenAt = notification.seenAt;


  useEffect(() => {
    setIsStarred(notification.isImportant);
  }, [notification.isImportant]); // Simplified dependency array

  const toggleStar = useCallback(() => {
    setIsStarred((prevIsStarred) => !prevIsStarred);
    onToggleImportant(notification.id);
  }, [notification.id, onToggleImportant]);

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-4 flex items-center'>
        <button onClick={onBack} className='mr-2 text-blue-500 hover:text-blue-700 focus:outline-none'>
          ← Back
        </button>
        <button
          onClick={e => {
            toggleStar();
            e.stopPropagation();
          }}
          className='mr-3 focus:outline-none'
          aria-label='Mark as important'
        >
          <span
            className={`${
              isStarred || notification.isImportant
                ? 'text-yellow-500'
                : 'text-gray-400'
            } text-lg`}
          >
            ★
          </span>
        </button>
        <h2 className='text-lg font-semibold'>{notification.type}</h2>
        
      </div>
      <div className='mb-4 border-b border-gray-300 pb-2 text-sm text-gray-500'>
        {formatDateFull(notification.createdAt)}
      </div>
      <div className='rounded-lg bg-white p-4 shadow'>
        <p>{notification.message}</p>
        {/* Display seenAt.  It will now ALWAYS be the initial seenAt value. */}
        {seenAt ? (
          <p className='mt-2 text-sm text-gray-500'>
            Seen at: {formatDateFull(seenAt)}
          </p>
        ) : (
          <p className='mt-2 text-sm text-gray-500'>
            Not yet seen
          </p>
        )}
      </div>
      <div className="mt-4 flex items-center space-x-2">
        <button
          onClick={e => {
            onDelete(notification.id);
            onBack()
            e.stopPropagation();
          }}
          className=' hover:text-red-500 focus:outline-none'
          aria-label='Delete notification'
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        </button>
      </div>
    </div>
  );
};

export default NotificationDetail;
