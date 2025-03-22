
// components/Header/header/NotificationDropdown.tsx (NotificationDropdown Component)

import { FC, useEffect, useCallback } from 'react';
import { Link } from '@/src/navigation';
import { Notification } from '../../../../models/response/user.response';
import { useTranslations } from 'next-intl';
import { timeAgo } from '../../dashboard/timeFormat';

interface Props {
  notifications: Notification[];
  isNotificationOpen: boolean;
  closeAllMenus: () => void;
  locale: string;
  fetchNotifications: () => void;
  isLoadingNotifications: boolean;
  markAllAsRead: () => Promise<void>;
}

const NotificationDropdown: FC<Props> = ({
  notifications,
  isNotificationOpen,
  closeAllMenus,
  locale,
  fetchNotifications,
  isLoadingNotifications,
  markAllAsRead,
}) => {
  const t = useTranslations('');

  const memoizedFetchNotifications = useCallback(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (isNotificationOpen) {
      memoizedFetchNotifications();
    }
  }, [isNotificationOpen, memoizedFetchNotifications]);

  const groupNotifications = useCallback((notifications: Notification[]) => {
    const now = new Date();
    const oneDayAgo = now.getTime() - (24 * 60 * 60 * 1000);

    const newNotifications = notifications.filter(n => new Date(n.createdAt).getTime() >= oneDayAgo);
    const earlierNotifications = notifications.filter(n => new Date(n.createdAt).getTime() < oneDayAgo);
    return { newNotifications, earlierNotifications };
  }, []);

  // No changes needed here, as we're already working with a limited set of notifications
  const { newNotifications, earlierNotifications } = groupNotifications(notifications);

  const renderNotificationItem = useCallback((notification: Notification) => (
    // Removed legacyBehavior and <a> tag.  Link handles the click now.
    <Link
      href={{ pathname: `/dashboard`, query: { tab: 'notifications', id: notification.id } }}
      lang={locale}
      key={notification.id}
      onClick={closeAllMenus} // Moved onClick to the Link component
    >
      <div
        className={`flex items-start p-4 border-b border-gray-200 hover:bg-gray-50 ${notification.seenAt ? '' : 'bg-blue-50'}`}
      >
        <div className="mr-3 flex-shrink-0">
          <div className="relative w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-700 font-medium">{notification.type.charAt(0)}</span>
            {notification.seenAt === null && <span className="absolute top-0 right-0 block w-2.5 h-2.5 rounded-full bg-red-500"></span>}
          </div>
        </div>
        <div className="flex-grow">
          <p className={`text-sm ${notification.seenAt ? 'text-gray-700' : 'font-bold'}`}>
            {notification.message}
          </p>
          <span className="text-xs text-gray-500">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  ), [closeAllMenus, locale]);

  const handleMarkAllAsRead = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
    fetchNotifications();
  }, [markAllAsRead, fetchNotifications]);

  return (
    <div
      className={`absolute z-50 right-0 mt-10 mr-8 w-80 bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 ease-in-out ${isNotificationOpen ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 translate-y-1'
        }`}
      style={{
        inset: '0px 0px auto auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h6 className="text-lg font-semibold">Notifications</h6>
          <button
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={handleMarkAllAsRead}
          >
            {t('Mark All As Read')}
          </button>
        </div>
      </div>

      <div className="overflow-y-auto" style={{ maxHeight: '25rem' }}>
        {isLoadingNotifications ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : notifications.length > 0 ? (
          <>
            {newNotifications.length > 0 && (
              <>
                <div className="px-4 py-2 text-sm font-semibold text-gray-600 border-b border-gray-200">NEW</div>
                {newNotifications.map(renderNotificationItem)}
              </>
            )}
            {earlierNotifications.length > 0 && (
              <>
                <div className="px-4 py-2 text-sm font-semibold text-gray-600 border-b border-gray-200">EARLIER</div>
                {earlierNotifications.map(renderNotificationItem)}
              </>
            )}
          </>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No new notifications
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 text-center">
        <Link
          href={{ pathname: `/dashboard`, query: { tab: 'notifications' } }}
          lang={locale}
          onClick={closeAllMenus}
        >
          <div className="text-sm text-blue-600 hover:text-blue-800 block"> View all </div>
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;