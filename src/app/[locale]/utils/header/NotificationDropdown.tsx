// components/Header/header/NotificationDropdown.tsx

import { FC, useEffect, useCallback, useMemo } from 'react'
import { Link } from '@/src/navigation'
import { Notification } from '../../../../models/response/user.response'
import { useTranslations } from 'next-intl'
import { timeAgo } from '../../dashboard/timeFormat'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import DOMPurify from 'dompurify'
import { useNotifications } from '@/src/contexts/NotificationContext' // <-- BƯỚC 1: IMPORT HOOK MỚI

// --- BƯỚC 2: ĐƠN GIẢN HÓA PROPS ---
// Component này giờ chỉ cần biết nó có đang mở hay không và cách để đóng nó lại.
interface Props {
  isNotificationOpen: boolean
  closeAllMenus: () => void
  locale: string
}

const NotificationDropdown: FC<Props> = ({
  isNotificationOpen,
  closeAllMenus,
  locale
}) => {
  const t = useTranslations('')
  const language = t('language')

  // --- BƯỚC 3: LẤY DỮ LIỆU TỪ CONTEXT ---
  // Toàn bộ state và các hàm liên quan đến notification được lấy từ một nguồn duy nhất.
  const {
    notifications,
    isLoadingNotifications,
    markAllAsRead,
    fetchNotifications
  } = useNotifications()

  // --- CÁC LOGIC MEMOIZE VÀ CALLBACK GIỮ NGUYÊN, NHƯNG GIỜ CHÚNG LẤY DỮ LIỆU TỪ CONTEXT ---

  // Sắp xếp thông báo
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return !isNaN(timeB) && !isNaN(timeA) ? timeB - timeA : 0
    })
  }, [notifications])

  // useEffect để fetch thông báo khi dropdown được mở
  useEffect(() => {
    if (isNotificationOpen) {
      fetchNotifications()
    }
  }, [isNotificationOpen, fetchNotifications])

  // Nhóm thông báo
  const groupNotifications = useCallback(
    (notificationsToGroup: Notification[]) => {
      const now = new Date()
      const oneDayAgo = now.getTime() - 24 * 60 * 60 * 1000
      const newNotificationsGroup = notificationsToGroup.filter(
        n => new Date(n.createdAt).getTime() >= oneDayAgo
      )
      const earlierNotificationsGroup = notificationsToGroup.filter(
        n => new Date(n.createdAt).getTime() < oneDayAgo
      )
      return {
        newNotifications: newNotificationsGroup,
        earlierNotifications: earlierNotificationsGroup
      }
    },
    []
  )

  const { newNotifications, earlierNotifications } =
    groupNotifications(sortedNotifications)

  // Render một item thông báo
  const renderNotificationItem = useCallback(
    (notification: Notification) => {
      const sanitizedMessage =
        typeof window !== 'undefined'
          ? DOMPurify.sanitize(notification.message)
          : notification.message
      return (
        <Link
          href={{
            pathname: `/dashboard`,
            query: { tab: 'notifications', id: notification.id }
          }}
          lang={locale}
          key={notification.id}
          onClick={closeAllMenus} // Đóng dropdown khi click vào một thông báo
        >
          <div
            className={`flex items-start border-b border-gray-20 p-4 hover:bg-gray-5 ${!notification.seenAt ? 'bg-gray-10 ' : ''}`}
          >
            <div className='mr-3 flex-shrink-0'>
              <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-20 '>
                <span className='font-medium text-gray-700 dark:text-gray-200'>
                  {notification.type
                    ? notification.type.charAt(0).toUpperCase()
                    : '?'}
                </span>
                {!notification.seenAt && (
                  <span className='absolute right-0 top-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800'></span>
                )}
              </div>
            </div>
            <div className='flex-grow'>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  p: ({ node, ...props }) => (
                    <p
                      className={`mb-0.5 text-sm ${notification.seenAt ? '' : 'font-bold'}`}
                      {...props}
                    />
                  ),
                  a: ({ node, ...props }) => (
                    <a className='text-button hover:underline' {...props} />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre
                      className='overflow-x-auto rounded-md bg-gray-10 p-2'
                      {...props}
                    />
                  ),
                  code: ({ node, ...props }) => (
                    <code className='rounded bg-gray-10 px-1' {...props} />
                  ),
                  h1: ({ node, ...props }) => (
                    <h1 className='text-base font-bold' {...props} />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2 className='text-sm font-semibold' {...props} />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3 className='text-sm font-medium' {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className='list-inside list-disc text-sm' {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol
                      className='list-inside list-decimal text-sm'
                      {...props}
                    />
                  ),
                  li: ({ node, ...props }) => (
                    <li className='text-sm' {...props} />
                  ),
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
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                {timeAgo(notification.createdAt, language)}
              </span>
            </div>
          </div>
        </Link>
      )
    },
    [locale, language, closeAllMenus]
  ) // Bỏ các dependency không cần thiết

  // Xử lý sự kiện "Mark All As Read"
  const handleMarkAllAsRead = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      await markAllAsRead()
      // Không cần fetch lại ở đây vì context sẽ tự cập nhật state
      // và component sẽ re-render với dữ liệu mới.
    },
    [markAllAsRead]
  )

  // --- BƯỚC 4: RENDER GIAO DIỆN ---
  // JSX không có thay đổi lớn về cấu trúc, chỉ là giờ nó đáng tin cậy hơn.
  return (
    <div
      className={`absolute right-0 z-50 mr-8 mt-10 w-80 overflow-hidden rounded-lg bg-white-pure shadow-xl transition-all duration-300 ease-in-out dark:border dark:border-gray-700 dark:bg-gray-800 md:w-[400px] ${
        isNotificationOpen
          ? 'visible translate-y-0 opacity-100'
          : 'invisible -translate-y-2 opacity-0'
      }`}
      style={{ inset: '0px 0px auto auto' }}
      onClick={e => e.stopPropagation()}
    >
      <div className='border-b border-gray-200 p-4 dark:border-gray-700'>
        <div className='flex items-center justify-between'>
          <h6 className='text-base font-semibold md:text-lg'>
            {t('Notifications')}
          </h6>
          <button
            className='text-sm font-medium text-button hover:underline focus:outline-none'
            onClick={handleMarkAllAsRead}
            disabled={
              isLoadingNotifications || notifications.every(n => n.seenAt)
            }
          >
            {t('Mark All As Read')}
          </button>
        </div>
      </div>

      <div className='overflow-y-auto' style={{ maxHeight: '25rem' }}>
        {isLoadingNotifications ? (
          <div className='flex h-40 items-center justify-center p-4 text-center text-gray-500 dark:text-gray-400'>
            {t('Loading')}
          </div>
        ) : sortedNotifications.length > 0 ? (
          <>
            {newNotifications.length > 0 && (
              <>
                <div className='border-b border-gray-200 bg-gray-10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300'>
                  {t('NEW')}
                </div>
                {newNotifications.map(renderNotificationItem)}
              </>
            )}
            {earlierNotifications.length > 0 && (
              <>
                <div className='border-b border-gray-200 bg-gray-10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300'>
                  {t('EARLIER')}
                </div>
                {earlierNotifications.map(renderNotificationItem)}
              </>
            )}
          </>
        ) : (
          <div className='flex h-40 items-center justify-center p-4 text-center text-gray-500 dark:text-gray-400'>
            {t('No_new_notifications')}
          </div>
        )}
      </div>

      <div className='border-t border-gray-200 bg-gray-10 p-3 text-center dark:border-gray-700 dark:bg-gray-800'>
        <Link
          href={{ pathname: `/dashboard`, query: { tab: 'notifications' } }}
          lang={locale}
          onClick={closeAllMenus}
        >
          <div className='block text-sm font-medium text-button hover:underline'>
            {t('View_all')}
          </div>
        </Link>
      </div>
    </div>
  )
}

export default NotificationDropdown
