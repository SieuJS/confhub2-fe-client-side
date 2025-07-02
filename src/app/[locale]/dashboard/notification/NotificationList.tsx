// src/app/[locale]/dashboard/notifications/NotificationList.tsx

import React from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import NotificationItem from './NotificationItem'; // <-- Điều chỉnh đường dẫn nếu cần
import { Notification } from '@/src/models/response/user.response';

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  initialLoad: boolean;
  checkedIndices: string[];
  onCheckboxChange: (notificationId: string, checked: boolean) => void;
  onDelete: (notificationId: string) => void;
  onToggleImportant: (notificationId: string) => void;
  onMarkUnseen: (notificationId: string) => void;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  initialLoad,
  checkedIndices,
  onCheckboxChange,
  onDelete,
  onToggleImportant,
  onMarkUnseen,
}) => {
  const t = useTranslations('');

  const renderLoading = () => (
    <div className='flex h-80 flex-col items-center justify-center text-gray-500'>
      <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
      <p className='mt-4 text-lg'>
        {t('MyConferences.Loading_your_conferences')}
      </p>
    </div>
  );

  if (loading && !initialLoad) {
    return renderLoading();
  }

  if (!loading && notifications.length === 0) {
    return (
      <p className='p-4 text-center'>
        {t('You_have_no_notifications_matching_criteria') ||
          'No notifications match your current filters.'}
      </p>
    );
  }

  return (
    <>
      {!loading &&
        notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDelete={() => onDelete(notification.id)}
            isChecked={checkedIndices.includes(notification.id)}
            onCheckboxChange={checked =>
              onCheckboxChange(notification.id, checked)
            }
            onToggleImportant={onToggleImportant}
            onMarkUnseen={onMarkUnseen}
            notificationId={notification.id}
          />
        ))}
    </>
  );
};

export default NotificationList;