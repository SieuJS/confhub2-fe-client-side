'use client';

import React, { useState } from 'react';
import { Header } from '@/src/app/[locale]/utils/Header';
import ClientDashboardSidebar from './ClientDasboardSidebar'; // Import sidebar của Client

export default function ClientDashboardLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // State và logic điều khiển sidebar được đặt ở đây, giống hệt Admin
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Mặc định mở

  const SIDEBAR_WIDTH_PX = 256; // Chiều rộng sidebar client
  const HEADER_HEIGHT_PX = 72;  // Chiều cao header

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className='relative min-h-screen bg-background'>
      {/* 
        Header sẽ nhận hàm toggleSidebar để có thể đóng/mở sidebar.
        Bạn cần đảm bảo component Header của bạn có một nút (ví dụ: hamburger icon)
        và gọi prop `toggleSidebar` khi được click.
      */}
      <Header
        locale={locale}
        toggleSidebar={toggleSidebar} // Truyền hàm toggle vào Header
        isSidebarOpen={isSidebarOpen} // Truyền trạng thái để Header có thể thay đổi icon (nếu cần)
        // Các props khác nếu Header cần
      />

      {/* Sidebar của Client */}
      <ClientDashboardSidebar
        isSidebarOpen={isSidebarOpen}
        locale={locale}
        sidebarWidth={SIDEBAR_WIDTH_PX}
        headerHeight={HEADER_HEIGHT_PX}
      />

      {/* Main Content (chính là page.tsx sẽ được render ở đây) */}
      <main
        className="transition-all duration-300 ease-in-out"
        style={{
          paddingTop: `${HEADER_HEIGHT_PX}px`,
          // Dùng padding-left để đẩy nội dung sang phải khi sidebar mở
          paddingLeft: isSidebarOpen ? `${SIDEBAR_WIDTH_PX}px` : '0px',
        }}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}