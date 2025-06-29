// src/app/[locale]/utils/header/AuthButtons.tsx

import { FC } from 'react'
import { Link } from '@/src/navigation'
import { useTranslations } from 'next-intl'
import { NotificationIcon, UserIcon } from './Icon'
import { usePathname } from 'next/navigation'

// --- ĐIỀU CHỈNH INTERFACE PROPS Ở ĐÂY ---
interface Props {
  isLogin: boolean;
  locale: string;
  // Thêm dấu '?' để biến các props này thành tùy chọn (optional)
  toggleNotification?: () => void;
  toggleUserDropdown?: () => void;
  notificationEffect?: boolean;
  unreadCount?: number | string;
}

const AuthButtons: FC<Props> = ({
  isLogin,
  locale,
  toggleNotification,
  toggleUserDropdown,
  notificationEffect,
  unreadCount
}) => {
  const t = useTranslations('');
  const pathname = usePathname();

  // Render UI cho trạng thái đã đăng nhập
  if (isLogin) {
    // Thêm kiểm tra để đảm bảo các hàm tồn tại trước khi gọi
    // Điều này giúp code an toàn hơn về mặt logic
    if (!toggleNotification || !toggleUserDropdown) {
      // Có thể trả về một skeleton hoặc null nếu các hàm chưa sẵn sàng
      // để tránh lỗi runtime
      return null;
    }

    return (
      <>
        <button className='mr-4' onClick={toggleNotification}>
          <NotificationIcon
            // Cung cấp giá trị mặc định nếu props là undefined
            notificationEffect={notificationEffect || false}
            unreadCount={unreadCount || 0}
          />
        </button>
        <button onClick={toggleUserDropdown}>
          <UserIcon />
        </button>
      </>
    );
  }


  // Render UI cho trạng thái chưa đăng nhập
  return (
    <>
      <div className='flex  font-bold'>
        {/* <ThemeSwitch /> */}
        {/* <LangSwitcher /> */}
      </div>
      <Link
        lang={locale}
        href={`/auth/login`}
        className={`group relative inline-flex items-center rounded-md bg-button px-2 py-2 text-sm font-semibold text-button-text shadow-md transition-colors duration-200 hover:opacity-90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-button ${pathname.includes('/auth/login') ? 'bg-blue-600' : ''
          }`}
      >
        <div className='flex items-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='20'
            height='20'
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
