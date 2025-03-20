// components/Header/components/NotificationDropdown.tsx
import { FC } from 'react'
import { Link } from '@/src/navigation'
import { Notification } from '../../../../models/response/user.response' // Adjust path
import { useTranslations } from 'next-intl'

interface Props {
  notifications: Notification[]
  isNotificationOpen: boolean
  closeAllMenus: () => void
  locale: string
}

const NotificationDropdown: FC<Props> = ({
  notifications,
  isNotificationOpen,
  closeAllMenus,
  locale
}) => {
  const t = useTranslations('')
  return (
    <div
      className={`border-border absolute right-0 top-full z-50 mt-2 w-80 rounded-md border bg-background-secondary shadow-lg ${
        isNotificationOpen ? '' : 'hidden'
      }`}
    >
      <div className='py-2'>
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`text-foreground hover:bg-button/10 px-4 py-2 text-sm ${!notification.seenAt ? 'font-bold' : ''}`}
            >
              {notification.message}
            </div>
          ))
        ) : (
          <div className='text-foreground px-4 py-2 text-sm'>
            No new notifications
          </div>
        )}
        <div className='text-foreground hover:bg-button/10 border-border border-t px-4 py-2 text-center text-sm'>
          <Link
            href={{ pathname: `/dashboard`, query: { tab: 'notifications' } }}
            lang={locale}
            onClick={closeAllMenus}
            className='block text-button hover:underline'
          >
            {t('View_all_notifications')}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotificationDropdown
