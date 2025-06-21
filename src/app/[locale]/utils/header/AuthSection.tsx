// src/app/[locale]/utils/header/AuthSection.tsx (TẠO FILE MỚI)

'use client';

import { FC, useRef } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { useMenuState } from '@/src/hooks/header/useMenuState';
import { useClickOutside } from '@/src/hooks/header/useClickOutsideHeader';

import AuthButtons from './AuthButtons';
import NotificationDropdown from './NotificationDropdown';
import UserDropdown from './UserDropdown';

// Component Skeleton chỉ cho phần Auth
const AuthSectionSkeleton: FC = () => (
  <div className="flex items-center gap-2 md:gap-4">
    <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
    <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700"></div>
  </div>
);

interface AuthSectionProps {
  locale: string;
}

const AuthSection: FC<AuthSectionProps> = ({ locale }) => {
  const authSectionRef = useRef<HTMLDivElement>(null);

  // Lấy state từ các context
  const { isLoggedIn, isInitializing, logout } = useAuth();
  const { unreadCount, notificationEffect, socketRef } = useNotifications();

  // Quản lý state dropdown
  const {
    isNotificationOpen,
    isUserDropdownOpen,
    closeAllMenus,
    openNotification,
    openUserDropdown,
  } = useMenuState();

  useClickOutside(authSectionRef, closeAllMenus, 'notification-dropdown');

  // CHỈ HIỂN THỊ SKELETON CHO PHẦN NÀY
  if (isInitializing) {
    return <AuthSectionSkeleton />;
  }

  return (
    <div ref={authSectionRef} className="contents">
      <AuthButtons
        isLogin={isLoggedIn}
        locale={locale}
        toggleNotification={openNotification}
        toggleUserDropdown={openUserDropdown}
        notificationEffect={notificationEffect}
        unreadCount={unreadCount}
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
  );
};

export default AuthSection;