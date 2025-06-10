// src/app/[locale]/dashboard/setting/SettingTab.tsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Button from '../../utils/Button'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import {
  useGetUserSetting,
  useUpdateUser
} from '../../../../hooks/dashboard/setting/useUpdateSettings'
import { Setting } from '@/src/models/response/user.response'
import { useAuth } from '@/src/contexts/AuthContext'
import {
  Bell,
  CalendarCheck,
  Mail,
  UserX,
  Cog,
  ChevronRight,
  UserCheck,
  CalendarPlus,
  Ban,
  Loader2
} from 'lucide-react'

// --- Helper Type ---
type ToggleSettingKey = keyof Pick<
  Setting,
  | 'receiveNotifications'
  | 'autoAddFollowToCalendar'
  | 'notificationWhenConferencesChanges'
  | 'upComingEvent'
  | 'notificationWhenUpdateProfile'
  | 'notificationWhenFollow'
  | 'notificationWhenAddTocalendar'
  | 'notificationWhenAddToBlacklist'
  | 'notificationThroughEmail'
>

// --- Reusable Toggle Component ---
interface SettingToggleProps {
  label: string
  description: string
  checked: boolean
  onToggle: () => void
  disabled: boolean
  icon: React.ElementType
}

const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  description,
  checked,
  onToggle,
  disabled,
  icon: Icon
}) => (
  <div className='flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0'>
    <div className='flex items-start'>
      <div className='p-2 rounded-full bg-blue-100 text-blue-600 mr-4'>
        <Icon className='h-5 w-5' />
      </div>
      <div>
        <h4 className='font-semibold text-gray-800'>{label}</h4>
        <p className='text-sm text-gray-500 mt-0.5'>{description}</p>
      </div>
    </div>
    <button
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      role='switch'
      aria-checked={checked}
    >
      <span className='sr-only'>{label}</span>
      <span
        aria-hidden='true'
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
)

