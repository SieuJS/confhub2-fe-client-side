// SettingTab.tsx
import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLocalStorage } from 'usehooks-ts' // Import useLocalStorage
import { useRouter, usePathname } from 'next/navigation' // Correct import
import deleteUser from '../../../../api/user/deleteUser' // Import API function directly

interface SettingTabProps {
  //  props (nếu bạn có truyền props nào từ component cha).
}

const SettingTab: React.FC<SettingTabProps> = () => {
  const t = useTranslations('')
  const [autoAdd, setAutoAdd] = useState(true)
  const [changeUpdate, setChangeUpdate] = useState(true)
  const [upcomingEvent, setUpcomingEvent] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState<
    'notification' | 'notification+email'
  >('notification') // Thay đổi state
  const [isDeleting, setIsDeleting] = useState(false) // Add loading state
  const [deleteError, setDeleteError] = useState<string | null>(null) // Add error state
  const router = useRouter()
  const pathname = usePathname()

  // Get user from local storage
  const [user, setUser] = useLocalStorage<{
    firstname: string
    lastname: string
    email: string
    id: string
  } | null>('user', null)

  const toggleAutoAdd = () => setAutoAdd(!autoAdd)
  const toggleChangeUpdate = () => setChangeUpdate(!changeUpdate)
  const toggleUpcomingEvent = () => setUpcomingEvent(!upcomingEvent)
  const handleDeliveryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    // Hàm xử lý thay đổi
    setDeliveryMethod(
      event.target.value as 'notification' | 'notification+email'
    )
  }

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account?  This action cannot be undone.'
      )
    ) {
      setIsDeleting(true) // Set loading state to true
      setDeleteError(null) // Clear any previous errors

      try {
        if (!user) {
          setDeleteError('User not logged in.')
          return // Early return if no user
        }
        await deleteUser(user.id) // Call the API function
        setUser(null)

        // Redirect to login page, correctly handling locale
        let pathWithLocale = '/auth/login'
        if (pathname) {
          const pathParts = pathname.split('/')
          if (pathParts.length > 1) {
            const localePrefix = pathParts[1]
            pathWithLocale = `/${localePrefix}/auth/login`
          }
        }
        router.push(pathWithLocale)
      } catch (error: any) {
        setDeleteError(error.message || 'Failed to delete account.') // Set error message
        console.error('Failed to delete account:', error) // Log the error for debugging.
      } finally {
        setIsDeleting(false) // Reset loading state
      }
    }
  }

  return (
    <div className='flex'>
      {/* Main Content */}
      <main className='flex-1 p-8'>
        <header className='mb-4 flex items-center justify-between'>
          <h2 className='text-2xl font-semibold'>{t('Setting')}</h2>
        </header>

        {/* Setting Options */}
        <section className='mb-8'>
          {/* Option 1: Auto add events to schedule */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>
                {t('Auto_add_events_to_schedule')}
              </h4>
              <p className=' text-sm'>
                {t('Auto_add_events_to_schedule_describe')}.
              </p>
            </div>
            <button
              className={`h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                autoAdd ? 'bg-button' : 'bg-background-secondary'
              }`}
              onClick={toggleAutoAdd}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  autoAdd ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 2: Change and Update */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>{t('Change_and_Update')}</h4>
              <p className=' text-sm'>{t('Change_and_Update_describe')}</p>
            </div>
            <button
              className={`h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                changeUpdate ? 'bg-button' : 'bg-background-secondary'
              }`}
              onClick={toggleChangeUpdate}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  changeUpdate ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 3: Your upcoming event */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>{t('Your_upcoming_event')}</h4>
              <p className=' text-sm'>{t('Your_upcoming_event_describe')}</p>
            </div>
            <button
              className={`h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                upcomingEvent ? 'bg-button' : 'bg-background-secondary'
              }`}
              onClick={toggleUpcomingEvent}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  upcomingEvent ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 4: Customize notification delivery (Combobox) */}
          <div className='mb-8 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>
                {t('Customize_notification_delivery')}
              </h4>
              <p className=' text-sm'>
                {t('Customize_notification_delivery_describe')}
              </p>
            </div>
            <select
              className='rounded border border-button bg-background-secondary px-2 py-1  focus:border-2 focus:outline-none'
              value={deliveryMethod}
              onChange={handleDeliveryChange}
            >
              <option value='notification'>{t('Notification_only')}</option>
              <option value='notification+email'>
                {t('NOtification_email')}
              </option>
            </select>
          </div>
        </section>

        {/* Delete Account Button */}
        <section>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className='focus:shadow-outline rounded bg-red-500 px-4 py-2 font-semibold text-white hover:bg-red-600 focus:outline-none'
          >
            {isDeleting ? 'Deleting...' : t('Delete_Account')}
          </button>
          {deleteError && (
            <p className='mt-2 text-sm text-red-500'>{deleteError}</p>
          )}
          <p className='mt-2 text-sm'>{t('Delete_Account_describe')}</p>
        </section>
      </main>
    </div>
  )
}

export default SettingTab
