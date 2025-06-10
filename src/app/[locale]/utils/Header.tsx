// src/app/[locale]/utils/Header.tsx
import { FC, useRef, useState, useEffect } from 'react';
import { Link } from '@/src/navigation';
import GlobeIcon from '../../icons/globe';
import { useSocketConnection } from '../../../hooks/header/useSocketConnection';
import { useClickOutside } from '../../../hooks/header/useClickOutsideHeader';
import { useMenuState } from '../../../hooks/header/useMenuState';
import NotificationDropdown from './header/NotificationDropdown';
import UserDropdown from './header/UserDropdown';
import MobileNavigation from './header/MobileNavigation';
import AuthButtons from './header/AuthButtons';
import DesktopNavigation from './header/DesktopNavigation';
import LoadingIndicator from './header/LoadingIndicator';
import { MenuIcon, CloseIcon } from './header/Icon';
import Button from './Button';
import { useAuth } from '@/src/contexts/AuthContext';
import LogoIcon from '../../icons/logo';
import { FaBars, FaTimes } from 'react-icons/fa'; // Sử dụng react-icons cho nút toggle

// --- BỔ SUNG PROPS MỚI ---
interface HeaderProps {
  locale: string;
  // Props tùy chọn cho layout có sidebar
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  headerHeight?: number;
  sidebarWidth?: number;
}

export const Header: FC<HeaderProps> = ({
  locale,
  toggleSidebar,
  isSidebarOpen,
  headerHeight = 60, // Giá trị mặc định
  sidebarWidth = 0,   // Giá trị mặc định
}) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn, logout, isInitializing } = useAuth();

  const {
    notifications,
    notificationEffect,
    markAllAsRead,
    fetchNotifications,
    isLoadingNotifications,
    socketRef
  } = useSocketConnection({ loginStatus: isLoggedIn ? 'true' : null, user });

  const {
    isNotificationOpen,
    isMobileMenuOpen,
    isUserDropdownOpen,
    closeAllMenus,
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

  const displayedNotifications = notifications.slice(0, 20);

  // --- LOGIC STYLE ĐỘNG CHO HEADER ---
  const headerStyles: React.CSSProperties = {
    height: `${headerHeight}px`,
    // Nếu có sidebar, header sẽ bị đẩy sang phải
    left: toggleSidebar && isSidebarOpen ? `${sidebarWidth}px` : '0px',
    // Chiều rộng của header sẽ co lại khi sidebar mở
    width: toggleSidebar && isSidebarOpen ? `calc(100% - ${sidebarWidth}px)` : '100%',
    transition: 'left 300ms ease-in-out, width 300ms ease-in-out',
  };

  if (isInitializing) {
    return (
      <div
        className={`fixed right-0 top-0 z-40 mx-auto flex flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 text-sm shadow-md`}
        style={{ height: `${headerHeight}px`, left: '0px', width: '100%' }}
      >
        <div className='flex flex-row items-center'>
          {/* Nút Toggle Sidebar (hiển thị ở trạng thái loading) */}
          {toggleSidebar && (
            <button onClick={toggleSidebar} className="mr-4 p-2 text-foreground hover:text-primary">
              <FaBars className="h-5 w-5" />
            </button>
          )}
          <Link href='/' locale={locale}>
            <div className='flex flex-row items-center'>
              <div className='mb-2 h-8 w-8'><GlobeIcon /></div>
              <strong className='mx-2 hidden select-none md:block'>Global Conference Hub</strong>
            </div>
          </Link>
        </div>
        <div className='relative flex flex-row items-center gap-2 md:gap-4'>
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={headerRef}
      className={`fixed top-0 z-40 flex flex-row items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 text-sm shadow-md`}
      style={headerStyles} // Áp dụng style động
    >
      <div className="flex items-center">
        {/* --- NÚT TOGGLE SIDEBAR --- */}
        {/* Chỉ hiển thị nút này nếu hàm toggleSidebar được truyền vào */}
        {toggleSidebar && (
          <button onClick={toggleSidebar} className="mr-4 p-2 text-foreground hover:text-primary">
            {/* Thay đổi icon dựa trên trạng thái sidebar */}
            {isSidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>
        )}

        <Link href='/' locale={locale}>
          <div className='flex flex-row items-center'>
            <div className='mb-2 h-8 w-8'><LogoIcon /></div>
            <strong className='mx-2 hidden select-none md:block'>Global Conference Hub</strong>
          </div>
        </Link>
      </div>

      <div className='relative flex flex-row items-center gap-2 md:gap-4'>
        <DesktopNavigation locale={locale} />

        <AuthButtons
          isLogin={isLoggedIn}
          locale={locale}
          toggleNotification={() => openNotification()}
          toggleUserDropdown={() => openUserDropdown()}
          notificationEffect={notificationEffect}
          unreadCount={unreadCount()}
        />

        {/* Nút menu mobile có thể được ẩn đi nếu nút toggle sidebar đã tồn tại */}
        {/* Hoặc bạn có thể giữ cả hai và xử lý logic hiển thị riêng */}
        {!toggleSidebar && (
          <Button
            className='block lg:hidden'
            onClick={e => {
              e.stopPropagation();
              openMobileMenu();
            }}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </Button>
        )}

        <MobileNavigation
          isMobileMenuOpen={isMobileMenuOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          isLogin={isLoggedIn}
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
          logout={logout}
          socketRef={socketRef}
        />
      </div>
    </div>
  );
};