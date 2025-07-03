// src/app/[locale]/dashboard/layout.tsx (ĐÃ SỬA LỖI TYPESCRIPT)

'use client';

import React from 'react';
import ClientDashboardSidebar from './ClientDashboardSidebar';
import { useSidebar } from '@/src/contexts/SidebarContext';

export default function ClientDashboardLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const SIDEBAR_WIDTH_PX = 192;
  const HEADER_HEIGHT_PX = 60;

  const { isSidebarOpen, toggleSidebar } = useSidebar();

  // FIX: Sửa lỗi TypeScript bằng cách khai báo kiểu một cách tường minh.
  // Chúng ta nói với TypeScript rằng kiểu này là React.CSSProperties
  // VÀ (&) nó cũng chứa các thuộc tính tùy chỉnh của chúng ta.
  const layoutStyles: React.CSSProperties & {
    '--sidebar-width': string;
    '--header-height': string;
  } = {
    '--sidebar-width': `${SIDEBAR_WIDTH_PX}px`,
    '--header-height': `${HEADER_HEIGHT_PX}px`,
  };

  return (
    <div 
      className='relative flex min-h-screen bg-muted/40'
      style={layoutStyles} // Bây giờ TypeScript sẽ không báo lỗi nữa
    >
      {/* Lớp phủ (overlay) ẩn trên màn hình lớn (lg) */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      <ClientDashboardSidebar
        locale={locale}
        sidebarWidth={SIDEBAR_WIDTH_PX}
        headerHeight={HEADER_HEIGHT_PX}
      />

      <main
        className={`
          flex-1 transition-all duration-300 ease-in-out
          w-full
          
          ${isSidebarOpen 
            ? 'lg:pl-[var(--sidebar-width)]' 
            : 'lg:pl-0'
          }
        `}
      >
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}