// SettingTab.tsx
import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useLocalStorage } from 'usehooks-ts'
import { useRouter, usePathname } from 'next/navigation'
import deleteUser from '../../../../app/api/user/deleteUser'
import { useUpdateUser } from '../../../../hooks/dashboard/setting/useUpdateSettings'
import { useGetUser } from '../../../../hooks/dashboard/setting/useGetUser'
import { Setting } from '@/src/models/response/user.response'

const SettingTab: React.FC = () => {
  const t = useTranslations('')
  const [localUser, setLocalUser] = useLocalStorage<{ id: string } | null>(
    'user',
    null
  )
  const {
    user,
    loading: userLoading,
    error: userError,
    refetch
  } = useGetUser(localUser?.id || null)
  const [setting, setSetting] = useState<Setting | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const {
    updateUserSetting,
    loading: updateLoading,
    error: updateError
  } = useUpdateUser()

  useEffect(() => {
    if (user?.setting) {
      setSetting(user.setting)
    }
  }, [user])

  const toggleAutoAdd = async () => {
    if (user && setting) {
      await updateUserSetting(user.id, {
        autoAddFollowToCalendar: !setting.autoAddFollowToCalendar
      })
      setSetting(prev =>
        prev
          ? { ...prev, autoAddFollowToCalendar: !prev.autoAddFollowToCalendar }
          : null
      )
      refetch()
    }
  }

  const toggleChangeUpdate = async () => {
    if (user && setting) {
      await updateUserSetting(user.id, {
        notificationWhenConferencesChanges:
          !setting.notificationWhenConferencesChanges
      })
      setSetting(prev =>
        prev
          ? {
              ...prev,
              notificationWhenConferencesChanges:
                !prev.notificationWhenConferencesChanges
            }
          : null
      )
      refetch()
    }
  }

  const toggleUpcomingEvent = async () => {
    if (user && setting) {
      await updateUserSetting(user.id, {
        upComingEvent: !setting.upComingEvent
      })
      setSetting(prev =>
        prev ? { ...prev, upComingEvent: !prev.upComingEvent } : null
      )
      refetch()
    }
  }

  const handleDeliveryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (user && setting) {
      const newDeliveryMethod = event.target.value as 'System' | 'Email' | 'All'
      await updateUserSetting(user.id, {
        notificationThrough: newDeliveryMethod
      })
      setSetting(prev =>
        prev ? { ...prev, notificationThrough: newDeliveryMethod } : null
      )
      refetch()
    }
  }

  const toggleReceiveNotifications = async () => {
    if (user && setting) {
      await updateUserSetting(user.id, {
        receiveNotifications: !setting.receiveNotifications
      })
      setSetting(prev =>
        prev
          ? { ...prev, receiveNotifications: !prev.receiveNotifications }
          : null
      )
      refetch()
    }
  }

  const toggleNotificationWhenUpdateProfile = async () => {
    if (user && setting) {
      await updateUserSetting(user.id, {
        notificationWhenUpdateProfile: !setting.notificationWhenUpdateProfile
      })
      setSetting(prev =>
        prev
          ? {
              ...prev,
              notificationWhenUpdateProfile: !prev.notificationWhenUpdateProfile
            }
          : null
      )
      refetch()
    }
  }

  const toggleNotificationWhenFollow = async () => {
    if (user && setting) {
      await updateUserSetting(user.id, {
        notificationWhenFollow: !setting.notificationWhenFollow
      })
      setSetting(prev =>
        prev
          ? { ...prev, notificationWhenFollow: !prev.notificationWhenFollow }
          : null
      )
      refetch()
    }
  }

  const toggleNotificationWhenAddToCalendar = async () => {
    if (user && setting) {
      await updateUserSetting(user.id, {
        notificationWhenAddTocalendar: !setting.notificationWhenAddTocalendar
      })
      setSetting(prev =>
        prev
          ? {
              ...prev,
              notificationWhenAddTocalendar: !prev.notificationWhenAddTocalendar
            }
          : null
      )
      refetch()
    }
  }

  const toggleNotificationWhenAddToBlacklist = async () => {
    if (user && setting) {
      await updateUserSetting(user.id, {
        notificationWhenAddToBlacklist: !setting.notificationWhenAddToBlacklist
      })
      setSetting(prev =>
        prev
          ? {
              ...prev,
              notificationWhenAddToBlacklist:
                !prev.notificationWhenAddToBlacklist
            }
          : null
      )
      refetch()
    }
  }

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        'Are you sure you want to delete your account?  This action cannot be undone.'
      )
    ) {
      setIsDeleting(true)
      setDeleteError(null)

      try {
        if (!localUser) {
          setDeleteError('User not logged in.')
          return
        }
        await deleteUser(localUser.id)
        // setUser(null); // Remove useLocalStorage is not needed

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
        setDeleteError(error.message || 'Failed to delete account.')
        console.error('Failed to delete account:', error)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  if (userLoading) {
    return <div>{t('Loading_settings')}</div>
  }

  if (userError) {
    return (
      <div>
        {t('Error')}: {userError}
      </div>
    )
  }

  if (!user || !setting) {
    return <div>{t('No_user_data_available')}</div>
  }

  return (
    <div className='flex'>
      <main className='flex-1 p-8'>
        <header className='mb-4 flex items-center justify-between'>
          <h2 className='text-xl font-semibold md:text-2xl'>{t('Setting')}</h2>
        </header>

        <section className='mb-8'>
          {/* Option 1: Receive Notifications */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>{t('Receive_Notifications')}</h4>
              <p className=' text-sm'>
                {t('Receive_Notifications_Description')}.
              </p>
            </div>
            <button
              className={`h-6 min-w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                setting.receiveNotifications
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={toggleReceiveNotifications}
              disabled={updateLoading}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.receiveNotifications
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>
          {/* Option 2: Auto add events to schedule */}
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
              className={`h-6 min-w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                setting.autoAddFollowToCalendar
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={toggleAutoAdd}
              disabled={updateLoading}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.autoAddFollowToCalendar
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 3: Change and Update */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>{t('Change_and_Update')}</h4>
              <p className=' text-sm'>{t('Change_and_Update_describe')}</p>
            </div>
            <button
              className={`h-6 min-w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                setting.notificationWhenConferencesChanges
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={toggleChangeUpdate}
              disabled={updateLoading}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.notificationWhenConferencesChanges
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 4: Your upcoming event */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>{t('Your_upcoming_event')}</h4>
              <p className=' text-sm'>{t('Your_upcoming_event_describe')}</p>
            </div>
            <button
              className={`h-6 min-w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                setting.upComingEvent ? 'bg-button' : 'bg-background-secondary'
              }`}
              onClick={toggleUpcomingEvent}
              disabled={updateLoading}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.upComingEvent ? 'translate-x-6' : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 5: Customize notification delivery (Combobox) */}
          <div className='mb-4 items-center justify-between md:flex'>
            <div>
              <h4 className='font-semibold'>
                {t('Customize_notification_delivery')}
              </h4>
              <p className=' text-sm'>
                {t('Customize_notification_delivery_describe')}
              </p>
            </div>
            <select
              className='rounded border border-button bg-background-secondary px-2 py-1 focus:border-2 focus:outline-none'
              value={setting.notificationThrough}
              onChange={handleDeliveryChange}
              disabled={updateLoading}
            >
              <option value='System'>{t('Notification_only')}</option>
              <option value='Email'>{t('NOtification_email')}</option>
              <option value='All'>{t('All')}</option>
            </select>
          </div>

          {/* Option 6: Notification when update profile */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>
                {t('Notification_when_update_profile')}
              </h4>
              <p className=' text-sm'>
                {t('Notification_when_update_profile')}
              </p>
            </div>
            <button
              className={`h-6 min-w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                setting.notificationWhenUpdateProfile
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={toggleNotificationWhenUpdateProfile}
              disabled={updateLoading}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.notificationWhenUpdateProfile
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 7: Notification when follow */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>{t('Notification_when_follow')}</h4>
              <p className=' text-sm'>{t('Notification_when_follow')}</p>
            </div>
            <button
              className={`h-6 min-w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                setting.notificationWhenFollow
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={toggleNotificationWhenFollow}
              disabled={updateLoading}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.notificationWhenFollow
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 8: Notification when add to calendar */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>
                {t('Notification_when_add_to_calendar')}
              </h4>
              <p className=' text-sm'>
                {t('Notification_when_add_to_calendar')}
              </p>
            </div>
            <button
              className={`h-6 min-w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                setting.notificationWhenAddTocalendar
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={toggleNotificationWhenAddToCalendar}
              disabled={updateLoading}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.notificationWhenAddTocalendar
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>

          {/* Option 8: Notification when add to blacklist */}
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h4 className='font-semibold'>
                {t('Notification_when_add_to_blacklist')}
              </h4>
              <p className=' text-sm'>
                {t('Notification_when_add_to_blacklist')}
              </p>
            </div>
            <button
              className={`h-6 min-w-12 rounded-full transition-colors duration-200 focus:outline-none ${
                setting.notificationWhenAddToBlacklist
                  ? 'bg-button'
                  : 'bg-background-secondary'
              }`}
              onClick={toggleNotificationWhenAddToBlacklist}
              disabled={updateLoading}
            >
              <div
                className={`h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                  setting.notificationWhenAddToBlacklist
                    ? 'translate-x-6'
                    : 'translate-x-1'
                }`}
              ></div>
            </button>
          </div>
        </section>

        {/* Delete Account */}
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
        {updateError && <p className='text-red-500'>{updateError}</p>}
      </main>
    </div>
  )
}

export default SettingTab
