// src/app/[locale]/dashboard/ClientDashboardSidebar.tsx (CHỈNH SỬA)

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';

// Import React Icons
import {
  FaUser,
  FaStar,
  FaBook,
  FaRegStickyNote,
  FaBell,
  FaBan,
  FaCog,
} from 'react-icons/fa';

interface MenuItem {
  label: string;
  icon: JSX.Element;
  tabValue: string;
}

interface ClientDashboardSidebarProps {
  isSidebarOpen: boolean;
  locale: string;
  sidebarWidth: number;
  headerHeight: number;
}

export default function ClientDashboardSidebar({
  isSidebarOpen,
  locale,
  sidebarWidth,
  headerHeight,
}: ClientDashboardSidebarProps) {
  const t = useTranslations('');
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const menuItems: MenuItem[] = [
    // ... (giữ nguyên mảng menuItems)
    {
      label: t('Profile'),
      icon: <FaUser className="h-5 w-5" />,
      tabValue: 'profile',
    },
    {
      label: t('Followed'),
      icon: <FaStar className="h-5 w-5" />,
      tabValue: 'followed',
    },
    {
      label: t('My_Conferences'),
      icon: <FaBook className="h-5 w-5" />,
      tabValue: 'myconferences',
    },
    {
      label: t('Note'),
      icon: <FaRegStickyNote className="h-5 w-5" />,
      tabValue: 'note',
    },
    {
      label: t('Notifications'),
      icon: <FaBell className="h-5 w-5" />,
      tabValue: 'notifications',
    },
    {
      label: t('Blacklisted'),
      icon: <FaBan className="h-5 w-5" />,
      tabValue: 'blacklisted',
    },
    {
      label: t('Setting'),
      icon: <FaCog className="h-5 w-5" />,
      tabValue: 'setting',
    },
  ];

  // THAY ĐỔI: Loại bỏ class `md:translate-x-0`
  const sidebarClasses = `
    fixed left-0 top-0
    h-screen
    overflow-y-auto
    transition-transform duration-300 ease-in-out // Đổi lại duration và ease để đồng bộ với content
    bg-background
    shadow-md
    z-30
    w-[${sidebarWidth}px]
    ${isSidebarOpen ? 'translate-x-0' : `-translate-x-full`}
  `;
  // GIẢI THÍCH:
  // Bằng cách loại bỏ `md:translate-x-0`, chúng ta cho phép logic
  // `${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
  // hoạt động trên MỌI KÍCH THƯỚC MÀN HÌNH.
  // Giờ đây, trạng thái đóng/mở của sidebar hoàn toàn phụ thuộc vào `isSidebarOpen`.

  // ... (phần còn lại của component giữ nguyên)
  const contentStyles = {
    opacity: isSidebarOpen ? 1 : 0,
    pointerEvents: isSidebarOpen ? 'auto' : 'none',
    visibility: isSidebarOpen ? 'visible' : 'hidden',
    transition: 'opacity 0.2s ease-out, visibility 0.2s ease-out',
  };

  return (
    <aside
      className={sidebarClasses}
      style={{ top: `${headerHeight}px` }}
    >
      <nav className='h-full overflow-y-auto'>
        <ul className='w-full'>
          {menuItems.map(item => {
            const isActive = activeTab === item.tabValue;

            return (
              <li className='w-full' key={item.tabValue}>
                <Link
                  href={{
                    pathname: '/dashboard',
                    query: { tab: item.tabValue },
                  }}
                  locale={locale}
                  className={`
                    flex h-12 w-full items-center px-4
                    transition-all duration-200 ease-in-out
                    border-l-4
                    ${
                      isActive
                        ? 'border-primary bg-accent text-accent-foreground font-bold'
                        : 'border-transparent text-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                  // Logic style này có thể không cần thiết nữa nhưng giữ lại cũng không sao
                  style={
                    !isSidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768
                      ? ({ ...contentStyles, display: 'flex' } as React.CSSProperties)
                      : ({ display: 'flex' } as React.CSSProperties)
                  }
                >
                  <span className="mr-3">
                    {React.cloneElement(item.icon, {
                      className: `${item.icon.props.className || ''} ${
                        isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                      }`,
                    })}
                  </span>

                  <span className="whitespace-nowrap text-sm">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}