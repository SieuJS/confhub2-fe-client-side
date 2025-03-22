// components/NotificationItem.tsx
import React, { useState, useEffect, useCallback } from 'react'
import { Notification } from '../../../../models/response/user.response'

interface NotificationItemProps {
  notification: Notification;
  onDelete: () => void; //  onDelete is required
  isChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
  onUpdateSeenAt: (id: string) => void;
  onToggleImportant: (id: string) => void;
  onMarkUnseen: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  isChecked,
  onCheckboxChange,
  onUpdateSeenAt,
  onToggleImportant,
  onMarkUnseen,
}) => {
  const [isStarred, setIsStarred] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsStarred(notification.isImportant);
  }, [notification.isImportant]);

  // Use useCallback for event handlers to prevent unnecessary re-renders
  const toggleStar = useCallback(() => {
    setIsStarred((prevIsStarred) => !prevIsStarred);
    onToggleImportant(notification.id);
  }, [notification.id, onToggleImportant]);

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckboxChange(event.target.checked);
    },
    [onCheckboxChange]
  );

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    if (!notification.seenAt) {
      onUpdateSeenAt(notification.id);
    }
  }, [notification.id, notification.seenAt, onUpdateSeenAt]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

    const handleMarkUnseenCallback = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkUnseen(notification.id);
  }, [notification.id, onMarkUnseen]);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Unknown';

    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  const isSeen = !!notification.seenAt;


  return (
    <div
      className={`flex cursor-pointer items-center  border border-background px-4 py-2  ${
        isStarred || notification.isImportant ? 'bg-yellow-50' : ''
      } ${isChecked ? 'bg-background-secondary' : ''} ${
        !isSeen ? 'bg-background' : ''
      } ${isHovered ? ' border-primary ' : ''}`}
      onClick={openModal}
      role='button'
      tabIndex={0}
      aria-label={`Notification: ${notification.type}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <input
        type='checkbox'
        className='mr-3 h-4 w-4 cursor-pointer rounded border-background text-button-text focus:ring-button'
        checked={isChecked}
        onChange={handleCheckboxChange}
        onClick={e => e.stopPropagation()}
        aria-label='Select notification'
      />
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
      <div className='flex-1'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center'>
            <span className={`${!isSeen ? 'font-bold' : ''} `}>
              {notification.type} -{' '}
            </span>
            <p className={`${!isSeen ? 'font-bold' : ''} ml-1 text-sm `}>
              {notification.message}
            </p>
          </div>
          {!isHovered && (
            <span className={`${!isSeen ? 'font-bold' : ''} text-xs `}>
              {formatDate(notification.createdAt)}
            </span>
          )}
          {isHovered && (
            <div className='flex items-center space-x-2'>
              <button
                onClick={handleMarkUnseenCallback} // Use the useCallback version
                className='hover:text-blue-500 focus:outline-none'
                aria-label='Mark as unseen'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='h-5 w-5'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              </button>
              <button
                onClick={e => {
                    onDelete(); // Call onDelete directly, it's already a function
                    e.stopPropagation();
                }}
                className=' hover:text-red-500 focus:outline-none'
                aria-label='Delete notification'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='h-5 w-5'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m-10.013 0c.34.059.68.114 1.02.165m-1.02-.165L5.09 5.79m14.416 0c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79'
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50'
          onClick={closeModal}
        >
          <div
            className='w-full max-w-md rounded-lg bg-background p-6 shadow-xl'
            onClick={e => e.stopPropagation()}
          >
            <h3 className='mb-4 text-xl font-semibold'>{notification.type}</h3>
            <p className='mb-4'>{notification.message}</p>
            <p className='text-sm '>
              Created at: {formatDate(notification.createdAt)}
            </p>
            <p className='text-sm '>
              Seen at: {formatDate(notification.seenAt)}
            </p>
            <div className='mt-4 text-right'>
              <button
                onClick={closeModal}
                className='rounded bg-button px-4 py-2 font-bold text-button-text hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-400'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;