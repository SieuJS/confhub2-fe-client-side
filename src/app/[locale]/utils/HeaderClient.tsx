// src/components/layout/HeaderClient.tsx (ĐÃ CHỈNH SỬA THEO GIẢI PHÁP TỐI ƯU)

'use client';

import { FC, useRef } from 'react';
import { Link } from '@/src/navigation';
import { useClickOutside } from '@/src/hooks/header/useClickOutsideHeader';
import { useMenuState } from '@/src/hooks/header/useMenuState';
import NotificationDropdown from './header/NotificationDropdown';
import UserDropdown from './header/UserDropdown';
import MobileNavigation from './header/MobileNavigation';
import AuthButtons from './header/AuthButtons';
import DesktopNavigation from './header/DesktopNavigation';
import { MenuIcon, CloseIcon } from './header/Icon';
import Button from '../utils/Button';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import LogoIcon from '../../icons/logo';
import { FaBars, FaTimes } from 'react-icons/fa';
import { usePathname } from '@/src/navigation';
import { useSidebar } from '@/src/contexts/SidebarContext';
import { WhatsNewButton } from '../home/whatnews/WhatsNewButton';

// [BẮT ĐẦU THAY ĐỔI]
// Skeleton mới, mô phỏng trạng thái rộng nhất (chưa đăng nhập) để đảm bảo độ rộng không đổi.
const AuthSectionSkeleton: FC = () => (
  <div className="flex w-full items-center justify-end gap-2">
    <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
    <div className="h-9 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700"></div>
  </div>
);
// [KẾT THÚC THAY ĐỔI]

// --- Props Interface ---
interface HeaderClientProps {
  locale: string;
}

// --- Component HeaderClient ---
const HeaderClient: FC<HeaderClientProps> = ({ locale }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { isLoggedIn, logout, isInitializing } = useAuth();
  const { notifications, notificationEffect, unreadCount, socketRef } = useNotifications();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

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

  const showSidebarToggle = pathname.startsWith('/dashboard');

  return (
    <header
      ref={headerRef}
      className="fixed top-0 z-40 flex h-[60px] w-full items-center justify-between bg-gradient-to-r from-background to-background-secondary p-3 text-sm shadow-md"
    >
      <div className="flex items-center">
        {showSidebarToggle && (
          <button onClick={toggleSidebar} className="mr-4 p-2 text-foreground hover:text-primary">
            {isSidebarOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>
        )}
        <Link href='/' locale={locale} className='flex items-center'>
          <div className='h-14 w-14'><LogoIcon /></div>
          <strong className='mx-2 hidden select-none md:block'>Global Conference & Journal Hub</strong>
        </Link>
      </div>

      <div className='relative flex flex-row items-center gap-2 md:gap-4'>
        <DesktopNavigation locale={locale} />

        {/* [BẮT ĐẦU THAY ĐỔI] */}
        {/* Thêm nút "What's New" ở đây, bên trong flex container */}
        <WhatsNewButton />
        {/* [KẾT THÚC THAY ĐỔI] */}


        {/* [BẮT ĐẦU THAY ĐỔI] */}
        {/* 
          Giải pháp: Tạo một khung chứa cố định cho toàn bộ khu vực xác thực.
          - `w-44` (11rem): Độ rộng cố định, đủ lớn để chứa 2 button "Đăng nhập" & "Đăng ký". 
            Bạn có thể cần điều chỉnh giá trị này cho phù hợp với độ dài chữ của bạn.
          - `flex justify-end`: Đảm bảo nội dung bên trong (dù là 2 icon hay 2 button) luôn được căn về bên phải của khung.
          Kết quả: Khung này sẽ không bao giờ thay đổi kích thước, do đó không "đẩy" navigation bên trái, loại bỏ hoàn toàn hiện tượng giật.
        */}
        <div className="flex w-24 justify-end">
          {isInitializing ? (
            <AuthSectionSkeleton />
          ) : isLoggedIn ? (
            <AuthButtons
              isLogin={true}
              locale={locale}
              toggleNotification={() => openNotification()}
              toggleUserDropdown={() => openUserDropdown()}
              notificationEffect={notificationEffect}
              unreadCount={unreadCount}
            />
          ) : (
            <AuthButtons isLogin={false} locale={locale} />
          )}
        </div>
        {/* [KẾT THÚC THAY ĐỔI] */}

        <Button
          className='block lg:hidden'
          onClick={e => { e.stopPropagation(); openMobileMenu(); }}
        >
          {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </Button>

        <MobileNavigation
          isMobileMenuOpen={isMobileMenuOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          isLogin={isLoggedIn}
        />
        <NotificationDropdown
          isNotificationOpen={isNotificationOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
        />
        <UserDropdown
          isUserDropdownOpen={isUserDropdownOpen}
          closeAllMenus={closeAllMenus}
          locale={locale}
          logout={logout}
          socketRef={socketRef}
        />
      </div>
    </header>
  );
};

export default HeaderClient;