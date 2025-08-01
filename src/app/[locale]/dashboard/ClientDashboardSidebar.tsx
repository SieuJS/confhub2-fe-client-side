// src/app/[locale]/dashboard/ClientDashboardSidebar.tsx (ĐÃ SỬA LỖI TYPESCRIPT)

'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import { useSearchParams } from 'next/navigation';
import { useSidebar } from '@/src/contexts/SidebarContext';

// ... (imports và interfaces giữ nguyên)
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
  locale: string;
  sidebarWidth: number;
  headerHeight: number;
}


export default function ClientDashboardSidebar({
  locale,
  sidebarWidth,
  headerHeight,
}: ClientDashboardSidebarProps) {
  const t = useTranslations('');
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const { isSidebarOpen } = useSidebar();

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

  const sidebarClasses = `
    fixed left-0
    overflow-y-auto
    transition-transform duration-300 ease-in-out
    bg-background
    shadow-md
    z-30
    w-[var(--sidebar-width)]
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  // FIX: Áp dụng cách sửa lỗi TypeScript tương tự ở đây
  const sidebarStyles: React.CSSProperties & {
    '--sidebar-width': string;
  } = {
    '--sidebar-width': `${sidebarWidth}px`,
    top: `${headerHeight}px`,
    height: `calc(100vh - ${headerHeight}px)`,
  };

  return (
    <aside
      className={sidebarClasses}
      style={sidebarStyles} // Sử dụng biến style đã được định kiểu đúng
    >
      <nav className={`h-full overflow-y-auto transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
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
                    ${isActive
                      ? 'border-primary bg-accent text-accent-foreground font-bold'
                      : 'border-transparent text-foreground hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <span className="mr-3">
                    {React.cloneElement(item.icon, {
                      className: `${item.icon.props.className || ''} ${isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
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