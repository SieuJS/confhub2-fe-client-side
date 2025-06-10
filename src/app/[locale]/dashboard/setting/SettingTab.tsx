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
import SearchInput from '../../utils/SearchInput'; // <-- Đảm bảo đường dẫn chính xác

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
  const [initialLoad, setInitialLoad] = useState(true);

  // BƯỚC 2: THÊM STATE CHO TÌM KIẾM
  const [searchTerm, setSearchTerm] = useState('');

  const {
    updateUserSetting,
    loading: updateLoading,
    error: updateError
  } = useUpdateUser()
  const { getUserSettings, error: getSettingError } = useGetUserSetting()

  const fetchUserSettings = useCallback(async () => {
    if (!isLoggedIn) {
      console.warn('[SettingTab] Skipping fetch: User not logged in.')
      setIsFetchingSettings(false)
      setInitialLoad(false);
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
      setInitialLoad(false);
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

  const handleToggle = useCallback(async (settingKey: ToggleSettingKey) => {
    if (!setting) {
      console.error("Attempted to toggle setting when setting object is null.");
      return;
    }
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

  // BƯỚC 3: ĐỊNH NGHĨA TẤT CẢ CÁC TÙY CHỌN CÀI ĐẶT CÓ THỂ TÌM KIẾM
  const allSettingItems = useMemo(() => [
    // General Settings
    {
      key: 'receiveNotifications',
      label: t('Receive_Notifications'),
      description: t('Receive_Notifications_Description'),
      icon: Bell,
      section: 'general'
    },
    {
      key: 'autoAddFollowToCalendar',
      label: t('Auto_add_events_to_schedule'),
      description: t('Auto_add_events_to_schedule_describe'),
      icon: CalendarCheck,
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
      key: 'notificationWhenUpdateProfile',
      label: t('Notification_when_update_profile'),
      description: t('Notification_when_update_profile_description'),
      icon: UserCheck,
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
    },
  ], [t]); // Dependency t để đảm bảo label và description được cập nhật khi ngôn ngữ thay đổi

  // BƯỚC 4: LỌC CÁC TÙY CHỌN CÀI ĐẶT DỰA TRÊN SEARCH TERM
  const filteredSettingItems = useMemo(() => {
    if (!searchTerm) {
      return allSettingItems;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return allSettingItems.filter(item =>
      item.label.toLowerCase().includes(lowercasedSearchTerm) ||
      item.description.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [searchTerm, allSettingItems]);

  // Nhóm các cài đặt đã lọc theo section
  const groupedFilteredSettings = useMemo(() => {
    return filteredSettingItems.reduce((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = [];
      }
      acc[item.section].push(item);
      return acc;
    }, {} as Record<string, typeof allSettingItems>);
  }, [filteredSettingItems]);


  // --- Hàm render loading tương tự như FollowedTab/ProfileTab ---
  const renderLoading = (messageKey: string) => (
    <div className='flex flex-col items-center justify-center h-80 text-gray-500'>
      <Loader2 className='w-10 h-10 animate-spin text-primary' />
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
        <h2 className='text-xl font-semibold mb-2'>{t('MyConferences.Login_Required_Title')}</h2>
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
        <h2 className='text-xl font-semibold mb-2 text-red-600'>{t('Could_not_load_user_settings_title')}</h2>
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

        {/* BƯỚC 5: THÊM SEARCHINPUT */}
        <div className='mb-6'>
          <SearchInput
            initialValue={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder={t('Search_settings') || 'Search settings...'}
          />
        </div>

        {filteredSettingItems.length === 0 && (
          <div className="my-10 text-center text-gray-500 bg-white p-10 rounded-lg shadow-sm">
            <p className="text-lg">{t('No_settings_match_your_search')}</p>
            <Button
              variant="link"
              onClick={() => setSearchTerm('')}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
            >
              {t('View_all_settings')}
            </Button>
          </div>
        )}

        {/* BƯỚC 6: SỬ DỤNG filteredSettingItems để render các phần cài đặt */}
        {groupedFilteredSettings.general && groupedFilteredSettings.general.length > 0 && (
          <section className='mb-8 p-6 bg-white rounded-lg shadow-sm'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
              <Cog className='h-6 w-6 mr-2 text-gray-500' />
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

        {groupedFilteredSettings.notifications && groupedFilteredSettings.notifications.length > 0 && (
          <section className='mb-8 p-6 bg-white rounded-lg shadow-sm'>
            <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
              <Bell className='h-6 w-6 mr-2 text-gray-500' />
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

        {/* Account Management Section (Không bị ảnh hưởng bởi tìm kiếm) */}
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