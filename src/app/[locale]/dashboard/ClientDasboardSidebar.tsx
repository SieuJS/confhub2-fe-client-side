'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/src/navigation';
import { useSearchParams } from 'next/navigation'; // <-- Import hook này

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
  tabValue: string; // Dùng cho cả query param và key
}

interface ClientDashboardSidebarProps {
  isSidebarOpen: boolean;
  locale: string;
  sidebarWidth: number;
  headerHeight: number;
  // Không cần prop 'activePage' nữa
}

export default function ClientDashboardSidebar({
  isSidebarOpen,
  locale,
  sidebarWidth,
  headerHeight,
}: ClientDashboardSidebarProps) {
  const t = useTranslations('');
  const searchParams = useSearchParams(); // <-- Sử dụng hook để lấy query params
  const activeTab = searchParams.get('tab') || 'profile'; // Lấy tab hiện tại, mặc định là 'profile'

  const menuItems: MenuItem[] = [
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

  // Class và style cho sidebar
  const sidebarClasses = `
    fixed left-0
    h-screen // Chiều cao toàn màn hình
    overflow-y-auto
    transition-transform duration-300 ease-in-out
    bg-background
    shadow-md
    z-30 // z-index thấp hơn Header (z-40) nhưng cao hơn content
    w-[${sidebarWidth}px] 
    ${isSidebarOpen ? 'translate-x-0' : `-translate-x-full`}
  `;

  // Style cho nội dung bên trong sidebar (menu items)
  const contentStyles = {
    opacity: isSidebarOpen ? 1 : 0,
    pointerEvents: isSidebarOpen ? 'auto' : 'none',
    visibility: isSidebarOpen ? 'visible' : 'hidden',
    transition: 'opacity 0.3s 0.1s ease-in-out, visibility 0.3s 0.1s ease-in-out', // Thêm delay nhỏ
  };

  return (
    <aside 
      className={sidebarClasses}
      style={{ top: `${headerHeight}px` }} // <-- Sidebar bắt đầu ngay dưới Header
    >
      {/* Không cần phần Logo/Title ở đây nữa, Header đã xử lý */}
      
      <nav className='w-full'> {/* Thêm padding-top để tạo khoảng cách với Header */}
        <ul className='w-full'>
          {menuItems.map(item => {
            // Logic active giờ dựa vào `activeTab` đọc từ URL
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
                  style={{
                    ...contentStyles,
                    display: 'flex',
                  } as React.CSSProperties}
                >
                  <span className="mr-3"> {/* Tăng khoảng cách một chút */}
                    {React.cloneElement(item.icon, {
                      className: `${item.icon.props.className || ''} ${
                        isActive ? 'text-primary' : 'text-gray-500 dark:text-gray-400' // Điều chỉnh màu icon không active
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