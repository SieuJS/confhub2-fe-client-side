// src/app/[locale]/utils/Header.tsx

import { FC, useRef, useState, useEffect } from 'react';
import { Link } from '@/src/navigation';
import GlobeIcon from '../../icons/globe'; // Giả sử bạn đã có icon này, hoặc LogoIcon
import { useSocketConnection } from '../../../hooks/header/useSocketConnection';
import { useClickOutside } from '../../../hooks/header/useClickOutsideHeader';
import { useMenuState } from '../../../hooks/header/useMenuState';
import NotificationDropdown from './header/NotificationDropdown';
import UserDropdown from './header/UserDropdown';
import MobileNavigation from './header/MobileNavigation';
import AuthButtons from './header/AuthButtons';
import DesktopNavigation from './header/DesktopNavigation';
import LoadingIndicator from './header/LoadingIndicator'; // Bạn có thể dùng isInitializing từ useAuth
import { MenuIcon, CloseIcon } from './header/Icon';
import Button from './Button';
import { useAuth } from '@/src/contexts/AuthContext'; // <<<< THAY ĐỔI QUAN TRỌNG
import LogoIcon from '../../icons/logo';

interface Props {
  locale: string;
}

export const Header: FC<Props> = ({ locale }) => {
  const headerRef = useRef<HTMLDivElement>(null);

  // <<<< THAY ĐỔI QUAN TRỌNG: Sử dụng useAuth từ Context
  const { user, isLoggedIn, logout, isInitializing } = useAuth();
  // Bạn không cần state isLoading cục bộ nữa, isInitializing từ useAuth sẽ đảm nhiệm việc này
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   setIsLoading(false); // Không cần nữa
  // }, []);

  const {
    notifications,
    notificationEffect,
    markAllAsRead,
    fetchNotifications,
    isLoadingNotifications,
    socketRef
  } = useSocketConnection({ loginStatus: isLoggedIn ? 'true' : null, user }); // isLoggedIn đã có sẵn

  const {
    isNotificationOpen,
    isMobileMenuOpen,
    isUserDropdownOpen,
    closeAllMenus,
    // toggleMobileMenu, // Sẽ dùng openMobileMenu từ useMenuState
    openNotification,
    openUserDropdown,
    openMobileMenu
  } = useMenuState();

  useClickOutside(headerRef, closeAllMenus, 'notification-dropdown');

  const unreadCount = () => {
    const unread = notifications.filter(
      n => n.seenAt === null && n.deletedAt === null
    ).length;
    return unread > 20 ? '20+' : unread;
  };

  const displayedNotifications = notifications.slice(-20);

  // Nếu isInitializing là true, nghĩa là AuthProvider đang kiểm tra trạng thái đăng nhập ban đầu.
  // Bạn có thể hiển thị một spinner hoặc một phiên bản đơn giản của header.
  if (isInitializing) {
    return (
      <div
        className={`fixed left-0 right-0 top-0 z-40 mx-auto flex h-[60px] max-w-screen-2xl flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 text-sm shadow-md`}
      >
        <Link href='/' locale={locale}>
          <div className='flex flex-row items-center '>
            <div className='mb-2 h-8 w-8'>
              <GlobeIcon />
            </div>
            <strong className='mx-2 hidden select-none md:block'>
              Global Conference Hub
            </strong>
          </div>
        </Link>
        <div className='relative flex flex-row items-center gap-2 md:gap-4'>
          <LoadingIndicator /> {/* Hoặc một spinner/skeleton UI khác */}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={headerRef}
      className={`fixed left-0 right-0 top-0 z-40 mx-auto flex h-[60px] max-w-screen-2xl flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 text-sm shadow-md transition-all duration-300 ease-in-out`}
    >
      <Link href='/' locale={locale}>
        <div className='flex flex-row items-center '>
          <div className='mb-2 h-8 w-8'>
            <LogoIcon />
          </div>
          <strong className='mx-2 hidden select-none md:block'>
            Global Conference Hub
          </strong>
        </div>
      </Link>

      <div className='relative flex flex-row items-center gap-2 md:gap-4'>
        <DesktopNavigation locale={locale} />

        {/* Sử dụng isLoggedIn trực tiếp từ useAuth */}
        <AuthButtons
          isLogin={isLoggedIn}
          locale={locale}
          toggleNotification={() => openNotification()}
          toggleUserDropdown={() => openUserDropdown()}
          notificationEffect={notificationEffect}
          unreadCount={unreadCount()}
        />

        <Button
          className='block lg:hidden'
          onClick={e => {
            e.stopPropagation();
            openMobileMenu(); // Sử dụng hàm đã có từ useMenuState
          }}
        >
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </Button>

        <MobileNavigation
          isMobileMenuOpen={isMobileMenuOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          isLogin={isLoggedIn} // Truyền isLoggedIn từ useAuth
        />
        <NotificationDropdown
          notifications={displayedNotifications}
          isNotificationOpen={isNotificationOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          fetchNotifications={fetchNotifications}
          isLoadingNotifications={isLoadingNotifications}
          markAllAsRead={markAllAsRead}
        />
        <UserDropdown
          isUserDropdownOpen={isUserDropdownOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          logout={logout} // logout từ useAuth
          socketRef={socketRef}
          // user={user} // Truyền user nếu UserDropdown cần thông tin user
        />
      </div>
    </div>
  );
};

// Không cần export default Header ở đây nếu nó được export tên là Header
// export default Header;