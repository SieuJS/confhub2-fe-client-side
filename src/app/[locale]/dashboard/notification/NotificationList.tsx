// src/app/[locale]/dashboard/notifications/NotificationList.tsx

import React from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import NotificationItem from './NotificationItem'
import { Notification } from '@/src/models/response/user.response'

interface NotificationListProps {
  notifications: Notification[]
  loading: boolean
  initialLoad: boolean
  checkedIndices: string[]
  onCheckboxChange: (notificationId: string, checked: boolean) => void
  onDelete: (notificationId: string) => void
  onToggleImportant: (notificationId: string) => Promise<void>
  onToggleReadStatus: (notificationId: string, isRead: boolean) => Promise<void> // Đổi tên và thêm isRead
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  initialLoad,
  checkedIndices,
  onCheckboxChange,
  onDelete,
  onToggleImportant,
  onToggleReadStatus // Sử dụng tên mới
}) => {
  const t = useTranslations('')

  const renderLoading = () => (
    <div className='flex h-80 flex-col items-center justify-center '>
      <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
      <p className='mt-4 text-lg'>
        {t('MyConferences.Loading_your_conferences')}
      </p>
    </div>
  )

  if (loading && !initialLoad) {
    return renderLoading()
  }

  if (!loading && notifications.length === 0) {
    return (
      <p className='p-4 text-center'>
        {t('You_have_no_notifications_matching_criteria') ||
          'No notifications match your current filters.'}
      </p>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-20'>
          <tr>
            <th
              scope='col'
              className='w-12 px-4 py-2 text-left text-xs  font-medium uppercase tracking-wider'
            >
              {/* Checkbox header (có thể ẩn nếu không cần) */}
            </th>
            <th
              scope='col'
              className='w-12 px-4 py-2 text-left text-xs  font-medium uppercase tracking-wider'
            >
              {/* Star header */}
            </th>
            <th
              scope='col'
              className='min-w-[300px] px-4 py-2 text-left text-xs  font-medium uppercase tracking-wider md:w-auto'
            >
              {t('Title') || 'Title'}
            </th>
            <th
              scope='col'
              className='min-w-[300px] px-4 py-2 text-left text-xs  font-medium uppercase tracking-wider md:w-auto'
            >
              {t('Message') || 'Message'}
            </th>
            <th
              scope='col'
              className='min-w-[100px] px-4 py-2 text-right text-xs  font-medium uppercase tracking-wider md:w-auto'
            >
              {t('Time') || 'Time'}
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-background'>
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
                onToggleReadStatus={onToggleReadStatus} // Truyền prop mới
                notificationId={notification.id}
              />
            ))}
        </tbody>
      </table>
    </div>
  )
}

export default NotificationList
