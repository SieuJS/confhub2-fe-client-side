import React, { useState, useEffect, useCallback } from 'react';
import { Notification } from '../../../../models/response/user.response';
import { Link } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';
import { Eye, Trash2, Star } from 'lucide-react'; // Import Star icon

interface NotificationItemProps {
  notification: Notification;
  onDelete: () => void;
  isChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
  onToggleImportant: (id: string) => Promise<void>; // Đảm bảo hàm này trả về Promise<void>
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
  // LOẠI BỎ isStarred state cục bộ.
  // const [isStarred, setIsStarred] = useState(false); // Xóa dòng này
  const [isHovered, setIsHovered] = useState(false);
  const [isTogglingImportant, setIsTogglingImportant] = useState(false); // Thêm state loading cho hành động này
  const searchParams = useSearchParams();

  // LOẠI BỎ useEffect này vì trạng thái isImportant sẽ được quản lý từ prop notification
  // useEffect(() => {
  //   setIsStarred(notification.isImportant);
  // }, [notification.isImportant, notification.id]);

  const handleToggleStar = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền
    if (isTogglingImportant) return; // Ngăn chặn click liên tục

    setIsTogglingImportant(true); // Bắt đầu loading
    try {
      await onToggleImportant(notification.id); // Chờ API hoàn tất
      // Không cần cập nhật state cục bộ ở đây,
      // vì `onToggleImportant` sẽ kích hoạt cập nhật dữ liệu tổng thể
      // và prop `notification.isImportant` sẽ tự động thay đổi.
    } catch (error) {
      console.error('Failed to toggle important status:', error);
      // Lỗi sẽ được xử lý bởi `performAction` trong `NotificationsTab` và hiển thị modal lỗi.
      // Không cần làm gì thêm ở đây ngoài việc log lỗi.
    } finally {
      setIsTogglingImportant(false); // Kết thúc loading
    }
  }, [notification.id, onToggleImportant, isTogglingImportant]);


  const handleCheckboxChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onCheckboxChange(event.target.checked);
    },
    [onCheckboxChange, notification.id]
  );

  const handleMarkUnseenCallback = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMarkUnseen(notification.id);
    },
    [notification.id, onMarkUnseen]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete();
    },
    [onDelete, notificationId]
  );

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
      className={`flex cursor-pointer items-center border border-background px-4 py-2 ${
        notification.isImportant ? 'bg-yellow-50' : '' // Dùng trực tiếp notification.isImportant
      } ${isChecked ? 'bg-background-secondary' : ''} ${
        !isSeen ? 'bg-background' : ''
      } ${isHovered ? 'border-primary' : ''}`}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      {/* Nút chọn và đánh dấu quan trọng */}
      <input
        type='checkbox'
        className='mr-3 h-4 w-4 cursor-pointer rounded border-background text-button-text focus:ring-button'
        checked={isChecked}
        onChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
        aria-label='Select notification'
      />
      <button
        onClick={handleToggleStar} // Gọi hàm mới
        className='mr-3 focus:outline-none'
        aria-label='Mark as important'
        disabled={isTogglingImportant} // Vô hiệu hóa nút khi đang loading
      >
        {/* Thay thế span ★ bằng icon Lucide Star */}
        <Star
          size={20}
          strokeWidth={1.75}
          className={`${
            notification.isImportant ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'
          } ${isTogglingImportant ? 'animate-pulse' : ''}`} // Thêm hiệu ứng loading
        />
      </button>

      <div className='grid flex-1 grid-cols-[2fr_7fr_1fr] items-center gap-2'>
        {/* Column 1: Type (1fr) */}
        <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
          <span className={`${!isSeen ? 'font-bold' : ''} text-gray-70`}>
            {notification.type.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Column 2: Message (3fr) */}
        <div className='overflow-hidden text-ellipsis whitespace-nowrap'>
          <Link
            href={{
              pathname: '/dashboard',
              query: { ...Object.fromEntries(searchParams), id: notificationId },
            }}
            className=''
          >
            <p className={`${!isSeen ? 'font-bold' : ''} text-sm text-gray-70`}>
              {notification.message}
            </p>
          </Link>
        </div>

        {/* Column 3: Time and Actions (1fr) */}
        <div className='text-right'>
          {!isHovered && (
            <span
              className={`${!isSeen ? 'font-bold' : ''} whitespace-nowrap text-xs text-gray-70`}
            >
              {formatDate(notification.createdAt)}
            </span>
          )}
          {isHovered && (
            <div className='flex items-center justify-end space-x-2'>
              <button
                onClick={handleMarkUnseenCallback}
                className='text-gray-70 hover:text-blue-500 focus:outline-none'
                aria-label='Mark as unseen'
              >
                <Eye size={20} strokeWidth={1.75} />
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
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;