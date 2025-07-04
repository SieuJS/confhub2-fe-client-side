// src/app/[locale]/dashboard/setting/SettingTab.tsx
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react' // <-- Thêm useMemo
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

// BƯỚC 1: IMPORT COMPONENT SEARCHINPUT MỚI
import SearchInput from '../../utils/SearchInput' // <-- Đảm bảo đường dẫn chính xác

// --- Helper Type ---
type ToggleSettingKey = keyof Pick<
  Setting,
  | 'receiveNotifications'
  // | 'autoAddFollowToCalendar'
  | 'notificationWhenConferencesChanges'
  | 'upComingEvent'
  // | 'notificationWhenUpdateProfile'
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
  <div className='flex items-center justify-between border-b border-gray-100 py-4 last:border-b-0'>
    <div className='flex items-start'>
      <div className='mr-4 rounded-full bg-blue-100 p-2 text-blue-600'>
        <Icon className='h-5 w-5' />
      </div>
      <div>
        <h4 className='font-semibold '>{label}</h4>
        <p className='mt-0.5 text-sm '>{description}</p>
      </div>
    </div>
    <button
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-20'
        } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      role='switch'
      aria-checked={checked}
    >
      <span className='sr-only'>{label}</span>
      <span
        aria-hidden='true'
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white-pure shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
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
  const [initialLoad, setInitialLoad] = useState(true)

  // BƯỚC 2: THÊM STATE CHO TÌM KIẾM
  const [searchTerm, setSearchTerm] = useState('')

  const {
    updateUserSetting,
    loading: updateLoading,
    error: updateError
  } = useUpdateUser()
  const { getUserSettings, error: getSettingError } = useGetUserSetting()

  const fetchUserSettings = useCallback(async () => {
    if (!isLoggedIn) {
      // console.warn('[SettingTab] Skipping fetch: User not logged in.')
      setIsFetchingSettings(false)
      setInitialLoad(false)
      return
    }
    setIsFetchingSettings(true)
    try {
      const userSetting = await getUserSettings()
      if (userSetting) {
        setSetting(userSetting)
      } else {
        // console.error('Failed to get user settings:', getSettingError)
      }
    } catch (err) {
      // console.error('[SettingTab] Critical error fetching user settings:', err)
      if (getSettingError?.includes('403')) {
        logout({ callApi: true, preventRedirect: true })
      }
    } finally {
      setIsFetchingSettings(false)
      setInitialLoad(false)
    }
  }, [isLoggedIn, getUserSettings, getSettingError, logout])

  useEffect(() => {
    if (!isInitializing && isLoggedIn) {
      fetchUserSettings()
    } else if (!isInitializing && !isLoggedIn) {
      setIsFetchingSettings(false)
      setInitialLoad(false)
    }
  }, [isInitializing, isLoggedIn, fetchUserSettings])

  const handleToggle = useCallback(
    async (settingKey: ToggleSettingKey) => {
      if (!setting) {
        // console.error(
        //   'Attempted to toggle setting when setting object is null.'
        // )
        return
      }
      const currentValue = setting[settingKey] ?? false
      setSetting(prev =>
        prev ? { ...prev, [settingKey]: !currentValue } : null
      )
      try {
        await updateUserSetting({ [settingKey]: !currentValue })
        if (updateError) throw new Error(updateError)
      } catch (error: any) {
        setSetting(prev =>
          prev ? { ...prev, [settingKey]: currentValue } : null
        )
        // console.error(`Failed to update setting ${settingKey}:`, error)
        alert(
          `${t('Error_Updating_Setting')}: ${error.message || error.toString()}`
        )
      }
    },
    [setting, updateUserSetting, updateError, t]
  )

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

  // BƯỚC 3: ĐỊNH NGHĨA TẤT CẢ CÁC TÙY CHỌN CÀI ĐẶT CÓ THỂ TÌM KIẾM
  const allSettingItems = useMemo(
    () => [
      // General Settings
      {
        key: 'receiveNotifications',
        label: t('Receive_Notifications'),
        description: t('Receive_Notifications_Description'),
        icon: Bell,
        section: 'general'
      },
      {
        key: 'notificationThroughEmail',
        label: t('Send_notification_through_email'),
        description: t('Send_notification_through_email_describe'),
        icon: Mail,
        section: 'general'
      },
      // Notification Preferences
      {
        key: 'notificationWhenConferencesChanges',
        label: t('Notification_when_conferences_changes'),
        description: t('Change_and_Update_describe'),
        icon: ChevronRight,
        section: 'notifications'
      },
      {
        key: 'upComingEvent',
        label: t('Your_upcoming_event'),
        description: t('Your_upcoming_event_describe'),
        icon: CalendarPlus,
        section: 'notifications'
      },
      {
        key: 'notificationWhenFollow',
        label: t('Notification_when_follow'),
        description: t('Notification_when_follow_description'),
        icon: Bell, // Hoặc một icon khác nếu có
        section: 'notifications'
      },
      {
        key: 'notificationWhenAddTocalendar',
        label: t('Notification_when_add_to_calendar'),
        description: t('Notification_when_add_to_calendar_description'),
        icon: CalendarPlus,
        section: 'notifications'
      },
      {
        key: 'notificationWhenAddToBlacklist',
        label: t('Notification_when_add_to_blacklist'),
        description: t('Notification_when_add_to_blacklist_description'),
        icon: Ban,
        section: 'notifications'
      }
    ],
    [t]
  ) // Dependency t để đảm bảo label và description được cập nhật khi ngôn ngữ thay đổi

  // BƯỚC 4: LỌC CÁC TÙY CHỌN CÀI ĐẶT DỰA TRÊN SEARCH TERM
  const filteredSettingItems = useMemo(() => {
    if (!searchTerm) {
      return allSettingItems
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    return allSettingItems.filter(
      item =>
        item.label.toLowerCase().includes(lowercasedSearchTerm) ||
        item.description.toLowerCase().includes(lowercasedSearchTerm)
    )
  }, [searchTerm, allSettingItems])

  // Nhóm các cài đặt đã lọc theo section
  const groupedFilteredSettings = useMemo(() => {
    return filteredSettingItems.reduce(
      (acc, item) => {
        if (!acc[item.section]) {
          acc[item.section] = []
        }
        acc[item.section].push(item)
        return acc
      },
      {} as Record<string, typeof allSettingItems>
    )
  }, [filteredSettingItems])

  // --- Hàm render loading tương tự như FollowedTab/ProfileTab ---
  const renderLoading = (messageKey: string) => (
    <div className='flex h-80 flex-col items-center justify-center '>
      <Loader2 className='h-10 w-10 animate-spin text-primary' />
      <p className='mt-4 text-lg'>{t(messageKey)}</p>
    </div>
  )

  // --- Render Logic (Thứ tự kiểm tra rất quan trọng!) ---

  if ((isInitializing || isFetchingSettings) && initialLoad) {
    return (
      <div className='flex h-screen items-center justify-center'>
        {renderLoading('Loading_settings')}
      </div>
    )
  }

  if (!isLoggedIn) {
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

  if (isFetchingSettings) {
    return (
      <div className='flex h-screen items-center justify-center'>
        {renderLoading('Loading_settings')}
      </div>
    )
  }

  if (!setting) {
    return (
      <div className='container mx-auto p-4 text-center'>
        <h2 className='mb-2 text-xl font-semibold text-red-600'>
          {t('Could_not_load_user_settings_title')}
        </h2>
        <p className='mb-4 text-red-500'>{t('Could_not_load_user_settings')}</p>
        <Button variant='secondary' onClick={fetchUserSettings}>
          {t('Retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen w-full bg-gray-10'>
      <main className='mx-auto max-w-4xl flex-1 p-4 md:p-8'>
        <header className='mb-8 border-b border-gray-200 pb-4'>
          <h2 className='flex items-center text-3xl font-bold '>
            <Cog className='mr-3 h-8 w-8 ' />
            {t('Setting')}
          </h2>
          <p className='mt-2 '>
            {t('Manage_your_account_preferences_and_notifications')}
          </p>
        </header>

        {/* BƯỚC 5: THÊM SEARCHINPUT */}
        <div className='mb-6'>
          <SearchInput
            initialValue={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder={t('Search_settings') || 'Search settings...'}
          />
        </div>

        {filteredSettingItems.length === 0 && (
          <div className='my-10 rounded-lg bg-white-pure p-10 text-center  shadow-sm'>
            <p className='text-lg'>{t('No_settings_match_your_search')}</p>
            <Button
              variant='link'
              onClick={() => setSearchTerm('')}
              className='mt-2 text-sm text-indigo-600 hover:text-indigo-800'
            >
              {t('View_all_settings')}
            </Button>
          </div>
        )}

        {/* BƯỚC 6: SỬ DỤNG filteredSettingItems để render các phần cài đặt */}
        {groupedFilteredSettings.general &&
          groupedFilteredSettings.general.length > 0 && (
            <section className='mb-8 rounded-lg bg-white-pure p-6 shadow-sm'>
              <h3 className='mb-4 flex items-center text-xl font-semibold '>
                <Cog className='mr-2 h-6 w-6 ' />
                {t('General_Settings')}
              </h3>
              {groupedFilteredSettings.general.map(item => (
                <SettingToggle
                  key={item.key}
                  label={item.label}
                  description={item.description}
                  checked={setting[item.key as ToggleSettingKey] ?? false}
                  onToggle={() => handleToggle(item.key as ToggleSettingKey)}
                  disabled={updateLoading}
                  icon={item.icon}
                />
              ))}
            </section>
          )}

        {groupedFilteredSettings.notifications &&
          groupedFilteredSettings.notifications.length > 0 && (
            <section className='mb-8 rounded-lg bg-white-pure p-6 shadow-sm'>
              <h3 className='mb-4 flex items-center text-xl font-semibold '>
                <Bell className='mr-2 h-6 w-6 ' />
                {t('Notification_Preferences')}
              </h3>
              {groupedFilteredSettings.notifications.map(item => (
                <SettingToggle
                  key={item.key}
                  label={item.label}
                  description={item.description}
                  checked={setting[item.key as ToggleSettingKey] ?? false}
                  onToggle={() => handleToggle(item.key as ToggleSettingKey)}
                  disabled={updateLoading}
                  icon={item.icon}
                />
              ))}
            </section>
          )}
        {updateLoading && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20'>
            <div className='flex items-center rounded-lg bg-white-pure p-4 shadow-lg'>
              <Loader2 className='mr-2 h-6 w-6 animate-spin text-blue-500' />
              <p className='text-gray-70'>{t('Saving_changes')}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default SettingTab