// --- Main SettingTab Component ---
const SettingTab: React.FC = () => {
  const t = useTranslations('')
  const { isLoggedIn, isInitializing, logout, deleteAccount } = useAuth()

  const [setting, setSetting] = useState<Setting | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isFetchingSettings, setIsFetchingSettings] = useState(true)

  const {
    updateUserSetting,
    loading: updateLoading,
    error: updateError
  } = useUpdateUser()
  const { getUserSettings, error: getSettingError } = useGetUserSetting()

  const fetchUserSettings = useCallback(async () => {
    if (!isLoggedIn) {
      console.warn('[SettingTab] Skipping fetch: User not logged in.')
      return
    }
    setIsFetchingSettings(true)
    try {
      const userSetting = await getUserSettings()
      if (userSetting) {
        setSetting(userSetting)
      } else {
        console.error('Failed to get user settings:', getSettingError)
      }
    } catch (err) {
      console.error('[SettingTab] Critical error fetching user settings:', err)
      if (getSettingError?.includes('403')) {
        logout({ callApi: true, preventRedirect: true })
      }
    } finally {
      setIsFetchingSettings(false)
    }
  }, [isLoggedIn, getUserSettings, getSettingError, logout])

  useEffect(() => {
    if (!isInitializing && isLoggedIn) {
      fetchUserSettings()
    } else if (!isInitializing && !isLoggedIn) {
        setIsFetchingSettings(false)
    }
  }, [isInitializing, isLoggedIn, fetchUserSettings])

  const handleToggle = useCallback(async (settingKey: ToggleSettingKey) => {
    if (setting) {
      const currentValue = setting[settingKey] ?? false
      setSetting(prev => (prev ? { ...prev, [settingKey]: !currentValue } : null))
      try {
        await updateUserSetting({ [settingKey]: !currentValue })
        if (updateError) throw new Error(updateError)
      } catch (error: any) {
        setSetting(prev => (prev ? { ...prev, [settingKey]: currentValue } : null))
        console.error(`Failed to update setting ${settingKey}:`, error)
        alert(`${t('Error_Updating_Setting')}: ${error.message || error.toString()}`)
      }
    }
  }, [setting, updateUserSetting, updateError, t])

  const handleDeleteAccount = async () => {
    if (window.confirm(t('Delete_Account_Confirmation'))) {
      setIsDeleting(true)
      setDeleteError(null)
      const result = await deleteAccount()
      if (!result.success) {
        setDeleteError(result.error || t('Error_DeleteAccountFailed'))
      }
      setIsDeleting(false)
    }
  }

  // --- Render Logic ---
  if (isInitializing) {
    return (
      <div className='flex items-center justify-center h-64 text-gray-500'>
        <Loader2 className='animate-spin h-8 w-8 mr-2' />
        <span>{t('Initializing_session')}</span>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className='container mx-auto p-4 text-center'>
        <p className='mb-4'>{t('Please_log_in_to_view_settings')}</p>
        <Link href='/auth/login'>
          <Button variant='primary'>{t('Sign_In')}</Button>
        </Link>
      </div>
    )
  }

  if (isFetchingSettings) {
    return (
      <div className='flex items-center justify-center h-64 text-gray-500'>
        <Loader2 className='animate-spin h-8 w-8 mr-2' />
        <span>{t('Loading_settings')}</span>
      </div>
    )
  }

  if (!setting) {
    return (
      <div className='container mx-auto p-4 text-center'>
        <p className='mb-4 text-red-500'>
          {t('Could_not_load_user_settings')}
        </p>
        <Button variant='secondary' onClick={fetchUserSettings}>
          {t('Retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className='flex w-full min-h-screen bg-gray-10'>
      <main className='flex-1 p-4 md:p-8 max-w-4xl mx-auto'>
        <header className='mb-8 pb-4 border-b border-gray-200'>
          <h2 className='text-3xl font-bold text-gray-900 flex items-center'>
            <Cog className='h-8 w-8 mr-3 text-gray-600' />
            {t('Setting')}
          </h2>
          <p className='text-gray-600 mt-2'>{t('Manage_your_account_preferences_and_notifications')}</p>
        </header>

        {/* General Settings Section */}
        <section className='mb-8 p-6 bg-white rounded-lg shadow-sm'>
          <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
            <Cog className='h-6 w-6 mr-2 text-gray-500' />
            {t('General_Settings')}
          </h3>
          <SettingToggle
            label={t('Receive_Notifications')}
            description={t('Receive_Notifications_Description')}
            checked={setting.receiveNotifications ?? false}
            onToggle={() => handleToggle('receiveNotifications')}
            disabled={updateLoading}
            icon={Bell}
          />
          <SettingToggle
            label={t('Auto_add_events_to_schedule')}
            description={t('Auto_add_events_to_schedule_describe')}
            checked={setting.autoAddFollowToCalendar ?? false}
            onToggle={() => handleToggle('autoAddFollowToCalendar')}
            disabled={updateLoading}
            icon={CalendarCheck}
          />
          <SettingToggle
            label={t('Send_notification_through_email')}
            description={t('Send_notification_through_email_describe')}
            checked={setting.notificationThroughEmail ?? false}
            onToggle={() => handleToggle('notificationThroughEmail')}
            disabled={updateLoading}
            icon={Mail}
          />
        </section>

        {/* Notification Preferences Section */}
        <section className='mb-8 p-6 bg-white rounded-lg shadow-sm'>
          <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
            <Bell className='h-6 w-6 mr-2 text-gray-500' />
            {t('Notification_Preferences')}
          </h3>
          <SettingToggle
            label={t('Notification_when_conferences_changes')}
            description={t('Change_and_Update_describe')}
            checked={setting.notificationWhenConferencesChanges ?? false}
            onToggle={() => handleToggle('notificationWhenConferencesChanges')}
            disabled={updateLoading}
            icon={ChevronRight}
          />
          <SettingToggle
            label={t('Your_upcoming_event')}
            description={t('Your_upcoming_event_describe')}
            checked={setting.upComingEvent ?? false}
            onToggle={() => handleToggle('upComingEvent')}
            disabled={updateLoading}
            icon={CalendarPlus}
          />
          <SettingToggle
            label={t('Notification_when_update_profile')}
            description={t('Notification_when_update_profile_description')}
            checked={setting.notificationWhenUpdateProfile ?? false}
            onToggle={() => handleToggle('notificationWhenUpdateProfile')}
            disabled={updateLoading}
            icon={UserCheck}
          />
          <SettingToggle
            label={t('Notification_when_follow')}
            description={t('Notification_when_follow_description')}
            checked={setting.notificationWhenFollow ?? false}
            onToggle={() => handleToggle('notificationWhenFollow')}
            disabled={updateLoading}
            icon={Bell}
          />
          <SettingToggle
            label={t('Notification_when_add_to_calendar')}
            description={t('Notification_when_add_to_calendar_description')}
            checked={setting.notificationWhenAddTocalendar ?? false}
            onToggle={() => handleToggle('notificationWhenAddTocalendar')}
            disabled={updateLoading}
            icon={CalendarPlus}
          />
          <SettingToggle
            label={t('Notification_when_add_to_blacklist')}
            description={t('Notification_when_add_to_blacklist_description')}
            checked={setting.notificationWhenAddToBlacklist ?? false}
            onToggle={() => handleToggle('notificationWhenAddToBlacklist')}
            disabled={updateLoading}
            icon={Ban}
          />
        </section>

        {/* Account Management Section */}
        <section className='mb-8 p-6 bg-white rounded-lg shadow-sm'>
          <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
            <UserX className='h-6 w-6 mr-2 text-gray-500' />
            {t('Account_Management')}
          </h3>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between py-4'>
            <div>
              <h4 className='font-semibold text-red-700'>{t('Delete_Account')}</h4>
              <p className='text-sm text-red-500 mt-0.5'>
                {t('Delete_Account_describe')}
              </p>
            </div>
            <button
              data-testid='delete-account-button'
              onClick={handleDeleteAccount}
              disabled={isDeleting || updateLoading}
              className={`mt-4 sm:mt-0 flex items-center justify-center px-6 py-2 rounded-md font-semibold text-white transition-colors duration-200 
                ${isDeleting || updateLoading
                  ? 'cursor-not-allowed bg-red-400'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2
              `}
            >
              {isDeleting ? (
                <>
                  <Loader2 className='animate-spin h-5 w-5 mr-2' />
                  {t('Deleting')}
                </>
              ) : (
                <>
                  <UserX className='h-5 w-5 mr-2' />
                  {t('Delete_Account')}
                </>
              )}
            </button>
          </div>
          {deleteError && (
            <p data-testid='delete-error' className='mt-2 text-sm text-red-500'>
              {deleteError}
            </p>
          )}
        </section>

        {updateLoading && (
          <div className='fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50'>
            <div className='bg-white p-4 rounded-lg shadow-lg flex items-center'>
              <Loader2 className='animate-spin h-6 w-6 mr-2 text-blue-500' />
              <p className='text-gray-700'>{t('Saving_changes')}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default SettingTab