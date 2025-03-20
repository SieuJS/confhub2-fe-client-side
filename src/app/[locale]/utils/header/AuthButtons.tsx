// components/Header/components/AuthButtons.tsx
import { FC, useState, useEffect } from 'react'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import ThemeSwitch from '../ThemeSwitch'
import LangSwitcher from '../LangSwitcher'
import { NotificationIcon, UserIcon } from './Icon'
import { usePathname } from 'next/navigation'
import LoadingIndicator from './LoadingIndicator'

interface Props {
  isLogin: boolean
  // isClient: boolean; // Loại bỏ prop isClient
  locale: string
  toggleNotification: () => void
  toggleUserDropdown: () => void
  notificationEffect: boolean
}

const AuthButtons: FC<Props> = ({
  isLogin,
  // isClient, // Loại bỏ isClient
  locale,
  toggleNotification,
  toggleUserDropdown,
  notificationEffect
}) => {
  const t = useTranslations('')
  const pathname = usePathname()
  const [isClientRendered, setIsClientRendered] = useState(false) // Thêm state mới

  useEffect(() => {
    setIsClientRendered(true) // Cập nhật state sau khi component mount
  }, [])

  if (!isClientRendered) {
    // Sử dụng state mới
    return <LoadingIndicator />
  }

  if (isLogin) {
    return (
      <>
        <button className='' onClick={toggleNotification}>
          <NotificationIcon notificationEffect={notificationEffect} />
        </button>
        <button onClick={toggleUserDropdown}>
          <UserIcon />
        </button>
      </>
    )
  }

  return (
    <>
      <div className='flex pt-1 font-bold'>
        <ThemeSwitch />
        <LangSwitcher />
      </div>
      <Link
        lang={locale}
        href={`/auth/login`}
        className={`group relative inline-flex items-center rounded-md bg-button px-4 py-2 font-semibold text-button-text shadow-md transition-colors duration-200 hover:opacity-90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-button ${
          pathname.includes('/auth/login') ? 'bg-blue-600' : ''
        }`}
      >
        <div className='flex items-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='#ffffff'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='lucide lucide-log-in mr-2'
          >
            <path d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' />
            <polyline points='10 17 15 12 10 7' />
            <line x1='15' x2='3' y1='12' y2='12' />
          </svg>
          {t('Login')}
        </div>
      </Link>
    </>
  )
}

export default AuthButtons
