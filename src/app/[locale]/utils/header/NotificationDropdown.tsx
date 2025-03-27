// components/Header/header/NotificationDropdown.tsx (NotificationDropdown Component)

import { FC, useEffect, useCallback } from 'react'
import { Link } from '@/src/navigation'
import { Notification } from '../../../../models/response/user.response'
import { useTranslations } from 'next-intl'
import { timeAgo } from '../../dashboard/timeFormat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import DOMPurify from 'dompurify'

interface Props {
  notifications: Notification[]
  isNotificationOpen: boolean
  closeAllMenus: () => void
  locale: string
  fetchNotifications: () => void
  isLoadingNotifications: boolean
  markAllAsRead: () => Promise<void>
}

const NotificationDropdown: FC<Props> = ({
  notifications,
  isNotificationOpen,
  closeAllMenus,
  locale,
  fetchNotifications,
  isLoadingNotifications,
  markAllAsRead
}) => {
  const t = useTranslations('')
  const language = t('language')
  const memoizedFetchNotifications = useCallback(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    if (isNotificationOpen) {
      memoizedFetchNotifications()
    }
  }, [isNotificationOpen, memoizedFetchNotifications])

  const groupNotifications = useCallback((notifications: Notification[]) => {
    const now = new Date()
    const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000

    const newNotifications = notifications.filter(
      n => new Date(n.createdAt).getTime() >= oneDayAgo
    )
    const earlierNotifications = notifications.filter(
      n => new Date(n.createdAt).getTime() < oneDayAgo
    )
    return { newNotifications, earlierNotifications }
  }, [])

  // No changes needed here, as we're already working with a limited set of notifications
  const { newNotifications, earlierNotifications } =
    groupNotifications(notifications)

  const renderNotificationItem = useCallback(
    (notification: Notification) => {
      const sanitizedMessage = DOMPurify.sanitize(notification.message)

      return (
        // Removed legacyBehavior and <a> tag.  Link handles the click now.
        <Link
          href={{
            pathname: `/dashboard`,
            query: { tab: 'notifications', id: notification.id }
          }}
          lang={locale}
          key={notification.id}
          onClick={closeAllMenus} // Moved onClick to the Link component
        >
          <div
            className={`flex items-start border-b border-gray-200 p-4 hover:bg-gray-50 ${notification.seenAt ? '' : 'bg-blue-50'}`}
          >
            <div className='mr-3 flex-shrink-0'>
              <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-200'>
                <span className='font-medium '>
                  {notification.type.charAt(0)}
                </span>
                {notification.seenAt === null && (
                  <span className='absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-red-500'></span>
                )}
              </div>
            </div>
            <div className='flex-grow'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // Apply the className to the *outermost* element rendered by the custom components.
                  p: ({ node, ...props }) => (
                    <p
                      className={`mb-0.5 text-sm ${notification.seenAt ? '' : 'font-bold'}`}
                      {...props}
                    />
                  ), // Remove bottom margin
                  a: ({ node, ...props }) => (
                    <a className='text-button hover:underline' {...props} />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre
                      className='overflow-x-auto rounded-md bg-gray-100 p-2'
                      {...props}
                    />
                  ),
                  code: ({ node, ...props }) => (
                    <code className='rounded bg-gray-100 px-1' {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 className='text-base font-bold' {...props} />
                  ), // Reduce size
                  h2: ({ node, ...props }) => (
                    <h2 className='text-sm font-semibold' {...props} />
                  ), // Reduce size
                  h3: ({ node, ...props }) => (
                    <h3 className='text-sm font-medium' {...props} />
                  ), // Reduce size
                  ul: ({ node, ...props }) => (
                    <ul className='list-inside list-disc text-sm' {...props} />
                  ), // Reduce size
                  ol: ({ node, ...props }) => (
                    <ol
                      className='list-inside list-decimal text-sm'
                      {...props}
                    />
                  ), // Reduce size
                  li: ({ node, ...props }) => (
                    <li className='text-sm' {...props} />
                  ), // Reduce size

                  // Add a default wrapper (div) to apply the className
                  // if none of the above components match. This isn't strictly needed
                  // if you're *sure* you've covered all possible Markdown elements,
                  // but it's a good safety net.
                  div: ({ node, ...props }) => (
                    <div
                      className={`text-sm ${notification.seenAt ? '' : 'font-bold'}`}
                      {...props}
                    />
                  )
                }}
              >
                {sanitizedMessage}
              </ReactMarkdown>
              <span className='text-xs text-gray-500'>
                {timeAgo(notification.createdAt, language)}
              </span>
            </div>
          </div>
        </Link>
      )
    },
    [closeAllMenus, locale, notifications] // Corrected dependency array
  )

  const handleMarkAllAsRead = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      await markAllAsRead()
      fetchNotifications()
    },
    [markAllAsRead, fetchNotifications]
  )

  return (
    <div
      className={`absolute right-0 z-50 mr-8 mt-10 w-80 overflow-hidden rounded-lg bg-white shadow-xl transition-all duration-300 ease-in-out md:w-[400px] ${
        isNotificationOpen
          ? 'visible translate-y-0 opacity-100'
          : 'invisible translate-y-1 opacity-0'
      }`}
      style={{
        inset: '0px 0px auto auto'
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className='border-b border-gray-200 p-4'>
        <div className='flex items-center justify-between'>
          <h6 className='text-sm font-semibold md:text-lg'>
            {t('Notifications')}
          </h6>
          <button
            className=' text-sm text-button hover:text-blue-800'
            onClick={handleMarkAllAsRead}
          >
            {t('Mark All As Read')}
          </button>
        </div>
      </div>

      <div className='overflow-y-auto' style={{ maxHeight: '25rem' }}>
        {isLoadingNotifications ? (
          <div className='p-4 text-center text-gray-500'>{t('Loading')}</div>
        ) : notifications.length > 0 ? (
          <>
            {newNotifications.length > 0 && (
              <>
                <div className='border-b border-gray-200 px-4 py-2 text-sm font-semibold '>
                  {t('NEW')}
                </div>
                {newNotifications.map(renderNotificationItem)}
              </>
            )}
            {earlierNotifications.length > 0 && (
              <>
                <div className='border-b border-gray-200 px-4 py-2 text-sm font-semibold '>
                  {t('EARLIER')}
                </div>
                {earlierNotifications.map(renderNotificationItem)}
              </>
            )}
          </>
        ) : (
          <div className='p-4 text-center text-gray-500'>
            {t('No_new_notifications')}
          </div>
        )}
      </div>

      <div className='border-t border-gray-200 p-4 text-center'>
        <Link
          href={{ pathname: `/dashboard`, query: { tab: 'notifications' } }}
          lang={locale}
          onClick={closeAllMenus}
        >
          <div className='block text-sm text-button hover:text-blue-800'>
            {' '}
            {t('View_all')}{' '}
          </div>
        </Link>
      </div>
    </div>
  )
}

export default NotificationDropdown
