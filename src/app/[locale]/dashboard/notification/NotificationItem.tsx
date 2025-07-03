// src/app/[locale]/dashboard/notifications/NotificationItem.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Notification } from '../../../../models/response/user.response';
import { Link } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Trash2, Star } from 'lucide-react'; // Import EyeOff
import { useLocale, useTranslations } from 'next-intl';
import { formatDate as formatConferenceDate } from '../../conferences/detail/utils/conferenceUtils';

interface NotificationItemProps {
  notification: Notification;
  onDelete: () => void;
  isChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
  onToggleImportant: (id: string) => Promise<void>;
  onToggleReadStatus: (id: string, isRead: boolean) => Promise<void>; // Đổi tên và thêm isRead
  notificationId: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onDelete,
  isChecked,
  onCheckboxChange,
  onToggleImportant,
  onToggleReadStatus, // Sử dụng tên mới
  notificationId,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTogglingImportant, setIsTogglingImportant] = useState(false);
  const [isTogglingRead, setIsTogglingRead] = useState(false); // Thêm state cho trạng thái đọc/chưa đọc
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('');

  const handleToggleStar = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTogglingImportant) return;

    setIsTogglingImportant(true);
    try {
      await onToggleImportant(notification.id);
    } catch (error) {
      console.error('Failed to toggle important status:', error);
    } finally {
      setIsTogglingImportant(false);
    }
  }, [notification.id, onToggleImportant, isTogglingImportant]);

  const handleToggleReadClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTogglingRead) return; // Ngăn chặn click liên tục

    setIsTogglingRead(true); // Bắt đầu loading
    try {
      // Nếu đã đọc (có seenAt), thì đánh dấu là chưa đọc (false)
      // Nếu chưa đọc (không có seenAt), thì đánh dấu là đã đọc (true)
      await onToggleReadStatus(notification.id, !!notification.seenAt);
    } catch (error) {
      console.error('Failed to toggle read status:', error);
    } finally {
      setIsTogglingRead(false); // Kết thúc loading
    }
  }, [notification.id, notification.seenAt, onToggleReadStatus, isTogglingRead]);


  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckboxChange(event.target.checked);
    },
    [onCheckboxChange]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete();
    },
    [onDelete]
  );

  const formatNotificationDate = (dateString: string | undefined): string => {
    if (!dateString) return t('Unknown');

    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
      return formatConferenceDate(dateString, t, locale);
    }
  };

  const isSeen = !!notification.seenAt;

  return (
    <tr
      className={`
        ${notification.isImportant ? 'bg-yellow-50' : ''}
        ${isChecked ? 'bg-background-secondary' : ''}
        ${!isSeen ? 'bg-background' : ''}
        ${isHovered ? 'bg-gray-100' : ''} cursor-pointer
      `}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* Cell 1: Checkbox */}
      <td className="px-4 py-2 whitespace-nowrap">
        <input
          type='checkbox'
          className='h-4 w-4 cursor-pointer rounded border-background text-button-text focus:ring-button'
          checked={isChecked}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          aria-label='Select notification'
        />
      </td>

      {/* Cell 2: Star/Important */}
      <td className="px-4 py-2 whitespace-nowrap">
        <button
          onClick={handleToggleStar}
          className='focus:outline-none'
          aria-label='Mark as important'
          disabled={isTogglingImportant}
        >
          <Star
            size={20}
            strokeWidth={1.75}
            className={`${
              notification.isImportant ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
            } ${isTogglingImportant ? 'animate-pulse' : ''}`}
          />
        </button>
      </td>

      {/* Cell 3: Type */}
      <td className="px-4 py-2">
        <span className={`
          ${!isSeen ? 'font-bold' : ''} text-gray-70
          whitespace-nowrap md:whitespace-normal md:overflow-hidden md:text-ellipsis block
        `}>
          {notification.type.replace(/_/g, ' ')}
        </span>
      </td>

      {/* Cell 4: Message */}
      <td className="px-4 py-2">
        <Link
          href={{
            pathname: '/dashboard',
            query: { ...Object.fromEntries(searchParams), id: notificationId },
          }}
          className='block'
        >
          <p className={`
            ${!isSeen ? 'font-bold' : ''} text-sm text-gray-70
            whitespace-nowrap md:whitespace-normal md:overflow-hidden md:text-ellipsis
          `}>
            {notification.message}
          </p>
        </Link>
      </td>

      {/* Cell 5: Time and Actions */}
      <td className="px-4 py-2 text-right whitespace-nowrap">
        {!isHovered && (
          <span
            className={`${!isSeen ? 'font-bold' : ''} text-xs text-gray-70`}
          >
            {formatNotificationDate(notification.createdAt)}
          </span>
        )}
        {isHovered && (
          <div className='flex items-center justify-end space-x-2'>
            <button
              onClick={handleToggleReadClick} // Gọi hàm mới
              className='text-gray-70 hover:text-blue-500 focus:outline-none'
              aria-label={isSeen ? 'Mark as unread' : 'Mark as read'} // Thay đổi aria-label
              disabled={isTogglingRead} // Vô hiệu hóa khi đang xử lý
            >
              {isSeen ? (
                <EyeOff size={20} strokeWidth={1.75} className={`${isTogglingRead ? 'animate-pulse' : ''}`} /> // Icon cho chưa đọc
              ) : (
                <Eye size={20} strokeWidth={1.75} className={`${isTogglingRead ? 'animate-pulse' : ''}`} /> // Icon cho đã đọc
              )}
            </button>
            <button
              onClick={handleDeleteClick}
              className='text-gray-70 hover:text-red-500 focus:outline-none'
              aria-label='Delete notification'
            >
              <Trash2 size={20} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default NotificationItem;