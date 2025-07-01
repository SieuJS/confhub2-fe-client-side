// NotificationsTab.tsx

import React, { useEffect, useCallback, useState, useMemo } from 'react'
import Button from '../../utils/Button'
import { Link } from '@/src/navigation'
import NotificationItem from './NotificationItem'
import NotificationDetails from './NotificationDetails'
import useNotifications from '../../../../hooks/dashboard/notification/useNotifications'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/src/contexts/AuthContext'
import { Mail, MailOpen, Star, Trash2, Loader2 } from 'lucide-react'

// BƯỚC 1: IMPORT COMPONENT TÌM KIẾM MỚI
import SearchInput from '../../utils/SearchInput' // <-- Đảm bảo đường dẫn này chính xác

const NotificationsTab: React.FC = () => {
  const t = useTranslations('')
  const { logout } = useAuth()

  const {
    notifications,
    checkedIndices,
    selectAllChecked,
    loading,
    loggedIn,
    searchTerm,
    filteredNotifications,
    handleUpdateSeenAt,
    handleToggleImportant,
    handleDeleteNotification,
    handleMarkUnseen,
    handleCheckboxChangeTab,
    handleDeleteSelected,
    handleSelectAllChange,
    handleMarkSelectedAsRead,
    handleMarkSelectedAsUnread,
    allSelectedAreRead,
    handleMarkSelectedAsImportant,
    handleMarkSelectedAsUnimportant,
    allSelectedAreImportant,
    setSearchTerm,
    isBanned,
    initialLoad
  } = useNotifications()

  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedNotificationId = searchParams.get('id')
  const tab = searchParams.get('tab')

  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'important'>(
    'all'
  )

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

  const handleCheckboxChange = useCallback(
    (notificationId: string, checked: boolean) => {
      handleCheckboxChangeTab(notificationId, checked)
    },
    [handleCheckboxChangeTab]
  )

  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') {
      return filteredNotifications.filter(n => !n.seenAt)
    } else if (filter === 'read') {
      return filteredNotifications.filter(n => n.seenAt)
    } else if (filter === 'important') {
      return filteredNotifications.filter(n => n.isImportant)
    }
    return filteredNotifications
  }, [filteredNotifications, filter])

  const renderLoading = () => (
    <div className='flex h-80 flex-col items-center justify-center text-gray-500'>
      <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
      <p className='mt-4 text-lg'>
        {t('MyConferences.Loading_your_conferences')}
      </p>
    </div>
  )

  if (loading && initialLoad) {
    return <div className='container mx-auto p-4'>{renderLoading()}</div>
  }

  if (tab !== 'notifications') {
    return null
  }

  if (!loggedIn) {
    if (isBanned) {
      logout({ callApi: true, preventRedirect: true })
      return (
        <div className='container mx-auto p-4 text-center'>
          <h2 className='mb-2 text-xl font-bold text-red-600'>
            {t('MyConferences.Account_Banned_Title')}
          </h2>
          <p className='mb-4'>{t('MyConferences.Account_Banned_Message')}</p>
          <Link href='/auth/login'>
            <Button variant='primary'>{t('Sign_In')}</Button>
          </Link>
        </div>
      )
    }
    return (
      <div className='container mx-auto p-4 text-center'>
        <h2 className='mb-2 text-xl font-semibold'>
          {t('MyConferences.Login_Required_Title')}
        </h2>
        <p className='mb-4'>{t('MyConferences.Login_Required_Message')}</p>
        <Link href='/auth/login'>
          <Button variant='primary'>{t('Sign_In')}</Button>
        </Link>
      </div>
    )
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
          onDelete={handleDeleteNotification}
          onToggleImportant={handleToggleImportant}
        />
      )
    } else {
      // console.warn(
      //   `Notification with id ${selectedNotificationId} not found in the list.`
      // )
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
      {/* BƯỚC 2: SỬ DỤNG COMPONENT SEARCHINPUT ĐÃ TÁCH */}
      <div className='mb-4'>
        <SearchInput
          initialValue={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder={t('Search_notifications') || 'Search notifications...'}
          debounceDelay={300} // Giảm delay một chút để phản hồi nhanh hơn
        />
      </div>

      {/* Các nút lọc UI */}
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

      {/* Thanh hành động hàng loạt */}
      <div className='mb-4 flex flex-wrap items-center gap-2'>
        <div className='flex items-center'>
          {/* <input
            type='checkbox'
            id='select-all'
            className='ml-4 mr-2 h-4 w-4 cursor-pointer rounded border-gray-30 text-blue-600 focus:ring-button'
            checked={selectAllChecked}
            onChange={handleSelectAllChange}
            aria-label='Select all notifications'
            disabled={filteredNotifications.length === 0}
          />
          <label htmlFor='select-all' className='mr-4 cursor-pointer text-sm'>
            {t('Select_All')}
          </label> */}
        </div>
        {checkedIndices.length > 0 && (
          <>
            <button
              onClick={
                allSelectedAreRead
                  ? handleMarkSelectedAsUnread
                  : handleMarkSelectedAsRead
              }
              className='flex min-w-[110px] items-center justify-center rounded bg-button px-2 py-1 text-sm font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 md:min-w-[140px] md:px-3 md:text-base'
              aria-label={
                allSelectedAreRead
                  ? t('Mark_Selected_as_Unread')
                  : t('Mark_Selected_as_Read')
              }
            >
              {allSelectedAreRead ? (
                <>
                  <MailOpen className='mr-1 h-4 w-4 md:mr-2' />
                  <span className='truncate'>{t('Mark_As_Unread')}</span>
                </>
              ) : (
                <>
                  <Mail className='mr-1 h-4 w-4 md:mr-2' />
                  <span className='truncate'>{t('Mark_As_Read')}</span>
                </>
              )}
            </button>
            <button
              onClick={
                allSelectedAreImportant
                  ? handleMarkSelectedAsUnimportant
                  : handleMarkSelectedAsImportant
              }
              className='flex min-w-[110px] items-center justify-center rounded bg-yellow-500 px-2 py-1 text-sm font-bold text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 md:min-w-[140px] md:px-3 md:text-base'
              aria-label={
                allSelectedAreImportant
                  ? t('Mark_Selected_as_Unimportant')
                  : t('Mark_Selected_as_Important')
              }
            >
              {allSelectedAreImportant ? (
                <>
                  <Star
                    className='mr-1 h-4 w-4 md:mr-2'
                    stroke='currentColor'
                    fill='none'
                  />
                  <span className='truncate'>{t('Mark_As_Unimportant')}</span>
                </>
              ) : (
                <>
                  <Star className='mr-1 h-4 w-4 md:mr-2' fill='currentColor' />
                  <span className='truncate'>{t('Mark_As_Important')}</span>
                </>
              )}
            </button>
            <button
              onClick={handleDeleteSelected}
              className='flex min-w-[110px] items-center justify-center rounded bg-red-500 px-2 py-1 text-sm font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 md:min-w-[140px] md:px-3 md:text-base'
              aria-label={t('Delete_Selected')}
            >
              <Trash2 className='mr-1 h-4 w-4 md:mr-2' />
              <span className='truncate'>{t('Delete_Selected')}</span>
            </button>
          </>
        )}
      </div>

      {/* Danh sách thông báo */}
      <div className='overflow-hidden rounded border bg-white-pure shadow'>
        {loading && !initialLoad && renderLoading()}

        {!loading && displayedNotifications.length === 0 ? (
          <p className='p-4 text-center '>
            {t('You_have_no_notifications_matching_criteria') ||
              'No notifications match your current filters.'}
          </p>
        ) : (
          !loading &&
          displayedNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDelete={() => handleDeleteNotification(notification.id)}
              isChecked={checkedIndices.includes(notification.id)}
              onCheckboxChange={checked =>
                handleCheckboxChange(notification.id, checked)
              }
              onToggleImportant={handleToggleImportant}
              onMarkUnseen={handleMarkUnseen}
              notificationId={notification.id}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default NotificationsTab
