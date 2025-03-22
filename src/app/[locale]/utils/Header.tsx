// components/Header/index.tsx (Header Component)
import { FC, useRef, useState, useEffect } from 'react';
import { Link } from '@/src/navigation';
import { useTranslations } from 'next-intl';
import { useLocalStorage } from 'usehooks-ts';
import LogoIcon from '../../icons/logo';
import { useSocketConnection } from '../../../hooks/header/useSocketConnection';
import { useClickOutside } from '../../../hooks/header/useClickOutsideHeader';
import { useMenuState } from '../../../hooks/header/useMenuState';
import NotificationDropdown from './header/NotificationDropdown';
import UserDropdown from './header/UserDropdown';
import MobileNavigation from './header/MobileNavigation';
import AuthButtons from './header/AuthButtons';
import DesktopNavigation from './header/DesktopNavigation';
import { MenuIcon, CloseIcon } from './header/Icon';
import Button from './Button';

interface Props {
  locale: string;
}

export const Header: FC<Props> = ({ locale }) => {
  const t = useTranslations('');
  const headerRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useLocalStorage<{
    id: string;
    firstname: string;
    lastname: string;
    email: string;
  } | null>('user', null);

  const [loginStatus, setLoginStatus] = useLocalStorage<string | null>(
    'loginStatus',
    null
  )

  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    if (loginStatus)
      setIsLogin(true);
  }, []);
  const {
    notifications,
    notificationEffect,
    markAllAsRead,
    fetchNotifications,
    isLoadingNotifications,
    socketRef,
  } = useSocketConnection({ loginStatus, user });

  const {
    isNotificationOpen,
    isMobileMenuOpen,
    isUserDropdownOpen,
    closeAllMenus,
    toggleNotification,
    toggleMobileMenu,
    toggleUserDropdown,
    openNotification,
    openUserDropdown,
  } = useMenuState();

  useClickOutside(headerRef, closeAllMenus, 'notification-dropdown');

  const unreadCount = () => {
    const unread = notifications.filter(
      (n) => n.seenAt === null && n.deletedAt === null
    ).length;
    return unread > 20 ? '20+' : unread; // Display "20+" if more than 20 unread
  };

  const displayedNotifications = notifications.slice(0, 20); // Get the latest 20 notifications


  return (
    <div
      ref={headerRef}
      className={`fixed left-0 right-0 top-0 z-40 mx-auto flex h-[60px] max-w-screen-2xl flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 shadow-md transition-all duration-300 ease-in-out`}
    >
      <Link href='/' locale={locale}>
        <div className='flex flex-row items-center pt-2'>
          <div className='mb-2 h-10 w-10'>
            <LogoIcon />
          </div>
          <strong className='mx-2 select-none'>ConFHub</strong>
        </div>
      </Link>

      <div className='relative flex flex-row items-center gap-4'>
        <DesktopNavigation locale={locale} />
        <AuthButtons
          isLogin={isLogin}
          locale={locale}
          toggleNotification={() => openNotification()} // Use openNotification
          toggleUserDropdown={() => openUserDropdown()} // Use openUserDropdown
          notificationEffect={notificationEffect}
          unreadCount={unreadCount()}
        />

        {/* Mobile Menu Button */}
        <Button className='block sm:hidden' onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </Button>

        <MobileNavigation
          isMobileMenuOpen={isMobileMenuOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          isLogin={isLogin}
        />
        <NotificationDropdown
          notifications={displayedNotifications} // Pass the limited notifications
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
          setLoginStatus={setLoginStatus}
          setUser={setUser}
          socketRef={socketRef}
        />
      </div>
    </div>
  );
};

export default Header;