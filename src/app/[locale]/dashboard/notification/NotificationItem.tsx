// components/NotificationItem.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Notification } from '../../../../models/response/user.response';
import { Link } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';

interface NotificationItemProps {
  notification: Notification;
  onDelete: () => void;
  isChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
  onToggleImportant: (id: string) => void;
  onMarkUnseen: (id: string) => void;
  notificationId: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  isChecked,
  onCheckboxChange,
  onToggleImportant,
  onMarkUnseen,
  notificationId,
}) => {
  console.log('NotificationItem: Rendering. Props:', {
    notification,
    isChecked,
    notificationId,
  }); // Log all props

  const [isStarred, setIsStarred] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log(`NotificationItem: useEffect [notification.isImportant].  notification.id: ${notification.id}, isImportant: ${notification.isImportant}`); // Log useEffect
    setIsStarred(notification.isImportant);
  }, [notification.isImportant, notification.id]); // Add notification.id to dependencies

  const toggleStar = useCallback(() => {
    console.log(`NotificationItem: toggleStar called. notification.id: ${notification.id}`); // Log toggleStar
    setIsStarred((prevIsStarred) => !prevIsStarred);
    onToggleImportant(notification.id);
  }, [notification.id, onToggleImportant]);

  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log(`NotificationItem: handleCheckboxChange called.  notification.id: ${notification.id}, checked: ${event.target.checked}`); // Log checkbox change
      onCheckboxChange(event.target.checked);
    },
    [onCheckboxChange, notification.id] // Add notification.id
  );

  const handleMarkUnseenCallback = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`NotificationItem: handleMarkUnseenCallback called. notification.id: ${notification.id}`); // Log mark unseen
    onMarkUnseen(notification.id);
  }, [notification.id, onMarkUnseen]);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        console.log(`NotificationItem: handleDeleteClick called for id: ${notificationId}`); // Log
        onDelete();
    }, [onDelete, notificationId]); // Correct dependencies

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
    console.log(`NotificationItem ${notificationId}: isStarred=${isStarred}, notification.isImportant=${notification.isImportant}, isChecked=${isChecked}, !isSeen=${!isSeen}, isHovered = ${isHovered}`)

  return (
    <div
      className={`flex cursor-pointer items-center border border-background px-4 py-2 ${isStarred || notification.isImportant ? 'bg-yellow-50' : ''
        } ${isChecked ? 'bg-background-secondary' : ''} ${!isSeen ? 'bg-background' : ''
        } ${isHovered ? 'border-primary' : ''}`}
      onMouseEnter={() => {
        console.log(`NotificationItem: onMouseEnter. notification.id: ${notification.id}`); // Log mouse enter
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        console.log(`NotificationItem: onMouseLeave. notification.id: ${notification.id}`); // Log mouse leave
        setIsHovered(false);
      }}
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
          className={`${isStarred || notification.isImportant
              ? 'text-yellow-500'
              : 'text-gray-400'
            } text-lg`}
        >
          ★
        </span>
      </button>

      {/* Main content area with grid */}
      <div className='flex-1 grid grid-cols-[1fr_3fr_1fr] gap-2 items-center'>
        {/* Column 1: Type (1fr) */}
        <div className='whitespace-nowrap overflow-hidden text-ellipsis'>
          <span className={`${!isSeen ? 'font-bold' : ''}`}>
            {notification.type}
          </span>
        </div>

        {/* Column 2: Message (3fr) */}
        <div className='whitespace-nowrap overflow-hidden text-ellipsis'>
          <Link
            href={{ pathname: '/dashboard', query: { ...Object.fromEntries(searchParams), id: notificationId } }}
            className=''
          >
            <p className={`${!isSeen ? 'font-bold' : ''} text-sm`}>
              {/* Removed truncateMessage, relying on CSS */}
              {notification.message}
            </p>
          </Link>
        </div>

        {/* Column 3: Time and Actions (1fr) */}
        <div className='text-right'>
          {!isHovered && (
            <span className={`${!isSeen ? 'font-bold' : ''} text-xs whitespace-nowrap`}>
              {formatDate(notification.createdAt)}
            </span>
          )}
          {isHovered && (
            <div className='flex items-center justify-end space-x-2'>
              <button
                onClick={handleMarkUnseenCallback}
                className='hover:text-blue-500 focus:outline-none'
                aria-label='Mark as unseen'
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
              <button
                onClick={handleDeleteClick}
                className='hover:text-red-500 focus:outline-none'
                aria-label='Delete notification'
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;