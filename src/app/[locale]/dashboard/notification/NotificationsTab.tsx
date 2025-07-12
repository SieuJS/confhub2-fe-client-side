// src/app/[locale]/dashboard/notifications/NotificationsTab.tsx

import React, { useEffect, useCallback, useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// --- Local Imports ---
// Hooks
import useNotifications from '../../../../hooks/dashboard/notification/useNotifications'
import useConfirmationModal from '@/src/hooks/dashboard/notification/useConfirmModal'
import { useAuth } from '@/src/contexts/AuthContext'

// UI Components
import Button from '../../utils/Button'
import SearchInput from '../../utils/SearchInput'
import GeneralPagination from '../../utils/GeneralPagination'
import Modal from '@/src/app/[locale]/chatbot/Modal'
import { Link } from '@/src/navigation'

// Child Components
import NotificationDetails from './NotificationDetails'
import NotificationFilter from './NotificationFilter'
import NotificationBulkActions from './NotificationBulkActions'
import NotificationList from './NotificationList'

/**
 * NotificationsTab là component chính hiển thị và quản lý tất cả các thông báo của người dùng.
 * Nó tích hợp tìm kiếm, lọc, phân trang, và các hành động hàng loạt.
 */
const NotificationsTab: React.FC = () => {
  const t = useTranslations('')
  const { logout } = useAuth()

  // === STATE & HOOKS ===

  // State cục bộ để quản lý bộ lọc UI (All, Unread, etc.)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read' | 'important'>(
    'all'
  )

  // State để quản lý trạng thái loading cho các hành động (xóa, đánh dấu,...)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State và hàm cho modal lỗi
  const [errorModalState, setErrorModalState] = useState<{
    isOpen: boolean
    title: string
    message: string
  }>({
    isOpen: false,
    title: '',
    message: ''
  })

  const showErrorModal = useCallback((title: string, message: string) => {
    setErrorModalState({ isOpen: true, title, message })
  }, [])

  const hideErrorModal = useCallback(() => {
    setErrorModalState({ isOpen: false, title: '', message: '' })
  }, [])

  // Hook chính cung cấp toàn bộ dữ liệu và logic nghiệp vụ cho thông báo.
  const {
    notifications,
    checkedIndices,
    selectAllChecked,
    loading,
    loggedIn,
    isBanned,
    initialLoad,
    searchTerm,
    setSearchTerm,
    paginatedNotifications,
    currentPage,
    totalPages,
    setCurrentPage,
    handleUpdateSeenAt,
    handleToggleImportant,
    handleDeleteNotification,
    handleToggleReadStatus, // <--- THÊM HÀM NÀY
    handleCheckboxChangeTab,
    handleDeleteSelected,
    handleSelectAllChange,
    handleMarkSelectedAsRead,
    handleMarkSelectedAsUnread,
    allSelectedAreRead,
    handleMarkSelectedAsImportant,
    handleMarkSelectedAsUnimportant,
    allSelectedAreImportant
  } = useNotifications({ filter, showErrorModal })

  // Hooks của Next.js để quản lý routing
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedNotificationId = searchParams.get('id')
  const tab = searchParams.get('tab')

  // Hook để quản lý modal xác nhận
  const { modalState, showConfirmationModal, hideConfirmationModal } =
    useConfirmationModal()

  // === HANDLERS & CALLBACKS ===

  // Hàm wrapper để thực hiện các hành động bất đồng bộ, quản lý trạng thái `isSubmitting`
  const performAction = useCallback(
    async (action: () => Promise<void>) => {
      if (isSubmitting) return // Ngăn chặn các hành động chồng chéo
      setIsSubmitting(true)
      try {
        await action()
      } catch (error: any) {
        console.error('Action failed:', error)
        // Hiển thị modal báo lỗi rõ ràng
        const errorMessage = error.message || t('MyConferences.Unknown_Error')
        const errorTitle = t('MyConferences.Operation_Failed')
        showErrorModal(errorTitle, errorMessage)
      } finally {
        setIsSubmitting(false)
        hideConfirmationModal()
      }
    },
    [isSubmitting, hideConfirmationModal, showErrorModal, t]
  )

  // Mở modal xác nhận trước khi xóa một thông báo
  const confirmDeleteSingle = useCallback(
    (notificationId: string) => {
      showConfirmationModal(
        t('Confirm_Deletion_Title') || 'Confirm Deletion',
        t('Confirm_Deletion_Message') ||
          'Are you sure you want to delete this notification?',
        () => performAction(() => handleDeleteNotification(notificationId))
      )
    },
    [showConfirmationModal, t, performAction, handleDeleteNotification]
  )

  // Mở modal xác nhận trước khi xóa hàng loạt
  const confirmDeleteSelected = useCallback(() => {
    if (checkedIndices.length === 0) return
    showConfirmationModal(
      t('Confirm_Bulk_Deletion_Title') || 'Confirm Bulk Deletion',
      t('Confirm_Bulk_Deletion_Message', { count: checkedIndices.length }) ||
        `Are you sure you want to delete ${checkedIndices.length} notifications?`,
      () => performAction(handleDeleteSelected)
    )
  }, [
    checkedIndices.length,
    showConfirmationModal,
    t,
    performAction,
    handleDeleteSelected
  ])

  // Xử lý khi người dùng chuyển trang
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [setCurrentPage]
  )

  // Quay lại danh sách từ màn hình chi tiết
  const handleBackToNotifications = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    newSearchParams.delete('id')
    router.push(`${pathname}?${newSearchParams.toString()}`)
  }, [pathname, router, searchParams])

  // === SIDE EFFECTS ===

  // Tự động đánh dấu đã xem khi mở chi tiết thông báo
  useEffect(() => {
    if (selectedNotificationId) {
      const notification = notifications.find(
        n => n.id === selectedNotificationId
      )
      if (notification && !notification.seenAt) {
        // Sử dụng handleToggleReadStatus để đánh dấu là đã đọc
        handleToggleReadStatus(selectedNotificationId, false) // false vì hiện tại nó chưa đọc, muốn đánh dấu là đã đọc
      }
    }
  }, [selectedNotificationId, handleToggleReadStatus, notifications]) // Đổi handleUpdateSeenAt thành handleToggleReadStatus

  // === RENDER LOGIC ===

  // 1. Trạng thái loading ban đầu
  if (loading && initialLoad) {
    return (
      <div className='flex h-80 flex-col items-center justify-center text-gray-500'>
        <Loader2 className='h-10 w-10 animate-spin text-indigo-600' />
        <p className='mt-4 text-lg'>
          {t('MyConferences.Loading_your_notifications') ||
            'Loading notifications...'}
        </p>
      </div>
    )
  }

  // 2. Không render nếu không phải tab 'notifications'
  if (tab !== 'notifications') {
    return null
  }

  // 3. Trạng thái chưa đăng nhập hoặc bị cấm (giờ đã hoạt động chính xác)
  if (!loggedIn) {
    const AuthMessage = ({
      titleKey,
      messageKey,
      isBannedUser
    }: {
      titleKey: string
      messageKey: string
      isBannedUser?: boolean
    }) => {
      if (isBannedUser) {
        logout({ callApi: true, preventRedirect: true })
      }
      return (
        <div className='container mx-auto p-4 text-center'>
          <h2
            className={`mb-2 text-xl font-semibold ${isBannedUser ? 'font-bold text-red-600' : ''}`}
          >
            {t(titleKey)}
          </h2>
          <p className='mb-4'>{t(messageKey)}</p>
          <Link href='/auth/login'>
            <Button variant='primary'>{t('Sign_In')}</Button>
          </Link>
        </div>
      )
    }

    if (isBanned) {
      return (
        <AuthMessage
          titleKey='MyConferences.Account_Banned_Title'
          messageKey='MyConferences.Account_Banned_Message'
          isBannedUser
        />
      )
    }
    return (
      <AuthMessage
        titleKey='MyConferences.Login_Required_Title'
        messageKey='MyConferences.Login_Required_Message'
      />
    )
  }

  // 4. Trạng thái xem chi tiết một thông báo
  if (selectedNotificationId) {
    const notification = notifications.find(
      n => n.id === selectedNotificationId
    )
    if (notification) {
      return (
        <NotificationDetails
          notification={notification}
          onBack={handleBackToNotifications}
          onDelete={() => confirmDeleteSingle(notification.id)}
          onToggleImportant={id =>
            performAction(() => handleToggleImportant(id))
          }
          // Không cần onMarkUnseen ở đây vì đã dùng handleToggleReadStatus ở useEffect
        />
      )
    }
    // Trường hợp không tìm thấy ID
    return (
      <div className='container mx-auto p-4'>
        {t('Notification_not_found') || 'Notification not found.'}{' '}
        <button
          onClick={handleBackToNotifications}
          className='text-blue-600 hover:underline'
        >
          {t('Back') || 'Back'}
        </button>
      </div>
    )
  }

  // 5. Giao diện chính của danh sách thông báo
  return (
    <div className='container mx-auto p-2'>
      {/* Thanh điều khiển: Lọc và Tìm kiếm */}
      <div className='mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center'>
        <div className='w-full md:w-auto'>
          <NotificationFilter
            currentFilter={filter}
            onFilterChange={setFilter}
          />
        </div>
        <div className='w-full md:w-1/3 lg:w-1/4'>
          <SearchInput
            initialValue={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder={t('Search_notifications') || 'Search notifications...'}
            debounceDelay={300}
          />
        </div>
      </div>

      {/* Thanh hành động hàng loạt */}
      <NotificationBulkActions
        checkedCount={checkedIndices.length}
        selectAllChecked={selectAllChecked}
        onSelectAllChange={handleSelectAllChange}
        allSelectedAreRead={allSelectedAreRead}
        onMarkSelectedAsReadUnread={() =>
          performAction(
            allSelectedAreRead
              ? handleMarkSelectedAsUnread
              : handleMarkSelectedAsRead
          )
        }
        allSelectedAreImportant={allSelectedAreImportant}
        onMarkSelectedAsImportantUnimportant={() =>
          performAction(
            allSelectedAreImportant
              ? handleMarkSelectedAsUnimportant
              : handleMarkSelectedAsImportant
          )
        }
        onDeleteSelected={confirmDeleteSelected}
        isListEmpty={paginatedNotifications.length === 0}
        isSubmitting={isSubmitting}
      />

      {/* Danh sách thông báo */}
      <div className='mt-4 overflow-hidden rounded-lg border bg-white-pure shadow-sm'>
        <NotificationList
          notifications={paginatedNotifications}
          loading={loading}
          initialLoad={initialLoad}
          checkedIndices={checkedIndices}
          onCheckboxChange={handleCheckboxChangeTab}
          onDelete={confirmDeleteSingle}
          onToggleImportant={id =>
            performAction(() => handleToggleImportant(id))
          }
          onToggleReadStatus={(id, isRead) =>
            performAction(() => handleToggleReadStatus(id, isRead))
          }
        />
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className='mt-6 flex justify-center'>
          <GeneralPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            maxPageNumbersToShow={5}
          />
        </div>
      )}

      {/* Modal xác nhận */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideConfirmationModal}
        title={modalState.title}
        size='sm'
        footer={
          <div className='flex justify-between'>
            <Button
              variant='secondary'
              onClick={hideConfirmationModal}
              disabled={isSubmitting}
            >
              {t('Cancel') || 'Cancel'}
            </Button>
            <Button
              variant='danger'
              onClick={modalState.onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {t('Confirm') || 'Confirm'}
            </Button>
          </div>
        }
      >
        <p>{modalState.message}</p>
      </Modal>

      {/* Modal báo lỗi API */}
      <Modal
        isOpen={errorModalState.isOpen}
        onClose={hideErrorModal}
        title={errorModalState.title}
        size='sm'
        footer={
          <Button variant='primary' onClick={hideErrorModal}>
            {t('OK') || 'OK'}
          </Button>
        }
      >
        <p className='text-red-600'>{errorModalState.message}</p>
      </Modal>
    </div>
  )
}

export default NotificationsTab
