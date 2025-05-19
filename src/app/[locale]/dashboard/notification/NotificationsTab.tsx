// NotificationsTab.tsx
import React, { useEffect, useCallback, useState, useMemo } from 'react'
import NotificationItem from './NotificationItem' // Đảm bảo đúng đường dẫn
import NotificationDetails from './NotificationDetails' // Đảm bảo đúng đường dẫn
import useNotifications from '../../../../hooks/dashboard/notification/useNotifications' // Đảm bảo đúng đường dẫn
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
// import { Notification } from '@/src/models/response/user.response'; // Chỉ import nếu type Notification cần ở đây

const NotificationsTab: React.FC = () => {
  const t = useTranslations('')
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedNotificationId = searchParams.get('id')
  const tabParam = searchParams.get('tab')

  const {
    notifications, // Danh sách gốc đã sắp xếp từ hook
    checkedIndices,
    setCheckedIndices, // Hàm để cập nhật checkedIndices từ hook
    loading,
    loggedIn,
    searchTerm,
    setSearchTerm,
    fetchData, // Nếu có nút refresh
    handleUpdateSeenAt,
    handleToggleImportant,
    handleDeleteNotification,
    handleMarkUnseen,
    handleCheckboxChangeTab, // Dùng cho từng item notification
    handleDeleteSelected,
    handleMarkSelectedAsRead,
    handleMarkSelectedAsUnread,
    handleMarkSelectedAsImportant,
    handleMarkSelectedAsUnimportant
  } = useNotifications()

  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'important'>(
    'all'
  )

  // Lọc lần 1: theo searchTerm (từ `notifications` gốc đã sắp xếp)
  const searchedNotifications = useMemo(() => {
    if (!searchTerm) {
      return notifications // notifications từ hook đã được sắp xếp
    }
    return notifications.filter(
      n => (n.message || '').toLowerCase().includes(searchTerm.toLowerCase())
      // (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) // Giả sử có title
    )
  }, [notifications, searchTerm])

  // Lọc lần 2: theo tab UI (từ `searchedNotifications`)
  // Đây là danh sách thực sự hiển thị trên tab hiện tại
  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') {
      return searchedNotifications.filter(n => !n.seenAt)
    } else if (filter === 'read') {
      return searchedNotifications.filter(n => !!n.seenAt) // Đảm bảo seenAt có giá trị (không null/undefined)
    } else if (filter === 'important') {
      return searchedNotifications.filter(n => n.isImportant)
    }
    return searchedNotifications // filter 'all'
  }, [searchedNotifications, filter])

  // --- Logic Select All và trạng thái cho tab hiện tại ---
  const displayedNotificationIds = useMemo(
    () => displayedNotifications.map(n => n.id),
    [displayedNotifications]
  )

  const selectAllForCurrentTabChecked = useMemo(() => {
    if (displayedNotificationIds.length === 0) return false
    return displayedNotificationIds.every(id => checkedIndices.includes(id))
  }, [displayedNotificationIds, checkedIndices])

  const handleSelectAllForCurrentTabChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const isChecked = event.target.checked
      if (isChecked) {
        // Chọn tất cả items trong view hiện tại, thêm vào checkedIndices
        // Giữ lại những cái đã chọn từ các view khác nếu có (bằng cách dùng Set để tránh trùng lặp)
        setCheckedIndices(prev => [
          ...new Set([...prev, ...displayedNotificationIds])
        ])
      } else {
        // Bỏ chọn tất cả items trong view hiện tại
        // Xóa chúng khỏi checkedIndices, giữ lại những cái đã chọn từ view khác
        setCheckedIndices(prev =>
          prev.filter(id => !displayedNotificationIds.includes(id))
        )
      }
    },
    [displayedNotificationIds, setCheckedIndices]
  )

  // Các mục đang được chọn VÀ hiển thị trong tab hiện tại
  const selectedAndDisplayedItems = useMemo(() => {
    return displayedNotifications.filter(n => checkedIndices.includes(n.id))
  }, [displayedNotifications, checkedIndices])

  const allSelectedInCurrentTabAreRead = useMemo(() => {
    if (selectedAndDisplayedItems.length === 0) return false
    return selectedAndDisplayedItems.every(n => !!n.seenAt)
  }, [selectedAndDisplayedItems])

  const allSelectedInCurrentTabAreImportant = useMemo(() => {
    if (selectedAndDisplayedItems.length === 0) return false
    return selectedAndDisplayedItems.every(n => n.isImportant)
  }, [selectedAndDisplayedItems])
  // --- Kết thúc Logic Select All và trạng thái cho tab hiện tại ---

  useEffect(() => {
    if (selectedNotificationId) {
      const notification = notifications.find(
        n => n.id === selectedNotificationId
      )
      if (notification && !notification.seenAt) {
        handleUpdateSeenAt(selectedNotificationId)
      }
    }
  }, [selectedNotificationId, handleUpdateSeenAt, notifications])

  const handleBackToNotifications = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.delete('id')
    router.push(`${pathname}?${newSearchParams.toString()}`)
  }

  if (!loggedIn) {
    return (
      <div className='container mx-auto p-4'>
        {t('Please_log_in_to_view_notifications')}
      </div>
    )
  }

  if (tabParam !== 'notifications') {
    return null
  }

  if (loading) {
    return <div className='container mx-auto p-4'>{t('Loading')}</div>
  }

  if (selectedNotificationId) {
    const notification = notifications.find(
      n => n.id === selectedNotificationId
    )
    if (notification) {
      return (
        <NotificationDetails
          notification={notification}
          onBack={handleBackToNotifications}
          onDelete={handleDeleteNotification} // Hàm từ hook
          onToggleImportant={handleToggleImportant} // Hàm từ hook
        />
      )
    } else {
      console.warn(`Notification with id ${selectedNotificationId} not found.`)
      return (
        <div className='container mx-auto p-4'>
          {t('Notification_not_found')}{' '}
          <button
            onClick={handleBackToNotifications}
            className='text-blue-600 hover:underline'
          >
            {t('Back')}
          </button>
        </div>
      )
    }
  }

  return (
    <div className='container mx-auto p-2 md:p-6'>
      <div className='mb-4'>
        <input
          type='text'
          placeholder={t('Search_notifications') || 'Search notifications...'}
          className='w-full rounded-full border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-button'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='mb-4 flex flex-wrap gap-2'>
        <button
          onClick={() => setFilter('all')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'all' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
          {t('All')}
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'unread' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
          {t('Unread')}
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'read' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
          {t('Read')}
        </button>
        <button
          onClick={() => setFilter('important')}
          className={`rounded px-3 py-1 text-sm md:px-4 md:py-2 ${filter === 'important' ? 'bg-button text-white' : 'bg-gray-20 hover:bg-gray-30'}`}
        >
          {t('Important')}
        </button>
      </div>

      <div className='mb-4 flex flex-wrap items-center gap-2'>
        <div className='flex items-center'>
          <input
            type='checkbox'
            id='select-all-current-tab' // ID duy nhất
            className='ml-4 mr-2 h-4 w-4 cursor-pointer rounded border-gray-30 text-blue-600 focus:ring-button'
            checked={selectAllForCurrentTabChecked}
            onChange={handleSelectAllForCurrentTabChange}
            aria-label='Select all notifications in current tab'
            disabled={displayedNotifications.length === 0}
          />
          <label
            htmlFor='select-all-current-tab'
            className='mr-4 cursor-pointer text-sm'
          >
            {t('Select_All')}
          </label>
        </div>

        {/* Hiển thị nút nếu có BẤT KỲ mục nào được chọn (trong checkedIndices tổng) */}
        {/* vì các hành động này sẽ áp dụng cho TẤT CẢ các mục trong checkedIndices */}
        {checkedIndices.length > 0 && (
          <>
            <button
              onClick={
                allSelectedInCurrentTabAreRead // UI dựa trên trạng thái của tab
                  ? handleMarkSelectedAsUnread // Action từ hook (hoạt động trên checkedIndices)
                  : handleMarkSelectedAsRead
              }
              className='flex min-w-[110px] items-center justify-center rounded bg-button px-2 py-1 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 md:min-w-[140px] md:px-3 md:text-base'
              aria-label={
                allSelectedInCurrentTabAreRead
                  ? t('Mark_Selected_as_Unread')
                  : t('Mark_Selected_as_Read')
              }
            >
              {allSelectedInCurrentTabAreRead ? (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='mr-1 md:mr-2'
                  >
                    <rect width='20' height='16' x='2' y='4' rx='2' />
                    <path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
                  </svg>
                  <span className='truncate'>{t('Mark_As_Unread')}</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='mr-1 md:mr-2'
                  >
                    <path d='M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z' />
                    <path d='m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10' />
                  </svg>
                  <span className='truncate'>{t('Mark_As_Read')}</span>
                </>
              )}
            </button>
            <button
              onClick={
                allSelectedInCurrentTabAreImportant // UI dựa trên trạng thái của tab
                  ? handleMarkSelectedAsUnimportant // Action từ hook
                  : handleMarkSelectedAsImportant
              }
              className='flex min-w-[110px] items-center justify-center rounded bg-yellow-500 px-2 py-1 text-sm font-bold text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:min-w-[140px] md:px-3 md:text-base'
              aria-label={
                allSelectedInCurrentTabAreImportant
                  ? t('Mark_Selected_as_Unimportant')
                  : t('Mark_Selected_as_Important')
              }
            >
              {allSelectedInCurrentTabAreImportant ? (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='mr-1 md:mr-2'
                  >
                    <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                  </svg>
                  <span className='truncate'>{t('Mark_As_Unimportant')}</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='mr-1 md:mr-2'
                  >
                    <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
                  </svg>
                  <span className='truncate'>{t('Mark_As_Important')}</span>
                </>
              )}
            </button>
            <button
              onClick={handleDeleteSelected} // Action từ hook
              className='flex min-w-[110px] items-center justify-center rounded bg-red-500 px-2 py-1 text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 md:min-w-[140px] md:px-3 md:text-base'
              aria-label={t('Delete_Selected')}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='18'
                height='18'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='mr-1 md:mr-2'
              >
                <path d='M3 6h18' />
                <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' />
                <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' />
                <line x1='10' x2='10' y1='11' y2='17' />
                <line x1='14' x2='14' y1='11' y2='17' />
              </svg>
              <span className='truncate'>{t('Delete_Selected')}</span>
            </button>
          </>
        )}
      </div>

      <div className='overflow-hidden rounded border bg-white-pure shadow'>
        {displayedNotifications.length === 0 ? (
          <p className='p-4 text-center'>
            {t('You_have_no_notifications_matching_criteria') ||
              'No notifications match your current filters.'}
          </p>
        ) : (
          displayedNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDelete={() => handleDeleteNotification(notification.id)}
              isChecked={checkedIndices.includes(notification.id)} // checkedIndices từ hook
              onCheckboxChange={checked =>
                handleCheckboxChangeTab(notification.id, checked)
              } // Dùng hàm từ hook
              onToggleImportant={handleToggleImportant}
              onMarkUnseen={handleMarkUnseen}
              notificationId={notification.id} // Prop này không cần thiết nếu đã có notification.id
            />
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationsTab
